import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import confetti from 'canvas-confetti';
import { 
  Task, 
  TimetableEntry, 
  Note, 
  StudySession, 
  StudyRoom, 
  RoomMember, 
  RoomMessage, 
  UserProfile 
} from '../types';
import { 
  auth, 
  db, 
  googleProvider, 
  signInWithPopup, 
  fbSignOut, 
  onAuthStateChanged, 
  User,
  handleFirestoreError,
  OperationType
} from '../lib/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  getDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { 
  INITIAL_USER, 
  INITIAL_TASKS, 
  INITIAL_TIMETABLE, 
  INITIAL_NOTES, 
  INITIAL_ROOMS, 
  INITIAL_SESSIONS 
} from '../lib/mockData';

export type TabType = 
  | 'dashboard' 
  | 'timetable' 
  | 'tasks' 
  | 'pomodoro' 
  | 'smart-schedule' 
  | 'notes' 
  | 'rooms' 
  | 'analytics';

interface AppContextType {
  user: User | null;
  userProfile: UserProfile;
  isGuest: boolean;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  
  // Data
  tasks: Task[];
  timetable: TimetableEntry[];
  notes: Note[];
  sessions: StudySession[];
  rooms: StudyRoom[];
  activeRoom: StudyRoom | null;
  activeRoomMembers: RoomMember[];
  activeRoomMessages: RoomMessage[];
  currentPomodoroTask: Task | null;
  setCurrentPomodoroTask: (task: Task | null) => void;

  // Actions
  signInGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  
  addTask: (task: Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTaskComplete: (id: string) => Promise<void>;

  addTimetableEntry: (entry: Omit<TimetableEntry, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  deleteTimetableEntry: (id: string) => Promise<void>;

  addNote: (note: Omit<Note, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateNote: (id: string, updates: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;

  logStudySession: (subject: string, durationMinutes: number, taskTitle?: string) => Promise<void>;

  // Collaborative Room actions
  createRoom: (data: { name: string; description: string; subject: string; isPrivate: boolean }) => Promise<string>;
  joinRoom: (roomIdentifier: string) => Promise<boolean>;
  leaveRoom: () => Promise<void>;
  updatePresence: (data: Partial<RoomMember>) => Promise<void>;
  sendRoomMessage: (content: string, category: RoomMessage['category']) => Promise<void>;
  syncStatus: 'synced' | 'saving' | 'offline';
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState<boolean>(true);
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('focusflow_profile');
    return saved ? JSON.parse(saved) : INITIAL_USER;
  });

  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('focusflow_theme') === 'dark' || 
      window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('focusflow_tasks');
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  const [timetable, setTimetable] = useState<TimetableEntry[]>(() => {
    const saved = localStorage.getItem('focusflow_timetable');
    return saved ? JSON.parse(saved) : INITIAL_TIMETABLE;
  });

  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem('focusflow_notes');
    return saved ? JSON.parse(saved) : INITIAL_NOTES;
  });

  const [sessions, setSessions] = useState<StudySession[]>(() => {
    const saved = localStorage.getItem('focusflow_sessions');
    return saved ? JSON.parse(saved) : INITIAL_SESSIONS;
  });

  const [rooms, setRooms] = useState<StudyRoom[]>(INITIAL_ROOMS);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [activeRoomMembers, setActiveRoomMembers] = useState<RoomMember[]>([]);
  const [activeRoomMessages, setActiveRoomMessages] = useState<RoomMessage[]>([]);
  const [currentPomodoroTask, setCurrentPomodoroTask] = useState<Task | null>(null);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'saving' | 'offline'>('synced');

  // Theme effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('focusflow_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('focusflow_theme', 'light');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(prev => !prev);

  // Sync to local storage for guest resiliency
  useEffect(() => {
    if (isGuest) {
      localStorage.setItem('focusflow_profile', JSON.stringify(userProfile));
      localStorage.setItem('focusflow_tasks', JSON.stringify(tasks));
      localStorage.setItem('focusflow_timetable', JSON.stringify(timetable));
      localStorage.setItem('focusflow_notes', JSON.stringify(notes));
      localStorage.setItem('focusflow_sessions', JSON.stringify(sessions));
    }
  }, [isGuest, userProfile, tasks, timetable, notes, sessions]);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setIsGuest(false);
        const profileRef = doc(db, 'users', currentUser.uid);
        
