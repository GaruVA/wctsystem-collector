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

    {/* Stats in two rows */}
    <View style={styles.statsRow}>
      <View style={styles.statBlock}>
        <Text style={styles.label}>Total Bins</Text>
        <Text style={styles.value}>{stats.totalBins}</Text>
      </View>
      <View style={styles.statBlock}>
        <Text style={styles.label}>Priority Bins</Text>
        <Text style={styles.value}>{stats.priorityBins}</Text>
      </View>
    </View>
    <View style={styles.statsRow}>
      <View style={styles.statBlock}>
        <Text style={styles.label}>Average Fill Level</Text>
        <Text style={styles.value}>{stats.avgFill.toFixed(0)}%</Text>
      </View>
      <View style={styles.statBlock}>
        <Text style={styles.label}>Urgent Bins</Text>
        <Text style={styles.value}>{stats.urgentBins}</Text>
      </View>
    </View>

    {/* Create Route button */}
    <TouchableOpacity style={styles.button} onPress={onCreateRoute}>
      <Text style={styles.buttonText}>Create Route</Text>
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
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
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

export default AreaState;