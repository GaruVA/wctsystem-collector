import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface Bin {
  _id: string;
  location: {
    type: string;
    coordinates: [number, number];
  };
  fillLevel: number;
  lastCollected: string;
}

interface BinStateProps {
  bin: Bin;
  onReportIssue: (binId: string) => void;
  onClose: () => void;
}

const BinState = ({ bin, onReportIssue, onClose }: BinStateProps) => {
  console.log('BinState: Rendering component for bin', bin._id);
  
  // Format date nicely
  const formatDate = (dateString: string) => {
    console.log(`BinState: Formatting date ${dateString}`);
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('BinState: Error formatting date:', error);
      return 'Unknown date';
    }
  };

  // Determine fill level color and status text
  const getFillLevelColor = (fillLevel: number) => {
    console.log(`BinState: Getting color for fill level ${fillLevel}`);
    if (fillLevel >= 95) return '#FF3B30'; // Red
    if (fillLevel >= 70) return '#FF9500'; // Orange
    if (fillLevel >= 40) return '#FFCC00'; // Yellow
    return '#34C759'; // Green
  };

  const getFillLevelStatus = (fillLevel: number) => {
    console.log(`BinState: Getting status for fill level ${fillLevel}`);
    if (fillLevel >= 95) return 'Critical';
    if (fillLevel >= 70) return 'High';
    if (fillLevel >= 40) return 'Medium';
    return 'Low';
  };

  const fillLevelColor = getFillLevelColor(bin.fillLevel);
  const fillLevelStatus = getFillLevelStatus(bin.fillLevel);
  const formattedDate = formatDate(bin.lastCollected);

  console.log('BinState: Bin details calculated', {
    fillLevelStatus,
    formattedDate,
    coordinates: bin.location.coordinates
  });

  return (
    <View style={styles.container}>
      {/* Header with bin ID and close button */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bin Details</Text>
        <TouchableOpacity 
          style={styles.closeButton}
          onPress={() => {
            console.log('BinState: Close button pressed');
            onClose();
          }}
        >
          <MaterialIcons name="close" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {/* Bin details content */}
      <View style={styles.content}>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Bin ID:</Text>
          <Text style={styles.value}>{bin._id}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Fill Level:</Text>
          <View style={styles.fillLevelContainer}>
            <View style={[styles.fillLevelBar, { width: `${bin.fillLevel}%`, backgroundColor: fillLevelColor }]} />
            <Text style={styles.fillLevelText}>{`${bin.fillLevel}% (${fillLevelStatus})`}</Text>
          </View>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Last Collected:</Text>
          <Text style={styles.value}>{formattedDate}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Location:</Text>
          <Text style={styles.value}>
            {`${bin.location.coordinates[1].toFixed(6)}, ${bin.location.coordinates[0].toFixed(6)}`}
          </Text>
        </View>

        {/* Report Issue button */}
        <TouchableOpacity 
          style={styles.reportButton} 
          onPress={() => {
            console.log('BinState: Report issue button pressed for bin', bin._id);
            onReportIssue(bin._id);
          }}
        >
          <MaterialIcons name="report-problem" size={18} color="white" />
          <Text style={styles.reportButtonText}>Report Issue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative', // Added to position the close button absolutely
  },
  headerTitle: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center', // Ensure text is centered
  },
  closeButton: {
    position: 'absolute',
    right: 12,
    top: 12,
    padding: 4,
  },
  content: {
    padding: 16,
  },
  detailRow: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  fillLevelContainer: {
    height: 24,
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  fillLevelBar: {
    height: '100%',
    position: 'absolute',
    left: 0,
    top: 0,
  },
  fillLevelText: {
    position: 'absolute',
    width: '100%',
    textAlign: 'center',
    lineHeight: 24,
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  reportButton: {
    backgroundColor: '#EF4444',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  reportButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default BinState;