        try {
          const snap = await getDoc(profileRef);
          if (snap.exists()) {
            setUserProfile(snap.data() as UserProfile);
          } else {
            const newProfile: UserProfile = {
              userId: currentUser.uid,
              displayName: currentUser.displayName || 'FocusFlow Scholar',
              email: currentUser.email || '',
              photoURL: currentUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
              streakCount: 1,
              lastActiveDate: new Date().toISOString().split('T')[0],
              totalFocusMinutes: 0,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            await setDoc(profileRef, newProfile);
            setUserProfile(newProfile);

            // Seed initial tasks/timetable for new Firebase user
            for (const t of INITIAL_TASKS) {
              const tRef = doc(db, `users/${currentUser.uid}/tasks`, t.id);
              await setDoc(tRef, { ...t, userId: currentUser.uid });
            }
            for (const tt of INITIAL_TIMETABLE) {
              const ttRef = doc(db, `users/${currentUser.uid}/timetable`, tt.id);
              await setDoc(ttRef, { ...tt, userId: currentUser.uid });
            }
            for (const n of INITIAL_NOTES) {
              const nRef = doc(db, `users/${currentUser.uid}/notes`, n.id);
              await setDoc(nRef, { ...n, userId: currentUser.uid });
            }
          }
        } catch (err) {
          console.error("Error setting up user profile in Firestore:", err);
        }
      } else {
        setUser(null);
        setIsGuest(true);
      }
    });

    return () => unsubscribe();
  }, []);

  // Listen to Firestore when user is authenticated
  useEffect(() => {
    if (!user) return;
    const uid = user.uid;

    const tasksUnsub = onSnapshot(
      collection(db, `users/${uid}/tasks`),
      (snapshot) => {
        const loadedTasks: Task[] = [];
        snapshot.forEach((docSnap) => loadedTasks.push(docSnap.data() as Task));
        if (loadedTasks.length > 0) setTasks(loadedTasks);
      },
      (error) => {
        console.warn("Firestore tasks snapshot error:", error);
      }
    );

    const timetableUnsub = onSnapshot(
      collection(db, `users/${uid}/timetable`),
      (snapshot) => {
        const loaded: TimetableEntry[] = [];
        snapshot.forEach((docSnap) => loaded.push(docSnap.data() as TimetableEntry));
        if (loaded.length > 0) setTimetable(loaded);
      },
      (error) => {
        console.warn("Firestore timetable snapshot error:", error);
      }
    );

    const notesUnsub = onSnapshot(
      collection(db, `users/${uid}/notes`),
      (snapshot) => {
        const loaded: Note[] = [];
        snapshot.forEach((docSnap) => loaded.push(docSnap.data() as Note));
        if (loaded.length > 0) setNotes(loaded);
      },
      (error) => {
        console.warn("Firestore notes snapshot error:", error);
      }
    );

    const sessionsUnsub = onSnapshot(
      collection(db, `users/${uid}/sessions`),
      (snapshot) => {
        const loaded: StudySession[] = [];
        snapshot.forEach((docSnap) => loaded.push(docSnap.data() as StudySession));
        if (loaded.length > 0) setSessions(loaded);
      },
      (error) => {
        console.warn("Firestore sessions snapshot error:", error);
      }
    );

    return () => {
      tasksUnsub();
      timetableUnsub();
      notesUnsub();
      sessionsUnsub();
    };
  }, [user]);

  // Listen to active study room presence and discussion messages
  useEffect(() => {
    if (!activeRoomId) {
      setActiveRoomMembers([]);
      setActiveRoomMessages([]);
      return;
    }

    // Members presence listener
    const membersUnsub = onSnapshot(
      collection(db, `studyRooms/${activeRoomId}/members`),
      (snapshot) => {
        const membersList: RoomMember[] = [];
        snapshot.forEach((d) => membersList.push(d.data() as RoomMember));
        setActiveRoomMembers(membersList);
      },
      (err) => {
        console.warn("Room members snapshot error:", err);
      }
    );

    // Discussion forum listener
    const messagesUnsub = onSnapshot(
      collection(db, `studyRooms/${activeRoomId}/messages`),
      (snapshot) => {
        const messagesList: RoomMessage[] = [];
        snapshot.forEach((d) => messagesList.push(d.data() as RoomMessage));
        // Sort by creation time
        messagesList.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        setActiveRoomMessages(messagesList);
      },
      (err) => {
        console.warn("Room messages snapshot error:", err);
      }
    );

    return () => {
      membersUnsub();
      messagesUnsub();
    };
  }, [activeRoomId]);

  // Auth actions
  const signInGoogle = async () => {
    try {
      setSyncStatus('saving');
      await signInWithPopup(auth, googleProvider);
      setSyncStatus('synced');
    } catch (err) {
      console.error("Google sign in error:", err);
      setSyncStatus('offline');
    }
  };

  const signOut = async () => {
    try {
      await fbSignOut(auth);
      setUser(null);
      setIsGuest(true);
      setUserProfile(INITIAL_USER);
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  // Task actions
  const addTask = async (taskData: Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    const newId = 'task_' + Date.now();
    const userId = user ? user.uid : userProfile.userId;
    const newTask: Task = {
      ...taskData,
      id: newId,
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setTasks(prev => [newTask, ...prev]);

    if (user) {
      const path = `users/${user.uid}/tasks`;
      try {
        setSyncStatus('saving');
        await setDoc(doc(db, path, newId), newTask);
        setSyncStatus('synced');
      } catch (err) {
        setSyncStatus('offline');
        handleFirestoreError(err, OperationType.CREATE, path);
      }
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t));

    if (user) {
      const path = `users/${user.uid}/tasks`;
      try {
        setSyncStatus('saving');
        await setDoc(doc(db, path, id), { ...updates, updatedAt: new Date().toISOString() }, { merge: true });
        setSyncStatus('synced');
      } catch (err) {
        setSyncStatus('offline');
        handleFirestoreError(err, OperationType.UPDATE, `${path}/${id}`);
      }
    }
  };

  const deleteTask = async (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));

    if (user) {
      const path = `users/${user.uid}/tasks`;
      try {
        setSyncStatus('saving');
        await deleteDoc(doc(db, path, id));
        setSyncStatus('synced');
      } catch (err) {
        setSyncStatus('offline');
        handleFirestoreError(err, OperationType.DELETE, `${path}/${id}`);
      }
    }
  };

  const toggleTaskComplete = async (id: string) => {
    const target = tasks.find(t => t.id === id);
    if (!target) return;
    const nextStatus = target.status === 'completed' ? 'todo' : 'completed';
    const isNowComplete = nextStatus === 'completed';

    if (isNowComplete) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B']
      });
    }

    await updateTask(id, {
      status: nextStatus,
      completedAt: isNowComplete ? new Date().toISOString() : undefined,
    });
  };

  // Timetable actions
  const addTimetableEntry = async (entryData: Omit<TimetableEntry, 'id' | 'userId' | 'createdAt'>) => {
    const newId = 'tt_' + Date.now();
    const userId = user ? user.uid : userProfile.userId;
    const newEntry: TimetableEntry = {
      ...entryData,
      id: newId,
      userId,
      createdAt: new Date().toISOString(),
    };

    setTimetable(prev => [...prev, newEntry]);

    if (user) {
      const path = `users/${user.uid}/timetable`;
      try {
        setSyncStatus('saving');
        await setDoc(doc(db, path, newId), newEntry);
        setSyncStatus('synced');
      } catch (err) {
        setSyncStatus('offline');
        handleFirestoreError(err, OperationType.CREATE, path);
      }
    }
  };

  const deleteTimetableEntry = async (id: string) => {
    setTimetable(prev => prev.filter(t => t.id !== id));

    if (user) {
      const path = `users/${user.uid}/timetable`;
      try {
        setSyncStatus('saving');
        await deleteDoc(doc(db, path, id));
        setSyncStatus('synced');
      } catch (err) {
        setSyncStatus('offline');
        handleFirestoreError(err, OperationType.DELETE, `${path}/${id}`);
      }
    }
  };

  // Note actions
  const addNote = async (noteData: Omit<Note, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    const newId = 'note_' + Date.now();
    const userId = user ? user.uid : userProfile.userId;
    const newNote: Note = {
      ...noteData,
      id: newId,
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setNotes(prev => [newNote, ...prev]);

    if (user) {
      const path = `users/${user.uid}/notes`;
      try {
        setSyncStatus('saving');
        await setDoc(doc(db, path, newId), newNote);
        setSyncStatus('synced');
      } catch (err) {
        setSyncStatus('offline');
        handleFirestoreError(err, OperationType.CREATE, path);
      }
    }
    return newId;
  };

  const updateNote = async (id: string, updates: Partial<Note>) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n));

    if (user) {
      const path = `users/${user.uid}/notes`;
      try {
        setSyncStatus('saving');
        await setDoc(doc(db, path, id), { ...updates, updatedAt: new Date().toISOString() }, { merge: true });
        setSyncStatus('synced');
      } catch (err) {
        setSyncStatus('offline');
        handleFirestoreError(err, OperationType.UPDATE, `${path}/${id}`);
      }
    }
  };

  const deleteNote = async (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));

    if (user) {
      const path = `users/${user.uid}/notes`;
      try {
        setSyncStatus('saving');
        await deleteDoc(doc(db, path, id));
        setSyncStatus('synced');
      } catch (err) {
        setSyncStatus('offline');
        handleFirestoreError(err, OperationType.DELETE, `${path}/${id}`);
      }
    }
  };

  // Log study session & update streak
  const logStudySession = async (subject: string, durationMinutes: number, taskTitle?: string) => {
    const newId = 'sess_' + Date.now();
    const todayStr = new Date().toISOString().split('T')[0];
    const userId = user ? user.uid : userProfile.userId;

    const newSession: StudySession = {
      id: newId,
      userId,
      subject,
      taskTitle,
      durationMinutes,
      sessionDate: todayStr,
      createdAt: new Date().toISOString(),
    };

    setSessions(prev => [newSession, ...prev]);

    // Calculate streak logic
    let newStreak = userProfile.streakCount;
    if (userProfile.lastActiveDate !== todayStr) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (userProfile.lastActiveDate === yesterdayStr) {
        newStreak += 1;
      } else {
        newStreak = 1;
      }
    }

    const updatedProfile: UserProfile = {
      ...userProfile,
      streakCount: newStreak,
      lastActiveDate: todayStr,
      totalFocusMinutes: userProfile.totalFocusMinutes + durationMinutes,
      updatedAt: new Date().toISOString(),
    };

    setUserProfile(updatedProfile);

    // Save session & profile to Firestore if signed in
    if (user) {
      const sessPath = `users/${user.uid}/sessions`;
      const profPath = `users/${user.uid}`;
      try {
        setSyncStatus('saving');
        await setDoc(doc(db, sessPath, newId), newSession);
        await setDoc(doc(db, profPath), updatedProfile, { merge: true });
        setSyncStatus('synced');
      } catch (err) {
        setSyncStatus('offline');
        console.warn("Session logging firestore fallback:", err);
      }
    }
  };

  // Collaborative Room actions
  const createRoom = async (data: { name: string; description: string; subject: string; isPrivate: boolean }): Promise<string> => {
    const roomId = 'room_' + Date.now();
    const randomCode = data.name.substring(0, 3).toUpperCase() + '-' + Math.floor(100 + Math.random() * 900);
    const userId = user ? user.uid : userProfile.userId;
    const userName = userProfile.displayName;

    const newRoom: StudyRoom = {
      id: roomId,
      code: randomCode,
      name: data.name,
      description: data.description,
      subject: data.subject,
      creatorId: userId,
      creatorName: userName,
      isPrivate: data.isPrivate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      memberCount: 1,
    };

    setRooms(prev => [newRoom, ...prev]);
    setActiveRoomId(roomId);

    // Also auto-add creator as active member
    const initialMember: RoomMember = {
      userId,
      displayName: userName,
      photoURL: userProfile.photoURL,
      currentTask: 'Setting up study room',
      subject: data.subject,
      isStudying: true,
      pomodoroSeconds: 1500,
      pomodoroMode: 'work',
      lastHeartbeat: new Date().toISOString(),
    };
    setActiveRoomMembers([initialMember]);

    if (user) {
      try {
        await setDoc(doc(db, 'studyRooms', roomId), newRoom);
        await setDoc(doc(db, `studyRooms/${roomId}/members`, userId), initialMember);
      } catch (err) {
        console.warn("Create room firestore error:", err);
      }
    }
    return roomId;
  };

  const joinRoom = async (roomIdentifier: string): Promise<boolean> => {
    const cleanId = roomIdentifier.trim().toUpperCase();
    const matched = rooms.find(r => r.id === roomIdentifier || r.code.toUpperCase() === cleanId);
    
    if (matched) {
      setActiveRoomId(matched.id);
      const userId = user ? user.uid : userProfile.userId;
      const memberData: RoomMember = {
        userId,
        displayName: userProfile.displayName,
        photoURL: userProfile.photoURL,
        currentTask: 'Joining study sprint',
        subject: matched.subject,
        isStudying: true,
        pomodoroSeconds: 1500,
        pomodoroMode: 'work',
        lastHeartbeat: new Date().toISOString(),
      };

      setActiveRoomMembers(prev => {
        const withoutMe = prev.filter(m => m.userId !== userId);
        return [...withoutMe, memberData];
      });

      if (user) {
        try {
          await setDoc(doc(db, `studyRooms/${matched.id}/members`, userId), memberData);
        } catch (err) {
          console.warn("Join room member error:", err);
        }
      }
      return true;
    }
    return false;
  };

  const leaveRoom = async () => {
    if (!activeRoomId) return;
    const currentId = activeRoomId;
    const userId = user ? user.uid : userProfile.userId;

    if (user) {
      try {
        await deleteDoc(doc(db, `studyRooms/${currentId}/members`, userId));
      } catch (err) {
        console.warn("Leave room error:", err);
      }
    }
    setActiveRoomId(null);
  };

  const updatePresence = async (data: Partial<RoomMember>) => {
    if (!activeRoomId) return;
    const userId = user ? user.uid : userProfile.userId;

    setActiveRoomMembers(prev => prev.map(m => m.userId === userId ? { ...m, ...data, lastHeartbeat: new Date().toISOString() } : m));

    if (user) {
      try {
        await setDoc(doc(db, `studyRooms/${activeRoomId}/members`, userId), {
          ...data,
          lastHeartbeat: new Date().toISOString(),
        }, { merge: true });
      } catch (err) {
        console.warn("Update presence error:", err);
      }
    }
  };

  const sendRoomMessage = async (content: string, category: RoomMessage['category']) => {
    if (!activeRoomId || !content.trim()) return;
    const newId = 'msg_' + Date.now();
    const userId = user ? user.uid : userProfile.userId;

    const newMsg: RoomMessage = {
      id: newId,
      roomId: activeRoomId,
      userId,
      userName: userProfile.displayName,
      userAvatar: userProfile.photoURL,
      content: content.trim(),
      category,
      createdAt: new Date().toISOString(),
    };

    setActiveRoomMessages(prev => [...prev, newMsg]);

    if (user) {
      try {
        await setDoc(doc(db, `studyRooms/${activeRoomId}/messages`, newId), newMsg);
      } catch (err) {
        console.warn("Send message error:", err);
      }
    }
  };

  const activeRoom = rooms.find(r => r.id === activeRoomId) || null;

  return (
    <AppContext.Provider
      value={{
        user,
        userProfile,
        isGuest,
        activeTab,
        setActiveTab,
        darkMode,
        toggleDarkMode,
        tasks,
        timetable,
        notes,
        sessions,
        rooms,
        activeRoom,
        activeRoomMembers,
        activeRoomMessages,
        currentPomodoroTask,
        setCurrentPomodoroTask,
        signInGoogle,
        signOut,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskComplete,
        addTimetableEntry,
        deleteTimetableEntry,
        addNote,
        updateNote,
        deleteNote,
        logStudySession,
        createRoom,
        joinRoom,
        leaveRoom,
        updatePresence,
        sendRoomMessage,
        syncStatus,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
