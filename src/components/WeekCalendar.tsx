import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getWeekDates, getWeekDayNames, isToday } from '../utils/dateUtils';
import { colors } from '../constants/colors';

interface WeekCalendarProps {
  hasSessionOnDate: (date: Date) => boolean;
  streak: number;
}

export const WeekCalendar: React.FC<WeekCalendarProps> = ({ hasSessionOnDate, streak }) => {
  const weekDates = getWeekDates();
  const weekDays = getWeekDayNames();

  // Reorder weekDays and weekDates to end with today
  const today = new Date();
  const todayIndex = weekDates.findIndex(date => isToday(date));

  // Reorder arrays to put today at the end
  const reorderedWeekDays = [...weekDays.slice(todayIndex + 1), ...weekDays.slice(0, todayIndex + 1)];
  const reorderedWeekDates = [...weekDates.slice(todayIndex + 1), ...weekDates.slice(0, todayIndex + 1)];

  return (
    <View style={styles.container}>
      <View style={styles.weekDaysRow}>
        {reorderedWeekDays.map((day, index) => (
          <Text key={`${day}-${index}`} style={styles.weekDay}>
            {day}
          </Text>
        ))}
      </View>
      <View style={styles.weekDatesRow}>
        {reorderedWeekDates.map((date, idx) => {
          const isTodayDate = isToday(date);
          const hasSession = hasSessionOnDate(date);
          const dayNum = date.getDate();

          return (
            <View key={`date-${idx}-${dayNum}`} style={styles.dateContainer}>
              <View
                style={[
                  styles.dateCircle,
                  isTodayDate && styles.todayCircle,
                  hasSession && !isTodayDate && styles.sessionCircle,
                ]}
              >
                <Text
                  style={[
                    styles.dateText,
                    isTodayDate && styles.todayText,
                    !hasSession && !isTodayDate && styles.inactiveText,
                  ]}
                >
                  {dayNum}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
      <Text style={styles.streakText}>Current Streak : {streak}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
  },
  weekDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  weekDay: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.gray400,
    width: 40,
    textAlign: 'center',
  },
  weekDatesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateContainer: {
    alignItems: 'center',
    paddingBottom: 0,
    width: 40,
  },
  dateCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  todayCircle: {
    backgroundColor: colors.primary,
  },
  sessionCircle: {
    borderWidth: 5,
    borderColor: colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray900,
  },
  todayText: {
    color: colors.white,
  },
  inactiveText: {
    color: colors.gray400,
  },
  streakText: {
    textAlign: 'center',
    paddingVertical: 10,
    paddingBottom: 1,
    fontSize: 16,
    color: colors.gray500,
  },
});