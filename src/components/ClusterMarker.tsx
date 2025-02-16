import React from 'react';
import { Marker } from 'react-native-maps';
import { View, Text, Image } from 'react-native';

interface Cluster {
  geometry: {
    coordinates: [number, number];
  };
  properties: {
    cluster: Bin[];
    point_count: number;
  };
}

interface Bin {
  _id: string;
  location: {
    type: string;
    coordinates: [number, number];
  };
  fillLevel: number;
  lastCollected: string;
  status: string;
}

const ClusterMarker = ({ cluster, onPress }: { cluster: Cluster; onPress: () => void }) => {
  const { geometry, properties } = cluster;
  const averageFill = Math.round(properties.cluster.reduce((sum, bin) =>
    sum + bin.fillLevel, 0) / properties.point_count);

  return (
    <Marker
      coordinate={{
        latitude: geometry.coordinates[1],
        longitude: geometry.coordinates[0]
      }}
      onPress={onPress}
    >
      <View style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', padding: 5, borderRadius: 15 }}>
        <Text>{averageFill}%</Text>
        <Text>{properties.point_count}</Text>
      </View>
    </Marker>
  );
};

export default ClusterMarker;