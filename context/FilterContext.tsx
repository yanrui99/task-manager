import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Task } from '@/types/task';

// Define filter and sort types
export type CategoryFilter = 'all' | 'work' | 'personal' | 'health' | 'education' | 'finance';
export type PriorityFilter = 'all' | 'high' | 'medium' | 'low';
export type DeadlineFilter = 'all' | 'today' | 'upcoming' | 'overdue';
export type SortOption = 'deadline' | 'priority' | 'alphabetical';

// Define the context type
type FilterContextType = {
    categoryFilter: CategoryFilter;
    priorityFilter: PriorityFilter;
    deadlineFilter: DeadlineFilter;
    sortOption: SortOption;
    setCategoryFilter: (filter: CategoryFilter) => void;
    setPriorityFilter: (filter: PriorityFilter) => void;
    setDeadlineFilter: (filter: DeadlineFilter) => void;
    setSortOption: (option: SortOption) => void;
    resetFilters: () => void;
    filterTasks: (tasks: Task[]) => Task[];
};

// Create the context
const FilterContext = createContext<FilterContextType | undefined>(undefined);

// Provider component
export function FilterProvider({ children }: { children: ReactNode }) {
    const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
    const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all');
    const [deadlineFilter, setDeadlineFilter] = useState<DeadlineFilter>('all');
    const [sortOption, setSortOption] = useState<SortOption>('deadline');

    // Reset all filters to default values
    const resetFilters = () => {
        setCategoryFilter('all');
        setPriorityFilter('all');
        setDeadlineFilter('all');
        setSortOption('deadline');
    };

    // Filter tasks based on current filter settings
    const filterTasks = (tasks: Task[]): Task[] => {
        let filteredTasks = [...tasks];
        
        // Apply category filter
        if (categoryFilter !== 'all') {
            filteredTasks = filteredTasks.filter(task => task.category === categoryFilter);
        }
        
        // Apply priority filter
        if (priorityFilter !== 'all') {
            filteredTasks = filteredTasks.filter(task => task.priority === priorityFilter);
        }
        
        // Apply deadline filter
        if (deadlineFilter !== 'all') {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            
            const nextWeek = new Date(today);
            nextWeek.setDate(nextWeek.getDate() + 7);
            
            switch (deadlineFilter) {
                case 'today':
                    filteredTasks = filteredTasks.filter(task => {
                        const taskDate = new Date(task.deadline);
                        taskDate.setHours(0, 0, 0, 0);
                        return taskDate.getTime() === today.getTime();
                    });
                    break;
                case 'upcoming':
                    filteredTasks = filteredTasks.filter(task => {
                        const taskDate = new Date(task.deadline);
                        taskDate.setHours(0, 0, 0, 0);
                        return taskDate.getTime() > today.getTime() && taskDate.getTime() <= nextWeek.getTime();
                    });
                    break;
                case 'overdue':
                    filteredTasks = filteredTasks.filter(task => {
                        const taskDate = new Date(task.deadline);
                        taskDate.setHours(0, 0, 0, 0);
                        return taskDate.getTime() < today.getTime() && !task.completed;
                    });
                    break;
            }
        }
        
        // Apply sorting
        switch (sortOption) {
            case 'deadline':
                filteredTasks.sort((a, b) => {
                    return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
                });
                break;
            case 'priority':
                const priorityOrder = { high: 0, medium: 1, low: 2 };
                filteredTasks.sort((a, b) => {
                    return priorityOrder[a.priority] - priorityOrder[b.priority];
                });
                break;
            case 'alphabetical':
                filteredTasks.sort((a, b) => a.title.localeCompare(b.title));
                break;
        }
        
        return filteredTasks;
    };

    return (
        <FilterContext.Provider value={{
            categoryFilter,
            priorityFilter,
            deadlineFilter,
            sortOption,
            setCategoryFilter,
            setPriorityFilter,
            setDeadlineFilter,
            setSortOption,
            resetFilters,
            filterTasks
        }}>
            {children}
        </FilterContext.Provider>
    );
}

// Custom hook to use the filter context
export function useFilterContext() {
    const context = useContext(FilterContext);
    if (context === undefined) {
        throw new Error('useFilterContext must be used within a FilterProvider');
    }
    return context;
}