import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface AreaStats {
  totalBins: number;
  priorityBins: number;
  avgFill: number;
  urgentBins: number;
}

interface AreaStateProps {
  stats: AreaStats;
  onCreateRoute: () => void;
  areaName?: string;
}

const AreaState = ({ stats, onCreateRoute, areaName }: AreaStateProps) => (
  <View style={styles.container}>
    {/* Header with area name */}
    <View style={styles.header}>
      <Text style={styles.headerTitle}>{areaName || 'Area Overview'}</Text>
    </View>

    {/* Details */}
    <View style={styles.detailsContainer}>
      <View style={styles.detailRow}>
        <Text style={styles.label}>Total Bins</Text>
        <Text style={styles.value}>{stats.totalBins}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.label}>Priority Bins</Text>
        <Text style={styles.value}>{stats.priorityBins}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.label}>Average Fill Level</Text>
        <Text style={styles.value}>{stats.avgFill.toFixed(0)}%</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.label}>Urgent Bins</Text>
        <Text style={styles.value}>{stats.urgentBins}</Text>
      </View>
    </View>

    {/* Prominent Create Route button */}
    <TouchableOpacity style={styles.button} onPress={onCreateRoute}>
      <Text style={styles.buttonText}>Create Route</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  header: {
    // Similar to BinState header but centered without extra buttons
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
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

export default AreaState;