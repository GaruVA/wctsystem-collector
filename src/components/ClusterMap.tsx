import React, { useEffect, useRef, useState, useCallback } from 'react';
import MapView, { Marker, Polygon } from 'react-native-maps';
import MapClustering from 'react-native-map-clustering';
import { StyleSheet, View, Image, Text } from 'react-native';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';

interface Bin {
  _id: string;
  location: {
    coordinates: [number, number];
  };
  fillLevel: number;
  lastCollected: string;
}

interface Area {
  coordinates: [number, number][];
  bins: Bin[];
}

interface ClusterProperties {
  point_count: number;
  cluster_id: number;
  cluster: Bin[];
}

const ClusterMap = () => {
  const { token } = useAuth();
  const mapRef = useRef<MapView>(null);
  const [area, setArea] = useState<Area | null>(null);
  const [selectedBin, setSelectedBin] = useState<Bin | null>(null);
  const bottomSheetRef = useRef<BottomSheet>(null);

  // Fetch driver's area and bins
  useEffect(() => {
    const fetchArea = async () => {
      try {
        const response = await axios.get('/api/driver/area', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setArea(response.data);
        
        if (response.data.coordinates?.length > 0) {
          const formattedCoords = response.data.coordinates.map((coord: [number, number]) => ({
            latitude: coord[1],
            longitude: coord[0]
          }));
          
          mapRef.current?.fitToCoordinates(formattedCoords, {
            edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
            animated: true
          });
        }
      } catch (error) {
        console.error('Error fetching area:', error);
      }
    };
    fetchArea();
  }, [token]);

  const getMarkerColor = useCallback((fillLevel: number) => {
    if (fillLevel > 70) return require('../assets/red-bin.png');
    if (fillLevel > 30) return require('../assets/yellow-bin.png');
    return require('../assets/green-bin.png');
  }, []);

  const renderCluster = (cluster: {
    id: string;
    geometry: { coordinates: [number, number] };
    properties: ClusterProperties;
    onPress: () => void;
  }) => {
    const { geometry, properties, onPress } = cluster;
    const totalFill = properties.cluster?.reduce((sum, bin) => sum + bin.fillLevel, 0) || 0;
    const averageFill = properties.point_count > 0 
      ? Math.round(totalFill / properties.point_count)
      : 0;

    return (
      <Marker
        coordinate={{
          longitude: geometry.coordinates[0],
          latitude: geometry.coordinates[1]
        }}
        onPress={onPress}
      >
        <View style={styles.cluster}>
          <Image source={getMarkerColor(averageFill)} style={styles.clusterImage} />
          <Text style={styles.clusterText}>{properties.point_count}</Text>
        </View>
      </Marker>
    );
  };

  const renderBin = useCallback((bin: Bin) => (
    <Marker
      key={bin._id}
      coordinate={{
        longitude: bin.location.coordinates[0],
        latitude: bin.location.coordinates[1]
      }}
      onPress={() => {
        setSelectedBin(bin);
        bottomSheetRef.current?.expand();
      }}
    >
      <Image source={getMarkerColor(bin.fillLevel)} style={styles.marker} />
    </Marker>
  ), [getMarkerColor]);

  return (
    <View style={styles.container}>
      <MapClustering
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: 50.3755,  // Plymouth coordinates
          longitude: -4.1428,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        clusterColor="transparent"
        renderCluster={renderCluster}
        scrollEnabled={false}
        zoomEnabled={false}
      >
        {area?.coordinates && (
          <Polygon
            coordinates={area.coordinates.map(coord => ({
              latitude: coord[1],
              longitude: coord[0]
            }))}
            strokeColor="rgba(0,0,0,0.5)"
            fillColor="rgba(0,128,0,0.1)"
          />
        )}
        {area?.bins?.map(renderBin)}
      </MapClustering>

      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={['25%', '50%']}
        enablePanDownToClose
      >
        <BottomSheetView style={styles.sheetContent}>
          {selectedBin && (
            <>
              <Text style={styles.sheetTitle}>Bin Details</Text>
              <Text>Fill Level: {selectedBin.fillLevel}%</Text>
              <Text>
                Last Collected: {new Date(selectedBin.lastCollected).toLocaleDateString()}
              </Text>
              <Text>
                Location: {selectedBin.location.coordinates[0].toFixed(5)}, 
                {selectedBin.location.coordinates[1].toFixed(5)}
              </Text>
            </>
          )}
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { ...StyleSheet.absoluteFillObject },
  marker: { width: 32, height: 32 },
  cluster: { alignItems: 'center' },
  clusterImage: { width: 40, height: 40 },
  clusterText: { 
    position: 'absolute', 
    top: 8, 
    color: 'white',
    fontWeight: 'bold'
  },
  sheetContent: {
    padding: 20,
    gap: 10
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10
  }
});

export default ClusterMap;