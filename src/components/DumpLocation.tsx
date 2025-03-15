import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Marker } from 'react-native-maps';
import { MaterialIcons } from '@expo/vector-icons';

interface DumpLocationProps {
  coordinate: {
    latitude: number;
    longitude: number;
  };
}

const DumpLocation = ({ coordinate }: DumpLocationProps) => {
  return (
    <Marker coordinate={coordinate}>
      <View style={styles.markerContainer}>
        <View style={styles.markerInner}>
          <MaterialIcons name="local-shipping" size={20} color="#fff" />
        </View>
        <View style={styles.ring} />
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  ring: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#3B82F6',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
});

export default DumpLocation;
