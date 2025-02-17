import React from 'react';
import { Marker } from 'react-native-maps';
import { Image } from 'react-native';

const LocationMarker = () => {
  // Example coordinates for the user's location
  const location = {
    latitude: 40.748,
    longitude: -73.98
  };

  return (
    <Marker
      coordinate={location}
      pinColor="blue"
    >
      <Image
        source={require('../assets/location.png')}
        style={{ width: 20, height: 20 }}
      />
    </Marker>
  );
};

export default LocationMarker;