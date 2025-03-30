import React, { useState, useMemo, useCallback } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text, View } from '@/components/Themed';
import { Calendar, DateData } from 'react-native-calendars';
import { useTaskContext } from '@/context/TaskContext';
import { getColors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { router } from 'expo-router';
import { format } from 'date-fns';

export default function CalendarScreen() {
  const colorScheme = useColorScheme();
  const colors = getColors(colorScheme);
  const { tasks, loading } = useTaskContext();

  // State for the selected date
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  // Create marked dates object for the calendar
  const markedDates = useMemo(() => {
    const dates: any = {};

    // Mark all dates that have tasks
    tasks.forEach(task => {
      const dateStr = format(task.deadline, 'yyyy-MM-dd');

      if (!dates[dateStr]) {
        dates[dateStr] = {
          dots: [],
          marked: true
        };
      }

      // Add a dot for this category if it doesn't exist yet
      const categoryExists = dates[dateStr].dots.some(
        (dot: any) => dot.color === colors.categories[task.category as keyof typeof colors.categories]
      );

      if (!categoryExists) {
        dates[dateStr].dots.push({
          color: colors.categories[task.category as keyof typeof colors.categories],
          key: task.category
        });
      }
    });

    // Mark the selected date
    if (dates[selectedDate]) {
      dates[selectedDate] = {
        ...dates[selectedDate],
        selected: true,
        selectedColor: colors.tint,
      };
    } else {
      dates[selectedDate] = {
        selected: true,
        selectedColor: colors.tint,
      };
    }

    return dates;
  }, [tasks, selectedDate, colors]);

  // Filter tasks for the selected date
  const tasksForSelectedDate = useMemo(() => {
    return tasks.filter(task => {
      const taskDate = format(task.deadline, 'yyyy-MM-dd');
      return taskDate === selectedDate;
    });
  }, [tasks, selectedDate]);

  // Handle date selection
  const handleDateSelect = (date: DateData) => {
    setSelectedDate(date.dateString);
  };

  // Navigate to task details
  const navigateToTask = useCallback((taskId: string) => {
    router.push(`/task/${taskId}`);
  }, []);

  // Render a task item
  const renderTaskItem = ({ item: task }: { item: any }) => {
    return (
      <TouchableOpacity
        style={[
          styles.taskItem,
          { borderLeftColor: colors.categories[task.category as keyof typeof colors.categories] }
        ]}
        onPress={() => navigateToTask(task.id)}
      >
        <View style={styles.taskContent}>
          <Text
            style={[
              styles.taskTitle,
              task.completed && styles.completedTask
            ]}
          >
            {task.title}
          </Text>
        </View>
        <View
          style={[
            styles.priorityIndicator,
            { backgroundColor: colors.categories[task.category as keyof typeof colors.categories] }
          ]}
        />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Calendar</Text>

      <Calendar
        style={styles.calendar}
        theme={{
          calendarBackground: colors.background,
          textSectionTitleColor: '#b6c1cd',
          selectedDayBackgroundColor: colors.tint,
          selectedDayTextColor: '#ffffff',
          todayTextColor: colors.tint,
          dayTextColor: colors.text,
          textDisabledColor: '#d9e1e8',
          dotColor: colors.tint,
          monthTextColor: colors.text,
          arrowColor: colors.tint,
          indicatorColor: colors.tint,
        }}
        markingType={'multi-dot'}
        markedDates={markedDates}
        onDayPress={handleDateSelect}
        enableSwipeMonths={true}
      />

      <View style={styles.taskListContainer}>
        <Text style={styles.dateTitle}>
          {format(new Date(selectedDate), 'EEEE, MMMM do, yyyy')}
        </Text>

        {loading ? (
          <ActivityIndicator size="large" color={colors.tint} />
        ) : tasksForSelectedDate.length > 0 ? (
          <FlatList
            data={tasksForSelectedDate}
            keyExtractor={(item) => item.id}
            renderItem={renderTaskItem}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No tasks for this date</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  calendar: {
    marginBottom: 16,
    borderRadius: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  taskListContainer: {
    flex: 1,
  },
  dateTitle: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 12,
  },
  taskItem: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
    backgroundColor: '#f9f9f9',
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  completedTask: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  taskTime: {
    fontSize: 14,
    opacity: 0.6,
  },
  priorityIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    alignSelf: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.6,
  },
});
