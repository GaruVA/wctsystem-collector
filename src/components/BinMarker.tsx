import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Marker } from 'react-native-maps';
import { MaterialIcons } from '@expo/vector-icons';

interface Bin {
  _id: string;
  location: {
    type: string;
    coordinates: [number, number];
  };
  fillLevel: number;
  lastCollected: string;
}

interface BinMarkerProps {
  bin: Bin;
  isSelected?: boolean;
  isRouteStop?: boolean;
  onPress: () => void;
}

const BinMarker = ({ bin, isSelected, isRouteStop, onPress }: BinMarkerProps) => {
  // Validate bin coordinates
  if (!bin || !bin.location || !bin.location.coordinates || 
      !Array.isArray(bin.location.coordinates) || 
      bin.location.coordinates.length !== 2 ||
      typeof bin.location.coordinates[0] !== 'number' || 
      typeof bin.location.coordinates[1] !== 'number' ||
      isNaN(bin.location.coordinates[0]) || 
      isNaN(bin.location.coordinates[1])) {
    console.log('BinMarker: Invalid bin coordinates', bin?.location?.coordinates);
    return null;
  }

  const getFillLevelColor = (level: number) => {
    if (level >= 90) return '#EF4444';
    if (level >= 70) return '#F59E0B';
    if (level >= 50) return '#FBBF24';
    return '#10B981';
  };

  const markerColor = getFillLevelColor(bin.fillLevel);
  // Don't show route or selection styling if bin is collected (0% fill level)
  const showRouteStyle = isRouteStop && bin.fillLevel > 0;
  const showSelectedStyle = isSelected && bin.fillLevel > 0;

  return (
    <Marker
      coordinate={{
        latitude: bin.location.coordinates[1],
        longitude: bin.location.coordinates[0],
      }}
      onPress={onPress}
    >
      <View style={[
        styles.markerContainer,
        showSelectedStyle && styles.selectedMarker,
        showRouteStyle && styles.routeMarker
      ]}>
        <View style={[styles.markerInner, { backgroundColor: markerColor }]}>
          <MaterialIcons 
            name="delete" 
            size={16} 
            color="#fff" 
          />
        </View>
        {showSelectedStyle && <View style={styles.selectedRing} />}
        {showRouteStyle && <View style={styles.routeRing} />}
      </View>
    </Marker>
  );
};

const styles = StyleSheet.create({
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerInner: {
    width: 28,
    height: 28,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  selectedMarker: {
    transform: [{ scale: 1.1 }],
  },
  selectedRing: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#3B82F6',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  routeMarker: {
    transform: [{ scale: 1.1 }],
  },
  routeRing: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
});

export default BinMarker;