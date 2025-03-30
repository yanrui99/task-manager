import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text } from '@/components/Themed';
import Colors, { getColors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import { 
    CategoryFilter, 
    PriorityFilter, 
    DeadlineFilter, 
    SortOption, 
    useFilterContext 
} from '@/context/FilterContext';

export default function FilterControls() {
    const colorScheme = useColorScheme();
    const colors = getColors(colorScheme);
    const { 
        categoryFilter, 
        priorityFilter, 
        deadlineFilter, 
        sortOption,
        setCategoryFilter, 
        setPriorityFilter, 
        setDeadlineFilter, 
        setSortOption,
        resetFilters
    } = useFilterContext();

    // Helper function to check if any filter is active
    const isFilterActive = () => {
        return categoryFilter !== 'all' || 
               priorityFilter !== 'all' || 
               deadlineFilter !== 'all' || 
               sortOption !== 'deadline';
    };

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <Text style={styles.filterTitle}>Filters</Text>
                {isFilterActive() && (
                    <TouchableOpacity 
                        onPress={resetFilters} 
                        style={styles.resetButton}
                    >
                        <Text style={styles.resetText}>Reset</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Category Filter */}
            <Text style={styles.sectionTitle}>Category</Text>
            <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                style={styles.chipContainer}
            >
                <CategoryChip 
                    category="all" 
                    label="All" 
                    selected={categoryFilter === 'all'} 
                    onSelect={setCategoryFilter} 
                />
                <CategoryChip 
                    category="work" 
                    label="Work" 
                    selected={categoryFilter === 'work'} 
                    onSelect={setCategoryFilter} 
                />
                <CategoryChip 
                    category="personal" 
                    label="Personal" 
                    selected={categoryFilter === 'personal'} 
                    onSelect={setCategoryFilter} 
                />
                <CategoryChip 
                    category="health" 
                    label="Health" 
                    selected={categoryFilter === 'health'} 
                    onSelect={setCategoryFilter} 
                />
                <CategoryChip 
                    category="education" 
                    label="Education" 
                    selected={categoryFilter === 'education'} 
                    onSelect={setCategoryFilter} 
                />
                <CategoryChip 
                    category="finance" 
                    label="Finance" 
                    selected={categoryFilter === 'finance'} 
                    onSelect={setCategoryFilter} 
                />
            </ScrollView>

            {/* Priority Filter */}
            <Text style={styles.sectionTitle}>Priority</Text>
            <View style={styles.buttonRow}>
                <FilterButton 
                    label="All" 
                    selected={priorityFilter === 'all'} 
                    onPress={() => setPriorityFilter('all')} 
                />
                <FilterButton 
                    label="High" 
                    selected={priorityFilter === 'high'} 
                    onPress={() => setPriorityFilter('high')} 
                />
                <FilterButton 
                    label="Medium" 
                    selected={priorityFilter === 'medium'} 
                    onPress={() => setPriorityFilter('medium')} 
                />
                <FilterButton 
                    label="Low" 
                    selected={priorityFilter === 'low'} 
                    onPress={() => setPriorityFilter('low')} 
                />
            </View>

            {/* Deadline Filter */}
            <Text style={styles.sectionTitle}>Deadline</Text>
            <View style={styles.buttonRow}>
                <FilterButton 
                    label="All" 
                    selected={deadlineFilter === 'all'} 
                    onPress={() => setDeadlineFilter('all')} 
                />
                <FilterButton 
                    label="Today" 
                    selected={deadlineFilter === 'today'} 
                    onPress={() => setDeadlineFilter('today')} 
                />
                <FilterButton 
                    label="Upcoming" 
                    selected={deadlineFilter === 'upcoming'} 
                    onPress={() => setDeadlineFilter('upcoming')} 
                />
                <FilterButton 
                    label="Overdue" 
                    selected={deadlineFilter === 'overdue'} 
                    onPress={() => setDeadlineFilter('overdue')} 
                />
            </View>

            {/* Sort Option */}
            <Text style={styles.sectionTitle}>Sort By</Text>
            <View style={styles.buttonRow}>
                <FilterButton 
                    label="Deadline" 
                    selected={sortOption === 'deadline'} 
                    onPress={() => setSortOption('deadline')} 
                />
                <FilterButton 
                    label="Priority" 
                    selected={sortOption === 'priority'} 
                    onPress={() => setSortOption('priority')} 
                />
                <FilterButton 
                    label="A-Z" 
                    selected={sortOption === 'alphabetical'} 
                    onPress={() => setSortOption('alphabetical')} 
                />
            </View>
        </View>
    );
}

// Category chip component
function CategoryChip({ 
    category, 
    label, 
    selected, 
    onSelect 
}: { 
    category: CategoryFilter, 
    label: string, 
    selected: boolean, 
    onSelect: (category: CategoryFilter) => void 
}) {
    const colorScheme = useColorScheme();
    const colors = getColors(colorScheme);
    
    // Get the category color or default for "all"
    const getCategoryColor = () => {
        if (category === 'all') return colors.tabIconDefault;
        return colors.categories[category as keyof typeof colors.categories];
    };

    return (
        <TouchableOpacity 
            style={[
                styles.categoryChip,
                selected && { backgroundColor: getCategoryColor() },
                category === 'all' && selected && { backgroundColor: '#6B7280' }
            ]}
            onPress={() => onSelect(category)}
        >
            <Text 
                style={[
                    styles.categoryChipText,
                    selected && styles.categoryChipTextSelected
                ]}
            >
                {label}
            </Text>
        </TouchableOpacity>
    );
}

// Filter button component
function FilterButton({ 
    label, 
    selected, 
    onPress 
}: { 
    label: string, 
    selected: boolean, 
    onPress: () => void 
}) {
    return (
        <TouchableOpacity 
            style={[
                styles.filterButton,
                selected && styles.filterButtonSelected
            ]}
            onPress={onPress}
        >
            <Text 
                style={[
                    styles.filterButtonText,
                    selected && styles.filterButtonTextSelected
                ]}
            >
                {label}
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        marginVertical: 8,
        backgroundColor: 'transparent',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    filterTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    resetButton: {
        padding: 6,
    },
    resetText: {
        color: '#4285F4',
        fontWeight: '600',
    },
    sectionTitle: {
        fontSize: 14,
        marginTop: 12,
        marginBottom: 8,
        opacity: 0.7,
    },
    chipContainer: {
        flexDirection: 'row',
        marginBottom: 4,
    },
    categoryChip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        marginRight: 8,
        backgroundColor: '#F3F4F6',
    },
    categoryChipText: {
        fontSize: 14,
        color: '#4B5563',
    },
    categoryChipTextSelected: {
        color: 'white',
        fontWeight: '500',
    },
    buttonRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 8,
    },
    filterButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 4,
        marginRight: 8,
        marginBottom: 8,
        backgroundColor: '#F3F4F6',
    },
    filterButtonSelected: {
        backgroundColor: '#4285F4',
    },
    filterButtonText: {
        fontSize: 14,
        color: '#4B5563',
    },
    filterButtonTextSelected: {
        color: 'white',
        fontWeight: '500',
    },
});