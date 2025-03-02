import React from 'react';
import { Marker } from 'react-native-maps';
import { Image } from 'react-native';

interface DumpLocationProps {
  coordinate: {
    latitude: number;
    longitude: number;
  };
}

const DumpLocation = ({ coordinate }: DumpLocationProps) => {
  return (
    <Marker
      coordinate={coordinate}
      title="Dump Location"
    >
      <Image
        source={require('../assets/dump-location.png')}
        style={{ width: 30, height: 30 }}
      />
    </Marker>
  );
};

export default DumpLocation;
