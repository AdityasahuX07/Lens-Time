// src/components/BottomNavigation.tsx

import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { TabType } from '../types';
import { colors } from '../constants/colors';
import { TimerIcon, StatsIcon, SettingsIcon } from './Icons';

interface BottomNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  onTabChange,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.navContainer}>
        <TouchableOpacity
          style={[styles.navButton, activeTab === 'timer' && styles.navButtonActive]}
          onPress={() => onTabChange('timer')}
        >
          <TimerIcon
            width={20}
            height={20}
            color={activeTab === 'timer' ? colors.white : colors.gray600}
          />
          {activeTab === 'timer' && <Text style={styles.navLabel}>Timer</Text>}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navButton, activeTab === 'stats' && styles.navButtonActive]}
          onPress={() => onTabChange('stats')}
        >
          <StatsIcon
            width={20}
            height={20}
            color={activeTab === 'stats' ? colors.white : colors.gray600}
          />
          {activeTab === 'stats' && <Text style={styles.navLabel}>Reports</Text>}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navButton, activeTab === 'settings' && styles.navButtonActive]}
          onPress={() => onTabChange('settings')}
        >
          <SettingsIcon
            width={20}
            height={20}
            color={activeTab === 'settings' ? colors.white : colors.gray600}
          />
          {activeTab === 'settings' && <Text style={styles.navLabel}>Settings</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  navContainer: {
    flexDirection: 'row',
    backgroundColor: `${colors.primaryLight}CC`,
    borderRadius: 45,
    padding: 8,
    padding: 8,
    justifyContent: 'space-around',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: `${colors.primaryBorder}80`,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 16,
    borderRadius: 48,
    gap: 6,
  },
  navButtonActive: {
    backgroundColor: '#475d92',
    paddingHorizontal: 16,
  },
  navLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
});