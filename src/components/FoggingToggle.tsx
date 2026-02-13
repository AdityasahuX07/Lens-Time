import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';

interface FoggingToggleProps {
  fogging: boolean;
  onToggle: () => void;
}

export const FoggingToggle: React.FC<FoggingToggleProps> = ({ fogging, onToggle }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Log Fogging</Text>
      <Switch
        trackColor={{ false: colors.gray200, true: colors.warning }}
        thumbColor={colors.white}
        ios_backgroundColor={colors.gray200}
        onValueChange={onToggle}
        value={fogging}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray500,
  },
});