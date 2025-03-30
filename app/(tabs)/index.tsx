import { StyleSheet, FlatList, Pressable, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Link } from 'expo-router';
import { Text, View } from '@/components/Themed';
import Colors, { getColors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useTaskContext } from '@/context/TaskContext';
import { useFilterContext } from '@/context/FilterContext';
import { Task } from '@/types/task';
import FilterControls from '@/components/FilterControls';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';

// Task item component
function TaskItem({ task }: { task: Task }) {
  const colorScheme = useColorScheme();
  const colors = getColors(colorScheme);
  const { toggleTaskCompletion } = useTaskContext();

  const handleToggleComplete = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    toggleTaskCompletion(task.id);
  };

  return (
    <Link href={`/task/${task.id}`} asChild>
      <Pressable style={styles.taskItem}>
        <View style={[
          styles.categoryIndicator,
          { backgroundColor: colors.categories[task.category as keyof typeof colors.categories] || colors.tabIconDefault }
        ]} />
        <View style={styles.taskContent}>
          <Text style={[
            styles.taskTitle,
            task.completed && styles.completedTask
          ]}>
            {task.title}
          </Text>
          <Text style={styles.taskDetails}>
            {new Date(task.deadline).toLocaleDateString()} - {task.priority}
          </Text>
        </View>
        <TouchableOpacity
          onPress={(e: any) => handleToggleComplete(e)}
          style={styles.checkButton}
        >
          <Ionicons
            name={task.completed ? "checkmark-circle" : "checkmark-circle-outline"}
            size={24}
            color={task.completed ? "#4285F4" : "#9CA3AF"}
          />
        </TouchableOpacity>
      </Pressable>
    </Link>
  );
}

export default function TasksScreen() {
  const { tasks, loading } = useTaskContext();
  const { filterTasks } = useFilterContext();
  const [showFilters, setShowFilters] = useState(false);

  // Get filtered tasks based on current filter settings
  const filteredTasks = filterTasks(tasks);

  // Show loading indicator when first loading tasks
  if (loading && tasks.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4285F4" />
        <Text style={styles.loadingText}>Loading tasks...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.sectionTitle}>My Tasks</Text>
        <TouchableOpacity
          onPress={() => setShowFilters(!showFilters)}
          style={styles.filterButton}
        >
          <Ionicons name={showFilters ? "options" : "options-outline"} size={24} color="#4285F4" />
        </TouchableOpacity>
      </View>

      {showFilters && <FilterControls />}

      {filteredTasks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {tasks.length === 0 ?
              "No tasks yet. Tap + to create one" :
              "No tasks match your current filters"
            }
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredTasks}
          renderItem={({ item }) => <TaskItem task={item} />}
          keyExtractor={item => item.id}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          refreshing={loading}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  filterButton: {
    padding: 8,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 20,
  },
  taskItem: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'white',
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryIndicator: {
    width: 6,
    height: '80%',
    borderRadius: 3,
    marginRight: 12,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  completedTask: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  taskDetails: {
    fontSize: 12,
    opacity: 0.6,
  },
  checkButton: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#9CA3AF',
  },
});