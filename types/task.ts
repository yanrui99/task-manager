export interface Task {
    id: string;
    title: string;
    description?: string;
    category: 'work' | 'personal' | 'health' | 'education' | 'finance';
    priority: 'high' | 'medium' | 'low';
    completed: boolean;
    deadline: Date;
    calendarEventId?: string;
}