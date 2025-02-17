import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons'; // Added import for icon

interface Bin {
  _id: string;
  location: {
    type: string;
    coordinates: [number, number];
  };
  fillLevel: number;
  lastCollected: string;
}

interface BinStateProps {
  bin: Bin;
  onReportIssue: (binId: string) => void;
  onClose: () => void;
}

const BinState = ({ bin, onReportIssue, onClose }: BinStateProps) => (
  <View style={styles.container}>
    {/* Header with title and close button */}
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Bin Details</Text>
      <TouchableOpacity onPress={onClose} style={styles.closeButton}>
        <Text>
          <Ionicons name="close" size={24} color="#1F2937" />
        </Text>
      </TouchableOpacity>
    </View>

    {/* Details */}
    <View style={styles.detailsContainer}>
      <View style={styles.detailRow}>
        <Text style={styles.label}>Fill Level</Text>
        <Text style={styles.value}>{bin.fillLevel}%</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.label}>Address</Text>
        <Text style={styles.value}>{bin.location.coordinates.join(', ')}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.label}>Last Pickup Date</Text>
        <Text style={styles.value}>{new Date(bin.lastCollected).toLocaleDateString()}</Text>
      </View>
    </View>

    {/* Report Issue button */}
    <TouchableOpacity style={styles.button} onPress={() => onReportIssue(bin._id)}>
      <Text style={styles.buttonText}>Report Issue</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  detailsContainer: {
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: '#6B7280',
  },
  value: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  button: {
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default BinState;