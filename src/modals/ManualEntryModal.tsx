// src/modals/ManualEntryModal.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Alert,
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native';
import { WearSession } from '../types';
import { formatDate } from '../utils/dateUtils';
import { calculateDuration } from '../utils/timeUtils';
import { colors } from '../constants/colors';
import { CircularTimePicker } from '../components/CircularTimePicker';
import { CustomDatePicker } from '../components/CustomDatePicker';

interface ManualEntryModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (session: WearSession) => void;
}

export const ManualEntryModal: React.FC<ManualEntryModalProps> = ({
  visible,
  onClose,
  onSave,
}) => {
  const today = new Date();

  const [startDate, setStartDate] = useState(today);
  const [startTime, setStartTime] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [endTime, setEndTime] = useState(today);

  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  const handleSave = () => {
    const start = new Date(startDate);
    start.setHours(startTime.getHours(), startTime.getMinutes(), 0, 0);

    const end = new Date(endDate);
    end.setHours(endTime.getHours(), endTime.getMinutes(), 0, 0);

    const duration = calculateDuration(start, end);

    if (duration <= 0) {
      Alert.alert('Error', 'End time must be after start time');
      return;
    }

    const newSession: WearSession = {
      id: Date.now().toString(),
      date: formatDate(start),
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      duration,
      comfort: 5,
      notes: '',
      fogging: false,
    };

    onSave(newSession);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    const today = new Date();
    setStartDate(today);
    setStartTime(today);
    setEndDate(today);
    setEndTime(today);
  };

  const formatDisplayDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDisplayTime = (time: Date): string => {
    return time.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleStartTimeConfirm = (hours: number, minutes: number) => {
    const newTime = new Date(startTime);
    newTime.setHours(hours, minutes);
    setStartTime(newTime);
  };

  const handleEndTimeConfirm = (hours: number, minutes: number) => {
    const newTime = new Date(endTime);
    newTime.setHours(hours, minutes);
    setEndTime(newTime);
  };

  const handleStartDateConfirm = (date: Date) => {
    setStartDate(date);
  };

  const handleEndDateConfirm = (date: Date) => {
    setEndDate(date);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View style={styles.content}>
              <View style={styles.header}>
                <Text style={styles.title}>Add Entry</Text>
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.body}>
                  {/* Start Date & Time */}
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Start</Text>

                    <View style={styles.row}>
                      <TouchableOpacity
                        style={[styles.dateInput, styles.flex1]}
                        onPress={() => setShowStartDatePicker(true)}
                      >
                        <Text style={styles.inputLabel}>Date</Text>
                        <Text style={styles.inputValue}>{formatDisplayDate(startDate)}</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.dateInput, styles.flex1]}
                        onPress={() => setShowStartTimePicker(true)}
                      >
                        <Text style={styles.inputLabel}>Time</Text>
                        <Text style={styles.inputValue}>{formatDisplayTime(startTime)}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* End Date & Time */}
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>End</Text>

                    <View style={styles.row}>
                      <TouchableOpacity
                        style={[styles.dateInput, styles.flex1]}
                        onPress={() => setShowEndDatePicker(true)}
                      >
                        <Text style={styles.inputLabel}>Date</Text>
                        <Text style={styles.inputValue}>{formatDisplayDate(endDate)}</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.dateInput, styles.flex1]}
                        onPress={() => setShowEndTimePicker(true)}
                      >
                        <Text style={styles.inputLabel}>Time</Text>
                        <Text style={styles.inputValue}>{formatDisplayTime(endTime)}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </ScrollView>

              <View style={styles.footer}>
                <TouchableOpacity style={styles.cancelFooterButton} onPress={onClose}>
                  <Text style={styles.cancelFooterButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                  <Text style={styles.saveButtonText}>Save Entry</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>

          {/* Custom Date Pickers */}
          <CustomDatePicker
            visible={showStartDatePicker}
            onClose={() => setShowStartDatePicker(false)}
            onConfirm={handleStartDateConfirm}
            initialDate={startDate}
          />

          <CustomDatePicker
            visible={showEndDatePicker}
            onClose={() => setShowEndDatePicker(false)}
            onConfirm={handleEndDateConfirm}
            initialDate={endDate}
          />

          {/* Circular Time Pickers */}
          <CircularTimePicker
            visible={showStartTimePicker}
            onClose={() => setShowStartTimePicker(false)}
            onConfirm={handleStartTimeConfirm}
            initialHours={startTime.getHours()}
            initialMinutes={startTime.getMinutes()}
          />

          <CircularTimePicker
            visible={showEndTimePicker}
            onClose={() => setShowEndTimePicker(false)}
            onConfirm={handleEndTimeConfirm}
            initialHours={endTime.getHours()}
            initialMinutes={endTime.getMinutes()}
          />
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  content: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.gray800,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: colors.gray500,
  },
  body: {
    gap: 20,
    paddingBottom: 20,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray700,
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  flex1: {
    flex: 1,
  },
  dateInput: {
    backgroundColor: colors.gray50,
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: 12,
    padding: 12,
  },
  inputLabel: {
    fontSize: 12,
    color: colors.gray500,
    marginBottom: 4,
  },
  inputValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray800,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
  },
  cancelFooterButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.gray100,
    alignItems: 'center',
  },
  cancelFooterButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray600,
  },
  saveButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
});

export default ManualEntryModal;