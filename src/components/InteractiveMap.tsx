import React, { useCallback, useEffect, useRef } from 'react';
import MapView, { Polygon, Marker } from 'react-native-maps';
import { StyleSheet } from 'react-native';
import BinMarker from './BinMarker';
import LocationMarker from './LocationMarker';

interface AreaData {
  areaName: string;
  areaID: string;
  coordinates: [number, number][];
  bins: Bin[];
}

interface Bin {
  _id: string;
  location: {
    type: string;
    coordinates: [number, number];
  };
  fillLevel: number;
  lastCollected: string;
}

const InteractiveMap = ({ areaData, onBinSelect, selectedBin }: { areaData: AreaData; onBinSelect: (bin: Bin) => void; selectedBin: Bin | null }) => {
  const mapRef = useRef<MapView | null>(null);

  const handleRegionChange = useCallback(() => {
    if (areaData?.coordinates) {
      const formattedCoords = areaData.coordinates.map(coord => ({
        latitude: coord[1],
        longitude: coord[0]
      }));

      mapRef.current?.fitToCoordinates(formattedCoords, {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        animated: true
      });
    }
  }, [areaData]);

  const centerOnSelectedBin = useCallback(() => {
    if (selectedBin && mapRef.current) {
      mapRef.current.animateCamera({
        center: {
          latitude: selectedBin.location.coordinates[1],
          longitude: selectedBin.location.coordinates[0]
        },
        zoom: 15
      }, { duration: 1000 });
    }
  }, [selectedBin]);

  useEffect(() => {
    if (selectedBin) {
      centerOnSelectedBin();
    }
  }, [selectedBin, centerOnSelectedBin]);

  return (
    <MapView
      ref={mapRef}
      style={styles.map}
      initialRegion={{
        latitude: areaData.coordinates[0][1],
        longitude: areaData.coordinates[0][0],
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421
      }}
      scrollEnabled={false}
      zoomEnabled={false}
      onRegionChangeComplete={handleRegionChange}
    >
      <Polygon
        coordinates={areaData.coordinates.map(coord => ({
          latitude: coord[1],
          longitude: coord[0]
        }))}
        strokeColor="rgba(0,0,0,0.5)"
        fillColor="rgba(0,128,0,0.1)"
      />

      {areaData.bins.map(bin => (
        <BinMarker
          key={bin._id}
          bin={bin}
          onPress={() => onBinSelect(bin)}
        />
      ))}

      {/* Driver Location Marker */}
      <LocationMarker />
    </MapView>
  );
};

const styles = StyleSheet.create({
  map: { ...StyleSheet.absoluteFillObject }
});

export default InteractiveMap;