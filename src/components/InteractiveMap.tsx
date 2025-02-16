import React, { useCallback, useRef } from 'react';
import MapView, { Polygon } from 'react-native-maps';
import MapClustering from 'react-native-map-clustering';
import { StyleSheet } from 'react-native';
import BinMarker from './BinMarker';
import ClusterMarker from './ClusterMarker';
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
  status: string;
}

const InteractiveMap = ({ areaData, onBinSelect }: { areaData: AreaData | null; onBinSelect: (bin: Bin) => void }) => {
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

  return (
    <MapView
      ref={mapRef}
      style={styles.map}
      initialRegion={{
        latitude: areaData?.coordinates[0][1] || 0,
        longitude: areaData?.coordinates[0][0] || 0,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421
      }}
      scrollEnabled={false}
      zoomEnabled={false}
      onRegionChangeComplete={handleRegionChange}
    >
      {areaData?.coordinates && (
        <Polygon
          coordinates={areaData.coordinates.map(coord => ({
            latitude: coord[1],
            longitude: coord[0]
          }))}
          strokeColor="rgba(0,0,0,0.5)"
          fillColor="rgba(0,128,0,0.1)"
        />
      )}

      {areaData?.bins?.map(bin => (
        <BinMarker
          key={bin._id}
          bin={bin}
          onPress={() => onBinSelect(bin)}
        />
      ))}

      <MapClustering
        renderCluster={(cluster) => (
          <ClusterMarker
            cluster={cluster}
            onPress={() => {
              const { latitude, longitude } = cluster.geometry.coordinates;
              mapRef.current?.animateCamera({
                center: { latitude, longitude },
                zoom: 15
              });
            }}
          />
        )}
      >
        {areaData?.bins?.map(bin => (
          <BinMarker
            key={bin._id}
            bin={bin}
            onPress={() => onBinSelect(bin)}
          />
        ))}
      </MapClustering>

      {/* Driver Location Marker */}
      <LocationMarker />
    </MapView>
  );
};

const styles = StyleSheet.create({
  map: { ...StyleSheet.absoluteFillObject }
});

export default InteractiveMap;