import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  FileText,
  HelpCircle,
  Bell,
  Clock,
} from 'lucide-react-native';
import { Colors } from '../constants/Colors';
import { getApi } from '@gocanvas/shared';

interface CalendarEvent {
  Eventid: number;
  Eventtitle: string;
  Eventdescription: string | null;
  Eventtype: string; // 'assignment', 'quiz', 'event', 'reminder'
  Eventstart: string;
  Eventend: string | null;
  Eventallday: boolean;
  Eventcolor: string | null;
  Courseid: number | null;
  Referencetype: string | null;
  Referenceid: number | null;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function CalendarScreen() {
  const navigation = useNavigation();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, [currentDate]);

  const fetchEvents = async () => {
    try {
      // Get first and last day of the current month
      const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      const startDate = firstDay.toISOString().split('T')[0];
      const endDate = lastDay.toISOString().split('T')[0];

      const data = await getApi<CalendarEvent[]>(
        `/calendar/events?start_date=${startDate}&end_date=${endDate}`
      );
      setEvents(data);
    } catch (error: any) {
      console.error('Failed to fetch calendar events', error);
      // Don't show alert on initial load failure - just show empty state
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchEvents();
  }, [currentDate]);

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    const days: (number | null)[] = [];

    // Add empty slots for days before the first day of the month
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  };

  const getEventsForDate = (day: number): CalendarEvent[] => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter((event) => event.Eventstart.startsWith(dateStr));
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'assignment':
        return <FileText size={14} color="#fff" />;
      case 'quiz':
        return <HelpCircle size={14} color="#fff" />;
      case 'reminder':
        return <Bell size={14} color="#fff" />;
      default:
        return <CalendarIcon size={14} color="#fff" />;
    }
  };

  const getEventColor = (event: CalendarEvent): string => {
    if (event.Eventcolor) return event.Eventcolor;
    switch (event.Eventtype) {
      case 'assignment':
        return Colors.blue500;
      case 'quiz':
        return Colors.purple500;
      case 'reminder':
        return Colors.orange500;
      default:
        return Colors.primary;
    }
  };

  const formatEventTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };

  const isToday = (day: number): boolean => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (day: number): boolean => {
    return (
      day === selectedDate.getDate() &&
      currentDate.getMonth() === selectedDate.getMonth() &&
      currentDate.getFullYear() === selectedDate.getFullYear()
    );
  };

  const selectedDateEvents = selectedDate
    ? getEventsForDate(selectedDate.getDate())
    : [];

  const renderCalendarDay = (day: number | null, index: number) => {
    if (day === null) {
      return <View key={`empty-${index}`} style={styles.dayCell} />;
    }

    const dayEvents = getEventsForDate(day);
    const hasEvents = dayEvents.length > 0;

    return (
      <TouchableOpacity
        key={`day-${day}`}
        style={[
          styles.dayCell,
          isToday(day) && styles.todayCell,
          isSelected(day) && styles.selectedCell,
        ]}
        onPress={() =>
          setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))
        }
      >
        <Text
          style={[
            styles.dayText,
            isToday(day) && styles.todayText,
            isSelected(day) && styles.selectedText,
          ]}
        >
          {day}
        </Text>
        {hasEvents && (
          <View style={styles.eventDots}>
            {dayEvents.slice(0, 3).map((event, i) => (
              <View
                key={i}
                style={[styles.eventDot, { backgroundColor: getEventColor(event) }]}
              />
            ))}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderEventItem = ({ item }: { item: CalendarEvent }) => (
    <TouchableOpacity style={styles.eventCard}>
      <View style={[styles.eventColorBar, { backgroundColor: getEventColor(item) }]} />
      <View style={styles.eventContent}>
        <View style={styles.eventHeader}>
          <View style={[styles.eventIcon, { backgroundColor: getEventColor(item) }]}>
            {getEventIcon(item.Eventtype)}
          </View>
          <View style={styles.eventInfo}>
            <Text style={styles.eventTitle} numberOfLines={1}>
              {item.Eventtitle}
            </Text>
            <View style={styles.eventMeta}>
              <Clock size={12} color={Colors.mutedForeground} />
              <Text style={styles.eventTime}>
                {item.Eventallday ? 'All day' : formatEventTime(item.Eventstart)}
              </Text>
              <View style={[styles.eventTypeBadge, { backgroundColor: getEventColor(item) + '20' }]}>
                <Text style={[styles.eventTypeText, { color: getEventColor(item) }]}>
                  {item.Eventtype}
                </Text>
              </View>
            </View>
          </View>
        </View>
        {item.Eventdescription && (
          <Text style={styles.eventDescription} numberOfLines={2}>
            {item.Eventdescription}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const days = getDaysInMonth();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backIcon}>
          <ArrowLeft size={24} color={Colors.foreground} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Calendar</Text>
        </View>
        <TouchableOpacity onPress={goToToday} style={styles.todayButton}>
          <Text style={styles.todayButtonText}>Today</Text>
        </TouchableOpacity>
      </View>

      {/* Month Navigation */}
      <View style={styles.monthNav}>
        <TouchableOpacity onPress={goToPreviousMonth} style={styles.monthNavButton}>
          <ChevronLeft size={24} color={Colors.foreground} />
        </TouchableOpacity>
        <Text style={styles.monthTitle}>
          {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
        </Text>
        <TouchableOpacity onPress={goToNextMonth} style={styles.monthNavButton}>
          <ChevronRight size={24} color={Colors.foreground} />
        </TouchableOpacity>
      </View>

      {/* Calendar Grid */}
      <View style={styles.calendarContainer}>
        {/* Day Headers */}
        <View style={styles.dayHeaders}>
          {DAYS.map((day) => (
            <View key={day} style={styles.dayHeader}>
              <Text style={styles.dayHeaderText}>{day}</Text>
            </View>
          ))}
        </View>

        {/* Calendar Days */}
        <View style={styles.daysGrid}>
          {days.map((day, index) => renderCalendarDay(day, index))}
        </View>
      </View>

      {/* Events for Selected Date */}
      <View style={styles.eventsSection}>
        <Text style={styles.eventsSectionTitle}>
          {selectedDate.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
          })}
        </Text>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={Colors.primary} />
          </View>
        ) : (
          <FlatList
            data={selectedDateEvents}
            renderItem={renderEventItem}
            keyExtractor={(item) => item.Eventid.toString()}
            contentContainerStyle={styles.eventsList}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={Colors.primary}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyEvents}>
                <CalendarIcon size={32} color={Colors.mutedForeground} />
                <Text style={styles.emptyEventsText}>No events for this day</Text>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backIcon: {
    padding: 4,
  },
  headerCenter: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.foreground,
  },
  todayButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.primary,
    borderRadius: 16,
  },
  todayButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  monthNavButton: {
    padding: 8,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.foreground,
  },
  calendarContainer: {
    paddingHorizontal: 8,
  },
  dayHeaders: {
    flexDirection: 'row',
  },
  dayHeader: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  dayHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.mutedForeground,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  todayCell: {
    backgroundColor: Colors.indigo100,
    borderRadius: 8,
  },
  selectedCell: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
  },
  dayText: {
    fontSize: 14,
    color: Colors.foreground,
  },
  todayText: {
    fontWeight: '600',
    color: Colors.indigo600,
  },
  selectedText: {
    fontWeight: '600',
    color: '#fff',
  },
  eventDots: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 2,
  },
  eventDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  eventsSection: {
    flex: 1,
    backgroundColor: Colors.secondary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: 8,
  },
  eventsSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.foreground,
    padding: 16,
    paddingBottom: 8,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  eventsList: {
    padding: 16,
    paddingTop: 8,
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  eventColorBar: {
    width: 4,
  },
  eventContent: {
    flex: 1,
    padding: 12,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventIcon: {
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventInfo: {
    flex: 1,
    marginLeft: 10,
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.foreground,
  },
  eventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  eventTime: {
    fontSize: 12,
    color: Colors.mutedForeground,
  },
  eventTypeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  eventTypeText: {
    fontSize: 10,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  eventDescription: {
    fontSize: 13,
    color: Colors.mutedForeground,
    marginTop: 8,
    lineHeight: 18,
  },
  emptyEvents: {
    alignItems: 'center',
    padding: 32,
  },
  emptyEventsText: {
    fontSize: 14,
    color: Colors.mutedForeground,
    marginTop: 12,
  },
});
