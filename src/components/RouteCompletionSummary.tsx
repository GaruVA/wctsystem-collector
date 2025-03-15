import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface Props {
  collectedBinsCount: number;
  totalBinsCount: number;
  totalDistance: string;
  totalDuration: string;
  averageTimePerBin: string;
  startTime: string;
  endTime: string;
  routeEfficiencyScore: number;
  onComplete: () => void;
}

const RouteCompletionSummary = ({
  collectedBinsCount,
  totalBinsCount,
  totalDistance,
  totalDuration,
  averageTimePerBin,
  startTime,
  endTime,
  routeEfficiencyScore,
  onComplete,
}: Props) => {
  const getScoreColor = (score: number) => {
    if (score >= 90) return '#10B981';
    if (score >= 70) return '#3B82F6';
    if (score >= 50) return '#F59E0B';
    return '#EF4444';
  };

  return (
    <View style={styles.container}>
      <View style={styles.contentWrapper}>
        <View style={styles.mainContent}>
          <View style={styles.header}>
            <MaterialIcons name="check-circle" size={40} color="#10B981" />
            <Text style={styles.title}>Route Complete!</Text>
            <Text style={styles.subtitle}>Great job completing your collection route</Text>
          </View>

          <View style={styles.scoreCard}>
            <Text style={styles.scoreTitle}>Route Efficiency Score</Text>
            <View style={styles.scoreCircle}>
              <Text style={[styles.scoreValue, { color: getScoreColor(routeEfficiencyScore) }]}>
                {routeEfficiencyScore}
              </Text>
              <Text style={styles.scoreLabel}>points</Text>
            </View>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <MaterialIcons name="delete" size={24} color="#3B82F6" />
                <Text style={styles.statValue}>{collectedBinsCount}/{totalBinsCount}</Text>
                <Text style={styles.statLabel}>Bins Collected</Text>
              </View>
              <View style={styles.statBox}>
                <MaterialIcons name="route" size={24} color="#3B82F6" />
                <Text style={styles.statValue}>{totalDistance}</Text>
                <Text style={styles.statLabel}>Distance</Text>
              </View>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <MaterialIcons name="schedule" size={24} color="#3B82F6" />
                <Text style={styles.statValue}>{totalDuration}</Text>
                <Text style={styles.statLabel}>Duration</Text>
              </View>
              <View style={styles.statBox}>
                <MaterialIcons name="speed" size={24} color="#3B82F6" />
                <Text style={styles.statValue}>{averageTimePerBin}</Text>
                <Text style={styles.statLabel}>Per Bin</Text>
              </View>
            </View>
          </View>

          <View style={styles.timeCard}>
            <View style={styles.timeHeader}>
              <MaterialIcons name="access-time" size={20} color="#3B82F6" />
              <Text style={styles.timeTitle}>Route Timeline</Text>
            </View>
            <View style={styles.timeRow}>
              <View style={styles.timeItem}>
                <Text style={styles.timeLabel}>Started</Text>
                <Text style={styles.timeValue}>{startTime}</Text>
              </View>
              <MaterialIcons name="arrow-forward" size={20} color="#9CA3AF" />
              <View style={styles.timeItem}>
                <Text style={styles.timeLabel}>Completed</Text>
                <Text style={styles.timeValue}>{endTime}</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.completeButton} 
        onPress={onComplete}
        activeOpacity={0.8}
      >
        <MaterialIcons name="home" size={20} color="#fff" />
        <Text style={styles.buttonText}>Back to Home</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentWrapper: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  mainContent: {
    width: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 4,
  },
  scoreCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  scoreCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  scoreLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  statsContainer: {
    gap: 12,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
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
  timeCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  timeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  timeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 8,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  timeItem: {
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  timeValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  completeButton: {
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default RouteCompletionSummary;