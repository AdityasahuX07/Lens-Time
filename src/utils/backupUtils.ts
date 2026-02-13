// src/utils/backupUtils.ts

// 1. IMPORT FROM /legacy SUBPATH TO PREVENT THE DEPRECATION ERROR
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { WearSession, BackupData } from '../types';

export const backupUtils = {
   async exportBackup(sessions: WearSession[]): Promise<void> {
     try {
       // 1. Manually select only the active fields to exclude old data
       const filteredSessions = sessions.map(({ id, date, startTime, endTime, duration }) => ({
         id,
         date,
         startTime,
         endTime,
         duration,
       }));

       const backup: BackupData = {
         sessions: filteredSessions as WearSession[],
         exportDate: new Date().toISOString(),
         version: '1.0',
       };

      const fileName = `scleral-backup-${new Date().toISOString().split('T')[0]}.json`;

      // 2. Use FileSystem.cacheDirectory or documentDirectory
      // These will be available in the legacy module as strings.
      const baseDir = FileSystem.cacheDirectory || FileSystem.documentDirectory;

      if (!baseDir) {
        // Last-resort fallback for Android initialization delays
        // IMPORTANT: Replace 'com.yourname.yourapp' with your exact package name
        const manualDir = 'file:///data/user/0/com.yourname.yourapp/cache/';
        console.warn('Constants null, using manual path:', manualDir);
        var fileUri = `${manualDir}${fileName}`;
      } else {
        var fileUri = `${baseDir}${fileName}`;
      }

      // 3. LEGACY API: writeAsStringAsync works perfectly here
      // Note: We use the string 'utf8' directly to avoid object property errors
      await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(backup, null, 2), {
        encoding: 'utf8'
      });

      // 4. Share the file
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        throw new Error('Sharing is not available on this device');
      }

      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/json',
        dialogTitle: 'Export Backup',
        UTI: 'public.json',
      });
    } catch (error) {
      console.error('Export error:', error);
      throw error;
    }
  },

  async importBackup(): Promise<WearSession[] | null> {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });

      if (result.canceled) return null;

      const fileUri = result.assets[0].uri;

      // Use the legacy module to read for better compatibility with Android URIs
      const fileContent = await FileSystem.readAsStringAsync(fileUri, {
        encoding: 'utf8'
      });

      const backup: BackupData = JSON.parse(fileContent);

      if (backup.sessions && Array.isArray(backup.sessions)) {
        return backup.sessions;
      }

      throw new Error('Invalid backup file format');
    } catch (error) {
      console.error('Import error:', error);
      throw error;
    }
  },
};