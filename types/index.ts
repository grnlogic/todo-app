export enum Priority {
  HIGH = 'High',
  MEDIUM = 'Medium',
  LOW = 'Low',
}

export enum MoodType {
  VERY_HAPPY = 'VeryHappy',
  HAPPY = 'Happy',
  NEUTRAL = 'Neutral',
  SAD = 'Sad',
  STRESSED = 'Stressed',
}

export enum Category {
  WORK = 'Work',
  PERSONAL = 'Personal',
  HEALTH = 'Health',
  LEARNING = 'Learning',
  SOCIAL = 'Social',
  FINANCE = 'Finance',
  OTHER = 'Other',
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  date: Date;
  time?: string;
  completed: boolean;
  priority: Priority;
  category?: Category;
  moodBefore?: MoodType;
  moodAfter?: MoodType;
  estimatedMinutes?: number;
  actualMinutes?: number;
  tags?: string[];
  points?: number;
  streak?: number;
  reminderSent?: boolean;
  isRecurring?: boolean;
  recurrence?: string;
  notes?: string;
  completedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface DailyMood {
  id: string;
  date: Date;
  mood: MoodType;
  note?: string;
  energy: number;
  createdAt: Date;
}

export interface Quote {
  id: string;
  text: string;
  author?: string;
  category?: string;
  isActive: boolean;
  createdAt: Date;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon?: string;
  condition: string;
  earned: boolean;
  earnedAt?: Date;
  createdAt: Date;
}

export interface Course {
  id: string;
  name: string;
  lecturer: string;
  room: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
}

export type Tab = 'home' | 'tasks' | 'calendar' | 'schedule' | 'settings';

export interface ThemeConfig {
  mode: 'dark' | 'light';
  accentColor: string;
}
