import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface RouteDetailsProps {
  distance: string;
  estimatedTime: string;
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
        <Text style={styles.headerTitle}>{routeName}</Text>
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

      {/* Route details content */}
      <View style={styles.content}>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Total Distance</Text>
          <Text style={styles.value}>{distance}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.label}>Estimated Time</Text>
          <Text style={styles.value}>{estimatedTime}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.label}>Bins to Collect</Text>
          <Text style={styles.value}>{binsCount}</Text>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    margin: 16
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
    padding: 20,
    paddingBottom: 24,
  },
  detailRow: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 6,
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  startButton: {
    backgroundColor: '#10B981', // Green color for start button
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 10,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  }
});

export default RouteDetails;
