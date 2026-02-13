// src/screens/StatsScreen.tsx

import React, { useState, useRef, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  PanResponder,
} from 'react-native';
import { WearSession } from '../types';
import { colors } from '../constants/colors';

interface StatsScreenProps {
  sessions: WearSession[];
  streak: number;
}

const { width } = Dimensions.get('window');

export const StatsScreen: React.FC<StatsScreenProps> = ({ sessions, streak }) => {
  const [currentMonthOffset, setCurrentMonthOffset] = useState(0);
  const [weekGraphOffset, setWeekGraphOffset] = useState(0);
  const [monthGraphOffset, setMonthGraphOffset] = useState(0);

  // Swipe handlers for calendar
  const calendarPanResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return Math.abs(gestureState.dx) > 20;
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dx > 50) {
          setCurrentMonthOffset(currentMonthOffset - 1);
        } else if (gestureState.dx < -50) {
          setCurrentMonthOffset(currentMonthOffset + 1);
        }
      },
    })
  ).current;

  // Swipe handlers for week graph - Right moves back (+), Left moves forward (-)
  const weekPanResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return Math.abs(gestureState.dx) > 20;
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dx > 50) {
          setWeekGraphOffset(weekGraphOffset + 1);
        } else if (gestureState.dx < -50 && weekGraphOffset > 0) {
          setWeekGraphOffset(weekGraphOffset - 1);
        }
      },
    })
  ).current;

  // Swipe handlers for month graph
  const monthPanResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return Math.abs(gestureState.dx) > 20;
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dx > 50) {
          setMonthGraphOffset(monthGraphOffset - 1);
        } else if (gestureState.dx < -50) {
          setMonthGraphOffset(monthGraphOffset + 1);
        }
      },
    })
  ).current;

  // Format hours to remove .0 decimal
  const formatHours = (hours: number, roundToInteger: boolean = false): string => {
    if (hours === 0) return '0h';
    if (roundToInteger) {
      return `${Math.round(hours)}h`;
    }
    if (Number.isInteger(hours)) {
      return `${Math.floor(hours)}h`;
    }
    return `${hours.toFixed(1)}h`;
  };

  const stats = useMemo(() => {
    if (sessions.length === 0) {
      return {
        bestStreak: 0,
        lifetimeHours: '0h 0m',
        averageHours: '0h 0m',
        totalSessions: 0,
        uniqueDatesCount: 0
      };
    }

    const totalSeconds = sessions.reduce((sum, s) => sum + s.duration, 0);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const lifetimeHours = `${hours}h ${minutes}m`;

    const averageSeconds = totalSeconds / sessions.length;
    const avgHours = Math.floor(averageSeconds / 3600);
    const avgMinutes = Math.floor((averageSeconds % 3600) / 60);
    const averageHours = `${avgHours}h ${avgMinutes}m`;

    const uniqueDates = Array.from(new Set(sessions.map(s => s.date)));
    const sortedDates = uniqueDates.sort();

    let bestStreak = 0;
    let currentStreak = 1;

    for (let i = 1; i < sortedDates.length; i++) {
      const prevDate = new Date(sortedDates[i - 1]);
      const currDate = new Date(sortedDates[i]);
      const daysDiff = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff === 1) {
        currentStreak++;
      } else {
        bestStreak = Math.max(bestStreak, currentStreak);
        currentStreak = 1;
      }
    }
    bestStreak = Math.max(bestStreak, currentStreak);

    return {
      bestStreak,
      lifetimeHours,
      averageHours,
      totalSessions: sessions.length,
      uniqueDatesCount: uniqueDates.length
    };
  }, [sessions]);

  const getCalendarData = useMemo(() => (monthOffset: number) => {
    const today = new Date();
    const targetDate = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
    const year = targetDate.getFullYear();
    const month = targetDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const monthName = firstDay.toLocaleString('default', { month: 'long', year: 'numeric' });
    const sessionDates = new Set(sessions.map(s => s.date));
    const calendarDays = [];

    for (let i = 0; i < startingDayOfWeek; i++) {
      calendarDays.push({ day: null, hasSession: false, isToday: false });
    }

    const todayStr = new Date().toISOString().split('T')[0];
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const hasSession = sessionDates.has(dateStr);
      const isToday = dateStr === todayStr;

      calendarDays.push({ day, hasSession, isToday });
    }

    return { monthName, calendarDays };
  }, [sessions]);

  const getWeekGraphData = useMemo(() => (weekOffset: number) => {
    const data = [];
    const today = new Date();
    let startDate = null;
    let endDate = null;

    const sessionsByDate = new Map();
    sessions.forEach(session => {
      const date = session.date;
      if (!sessionsByDate.has(date)) {
        sessionsByDate.set(date, []);
      }
      sessionsByDate.get(date).push(session);
    });

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i - (weekOffset * 7));
      const dateStr = date.toISOString().split('T')[0];

      if (i === 6) startDate = date;
      if (i === 0) endDate = date;

      const daySessions = sessionsByDate.get(dateStr) || [];
      const totalMinutes = daySessions.reduce((sum, s) => sum + s.duration / 60, 0);

      data.push({
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        hours: totalMinutes / 60,
      });
    }

    const dateRange = startDate && endDate
      ? `${startDate.getDate()} ${startDate.toLocaleDateString('en-US', { month: 'short' })} - ${endDate.getDate()} ${endDate.toLocaleDateString('en-US', { month: 'short' })}`
      : '';

    return { data, dateRange };
  }, [sessions]);

  const getMonthGraphData = useMemo(() => (monthOffset: number) => {
    const today = new Date();
    const targetDate = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
    const year = targetDate.getFullYear();
    const month = targetDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();

    const monthName = firstDay.toLocaleString('default', { month: 'long', year: 'numeric' });

    const sessionsByDate = new Map();
    sessions.forEach(session => {
      const date = session.date;
      if (!sessionsByDate.has(date)) {
        sessionsByDate.set(date, []);
      }
      sessionsByDate.get(date).push(session);
    });

    const data = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const daySessions = sessionsByDate.get(dateStr) || [];
      const totalHours = daySessions.reduce((sum, s) => sum + s.duration / 3600, 0);

      data.push({
        day: day,
        hours: totalHours,
        hasSession: daySessions.length > 0,
      });
    }

    return { data, monthName };
  }, [sessions]);

  const calendarData = useMemo(() => getCalendarData(currentMonthOffset), [getCalendarData, currentMonthOffset]);
  const weekGraphData = useMemo(() => getWeekGraphData(weekGraphOffset), [getWeekGraphData, weekGraphOffset]);
  const monthGraphData = useMemo(() => getMonthGraphData(monthGraphOffset), [getMonthGraphData, monthGraphOffset]);

  const maxWeekHours = Math.max(...weekGraphData.data.map(d => d.hours), 1);
  const maxMonthHours = Math.max(...monthGraphData.data.map(d => d.hours), 1);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Reports</Text>

      {/* Streak Cards */}
      <View style={styles.streakContainer}>
        <View style={styles.streakCard}>
          <View style={styles.streakContent}>
            <Text style={styles.streakEmoji}>🔥</Text>
            <Text style={styles.streakValue}>{streak}</Text>
          </View>
          <Text style={styles.streakLabel}>Current Streak</Text>
        </View>
        <View style={styles.streakCard}>
          <View style={styles.streakContent}>
            <Text style={styles.streakEmoji}>🏆</Text>
            <Text style={styles.streakValue}>{stats.bestStreak}</Text>
          </View>
          <Text style={styles.streakLabel}>Best Streak</Text>
        </View>
      </View>

      {/* Average Hours Card */}
      <View style={styles.averageCard}>
        <Text style={styles.averageLabel}>Average Time Per Session</Text>
        <Text style={styles.averageValue}>{stats.averageHours}</Text>
        <Text style={styles.sessionCount}>Based on {stats.totalSessions} sessions</Text>
      </View>

      {/* Calendar */}
      <View style={styles.calendarSection} {...calendarPanResponder.panHandlers}>
        <View style={styles.calendarHeader}>
          <TouchableOpacity onPress={() => setCurrentMonthOffset(currentMonthOffset - 1)}>
            <Text style={styles.navArrow}>⋘</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setCurrentMonthOffset(0)}>
            <Text style={styles.monthTitle}>{calendarData.monthName}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setCurrentMonthOffset(currentMonthOffset + 1)}
          >
            <Text style={styles.navArrow}>⋙</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.calendarGrid}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <View key={day} style={styles.calendarDayHeader}>
              <Text style={styles.calendarDayHeaderText}>{day}</Text>
            </View>
          ))}
        </View>

        <View style={styles.calendarGrid}>
          {calendarData.calendarDays.map((item, index) => (
            <View key={index} style={styles.calendarDay}>
              {item.day && (
                <View
                  style={[
                    styles.calendarDayCircle,
                    item.hasSession && styles.calendarDayWithSession,
                    item.isToday && styles.calendarDayToday,
                  ]}
                >
                  <Text
                    style={[
                      styles.calendarDayText,
                      item.isToday && styles.calendarDayTodayText,
                      !item.hasSession && !item.isToday && styles.calendarDayInactive,
                    ]}
                  >
                    {item.day}
                  </Text>
                </View>
              )}
            </View>
          ))}
        </View>
      </View>

      {/* Week Bar Graph - With decimal support */}
      <View style={styles.graphSection} {...weekPanResponder.panHandlers}>
        <View style={styles.graphHeader}>
          <TouchableOpacity onPress={() => setWeekGraphOffset(weekGraphOffset + 1)}>
            <Text style={styles.navArrow}>⋘</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setWeekGraphOffset(0)} style={styles.graphHeaderCenter}>
            <Text style={styles.graphTitle}>Weekly Duration (Daily)</Text>
            <Text style={styles.dateRange}>{weekGraphData.dateRange}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setWeekGraphOffset(Math.max(0, weekGraphOffset - 1))}
          >
            <Text style={styles.navArrow}>⋙</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.weekGraphContainer}>
          <View style={styles.weekBarsContainer}>
            {weekGraphData.data.map((item, index) => (
              <View key={index} style={styles.weekBarItem}>
                {item.hours > 0 && (
                  <View style={styles.weekBarValueContainer}>
                    <Text style={styles.weekBarValueText}>
                      {formatHours(item.hours, false)}
                    </Text>
                  </View>
                )}
                <View style={styles.weekBarWrapper}>
                  <View
                    style={[
                      styles.weekBar,
                      {
                        height: item.hours > 0
                          ? `${(item.hours / maxWeekHours) * 100}%`
                          : 2,
                        backgroundColor: colors.primaryDark || colors.primary,
                        opacity: 1,
                      }
                    ]}
                  />
                </View>
                <View style={styles.weekBarLabelContainer}>
                  <Text style={styles.weekBarLabel}>{item.day}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Monthly Bar Graph - ZERO GAP BETWEEN BARS */}
      <View style={styles.graphSection} {...monthPanResponder.panHandlers}>
        <View style={styles.graphHeader}>
          <TouchableOpacity onPress={() => setMonthGraphOffset(monthGraphOffset - 1)}>
            <Text style={styles.navArrow}>⋘</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setMonthGraphOffset(0)}>
            <Text style={styles.graphTitle}>{monthGraphData.monthName}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setMonthGraphOffset(monthGraphOffset + 1)}
          >
            <Text style={styles.navArrow}>⋙</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.monthGraphContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.monthGraphScroll}
          >
            <View style={styles.monthBarGraph}>
              {monthGraphData.data.map((item, index) => (
                <View key={index} style={styles.monthBarItem}>
                  {item.hours > 0 && (
                    <View style={styles.monthBarValueContainer}>
                      <Text style={styles.monthBarValueText}>
                        {formatHours(item.hours, true)}
                      </Text>
                    </View>
                  )}
                  <View style={styles.monthBarWrapper}>
                    <View
                      style={[
                        styles.monthBar,
                        {
                          height: item.hours > 0
                            ? `${(item.hours / maxMonthHours) * 100}%`
                            : 2,
                          backgroundColor: colors.primaryDark || colors.primary,
                          opacity: 1,
                        },
                      ]}
                    />
                  </View>
                  <View style={styles.monthBarLabelContainer}>
                    <Text style={styles.monthBarLabel}>{item.day}</Text>
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>

      <View style={styles.lifetimeCard}>
        <Text style={styles.lifetimeLabel}>Total Logged Time (Lifetime)</Text>
        <Text style={styles.lifetimeValue}>{stats.lifetimeHours}</Text>
        <Text style={styles.sessionCount}>Across {stats.uniqueDatesCount} days</Text>
      </View>
      <View style={{ height: 100 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 50,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.gray800,
    marginBottom: 24,
  },
  streakContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  streakCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  streakContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    gap: 8,
  },
  streakValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
  },
  streakLabel: {
    textAlign: 'center',
    alignSelf: 'center',
    fontSize: 11,
    color: colors.gray500,
  },
  streakEmoji: {
    fontSize: 20,
  },
  averageCard: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    alignItems: 'center',
  },
  averageLabel: {
    fontSize: 14,
    color: colors.white,
    opacity: 0.9,
    marginBottom: 8,
  },
  averageValue: {
    fontSize: 40,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 4,
  },
  sessionCount: {
    fontSize: 12,
    color: colors.white,
    opacity: 0.8,
  },
  calendarSection: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray800,
  },
  navArrow: {
    fontSize: 26,
    color: colors.primary,
    paddingHorizontal: 12,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDayHeader: {
    width: `${100 / 7}%`,
    alignItems: 'center',
    paddingVertical: 8,
  },
  calendarDayHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.gray400,
  },
  calendarDay: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarDayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarDayWithSession: {
    borderWidth: 5,
    borderColor: colors.primary,
    borderRadius: 18,
  },
  calendarDayToday: {
    backgroundColor: colors.primary,
    borderRadius: 18,
  },
  calendarDayText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray800,
  },
  calendarDayTodayText: {
    color: colors.white,
  },
  calendarDayInactive: {
    color: colors.gray800,
  },
  graphSection: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  graphHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  graphHeaderCenter: {
    alignItems: 'center',
  },
  graphTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray800,
  },
  dateRange: {
    fontSize: 12,
    color: colors.gray500,
    marginTop: 2,
  },
  // WEEK GRAPH STYLES
  weekGraphContainer: {
    height: 260,
    marginTop: -25,
  },
  weekBarsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 220,
    paddingTop: 18,
  },
  weekBarItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: 190,
    position: 'relative',
  },
  weekBarValueContainer: {
    position: 'absolute',
    top: 0,
    alignItems: 'center',
    width: '100%',
    zIndex: 2,
  },
  weekBarValueText: {
    fontSize: 11,
    color: colors.primaryDark || colors.primary,
    fontWeight: 'bold',
    backgroundColor: colors.white,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  weekBarWrapper: {
    width: '70%',
    height: 160,
    justifyContent: 'flex-end',
  },
  weekBar: {
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    width: '100%',
    minHeight: 2,
  },
  weekBarLabelContainer: {
    position: 'absolute',
    bottom: -25,
    alignItems: 'center',
    width: '100%',
  },
  weekBarLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.gray600,
    textAlign: 'center',
  },
  // MONTH GRAPH STYLES - ZERO GAP BETWEEN BARS
  monthGraphContainer: {
    height: 260,
    marginTop: -25,
  },
  monthGraphScroll: {
    flex: 1,
  },
  monthBarGraph: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 220,
    paddingTop: 18,
    paddingHorizontal: 0, // NO horizontal padding
  },
  monthBarItem: {
    width: 23, // ADJUSTED width for zero gap
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: 190,
    marginHorizontal: 0, // ZERO margin
    paddingHorizontal: 0, // ZERO padding
    position: 'relative',
  },
  monthBarValueContainer: {
    position: 'absolute',
    top: 0,
    alignItems: 'center',
    width: '100%',
    zIndex: 2,
  },
  monthBarValueText: {
    fontSize: 11,
    color: colors.primaryDark || colors.primary,
    fontWeight: 'bold',
    backgroundColor: colors.white,
    paddingHorizontal: 2,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  monthBarWrapper: {
    width: '100%', // FULL width
    height: 160,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 0, // NO padding
  },
  monthBar: {
    borderTopLeftRadius: 4, // MINIMAL radius
    borderTopRightRadius: 4, // MINIMAL radius
    width: '90%', // FULL width - NO gap
    minHeight: 2,
  },
  monthBarLabelContainer: {
    position: 'absolute',
    bottom: -25,
    alignItems: 'center',
    width: '100%',
  },
  monthBarLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.gray600,
    textAlign: 'center',
  },
  lifetimeCard: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: 24,
    marginBottom: 80,
    alignItems: 'center',
  },
  lifetimeLabel: {
    fontSize: 14,
    color: colors.white,
    opacity: 0.9,
    marginBottom: 8,
  },
  lifetimeValue: {
    fontSize: 40,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 4,
  },
});
