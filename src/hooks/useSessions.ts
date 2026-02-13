// src/hooks/useSessions.ts

import { useState, useEffect } from 'react';
import { WearSession } from '../types';
import { storageService } from '../services/storageService';
import { formatDate } from '../utils/dateUtils';

export const useSessions = () => {
  const [sessions, setSessions] = useState<WearSession[]>([]);

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    saveSessions();
  }, [sessions]);

  const loadSessions = async () => {
    const loaded = await storageService.loadSessions();
    setSessions(loaded);
  };

  const saveSessions = async () => {
    await storageService.saveSessions(sessions);
  };

  const addSession = (session: WearSession) => {
    setSessions((prev) =>
      [session, ...prev].sort(
        (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
      )
    );
  };

  const deleteSessions = (sessionIds: string[]) => {
    setSessions((prev) => prev.filter((session) => !sessionIds.includes(session.id)));
  };

  const hasSessionOnDate = (date: Date): boolean => {
    const dateStr = formatDate(date);
    return sessions.some((s) => s.date === dateStr);
  };

  const getStreak = (): number => {
    if (sessions.length === 0) return 0;
    let streak = 0;
    const today = new Date();

    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateStr = formatDate(checkDate);

      const hasSession = sessions.some((s) => s.date === dateStr);
      if (hasSession) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
    return streak;
  };

  const replaceSessions = (newSessions: WearSession[]) => {
    setSessions(newSessions);
  };

  return {
    sessions,
    addSession,
    deleteSessions, // Add this
    hasSessionOnDate,
    getStreak,
    replaceSessions,
  };
};