// src/services/storageService.ts

import AsyncStorage from '@react-native-async-storage/async-storage';
import { WearSession } from '../types';

const SESSIONS_KEY = '@scleral_lens_sessions';

export const storageService = {
  async saveSessions(sessions: WearSession[]): Promise<void> {
    try {
      await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
    } catch (error) {
      console.error('Error saving sessions:', error);
      throw error;
    }
  },

  async loadSessions(): Promise<WearSession[]> {
    try {
      const data = await AsyncStorage.getItem(SESSIONS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading sessions:', error);
      return [];
    }
  },

  async clearSessions(): Promise<void> {
    try {
      await AsyncStorage.removeItem(SESSIONS_KEY);
    } catch (error) {
      console.error('Error clearing sessions:', error);
      throw error;
    }
  },
};