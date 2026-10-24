export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'todo' | 'in_progress' | 'completed';

export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  subject: string;
  dueDate: string; // ISO date string (YYYY-MM-DD or YYYY-MM-DDTHH:mm)
  priority: Priority;
  estimatedMinutes: number;
  status: TaskStatus;
  completedAt?: string;
  subtasks?: { id: string; title: string; completed: boolean }[];
  createdAt: string;
  updatedAt: string;
}

export interface TimetableEntry {
  id: string;
  userId: string;
  dayOfWeek: number; // 0=Sun, 1=Mon, ..., 6=Sat
  subject: string;
  title: string;
  startTime: string; // "09:00"
  endTime: string; // "10:30"
  location?: string;
  color: string;
  createdAt: string;
}

export interface Note {
  id: string;
  userId: string;
  title: string;
  content: string;
  subject: string;
  tags: string[];
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StudySession {
  id: string;
  userId: string;
  subject: string;
  taskTitle?: string;
  durationMinutes: number;
  sessionDate: string; // YYYY-MM-DD
  createdAt: string;
}

export interface UserProfile {
  userId: string;
  displayName: string;
  email?: string;
  photoURL?: string;
  streakCount: number;
  lastActiveDate?: string;
  totalFocusMinutes: number;
  createdAt: string;
  updatedAt: string;
}

export interface StudyRoom {
  id: string;
  code: string;
  name: string;
  description: string;
  subject: string;
  creatorId: string;
  creatorName: string;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
  memberCount?: number;
}

export interface RoomMember {
  userId: string;
  displayName: string;
  photoURL?: string;
  currentTask?: string;
  subject?: string;
  isStudying: boolean;
  pomodoroSeconds: number;
  pomodoroMode: 'work' | 'break';
  lastHeartbeat: string;
}

export interface RoomMessage {
  id: string;
  roomId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  category: 'general' | 'question' | 'resource' | 'cheer';
  createdAt: string;
}

export interface SmartScheduleSlot {
  id: string;
  taskId: string;
  taskTitle: string;
  subject: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  durationMinutes: number;
  priority: Priority;
  reason: string;
  completed?: boolean;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
}
