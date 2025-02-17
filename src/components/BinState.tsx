import React from 'react';
import { View, Text, Button } from 'react-native';

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
  <View>
    <Text style={styles.title}>Bin Details</Text>
    <Text>Fill Level: {bin.fillLevel}%</Text>
    <Text>Last Collected: {new Date(bin.lastCollected).toLocaleDateString()}</Text>
    <Text>Location: {bin.location.coordinates.join(', ')}</Text>
    <Button title="Report Issue" onPress={() => onReportIssue(bin._id)} />
    <Button title="Close" onPress={onClose} />
  </View>
);

const styles = {
  title: { fontSize: 18, fontWeight: 'bold' as 'bold', marginBottom: 10 }
};

export default BinState;