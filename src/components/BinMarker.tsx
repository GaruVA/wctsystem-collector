import React from 'react';
import { Marker } from 'react-native-maps';
import { View, StyleSheet } from 'react-native';

interface Bin {
  _id: string;
  location: {
    type: string;
    coordinates: [number, number]; // [longitude, latitude]
  };
  fillLevel: number;
  lastCollected: string;
}

interface BinMarkerProps {
  bin: Bin;
  onPress?: () => void;
}

const BinMarker = ({ bin, onPress }: BinMarkerProps) => {
  console.log(`BinMarker: Rendering bin ${bin._id} with fill level ${bin.fillLevel}%`);
  
  // Determine color based on fill level
  const getFillColor = (fillLevel: number) => {
    console.log(`BinMarker: Determining color for fill level ${fillLevel}`);
    if (fillLevel >= 95) return '#FF3B30'; // Red for urgent
    if (fillLevel >= 70) return '#FF9500'; // Orange for priority
    if (fillLevel >= 40) return '#FFCC00'; // Yellow for moderate
    return '#34C759'; // Green for low
  };

  const fillColor = getFillColor(bin.fillLevel);
  
  return (
    <Marker
      coordinate={{
        latitude: bin.location.coordinates[1],
        longitude: bin.location.coordinates[0]
      }}
      anchor={{ x: 0.2, y: 0.3 }} // This makes the bottom of the marker point to the exact location
      onPress={() => {
        console.log(`BinMarker: Bin ${bin._id} pressed`);
        onPress && onPress();
      }}
    >
      <View style={styles.markerContainer}>
        <View style={[styles.marker, { backgroundColor: fillColor }]}>
          <View style={styles.inner} />
        </View>
      </View>
    </Marker>
  );
};

const styles = StyleSheet.create({
  markerContainer: {
    alignItems: 'center',
  },
  marker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white'
  },
  inner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.5)'
  },
  pointer: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderBottomWidth: 7,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'white',
    transform: [{ rotate: '180deg' }], // Point downward
    marginTop: -1, // Slight overlap with the circle
  }
});

export default BinMarker;