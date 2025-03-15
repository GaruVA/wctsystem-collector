import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, BackHandler, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, NavigationProp } from '@react-navigation/native'; // Add navigation import
import type { RootStackParamList } from '../navigation/types';
import MapDisplay from '../components/MapDisplay';
import RouteDetails from '../components/RouteDetails';
import AreaDetails from '../components/AreaDetails';
import BinDetails from '../components/BinDetails';
import NotificationIcon from '../components/NotificationIcon';
import ReportIssueModal from '../components/ReportIssueModal';
import NavigationSheet from '../components/NavigationSheet';
// Remove RouteCompletionSummary import since we'll navigate to a screen instead
import { useAuth } from '../context/AuthContext';
import { getCollectorArea, reportIssue, optimizeBinOrder, generateRoutePolyline, getCollectorLocation, collectBin, type AreaData, type Bin } from '../services/api';
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
  const navigation = useNavigation<NavigationProp<RootStackParamList>>(); // Add navigation hook
  
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

  // Add state to track if the dump location has been reached
  const [isDumpLocationReached, setIsDumpLocationReached] = useState(false);

  // Add new state for proximity to current bin
  const [isCloseToCurrentBin, setIsCloseToCurrentBin] = useState(false);

  // Define heights for different states
  const homeDetailsHeight = 399; // Example height for home view
  const routeDetailsHeight = 444; // Example height for route view
  const binDetailsHeight = 465; // Example height for bin details view
  const navigationDetailsHeight = 393; // Height for turn-by-turn navigation sheet
  const navigationDetailsNoCurrentBinHeight = 195; // Height when no current bin is shown

  // Function to get the current details container height
  const getDetailsHeight = () => {
    if (isRouteActive) {
      if (isNavigating) {
        // When navigating, check if we have a current bin
        return currentBinIndex >= 0 && currentBinIndex < activeBins.length 
          ? navigationDetailsHeight 
          : navigationDetailsNoCurrentBinHeight;
      }
      return routeDetailsHeight;
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
        
        // Reset current bin index since all bins are collected
        setCurrentBinIndex(-1);

        // Check if we're already at the dump location
        const isClose = isCloseToWaypoint(
          startLocation,
          [dumpLocation.longitude, dumpLocation.latitude],
          100 // 100m threshold
        );
        
        if (isClose) {
          // If we're at the dump location, show the completion screen
          setIsDumpLocationReached(true);
        }
        
        return;
      }
      
      console.log('MainScreen: Optimizing route for', remainingBins.length, 'uncollected bins');
      
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
        
        // Find the bin that corresponds to the first optimized stop
        const nextBinCoords = optimizedOrder.optimizedStops[0];
        const nextBinIndex = remainingBins.findIndex(bin => 
          bin.location.coordinates[0] === nextBinCoords[0] && 
          bin.location.coordinates[1] === nextBinCoords[1]
        );
        
        // Set the current bin index to the appropriate bin in the activeBins array
        if (nextBinIndex !== -1) {
          const nextActiveBinIndex = activeBins.findIndex(bin => bin._id === remainingBins[nextBinIndex]._id);
          if (nextActiveBinIndex !== -1) {
            console.log('MainScreen: Setting new current bin index to', nextActiveBinIndex);
            setCurrentBinIndex(nextActiveBinIndex);
          }
        }
        
        try {
          // Generate a direct route from current location to the next bin only
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
            setNextInstruction(formatInstruction(firstStep.instruction || "Proceed to next location"));
            setDistanceToNext(
              firstStep.distance || 
              `${segmentRouteData.distance} to next bin`
            );
          } else {
            // Basic instruction if no detailed steps
            setNextInstruction(formatInstruction("Proceed to next bin"));
            setDistanceToNext(segmentRouteData.distance || "Calculating...");
          }
          
          // Check if user is close to the next bin
          const isClose = isCloseToWaypoint(startLocation, nextBinCoords, 100); // 100m threshold
          
          if (isClose) {
            // Update instruction to indicate arrival at bin
            setNextInstruction(formatInstruction("You have arrived at the bin location"));
            setDistanceToNext("Ready to collect");
          }
          
        } catch (segmentError) {
          console.error('MainScreen: Error creating segment polyline:', segmentError);
          // Fallback: Try to extract the segment from the full route
          extractSegmentFromFullRoute(newRouteData.route, optimizedOrder.optimizedStops[0]);
        }
      } else {
        // If no stops left, use the full route (to dump location)
        setCurrentSegmentPolyline(newRouteData.route);
        setNextInstruction("Proceed to dump location");
        setDistanceToNext(`${newRouteData.distance} remaining`);
        
        // Reset current bin index since all bins are collected
        setCurrentBinIndex(-1);
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

  // Effect to check if user is near the dump location
  useEffect(() => {
    if (!isRouteActive || !isNavigating || isDumpLocationReached) return;

    // Check if all bins are collected and user is close to dump location
    if (collectedBins.size === activeBins.length && currentLocation) {
      const isClose = isCloseToWaypoint(
        currentLocation,
        [dumpLocation.longitude, dumpLocation.latitude],
        100 // 100m threshold
      );

      if (isClose) {
        console.log('MainScreen: Dump location reached, showing summary screen');
        setIsDumpLocationReached(true);
      }
    }
  }, [
    currentLocation, 
    dumpLocation, 
    isRouteActive, 
    isNavigating, 
    collectedBins.size,
    activeBins.length,
    isDumpLocationReached
  ]);

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
              
              // Check if user is at dump location after all bins are collected
              if (collectedBins.size === activeBins.length && !isDumpLocationReached) {
                const isClose = isCloseToWaypoint(
                  newLocation,
                  [dumpLocation.longitude, dumpLocation.latitude],
                  100 // 100m threshold
                );
                
                if (isClose) {
                  console.log('MainScreen: Dump location reached, showing summary screen');
                  setIsDumpLocationReached(true);
                }
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
    const interval = isNavigating ? 2000 : isRouteActive ? 30000 : 60000;
    console.log(`MainScreen: Setting location polling interval to ${interval/1000} seconds`);
    
    const locationPoll = setInterval(fetchLocation, interval);
    
    return () => {
      isMounted = false;
      clearInterval(locationPoll);
    };
  }, [token, isRouteActive, isNavigating, activeBins, collectedBins, lastRouteLocation, isDumpLocationReached, dumpLocation]);

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

  // Update the user's proximity to current bin whenever location changes or current bin changes
  useEffect(() => {
    if (!currentLocation || !isNavigating || currentBinIndex < 0 || currentBinIndex >= activeBins.length) {
      setIsCloseToCurrentBin(false);
      return;
    }

    const currentBin = activeBins[currentBinIndex];
    const isClose = isCloseToWaypoint(
      currentLocation,
      currentBin.location.coordinates,
      50 // 50m threshold for bin collection
    );
    
    setIsCloseToCurrentBin(isClose);
  }, [currentLocation, isNavigating, currentBinIndex, activeBins]);

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

  const handleBinCollected = async (binId: string) => {
    console.log('MainScreen: Bin collected:', binId);
    
    if (!token) {
      console.log('MainScreen: No token available');
      return;
    }
  
    try {
      // Update collected bins set
      const newCollectedBins = new Set(collectedBins);
      newCollectedBins.add(binId);
      setCollectedBins(newCollectedBins);
  
      // Call API to mark bin as collected and get updated bin data
      const updatedBin = await collectBin(binId, token);
      
      // Update bin data in areaData state
      setAreaData(prevData => {
        if (!prevData) return null;
        return {
          ...prevData,
          bins: prevData.bins.map(bin => 
            bin._id === binId ? updatedBin : bin
          )
        };
      });
  
      // Update bin data in activeBins state
      setActiveBins(prevBins =>
        prevBins.map(bin =>
          bin._id === binId ? updatedBin : bin
        )
      );
  
      // Find the remaining uncollected bins
      const remainingBins = activeBins.filter(bin => !newCollectedBins.has(bin._id));
      console.log('MainScreen: Remaining bins after collection:', remainingBins.length);
      
      // Clear current segment polyline for visual feedback
      setCurrentSegmentPolyline([]);
      
      // Only proceed with route recalculation if we have current location
      if (!currentLocation) {
        console.log('MainScreen: No current location available, cannot update route');
        setIsRouteRecalculating(false);
        return;
      }
      
      // Set route recalculation loading state
      setIsRouteRecalculating(true);
      
      // Force a complete route recalculation by resetting the last route location
      setLastRouteLocation(null);
      
      // Immediately recalculate route with all bins (collected ones will be filtered in updateRoutePolyline)
      await updateRoutePolyline(currentLocation, activeBins);
      
      console.log('MainScreen: Route updated after bin collection');
      
      // If all bins are collected, the updateRoutePolyline function will automatically
      // create a route to the dump location as the next destination
      if (remainingBins.length === 0) {
        console.log('MainScreen: All bins collected, navigation to dump location started automatically');
        setNextInstruction("Proceed to dump location");
        setDistanceToNext("Calculating route to dump location...");
      }
    } catch (error) {
      console.error('MainScreen: Error updating bin collection status:', error);
      Alert.alert('Error', 'Failed to update bin collection status.');
      
      // Revert collected bins state on error
      const revertedCollectedBins = new Set(collectedBins);
      revertedCollectedBins.delete(binId);
      setCollectedBins(revertedCollectedBins);
    } finally {
      setIsRouteRecalculating(false);
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

  // Handle completion of route after dump location is reached
  const handleRouteSummaryComplete = () => {
    console.log('MainScreen: Route summary complete, returning to home');
    // Reset all route-related state
    setIsDumpLocationReached(false);
    setIsRouteActive(false);
    setIsNavigating(false);
    setRouteData(null);
    setOptimizedRoute([]);
    setActiveBins([]);
    setCollectedBins(new Set());
    setSelectedBin(null);
    setLastRouteLocation(null);
  };

  // Add a new function to navigate to the route completion screen
  const navigateToRouteCompletion = () => {
    console.log('MainScreen: Navigating to route completion screen');
    
    // Calculate route statistics for the completion screen
    const now = new Date();
    const routeStartTime = new Date(now.getTime() - (routeData?.duration ? parseInt(routeData.duration) * 60000 : 0));
    
    // Format times
    const formatTime = (date: Date) => {
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit'
      });
    };
    
    // Calculate average time per bin (if we have bins and duration)
    const routeDurationMinutes = routeData?.duration ? 
      parseInt(routeData.duration.replace(" min", "")) : 0;
    
    const avgTimePerBin = collectedBins.size > 0 && routeDurationMinutes > 0 ? 
      `${Math.round(routeDurationMinutes / collectedBins.size)} min` : 
      "N/A";
    
    // Calculate efficiency score with bonus for completing all bins
    const efficiencyScore = Math.min(100, Math.round(
      (collectedBins.size / activeBins.length) * 100 * 0.7 + 
      (activeBins.length > 0 && collectedBins.size === activeBins.length ? 30 : 0)
    ));
    
    // Navigate to route completion screen with route stats
    navigation.navigate('RouteCompletion', {
      collectedBinsCount: collectedBins.size,
      totalBinsCount: activeBins.length,
      totalDistance: routeData?.distance || "0 km",
      totalDuration: routeData?.duration || "0 min",
      averageTimePerBin: avgTimePerBin,
      startTime: formatTime(routeStartTime),
      endTime: formatTime(now),
      routeEfficiencyScore: efficiencyScore
    });
  };

  // Modify the effect that checks if the dump location is reached
  useEffect(() => {
    if (!isRouteActive || !isNavigating) return;

    // Check if all bins are collected and user is close to dump location
    if (collectedBins.size === activeBins.length && currentLocation) {
      const isClose = isCloseToWaypoint(
        currentLocation,
        [dumpLocation.longitude, dumpLocation.latitude],
        100 // 100m threshold
      );

      if (isClose) {
        console.log('MainScreen: Dump location reached, navigating to summary screen');
        // Reset route states before navigating
        setIsDumpLocationReached(false);
        setIsRouteActive(false);
        setIsNavigating(false);
        
        // Navigate to the route completion screen
        navigateToRouteCompletion();
        
        // Reset other states after navigation
        setRouteData(null);
        setOptimizedRoute([]);
        setActiveBins([]);
        setCollectedBins(new Set());
        setSelectedBin(null);
        setLastRouteLocation(null);
      }
    }
  }, [
    currentLocation, 
    dumpLocation, 
    isRouteActive, 
    isNavigating, 
    collectedBins.size,
    activeBins.length,
    navigation
  ]);

  const handleExitRoute = () => {
    console.log('MainScreen: Exiting route');
    setIsDumpLocationReached(false);
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

  // Function to get appropriate icon based on instruction
  const getDirectionIcon = (instruction: string) => {
    instruction = instruction.toLowerCase();
    if (instruction.includes('arrived')) return 'place';
    if (instruction.includes('left')) return 'turn-left';
    if (instruction.includes('right')) return 'turn-right';
    if (instruction.includes('straight') || instruction.includes('continue')) return 'straighten';
    if (instruction.includes('u-turn')) return 'u-turn-left';
    if (instruction.includes('dump')) return 'local-shipping';
    if (instruction.includes('destination')) return 'place';
    return 'navigation';
  };

  // Function to format navigation instruction into more user-friendly text
  const formatInstruction = (instruction: string) => {
    instruction = instruction.toLowerCase();
    
    // Handle special cases first
    if (instruction.includes('arrived')) {
      return 'You have arrived at the bin location';
    }
    if (instruction.includes('dump')) {
      return 'Head to dump location';
    }
    if (instruction.includes('destination')) {
      return 'Proceed to next bin';
    }

    // Format turn instructions
    if (instruction.includes('turn')) {
      // Extract the direction
      let direction = '';
      if (instruction.includes('left')) direction = 'left';
      else if (instruction.includes('right')) direction = 'right';
      
      // Extract the street name if present
      const ontoMatch = instruction.match(/onto (.+)/);
      const streetName = ontoMatch ? ontoMatch[1] : '';
      
      // Build the instruction
      return streetName 
        ? `Turn ${direction} onto ${streetName}`
        : `Turn ${direction}`;
    }

    // Handle continue/straight instructions
    if (instruction.includes('straight') || instruction.includes('continue')) {
      const onMatch = instruction.match(/on (.+)/);
      const streetName = onMatch ? onMatch[1] : '';
      
      return streetName 
        ? `Continue on ${streetName}`
        : 'Continue straight';
    }

    // Default case - return original instruction with first letter capitalized
    return instruction.charAt(0).toUpperCase() + instruction.slice(1);
  };

  return (
    <View style={styles.container}>
      {/* Only show logout and notification when not navigating */}
      {!isNavigating && (
        <>
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <MaterialIcons name="logout" size={24} color="#333" />
          </TouchableOpacity>
          <NotificationIcon style={styles.notificationIcon} />
        </>
      )}

      {/* Map container */}
      <View style={[styles.mapContainer, { flex: 1 }]} >
        <MapDisplay
          bins={areaData?.bins || []}
          optimizedRoute={isRouteActive ? optimizedRoute : []}
          // When navigating, fit to the current segment instead of the full route
          fitToRoute={isRouteActive && !isNavigating && !isDumpLocationReached}
          // Add new props for current segment
          currentSegment={isNavigating && !isDumpLocationReached ? currentSegmentPolyline : []}
          fitToCurrentSegment={isNavigating && !isDumpLocationReached}
          routeBins={activeBins}
          area={!isRouteActive ? areaData || undefined : undefined}
          fitToArea={!isRouteActive}
          currentLocation={currentLocation}
          dumpLocation={dumpLocation}
          onBinSelect={handleBinSelect}
          selectedBin={isRouteActive ? null : selectedBin}
        />
      </View>

      {/* Show floating directions when navigating */}
      {isNavigating && (
        <View style={styles.floatingDirections}>
          <View style={styles.directionCard}>
            <View style={styles.directionIcon}>
              {/* Use appropriate icon based on the instruction */}
              <MaterialIcons 
                name={getDirectionIcon(nextInstruction)} 
                size={24} 
                color="#3B82F6" 
              />
            </View>
            <View style={styles.directionContent}>
              <Text style={styles.nextInstruction}>{nextInstruction}</Text>
              <Text style={styles.distanceText}>{distanceToNext}</Text>
            </View>
          </View>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${(collectedBins.size / activeBins.length) * 100}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            {collectedBins.size} of {activeBins.length} bins collected
          </Text>
        </View>
      )}

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
              showDirections={false}
              currentLocation={currentLocation}
              isCloseToCurrentBin={isCloseToCurrentBin}
            />
          ) : (
            <RouteDetails
              distance={routeData?.distance || "0 km"}
              estimatedTime={routeData?.duration || "0 min"}
              binsCount={activeBins.length}
              onStartRoute={handleFinishRoute}
              onClose={handleExitRoute}
              routeName={`${activeRouteName} (${activeBins.length} Bins)`}
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
  floatingDirections: {
    position: 'absolute',
    top: 40,
    left: 20,
    right: 20,
    backgroundColor: 'transparent',
  },
  directionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 8,
  },
  directionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EBF5FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  directionContent: {
    flex: 1,
  },
  nextInstruction: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  distanceText: {
    fontSize: 14,
    color: '#6B7280',
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
  },
  progressText: {
    fontSize: 12,
    color: '#fff',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

export default MainScreen;
