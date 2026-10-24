import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  MessageSquare, 
  Timer, 
  Copy, 
  Check, 
  LogOut, 
  Sparkles, 
  Flame, 
  Send, 
  HelpCircle, 
  Link as LinkIcon, 
  Heart, 
  Radio, 
  Share2,
  Lock,
  Globe,
  Search,
  BookOpen
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StudyRoom, RoomMember, RoomMessage } from '../types';

export const CollaborativeRooms: React.FC = () => {
  const { 
    rooms, 
    activeRoom, 
    activeRoomMembers, 
    activeRoomMessages, 
    createRoom, 
    joinRoom, 
    leaveRoom, 
    sendRoomMessage, 
    userProfile,
    setActiveTab,
    setCurrentPomodoroTask,
    tasks
  } = useApp();

  // Lobby state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [lobbySearch, setLobbySearch] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [joinError, setJoinError] = useState('');

  // Create Room Form
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomSubject, setNewRoomSubject] = useState('Computer Science');
  const [newRoomDesc, setNewRoomDesc] = useState('');
  const [newRoomPrivate, setNewRoomPrivate] = useState(false);

  // Discussion forum state
  const [chatMessage, setChatMessage] = useState('');
  const [activeCategory, setActiveCategory] = useState<RoomMessage['category']>('general');
  const [chatFilter, setChatFilter] = useState<'all' | RoomMessage['category']>('all');

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;

    await createRoom({
      name: newRoomName.trim(),
      description: newRoomDesc.trim(),
      subject: newRoomSubject.trim(),
      isPrivate: newRoomPrivate,
    });

    setIsCreateModalOpen(false);
    setNewRoomName('');
    setNewRoomDesc('');
  };

  const handleJoinWithCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCodeInput.trim()) return;
    setJoinError('');

    const success = await joinRoom(joinCodeInput.trim());
    if (!success) {
      setJoinError('Room not found. Check the code and try again.');
    } else {
      setJoinCodeInput('');
    }
  };

  const copyRoomCode = () => {
    if (!activeRoom) return;
    navigator.clipboard.writeText(activeRoom.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    await sendRoomMessage(chatMessage, activeCategory);
    setChatMessage('');
  };

  const sendQuickCheer = async (cheerText: string) => {
    await sendRoomMessage(cheerText, 'cheer');
  };

  // Filter messages
  const filteredMessages = activeRoomMessages.filter(m => {
    if (chatFilter === 'all') return true;
    return m.category === chatFilter;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      
      {/* If NOT inside a room -> Show Lobby */}
      {!activeRoom ? (
        <div className="space-y-6">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                <Users className="w-8 h-8 text-blue-500" />
                <span>Collaborative Study Rooms</span>
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Study with friends, hold each other accountable, sync focus sprints, and discuss coursework.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-md shadow-blue-600/20 active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Create Study Room</span>
              </button>
            </div>
          </div>

          {/* Join with Code Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-950/10">
            <div className="max-w-xl space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Peer Accountability</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold">Have a Room Code from Classmates?</h2>
              <p className="text-blue-100 text-xs sm:text-sm">
                Enter your study group's code to instantly join their synchronized focus session.
              </p>

              <form onSubmit={handleJoinWithCode} className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <input
                  type="text"
                  placeholder="e.g. FOCUS-849"
                  value={joinCodeInput}
                  onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                  className="w-full sm:w-64 text-sm font-mono tracking-wider uppercase rounded-xl px-4 py-2.5 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-hidden font-bold"
                />
                <button
                  type="submit"
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold shadow-md transition-colors"
                >
                  Join Room
                </button>
              </form>
              {joinError && (
                <p className="text-xs text-rose-200 font-semibold">{joinError}</p>
              )}
            </div>
          </div>

          {/* Active Public Rooms Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-500 animate-pulse" />
              <span>Explore Public Study Pods</span>
            </h2>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search rooms or subjects..."
                value={lobbySearch}
                onChange={(e) => setLobbySearch(e.target.value)}
                className="w-full text-xs rounded-xl pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-blue-500"
              />
            </div>
          </div>

          {/* Room Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {rooms.filter(r => {
              if (lobbySearch.trim()) {
                const q = lobbySearch.toLowerCase();
                return r.name.toLowerCase().includes(q) || r.subject.toLowerCase().includes(q) || r.code.toLowerCase().includes(q);
              }
              return true;
            }).map((room) => (
              <div
                key={room.id}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-blue-400 dark:hover:border-blue-600 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                      {room.subject}
                    </span>
                    <span className="text-xs font-mono text-slate-400 font-semibold">
                      #{room.code}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-slate-900 dark:text-white leading-snug">
                    {room.name}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3">
                    {room.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>{room.memberCount || 3} studying</span>
                  </div>

                  <button
                    onClick={() => joinRoom(room.id)}
                    className="px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-300 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white text-xs font-bold transition-all"
                  >
                    Enter Room →
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      ) : (
        /* INSIDE ACTIVE STUDY ROOM */
        <div className="space-y-6">
          
          {/* Active Room Top Banner */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-md space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                    {activeRoom.subject}
                  </span>
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                    <span>CODE: {activeRoom.code}</span>
                    <button
                      onClick={copyRoomCode}
                      className="text-slate-400 hover:text-blue-500 ml-1"
                      title="Copy room code"
                    >
                      {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>{activeRoomMembers.length} active in room</span>
                  </span>
                </div>

                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                  {activeRoom.name}
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {activeRoom.description}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setActiveTab('pomodoro')}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all"
                >
                  <Timer className="w-4 h-4" />
                  <span>Open Timer</span>
                </button>

                <button
                  onClick={leaveRoom}
                  className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30 text-xs font-semibold transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Leave</span>
                </button>
              </div>
            </div>

            {/* Quick Cheer Broadcast Bar */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 overflow-x-auto">
              <span className="text-xs font-bold text-slate-400 whitespace-nowrap">Send Cheer:</span>
              {[
                { emoji: '👏', text: 'Great focus everyone!' },
                { emoji: '🔥', text: 'Crushing this assignment!' },
                { emoji: '☕', text: 'Quick coffee break recharge.' },
                { emoji: '💡', text: 'Just had an aha moment!' },
                { emoji: '💪', text: 'Keep going, almost done!' }
              ].map((c) => (
                <button
                  key={c.text}
                  onClick={() => sendQuickCheer(`${c.emoji} ${c.text}`)}
                  className="px-3 py-1 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/60 dark:hover:text-blue-300 border border-slate-200/60 dark:border-slate-700/60 text-xs font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap transition-colors"
                >
                  <span>{c.emoji} {c.text}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Main 2-Col Layout: Live Members (Left) and Discussion Forum (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Live Peer Presence (5 Cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-500" />
                  <span>Study Room Members ({activeRoomMembers.length})</span>
                </h2>
                <span className="text-xs text-slate-400">Live Sync</span>
              </div>

              <div className="space-y-3">
                {activeRoomMembers.map((member) => {
                  const isMe = member.userId === userProfile.userId;
                  const mins = Math.floor(member.pomodoroSeconds / 60);
                  const secs = member.pomodoroSeconds % 60;
                  const timeFormatted = `${mins}:${String(secs).padStart(2, '0')}`;

                  return (
                    <div
                      key={member.userId}
                      className={`p-4 rounded-2xl border transition-all ${
                        isMe
                          ? 'bg-blue-50/40 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800'
                          : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <img
                          src={member.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                          alt={member.displayName}
                          className="w-10 h-10 rounded-xl object-cover ring-2 ring-emerald-500/40 shrink-0"
                        />
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                              {member.displayName} {isMe && '(You)'}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              member.pomodoroMode === 'work'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400'
                                : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-400'
                            }`}>
                              {member.pomodoroMode === 'work' ? `Focusing (${timeFormatted})` : 'On Break'}
                            </span>
                          </div>

                          <p className="text-xs text-slate-600 dark:text-slate-300 font-medium truncate">
                            🎯 {member.currentTask || 'General Review'}
                          </p>

                          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                            <span>Subject: {member.subject || activeRoom.subject}</span>
                            <span className="flex items-center gap-1 text-emerald-500">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              <span>Active</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Group Study Tips Card */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-400 space-y-2">
                <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                  <span>Study Room Best Practices</span>
                </h4>
                <ul className="list-disc list-inside space-y-1 text-[11px]">
                  <li>State your goal for this Pomodoro block in the forum.</li>
                  <li>Use the Questions tab if you hit a problem set roadblock.</li>
                  <li>Share helpful lecture slides, repo links, and cheatsheets.</li>
                </ul>
              </div>

            </div>

            {/* Discussion Forum & Chat (7 Cols) */}
            <div className="lg:col-span-7 p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col h-[580px]">
              
              {/* Forum Header & Category Tabs */}
              <div className="pb-3 border-b border-slate-100 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-blue-500" />
                    <span>Room Discussion Board</span>
                  </h3>
                  <span className="text-xs text-slate-400">{filteredMessages.length} posts</span>
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  {[
                    { id: 'all', label: 'All' },
                    { id: 'general', label: '💬 General' },
                    { id: 'question', label: '❓ Questions' },
                    { id: 'resource', label: '🔗 Resources' },
                    { id: 'cheer', label: '🔥 Cheers' },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setChatFilter(tab.id as typeof chatFilter)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                        chatFilter === tab.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Messages Scroll Area */}
              <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1">
                {filteredMessages.length > 0 ? (
                  filteredMessages.map((msg) => {
                    const isMe = msg.userId === userProfile.userId;

                    return (
                      <div
                        key={msg.id}
                        className={`p-3 rounded-2xl text-xs space-y-1 ${
                          msg.category === 'cheer'
                            ? 'bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/50'
                            : msg.category === 'question'
                            ? 'bg-purple-50 dark:bg-purple-950/30 border border-purple-200/80 dark:border-purple-800/50'
                            : msg.category === 'resource'
                            ? 'bg-blue-50 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-800/50'
                            : 'bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {msg.userName} {isMe && '(You)'}
                          </span>
                          <span className="text-slate-400">
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed break-words">
                          {msg.content}
                        </p>
                      </div>
                    );
                  })
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                    <MessageSquare className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-2" />
                    <p className="text-xs font-semibold">No messages in this category yet</p>
                    <p className="text-[11px]">Start the conversation or ask a doubt below!</p>
                  </div>
                )}
              </div>

              {/* Message Input Bar */}
              <form onSubmit={handleSendMessage} className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <div className="flex items-center gap-2">
                  <select
                    value={activeCategory}
                    onChange={(e) => setActiveCategory(e.target.value as typeof activeCategory)}
                    className="text-xs font-semibold rounded-xl px-2.5 py-2 bg-slate-100 dark:bg-slate-800 border-0 text-slate-800 dark:text-slate-200 focus:outline-blue-500"
                  >
                    <option value="general">💬 General</option>
                    <option value="question">❓ Question</option>
                    <option value="resource">🔗 Resource / Link</option>
                    <option value="cheer">🔥 Cheer</option>
                  </select>

                  <input
                    type="text"
                    placeholder={`Post to ${activeCategory} forum...`}
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    className="flex-1 text-xs rounded-xl px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-blue-500"
                  />

                  <button
                    type="submit"
                    className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white shrink-0 shadow-xs"
                    title="Send message"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>

            </div>

          </div>

        </div>
      )}

      {/* Create Room Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500" />
                <span>Create Study Room</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Set up a shared focus space for your study group or course section.
              </p>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Room Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CS 101 Midterm Study Pod"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  className="w-full text-sm rounded-xl px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Course / Subject *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Computer Science, Mathematics"
                  value={newRoomSubject}
                  onChange={(e) => setNewRoomSubject(e.target.value)}
                  className="w-full text-sm rounded-xl px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Study Guidelines / Description
                </label>
                <textarea
                  rows={3}
                  placeholder="What is this room focusing on? E.g. Solving problem set 4, 50/10 Pomodoro intervals..."
                  value={newRoomDesc}
                  onChange={(e) => setNewRoomDesc(e.target.value)}
                  className="w-full text-sm rounded-xl px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/20"
                >
                  Create & Launch Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
