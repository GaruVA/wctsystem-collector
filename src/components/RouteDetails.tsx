import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface RouteDetailsProps {
  distance: string;  // e.g. "5.2 km"
  estimatedTime: string; // e.g. "25 min"
  binsCount: number;
  onStartRoute: () => void;
  onClose?: () => void;
  routeName?: string;
  isNavigating?: boolean; // New prop to indicate if in navigation mode
  collectedBins?: number; // New prop to track collected bins
}

const RouteDetails = ({ 
  distance, 
  estimatedTime, 
  binsCount, 
  onStartRoute,
  onClose,
  routeName = 'Route Overview',
  isNavigating = false,
  collectedBins = 0
}: RouteDetailsProps) => {
  console.log('RouteDetails: Component rendering', {
    distance,
    estimatedTime,
    binsCount,
    routeName,
    isNavigating,
    collectedBins
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{routeName}</Text>
        {onClose && (
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={() => {
              console.log('RouteDetails: Close button pressed');
              onClose();
            }}
          >
            <MaterialIcons name="close" size={24} color="black" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.statsRow}>
          <View style={styles.statBlock}>
            <Text style={styles.label}>Total Distance</Text>
            <Text style={styles.value}>{distance}</Text>
          </View>
          <View style={styles.statBlock}>
            <Text style={styles.label}>Estimated Time</Text>
            <Text style={styles.value}>{estimatedTime}</Text>
          </View>
        </View>

        {isNavigating ? (
          // Navigation mode UI
          <View>
            <View style={styles.progressContainer}>
              <Text style={styles.progressLabel}>Collection Progress</Text>
              <View style={styles.progressBarContainer}>
                <View 
                  style={[
                    styles.progressBar,
                    { width: `${binsCount > 0 ? (collectedBins / binsCount) * 100 : 0}%` }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>
                {collectedBins} of {binsCount} bins collected
              </Text>
            </View>

            <TouchableOpacity 
              style={[styles.button, styles.endButton]} 
              onPress={onStartRoute}
            >
              <MaterialIcons name="stop" size={20} color="#fff" />
              <Text style={styles.buttonText}>End Navigation</Text>
            </TouchableOpacity>
          </View>
        ) : (
          // Planning mode UI
          <View>
            <View style={styles.editTip}>
              <MaterialIcons name="info-outline" size={16} color="#3B82F6" />
              <Text style={styles.tipText}>
                Tap bins on map to add or remove them from route
              </Text>
            </View>

            <TouchableOpacity 
              style={styles.startButton} 
              onPress={() => {
                console.log('RouteDetails: Start route button pressed');
                onStartRoute();
              }}
            >
              <MaterialIcons name="directions" size={20} color="#fff" />
              <Text style={styles.buttonText}>Start Route</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingVertical: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#fff',
  },
  headerTitle: {
    color: '#111827',
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    right: 12,
    top: 14,
    padding: 4,
  },
  content: {
    padding: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  statBlock: {
    alignItems: 'center',
    flex: 1,
    padding: 8,
  },
  label: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  value: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  startButton: {
    backgroundColor: '#10B981', // Green
    paddingVertical: 14,
    marginTop: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  endButton: {
    backgroundColor: '#EF4444', // Red for ending navigation
    paddingVertical: 14,
    marginTop: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    paddingVertical: 14,
    marginTop: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginLeft: 8,
  },
  editTip: {
    backgroundColor: '#EBF5FF',
    padding: 10,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  tipText: {
    color: '#3B82F6',
    marginLeft: 6,
    fontSize: 14,
  },
  progressContainer: {
    marginVertical: 16,
  },
  progressLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: '#E5E7EB',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#10B981', // Green
  },
  progressText: {
    fontSize: 14,
    color: '#111827',
    textAlign: 'center',
  },
});

export default RouteDetails;
