import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface RouteDetailsProps {
  distance: string;  // e.g. "5.2 km"
  estimatedTime: string; // e.g. "25 min"
  binsCount: number;
  onStartRoute: () => void;
  onClose?: () => void;
  routeName?: string;
}

const RouteDetails = ({ 
  distance, 
  estimatedTime, 
  binsCount, 
  onStartRoute,
  onClose,
  routeName = 'Route Overview'
}: RouteDetailsProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Collection Route</Text>
        {onClose && (
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={onClose}
          >
            <MaterialIcons name="close" size={24} color="#111827" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <MaterialIcons name="route" size={24} color="#3B82F6" />
            <Text style={styles.statValue}>{distance}</Text>
            <Text style={styles.statLabel}>Total Distance</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statItem}>
            <MaterialIcons name="schedule" size={24} color="#3B82F6" />
            <Text style={styles.statValue}>{estimatedTime}</Text>
            <Text style={styles.statLabel}>Estimated Time</Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <MaterialIcons name="info" size={20} color="#3B82F6" />
            <Text style={styles.infoTitle}>Planning Mode</Text>
          </View>
          <Text style={styles.infoText}>
            Tap bins on the map to add or remove them from your route
          </Text>
          <View style={styles.binsCount}>
            <MaterialIcons name="delete" size={20} color="#6B7280" />
            <Text style={styles.binsCountText}>{binsCount} bins selected</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={[
            styles.actionButton,
            styles.startButton
          ]} 
          onPress={onStartRoute}
        >
          <MaterialIcons 
            name="directions" 
            size={20} 
            color="#fff" 
          />
          <Text style={styles.actionButtonText}>
            Start Route
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    color: '#111827',
    fontWeight: 'bold',
    fontSize: 18,
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    padding: 4,
  },
  content: {
    padding: 20,
  },
  statsCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  divider: {
    width: 1,
    height: '100%',
    backgroundColor: '#E5E7EB',
    marginHorizontal: 16,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  infoCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  binsCount: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    padding: 8,
    borderRadius: 8,
  },
  binsCountText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  startButton: {
    backgroundColor: '#10B981',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default RouteDetails;
