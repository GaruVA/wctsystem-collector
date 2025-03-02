import React from 'react';
import { Marker } from 'react-native-maps';
import { View, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface DumpLocationProps {
  coordinate: {
    latitude: number;
    longitude: number;
  };
}

const DumpLocation = ({ coordinate }: DumpLocationProps) => {
  console.log('DumpLocation: Rendering dump location marker at', coordinate);
  
  return (
    <Marker
      coordinate={coordinate}
      title="Dump Location"
      anchor={{ x: 0.2, y: 0.3 }} // Bottom of marker points to exact location
    >
      <View style={styles.container}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name="dump-truck" size={20} color="white" />
        </View>
        <View style={styles.pointer} />
      </View>
    </Marker>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  iconContainer: {
    backgroundColor: '#8E24AA', // Purple color for dump location
    borderRadius: 12,
    padding: 8,
    borderWidth: 2,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 5,
  },
  pointer: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 12,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#8E24AA', // Same as container background
    transform: [{ rotate: '180deg' }], // Point downward
    marginTop: -2, // Slight overlap with container
  }
});

export default DumpLocation;
