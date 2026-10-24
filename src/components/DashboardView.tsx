import React from 'react';
import { 
  Flame, 
  Timer, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Calendar, 
  Sparkles, 
  Users, 
  BookOpen, 
  AlertCircle,
  Play
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const DashboardView: React.FC = () => {
  const { 
    userProfile, 
    tasks, 
    timetable, 
    rooms, 
    setActiveTab, 
    toggleTaskComplete, 
    setCurrentPomodoroTask 
  } = useApp();

  const today = new Date();
  const currentDayOfWeek = today.getDay(); // 0-6
  const todayDateStr = today.toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'short', 
    day: 'numeric' 
  });

  // Calculate upcoming classes today
  const todaysClasses = timetable
    .filter(t => t.dayOfWeek === currentDayOfWeek)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  // Next class
  const nowTime = today.toTimeString().substring(0, 5);
  const nextClass = todaysClasses.find(c => c.startTime >= nowTime) || todaysClasses[0];

  // Urgent and pending tasks
  const pendingTasks = tasks.filter(t => t.status !== 'completed');
  const urgentTasks = [...pendingTasks].sort((a, b) => {
    // Sort by urgent priority first, then due date
    const priorityWeight: Record<string, number> = { urgent: 4, high: 3, medium: 2, low: 1 };
    const pDiff = (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
    if (pDiff !== 0) return pDiff;
    return a.dueDate.localeCompare(b.dueDate);
  }).slice(0, 4);

  const startFocusOnTask = (task: typeof urgentTasks[0]) => {
    setCurrentPomodoroTask(task);
    setActiveTab('pomodoro');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 p-6 sm:p-8 text-white shadow-xl shadow-emerald-950/10">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-medium border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{todayDateStr}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Ready to focus, {userProfile.displayName.split(' ')[0]}?
            </h1>
            <p className="text-emerald-100 text-sm sm:text-base leading-relaxed">
              You're on a <strong className="text-white">{userProfile.streakCount}-day streak</strong>! You have {pendingTasks.length} assignments scheduled this week.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab('pomodoro')}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-emerald-800 font-bold text-sm shadow-lg shadow-black/10 hover:bg-emerald-50 active:scale-95 transition-all"
            >
              <Play className="w-4 h-4 fill-emerald-800" />
              <span>Start 25m Focus</span>
            </button>
            <button
              onClick={() => setActiveTab('rooms')}
              className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-emerald-800/60 hover:bg-emerald-800 text-white font-semibold text-sm border border-emerald-400/30 transition-all"
            >
              <Users className="w-4 h-4" />
              <span>Study Rooms</span>
            </button>
          </div>
        </div>

        {/* Subtle decorative circles */}
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute right-32 -bottom-20 w-48 h-48 rounded-full bg-cyan-400/20 blur-xl pointer-events-none" />
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Streak card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Current Streak</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Flame className="w-5 h-5 fill-amber-500" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {userProfile.streakCount}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">days in a row</span>
          </div>
          <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">Active today 🔥</p>
        </div>

        {/* Focus Time */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Focus</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Timer className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {(userProfile.totalFocusMinutes / 60).toFixed(1)}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">hours logged</span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {userProfile.totalFocusMinutes} mins total
          </p>
        </div>

        {/* Pending Tasks */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Pending Tasks</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {pendingTasks.length}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">to complete</span>
          </div>
          <p className="mt-1 text-xs text-amber-600 dark:text-amber-400 font-medium">
            {urgentTasks.filter(t => t.priority === 'urgent').length} urgent deadlines
          </p>
        </div>

        {/* Next Class */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Next Class</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          {nextClass ? (
            <div className="mt-3">
              <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                {nextClass.subject}
              </p>
              <p className="text-xs text-purple-600 dark:text-purple-400 font-semibold mt-0.5">
                {nextClass.startTime} - {nextClass.endTime}
              </p>
            </div>
          ) : (
            <div className="mt-3">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">No more classes today</p>
              <p className="text-xs text-slate-400">Free study time!</p>
            </div>
          )}
          <p className="mt-1 text-xs text-slate-400 truncate">
            {nextClass?.location || 'Self-study day'}
          </p>
        </div>

      </div>

      {/* Main Grid: Urgent Tasks & Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Urgent Tasks & Assignments (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Upcoming Deadlines & Tasks</h2>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {urgentTasks.length}
              </span>
            </div>
            <button
              onClick={() => setActiveTab('tasks')}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              <span>View all tasks</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {urgentTasks.map((task) => {
              const isUrgent = task.priority === 'urgent';
              return (
                <div
                  key={task.id}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 hover:border-emerald-300 dark:hover:border-emerald-700/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <button
                      onClick={() => toggleTaskComplete(task.id)}
                      className="mt-1 w-5 h-5 rounded-md border border-slate-300 dark:border-slate-600 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950 flex items-center justify-center transition-colors shrink-0"
                      title="Mark as completed"
                    >
                      {task.status === 'completed' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                    </button>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          {task.subject}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isUrgent 
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300'
                            : task.priority === 'high'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300'
                        }`}>
                          {task.priority.toUpperCase()}
                        </span>
                      </div>
                      <h3 className="font-semibold text-sm text-slate-900 dark:text-white mt-1 leading-snug">
                        {task.title}
                      </h3>
                      <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mt-2">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Due {task.dueDate}</span>
                        </span>
                        <span>•</span>
                        <span>{task.estimatedMinutes}m est.</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => startFocusOnTask(task)}
                    className="self-end sm:self-center shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold transition-colors"
                  >
                    <Timer className="w-3.5 h-3.5" />
                    <span>Focus</span>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Smart Schedule Nudge Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-blue-500/10 dark:from-purple-950/30 dark:to-indigo-950/30 border border-purple-200/80 dark:border-purple-800/60 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Smart Study Scheduling</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  FocusFlow automatically balances your remaining study hours based on your class timetable and upcoming exam dates.
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('smart-schedule')}
              className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shrink-0 transition-colors"
            >
              View Plan
            </button>
          </div>
        </div>

        {/* Right Col: Today's Classes & Active Room */}
        <div className="space-y-6">
          
          {/* Today's Classes */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-500" />
                <span>Today's Classes</span>
              </h3>
              <button
                onClick={() => setActiveTab('timetable')}
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                Full week
              </button>
            </div>

            {todaysClasses.length > 0 ? (
              <div className="space-y-3">
                {todaysClasses.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border-l-4 border-emerald-500 space-y-1"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800 dark:text-slate-200">{item.subject}</span>
                      <span className="font-medium text-emerald-600 dark:text-emerald-400">{item.startTime} - {item.endTime}</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 font-medium truncate">{item.title}</p>
                    {item.location && (
                      <p className="text-[11px] text-slate-400">📍 {item.location}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-slate-400">
                No scheduled classes for today! Good time to catch up on revision.
              </div>
            )}
          </div>

          {/* Collaborative Study Room Spotlight */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-500" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Active Study Rooms</h3>
              </div>
              <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Live</span>
              </span>
            </div>

            {rooms.slice(0, 2).map((room) => (
              <div
                key={room.id}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-700/40 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-xs text-slate-900 dark:text-white truncate">
                    {room.name}
                  </h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                    {room.subject}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                  {room.description}
                </p>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-400">
                    👥 {room.memberCount || 3} studying now
                  </span>
                  <button
                    onClick={() => setActiveTab('rooms')}
                    className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Enter room →
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>

    </div>
  );
};
