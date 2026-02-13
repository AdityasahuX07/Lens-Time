// src/hooks/useSettings.ts

import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppSettings } from '../types';

const SETTINGS_KEY = '@scleral_lens_settings';

const DEFAULT_SETTINGS: AppSettings = {
  targetWearTime: 14, // 14 hours default
  notificationsEnabled: true,
};

export const useSettings = () => {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    saveSettings();
  }, [settings]);

  const loadSettings = async () => {
    try {
      const data = await AsyncStorage.getItem(SETTINGS_KEY);
      if (data) {
        setSettings(JSON.parse(data));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async () => {
    try {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const updateTargetWearTime = (hours: number) => {
    setSettings({ ...settings, targetWearTime: hours });
  };

  const toggleNotifications = () => {
    setSettings({ ...settings, notificationsEnabled: !settings.notificationsEnabled });
  };

  return {
    settings,
    updateTargetWearTime,
    toggleNotifications,
  };
};