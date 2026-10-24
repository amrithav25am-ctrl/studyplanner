import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Timer, 
  ArrowRight, 
  SlidersHorizontal,
  Brain,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Task, SmartScheduleSlot } from '../types';

export const SmartScheduleView: React.FC = () => {
  const { tasks, timetable, setCurrentPomodoroTask, setActiveTab } = useApp();

  const [maxDailyHours, setMaxDailyHours] = useState<number>(3); // Student preference
  const [strategy, setStrategy] = useState<'balanced' | 'spaced' | 'priority_first'>('balanced');
  const [isRegenerating, setIsRegenerating] = useState(false);

  // Calculate day-by-day deadline-driven study plan
  const schedulePlan = useMemo(() => {
    const pendingTasks = tasks.filter(t => t.status !== 'completed');
    if (pendingTasks.length === 0) return [];

    const slots: SmartScheduleSlot[] = [];
    const today = new Date();

    // Map out next 5 days
    const days: { dateStr: string; display: string; dayOfWeek: number }[] = [];
    for (let i = 0; i < 5; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      days.push({
        dateStr: d.toISOString().split('T')[0],
        display: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        dayOfWeek: d.getDay(),
      });
    }

    // Sort tasks based on selected strategy
    const sortedTasks = [...pendingTasks].sort((a, b) => {
      if (strategy === 'priority_first') {
        const pWeight: Record<string, number> = { urgent: 4, high: 3, medium: 2, low: 1 };
        return (pWeight[b.priority] || 0) - (pWeight[a.priority] || 0);
      }
      return a.dueDate.localeCompare(b.dueDate);
    });

    // Distribute workloads
    let slotId = 1;
    days.forEach((day, dayIndex) => {
      let dayMinutesLeft = maxDailyHours * 60;

      // Deduct class time on this day from timetable
      const classesToday = timetable.filter(tt => tt.dayOfWeek === day.dayOfWeek);
      const classHours = classesToday.length * 1.5; // roughly 1.5h per lecture

      sortedTasks.forEach(task => {
        if (dayMinutesLeft <= 25) return;

        // Check deadline
        const taskDue = new Date(task.dueDate);
        const currentScheduleDay = new Date(day.dateStr);
        const daysUntilDue = Math.ceil((taskDue.getTime() - currentScheduleDay.getTime()) / (1000 * 3600 * 24));

        if (daysUntilDue >= 0 && daysUntilDue <= 5) {
          // Allocate block
          const blockMinutes = Math.min(
            dayMinutesLeft, 
            task.estimatedMinutes > 60 ? (strategy === 'spaced' ? 45 : 60) : task.estimatedMinutes
          );

          if (blockMinutes >= 20) {
            let reason = `Due in ${daysUntilDue} day${daysUntilDue === 1 ? '' : 's'}. Pacing ${blockMinutes}m today avoids last-minute crunch.`;
            if (daysUntilDue === 0) reason = `🚨 DUE TODAY! Priority focus required before submission.`;
            else if (daysUntilDue === 1) reason = `⚠️ Due tomorrow! Finalize draft & complete verification steps.`;

            slots.push({
              id: `slot_${slotId++}`,
              taskId: task.id,
              taskTitle: task.title,
              subject: task.subject,
              date: day.dateStr,
              startTime: dayIndex === 0 ? '16:00' : '15:00',
              durationMinutes: blockMinutes,
              priority: task.priority,
              reason,
            });

            dayMinutesLeft -= blockMinutes;
          }
        }
      });
    });

    return slots;
  }, [tasks, timetable, maxDailyHours, strategy, isRegenerating]);

  // Group slots by date
  const groupedSlots = useMemo(() => {
    const map: Record<string, SmartScheduleSlot[]> = {};
    schedulePlan.forEach(slot => {
      if (!map[slot.date]) map[slot.date] = [];
      map[slot.date].push(slot);
    });
    return map;
  }, [schedulePlan]);

  const handleStartFocus = (slot: SmartScheduleSlot) => {
    const task = tasks.find(t => t.id === slot.taskId);
    if (task) {
      setCurrentPomodoroTask(task);
    }
    setActiveTab('pomodoro');
  };

  const handleRefresh = () => {
    setIsRegenerating(true);
    setTimeout(() => {
      setIsRegenerating(false);
    }, 600);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-purple-500" />
            <span>Smart Deadline-Driven Study Schedule</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Algorithmic study pacing that schedules your assignments based on urgency, estimated effort, and lecture timetable.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm shadow-md shadow-purple-600/20 active:scale-95 transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${isRegenerating ? 'animate-spin' : ''}`} />
          <span>Rebalance Schedule</span>
        </button>
      </div>

      {/* Scheduling Preferences Bar */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Brain className="w-5 h-5 text-purple-500 shrink-0" />
          <div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Pacing Algorithm
            </h3>
            <p className="text-sm font-semibold text-slate-800 dark:text-white">
              Calculates free study blocks around your weekly lecture timetable.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400">Daily Cap:</span>
            <select
              value={maxDailyHours}
              onChange={(e) => setMaxDailyHours(Number(e.target.value))}
              className="text-xs font-semibold rounded-lg px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
            >
              <option value={2}>2 Hours / day</option>
              <option value={3}>3 Hours / day (Recommended)</option>
              <option value={4}>4 Hours / day (Intensive)</option>
              <option value={5}>5 Hours / day (Exam Cram)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400">Strategy:</span>
            <select
              value={strategy}
              onChange={(e) => setStrategy(e.target.value as typeof strategy)}
              className="text-xs font-semibold rounded-lg px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
            >
              <option value="balanced">Balanced Even Spread</option>
              <option value="spaced">Spaced Micro-Sessions</option>
              <option value="priority_first">Priority First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Roadmap Days */}
      <div className="space-y-6">
        {Object.keys(groupedSlots).length > 0 ? (
          Object.keys(groupedSlots).map((dateStr, idx) => {
            const slots = groupedSlots[dateStr];
            const totalDayMinutes = slots.reduce((acc, s) => acc + s.durationMinutes, 0);
            const totalHours = (totalDayMinutes / 60).toFixed(1);
            const isCrunchDay = totalDayMinutes >= 240; // >4h

            const dateObj = new Date(dateStr);
            const dateLabel = idx === 0 ? 'Today' : idx === 1 ? 'Tomorrow' : dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

            return (
              <div
                key={dateStr}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4"
              >
                {/* Day Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 font-bold flex items-center justify-center text-sm">
                      {dateObj.getDate()}
                    </div>
                    <div>
                      <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                        <span>{dateLabel}</span>
                        <span className="text-xs font-normal text-slate-400">({dateStr})</span>
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {slots.length} optimized study session{slots.length === 1 ? '' : 's'} scheduled
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    {isCrunchDay && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>High Crunch Day</span>
                      </span>
                    )}

                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      ⏱️ {totalHours} hrs study workload
                    </span>
                  </div>
                </div>

                {/* Slots inside this day */}
                <div className="space-y-3 pt-1">
                  {slots.map((slot) => (
                    <div
                      key={slot.id}
                      className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-purple-300 dark:hover:border-purple-700/60 transition-all"
                    >
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
                            {slot.subject}
                          </span>
                          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{slot.durationMinutes} mins recommended</span>
                          </span>
                        </div>

                        <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">
                          {slot.taskTitle}
                        </h3>

                        <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                          <span>{slot.reason}</span>
                        </p>
                      </div>

                      <button
                        onClick={() => handleStartFocus(slot)}
                        className="self-end sm:self-center shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-xs active:scale-95 transition-all"
                      >
                        <Timer className="w-3.5 h-3.5" />
                        <span>Launch Pomodoro</span>
                      </button>
                    </div>
                  ))}
                </div>

              </div>
            );
          })
        ) : (
          <div className="p-12 text-center rounded-3xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-300 dark:border-slate-700 space-y-3">
            <ShieldCheck className="w-12 h-12 text-emerald-500 mx-auto" />
            <h3 className="font-bold text-slate-700 dark:text-slate-300 text-base">All Caught Up!</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              You have no pending assignments or deadlines. Head over to the Tasks tab to add your syllabus goals or relax!
            </p>
          </div>
        )}
      </div>

    </div>
  );
};
