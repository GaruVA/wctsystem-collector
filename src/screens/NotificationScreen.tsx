import React from 'react';
import { View, StyleSheet, Text, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const NotificationScreen = () => {
  // Placeholder for notifications
  const notifications = []; // This will be replaced with real notifications later

  return (
    <View style={styles.container}>
      {notifications.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialIcons name="notifications-none" size={48} color="#9CA3AF" />
          <Text style={styles.emptyTitle}>No Notifications</Text>
          <Text style={styles.emptyText}>You'll see your notifications here</Text>
        </View>
      ) : (
        <ScrollView style={styles.content}>
          {/* Notifications will be rendered here */}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
});

export default NotificationScreen;
