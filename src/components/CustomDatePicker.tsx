// src/components/CustomDatePicker.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  FlatList,
} from 'react-native';
import { colors } from '../constants/colors';

interface CustomDatePickerProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (date: Date) => void;
  initialDate?: Date;
}

const { width } = Dimensions.get('window');
const MODAL_WIDTH = Math.min(400, width - 32);
const DAY_SIZE = (MODAL_WIDTH - 80) / 7; // 7 days in a week

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  visible,
  onClose,
  onConfirm,
  initialDate = new Date(),
}) => {
  const [selectedMonth, setSelectedMonth] = useState(initialDate.getMonth());
  const [selectedYear, setSelectedYear] = useState(initialDate.getFullYear());
  const [selectedDay, setSelectedDay] = useState(initialDate.getDate());

  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay(); // 0 = Sunday, 1 = Monday, etc.
  };

  const generateDaysGrid = () => {
    const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
    const firstDay = getFirstDayOfMonth(selectedMonth, selectedYear);

    const days = [];

    // Add empty cells for days before the first day of month
    for (let i = 0; i < firstDay; i++) {
      days.push({ day: 0, isCurrentMonth: false });
    }

    // Add days of current month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ day: i, isCurrentMonth: true });
    }

    return days;
  };

  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
    // Adjust selected day if it exceeds days in new month
    const newDaysInMonth = getDaysInMonth(
      selectedMonth === 0 ? 11 : selectedMonth - 1,
      selectedMonth === 0 ? selectedYear - 1 : selectedYear
    );
    if (selectedDay > newDaysInMonth) {
      setSelectedDay(newDaysInMonth);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
    // Adjust selected day if it exceeds days in new month
    const newDaysInMonth = getDaysInMonth(
      selectedMonth === 11 ? 0 : selectedMonth + 1,
      selectedMonth === 11 ? selectedYear + 1 : selectedYear
    );
    if (selectedDay > newDaysInMonth) {
      setSelectedDay(newDaysInMonth);
    }
  };

  const handleMonthSelect = (monthIndex: number) => {
    setSelectedMonth(monthIndex);
    setShowMonthPicker(false);
    // Adjust selected day if it exceeds days in new month
    const newDaysInMonth = getDaysInMonth(monthIndex, selectedYear);
    if (selectedDay > newDaysInMonth) {
      setSelectedDay(newDaysInMonth);
    }
  };

  const handleYearSelect = (year: number) => {
    setSelectedYear(year);
    setShowYearPicker(false);
    // Adjust selected day for February in leap years
    const newDaysInMonth = getDaysInMonth(selectedMonth, year);
    if (selectedDay > newDaysInMonth) {
      setSelectedDay(newDaysInMonth);
    }
  };

  const handleDaySelect = (day: number) => {
    if (day > 0) {
      setSelectedDay(day);
    }
  };

  const handleConfirm = () => {
    const selectedDate = new Date(selectedYear, selectedMonth, selectedDay);
    onConfirm(selectedDate);
    onClose();
  };

  const isToday = (day: number) => {
    const today = new Date();
    return day === today.getDate() &&
           selectedMonth === today.getMonth() &&
           selectedYear === today.getFullYear();
  };

  const isSelected = (day: number) => {
    return day === selectedDay;
  };

  const years = Array.from({ length: 21 }, (_, i) => selectedYear - 10 + i);

  const daysGrid = generateDaysGrid();

  const renderMonthPicker = () => (
    <View style={styles.monthYearPicker}>
      <Text style={styles.pickerTitle}>Select Month</Text>
      <View style={styles.monthGrid}>
        {MONTHS.map((month, index) => (
          <TouchableOpacity
            key={month}
            style={[
              styles.monthItem,
              selectedMonth === index && styles.selectedMonthItem,
            ]}
            onPress={() => handleMonthSelect(index)}
          >
            <Text
              style={[
                styles.monthItemText,
                selectedMonth === index && styles.selectedMonthItemText,
              ]}
            >
              {month.substring(0, 3)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity
        style={styles.closePickerButton}
        onPress={() => setShowMonthPicker(false)}
      >
        <Text style={styles.closePickerButtonText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );

  const renderYearPicker = () => (
    <View style={styles.monthYearPicker}>
      <Text style={styles.pickerTitle}>Select Year</Text>
      <FlatList
        data={years}
        keyExtractor={(item) => item.toString()}
        numColumns={3}
        contentContainerStyle={styles.yearGrid}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.yearItem,
              selectedYear === item && styles.selectedYearItem,
            ]}
            onPress={() => handleYearSelect(item)}
          >
            <Text
              style={[
                styles.yearItemText,
                selectedYear === item && styles.selectedYearItemText,
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        )}
      />
      <TouchableOpacity
        style={styles.closePickerButton}
        onPress={() => setShowYearPicker(false)}
      >
        <Text style={styles.closePickerButtonText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );

  const renderDay = ({ item }: { item: { day: number; isCurrentMonth: boolean } }) => {
    if (item.day === 0) {
      return <View style={[styles.dayCell, styles.emptyDay]} />;
    }

    const isSelectedDay = isSelected(item.day);
    const isTodayDay = isToday(item.day);

    return (
      <TouchableOpacity
        style={[
          styles.dayCell,
          isSelectedDay && styles.selectedDay,
          isTodayDay && styles.todayDay,
        ]}
        onPress={() => handleDaySelect(item.day)}
      >
        <Text
          style={[
            styles.dayText,
            isSelectedDay && styles.selectedDayText,
            isTodayDay && styles.todayDayText,
          ]}
        >
          {item.day}
        </Text>
      </TouchableOpacity>
    );
  };

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
            <Text style={styles.modalTitle}>Select Date</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          {showMonthPicker ? (
            renderMonthPicker()
          ) : showYearPicker ? (
            renderYearPicker()
          ) : (
            <>
              {/* Selected Date Display - Moved to top */}
              <View style={styles.selectedDateDisplay}>
                <Text style={styles.selectedDateText}>
                  {MONTHS[selectedMonth]} {selectedDay}, {selectedYear}
                </Text>
              </View>

              {/* Month and Year Selector */}
              <View style={styles.monthYearSelector}>
                <TouchableOpacity onPress={handlePrevMonth}>
                  <Text style={styles.navButton}>⋘</Text>
                </TouchableOpacity>

                <View style={styles.monthYearDisplay}>
                  <TouchableOpacity onPress={() => setShowMonthPicker(true)}>
                    <Text style={styles.monthYearText}>{MONTHS[selectedMonth]}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setShowYearPicker(true)}>
                    <Text style={styles.monthYearText}>{selectedYear}</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity onPress={handleNextMonth}>
                  <Text style={styles.navButton}>⋙</Text>
                </TouchableOpacity>
              </View>

              {/* Weekday Headers */}
              <View style={styles.weekdayRow}>
                {WEEKDAYS.map((day) => (
                  <Text key={day} style={styles.weekdayText}>
                    {day}
                  </Text>
                ))}
              </View>

              {/* Days Grid */}
              <FlatList
                data={daysGrid}
                renderItem={renderDay}
                keyExtractor={(item, index) => `day-${index}`}
                numColumns={7}
                scrollEnabled={false}
                contentContainerStyle={styles.daysGrid}
              />

              <View style={styles.modalFooter}>
                <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                  <Text style={styles.cancelButtonText}>CANCEL</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
                  <Text style={styles.confirmButtonText}>OK</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
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
    width: MODAL_WIDTH,
    maxWidth: 450,
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
  selectedDateDisplay: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: colors.gray100,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  selectedDateText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary,
  },
  monthYearSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 16,
  },
  navButton: {
    fontSize: 20,
    color: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  monthYearDisplay: {
    flexDirection: 'row',
    gap: 16,
  },
  monthYearText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray800,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  weekdayRow: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  weekdayText: {
    width: DAY_SIZE,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray500,
  },
  daysGrid: {
    width: '100%',
  },
  dayCell: {
    width: DAY_SIZE,
    height: DAY_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 2,
  },
  emptyDay: {
    backgroundColor: 'transparent',
  },
  dayText: {
    fontSize: 16,
    color: colors.gray700,
  },
  selectedDay: {
    backgroundColor: colors.primary,
    borderRadius: DAY_SIZE / 2,
  },
  selectedDayText: {
    color: colors.white,
    fontWeight: 'bold',
  },
  todayDay: {
    backgroundColor: colors.primary, // Solid primary color background
    borderRadius: DAY_SIZE / 2,
  },
  todayDayText: {
    color: colors.white, // White text for today
    fontWeight: 'bold',
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
  // Month/Year picker styles
  monthYearPicker: {
    width: '100%',
    alignItems: 'center',
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.gray800,
    marginBottom: 16,
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  monthItem: {
    width: 70,
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: colors.gray100,
    borderRadius: 12,
    alignItems: 'center',
  },
  selectedMonthItem: {
    backgroundColor: colors.primary,
  },
  monthItemText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray700,
  },
  selectedMonthItemText: {
    color: colors.white,
  },
  yearGrid: {
    alignItems: 'center',
    marginBottom: 16,
  },
  yearItem: {
    width: 80,
    paddingVertical: 12,
    margin: 4,
    backgroundColor: colors.gray100,
    borderRadius: 12,
    alignItems: 'center',
  },
  selectedYearItem: {
    backgroundColor: colors.primary,
  },
  yearItemText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray700,
  },
  selectedYearItemText: {
    color: colors.white,
  },
  closePickerButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: colors.gray200,
    borderRadius: 12,
  },
  closePickerButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray700,
  },
});