import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import InteractiveMap from '../components/InteractiveMap';
import BottomSheetWrapper from '../components/BottomSheetWrapper';
import NotificationIcon from '../components/NotificationIcon';
import ReportIssueModal from '../components/ReportIssueModal';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { getCollectorArea, reportIssue, getOptimizedRoute, type AreaData, type Bin } from '../services/api';

const HomeScreen = () => {
  console.log('HomeScreen: Component rendering');
  const { token } = useAuth();
  const navigation = useNavigation<any>();
  const [areaData, setAreaData] = useState<AreaData | null>(null);
  const [selectedBin, setSelectedBin] = useState<Bin | null>(null);
  const [reportIssueVisible, setReportIssueVisible] = useState(false);
  const [selectedBinId, setSelectedBinId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dumpLocation, setDumpLocation] = useState({
    latitude: 40.7300,
    longitude: -73.9950
  });

  useEffect(() => {
    console.log('HomeScreen: Initial useEffect triggered, token exists:', !!token);
    const loadAreaData = async () => {
      if (!token) {
        console.log('HomeScreen: No token available, skipping area data fetch');
        return;
      }
      try {
        console.log('HomeScreen: Fetching area data');
        const data = await getCollectorArea(token);
        console.log('HomeScreen: Area data fetched successfully');
        setAreaData(data);
        
        // Set dump location from backend response if available
        if (data.dumpLocation) {
          console.log('HomeScreen: Dump location found in response, updating state');
          setDumpLocation({
            latitude: data.dumpLocation.coordinates[1],
            longitude: data.dumpLocation.coordinates[0]
          });
        } else {
          console.log('HomeScreen: No dump location in response, using default');
        }
      } catch (error) {
        console.error('HomeScreen: Failed to load area data:', error);
      }
    };
    loadAreaData();
  }, [token]);

  const handleReportIssue = (binId: string) => {
    console.log('HomeScreen: Reporting issue for bin:', binId);
    setSelectedBinId(binId);
    setReportIssueVisible(true);
  };

  const handleReportSubmit = async (issueType: string, description: string) => {
    console.log('HomeScreen: Submitting issue report', { issueType, description, binId: selectedBinId });
    if (selectedBinId) {
      try {
        await reportIssue(selectedBinId, issueType, description);
        console.log('HomeScreen: Issue reported successfully');
      } catch (error) {
        console.error('HomeScreen: Failed to report issue:', error);
      }
    } else {
      console.error('HomeScreen: No bin id selected!');
    }
    setReportIssueVisible(false);
  };

  const createOptimizedRoute = async () => {
    console.log('HomeScreen: Creating optimized route');
    if (!areaData) {
      console.log('HomeScreen: No area data available, cannot create route');
      return;
    }
    
    try {
      setIsLoading(true);
      console.log('HomeScreen: Set loading state to true');
      
      // Get bins with high fill levels (e.g., > 70%)
      const priorityBins = areaData.bins.filter(bin => bin.fillLevel > 70);
      console.log(`HomeScreen: Found ${priorityBins.length} priority bins out of ${areaData.bins.length} total`);
      
      if (priorityBins.length === 0) {
        console.log('HomeScreen: No priority bins found, showing alert');
        Alert.alert('No Priority Bins', 'There are no bins with fill level above 70% to collect.');
        setIsLoading(false);
        return;
      }
      
      // Get driver's current location (in real app, use Geolocation)
      const driverLocation = {
        latitude: 40.748,
        longitude: -73.98
      };
      console.log('HomeScreen: Using driver location:', driverLocation);
      
      console.log('HomeScreen: Requesting route optimization');
      // Call route optimization API
      const routeData = await getOptimizedRoute(
        driverLocation,
        priorityBins.map(bin => bin.location.coordinates),
        dumpLocation
      );
      console.log('HomeScreen: Route optimization successful', {
        distance: routeData.distance,
        duration: routeData.duration,
        routePoints: routeData.route.length
      });
      
      // Navigate to route screen with the data
      console.log('HomeScreen: Navigating to Route screen');
      navigation.navigate('Route', { 
        bins: priorityBins,
        routeData: routeData,
        areaName: areaData.areaName
      });
    } catch (error) {
      console.error('HomeScreen: Failed to create route:', error);
      Alert.alert('Error', 'Failed to create optimized route. Please try again.');
    } finally {
      console.log('HomeScreen: Setting loading state to false');
      setIsLoading(false);
    }
  };

  console.log('HomeScreen: Rendering component', {
    hasAreaData: !!areaData,
    selectedBin: selectedBin?._id || 'none',
    isLoading
  });

  // Add test route function
  const navigateToTestRoute = () => {
    navigation.navigate('Route');
  };

  return (
    <View style={styles.container}>
      {areaData && (
        <InteractiveMap
          areaData={areaData}
          onBinSelect={setSelectedBin}
          selectedBin={selectedBin}
        />
      )}
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  notificationIcon: {
    position: 'absolute',
    right: 20,
    top: 40,
    zIndex: 1000
  },
  testButton: {
    position: 'absolute',
    left: 20,
    top: 40,
    backgroundColor: '#3B82F6',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    zIndex: 1000
  },
  testButtonText: {
    color: 'white',
    fontWeight: 'bold'
  }
});

export default HomeScreen;