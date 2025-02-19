import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

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

const getHeaderColor = (fillLevel: number) => {
  if (fillLevel > 70) return "#FF0000"; // Red
  if (fillLevel > 30) return "#FFD700"; // Yellow
  return "#00B050"; // Green
};

const BinState = ({ bin, onReportIssue, onClose }: BinStateProps) => (
  <View style={styles.container}>
    {/* Header with dynamic background color */}
    <View style={[styles.header, { backgroundColor: getHeaderColor(bin.fillLevel) }]}>
      <Text style={styles.headerTitle}>Bin Details</Text>
      <TouchableOpacity onPress={onClose} style={styles.closeButton}>
        <Ionicons name="close" size={24} color="#fff" />
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
        <Text style={styles.value}>
          {new Date(bin.lastCollected).toLocaleDateString()}
        </Text>
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
    // backgroundColor is now dynamic
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  closeButton: {
    padding: 4,
  },
  detailsContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
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
    backgroundColor: '#10B981',
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

export default BinState;