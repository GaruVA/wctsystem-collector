import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
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
  isLoading?: boolean;
}

const AreaState = ({ stats, onCreateRoute, areaName, isLoading }: AreaStateProps) => (
  <View style={styles.container}>
    <View style={styles.header}>
      <Text style={styles.headerTitle}>{areaName || 'Area Overview'}</Text>
    </View>

    <View style={styles.content}>
      {/* Area Fill Level Card */}
      <View style={styles.fillLevelCard}>
        <View style={styles.fillLevelHeader}>
          <MaterialIcons name="analytics" size={20} color="#3B82F6" />
          <Text style={styles.fillLevelTitle}>Area Fill Level</Text>
        </View>
        
        <View style={styles.fillLevelBarContainer}>
          <View 
            style={[
              styles.fillLevelBar, 
              { width: `${stats.avgFill}%`, backgroundColor: getFillLevelColor(stats.avgFill) }
            ]} 
          />
        </View>
        <Text style={styles.fillLevelText}>{stats.avgFill.toFixed(0)}% average fill</Text>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <MaterialIcons name="delete" size={24} color="#3B82F6" />
          <Text style={styles.statValue}>{stats.totalBins}</Text>
          <Text style={styles.statLabel}>Total Bins</Text>
        </View>

        <View style={styles.statItem}>
          <MaterialIcons name="priority-high" size={24} color="#F59E0B" />
          <Text style={[styles.statValue, { color: '#F59E0B' }]}>{stats.priorityBins}</Text>
          <Text style={styles.statLabel}>Priority</Text>
        </View>

        <View style={styles.statItem}>
          <MaterialIcons name="warning" size={24} color="#EF4444" />
          <Text style={[styles.statValue, { color: '#EF4444' }]}>{stats.urgentBins}</Text>
          <Text style={styles.statLabel}>Urgent</Text>
        </View>
      </View>

      {/* Route Creation Button */}
      <TouchableOpacity 
        style={[styles.createRouteButton, isLoading && styles.buttonDisabled]}
        onPress={onCreateRoute}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <MaterialIcons name="map" size={20} color="#fff" />
            <Text style={styles.buttonText}>Create Collection Route</Text>
          </>
        )}
      </TouchableOpacity>

      
    </View>
  </View>
);

const getFillLevelColor = (fillLevel: number) => {
  if (fillLevel >= 80) return '#EF4444'; // Red
  if (fillLevel >= 60) return '#F59E0B'; // Orange
  if (fillLevel >= 40) return '#FBBF24'; // Yellow
  return '#10B981'; // Green
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    paddingVertical: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    color: '#111827',
    fontWeight: 'bold',
    fontSize: 18,
  },
  content: {
    padding: 16,
  },
  fillLevelCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  fillLevelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  fillLevelTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 8,
  },
  fillLevelBarContainer: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  fillLevelBar: {
    height: '100%',
  },
  fillLevelText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    minWidth: 100,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  createRouteButton: {
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoTip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF5FF',
    padding: 12,
    borderRadius: 8,
  },
  tipText: {
    color: '#3B82F6',
    marginLeft: 8,
    fontSize: 14,
  },
});

export default AreaState;