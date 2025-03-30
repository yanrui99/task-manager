import React, { useState } from 'react';
import { StyleSheet, Modal, View, Text, Pressable, Platform } from 'react-native';
import { useColorScheme } from '@/components/useColorScheme';
import { getColors } from '@/constants/Colors';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import DateTimePicker from '@react-native-community/datetimepicker';

interface DateTimePickerProps {
    value: Date;
    onChange: (date: Date) => void;
    label?: string;
}

export default function CustomDateTimePicker({ value, onChange, label = 'Deadline' }: DateTimePickerProps) {
    const colorScheme = useColorScheme();
    const colors = getColors(colorScheme);

    const [show, setShow] = useState(false);
    const [tempDate, setTempDate] = useState(value);

    const handlePress = () => {
        setTempDate(value);
        setShow(true);
    };

    const handleChange = (_: any, selectedDate?: Date) => {
        if (Platform.OS === 'android') {
            setShow(false);
            if (selectedDate) {
                onChange(selectedDate);
            }
        } else {
            setTempDate(selectedDate || value);
        }
    };

    const handleCancel = () => {
        setShow(false);
    };

    const handleConfirm = () => {
        setShow(false);
        onChange(tempDate);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>
            <Pressable
                style={styles.dateButton}
                onPress={handlePress}
            >
                <Text style={styles.dateText}>{value.toLocaleDateString()}</Text>
                <FontAwesome name="calendar" size={16} color="#666" />
            </Pressable>

            {show && (
                Platform.OS === 'ios' ? (
                    <Modal
                        transparent={true}
                        visible={show}
                        animationType="slide"
                    >
                        <View style={styles.modalContainer}>
                            <View style={styles.modalContent}>
                                <View style={styles.pickerHeader}>
                                    <Pressable onPress={handleCancel}>
                                        <Text style={styles.cancelButton}>Cancel</Text>
                                    </Pressable>
                                    <Text style={styles.pickerTitle}>Select Date</Text>
                                    <Pressable onPress={handleConfirm}>
                                        <Text style={[styles.confirmButton, { color: colors.tint }]}>Done</Text>
                                    </Pressable>
                                </View>
                                <DateTimePicker
                                    value={tempDate}
                                    mode="date"
                                    display="spinner"
                                    onChange={handleChange}
                                    style={styles.datePicker}
                                />
                            </View>
                        </View>
                    </Modal>
                ) : (
                    <DateTimePicker
                        value={tempDate}
                        mode="date"
                        display="default"
                        onChange={handleChange}
                    />
                )
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    dateButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 4,
        padding: 12,
    },
    dateText: {
        fontSize: 16,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        padding: 20,
    },
    pickerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    pickerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    cancelButton: {
        fontSize: 16,
        color: '#999',
    },
    confirmButton: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    datePicker: {
        height: 200,
    },
});