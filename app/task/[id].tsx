import { useLocalSearchParams, Stack, router } from 'expo-router';
import { StyleSheet, ScrollView, Pressable, Alert, ActivityIndicator } from 'react-native';
import { Text, View } from '@/components/Themed';
import Colors, { getColors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTaskContext } from '@/context/TaskContext';
import { useEffect, useState } from 'react';
import CalendarSyncStatus from '@/components/CalendarSyncStatus';

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const colors = getColors(colorScheme);
  
  // Use task context with calendar sync capabilities
  const { getTaskById, toggleTaskCompletion, deleteTask, syncTaskWithCalendar, isSyncing } = useTaskContext();
  const task = getTaskById(id as string);
  const [hasSynced, setHasSynced] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Sync task with calendar when viewed
  useEffect(() => {
    if (task?.calendarEventId) {
      setHasSynced(true);
    } else if (task) {
      const syncTask = async () => {
        await syncTaskWithCalendar(task);
        setHasSynced(true);
      };
      syncTask();
    }
  }, [task]);
  
  if (!task) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Task not found</Text>
        <Pressable 
          style={styles.button}
          onPress={() => router.back()}>
          <Text style={styles.buttonText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }
  
  // Function to handle task editing
  const handleEdit = () => {
    router.push(`/task/edit/${task.id}`);
  };
  
  // Function to handle task deletion with confirmation
  const handleDelete = () => {
    Alert.alert(
      "Delete Task",
      "Are you sure you want to delete this task?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            setIsLoading(true);
            await deleteTask(task.id);
            router.back();
          }
        }
      ]
    );
  };
  
  // Function to toggle task completion
  const handleToggleComplete = async () => {
    setIsLoading(true);
    await toggleTaskCompletion(task.id);
    setIsLoading(false);
  };
  
  return (
    <ScrollView style={styles.container}>
      <Stack.Screen options={{ title: 'Task Details' }} />
      
      {/* Task Title with Edit/Delete Buttons */}
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{task.title}</Text>
        <View style={styles.actionButtons}>
          <Pressable
            onPress={handleEdit}
            style={({ pressed }) => ({ 
              opacity: pressed ? 0.5 : 1,
              marginRight: 15
            })}>
            <FontAwesome
              name="edit"
              size={25}
              color={colors.tint}
            />
          </Pressable>
          <Pressable
            onPress={handleDelete}
            style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}>
            <FontAwesome
              name="trash"
              size={25}
              color="red"
            />
          </Pressable>
        </View>
      </View>
      
      {/* Calendar Sync Status */}
      <CalendarSyncStatus 
        isSyncing={isSyncing} 
        hasSynced={hasSynced} 
      />
      
      <View style={styles.section}>
        <Text style={styles.label}>Description</Text>
        <Text style={styles.value}>{task.description || 'No description'}</Text>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.label}>Category</Text>
        <View style={styles.categoryContainer}>
          <View style={[
            styles.categoryIndicator, 
            { backgroundColor: colors.categories[task.category as keyof typeof colors.categories] }
          ]} />
          <Text style={styles.categoryText}>{task.category}</Text>
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.label}>Priority</Text>
        <Text style={styles.value}>{task.priority}</Text>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.label}>Deadline</Text>
        <Text style={styles.value}>{task.deadline.toLocaleDateString()}</Text>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.label}>Status</Text>
        <Text style={styles.value}>{task.completed ? 'Completed' : 'In Progress'}</Text>
      </View>
      
      <Pressable 
        style={[styles.button, { backgroundColor: task.completed ? '#4CAF50' : '#2196F3' }]}
        onPress={handleToggleComplete}
        disabled={isLoading}>
        {isLoading ? (
          <ActivityIndicator color="white" size="small" />
        ) : (
          <Text style={styles.buttonText}>
            {task.completed ? 'Mark as Incomplete' : 'Mark as Complete'}
          </Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  section: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
    opacity: 0.6,
  },
  value: {
    fontSize: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
  },
  categoryIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 16,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});