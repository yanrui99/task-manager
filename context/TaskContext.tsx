import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { database } from '../config/firebase';
import { ref, set, onValue, remove, update, push, get } from 'firebase/database';
import { useAuth } from './AuthContext';
import { Task } from '@/types/task';
import { Alert } from 'react-native';
import CalendarService from '@/services/CalendarService';

// Define the updated context type with async functions
type TaskContextType = {
    tasks: Task[];
    loading: boolean;
    addTask: (task: Omit<Task, 'id' | 'completed'>) => Promise<void>;
    updateTask: (task: Task) => Promise<void>;
    deleteTask: (id: string) => Promise<void>;
    toggleTaskCompletion: (id: string) => Promise<void>;
    getTaskById: (id: string) => Task | undefined;
    syncTaskWithCalendar: (task: Task) => Promise<void>;
    isSyncing: boolean;
};

// Create the context
const TaskContext = createContext<TaskContextType | undefined>(undefined);

// Provider component
export function TaskProvider({ children }: { children: ReactNode }) {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);
    const { user } = useAuth();

    // Fetch tasks when user changes
    useEffect(() => {
        if (!user) {
            setTasks([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        const userTasksRef = ref(database, `tasks/${user.uid}`);

        const unsubscribe = onValue(userTasksRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                // Convert the object to an array of tasks
                const taskList = Object.entries(data).map(([id, taskData]) => ({
                    id,
                    ...(taskData as Omit<Task, 'id'>),
                    // Convert timestamp string back to Date object for deadline
                    deadline: new Date((taskData as any).deadline)
                }));
                setTasks(taskList);
            } else {
                setTasks([]);
            }
            setLoading(false);
        }, (error) => {
            console.error('Error fetching tasks:', error);
            Alert.alert('Error', 'Failed to load tasks. Please try again later.');
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    // Synchronise a task with Google Calendar
    const syncTaskWithCalendar = async (task: Task): Promise<void> => {
        if (!user) return;

        try {
            setIsSyncing(true);

            // Check if task already has a calendar event ID
            if (task.calendarEventId) {
                // Update existing calendar event
                const success = await CalendarService.updateEvent(task, task.calendarEventId);
                if (!success) {
                    // If update fails, try to create a new event
                    const newEventId = await CalendarService.createEvent(task);
                    if (newEventId) {
                        // Update task with new calendar event ID
                        const taskRef = ref(database, `tasks/${user.uid}/${task.id}`);
                        await update(taskRef, { calendarEventId: newEventId });
                    }
                }
            } else {
                // Create new calendar event
                const eventId = await CalendarService.createEvent(task);
                if (eventId) {
                    // Update task with calendar event ID
                    const taskRef = ref(database, `tasks/${user.uid}/${task.id}`);
                    await update(taskRef, { calendarEventId: eventId });
                }
            }
        } catch (error) {
            console.error('Error syncing with calendar:', error);
            Alert.alert('Calendar Sync Error', 'Failed to sync task with calendar. Please try again.');
        } finally {
            setIsSyncing(false);
        }
    };

    const addTask = async (taskData: Omit<Task, 'id' | 'completed'>) => {
        if (!user) return;
        try {
            setLoading(true);
            // Generate a unique ID using Firebase push
            const newTaskRef = push(ref(database, `tasks/${user.uid}`));

            // Store the task with the generated ID
            await set(newTaskRef, {
                ...taskData,
                completed: false, // Default value
                // Store deadline as ISO string for database
                deadline: taskData.deadline.toISOString(),
            });

            // Get the created task with ID for calendar sync
            const createdTask: Task = {
                id: newTaskRef.key as string,
                ...taskData,
                completed: false
            };

            // Sync with calendar
            await syncTaskWithCalendar(createdTask);
        } catch (error) {
            console.error('Error creating task:', error);
            Alert.alert('Error', 'Failed to create task. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const updateTask = async (updatedTask: Task) => {
        if (!user) return;
        try {
            setLoading(true);
            const taskRef = ref(database, `tasks/${user.uid}/${updatedTask.id}`);

            const updates = {
                ...updatedTask,
                // Store deadline as string for database
                deadline: updatedTask.deadline.toISOString()
            };

            // Remove id as we don't need to store it in the value (it's the key)
            delete (updates as any).id;

            await update(taskRef, updates);

            // Sync updated task with calendar
            await syncTaskWithCalendar(updatedTask);
        } catch (error) {
            console.error('Error updating task:', error);
            Alert.alert('Error', 'Failed to update task. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const deleteTask = async (id: string) => {
        if (!user) return;
        try {
            setLoading(true);

            // Get the task to delete its calendar event
            const task = tasks.find(t => t.id === id);
            if (task?.calendarEventId) {
                await CalendarService.deleteEvent(task.calendarEventId);
            }

            // Delete the task from Firebase
            const taskRef = ref(database, `tasks/${user.uid}/${id}`);
            await remove(taskRef);
        } catch (error) {
            console.error('Error deleting task:', error);
            Alert.alert('Error', 'Failed to delete task. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const toggleTaskCompletion = async (id: string) => {
        if (!user) return;
        const task = tasks.find(t => t.id === id);
        if (!task) return;

        try {
            const taskRef = ref(database, `tasks/${user.uid}/${id}`);
            const updatedTask = {
                ...task,
                completed: !task.completed
            };

            await update(taskRef, { completed: updatedTask.completed });

            // Update the calendar event to reflect completion status
            if (task.calendarEventId) {
                await syncTaskWithCalendar(updatedTask);
            }
        } catch (error) {
            console.error('Error toggling task completion:', error);
            Alert.alert('Error', 'Failed to update task. Please try again.');
        }
    };

    const getTaskById = (id: string) => {
        return tasks.find(task => task.id === id);
    };

    return (
        <TaskContext.Provider value={{
            tasks,
            loading,
            addTask,
            updateTask,
            deleteTask,
            toggleTaskCompletion,
            getTaskById,
            syncTaskWithCalendar,
            isSyncing
        }}>
            {children}
        </TaskContext.Provider>
    );
}

// Custom hook to use the task context
export function useTaskContext() {
    const context = useContext(TaskContext);
    if (context === undefined) {
        throw new Error('useTaskContext must be used within a TaskProvider');
    }
    return context;
}