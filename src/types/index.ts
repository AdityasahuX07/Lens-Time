export interface WearSession {
  id: string;
  date: string;
  startTime: string;
  endTime: string | null;
  duration: number;
}

export type TabType = 'timer' | 'stats' | 'settings';

export interface BackupData {
  sessions: WearSession[];
  exportDate: string;
  version: string;
}

export interface AppSettings {
  targetWearTime: number; // in hours
  notificationsEnabled: boolean;
}