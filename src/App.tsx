import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { TimetablePlanner } from './components/TimetablePlanner';
import { TaskManager } from './components/TaskManager';
import { PomodoroTimer } from './components/PomodoroTimer';
import { SmartScheduleView } from './components/SmartScheduleView';
import { NoteTaker } from './components/NoteTaker';
import { CollaborativeRooms } from './components/CollaborativeRooms';
import { AnalyticsView } from './components/AnalyticsView';

const MainContent: React.FC = () => {
  const { activeTab } = useApp();

  return (
    <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
      {activeTab === 'dashboard' && <DashboardView />}
      {activeTab === 'timetable' && <TimetablePlanner />}
      {activeTab === 'tasks' && <TaskManager />}
      {activeTab === 'pomodoro' && <PomodoroTimer />}
      {activeTab === 'smart-schedule' && <SmartScheduleView />}
      {activeTab === 'notes' && <NoteTaker />}
      {activeTab === 'rooms' && <CollaborativeRooms />}
      {activeTab === 'analytics' && <AnalyticsView />}
    </main>
  );
};

export default function App() {
  return (
    <AppProvider>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors antialiased">
        <Navbar />
        <div className="flex-1 flex max-w-7xl w-full mx-auto">
          <Sidebar />
          <MainContent />
        </div>
      </div>
    </AppProvider>
  );
}
