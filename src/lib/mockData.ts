import { Task, TimetableEntry, Note, StudyRoom, StudySession, UserProfile, Badge } from '../types';

export const INITIAL_USER: UserProfile = {
  userId: 'demo-student-01',
  displayName: 'Alex Rivers',
  email: 'alex.rivers@campus.edu',
  photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  streakCount: 5,
  lastActiveDate: new Date().toISOString().split('T')[0],
  totalFocusMinutes: 480, // 8 hours
  createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
  updatedAt: new Date().toISOString(),
};

export const INITIAL_TIMETABLE: TimetableEntry[] = [
  {
    id: 'tt-1',
    userId: 'demo-student-01',
    dayOfWeek: 1, // Mon
    subject: 'Computer Science',
    title: 'CS 101: Data Structures Lecture',
    startTime: '09:00',
    endTime: '10:30',
    location: 'Turing Hall 204',
    color: 'emerald',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'tt-2',
    userId: 'demo-student-01',
    dayOfWeek: 1, // Mon
    subject: 'Mathematics',
    title: 'MATH 240: Linear Algebra Seminar',
    startTime: '11:00',
    endTime: '12:30',
    location: 'Science Complex B12',
    color: 'blue',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'tt-3',
    userId: 'demo-student-01',
    dayOfWeek: 2, // Tue
    subject: 'Biology',
    title: 'BIO 110: Molecular Genetics Lab',
    startTime: '13:00',
    endTime: '15:30',
    location: 'BioMed Lab 301',
    color: 'amber',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'tt-4',
    userId: 'demo-student-01',
    dayOfWeek: 3, // Wed
    subject: 'Computer Science',
    title: 'CS 101: Algorithm Problem Lab',
    startTime: '10:00',
    endTime: '12:00',
    location: 'Computing Center 102',
    color: 'emerald',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'tt-5',
    userId: 'demo-student-01',
    dayOfWeek: 4, // Thu
    subject: 'English & Writing',
    title: 'ENG 202: Research Paper Workshop',
    startTime: '14:00',
    endTime: '15:30',
    location: 'Humanities Hall 410',
    color: 'purple',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'tt-6',
    userId: 'demo-student-01',
    dayOfWeek: 5, // Fri
    subject: 'Mathematics',
    title: 'MATH 240: Problem Solving Recitation',
    startTime: '09:30',
    endTime: '11:00',
    location: 'Science Complex B12',
    color: 'blue',
    createdAt: new Date().toISOString(),
  },
];

const today = new Date();
const inDays = (d: number) => {
  const target = new Date(today);
  target.setDate(target.getDate() + d);
  return target.toISOString().split('T')[0];
};

