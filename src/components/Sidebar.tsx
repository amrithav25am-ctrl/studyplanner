import React from 'react';
import { 
  LayoutDashboard, 
  CalendarDays, 
  CheckSquare, 
  Timer, 
  Sparkles, 
  BookText, 
  Users, 
  BarChart3,
  Flame,
  ArrowRight
} from 'lucide-react';
import { useApp, TabType } from '../context/AppContext';

interface NavItem {
  id: TabType;
  label: string;
  icon: React.ElementType;
  badge?: string;
  badgeColor?: string;
}

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, tasks, userProfile, rooms } = useApp();

  const pendingTasksCount = tasks.filter(t => t.status !== 'completed').length;
  const activeRoomsCount = rooms.length;

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'timetable', label: 'Timetable', icon: CalendarDays },
    { 
      id: 'tasks', 
      label: 'Tasks & Exams', 
      icon: CheckSquare, 
      badge: pendingTasksCount > 0 ? `${pendingTasksCount}` : undefined,
      badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400'
    },
    { id: 'pomodoro', label: 'Focus Timer', icon: Timer },
    { 
      id: 'smart-schedule', 
      label: 'Smart Schedule', 
      icon: Sparkles,
      badge: 'AI',
      badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
    },
    { id: 'notes', label: 'Cloud Notebook', icon: BookText },
    { 
      id: 'rooms', 
      label: 'Study Rooms', 
      icon: Users,
      badge: `${activeRoomsCount} live`,
      badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
    },
    { id: 'analytics', label: 'Streaks & Stats', icon: BarChart3 },
  ];

  return (
    <>
      {/* Desktop / Tablet Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 min-h-[calc(100vh-4rem)] p-4 justify-between transition-colors">
        <div className="space-y-6">
          
          {/* Student Profile Quick Summary */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/80 dark:to-slate-800/40 border border-slate-200/80 dark:border-slate-700/60">
            <div className="flex items-center gap-3">
              <img
                src={userProfile.photoURL}
                alt={userProfile.displayName}
                className="w-10 h-10 rounded-xl object-cover ring-2 ring-emerald-500/30"
              />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm text-slate-800 dark:text-white truncate">
                  {userProfile.displayName}
                </p>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>{userProfile.streakCount} day streak</span>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
              <span>Focus today:</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {Math.floor(userProfile.totalFocusMinutes % 60)}m logged
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 font-semibold shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.badgeColor || 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Quick collaborative room banner */}
        <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500/10 to-indigo-500/10 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200/60 dark:border-blue-800/50">
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 dark:text-blue-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>STEM Silent Study</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">6 students focusing right now</p>
          <button
            onClick={() => setActiveTab('rooms')}
            className="mt-2 text-xs font-medium text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline"
          >
            <span>Join room</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-2 py-1.5 flex items-center justify-around shadow-lg">
        {[
          { id: 'dashboard' as TabType, label: 'Home', icon: LayoutDashboard },
          { id: 'timetable' as TabType, label: 'Classes', icon: CalendarDays },
          { id: 'tasks' as TabType, label: 'Tasks', icon: CheckSquare },
          { id: 'pomodoro' as TabType, label: 'Timer', icon: Timer },
          { id: 'rooms' as TabType, label: 'Rooms', icon: Users },
          { id: 'notes' as TabType, label: 'Notes', icon: BookText },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center p-1.5 rounded-lg text-xs transition-colors ${
                isActive
                  ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-[10px]">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
