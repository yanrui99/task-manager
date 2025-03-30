import { useState } from 'react';
import { Task } from '@/types/task';
import { ref, update } from 'firebase/database';
import { database } from '@/config/firebase';
import { useAuth } from '@/context/AuthContext';
import CalendarService from '@/services/CalendarService';
import { Alert } from 'react-native';

export default function useCalendarSync() {
    const [syncing, setSyncing] = useState(false);
    const { user } = useAuth();

    // Synchronise a task with Google Calendar
    const syncTaskWithCalendar = async (task: Task): Promise<void> => {
        if (!user) return;

        try {
            setSyncing(true);

            // Check if task already has a calendar event ID
            if (task.calendarEventId) {
                // Update existing calendar event
                const success = await CalendarService.updateEvent(task, task.calendarEventId);
                if (!success) {
                    // If update fails, try to create a new event
                    const newEventId = await CalendarService.createEvent(task);
                    if (newEventId) {
                        // Update task with new calendar event ID
                        await updateTaskCalendarId(task.id, newEventId);
                    }
                }
            } else {
                // Create new calendar event
                const eventId = await CalendarService.createEvent(task);
                if (eventId) {
                    // Update task with calendar event ID
                    await updateTaskCalendarId(task.id, eventId);
                }
            }
        } catch (error) {
            console.error('Error syncing with calendar:', error);
        } finally {
            setSyncing(false);
        }
    };

    // Delete a task's calendar event
    const deleteTaskCalendarEvent = async (task: Task): Promise<void> => {
        if (!user || !task.calendarEventId) return;

        try {
            setSyncing(true);
            await CalendarService.deleteEvent(task.calendarEventId);
        } catch (error) {
            console.error('Error deleting calendar event:', error);
        } finally {
            setSyncing(false);
        }
    };

    // Update task in Firebase with calendar event ID
    const updateTaskCalendarId = async (taskId: string, eventId: string): Promise<void> => {
        if (!user) return;

        try {
            const taskRef = ref(database, `tasks/${user.uid}/${taskId}`);
            await update(taskRef, { calendarEventId: eventId });
        } catch (error) {
            console.error('Error updating task with calendar ID:', error);
        }
    };

    return {
        syncing,
        syncTaskWithCalendar,
        deleteTaskCalendarEvent
    };
}