import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
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
}

const NavigationSheet = ({ 
  bins,
  collectedBins,
  currentBinIndex,
  nextInstruction = "Proceed to the first bin",
  distanceToNext = "Calculating...",
  onBinCollected,
  onEndNavigation
}: NavigationSheetProps) => {
  // Calculate the remaining bins count
  const remainingBins = bins.length - collectedBins.size;
  
  // Format the bin address or provide default
  const formatAddress = (bin: Bin) => {
    return bin.address || `Bin at ${bin.location.coordinates[1].toFixed(6)}, ${bin.location.coordinates[0].toFixed(6)}`;
  };
  
  const getBinStatus = (bin: Bin, index: number) => {
    // Already collected
    if (collectedBins.has(bin._id)) {
      return {
        icon: "check-circle" as const,
        iconColor: "#10B981",
        containerStyle: styles.collectedItem,
        textStyle: styles.collectedText
      };
    }
    
    // Current bin to collect
    if (index === currentBinIndex) {
      return {
        icon: "location-on" as const,
        iconColor: "#3B82F6", 
        containerStyle: styles.currentItem,
        textStyle: styles.currentText
      };
    }
    
    // Future bin - using a valid Material Icon name
    return {
      icon: "radio-button-unchecked" as const, // Changed from "circle-outline" to a valid icon name
      iconColor: "#6B7280",
      containerStyle: {},
      textStyle: {}
    };
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Turn-by-Turn Navigation</Text>
        <TouchableOpacity 
          style={styles.closeButton}
          onPress={onEndNavigation}
        >
          <MaterialIcons name="close" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {/* Next instruction and current stats */}
      <View style={styles.instructionContainer}>
        <View style={styles.instructionIconContainer}>
          <MaterialIcons 
            name="directions" 
            size={24} 
            color="#3B82F6" 
          />
        </View>
        <View style={styles.instructionTextContainer}>
          <Text style={styles.instructionText}>{nextInstruction}</Text>
          <Text style={styles.distanceText}>{distanceToNext}</Text>
        </View>
      </View>
      
      {/* Bins list */}
      <View style={styles.listContainer}>
        <Text style={styles.listHeader}>Collection Route</Text>
        <FlatList
          data={bins}
          keyExtractor={(item) => item._id}
          renderItem={({ item, index }) => {
            const { icon, iconColor, containerStyle, textStyle } = getBinStatus(item, index);
            
            return (
              <View style={[styles.binItem, containerStyle]}>
                <MaterialIcons name={icon} size={24} color={iconColor} />
                <View style={styles.binTextContainer}>
                  <Text style={[styles.binAddress, textStyle]}>
                    {formatAddress(item)}
                  </Text>
                  <Text style={[styles.fillLevel, textStyle]}>
                    Fill Level: {item.fillLevel}%
                  </Text>
                </View>
                
                {index === currentBinIndex && !collectedBins.has(item._id) && (
                  <TouchableOpacity 
                    style={styles.collectButton}
                    onPress={() => onBinCollected(item._id)}
                  >
                    <Text style={styles.collectButtonText}>Collect</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          }}
          style={styles.list}
        />
      </View>
      
      {/* End navigation button */}
      <TouchableOpacity 
        style={styles.endButton}
        onPress={onEndNavigation}
      >
        <MaterialIcons name="stop" size={20} color="#fff" />
        <Text style={styles.buttonText}>End Navigation</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
  instructionContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
  },
  instructionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EBF5FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  instructionTextContainer: {
    flex: 1,
  },
  instructionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  distanceText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  listContainer: {
    flex: 1,
    padding: 16,
  },
  listHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  list: {
    flex: 1,
  },
  binItem: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    alignItems: 'center',
  },
  currentItem: {
    backgroundColor: '#EBF5FF',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  collectedItem: {
    opacity: 0.6,
  },
  binTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  binAddress: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
  },
  fillLevel: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  currentText: {
    color: '#3B82F6',
    fontWeight: '500',
  },
  collectedText: {
    textDecorationLine: 'line-through',
  },
  collectButton: {
    backgroundColor: '#10B981',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  collectButtonText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 14,
  },
  endButton: {
    backgroundColor: '#EF4444',
    paddingVertical: 14,
    margin: 16,
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
});

export default NavigationSheet;