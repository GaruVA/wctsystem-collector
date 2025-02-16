import React, { memo } from 'react';
import { Marker } from 'react-native-maps';
import { Image } from 'react-native';

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

const BinMarker = ({ bin, onPress }: { bin: Bin; onPress: () => void }) => {
  const getMarkerColor = (fillLevel: number) => {
    if (fillLevel > 70) return require('../assets/red-bin.png');
    if (fillLevel > 30) return require('../assets/yellow-bin.png');
    return require('../assets/green-bin.png');
  };

  return (
    <Marker
      coordinate={{
        latitude: bin.location.coordinates[1],
        longitude: bin.location.coordinates[0]
      }}
      onPress={onPress}
    >
      <Image
        source={getMarkerColor(bin.fillLevel)}
        style={{ width: 30, height: 30 }}
      />
    </Marker>
  );
};

export default memo(BinMarker);