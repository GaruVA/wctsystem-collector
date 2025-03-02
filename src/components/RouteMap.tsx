import React, { useCallback, useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Polyline, Marker } from 'react-native-maps';
import BinMarker from './BinMarker';
import DumpLocation from './DumpLocation';

interface Bin {
  _id: string;
  location: {
    type: string;
    coordinates: [number, number]; // [longitude, latitude]
  };
  fillLevel: number;
  lastCollected: string;
}

interface RouteMapProps {
  bins: Bin[];
  optimizedRoute: [number, number][]; // array of [longitude, latitude] coordinates
  currentLocation: {
    latitude: number;
    longitude: number;
  };
  dumpLocation: {
    latitude: number;
    longitude: number;
  };
  onBinSelect?: (bin: Bin) => void;
}

const RouteMap = ({ 
  bins, 
  optimizedRoute, 
  currentLocation, 
  dumpLocation, 
  onBinSelect 
}: RouteMapProps) => {
  console.log('RouteMap: Component rendering', {
    binsCount: bins.length,
    routePointsCount: optimizedRoute.length,
    currentLocation,
    dumpLocation
  });
  
  const mapRef = useRef<MapView | null>(null);

  // Format route coordinates for the Polyline component
  const routeCoordinates = optimizedRoute.map(coord => {
    return {
      latitude: coord[1],
      longitude: coord[0]
    };
  });
  console.log(`RouteMap: Converted ${routeCoordinates.length} route points for polyline`);

  const fitToRoute = useCallback(() => {
    console.log('RouteMap: Attempting to fit route on map');
    if (mapRef.current && routeCoordinates.length > 0) {
      try {
        console.log(`RouteMap: Fitting map to ${routeCoordinates.length} route coordinates`);
        
        // Use all route points for better route fitting
        mapRef.current.fitToCoordinates(routeCoordinates, {
          edgePadding: { top: 50, right: 50, bottom: 250, left: 50 },
          animated: true
        });
        console.log('RouteMap: Map fitted to route successfully');
      } catch (error) {
        console.error("RouteMap: Failed to fit map to route coordinates:", error);
        
        // Fallback to fitting all markers if route fitting fails
        fitAllMarkers();
      }
    } else {
      console.log('RouteMap: Route is empty or map ref is null, falling back to marker fitting');
      fitAllMarkers();
    }
  }, [routeCoordinates]);

  const fitAllMarkers = useCallback(() => {
    console.log('RouteMap: Attempting to fit all markers on map');
    if (mapRef.current) {
      try {
        // Collect all coordinates that need to be visible on the map
        const coordinatesToFit = [
          currentLocation,
          dumpLocation,
          ...bins.map(bin => ({
            latitude: bin.location.coordinates[1],
            longitude: bin.location.coordinates[0]
          }))
        ];
        
        console.log(`RouteMap: Fitting map to ${coordinatesToFit.length} coordinates`);
        mapRef.current.fitToCoordinates(coordinatesToFit, {
          edgePadding: { top: 50, right: 50, bottom: 250, left: 50 },
          animated: true
        });
        console.log('RouteMap: Map fitted to all markers successfully');
      } catch (error) {
        console.error("RouteMap: Failed to fit map to coordinates:", error);
      }
    } else {
      console.log('RouteMap: Map ref is null, cannot fit coordinates');
    }
  }, [bins, currentLocation, dumpLocation]);

  // Fit map when component mounts or when relevant data changes
  useEffect(() => {
    console.log('RouteMap: Fit map effect triggered');
    if (routeCoordinates.length > 0) {
      fitToRoute();
    } else {
      fitAllMarkers();
    }
  }, [fitToRoute, fitAllMarkers, routeCoordinates.length]);

  console.log('RouteMap: Rendering map with polyline and markers');
  return (
    <MapView
      ref={mapRef}
      style={styles.map}
      initialRegion={{
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05
      }}
      onMapReady={() => {
        console.log('RouteMap: Map ready event triggered');
        if (routeCoordinates.length > 0) {
          fitToRoute();
        } else {
          fitAllMarkers();
        }
      }}
    >
      {/* Current location marker */}
      <Marker 
        coordinate={currentLocation} 
        title="Your Location"
        anchor={{ x: 0.2, y: 0.3 }}
      >
        <View style={styles.currentLocationMarker}>
          <View style={styles.currentLocationDot} />
          <View style={styles.currentLocationRing} />
        </View>
      </Marker>

      {/* Dump location marker - using custom component */}
      <DumpLocation coordinate={dumpLocation} />

      {/* Optimized route polyline */}
      <Polyline
        coordinates={routeCoordinates}
        strokeWidth={4}
        strokeColor="rgba(0,100,255,0.7)"
      />

      {/* Bin markers */}
      {bins.map(bin => (
        <BinMarker
          key={bin._id}
          bin={bin}
          onPress={() => {
            console.log('RouteMap: Bin marker pressed', bin._id);
            onBinSelect && onBinSelect(bin);
          }}
        />
      ))}
    </MapView>
  );
};

const styles = StyleSheet.create({
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  currentLocationMarker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentLocationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#1E88E5',
    borderWidth: 2,
    borderColor: 'white',
    zIndex: 2,
  },
  currentLocationRing: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(30, 136, 229, 0.3)',
    zIndex: 1,
  }
});

export default RouteMap;