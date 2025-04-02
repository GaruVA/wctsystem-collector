import React from 'react';
import { Marker } from 'react-native-maps';
import { View, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const StartLocation = ({ coordinate }: { coordinate: { latitude: number; longitude: number } }) => {
  return (
    <Marker coordinate={coordinate} title="Start Location">
      <View style={styles.markerContainer}>
        <View style={styles.markerInner}>
          <MaterialIcons name="place" size={16} color="#fff" />
        </View>
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
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    borderWidth: 2,
    borderColor: '#fff',
  },
});

export default StartLocation;