import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CalendarSyncStatusProps {
    isSyncing: boolean;
    hasSynced: boolean;
}

export default function CalendarSyncStatus({ isSyncing, hasSynced }: CalendarSyncStatusProps) {
    if (!isSyncing && !hasSynced) return null;

    return (
        <View style={styles.container}>
            {isSyncing ? (
                <>
                    <ActivityIndicator size="small" color="#4285F4" />
                    <Text style={styles.text}>Syncing to calendar...</Text>
                </>
            ) : hasSynced ? (
                <>
                    <Ionicons name="checkmark-circle" size={16} color="#34A853" />
                    <Text style={styles.text}>Synced to calendar</Text>
                </>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 4,
        paddingHorizontal: 8,
        backgroundColor: '#f0f0f0',
        borderRadius: 4,
        alignSelf: 'flex-start',
        marginTop: 8,
    },
    text: {
        fontSize: 12,
        marginLeft: 4,
        color: '#666',
    },
});