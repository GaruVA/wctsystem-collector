import React from 'react';
import { Marker } from 'react-native-maps';
import { Image } from 'react-native';

const LocationMarker = () => {
  const location = {
    latitude: 37.78825,
    longitude: -122.4324
  };

  return (
    <Marker
      coordinate={location}
      pinColor="blue"
    >
      <Image
        source={require('../assets/location.png')}
        style={{ width: 30, height: 30 }}
      />
    </Marker>
  );
};

export default LocationMarker;