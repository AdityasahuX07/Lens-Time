// src/screens/TimerScreen.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { CircularProgress } from '../components/CircularProgress';
import { WeekCalendar } from '../components/WeekCalendar';
import { ManualEntryModal } from '../modals/ManualEntryModal';
import { formatTimeCounter } from '../utils/timeUtils';
import { WearSession } from '../types';
import { colors } from '../constants/colors';

interface TimerScreenProps {
  hasSessionOnDate: (date: Date) => boolean;
  streak: number;
  onAddSession: (session: WearSession) => void;
  targetWearTime: number;
  notificationsEnabled: boolean;
  // Individual timer props (spread from useTimer)
  activeSession: WearSession | null;
  elapsedTime: number;
  isPaused: boolean;
  progress: number;
  startSession: () => Promise<void>;
  pauseSession: () => void;
  resumeSession: () => void;
  endSession: (fogging: boolean, comfort: number, notes: string) => Promise<WearSession>;
}

export const TimerScreen: React.FC<TimerScreenProps> = ({
  hasSessionOnDate,
  streak,
  onAddSession,
  targetWearTime,
  notificationsEnabled,
  // Timer props
  activeSession,
  elapsedTime,
  isPaused,
  progress,
  startSession,
  pauseSession,
  resumeSession,
  endSession,
}) => {
  const [showManualEntry, setShowManualEntry] = useState(false);

  const handleEndSession = async () => {
    const session = await endSession(false, 5, '');
    onAddSession(session);
  };

  const handleManualSave = (session: WearSession) => {
    onAddSession(session);
  };

  return (
    <>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.menuButton}>
            <Text style={styles.menuIcon}>≡</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowManualEntry(true)}
          >
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </View>

        <WeekCalendar hasSessionOnDate={hasSessionOnDate} streak={streak} />

        <View style={styles.timerContainer}>
          <CircularProgress
            progress={progress}
            timeText={formatTimeCounter(elapsedTime)}
          />
        </View>

        <View style={styles.controlsContainer}>
          {!activeSession ? (
            <TouchableOpacity style={styles.playButton} onPress={startSession}>
              <Text style={styles.playButtonText}>Start⫸</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.activeLayout}>
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.holdButton}
                  onPress={isPaused ? resumeSession : pauseSession}
                >
                  <Text style={styles.holdButtonText}>
                    {isPaused ? '▶' : '❚❚'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.removeButton} onPress={handleEndSession}>
                  <Text style={styles.removeButtonText}>■</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      <ManualEntryModal
        visible={showManualEntry}
        onClose={() => setShowManualEntry(false)}
        onSave={handleManualSave}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollContent: {
    paddingBottom: 150,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 35,
    paddingBottom: 16,
  },
  menuButton: {
    width: 45,
    height: 45,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuIcon: {
    fontSize: 30,
    color: colors.white,
  },
  addButton: {
    width: 45,
    height: 45,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 28,
    color: colors.white,
  },
  timerContainer: {
    alignItems: 'center',
    marginVertical: 15,
  },
  controlsContainer: {
    paddingHorizontal: 24,
    marginTop: 16,
  },
  activeLayout: {
    alignItems: 'center',
    width: '100%',
  },
  playButton: {
    width: 170,
    height: 70,
    borderRadius: 100,
    paddingLeft: 5,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  playButtonText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: colors.white,
    paddingHorizontal: 15,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 30,
  },
  holdButton: {
    width: 70,
    height: 70,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  holdButtonText: {
    fontSize: 25,
    color: colors.white,
  },
  removeButton: {
    width: 70,
    height: 70,
    borderRadius: 20,
    backgroundColor: colors.danger,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    fontSize: 35,
    color: colors.white,
  },
});