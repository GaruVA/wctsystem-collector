import React, { useCallback, useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Polyline, Marker, Polygon } from 'react-native-maps';
import BinMarker from './BinMarker';
import EndLocation from './EndLocation';
import StartLocation from './StartLocation';

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
  geometry: {
    type: string;
    coordinates: [number, number][][]; // GeoJSON Polygon format [[[lon, lat], [lon, lat], ...]]
  };
  bins: Bin[];
  startLocation: {
    type: string;
    coordinates: [number, number];
  };
  endLocation: {
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
  
  // Navigation mode props (new)
  currentSegment?: [number, number][]; // Current segment being navigated
  fitToCurrentSegment?: boolean; // Whether to fit the map to the current segment
  
  // Area mode props (optional)
  area?: AreaData;
  fitToArea?: boolean;
  
  // Common optional props
  currentLocation?: {
    latitude: number;
    longitude: number;
  };
  startLocation?: {
    latitude: number;
    longitude: number;
  };
  endLocation?: {
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
  currentSegment = [], // Current navigation segment
  fitToCurrentSegment = false, // Whether to focus on the current segment
  area,
  fitToArea = false,
  currentLocation,
  startLocation,
  endLocation,
  onBinSelect,
  selectedBin = null // Default to null
}: MapDisplayProps) => {
  console.log('MapDisplay: Component rendering', {
    allBinsCount: bins.length,
    routeBinsCount: routeBins.length,
    hasRoute: optimizedRoute.length > 0,
    routePointsCount: optimizedRoute.length,
    hasCurrentSegment: currentSegment.length > 0,
    currentSegmentPoints: currentSegment.length,
    hasCurrentLocation: !!currentLocation,
    hasDumpLocation: !!endLocation,
    fitToRoute,
    fitToCurrentSegment,
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
  
  // Format current segment coordinates for the active navigation segment
  const currentSegmentCoordinates = currentSegment.map(coord => {
    return {
      latitude: coord[1],
      longitude: coord[0]
    };
  });
  
  // Format area coordinates to display area polygon (if we have area data)
  const areaCoordinates = React.useMemo(() => {
    try {
      if (area?.geometry?.coordinates && 
          Array.isArray(area.geometry.coordinates) && 
          area.geometry.coordinates.length > 0 && 
          Array.isArray(area.geometry.coordinates[0])) {
        return area.geometry.coordinates[0].map(coord => {
          if (Array.isArray(coord) && coord.length >= 2 && 
              typeof coord[0] === 'number' && typeof coord[1] === 'number' &&
              !isNaN(coord[0]) && !isNaN(coord[1])) {
            return {
              latitude: coord[1],
              longitude: coord[0]
            };
          }
          return null;
        }).filter(coord => coord !== null) as {latitude: number, longitude: number}[];
      }
    } catch (error) {
      console.error('MapDisplay: Error formatting area coordinates:', error);
    }
    return [];
  }, [area]);

  const fitToRoutePoints = useCallback(() => {
    console.log('MapDisplay: Fitting to route points');
    if (mapRef.current && routeCoordinates.length > 0) {
      try {
        mapRef.current.fitToCoordinates(routeCoordinates, {
          edgePadding: { top: 50, right: 50, bottom: 30, left: 50 },
          animated: true
        });
        console.log('MapDisplay: Map fitted to route successfully');
      } catch (error) {
        console.error("MapDisplay: Failed to fit map to route:", error);
        fitToBins(); // Fallback
      }
    }
  }, [routeCoordinates]);

  // Add function to fit to current navigation segment
  const fitToCurrentSegmentPoints = useCallback(() => {
    console.log('MapDisplay: Fitting to current navigation segment');
    if (mapRef.current && currentSegmentCoordinates.length > 0) {
      try {
        // Include current location in the viewable area if available
        const coordinatesToFit = [...currentSegmentCoordinates];
        if (currentLocation) {
          coordinatesToFit.push(currentLocation);
        }
        
        mapRef.current.fitToCoordinates(coordinatesToFit, {
          edgePadding: { top: 150, right: 50, bottom: 20, left: 50 },
          animated: true
        });
        console.log('MapDisplay: Map fitted to current segment successfully');
      } catch (error) {
        console.error("MapDisplay: Failed to fit map to current segment:", error);
        fitToRoutePoints(); // Fallback to entire route
      }
    }
  }, [currentSegmentCoordinates, currentLocation]);

  const fitToAreaBounds = useCallback(() => {
    console.log('MapDisplay: Fitting to area bounds');
    if (mapRef.current && areaCoordinates.length > 0) {
      try {
        mapRef.current.fitToCoordinates(areaCoordinates, {
          edgePadding: { top: 50, right: 0, bottom: 30, left: 0 },
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
          edgePadding: { top: 50, right: 50, bottom: 30, left: 50 },
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
        edgePadding: { top: 50, right: 50, bottom: 30, left: 50 },
        animated: true
      });
    }
  }, [selectedBin]);

  const fitMap = useCallback(() => {
    // Determine what to fit to based on props
    if (selectedBin) {
      centerOnSelectedBin();
    } else if (fitToCurrentSegment && currentSegmentCoordinates.length > 0) {
      // Priority 1: Fit to current navigation segment if in navigation mode
      fitToCurrentSegmentPoints();
    } else if (fitToRoute && routeCoordinates.length > 0) {
      // Priority 2: Fit to complete route if in route planning mode
      fitToRoutePoints();
    } else if (fitToArea && areaCoordinates.length > 0) {
      // Priority 3: Fit to area if in area view mode
      fitToAreaBounds();
    } else {
      // Priority 4: Fallback to fitting all bins
      fitToBins();
    }
  }, [
    selectedBin, 
    centerOnSelectedBin,
    fitToCurrentSegment,
    currentSegmentCoordinates.length,
    fitToCurrentSegmentPoints,
    fitToRoute, 
    fitToRoutePoints,
    fitToArea,
    fitToAreaBounds, 
    routeCoordinates.length, 
    areaCoordinates.length,
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
      {currentLocation && typeof currentLocation.latitude === 'number' && 
        typeof currentLocation.longitude === 'number' && 
        !isNaN(currentLocation.latitude) && 
        !isNaN(currentLocation.longitude) && (
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

      {/* End location marker (if provided) */}
      {endLocation && <EndLocation coordinate={endLocation} />}

      {/* Start location marker (if provided) */}
      {startLocation && (
        <StartLocation coordinate={startLocation} />
      )}

      {/* Complete route polyline (in a lighter color if we're navigating) */}
      {routeCoordinates.length > 0 && (
        <Polyline
          coordinates={routeCoordinates}
          strokeWidth={4}
          strokeColor={currentSegmentCoordinates.length > 0 ? "rgba(0,100,255,0.3)" : "rgba(0,100,255,0.7)"}
        />
      )}
      
      {/* Current navigation segment polyline (highlighted) */}
      {currentSegmentCoordinates.length > 0 && (
        <Polyline
          coordinates={currentSegmentCoordinates}
          strokeWidth={5}
          strokeColor="rgba(0,100,255,0.9)"
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
