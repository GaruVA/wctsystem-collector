import React from 'react';
import { View, Text, Button } from 'react-native';

interface AreaStats {
  totalBins: number;
  priorityBins: number;
  avgFill: number;
  urgentBins: number;
}

interface AreaStateProps {
  stats: AreaStats;
  onCreateRoute: () => void;
}

const AreaState = ({ stats, onCreateRoute }: AreaStateProps) => (
  <View>
    <Text style={styles.title}>Area Overview</Text>
    <Text>Total Bins: {stats.totalBins}</Text>
    <Text>Priority Bins: {stats.priorityBins}</Text>
    <Text>Average Fill: {stats.avgFill.toFixed(2)}%</Text>
    <Text>Urgent Bins: {stats.urgentBins}</Text>
    <Button title="Create Route" onPress={onCreateRoute} />
  </View>
);

const styles = {
  title: { fontSize: 18, fontWeight: 'bold' as 'bold', marginBottom: 10 }
};

export default AreaState;