export const INITIAL_TASKS: Task[] = [
  {
    id: 'task-1',
    userId: 'demo-student-01',
    title: 'Binary Search Tree & Graph Traversal Implementation',
    description: 'Implement BFS and DFS in TypeScript with unit tests for edge cases and cyclic graphs.',
    subject: 'Computer Science',
    dueDate: inDays(1), // Tomorrow
    priority: 'urgent',
    estimatedMinutes: 90,
    status: 'in_progress',
    subtasks: [
      { id: 'st-1', title: 'Construct adjacency matrix & list', completed: true },
      { id: 'st-2', title: 'Implement recursive & iterative DFS', completed: true },
      { id: 'st-3', title: 'Write tests for disconnected graphs', completed: false },
    ],
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'task-2',
    userId: 'demo-student-01',
    title: 'Eigenvalues & Diagonalization Problem Set 4',
    description: 'Complete problems 14 through 28 in chapter 5. Prove invertible matrix theorem corollary.',
    subject: 'Mathematics',
    dueDate: inDays(2),
    priority: 'high',
    estimatedMinutes: 120,
    status: 'todo',
    subtasks: [
      { id: 'st-4', title: 'Compute characteristic polynomial for 3x3 matrices', completed: false },
      { id: 'st-5', title: 'Verify geometric vs algebraic multiplicity', completed: false },
    ],
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'task-3',
    userId: 'demo-student-01',
    title: 'Cellular Respiration & Krebs Cycle Flashcard Review',
    description: 'Review key enzyme checkpoints, ATP yields, and electron transport chain complexes.',
    subject: 'Biology',
    dueDate: inDays(4),
    priority: 'medium',
    estimatedMinutes: 45,
    status: 'todo',
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'task-4',
    userId: 'demo-student-01',
    title: 'Literature Review: AI in Distributed Systems',
    description: 'Draft first 4 pages with citations from IEEE and ACM digital libraries.',
    subject: 'English & Writing',
    dueDate: inDays(6),
    priority: 'medium',
    estimatedMinutes: 150,
    status: 'todo',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'task-5',
    userId: 'demo-student-01',
    title: 'Review Midterm Practice Exam 1',
    description: 'Timed 50-minute simulation exam for CS 101 midterm preparation.',
    subject: 'Computer Science',
    dueDate: inDays(-1),
    priority: 'high',
    estimatedMinutes: 60,
    status: 'completed',
    completedAt: new Date(Date.now() - 86400000).toISOString(),
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

export const INITIAL_NOTES: Note[] = [
  {
    id: 'note-1',
    userId: 'demo-student-01',
    title: 'Graph Theory & Dijkstra Shortest Path Summary',
    content: `# Dijkstra's Algorithm Overview

### Core Concept:
Greedy algorithm to find the shortest path between nodes in a weighted graph with **non-negative edges**.

### Time Complexity:
- With Min-Heap / Priority Queue: **O((V + E) log V)**
- With simple array: **O(V²)**

### Step-by-Step Procedure:
1. Initialize \`dist[start] = 0\`, all other distances to \`∞\`.
2. Push \`(0, start)\` into min-priority queue.
3. While queue is not empty:
   - Extract minimum distance node \`u\`.
   - For every neighbor \`v\` with weight \`w\`:
     - If \`dist[u] + w < dist[v]\`:
       - Update \`dist[v] = dist[u] + w\`
       - Push \`(dist[v], v)\` into queue.

> **Key Rule**: Dijkstra fails with negative weights! Use Bellman-Ford instead.`,
    subject: 'Computer Science',
    tags: ['algorithms', 'midterm', 'graphs'],
    isPinned: true,
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'note-2',
    userId: 'demo-student-01',
    title: 'Matrix Diagonalization & Determinant Shortcuts',
    content: `# Linear Algebra: Diagonalization Checklist

A matrix $A$ of size $n \\times n$ is diagonalizable if and only if:
- It has $n$ linearly independent eigenvectors.
- The sum of geometric multiplicities equals $n$.

### Formula:
$$A = PDP^{-1}$$
Where:
- $P$ is the modal matrix with eigenvectors as columns.
- $D$ is the diagonal matrix with corresponding eigenvalues on the diagonal.

### Properties:
1. $A^k = P D^k P^{-1}$ (super efficient power computation!)
2. $\\det(A) = \\prod \\lambda_i$ (product of eigenvalues)
3. $\\text{Trace}(A) = \\sum \\lambda_i$ (sum of eigenvalues)`,
    subject: 'Mathematics',
    tags: ['linear-algebra', 'formulas', 'exam-prep'],
    isPinned: true,
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'note-3',
    userId: 'demo-student-01',
    title: 'Cell Membrane Transport Mechanisms',
    content: `# Cellular Biology Notes: Transport

1. **Passive Transport** (No energy / ATP required)
   - *Simple Diffusion*: O2, CO2 through lipid bilayer.
   - *Facilitated Diffusion*: Glucose permease, aquaporins.
   - *Osmosis*: Water movement along water potential gradient.

2. **Active Transport** (Requires ATP hydrolysis)
   - *Primary*: Na+/K+ ATPase pump (3 Na+ out, 2 K+ in).
   - *Secondary*: SGLT-1 Na+/glucose symporter.`,
    subject: 'Biology',
    tags: ['biology', 'membrane', 'cell-bio'],
    isPinned: false,
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const INITIAL_ROOMS: StudyRoom[] = [
  {
    id: 'room-stem-focus',
    code: 'FOCUS-849',
    name: 'STEM Library & Silent Study Hall 🤫',
    description: 'Deep focus room for Computer Science, Engineering, and Math students. Cameras/mics optional, synced pomodoros!',
    subject: 'Computer Science',
    creatorId: 'student-charlie',
    creatorName: 'Charlie K.',
    isPrivate: false,
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
    memberCount: 6,
  },
  {
    id: 'room-math-prep',
    code: 'CALC-402',
    name: 'Calculus & Linear Algebra Cram Room 📐',
    description: 'Working through weekly problem sets and sharing hints in forum.',
    subject: 'Mathematics',
    creatorId: 'student-maya',
    creatorName: 'Maya Lin',
    isPrivate: false,
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
    memberCount: 4,
  },
  {
    id: 'room-med-prep',
    code: 'MED-110',
    name: 'Pre-Med & Bio Deep Work Pod 🧬',
    description: 'Anatomy, cellular biology flashcards and 50/10 Pomodoro cycles.',
    subject: 'Biology',
    creatorId: 'student-liam',
    creatorName: 'Liam Vance',
    isPrivate: false,
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
    memberCount: 3,
  },
];

export const INITIAL_SESSIONS: StudySession[] = [
  {
    id: 's-1',
    userId: 'demo-student-01',
    subject: 'Computer Science',
    taskTitle: 'Algorithm Problem Lab',
    durationMinutes: 50,
    sessionDate: inDays(-4),
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: 's-2',
    userId: 'demo-student-01',
    subject: 'Mathematics',
    taskTitle: 'Eigenvalues practice',
    durationMinutes: 75,
    sessionDate: inDays(-3),
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 's-3',
    userId: 'demo-student-01',
    subject: 'Computer Science',
    taskTitle: 'Binary Search Tree code',
    durationMinutes: 90,
    sessionDate: inDays(-2),
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 's-4',
    userId: 'demo-student-01',
    subject: 'Biology',
    taskTitle: 'Krebs Cycle diagrams',
    durationMinutes: 60,
    sessionDate: inDays(-1),
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 's-5',
    userId: 'demo-student-01',
    subject: 'Computer Science',
    taskTitle: 'DFS traversal tests',
    durationMinutes: 45,
    sessionDate: inDays(0),
    createdAt: new Date().toISOString(),
  },
];

export const BADGES: Badge[] = [
  {
    id: 'streak-3',
    title: 'Spark of Consistency',
    description: 'Maintain a 3-day consecutive study streak.',
    icon: '🔥',
    unlocked: true,
    progress: 5,
    maxProgress: 3,
  },
  {
    id: 'hours-10',
    title: 'Focus Dynamo',
    description: 'Accumulate over 10 hours of logged Pomodoro focus.',
    icon: '⚡',
    unlocked: false,
    progress: 8,
    maxProgress: 10,
  },
  {
    id: 'notes-5',
    title: 'Scholar Scribe',
    description: 'Create 5 structured study notes in the cloud notebook.',
    icon: '📝',
    unlocked: false,
    progress: 3,
    maxProgress: 5,
  },
  {
    id: 'collab-room',
    title: 'Study Room Pioneer',
    description: 'Join or host a collaborative group study room.',
    icon: '🤝',
    unlocked: true,
    progress: 1,
    maxProgress: 1,
  },
  {
    id: 'task-crusher',
    title: 'Deadline Slayer',
    description: 'Complete 10 assignments before their deadlines.',
    icon: '🎯',
    unlocked: false,
    progress: 6,
    maxProgress: 10,
  },
];
