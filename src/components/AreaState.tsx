import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

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

    {/* Stats content */}
    <View style={styles.content}>
      <View style={styles.statsContainer}>
        <View style={styles.statsRow}>
          <View style={styles.statBlock}>
            <Text style={styles.label}>Total Bins</Text>
            <Text style={styles.value}>{stats.totalBins}</Text>
          </View>
          <View style={styles.statBlock}>
            <Text style={styles.label}>Priority Bins</Text>
            <Text style={[styles.value, styles.highlight]}>{stats.priorityBins}</Text>
          </View>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.statBlock}>
            <Text style={styles.label}>Average Fill</Text>
            <Text style={styles.value}>{stats.avgFill.toFixed(0)}%</Text>
          </View>
          <View style={styles.statBlock}>
            <Text style={styles.label}>Urgent Bins</Text>
            <Text style={[styles.value, 
              stats.urgentBins > 0 ? styles.urgent : null
            ]}>{stats.urgentBins}</Text>
          </View>
        </View>
      </View>

      {/* Visual fill level indicator */}
      <View style={styles.fillLevelContainer}>
        <Text style={styles.fillLevelLabel}>Area Fill Level</Text>
        <View style={styles.fillLevelBar}>
          <View 
            style={[
              styles.fillLevel, 
              { width: `${stats.avgFill}%`, backgroundColor: getFillLevelColor(stats.avgFill) }
            ]} 
          />
        </View>
      </View>

      {/* Create Route button */}
      <TouchableOpacity style={styles.button} onPress={onCreateRoute}>
        <MaterialIcons name="route" size={20} color="#fff" />
        <Text style={styles.buttonText}>Create Route</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const getFillLevelColor = (fillLevel: number) => {
  if (fillLevel >= 80) return '#FF3B30'; // Red
  if (fillLevel >= 60) return '#FF9500'; // Orange
  if (fillLevel >= 40) return '#FFCC00'; // Yellow
  return '#34C759'; // Green
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
  content: {
    padding: 16,
  },
  statsContainer: {
    marginBottom: 16,
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
  highlight: {
    color: '#3B82F6', // Blue for priority
  },
  urgent: {
    color: '#EF4444', // Red for urgent
  },
  fillLevelContainer: {
    marginBottom: 16,
  },
  fillLevelLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  fillLevelBar: {
    height: 10,
    backgroundColor: '#E5E7EB',
    borderRadius: 5,
    overflow: 'hidden',
  },
  fillLevel: {
    height: '100%',
  },
  button: {
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default AreaState;