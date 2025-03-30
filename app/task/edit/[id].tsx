import { Stack, router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, ScrollView, Pressable, TextInput } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useState, useEffect } from 'react';
import Colors, { getColors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useTaskContext } from '@/context/TaskContext';
import CustomDateTimePicker from '@/components/DateTimePicker';

// Predefined categories and priorities
const CATEGORIES = ['work', 'personal', 'health', 'education', 'finance'];
const PRIORITIES = ['high', 'medium', 'low'];

export default function EditTaskScreen() {
    const { id } = useLocalSearchParams();
    const colorScheme = useColorScheme();
    const colors = getColors(colorScheme);
    const { getTaskById, updateTask } = useTaskContext();

    // Get task by id
    const task = getTaskById(id as string);

    // State for form fields
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [priority, setPriority] = useState('');
    const [deadline, setDeadline] = useState(new Date());

    // Load task data into form
    useEffect(() => {
        if (task) {
            setTitle(task.title);
            setDescription(task.description || '');
            setCategory(task.category);
            setPriority(task.priority);
            setDeadline(new Date(task.deadline));
        }
    }, [task]);

    // Handle form submission
    const handleUpdateTask = () => {
        if (!task) return;

        updateTask({
            ...task,
            title,
            description,
            category: category as 'work' | 'personal' | 'health' | 'education' | 'finance',
            priority: priority as 'high' | 'medium' | 'low',
            deadline
        });

        router.back();
    };

    // If task not found
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

    return (
        <ScrollView style={styles.container}>
            <Stack.Screen options={{ title: 'Edit Task' }} />

            <View style={styles.formField}>
                <Text style={styles.label}>Title</Text>
                <TextInput
                    style={styles.textInput}
                    value={title}
                    onChangeText={setTitle}
                    placeholder="Enter task title"
                />
            </View>

            <View style={styles.formField}>
                <Text style={styles.label}>Description</Text>
                <TextInput
                    style={[styles.textInput, styles.textArea]}
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Enter task description"
                    multiline
                    numberOfLines={4}
                />
            </View>

            <View style={styles.formField}>
                <Text style={styles.label}>Category</Text>
                <View style={styles.optionsContainer}>
                    {CATEGORIES.map(cat => (
                        <Pressable
                            key={cat}
                            style={[
                                styles.optionButton,
                                category === cat && styles.selectedOption,
                                { borderColor: colors.categories[cat as keyof typeof colors.categories] }
                            ]}
                            onPress={() => setCategory(cat)}>
                            <Text
                                style={[
                                    styles.optionText,
                                    category === cat && styles.selectedOptionText,
                                    {
                                        color: category === cat
                                            ? colors.categories[cat as keyof typeof colors.categories]
                                            : '#333'
                                    }
                                ]}>
                                {cat}
                            </Text>
                        </Pressable>
                    ))}
                </View>
            </View>

            <View style={styles.formField}>
                <Text style={styles.label}>Priority</Text>
                <View style={styles.optionsContainer}>
                    {PRIORITIES.map(pri => (
                        <Pressable
                            key={pri}
                            style={[
                                styles.optionButton,
                                priority === pri && styles.selectedOption,
                                { borderColor: colors.priority[pri as keyof typeof colors.priority] }
                            ]}
                            onPress={() => setPriority(pri)}>
                            <Text
                                style={[
                                    styles.optionText,
                                    priority === pri && styles.selectedOptionText,
                                    {
                                        color: priority === pri
                                            ? colors.priority[pri as keyof typeof colors.priority]
                                            : '#333'
                                    }
                                ]}>
                                {pri}
                            </Text>
                        </Pressable>
                    ))}
                </View>
            </View>

            <CustomDateTimePicker
                value={deadline}
                onChange={setDeadline}
                label="Deadline"
            />

            <Pressable
                style={[
                    styles.button,
                    { backgroundColor: title.trim() ? colors.tint : '#ccc' }
                ]}
                disabled={!title.trim()}
                onPress={handleUpdateTask}>
                <Text style={styles.buttonText}>Update Task</Text>
            </Pressable>
        </ScrollView>
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
    formField: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    textInput: {
        backgroundColor: '#f5f5f5',
        borderRadius: 4,
        padding: 12,
        fontSize: 16,
    },
    textArea: {
        minHeight: 100,
        textAlignVertical: 'top',
    },
    optionsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -4,
    },
    optionButton: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
        borderWidth: 1,
        margin: 4,
    },
    selectedOption: {
        backgroundColor: '#f0f0f0',
    },
    optionText: {
        fontSize: 14,
    },
    selectedOptionText: {
        fontWeight: 'bold',
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