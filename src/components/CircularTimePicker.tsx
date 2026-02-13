// src/components/CircularTimePicker.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Svg, { Circle, G, Text as SvgText, Line } from 'react-native-svg';
import { colors } from '../constants/colors';

interface CircularTimePickerProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (hours: number, minutes: number) => void;
  initialHours?: number;
  initialMinutes?: number;
  mode?: 'hours' | 'minutes';
}

const { width } = Dimensions.get('window');
const PICKER_SIZE = width * 0.7;
const CENTER = PICKER_SIZE / 2;
const RADIUS = PICKER_SIZE * 0.4;
const HOURS = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

export const CircularTimePicker: React.FC<CircularTimePickerProps> = ({
  visible,
  onClose,
  onConfirm,
  initialHours = new Date().getHours(),
  initialMinutes = new Date().getMinutes(),
  mode: initialMode = 'hours',
}) => {
  const [mode, setMode] = useState<'hours' | 'minutes'>(initialMode);
  const [selectedHour, setSelectedHour] = useState(() => {
    const h = initialHours % 12;
    return h === 0 ? 12 : h;
  });
  const [selectedMinute, setSelectedMinute] = useState(
    Math.round(initialMinutes / 5) * 5
  );
  const [ampm, setAmpm] = useState(initialHours >= 12 ? 'PM' : 'AM');

  const getSelectedValue = () => {
    return mode === 'hours' ? selectedHour : selectedMinute;
  };

  const getNumberIndex = (value: number): number => {
    const numbers = mode === 'hours' ? HOURS : MINUTES;
    return numbers.findIndex(num => num === value);
  };

  const getDialCoordinates = () => {
    const selectedValue = getSelectedValue();
    const index = getNumberIndex(selectedValue);

    if (index === -1) return { x: CENTER, y: CENTER - RADIUS }; // Default to 12 o'clock

    const angle = (index * 30 - 90) * (Math.PI / 180);
    const x = CENTER + RADIUS * 0.9 * Math.cos(angle);
    const y = CENTER + RADIUS * 0.9 * Math.sin(angle);

    return { x, y };
  };

  const handleNumberPress = (value: number) => {
    if (mode === 'hours') {
      setSelectedHour(value);
      setMode('minutes');
    } else {
      setSelectedMinute(value);
    }
  };

  const handleConfirm = () => {
    let hours24 = selectedHour;
    if (ampm === 'PM' && selectedHour !== 12) {
      hours24 = selectedHour + 12;
    } else if (ampm === 'AM' && selectedHour === 12) {
      hours24 = 0;
    }
    onConfirm(hours24, selectedMinute);
    onClose();
  };

  const renderNumbers = () => {
    const numbers = mode === 'hours' ? HOURS : MINUTES;
    const selectedValue = getSelectedValue();

    return numbers.map((num, index) => {
      const angle = (index * 30 - 90) * (Math.PI / 180);
      const x = CENTER + RADIUS * Math.cos(angle);
      const y = CENTER + RADIUS * Math.sin(angle);
      const isSelected = selectedValue === num;

      return (
        <G key={`${mode}-${num}`}>
          <Circle
            cx={x}
            cy={y}
            r={22}
            fill={isSelected ? colors.primary : 'transparent'}
            onPress={() => handleNumberPress(num)}
          />
          <SvgText
            x={x}
            y={y}
            fontSize="18"
            fontWeight={isSelected ? 'bold' : 'normal'}
            fill={isSelected ? colors.white : colors.gray700}
            textAnchor="middle"
            alignmentBaseline="middle"
            onPress={() => handleNumberPress(num)}
          >
            {mode === 'minutes' ? num.toString().padStart(2, '0') : num.toString()}
          </SvgText>
        </G>
      );
    });
  };

  const dialEnd = getDialCoordinates();

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Time</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.timeDisplay}>
            <View style={styles.timeDisplayRow}>
              <TouchableOpacity onPress={() => setMode('hours')}>
                <Text style={[
                  styles.timeDisplayNumber,
                  mode === 'hours' && styles.timeDisplayNumberActive
                ]}>
                  {selectedHour.toString().padStart(2, '0')}
                </Text>
              </TouchableOpacity>
              <Text style={styles.timeDisplaySeparator}>:</Text>
              <TouchableOpacity onPress={() => setMode('minutes')}>
                <Text style={[
                  styles.timeDisplayNumber,
                  mode === 'minutes' && styles.timeDisplayNumberActive
                ]}>
                  {selectedMinute.toString().padStart(2, '0')}
                </Text>
              </TouchableOpacity>
              <View style={styles.ampmContainer}>
                <TouchableOpacity
                  style={[styles.ampmButton, ampm === 'AM' && styles.ampmButtonSelected]}
                  onPress={() => setAmpm('AM')}
                >
                  <Text
                    style={[
                      styles.ampmButtonText,
                      ampm === 'AM' && styles.ampmButtonTextSelected,
                    ]}
                  >
                    AM
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.ampmButton, ampm === 'PM' && styles.ampmButtonSelected]}
                  onPress={() => setAmpm('PM')}
                >
                  <Text
                    style={[
                      styles.ampmButtonText,
                      ampm === 'PM' && styles.ampmButtonTextSelected,
                    ]}
                  >
                    PM
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            <Text style={styles.modeIndicator}>
              {mode === 'hours' ? 'Select Hour' : 'Select Minute'}
            </Text>
          </View>

          <View style={styles.pickerContainer}>
            <Svg width={PICKER_SIZE} height={PICKER_SIZE}>
              {/* Center dot */}
              <Circle
                cx={CENTER}
                cy={CENTER}
                r={8}
                fill={colors.primary}
              />

              {/* Dial line from center to selected number */}
              <Line
                x1={CENTER}
                y1={CENTER}
                x2={dialEnd.x}
                y2={dialEnd.y}
                stroke={colors.primary}
                strokeWidth={3}
                strokeOpacity={0.6}
              />

              {/* Small circle at the end of the dial */}
              <Circle
                cx={dialEnd.x}
                cy={dialEnd.y}
                r={10}
                fill={colors.primary}
                opacity={0.8}
              />

              {/* Hour/minute numbers */}
              {renderNumbers()}
            </Svg>
          </View>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>CANCEL</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
              <Text style={styles.confirmButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.gray800,
  },
  closeButton: {
    fontSize: 24,
    color: colors.gray500,
  },
  timeDisplay: {
    backgroundColor: colors.gray100,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  timeDisplayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeDisplayNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.gray600,
    paddingHorizontal: 8,
  },
  timeDisplayNumberActive: {
    color: colors.primary,
  },
  timeDisplaySeparator: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.gray400,
  },
  ampmContainer: {
    flexDirection: 'row',
    marginLeft: 12,
    gap: 4,
  },
  ampmButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: colors.gray200,
  },
  ampmButtonSelected: {
    backgroundColor: colors.primary,
  },
  ampmButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.gray600,
  },
  ampmButtonTextSelected: {
    color: colors.white,
  },
  modeIndicator: {
    fontSize: 12,
    color: colors.gray500,
    marginTop: 4,
  },
  pickerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
    paddingTop: 16,
    width: '100%',
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: colors.gray100,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray600,
  },
  confirmButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  confirmButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
});