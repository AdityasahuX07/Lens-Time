// src/screens/SettingsScreen.tsx

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert, Switch, TextInput } from 'react-native';
import { WearSession, AppSettings } from '../types';
import { backupUtils } from '../utils/backupUtils';
import { colors } from '../constants/colors';
import { ManageEntriesModal } from '../modals/ManageEntriesModal';

interface SettingsScreenProps {
  sessions: WearSession[];
  streak: number;
  onImport: (sessions: WearSession[]) => void;
  settings: AppSettings;
  onUpdateTargetWearTime: (hours: number) => void;
  onToggleNotifications: () => void;
  onDeleteSessions: (sessionIds: string[]) => void; // Add this prop
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  sessions,
  streak,
  onImport,
  settings,
  onUpdateTargetWearTime,
  onToggleNotifications,
  onDeleteSessions, // Add this
}) => {
  const [editingTarget, setEditingTarget] = useState(false);
  const [targetInput, setTargetInput] = useState(settings.targetWearTime.toString());
  const [showManageEntries, setShowManageEntries] = useState(false);

  const handleExport = async () => {
    try {
      await backupUtils.exportBackup(sessions);
      Alert.alert('Success', 'Backup exported successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to export backup');
    }
  };

  const handleImport = async () => {
    try {
      const importedSessions = await backupUtils.importBackup();
      if (importedSessions) {
        onImport(importedSessions);
        Alert.alert('Success', 'Backup imported successfully!');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to import backup');
    }
  };

  const handleSaveTargetTime = () => {
    const hours = parseFloat(targetInput);
    if (isNaN(hours) || hours <= 0 || hours > 24) {
      Alert.alert('Invalid Input', 'Please enter a valid number between 1 and 24 hours');
      setTargetInput(settings.targetWearTime.toString());
      return;
    }
    onUpdateTargetWearTime(hours);
    setEditingTarget(false);
  };

  const handleDeleteSessions = (sessionIds: string[]) => {
    onDeleteSessions(sessionIds);
  };

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Settings</Text>

        {/* Target Wear Time */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Target Wear Time</Text>

          {editingTarget ? (
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={targetInput}
                onChangeText={setTargetInput}
                keyboardType="decimal-pad"
                placeholder="14"
                autoFocus
              />
              <Text style={styles.inputLabel}>hours per day</Text>
            </View>
          ) : (
            <View style={styles.targetDisplay}>
              <Text style={styles.targetValue}>{settings.targetWearTime} hours</Text>
              <Text style={styles.targetDescription}>Target daily wear time for your lenses</Text>
            </View>
          )}

          {editingTarget ? (
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setEditingTarget(false);
                  setTargetInput(settings.targetWearTime.toString());
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveTargetTime}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setEditingTarget(true)}
            >
              <Text style={styles.editButtonText}>Change Target Time</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Notifications */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Notifications</Text>

          <View style={styles.notificationRow}>
            <View style={styles.notificationInfo}>
              <Text style={styles.notificationTitle}>Reclean Reminder</Text>
              <Text style={styles.notificationDescription}>
                Get notified at half of your target wear time ({settings.targetWearTime / 2} hours) to reclean your lenses
              </Text>
            </View>
            <Switch
              value={settings.notificationsEnabled}
              onValueChange={onToggleNotifications}
              trackColor={{ false: colors.gray300, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>
        </View>

        {/* Statistics */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Statistics</Text>
          <View style={styles.statsRow}>
            <Text style={styles.statsRowLabel}>Total Sessions:</Text>
            <Text style={styles.statsRowValue}>{sessions.length}</Text>
          </View>
          <View style={styles.statsRow}>
            <Text style={styles.statsRowLabel}>Current Streak:</Text>
            <Text style={styles.statsRowValue}>{streak} days</Text>
          </View>
        </View>

        {/* Data Management Section */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Data Management</Text>

          {/* Manage Entries Button */}
          <TouchableOpacity
            style={styles.manageEntriesButton}
            onPress={() => setShowManageEntries(true)}
          >
            <Text style={styles.manageEntriesButtonText}>📋 Manage Entries</Text>
            <Text style={styles.manageEntriesBadge}>{sessions.length}</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.exportButton} onPress={handleExport}>
            <Text style={styles.exportButtonText}>⬇ Export Backup</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.importButton} onPress={handleImport}>
            <Text style={styles.importButtonText}>⬆ Import Backup</Text>
          </TouchableOpacity>

          <Text style={styles.backupInfo}>
            Backup your data to keep it safe. Import to restore from a previous backup.
          </Text>
        </View>

        {/* Large spacer to ensure content clears the bottom navigation */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      <ManageEntriesModal
        visible={showManageEntries}
        onClose={() => setShowManageEntries(false)}
        sessions={sessions}
        onDeleteSessions={handleDeleteSessions}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 50,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.gray800,
    marginBottom: 24,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray800,
    marginBottom: 16,
  },
  targetDisplay: {
    marginBottom: 16,
  },
  targetValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  targetDescription: {
    fontSize: 14,
    color: colors.gray500,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  input: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.gray800,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
    paddingVertical: 8,
    marginRight: 8,
  },
  inputLabel: {
    fontSize: 16,
    color: colors.gray500,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  editButton: {
    backgroundColor: colors.gray100,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray700,
  },
  saveButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.gray100,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray700,
  },
  notificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  notificationInfo: {
    flex: 1,
    marginRight: 16,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray800,
    marginBottom: 4,
  },
  notificationDescription: {
    fontSize: 13,
    color: colors.gray500,
    marginBottom: 8,
  },
  quietHoursNote: {
    fontSize: 11,
    color: colors.gray400,
    fontStyle: 'italic',
  },
  manageEntriesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.gray100,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  manageEntriesButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray800,
  },
  manageEntriesBadge: {
    backgroundColor: colors.primary,
    color: colors.white,
    fontSize: 14,
    fontWeight: 'bold',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  divider: {
    height: 1,
    backgroundColor: colors.gray200,
    marginVertical: 16,
  },
  exportButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  exportButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  importButton: {
    backgroundColor: colors.success,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  importButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  backupInfo: {
    fontSize: 12,
    color: colors.gray500,
    marginTop: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  statsRowLabel: {
    fontSize: 14,
    color: colors.gray500,
  },
  statsRowValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray800,
  },
  bottomSpacer: {
    height: 52,
  },
});

export default SettingsScreen;