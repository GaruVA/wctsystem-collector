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
  
  const [binsExpanded, setBinsExpanded] = useState(false);

  return (
    <View style={styles.container}>
      {/* Header with route name and close button */}
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

      {/* Stats in two rows */}
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
      
      <View style={styles.binsSection}>
        <View style={styles.binsHeader}>
          <Text style={styles.label}>Bins to Collect</Text>
          <Text style={styles.value}>{binsCount}</Text>
        </View>
        <TouchableOpacity 
          style={styles.expandButton} 
          onPress={() => {
            console.log('RouteDetails: Toggle bins expanded', !binsExpanded);
            setBinsExpanded(!binsExpanded);
          }}
        >
          <Text style={styles.expandButtonText}>
            {binsExpanded ? 'Hide Bins' : 'Show Bins'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Green Start button */}
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
  );
};

const styles = StyleSheet.create({
  container: {
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
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    right: 12,
    top: 10,
    padding: 4,
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
  },
  label: {
    fontSize: 12,
    color: '#6B7280',
  },
  value: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginTop: 4,
  },
  binsSection: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingHorizontal: 16,
  },
  binsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  expandButton: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'center',
  },
  expandButtonText: {
    color: '#4B5563',
    fontSize: 14,
    fontWeight: '500',
  },
  startButton: {
    backgroundColor: '#10B981', // Green color for start button (similar to success)
    paddingVertical: 14,
    margin: 16,
    borderRadius: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default RouteDetails;
