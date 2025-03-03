import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, BackHandler, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import MapDisplay from '../components/MapDisplay';
import RouteDetails from '../components/RouteDetails';
import BottomSheetWrapper from '../components/BottomSheetWrapper';
import NotificationIcon from '../components/NotificationIcon';
import ReportIssueModal from '../components/ReportIssueModal';
import { useAuth } from '../context/AuthContext';
import { getCollectorArea, reportIssue, getOptimizedRoute, getCollectorLocation, type AreaData, type Bin } from '../services/api';

interface RouteData {
  route: [number, number][];
  distance: string;
  duration: string;
  stops_sequence?: number[];
}

const MainScreen = () => {
  console.log('MainScreen: Component rendering');
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
  const [activeBins, setActiveBins] = useState<Bin[]>([]);
  const [activeRouteName, setActiveRouteName] = useState('Route Overview');
  const [routeData, setRouteData] = useState<RouteData | null>(null);
  const [optimizedRoute, setOptimizedRoute] = useState<[number, number][]>([]);
  const [collectedBins, setCollectedBins] = useState<Set<string>>(new Set());

  // State for route recalculation loading
  const [isRouteRecalculating, setIsRouteRecalculating] = useState(false);

  // Load area data
  useEffect(() => {
    console.log('MainScreen: Loading area data, token exists:', !!token);
    if (!token) return;
    
    const loadAreaData = async () => {
      try {
        console.log('MainScreen: Fetching area data');
        setIsLoading(true);
        const data = await getCollectorArea(token);
        console.log('MainScreen: Area data fetched successfully');
        setAreaData(data);
        
        if (data.dumpLocation) {
          console.log('MainScreen: Setting dump location from area data');
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
          console.log('MainScreen: Location update from database:', dbLocation);
          setCurrentLocation({
            latitude: dbLocation[1],
            longitude: dbLocation[0]
          });
        }
      } catch (error) {
        console.error('MainScreen: Error fetching location:', error);
      }
    };
    
    fetchLocation();
    
    // Poll more frequently if in route mode
    const interval = isRouteActive ? 3000 : 10000;
    const locationPoll = setInterval(fetchLocation, interval);
    
    return () => {
      isMounted = false;
      clearInterval(locationPoll);
    };
  }, [token, isRouteActive]);

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

  // Home screen functions
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

  // Create and start route
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
      
      // Set route active first to switch UI mode
      setActiveBins(priorityBins);
      setActiveRouteName(areaData.areaName);
      setIsRouteActive(true);
      setCollectedBins(new Set());
      
      // Calculate initial route
      await recalculateRoute(priorityBins);
      
    } catch (error: any) {
      console.error('MainScreen: Failed to create route:', error);
      setIsRouteActive(false); // Revert to home mode on error
      
      if (error.response && error.response.status === 401) {
        Alert.alert('Authentication Error', 'Your session has expired. Please log out and log in again.');
      } else if (error.message === 'Network Error') {
        Alert.alert('Network Error', 'Cannot connect to the server. Please check your internet connection.');
      } else {
        Alert.alert('Route Creation Failed', 'Could not create an optimized route. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Function to recalculate route when bins change
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
        typeof currentLocation.longitude === 'number' 
          ? currentLocation
          : {
              latitude: binsForRoute[0].location.coordinates[1],
              longitude: binsForRoute[0].location.coordinates[0]
            };
      
      // Call route optimization API
      const newRouteData = await getOptimizedRoute(
        startLocation,
        binsForRoute.map(bin => bin.location.coordinates),
        dumpLocation,
        token
      );
      
      console.log('MainScreen: Route recalculation successful');
      
      // Update route data state
      setRouteData(newRouteData);
      setOptimizedRoute(newRouteData.route);
      
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
      
      // Check if this bin is already part of the route
      const binIndex = activeBins.findIndex(b => b._id === bin._id);
      let newActiveBins: Bin[] = [];
      
      if (binIndex >= 0) {
        // Bin is already in route - remove it
        console.log('MainScreen: Removing bin from route:', bin._id);
        newActiveBins = [...activeBins];
        newActiveBins.splice(binIndex, 1);
      } else {
        // Bin is not in route - add it
        console.log('MainScreen: Adding bin to route:', bin._id);
        newActiveBins = [...activeBins, bin];
      }
      
      // Update active bins state
      setActiveBins(newActiveBins);
      
      // Recalculate the route
      if (newActiveBins.length > 0) {
        recalculateRoute(newActiveBins);
      } else {
        // No bins left in route - show alert
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
      // Home mode bin selection
      console.log('MainScreen: Selected bin in home view:', bin._id);
      setSelectedBin(bin);
    }
  };

  const handleFinishRoute = () => {
    console.log('MainScreen: Finishing route');
    Alert.alert(
      'End Route',
      `You collected ${collectedBins.size} of ${activeBins.length} bins. End route?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'End Route', 
          onPress: handleExitRoute
        }
      ]
    );
  };

  const handleExitRoute = () => {
    console.log('MainScreen: Exiting route');
    setIsRouteActive(false);
    setRouteData(null);
    setOptimizedRoute([]);
    setActiveBins([]);
    setCollectedBins(new Set());
    setSelectedBin(null); // Clear any selected bin when exiting
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

  console.log('MainScreen: Rendering, route active:', isRouteActive);

  return (
    <View style={styles.container}>
      {/* Logout button */}
      <TouchableOpacity 
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <MaterialIcons name="logout" size={24} color="#333" />
      </TouchableOpacity>

      {/* Map is always shown, but with different props based on mode */}
      <MapDisplay
        bins={areaData?.bins || []} // Always show all bins
        optimizedRoute={isRouteActive ? optimizedRoute : []}
        fitToRoute={isRouteActive}
        routeBins={activeBins}
        area={!isRouteActive ? areaData || undefined : undefined}
        fitToArea={!isRouteActive}
        currentLocation={currentLocation}
        dumpLocation={dumpLocation}
        onBinSelect={handleBinSelect}
        selectedBin={isRouteActive ? null : selectedBin}
      />

      {/* Loading indicator for route recalculation */}
      {isRouteRecalculating && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      )}

      {!isRouteActive ? (
        // Home view components
        <>
          <NotificationIcon style={styles.notificationIcon} />
          
          <BottomSheetWrapper
            areaData={areaData}
            selectedBin={selectedBin}
            onCreateRoute={createOptimizedRoute}
            onReportIssue={handleReportIssue}
            onCloseBin={() => setSelectedBin(null)}
            isLoading={isLoading}
          />
          
          <ReportIssueModal
            visible={reportIssueVisible}
            onClose={() => setReportIssueVisible(false)}
            onReport={handleReportSubmit}
          />
        </>
      ) : (
        // Route view components
        <View style={styles.detailsContainer}>
          <RouteDetails
            distance={routeData?.distance || "0 km"}
            estimatedTime={routeData?.duration || "0 min"}
            binsCount={activeBins.length}
            onStartRoute={handleFinishRoute}
            onClose={handleExitRoute}
            routeName={`${activeRouteName} (${activeBins.length} Bins)`}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
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
