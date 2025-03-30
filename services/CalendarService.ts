import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { Task } from '@/types/task';
import * as Localization from 'expo-localization';

// Map task categories to Google Calendar color IDs
// Google Calendar uses specific IDs for colors:
// https://developers.google.com/calendar/api/v3/reference/colors/get
const CATEGORY_COLOR_MAP: Record<string, string> = {
    work: '9',      // Blue
    personal: '10', // Green
    health: '6',    // Orange
    education: '5', // Purple
    finance: '2',   // Green-ish
};

class CalendarService {
    private baseUrl = 'https://www.googleapis.com/calendar/v3';

    // Get fresh access token from Google Sign-In
    private async getAccessToken(): Promise<string> {
        try {
            const { accessToken } = await GoogleSignin.getTokens();
            if (!accessToken) {
                throw new Error('No access token available');
            }
            return accessToken;
        } catch (error) {
            console.error('Error getting access token:', error);
            throw new Error('Failed to get access token');
        }
    }

    // Create a Google Calendar event from a task
    async createEvent(task: Task): Promise<string | null> {
        try {
            const accessToken = await this.getAccessToken();

            // Create a calendar event that ends 1 hour after the deadline
            const endTime = new Date(task.deadline);
            endTime.setHours(endTime.getHours() + 1);

            // Convert task to Google Calendar event format
            const event = {
                summary: task.title,
                description: `${task.description || ''}\n\nPriority: ${task.priority}\nCategory: ${task.category}`,
                start: {
                    dateTime: task.deadline.toISOString(),
                    timeZone: Localization.timezone || 'UTC',
                },
                end: {
                    dateTime: endTime.toISOString(),
                    timeZone: Localization.timezone || 'UTC',
                },
                colorId: CATEGORY_COLOR_MAP[task.category] || '1',
                // Add custom property to identify this as our app's event
                extendedProperties: {
                    private: {
                        appSource: 'TaskManagerApp',
                        taskId: task.id,
                    },
                },
            };

            // Make API request to create event
            const response = await fetch(`${this.baseUrl}/calendars/primary/events`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(event),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Calendar API error:', errorData);
                throw new Error(`Calendar API error: ${errorData.error?.message || 'Unknown error'}`);
            }

            const data = await response.json();
            return data.id; // Return the created event ID
        } catch (error) {
            console.error('Error creating calendar event:', error);
            return null;
        }
    }

    // Update an existing calendar event
    async updateEvent(task: Task, eventId: string): Promise<boolean> {
        try {
            const accessToken = await this.getAccessToken();

            // Create a calendar event that ends 1 hour after the deadline
            const endTime = new Date(task.deadline);
            endTime.setHours(endTime.getHours() + 1);

            // Convert task to Google Calendar event format
            const event = {
                summary: task.title,
                description: `${task.description || ''}\n\nPriority: ${task.priority}\nCategory: ${task.category}${task.completed ? '\nStatus: Completed' : ''}`,
                start: {
                    dateTime: task.deadline.toISOString(),
                    timeZone: Localization.timezone || 'UTC',
                },
                end: {
                    dateTime: endTime.toISOString(),
                    timeZone: Localization.timezone || 'UTC',
                },
                colorId: CATEGORY_COLOR_MAP[task.category] || '1',
                // Add custom property to identify this as our app's event
                extendedProperties: {
                    private: {
                        appSource: 'TaskManagerApp',
                        taskId: task.id,
                    },
                },
            };

            // Make API request to update event
            const response = await fetch(`${this.baseUrl}/calendars/primary/events/${eventId}`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(event),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Calendar API error:', errorData);
                throw new Error(`Calendar API error: ${errorData.error?.message || 'Unknown error'}`);
            }

            return true;
        } catch (error) {
            console.error('Error updating calendar event:', error);
            return false;
        }
    }

    // Delete a calendar event
    async deleteEvent(eventId: string): Promise<boolean> {
        try {
            const accessToken = await this.getAccessToken();

            // Make API request to delete event
            const response = await fetch(`${this.baseUrl}/calendars/primary/events/${eventId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            if (!response.ok && response.status !== 410) { // 410 means already deleted
                const errorData = await response.json();
                console.error('Calendar API error:', errorData);
                throw new Error(`Calendar API error: ${errorData.error?.message || 'Unknown error'}`);
            }

            return true;
        } catch (error) {
            console.error('Error deleting calendar event:', error);
            return false;
        }
    }
}

export default new CalendarService();