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
  address?: string; // Add address field
}

interface BinDetailsProps {
  bin: Bin;
  onReportIssue: (binId: string) => void;
  onClose: () => void;
}

const BinDetails = ({ bin, onReportIssue, onClose }: BinDetailsProps) => {
  const formatDate = (dateString: string) => {
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
      return 'Unknown date';
    }
  };

  const getFillLevelColor = (fillLevel: number) => {
    if (fillLevel >= 95) return '#EF4444'; // Red
    if (fillLevel >= 70) return '#F59E0B'; // Orange
    if (fillLevel >= 40) return '#FBBF24'; // Yellow
    return '#10B981'; // Green
  };

  const getFillLevelStatus = (fillLevel: number) => {
    if (fillLevel >= 95) return 'Critical';
    if (fillLevel >= 70) return 'High';
    if (fillLevel >= 40) return 'Medium';
    return 'Low';
  };

  const fillLevelColor = getFillLevelColor(bin.fillLevel);
  const fillLevelStatus = getFillLevelStatus(bin.fillLevel);
  const formattedDate = formatDate(bin.lastCollected);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bin Details</Text>
        <TouchableOpacity 
          style={styles.closeButton}
          onPress={onClose}
        >
          <MaterialIcons name="close" size={24} color="#111827" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Fill Level Status Card */}
        <View style={styles.fillLevelCard}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="opacity" size={20} color="#3B82F6" />
            <Text style={styles.cardTitle}>Fill Level Status</Text>
          </View>
          <View style={styles.fillLevelBarContainer}>
            <View 
              style={[
                styles.fillLevelBar, 
                { width: `${bin.fillLevel}%`, backgroundColor: fillLevelColor }
              ]} 
            />
          </View>
          <Text style={styles.fillLevelText}>
            {`${bin.fillLevel}% - ${fillLevelStatus}`}
          </Text>
        </View>

        {/* Location and Collection Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <MaterialIcons name="location-on" size={20} color="#3B82F6" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Location</Text>
              <Text style={styles.infoValue}>
                {bin.address || `${bin.location.coordinates[1].toFixed(6)}, ${bin.location.coordinates[0].toFixed(6)}`}
              </Text>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.infoRow}>
            <MaterialIcons name="schedule" size={20} color="#3B82F6" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Last Collection</Text>
              <Text style={styles.infoValue}>{formattedDate}</Text>
            </View>
          </View>
        </View>

        {/* Report Issue Button */}
        <TouchableOpacity 
          style={styles.reportButton} 
          onPress={() => onReportIssue(bin._id)}
        >
          <MaterialIcons name="report-problem" size={20} color="#fff" />
          <Text style={styles.buttonText}>Report Issue</Text>
        </TouchableOpacity>
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
    padding: 20,
  },
  fillLevelCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 8,
  },
  fillLevelBarContainer: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  fillLevelBar: {
    height: '100%',
  },
  fillLevelText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
  },
  reportButton: {
    backgroundColor: '#EF4444',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default BinDetails;