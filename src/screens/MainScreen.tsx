import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, BackHandler, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import MapDisplay from '../components/MapDisplay';
import RouteDetails from '../components/RouteDetails';
import AreaDetails from '../components/AreaDetails';
import BinDetails from '../components/BinDetails';
import NotificationIcon from '../components/NotificationIcon';
import ReportIssueModal from '../components/ReportIssueModal';
import NavigationSheet from '../components/NavigationSheet';
import { useAuth } from '../context/AuthContext';
import { getCollectorArea, reportIssue, optimizeBinOrder, generateRoutePolyline, getCollectorLocation, type AreaData, type Bin } from '../services/api';
import { isCloseToWaypoint } from '../utils/navigationHelpers';

interface RouteData {
  route: [number, number][];
  distance: string;
  duration: string;
  stops_sequence?: number[];
  steps?: Array<{
    instruction?: string;
    distance?: string;
    duration?: number;
    name?: string;
    maneuver?: {
      type: string;
      modifier?: string;
    };
  }>;
}

const MainScreen = () => {
  const { token, signOut } = useAuth();
  
  // Shared state
  const [currentLocation, setCurrentLocation] = useState({
    latitude: 40.748,
    longitude: -73.98
  });
  const [dumpLocation, setDumpLocation] = useState({
    latitude: 40.7300,
    longitude: -73.9950
  });
  
  // Home screen state
  const [areaData, setAreaData] = useState<AreaData | null>(null);
  const [selectedBin, setSelectedBin] = useState<Bin | null>(null);
  const [reportIssueVisible, setReportIssueVisible] = useState(false);
  const [selectedBinId, setSelectedBinId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Route screen state
  const [isRouteActive, setIsRouteActive] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [activeBins, setActiveBins] = useState<Bin[]>([]);
  const [activeRouteName, setActiveRouteName] = useState('Route Overview');
  const [routeData, setRouteData] = useState<RouteData | null>(null);
  const [optimizedRoute, setOptimizedRoute] = useState<[number, number][]>([]);
  const [collectedBins, setCollectedBins] = useState<Set<string>>(new Set());

  // Navigation state
  const [currentBinIndex, setCurrentBinIndex] = useState(0);
  const [nextInstruction, setNextInstruction] = useState("Proceed to the first bin");
  const [distanceToNext, setDistanceToNext] = useState("Calculating...");
  const [optimizedBinOrder, setOptimizedBinOrder] = useState<[number, number][]>([]);
  const [binSequence, setBinSequence] = useState<number[]>([]);
  const [currentSegmentPolyline, setCurrentSegmentPolyline] = useState<[number, number][]>([]);

  // State for route recalculation loading
  const [isRouteRecalculating, setIsRouteRecalculating] = useState(false);

  // Add state to track if location has significantly changed
  const [lastRouteLocation, setLastRouteLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  // Define heights for different states
  const homeDetailsHeight = 408; // Example height for home view
  const routeDetailsHeight = 333; // Example height for route view
  const binDetailsHeight = 373; // Example height for bin details view
  const navigationDetailsHeight = 500; // Height for turn-by-turn navigation sheet

  // Function to get the current details container height
  const getDetailsHeight = () => {
    if (isRouteActive) {
      return isNavigating ? navigationDetailsHeight : routeDetailsHeight;
    }
    if (selectedBin) return binDetailsHeight;
    return homeDetailsHeight;
  };

  // Helper function to determine if route needs to be recalculated based on distance
  const shouldRecalculateRoute = (
    currentLoc: {latitude: number; longitude: number},
    lastLoc: {latitude: number; longitude: number} | null
  ): boolean => {
    if (!lastLoc) return true;
    
    // Calculate distance between current and last location in meters
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lastLoc.latitude * Math.PI/180;
    const φ2 = currentLoc.latitude * Math.PI/180;
    const Δφ = (currentLoc.latitude - lastLoc.latitude) * Math.PI/180;
    const Δλ = (currentLoc.longitude - lastLoc.longitude) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    // Recalculate if moved more than 50 meters
    return distance > 50;
  };

  // Function to update only the route polylines and instructions for remaining uncollected bins
  const updateRoutePolyline = async (
    startLocation: {latitude: number; longitude: number},
    binsForRoute: Bin[]
  ) => {
    if (!token || binsForRoute.length === 0) return;
    
    try {
      setIsRouteRecalculating(true);
      
      // Filter out already collected bins
      const remainingBins = binsForRoute.filter(bin => !collectedBins.has(bin._id));
      
      if (remainingBins.length === 0) {
        // All bins collected, just route to dump location
        const waypoints: [number, number][] = [
          [startLocation.longitude, startLocation.latitude],
          [dumpLocation.longitude, dumpLocation.latitude]
        ];
        
        const newRouteData = await generateRoutePolyline(waypoints, [], token);
        setRouteData(newRouteData);
        setOptimizedRoute(newRouteData.route);
        
        // Set the current segment to the route to dump location
        setCurrentSegmentPolyline(newRouteData.route);
        
        setNextInstruction("Proceed to dump location");
        setDistanceToNext(`${newRouteData.distance} remaining`);
        return;
      }
      
      // Get the optimized order of bins first
      const optimizedOrder = await optimizeBinOrder(
        startLocation,
        remainingBins.map(bin => bin.location.coordinates),
        dumpLocation,
        token
      );
      
      // Store the optimized bin order for navigation reference
      setOptimizedBinOrder(optimizedOrder.optimizedStops);
      setBinSequence(optimizedOrder.stops_sequence);
      
      // Now generate the polyline with updated current location
      const waypoints: [number, number][] = [
        [startLocation.longitude, startLocation.latitude],
        ...optimizedOrder.optimizedStops,
        [dumpLocation.longitude, dumpLocation.latitude]
      ];
      
      const newRouteData = await generateRoutePolyline(waypoints, optimizedOrder.stops_sequence, token);
      
      // Update route data and polyline
      setRouteData(newRouteData);
      setOptimizedRoute(newRouteData.route);
      
      // If we have a first stop, generate a separate route just for the current segment
      if (optimizedOrder.optimizedStops.length > 0) {
        console.log('MainScreen: Creating segment from current location to next bin');
        
        try {
          // Generate a direct route from current location to the next bin only
          const nextBinCoords = optimizedOrder.optimizedStops[0];
          const segmentWaypoints: [number, number][] = [
            [startLocation.longitude, startLocation.latitude],
            nextBinCoords
          ];
          
          // Get a separate polyline just for this segment
          const segmentRouteData = await generateRoutePolyline(segmentWaypoints, [], token);
          
          // Set the current segment polyline to this direct route
          setCurrentSegmentPolyline(segmentRouteData.route);
          
          // Update next instruction with segment data
          if (segmentRouteData.steps && segmentRouteData.steps.length > 0) {
            const firstStep = segmentRouteData.steps[0];
            setNextInstruction(firstStep.instruction || "Proceed to next location");
            setDistanceToNext(
              firstStep.distance || 
              `${segmentRouteData.distance} to next bin`
            );
          }
        } catch (segmentError) {
          console.error('MainScreen: Error creating segment polyline:', segmentError);
          // Fallback: Try to extract the segment from the full route
          extractSegmentFromFullRoute(newRouteData.route, optimizedOrder.optimizedStops[0]);
        }
      } else {
        // If no stops left, use the full route (to dump location)
        setCurrentSegmentPolyline(newRouteData.route);
      }
      
      // Check if user is close to the next bin
      if (optimizedOrder.optimizedStops.length > 0) {
        const nextBinLocation = optimizedOrder.optimizedStops[0];
        const isClose = isCloseToWaypoint(startLocation, nextBinLocation, 100); // 100m threshold
        
        if (isClose) {
          // Set current bin index based on the sequence
          setCurrentBinIndex(optimizedOrder.stops_sequence[0]);
          
          // Update instruction to indicate arrival at bin
          setNextInstruction("You have arrived at the bin location");
          setDistanceToNext("Ready to collect");
        }
      }
      
    } catch (error: any) {
      console.error('MainScreen: Failed to update route polyline:', error);
      // Don't show alert for silent location-based updates
    } finally {
      setIsRouteRecalculating(false);
    }
  };
  
  // Helper function to extract segment from full route when direct segment API call fails
  const extractSegmentFromFullRoute = (
    fullRoute: [number, number][],
    nextBinCoords: [number, number]
  ) => {
    console.log('MainScreen: Extracting segment from full route');
    
    // More sophisticated approach to find the point in route closest to the next bin
    let closestPointIndex = -1;
    let minDistance = Infinity;
    
    for (let i = 0; i < fullRoute.length; i++) {
      const point = fullRoute[i];
      const distance = Math.sqrt(
        Math.pow(point[0] - nextBinCoords[0], 2) +
        Math.pow(point[1] - nextBinCoords[1], 2)
      );
      
      if (distance < minDistance) {
        minDistance = distance;
        closestPointIndex = i;
      }
    }
    
    if (closestPointIndex > 0) {
      // Take route from start up to the closest point to next bin, plus a small buffer
      const endIndex = Math.min(closestPointIndex + 5, fullRoute.length);
      setCurrentSegmentPolyline(fullRoute.slice(0, endIndex));
      console.log(`MainScreen: Extracted segment with ${endIndex} points`);
    } else {
      // Fallback to a reasonable segment size (first 20% of the route)
      const segmentSize = Math.max(Math.floor(fullRoute.length * 0.2), 10);
      setCurrentSegmentPolyline(fullRoute.slice(0, segmentSize));
      console.log(`MainScreen: Using fallback segment with ${segmentSize} points`);
    }
  };

  // Load area data
  useEffect(() => {
    if (!token) return;
    
    const loadAreaData = async () => {
      try {
        setIsLoading(true);
        const data = await getCollectorArea(token);
        setAreaData(data);
        
        if (data.dumpLocation) {
          setDumpLocation({
            latitude: data.dumpLocation.coordinates[1],
            longitude: data.dumpLocation.coordinates[0]
          });
        }
      } catch (error) {
        console.error('MainScreen: Failed to fetch area data:', error);
        Alert.alert('Error', 'Failed to load area data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadAreaData();
  }, [token]);

  // Set up polling to get location from database
  useEffect(() => {
    if (!token) return;
    
    console.log('MainScreen: Setting up location polling');
    let isMounted = true;
    
    const fetchLocation = async () => {
      if (!isMounted || !token) return;
      
      try {
        const dbLocation = await getCollectorLocation(token);
        
        if (dbLocation && isMounted) {
          const newLocation = {
            latitude: dbLocation[1],
            longitude: dbLocation[0]
          };
          
          setCurrentLocation(newLocation);
          
          // Check if we need to update route based on new location
          if (isRouteActive && activeBins.length > 0) {
            // If navigating, update the route when location changes significantly
            if (isNavigating) {
              const shouldUpdateRoute = shouldRecalculateRoute(newLocation, lastRouteLocation);
              if (shouldUpdateRoute) {
                console.log('MainScreen: Location changed significantly, updating route');
                setLastRouteLocation(newLocation);
                updateRoutePolyline(newLocation, activeBins);
              }
            } 
            // If just planning, only update if moved significantly
            else {
              const shouldUpdateRoute = shouldRecalculateRoute(newLocation, lastRouteLocation);
              
              if (shouldUpdateRoute) {
                console.log('MainScreen: Location changed significantly, updating route');
                setLastRouteLocation(newLocation);
                updateRoutePolyline(newLocation, activeBins);
              }
            }
          }
        }
      } catch (error) {
        console.error('MainScreen: Error fetching location:', error);
      }
    };
    
    fetchLocation();
    
    // More conservative polling intervals to preserve API quota
    // - During navigation: Every 15 seconds (4 requests per minute)
    // - When route planning: Every 30 seconds (2 requests per minute)
    // - Normal mode: Every 60 seconds (1 request per minute)
    const interval = isNavigating ? 15000 : isRouteActive ? 30000 : 60000;
    console.log(`MainScreen: Setting location polling interval to ${interval/1000} seconds`);
    
    const locationPoll = setInterval(fetchLocation, interval);
    
    return () => {
      isMounted = false;
      clearInterval(locationPoll);
    };
  }, [token, isRouteActive, isNavigating, activeBins, collectedBins, lastRouteLocation]);

  // Handle Android back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (isRouteActive) {
        console.log('MainScreen: Back button pressed during active route');
        handleExitRoute();
        return true;
      }
      return false;
    });

    return () => backHandler.remove();
  }, [isRouteActive]);

  // Handling report issue function
  const handleReportIssue = (binId: string) => {
    console.log('MainScreen: Reporting issue for bin:', binId);
    setSelectedBinId(binId);
    setReportIssueVisible(true);
  };

  const handleReportSubmit = async (issueType: string, description: string) => {
    console.log('MainScreen: Submitting issue report', { issueType, description });
    if (selectedBinId && token) {
      try {
        await reportIssue(selectedBinId, issueType, description, token);
        Alert.alert('Success', 'Issue reported successfully');
      } catch (error) {
        console.error('MainScreen: Failed to report issue:', error);
        Alert.alert('Error', 'Failed to report issue. Please try again.');
      }
    }
    setReportIssueVisible(false);
  };

  const createOptimizedRoute = async () => {
    console.log('MainScreen: Creating optimized route');
    if (!areaData || !token) {
      console.log('MainScreen: No area data or token available, cannot create route');
      Alert.alert('Error', 'Cannot create route. Please login again.');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Get bins with high fill levels (e.g., > 70%)
      const priorityBins = areaData.bins.filter(bin => bin.fillLevel > 70);
      console.log(`MainScreen: Found ${priorityBins.length} priority bins`);
      
      if (priorityBins.length === 0) {
        Alert.alert('No Priority Bins', 'There are no bins with fill level above 70% to collect.');
        setIsLoading(false);
        return;
      }
      
      // Step 1: Get active bins
      setActiveBins(priorityBins);
      setActiveRouteName(areaData.areaName);
      
      // Step 2: Activate the route state
      setIsRouteActive(true);
      setCollectedBins(new Set());
      
      // Step 3: Calculate the optimized route
      recalculateRoute(priorityBins);
      
    } catch (error: any) {
      console.error('MainScreen: Failed to create route:', error);
      setIsRouteActive(false); // Reverting to home mode on error
    } finally {
      setIsLoading(false);
    }
  };

  const recalculateRoute = async (binsForRoute: Bin[]) => {
    if (!token || binsForRoute.length === 0) {
      console.log('MainScreen: Cannot recalculate route - no token or bins');
      return;
    }
    
    try {
      console.log('MainScreen: Recalculating route with', binsForRoute.length, 'bins');
      setIsRouteRecalculating(true);
      
      // Get start location (current location or first bin)
      const startLocation = currentLocation && 
      typeof currentLocation.latitude === 'number' && 
      typeof currentLocation.longitude === 'number' ? currentLocation : {
        latitude: binsForRoute[0].location.coordinates[1],
        longitude: binsForRoute[0].location.coordinates[0]
      };
      
      // Save the location we're calculating from
      setLastRouteLocation(startLocation);
      
      // Step 1: Get optimized bin order
      const optimizedOrder = await optimizeBinOrder(
        startLocation,
        binsForRoute.map(bin => bin.location.coordinates),
        dumpLocation,
        token
      );
      setOptimizedBinOrder(optimizedOrder.optimizedStops);
      setBinSequence(optimizedOrder.stops_sequence);

      // Step 2: Generate route polyline using optimized order
      const waypoints: [number, number][] = [
        [startLocation.longitude, startLocation.latitude],
        ...optimizedOrder.optimizedStops,
        [dumpLocation.longitude, dumpLocation.latitude]
      ];

      const newRouteData = await generateRoutePolyline(waypoints, optimizedOrder.stops_sequence, token);
      
      console.log('MainScreen: Route recalculation successful');
      setRouteData(newRouteData);
      setOptimizedRoute(newRouteData.route);
      
      setCurrentBinIndex(0);

    } catch (error: any) {
      console.error('MainScreen: Failed to recalculate route:', error);
      Alert.alert('Route Error', 'Failed to recalculate the route. The previous route will be used.');
    } finally {
      setIsRouteRecalculating(false);
    }
  };

  // Route screen functions
  const handleBinSelect = (bin: Bin) => {
    if (isRouteActive) {
      console.log('MainScreen: Bin selected during active route:', bin._id);
      const binIndex = activeBins.findIndex(b => b._id === bin._id);
      let newActiveBins: Bin[] = [];

      if (binIndex >= 0) {
        console.log('MainScreen: Removing bin from route:', bin._id);
        newActiveBins = [...activeBins];
        newActiveBins.splice(binIndex, 1);
      } else {
        console.log('MainScreen: Adding bin to route:', bin._id);
        newActiveBins = [...activeBins, bin];
      }
      
      setActiveBins(newActiveBins);

      if (newActiveBins.length > 0) {
        recalculateRoute(newActiveBins);
      } else {
        Alert.alert(
          'Empty Route',
          'Your route has no bins. Do you want to exit route mode?',
          [
            { text: 'Stay', style: 'cancel' },
            { text: 'Exit Route', onPress: handleExitRoute }
          ]
        );
      }
    } else {
      console.log('MainScreen: Selected bin in home view:', bin._id);
      setSelectedBin(bin);
    }
  };
  
  // Start navigation function - called when "Start Route" button is pressed
  const handleStartNavigation = () => {
    console.log('MainScreen: Starting navigation');
    setIsNavigating(true);
    setCollectedBins(new Set());
    
    if (currentLocation && activeBins.length > 0) {
      updateRoutePolyline(currentLocation, activeBins);
    }
  };

  const handleBinCollected = (binId: string) => {
    console.log('MainScreen: Bin collected:', binId);
    const newCollectedBins = new Set(collectedBins);
    newCollectedBins.add(binId);
    setCollectedBins(newCollectedBins);
    
    // Recalculate the route for remaining bins
    if (currentLocation) {
      updateRoutePolyline(currentLocation, activeBins);
    }
    
    // If all bins are collected, prompt to end route
    if (newCollectedBins.size === activeBins.length) {
      Alert.alert('All Bins Collected',
        'You have collected all bins. Proceed to the dump location?',
        [
          { text: 'Continue', style: 'cancel' },
          { text: 'End Navigation', onPress: handleExitRoute }
        ]
      );
    }
  };

  const handleFinishRoute = () => {
    if (isNavigating) {
      console.log('MainScreen: Ending active navigation');
      Alert.alert(
        'End Navigation',
        `You have collected ${collectedBins.size} of ${activeBins.length} bins. End navigation?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'End Navigation', 
            onPress: () => {
              setIsNavigating(false);
              // Keep route planning mode active
            }
          }
        ]
      );
    } else {
      // If in planning mode, start navigation
      handleStartNavigation();
    }
  };

  const handleExitRoute = () => {
    console.log('MainScreen: Exiting route');
    setIsRouteActive(false);
    setIsNavigating(false);
    setRouteData(null);
    setOptimizedRoute([]);
    setActiveBins([]);
    setCollectedBins(new Set());
    setSelectedBin(null);
    setLastRouteLocation(null);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          onPress: async () => {
            console.log('MainScreen: Logging out');
            await signOut();
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Logout button */}
      <TouchableOpacity 
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <MaterialIcons name="logout" size={24} color="#333" />
      </TouchableOpacity>

      {/* Map container */}
      <View style={[styles.mapContainer, { flex: 1 }]} >
        <MapDisplay
          bins={areaData?.bins || []}
          optimizedRoute={isRouteActive ? optimizedRoute : []}
          // When navigating, fit to the current segment instead of the full route
          fitToRoute={isRouteActive && !isNavigating}
          // Add new props for current segment
          currentSegment={isNavigating ? currentSegmentPolyline : []}
          fitToCurrentSegment={isNavigating}
          routeBins={activeBins}
          area={!isRouteActive ? areaData || undefined : undefined}
          fitToArea={!isRouteActive}
          currentLocation={currentLocation}
          dumpLocation={dumpLocation}
          onBinSelect={handleBinSelect}
          selectedBin={isRouteActive ? null : selectedBin}
        />
      </View>

      <NotificationIcon style={styles.notificationIcon} />

      {/* Loading indicator for route recalculation */}
      {isRouteRecalculating && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      )}

      {/* Details container */}
      <View style={[
        styles.detailsContainer, 
        { height: getDetailsHeight() }
      ]}>
        {!isRouteActive ? (
          // Home view components
          <>
            {selectedBin ? (
              <BinDetails 
                bin={selectedBin} 
                onReportIssue={handleReportIssue}
                onClose={() => setSelectedBin(null)}
              />
            ) : (
              <AreaDetails 
                stats={{
                  totalBins: areaData?.bins?.length || 0,
                  priorityBins: areaData?.bins?.filter(bin => bin.fillLevel > 70).length || 0,
                  avgFill: areaData?.bins?.length ? areaData.bins.reduce((sum, bin) => sum + bin.fillLevel, 0) / areaData.bins.length : 0,
                  urgentBins: areaData?.bins?.filter(bin => bin.fillLevel >= 95).length || 0
                }} 
                onCreateRoute={createOptimizedRoute}
                areaName={areaData?.areaName}
                isLoading={isLoading}
              />
            )}
            <ReportIssueModal
              visible={reportIssueVisible}
              onClose={() => setReportIssueVisible(false)}
              onReport={handleReportSubmit}
            />
          </>
        ) : (
          // Route view components
          isNavigating ? (
            <NavigationSheet
              bins={activeBins}
              collectedBins={collectedBins}
              currentBinIndex={currentBinIndex}
              nextInstruction={nextInstruction}
              distanceToNext={distanceToNext}
              onBinCollected={handleBinCollected}
              onEndNavigation={() => setIsNavigating(false)}
            />
          ) : (
            <RouteDetails
              distance={routeData?.distance || "0 km"}
              estimatedTime={routeData?.duration || "0 min"}
              binsCount={activeBins.length}
              onStartRoute={handleFinishRoute}
              onClose={handleExitRoute}
              routeName={`${activeRouteName} (${activeBins.length} Bins)`}
              isNavigating={isNavigating}
              collectedBins={collectedBins.size}
            />
          )
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapContainer: {
    flex: 1,
  },
  notificationIcon: {
    position: 'absolute',
    right: 20,
    top: 40,
    zIndex: 1000
  },
  logoutButton: {
    position: 'absolute',
    left: 20,
    top: 40,
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 20,
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  detailsContainer: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default MainScreen;
