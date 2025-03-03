import React, { useState } from 'react';
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
  console.log('RouteDetails: Component rendering', {
    distance,
    estimatedTime,
    binsCount,
    routeName
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Route Overview</Text>
        {onClose && (
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={() => {
              console.log('RouteDetails: Close button pressed');
              onClose();
            }}
          >
            <MaterialIcons name="close" size={24} color="black" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.statsRow}>
          <View style={styles.statBlock}>
            <Text style={styles.label}>Total Distance</Text>
            <Text style={styles.value}>{distance}</Text>
          </View>
          <View style={styles.statBlock}>
            <Text style={styles.label}>Estimated Time</Text>
            <Text style={styles.value}>{estimatedTime}</Text>
          </View>
        </View>

        <View style={styles.editTip}>
          <MaterialIcons name="info-outline" size={16} color="#3B82F6" />
          <Text style={styles.tipText}>
            Tap bins on map to add or remove them from route
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.startButton} 
          onPress={() => {
            console.log('RouteDetails: Start route button pressed');
            onStartRoute();
          }}
        >
          <Text style={styles.buttonText}>Start Route</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 20,
    borderRadius: 16,
    backgroundColor: '#fff',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    padding: 16,
    paddingVertical: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#fff',
  },
  headerTitle: {
    color: '#111827',
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    right: 12,
    top: 14,
    padding: 4,
  },
  content: {
    padding: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  statBlock: {
    alignItems: 'center',
    flex: 1,
    padding: 8,
  },
  label: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  value: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  startButton: {
    backgroundColor: '#10B981', // Green like in AreaState
    paddingVertical: 14,
    marginTop: 16,
    borderRadius: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  editTip: {
    backgroundColor: '#EBF5FF',
    padding: 10,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  tipText: {
    color: '#3B82F6',
    marginLeft: 6,
    fontSize: 14,
  },
});

export default RouteDetails;
