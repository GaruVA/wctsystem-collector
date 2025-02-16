import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { FAB } from 'react-native-paper';
import InteractiveMap from '../components/InteractiveMap';
import BottomSheetWrapper from '../components/BottomSheetWrapper';
import NotificationIcon from '../components/NotificationIcon';
import ReportIssueModal from '../components/ReportIssueModal';
import { useAuth } from '../context/AuthContext';
import { getCollectorArea, reportIssue } from '../services/api';

interface AreaData {
  areaName: string;
  areaID: string;
  coordinates: [number, number][];
  bins: Bin[];
}

interface Bin {
  _id: string;
  location: {
    type: string;
    coordinates: [number, number];
  };
  fillLevel: number;
  lastCollected: string;
  status: string;
}

const HomeScreen = () => {
  const { token } = useAuth();
  const [areaData, setAreaData] = useState<AreaData | null>(null);
  const [selectedBin, setSelectedBin] = useState<Bin | null>(null);
  const [showRouteModal, setShowRouteModal] = useState(false);
  const [reportIssueVisible, setReportIssueVisible] = useState(false);
  const [selectedBinId, setSelectedBinId] = useState<string | null>(null);

  useEffect(() => {
    const loadAreaData = async () => {
      try {
        if (token) {
          const data = await getCollectorArea(token);
          setAreaData(data);
        } else {
          console.error('Token is null');
        }
      } catch (error) {
        console.error('Failed to load area data:', error);
      }
    };
    loadAreaData();
  }, [token]);

  const handleReportIssue = (binId: string) => {
    setSelectedBinId(binId);
    setReportIssueVisible(true);
  };

  const handleReportSubmit = async (issueType: string, description: string) => {
    if (selectedBinId) {
      try {
        if (token) {
          await reportIssue(selectedBinId, issueType, description, token);
        } else {
          console.error('Token is null');
        }
        console.log('Issue reported successfully');
      } catch (error) {
        console.error('Failed to report issue:', error);
      }
    }
    setReportIssueVisible(false);
  };

  return (
    <View style={styles.container}>
      <InteractiveMap
        areaData={areaData}
        onBinSelect={setSelectedBin}
      />
      <NotificationIcon />
      <BottomSheetWrapper
        areaData={areaData}
        selectedBin={selectedBin}
        onCreateRoute={() => setShowRouteModal(true)}
        onReportIssue={handleReportIssue}
        onCloseBin={() => setSelectedBin(null)}
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
  }
});

export default HomeScreen;