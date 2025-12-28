export enum PuzzleType {
  MATH = 'MATH',
  BARCODE = 'BARCODE',
  TYPING = 'TYPING',
  MEMORY = 'MEMORY',
}

export enum DifficultyLevel {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
}

export type RepeatPattern = 'once' | 'daily' | 'weekdays' | 'weekends' | 'custom';

export interface PuzzleConfig {
  type: PuzzleType;
  difficulty: DifficultyLevel;
  enabled: boolean;
}

export interface SnoozeSettings {
  duration: number; // in minutes
  maxCount: number;
  requireChallenge: boolean;
  challengeConfig?: PuzzleConfig;
  autoShorten: boolean;
  shortenBy: number; // in minutes
  progressiveDifficulty?: boolean;
}

export interface AlarmSettings {
  soundUri: string | number;
  soundName: string;
  vibrate: boolean;
  volume: number; // 0-1
  gradualVolume: boolean;
  dismissChallenge?: PuzzleConfig;
}

export interface Alarm {
  id: string;
  time: string; // HH:mm format
  enabled: boolean;
  label: string;
  repeatPattern: RepeatPattern;
  repeatDays?: number[]; // 0-6 (Sunday-Saturday)
  settings: AlarmSettings;
  snoozeSettings: SnoozeSettings;
  notificationIds?: string[];
  createdAt: number;
  updatedAt: number;
}
