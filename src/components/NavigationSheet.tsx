import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface Bin {
  _id: string;
  location: {
    type: string;
    coordinates: [number, number];
  };
  fillLevel: number;
  lastCollected: string;
  address?: string;
}

interface NavigationSheetProps {
  bins: Bin[];
  collectedBins: Set<string>;
  currentBinIndex: number;
  nextInstruction?: string;
  distanceToNext?: string;
  onBinCollected: (binId: string) => void;
  onEndNavigation: () => void;
  showDirections?: boolean; // Add new prop to control directions visibility
}

const NavigationSheet = ({ 
  bins,
  collectedBins,
  currentBinIndex,
  nextInstruction = "Proceed to the first bin",
  distanceToNext = "Calculating...",
  onBinCollected,
  onEndNavigation,
  showDirections = true // Default to true for backward compatibility
}: NavigationSheetProps) => {
  const currentBin = bins[currentBinIndex];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Collection Route</Text>
        <TouchableOpacity 
          style={styles.closeButton}
          onPress={onEndNavigation}
        >
          <MaterialIcons name="close" size={24} color="#111827" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Only show instruction card if showDirections is true */}
        {showDirections && (
          <View style={styles.instructionCard}>
            <View style={styles.instructionIconContainer}>
              <MaterialIcons name="navigation" size={24} color="#3B82F6" />
            </View>
            <View style={styles.instructionContent}>
              <Text style={styles.instructionText}>{nextInstruction}</Text>
              <Text style={styles.distanceText}>{distanceToNext}</Text>
            </View>
          </View>
        )}
        
        {/* Progress indicator */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <MaterialIcons name="route" size={20} color="#3B82F6" />
            <Text style={styles.progressTitle}>Collection Progress</Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View 
              style={[
                styles.progressBar, 
                { width: `${(collectedBins.size / bins.length) * 100}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            {collectedBins.size} of {bins.length} bins collected
          </Text>
        </View>

        {currentBin && (
          <View style={styles.currentBinCard}>
            <Text style={styles.currentBinTitle}>Current Bin</Text>
            <View style={styles.binDetails}>
              <View style={styles.binInfoRow}>
                <MaterialIcons name="location-on" size={20} color="#3B82F6" />
                <Text style={styles.binAddress}>
                  {currentBin.address || `Bin at ${currentBin.location.coordinates[1].toFixed(6)}, ${currentBin.location.coordinates[0].toFixed(6)}`}
                </Text>
              </View>
              <View style={styles.binInfoRow}>
                <MaterialIcons name="opacity" size={20} color="#6B7280" />
                <Text style={styles.binFillLevel}>Fill Level: {currentBin.fillLevel}%</Text>
              </View>
              {!collectedBins.has(currentBin._id) && (
                <TouchableOpacity 
                  style={styles.collectButton}
                  onPress={() => onBinCollected(currentBin._id)}
                >
                  <MaterialIcons name="check" size={20} color="#fff" />
                  <Text style={styles.collectButtonText}>Collect Bin</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    color: '#111827',
    fontWeight: 'bold',
    fontSize: 18,
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  instructionCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  instructionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EBF5FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  instructionContent: {
    flex: 1,
  },
  instructionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  distanceText: {
    fontSize: 14,
    color: '#6B7280',
  },
  progressCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 8,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#3B82F6',
  },
  progressText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  currentBinCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
  },
  currentBinTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  binDetails: {
    gap: 12,
  },
  binInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  binAddress: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
  },
  binFillLevel: {
    fontSize: 14,
    color: '#6B7280',
  },
  collectButton: {
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
    marginTop: 4,
  },
  collectButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  endButton: {
    backgroundColor: '#EF4444',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    gap: 8,
  },
  endButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default NavigationSheet;