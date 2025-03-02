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
  console.log('InteractiveMap: Component rendering', {
    areaName: areaData.areaName,
    binsCount: areaData.bins.length,
    selectedBinId: selectedBin?._id || 'none'
  });
  
  const mapRef = useRef<MapView | null>(null);

  const handleRegionChange = useCallback(() => {
    console.log('InteractiveMap: Region changed');
    if (!selectedBin && areaData?.coordinates && areaData.coordinates.length > 0) { // Only run if no bin is selected
      console.log('InteractiveMap: No bin selected, fitting to area coordinates');
      
      const formattedCoords = areaData.coordinates.map(coord => ({
        latitude: coord[1],
        longitude: coord[0]
      }));

      console.log(`InteractiveMap: Fitting to ${formattedCoords.length} coordinates`);
      mapRef.current?.fitToCoordinates(formattedCoords, {
        edgePadding: { top: 20, right: 20, bottom: 220, left: 20 },
        animated: true
      });
    } else {
      console.log('InteractiveMap: Bin selected, not fitting to area coordinates');
    }
  }, [areaData, selectedBin]);

  useEffect(() => {
    console.log('InteractiveMap: Area data or selected bin changed, triggering region change');
    handleRegionChange();
  }, [areaData, handleRegionChange]);

  const centerOnSelectedBin = useCallback(() => {
    if (selectedBin && mapRef.current) {
      console.log('InteractiveMap: Centering on selected bin', selectedBin._id);
      const binCoordinate = {
        latitude: selectedBin.location.coordinates[1],
        longitude: selectedBin.location.coordinates[0]
      };
      mapRef.current.fitToCoordinates([binCoordinate], {
        edgePadding: { top: 20, right: 20, bottom: 330, left: 20 },
        animated: true
      });
    }
  }, [selectedBin]);

  useEffect(() => {
    console.log('InteractiveMap: Selected bin changed:', selectedBin?._id);
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
      rotateEnabled={false} // Added: disable map rotation
      onMapReady={() => {
        console.log('InteractiveMap: Map ready');
        handleRegionChange();
      }} // Added for immediate fit
      onRegionChangeComplete={() => {
        console.log('InteractiveMap: Region change completed');
        handleRegionChange();
      }}
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
          onPress={() => {
            console.log('InteractiveMap: Bin marker pressed', bin._id);
            onBinSelect(bin);
          }}
        />
      ))}
    </MapView>
  );
};

const styles = StyleSheet.create({
  map: { ...StyleSheet.absoluteFillObject }
});

export default InteractiveMap;