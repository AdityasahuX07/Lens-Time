// utils/dateUtils.ts

/**
 * Returns an array of weekday names starting from Sunday
 */
export const getWeekDayNames = (): string[] => {
  return ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
};

/**
 * Returns an array of dates for the current week (Sunday to Saturday)
 */
export const getWeekDates = (): Date[] => {
  const today = new Date();
  const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

  // Create array of 7 days starting from Sunday
  const weekDates: Date[] = [];

  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    // Go back to Sunday, then add i days
    date.setDate(today.getDate() - currentDay + i);
    weekDates.push(date);
  }

  return weekDates;
};

/**
 * Returns an array of dates for the current week with today at the end
 */
export const getWeekDatesWithTodayAtEnd = (): Date[] => {
  const weekDates = getWeekDates();
  const todayIndex = weekDates.findIndex(date => isToday(date));

  // Reorder array to put today at the end
  return [...weekDates.slice(todayIndex + 1), ...weekDates.slice(0, todayIndex + 1)];
};

/**
 * Returns an array of weekday names with today's day at the end
 */
export const getWeekDayNamesWithTodayAtEnd = (): string[] => {
  const weekDays = getWeekDayNames();
  const weekDates = getWeekDates();
  const todayIndex = weekDates.findIndex(date => isToday(date));

  // Reorder array to put today's day name at the end
  return [...weekDays.slice(todayIndex + 1), ...weekDays.slice(0, todayIndex + 1)];
};

/**
 * Check if a date is today
 */
export const isToday = (date: Date): boolean => {
  const today = new Date();
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
};

/**
 * Format date to YYYY-MM-DD
 */
export const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Get the day name for a given date
 */
export const getDayName = (date: Date): string => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getDay()];
};

/**
 * Get the short day name for a given date
 */
export const getShortDayName = (date: Date): string => {
  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  return days[date.getDay()];
};