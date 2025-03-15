import React from 'react';
import { View, StyleSheet } from 'react-native';
import { RouteProp, useNavigation, useRoute, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import RouteCompletionSummary from '../components/RouteCompletionSummary';

type RouteCompletionScreenRouteProp = RouteProp<RootStackParamList, 'RouteCompletion'>;

const RouteCompletionScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<RouteCompletionScreenRouteProp>();

  // Extract route parameters
  const {
    collectedBinsCount,
    totalBinsCount,
    totalDistance,
    totalDuration,
    averageTimePerBin,
    startTime,
    endTime,
    routeEfficiencyScore
  } = route.params;

  const handleComplete = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <RouteCompletionSummary
        collectedBinsCount={collectedBinsCount}
        totalBinsCount={totalBinsCount}
        totalDistance={totalDistance}
        totalDuration={totalDuration}
        averageTimePerBin={averageTimePerBin}
        startTime={startTime}
        endTime={endTime}
        routeEfficiencyScore={routeEfficiencyScore}
        onComplete={handleComplete}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  }
});

export default RouteCompletionScreen;