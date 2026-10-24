import React from 'react';
import { 
  BarChart3, 
  Flame, 
  Award, 
  Clock, 
  CheckCircle2, 
  BookText, 
  Users, 
  Sparkles,
  TrendingUp,
  Calendar
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BADGES } from '../lib/mockData';

export const AnalyticsView: React.FC = () => {
  const { userProfile, sessions, tasks, notes } = useApp();

  // Weekly study hours breakdown (last 7 days)
  const today = new Date();
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const dayName = daysOfWeek[d.getDay()];

    // Sum session minutes for this date
    const daySessions = sessions.filter(s => s.sessionDate === dateStr);
    const totalMins = daySessions.reduce((acc, s) => acc + s.durationMinutes, 0);

    return {
      dateStr,
      dayName,
      minutes: totalMins,
      hours: (totalMins / 60).toFixed(1),
    };
  });

  const maxMinutes = Math.max(...last7Days.map(d => d.minutes), 60);

  // Subject distribution
  const subjectTotals: Record<string, number> = {};
  sessions.forEach(s => {
    subjectTotals[s.subject] = (subjectTotals[s.subject] || 0) + s.durationMinutes;
  });

  const totalSessionMinutes = Object.values(subjectTotals).reduce((a, b) => a + b, 0) || 1;
  const completedTasksCount = tasks.filter(t => t.status === 'completed').length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-emerald-500" />
          <span>Daily Streaks & Study Analytics</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Review your focus time trends, consistency streaks, and unlocked student milestones.
        </p>
      </div>

      {/* Streak Hero Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white shadow-xl shadow-amber-950/15 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-bold backdrop-blur-md">
            <Flame className="w-4 h-4 fill-white" />
            <span>Consistency Engine</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            {userProfile.streakCount} Day Study Streak!
          </h2>
          <p className="text-amber-100 text-xs sm:text-sm max-w-md">
            Studying every day builds cognitive momentum. Complete at least one 25m Pomodoro daily to keep your flame blazing!
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center min-w-[100px]">
            <span className="block text-2xl font-black">{(userProfile.totalFocusMinutes / 60).toFixed(1)}h</span>
            <span className="text-[11px] text-amber-100 font-medium">Total Focus</span>
          </div>
          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center min-w-[100px]">
            <span className="block text-2xl font-black">{completedTasksCount}</span>
            <span className="text-[11px] text-amber-100 font-medium">Tasks Cleared</span>
          </div>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Weekly Focus Time Bar Chart (7 Cols) */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <span>Weekly Focus Hours (Last 7 Days)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Focus time logged via Pomodoro timer</p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
              Active Week
            </span>
          </div>

          {/* Bar Chart Visual */}
          <div className="h-56 flex items-end justify-between gap-2 sm:gap-4 pt-6 px-2">
            {last7Days.map((day, idx) => {
              const heightPercent = Math.max(10, Math.min(100, (day.minutes / maxMinutes) * 100));
              const isToday = idx === 6;

              return (
                <div key={day.dateStr} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    {day.hours}h
                  </span>
                  <div className="w-full max-w-[42px] bg-slate-100 dark:bg-slate-800 rounded-t-xl h-full flex items-end overflow-hidden p-1">
                    <div
                      className={`w-full rounded-t-lg transition-all duration-500 ${
                        isToday
                          ? 'bg-gradient-to-t from-emerald-600 to-teal-400'
                          : 'bg-gradient-to-t from-slate-400 to-slate-300 dark:from-slate-700 dark:to-slate-600 group-hover:from-emerald-500 group-hover:to-teal-400'
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                  <span className={`text-[11px] font-bold ${
                    isToday ? 'text-emerald-600 dark:text-emerald-400 font-extrabold' : 'text-slate-500 dark:text-slate-400'
                  }`}>
                    {day.dayName}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Subject Time Distribution (5 Cols) */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <BookText className="w-4 h-4 text-emerald-500" />
              <span>Subject Time Distribution</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Where your study efforts are invested</p>
          </div>

          <div className="space-y-3 pt-2">
            {Object.keys(subjectTotals).length > 0 ? (
              Object.entries(subjectTotals).map(([subject, minutes], idx) => {
                const percent = Math.round((minutes / totalSessionMinutes) * 100);
                const colors = ['bg-emerald-500', 'bg-blue-500', 'bg-purple-500', 'bg-amber-500', 'bg-rose-500'];
                const barColor = colors[idx % colors.length];

                return (
                  <div key={subject} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800 dark:text-slate-200">{subject}</span>
                      <span className="text-slate-500 dark:text-slate-400 font-medium">
                        {(minutes / 60).toFixed(1)}h ({percent}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full ${barColor} rounded-full transition-all duration-500`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">
                Log a focus session to see subject analytics!
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Gamified Achievements Showcase */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
        <div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <span>Milestone Badges & Achievements</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Earn rewards as you crush coursework and maintain consistent study habits.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {BADGES.map((b) => (
            <div
              key={b.id}
              className={`p-4 rounded-2xl border transition-all ${
                b.unlocked
                  ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800/80 shadow-xs'
                  : 'bg-slate-50/50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800 opacity-60'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-2xl shrink-0">
                  {b.icon}
                </div>
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                      {b.title}
                    </h4>
                    {b.unlocked && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-200 text-amber-900 dark:bg-amber-900 dark:text-amber-200">
                        UNLOCKED
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                    {b.description}
                  </p>
                  {b.maxProgress && (
                    <div className="pt-1.5 space-y-1">
                      <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                        <div
                          className="h-full bg-amber-500 rounded-full"
                          style={{ width: `${Math.min(100, ((b.progress || 0) / b.maxProgress) * 100)}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {b.progress} / {b.maxProgress}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
