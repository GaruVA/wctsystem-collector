import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, BackHandler } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import RouteMap from '../components/RouteMap';
import RouteDetails from '../components/RouteDetails';
import { FAB } from 'react-native-paper';

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

  // Handle location updates
  useEffect(() => {
    console.log('RouteScreen: Setting up location simulation');
    // In a real app, use Geolocation service
    const locationTimer = setInterval(() => {
      // Simulate location change - replace with actual geolocation
      setCurrentLocation(prev => {
        const newLocation = {
          latitude: prev.latitude + (Math.random() - 0.5) * 0.001,
          longitude: prev.longitude + (Math.random() - 0.5) * 0.001
        };
        console.log('RouteScreen: Location updated', newLocation);
        return newLocation;
      });
    }, 5000);

    return () => {
      console.log('RouteScreen: Cleaning up location timer');
      clearInterval(locationTimer);
    }
  }, []);

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
          routeName={areaName}
        />
      </View>
      
      <FAB
        style={styles.fab}
        icon="arrow-left"
        onPress={() => navigation.goBack()}
      />
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
