import React, { useCallback, useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Polyline, Marker, Polygon } from 'react-native-maps';
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

interface AreaData {
  areaName: string;
  areaID: string;
  coordinates: [number, number][];
  bins: Bin[];
  dumpLocation: {
    type: string;
    coordinates: [number, number];
  };
}

interface MapDisplayProps {
  bins: Bin[];
  
  // Route mode props (optional)
  optimizedRoute?: [number, number][]; // array of [longitude, latitude] coordinates
  fitToRoute?: boolean;
  routeBins?: Bin[];  // New prop for bins that are part of the route
  
  // Area mode props (optional)
  area?: AreaData;
  fitToArea?: boolean;
  
  // Common optional props
  currentLocation?: {
    latitude: number;
    longitude: number;
  };
  dumpLocation?: {
    latitude: number;
    longitude: number;
  };
  onBinSelect?: (bin: Bin) => void;
  selectedBin?: Bin | null; // Add selectedBin prop
}

const MapDisplay = ({ 
  bins, 
  optimizedRoute = [], 
  fitToRoute = false,
  routeBins = [], // Bins that are part of the active route
  area,
  fitToArea = false,
  currentLocation,
  dumpLocation,
  onBinSelect,
  selectedBin = null // Default to null
}: MapDisplayProps) => {
  console.log('MapDisplay: Component rendering', {
    allBinsCount: bins.length,
    routeBinsCount: routeBins.length,
    hasRoute: optimizedRoute.length > 0,
    routePointsCount: optimizedRoute.length,
    hasCurrentLocation: !!currentLocation,
    hasDumpLocation: !!dumpLocation,
    fitToRoute,
    fitToArea,
    selectedBinId: selectedBin?._id || 'none'
  });
  
  const mapRef = useRef<MapView | null>(null);

  // Format route coordinates for the Polyline component (if we have a route)
  const routeCoordinates = optimizedRoute.map(coord => {
    return {
      latitude: coord[1],
      longitude: coord[0]
    };
  });
  
  // Format area coordinates to display area polygon (if we have area data)
  const areaCoordinates = area?.coordinates.map(coord => {
    return {
      latitude: coord[1],
      longitude: coord[0]
    };
  }) || [];

  const fitToRoutePoints = useCallback(() => {
    console.log('MapDisplay: Fitting to route points');
    if (mapRef.current && routeCoordinates.length > 0) {
      try {
        mapRef.current.fitToCoordinates(routeCoordinates, {
          edgePadding: { top: 50, right: 50, bottom: 320, left: 50 },
          animated: true
        });
        console.log('MapDisplay: Map fitted to route successfully');
      } catch (error) {
        console.error("MapDisplay: Failed to fit map to route:", error);
        fitToBins(); // Fallback
      }
    }
  }, [routeCoordinates]);

  const fitToAreaBounds = useCallback(() => {
    console.log('MapDisplay: Fitting to area bounds');
    if (mapRef.current && areaCoordinates.length > 0) {
      try {
        mapRef.current.fitToCoordinates(areaCoordinates, {
          edgePadding: { top: 50, right: 50, bottom: 360, left: 50 },
          animated: true
        });
        console.log('MapDisplay: Map fitted to area successfully');
      } catch (error) {
        console.error("MapDisplay: Failed to fit map to area:", error);
        fitToBins(); // Fallback
      }
    }
  }, [areaCoordinates]);

  const fitToBins = useCallback(() => {
    console.log('MapDisplay: Fitting to bins');
    if (mapRef.current && bins.length > 0) {
      try {
        // Convert bin coordinates to the format needed for fitToCoordinates
        const binCoordinates = bins.map(bin => ({
          latitude: bin.location.coordinates[1],
          longitude: bin.location.coordinates[0]
        }));
        
        mapRef.current.fitToCoordinates(binCoordinates, {
          edgePadding: { top: 50, right: 50, bottom: 250, left: 50 },
          animated: true
        });
        console.log('MapDisplay: Map fitted to bins successfully');
      } catch (error) {
        console.error("MapDisplay: Failed to fit map to bins:", error);
      }
    }
  }, [bins]);

  // Add function to zoom to selected bin
  const centerOnSelectedBin = useCallback(() => {
    if (selectedBin && mapRef.current) {
      console.log('MapDisplay: Zooming to selected bin', selectedBin._id);
      const binCoordinate = {
        latitude: selectedBin.location.coordinates[1],
        longitude: selectedBin.location.coordinates[0]
      };
      
      mapRef.current.fitToCoordinates([binCoordinate], {
        edgePadding: { top: 50, right: 50, bottom: 360, left: 50 },
        animated: true
      });
    }
  }, [selectedBin]);

  const fitMap = useCallback(() => {
    // Determine what to fit to based on props
    if (selectedBin) {
      centerOnSelectedBin();
    } else if (fitToRoute && routeCoordinates.length > 0) {
      fitToRoutePoints();
    } else if (fitToArea && areaCoordinates.length > 0) {
      fitToAreaBounds();
    } else {
      fitToBins();
    }
  }, [
    selectedBin, 
    centerOnSelectedBin,
    fitToRoute, 
    fitToArea, 
    routeCoordinates.length, 
    areaCoordinates.length, 
    fitToRoutePoints, 
    fitToAreaBounds, 
    fitToBins
  ]);

  // Fit map when component mounts or when relevant data changes
  useEffect(() => {
    console.log('MapDisplay: Fit map effect triggered');
    fitMap();
  }, [fitMap]);

  // Add effect specifically for when selectedBin changes
  useEffect(() => {
    if (selectedBin) {
      console.log('MapDisplay: Selected bin changed, centering on bin', selectedBin._id);
      centerOnSelectedBin();
    }
  }, [selectedBin, centerOnSelectedBin]);

  // Default initial position is NYC (will be overridden by fitToCoordinates)
  const initialRegion = {
    latitude: 40.7128,
    longitude: -74.0060,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05
  };

  // Create a set of route bin IDs for quick lookup
  const routeBinIds = new Set(routeBins.map(bin => bin._id));

  return (
    <MapView
      ref={mapRef}
      style={styles.map}
      initialRegion={initialRegion}
      onMapReady={() => {
        console.log('MapDisplay: Map ready, fitting map');
        fitMap();
      }}
    >
      {/* Area polygon if provided */}
      {areaCoordinates.length > 0 && (
        <Polygon
          coordinates={areaCoordinates}
          strokeColor="rgba(0,0,0,0.5)"
          fillColor="rgba(0,128,0,0.1)"
        />
      )}

      {/* Current location marker (if provided) */}
      {currentLocation && (
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
      )}

      {/* Dump location marker (if provided) */}
      {dumpLocation && <DumpLocation coordinate={dumpLocation} />}

      {/* Optimized route polyline (if provided) */}
      {routeCoordinates.length > 0 && (
        <Polyline
          coordinates={routeCoordinates}
          strokeWidth={4}
          strokeColor="rgba(0,100,255,0.7)"
        />
      )}

      {/* Bin markers */}
      {bins.map(bin => (
        <BinMarker
          key={bin._id}
          bin={bin}
          isSelected={selectedBin?._id === bin._id}
          isRouteStop={routeBinIds.has(bin._id)}
          onPress={() => {
            console.log('MapDisplay: Bin marker pressed', bin._id);
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

export default MapDisplay;
