// App.tsx
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { TimerScreen } from './src/screens/TimerScreen';
import { StatsScreen } from './src/screens/StatsScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { BottomNavigation } from './src/components/BottomNavigation';
import { useSessions } from './src/hooks/useSessions';
import { useSettings } from './src/hooks/useSettings';
import { useTimer } from './src/hooks/useTimer';
import { TabType, WearSession } from './src/types';
import { colors } from './src/constants/colors';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('timer');
  const { sessions, addSession, hasSessionOnDate, getStreak, replaceSessions, deleteSessions } = useSessions(); // Add deleteSessions
  const { settings, updateTargetWearTime, toggleNotifications } = useSettings();

  const timer = useTimer(settings.targetWearTime, settings.notificationsEnabled);

  const streak = getStreak();

  const handleAddSession = (session: WearSession) => {
    addSession(session);
  };

  const handleImport = (importedSessions: WearSession[]) => {
    replaceSessions(importedSessions);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {activeTab === 'timer' && (
        <TimerScreen
          hasSessionOnDate={hasSessionOnDate}
          streak={streak}
          onAddSession={handleAddSession}
          targetWearTime={settings.targetWearTime}
          notificationsEnabled={settings.notificationsEnabled}
          {...timer}
        />
      )}

      {activeTab === 'stats' && (
        <StatsScreen sessions={sessions} streak={streak} />
      )}

      {activeTab === 'settings' && (
        <SettingsScreen
          sessions={sessions}
          streak={streak}
          onImport={handleImport}
          settings={settings}
          onUpdateTargetWearTime={updateTargetWearTime}
          onToggleNotifications={toggleNotifications}
          onDeleteSessions={deleteSessions} // Add this
        />
      )}

      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray50,
  },
});