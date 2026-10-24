import React, { useState, useEffect, useRef } from 'react';
import { 
  Timer, 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Minimize2, 
  CheckCircle2, 
  CloudRain, 
  Coffee, 
  Radio, 
  Sparkles,
  Award,
  ChevronRight,
  Flame
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';
import { playBellChime, ambientSound } from '../lib/audio';

type Mode = 'work' | 'short_break' | 'long_break';

export const PomodoroTimer: React.FC = () => {
  const { 
    currentPomodoroTask, 
    setCurrentPomodoroTask, 
    tasks, 
    logStudySession, 
    updatePresence,
    activeRoom
  } = useApp();

  const [mode, setMode] = useState<Mode>('work');
  const [workDuration, setWorkDuration] = useState<number>(25); // minutes
  const [shortBreakDuration, setShortBreakDuration] = useState<number>(5);
  const [longBreakDuration, setLongBreakDuration] = useState<number>(15);

  const [timeLeft, setTimeLeft] = useState<number>(workDuration * 60);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [completedSessionsCount, setCompletedSessionsCount] = useState<number>(0);
  const [selectedTaskId, setSelectedTaskId] = useState<string>(currentPomodoroTask?.id || '');
  const [customSubject, setCustomSubject] = useState<string>(currentPomodoroTask?.subject || 'General Study');

  // Ambient sound state
  const [ambientMode, setAmbientMode] = useState<'none' | 'rain' | 'cafe' | 'whitenoise'>('none');
  const [ambientVolume, setAmbientVolume] = useState<number>(0.5);

  // Fullscreen zen mode
  const [isZenMode, setIsZenMode] = useState<boolean>(false);

  // Sync selected task if provided from other screens
  useEffect(() => {
    if (currentPomodoroTask) {
      setSelectedTaskId(currentPomodoroTask.id);
      setCustomSubject(currentPomodoroTask.subject);
    }
  }, [currentPomodoroTask]);

  // Keep target duration when switching modes or custom values
  const getDurationForMode = (m: Mode) => {
    if (m === 'work') return workDuration * 60;
    if (m === 'short_break') return shortBreakDuration * 60;
    return longBreakDuration * 60;
  };

  const handleModeChange = (newMode: Mode) => {
    setIsActive(false);
    setMode(newMode);
    setTimeLeft(getDurationForMode(newMode));
  };

  // Timer Tick Interval
  useEffect(() => {
    let interval: any = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      // Completed!
      handleSessionFinish();
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  // Sync focus status to Collaborative Study Room if user is in one
  useEffect(() => {
    if (activeRoom) {
      updatePresence({
        isStudying: isActive,
        pomodoroSeconds: timeLeft,
        pomodoroMode: mode === 'work' ? 'work' : 'break',
        currentTask: currentPomodoroTask?.title || customSubject,
        subject: customSubject,
      });
    }
  }, [isActive, timeLeft, mode, activeRoom]);

  const handleSessionFinish = async () => {
    setIsActive(false);

    if (mode === 'work') {
      playBellChime('work_done');
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      // Log session
      const targetTask = tasks.find(t => t.id === selectedTaskId);
      await logStudySession(
        customSubject,
        workDuration,
        targetTask?.title || 'Focused Study Session'
      );

      setCompletedSessionsCount(prev => prev + 1);

      // Offer break
      if ((completedSessionsCount + 1) % 4 === 0) {
        setMode('long_break');
        setTimeLeft(longBreakDuration * 60);
      } else {
        setMode('short_break');
        setTimeLeft(shortBreakDuration * 60);
      }
    } else {
      playBellChime('break_done');
      setMode('work');
      setTimeLeft(workDuration * 60);
    }
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(getDurationForMode(mode));
  };

  // Ambient sound handler
  const toggleAmbientSound = (soundType: 'rain' | 'cafe' | 'whitenoise') => {
    if (ambientMode === soundType) {
      ambientSound.stop();
      setAmbientMode('none');
    } else {
      ambientSound.start(soundType, ambientVolume);
      setAmbientMode(soundType);
    }
  };

  const handleVolumeChange = (vol: number) => {
    setAmbientVolume(vol);
    ambientSound.setVolume(vol);
  };

  // Cleanup ambient sound on unmount
  useEffect(() => {
    return () => {
      ambientSound.stop();
    };
  }, []);

  // Format MM:SS
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const totalTime = getDurationForMode(mode);
  const progressPercent = ((totalTime - timeLeft) / totalTime) * 100;
  const strokeDashoffset = 440 - (440 * progressPercent) / 100;

  return (
    <div className={`space-y-8 max-w-4xl mx-auto pb-16 ${
      isZenMode 
        ? 'fixed inset-0 z-50 bg-slate-950 text-white p-6 sm:p-12 overflow-y-auto flex flex-col items-center justify-center max-w-none'
        : ''
    }`}>
      
      {/* Header (hidden in Zen mode) */}
      {!isZenMode && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              <Timer className="w-8 h-8 text-emerald-500" />
              <span>Pomodoro Study Timer</span>
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Work in distraction-free intervals with pleasant bell cues and ambient focus audio.
            </p>
          </div>

          <button
            onClick={() => setIsZenMode(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors self-start sm:self-auto"
          >
            <Maximize2 className="w-4 h-4" />
            <span>Zen Fullscreen</span>
          </button>
        </div>
      )}

      {/* Zen mode exit button */}
      {isZenMode && (
        <button
          onClick={() => setIsZenMode(false)}
          className="fixed top-6 right-6 flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 text-xs font-semibold backdrop-blur-md transition-colors"
        >
          <Minimize2 className="w-4 h-4" />
          <span>Exit Zen Mode</span>
        </button>
      )}

      {/* Main Timer Card */}
      <div className={`p-8 sm:p-12 rounded-3xl transition-all flex flex-col items-center text-center ${
        isZenMode
          ? 'bg-transparent border-0'
          : 'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xl'
      }`}>
        
        {/* Mode Selector Tabs */}
        <div className="inline-flex items-center p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 mb-8 max-w-md w-full justify-center">
          <button
            onClick={() => handleModeChange('work')}
            className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold transition-all ${
              mode === 'work'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Focus ({workDuration}m)
          </button>
          <button
            onClick={() => handleModeChange('short_break')}
            className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold transition-all ${
              mode === 'short_break'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Short Break ({shortBreakDuration}m)
          </button>
          <button
            onClick={() => handleModeChange('long_break')}
            className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold transition-all ${
              mode === 'long_break'
                ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Long Break ({longBreakDuration}m)
          </button>
        </div>

        {/* Circular Countdown Ring */}
        <div className="relative w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center my-4">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
            {/* Background circle */}
            <circle
              cx="80"
              cy="80"
              r="70"
              stroke="currentColor"
              strokeWidth="6"
              fill="transparent"
              className="text-slate-100 dark:text-slate-800"
            />
            {/* Animated progress circle */}
            <circle
              cx="80"
              cy="80"
              r="70"
              stroke="currentColor"
              strokeWidth="7"
              strokeDasharray={440}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className={`transition-all duration-1000 ${
                mode === 'work'
                  ? 'text-emerald-500'
                  : mode === 'short_break'
                  ? 'text-blue-500'
                  : 'text-purple-500'
              }`}
            />
          </svg>

          {/* Center Digital Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center space-y-2">
            <span className="text-5xl sm:text-7xl font-mono font-extrabold tracking-tight text-slate-900 dark:text-white">
              {formattedTime}
            </span>
            <span className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full ${
              mode === 'work'
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400'
                : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-400'
            }`}>
              {mode === 'work' ? (isActive ? 'Deep Focus Active' : 'Ready to Focus') : 'Resting & Recharging'}
            </span>
            <span className="text-xs text-slate-400">
              Session #{completedSessionsCount + 1}
            </span>
          </div>
        </div>

        {/* Linked Task Tag */}
        <div className="mt-4 mb-8 flex items-center gap-2 max-w-md w-full justify-center">
          <div className="px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs font-medium text-slate-700 dark:text-slate-300 truncate">
            🎯 Working on: <strong className="text-slate-900 dark:text-white">{customSubject}</strong>
            {currentPomodoroTask && ` — ${currentPomodoroTask.title}`}
          </div>
        </div>

        {/* Timer Control Buttons */}
        <div className="flex items-center gap-4">
          <button
            onClick={resetTimer}
            className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            title="Reset timer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={toggleTimer}
            className={`px-8 py-4 rounded-2xl font-bold text-base shadow-xl flex items-center gap-3 transition-all active:scale-95 ${
              isActive
                ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
            }`}
          >
            {isActive ? (
              <>
                <Pause className="w-6 h-6 fill-white" />
                <span>Pause Session</span>
              </>
            ) : (
              <>
                <Play className="w-6 h-6 fill-white" />
                <span>Start Focus</span>
              </>
            )}
          </button>
        </div>

      </div>

      {/* Ambient Audio & Task Linker Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Ambient Sounds Synthesizer */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-emerald-500" />
              <span>Ambient Soundscapes</span>
            </h3>
            <span className="text-xs text-slate-400">Offline Synthesizer</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'rain' as const, label: 'Gentle Rain', icon: CloudRain },
              { id: 'cafe' as const, label: 'Cafe Hum', icon: Coffee },
              { id: 'whitenoise' as const, label: 'White Noise', icon: Radio },
            ].map(snd => {
              const Icon = snd.icon;
              const isPlaying = ambientMode === snd.id;
              return (
                <button
                  key={snd.id}
                  onClick={() => toggleAmbientSound(snd.id)}
                  className={`p-3 rounded-2xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
                    isPlaying
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-700 dark:text-emerald-300 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isPlaying ? 'text-emerald-500 animate-pulse' : 'text-slate-400'}`} />
                  <span>{snd.label}</span>
                </button>
              );
            })}
          </div>

          {ambientMode !== 'none' && (
            <div className="pt-2 flex items-center gap-3">
              <VolumeX className="w-4 h-4 text-slate-400" />
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.05"
                value={ambientVolume}
                onChange={(e) => handleVolumeChange(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
              <Volume2 className="w-4 h-4 text-emerald-500" />
            </div>
          )}
        </div>

        {/* Link to Course / Task */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Link Focus Time to Course</span>
          </h3>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                Select Course / Subject
              </label>
              <input
                type="text"
                value={customSubject}
                onChange={(e) => setCustomSubject(e.target.value)}
                placeholder="e.g. Computer Science, Calculus, Biology"
                className="w-full text-xs rounded-xl px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                Link to Assignment
              </label>
              <select
                value={selectedTaskId}
                onChange={(e) => {
                  const id = e.target.value;
                  setSelectedTaskId(id);
                  const matched = tasks.find(t => t.id === id);
                  if (matched) {
                    setCurrentPomodoroTask(matched);
                    setCustomSubject(matched.subject);
                  } else {
                    setCurrentPomodoroTask(null);
                  }
                }}
                className="w-full text-xs rounded-xl px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-emerald-500"
              >
                <option value="">No specific assignment (General Focus)</option>
                {tasks.filter(t => t.status !== 'completed').map(t => (
                  <option key={t.id} value={t.id}>
                    [{t.subject}] {t.title} (Due {t.dueDate})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
