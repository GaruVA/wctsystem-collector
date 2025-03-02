import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, BackHandler } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import RouteMap from '../components/RouteMap';
import RouteDetails from '../components/RouteDetails';
import { FAB } from 'react-native-paper';
import * as Location from 'expo-location';
import { useAuth } from '../context/AuthContext';
import { getCollectorLocation } from '../services/api';

interface Bin {
  _id: string;
  location: {
    type: string;
    coordinates: [number, number]; // [longitude, latitude]
  };
  fillLevel: number;
  lastCollected: string;
}

interface RouteData {
  route: [number, number][];
  distance: string;
  duration: string;
  stops_sequence?: number[];
}

interface RouteScreenParams {
  bins: Bin[];
  routeData: RouteData;
  areaName: string;
}

const RouteScreen = () => {
  console.log('RouteScreen: Component rendering');
  const navigation = useNavigation();
  const route = useRoute();
  const { token } = useAuth();
  
  // Get parameters from navigation
  const params = route.params as RouteScreenParams || {};
  const { bins = [], routeData, areaName = 'Collection Route' } = params;
  
  console.log('RouteScreen: Params received', {
    binsCount: bins.length,
    hasRouteData: !!routeData,
    areaName,
    routeDistance: routeData?.distance,
    routeDuration: routeData?.duration
  });
  
  const [currentLocation, setCurrentLocation] = useState({
    latitude: routeData?.route[0]?.[1] || 40.7128, 
    longitude: routeData?.route[0]?.[0] || -74.006
  });
  const [dumpLocation, setDumpLocation] = useState({
    latitude: routeData?.route[routeData?.route?.length - 1]?.[1] || 40.7300,
    longitude: routeData?.route[routeData?.route?.length - 1]?.[0] || -73.9950
  });
  
  console.log('RouteScreen: Initial locations set', {
    currentLocation,
    dumpLocation
  });
  
  // Use the optimized route from the API
  const [optimizedRoute, setOptimizedRoute] = useState<[number, number][]>(
    routeData?.route || []
  );
  console.log(`RouteScreen: Optimized route has ${optimizedRoute.length} points`);

  const [selectedBin, setSelectedBin] = useState<Bin | null>(null);
  const [collectedBins, setCollectedBins] = useState<Set<string>>(new Set());

  // Add loading state while fetching route data
  const [isLoading, setIsLoading] = useState(true);

  // Handle Android back button
  useEffect(() => {
    console.log('RouteScreen: Setting up back handler');
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      console.log('RouteScreen: Back button pressed, navigating back');
      navigation.goBack();
      return true;
    });

    return () => {
      console.log('RouteScreen: Cleaning up back handler');
      backHandler.remove();
    }
  }, [navigation]);

  // First, try to get location from database
  useEffect(() => {
    if (!token) return;

    const fetchDatabaseLocation = async () => {
      console.log('RouteScreen: Attempting to fetch location from database');
      const dbLocation = await getCollectorLocation(token);
      
      if (dbLocation) {
        console.log('RouteScreen: Using location from database', dbLocation);
        setCurrentLocation({
          latitude: dbLocation[1],
          longitude: dbLocation[0]
        });
      } else {
        console.log('RouteScreen: No location in database, will use device GPS');
      }
    };
    
    fetchDatabaseLocation();
  }, [token]);

  // Set up polling to get location from database
  useEffect(() => {
    if (!token) return;

    console.log('RouteScreen: Setting up database location polling');
    
    // Track if component is mounted
    let isMounted = true;
    
    // Function to fetch location from database
    const fetchLocation = async () => {
      if (!isMounted || !token) return;
      
      console.log('RouteScreen: Fetching location from database');
      const dbLocation = await getCollectorLocation(token);
      
      if (dbLocation && isMounted) {
        console.log('RouteScreen: Updating location from database:', dbLocation);
        setCurrentLocation({
          latitude: dbLocation[1],
          longitude: dbLocation[0]
        });
      } else if (isMounted) {
        console.log('RouteScreen: No location in database or fetch failed');
      }
    };
    
    // Initial fetch
    fetchLocation();
    
    // Set up polling interval - check database every 3 seconds for location updates
    const locationPollInterval = setInterval(fetchLocation, 3000);
    
    return () => {
      console.log('RouteScreen: Cleaning up database polling');
      isMounted = false;
      clearInterval(locationPollInterval);
    };
  }, [token]);

  // Handle errors better if route data is missing
  useEffect(() => {
    if (!routeData || !routeData.route || routeData.route.length === 0) {
      console.error('RouteScreen: Missing or invalid route data');
      Alert.alert(
        'Route Error',
        'Could not load route data. Please try again.',
        [{ text: 'Go Back', onPress: () => navigation.goBack() }]
      );
    } else {
      setIsLoading(false);
    }
  }, [routeData]);

  const handleFinishRoute = () => {
    console.log('RouteScreen: Finishing route');
    // Here you would submit route completion data to backend
    Alert.alert(
      'End Route',
      `You collected ${collectedBins.size} of ${bins.length} bins. Return to the main screen?`,
      [
        { text: 'Cancel', style: 'cancel', onPress: () => console.log('RouteScreen: Finish route cancelled') },
        { 
          text: 'End Route', 
          onPress: () => {
            console.log('RouteScreen: Route ended, navigating back');
            navigation.goBack();
          }
        }
      ]
    );
  };

  const handleCloseRoute = () => {
    Alert.alert(
      'Close Route',
      'Are you sure you want to exit this route?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Exit', 
          onPress: () => {
            console.log('RouteScreen: Exiting route via close button');
            navigation.goBack();
          }
        }
      ]
    );
  };

  const handleBinSelect = (bin: Bin) => {
    console.log('RouteScreen: Bin selected', { binId: bin._id, fillLevel: bin.fillLevel });
    setSelectedBin(bin);
    
    Alert.alert(
      'Collect Bin',
      `Would you like to mark this bin (${bin._id.substring(0, 8)}...) as collected?`,
      [
        { text: 'Cancel', style: 'cancel', onPress: () => console.log('RouteScreen: Bin collection cancelled') },
        { 
          text: 'Collect', 
          onPress: () => {
            console.log('RouteScreen: Marking bin as collected', bin._id);
            setCollectedBins(prev => {
              const newSet = new Set([...prev, bin._id]);
              console.log(`RouteScreen: Now ${newSet.size} bins collected out of ${bins.length}`);
              return newSet;
            });
            Alert.alert('Bin Collected', 'The bin has been marked as collected.');
          }
        }
      ]
    );
  };

  console.log('RouteScreen: Rendering with', {
    binsCount: bins.length,
    collectedBinsCount: collectedBins.size,
    routePoints: optimizedRoute.length
  });

  return (
    <View style={styles.container}>
      <RouteMap
        bins={bins}
        optimizedRoute={optimizedRoute}
        currentLocation={currentLocation}
        dumpLocation={dumpLocation}
        onBinSelect={handleBinSelect}
      />
      
      <View style={styles.detailsContainer}>
        <RouteDetails
          distance={routeData?.distance || "0 km"}
          estimatedTime={routeData?.duration || "0 min"}
          binsCount={bins.length}
          onStartRoute={handleFinishRoute}
          onClose={handleCloseRoute}
          routeName={areaName}
        />
      </View>
      
      {/* You could remove the FAB since we now have a close button */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  detailsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
  },
  fab: {
    position: 'absolute',
    top: 40,
    left: 16,
    backgroundColor: 'white',
  },
});

export default RouteScreen;
