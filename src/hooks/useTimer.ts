// src/hooks/useTimer.ts
import { useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WearSession } from '../types';
import { notificationService } from '../services/notificationService';

const TIMER_STATE_KEY = '@scleral_lens_timer_state';

export const useTimer = (targetWearTime: number, notificationsEnabled: boolean) => {
  const [activeSession, setActiveSession] = useState<WearSession | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [recleanNotificationId, setRecleanNotificationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Add ref to track if notification has been triggered
  const notificationTriggeredRef = useRef(false);

  // Load saved timer state when hook initializes
  useEffect(() => {
    loadTimerState();
  }, []);

  // Reset notification triggered ref when session starts or changes
  useEffect(() => {
    if (activeSession) {
      notificationTriggeredRef.current = false;
    }
  }, [activeSession]);

  // Save timer state whenever it changes
  useEffect(() => {
    if (!isLoading) {
      saveTimerState();
    }
  }, [activeSession, elapsedTime, isPaused, recleanNotificationId, isLoading]);

  // Recalculate elapsed time when app reopens
  useEffect(() => {
    if (activeSession && !isPaused && !isLoading) {
      const start = new Date(activeSession.startTime).getTime();
      const now = new Date().getTime();
      const elapsed = Math.floor((now - start) / 1000);
      setElapsedTime(elapsed);
    }
  }, [activeSession, isPaused, isLoading]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeSession && !isPaused) {
      interval = setInterval(() => {
        const start = new Date(activeSession.startTime).getTime();
        const now = new Date().getTime();
        const elapsed = Math.floor((now - start) / 1000);
        setElapsedTime(elapsed);
        checkRecleanNotification(elapsed);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeSession, isPaused, targetWearTime, notificationsEnabled]);

  const loadTimerState = async () => {
    try {
      const data = await AsyncStorage.getItem(TIMER_STATE_KEY);
      if (data) {
        const state = JSON.parse(data);
        setActiveSession(state.activeSession);
        setElapsedTime(state.elapsedTime);
        setIsPaused(state.isPaused);
        setRecleanNotificationId(state.recleanNotificationId);
        // Reset notification ref when loading state
        notificationTriggeredRef.current = !!state.recleanNotificationId;
      }
    } catch (error) {
      console.error('Error loading timer state:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveTimerState = async () => {
    try {
      const state = {
        activeSession,
        elapsedTime,
        isPaused,
        recleanNotificationId,
      };
      await AsyncStorage.setItem(TIMER_STATE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Error saving timer state:', error);
    }
  };

  const checkRecleanNotification = async (elapsed: number) => {
    // Don't proceed if notifications disabled, no active session, or already triggered
    if (!notificationsEnabled || !activeSession) return;
    if (notificationTriggeredRef.current) return;
    if (recleanNotificationId !== null) return;

    const halfTargetSeconds = (targetWearTime / 2) * 3600;

    if (elapsed >= halfTargetSeconds) {
      // Set ref immediately to prevent multiple triggers
      notificationTriggeredRef.current = true;

      if (!notificationService.isQuietHours()) {
        const id = await notificationService.scheduleRecleanNotification(targetWearTime);
        if (id) {
          setRecleanNotificationId(id);
        } else {
          // If scheduling failed, reset ref so we can try again
          notificationTriggeredRef.current = false;
        }
      }
    }
  };

  const startSession = async () => {
    await notificationService.requestPermissions();
    const newSession: WearSession = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      startTime: new Date().toISOString(),
      endTime: null,
      duration: 0,
      comfort: 5,
      notes: '',
      fogging: false,
    };
    setActiveSession(newSession);
    setElapsedTime(0);
    setIsPaused(false);
    setRecleanNotificationId(null);
    notificationTriggeredRef.current = false;
  };

  const pauseSession = () => {
    setIsPaused(true);
  };

  const resumeSession = () => {
    setIsPaused(false);
  };

  const endSession = async (fogging: boolean, comfort: number, notes: string): Promise<WearSession> => {
    if (!activeSession) {
      throw new Error('No active session');
    }
    if (recleanNotificationId) {
      await notificationService.cancelNotification(recleanNotificationId);
    }
    const endedSession: WearSession = {
      ...activeSession,
      endTime: new Date().toISOString(),
      duration: elapsedTime,
      comfort,
      notes,
      fogging,
    };

    // Clear timer state
    setActiveSession(null);
    setElapsedTime(0);
    setIsPaused(false);
    setRecleanNotificationId(null);
    notificationTriggeredRef.current = false;
    await AsyncStorage.removeItem(TIMER_STATE_KEY);

    return endedSession;
  };

  const progress = activeSession ? Math.min((elapsedTime / (targetWearTime * 3600)) * 100, 100) : 0;

  return {
    activeSession,
    elapsedTime,
    isPaused,
    progress,
    startSession,
    pauseSession,
    resumeSession,
    endSession,
    isLoading,
  };
};