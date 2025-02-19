import React, { useRef } from 'react';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import AreaState from './AreaState';
import BinState from './BinState';
import { View, Text, StyleSheet } from 'react-native';

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
}

interface BottomSheetWrapperProps {
  areaData: AreaData | null;
  selectedBin: Bin | null;
  onCreateRoute: () => void;
  onReportIssue: (binId: string) => void;
  onCloseBin: () => void;
}

const BottomSheetWrapper = ({ 
  areaData, 
  selectedBin, 
  onCreateRoute, 
  onReportIssue, 
  onCloseBin 
}: BottomSheetWrapperProps) => {
  const sheetRef = useRef<BottomSheet | null>(null);

  // Increase snap point height to 50% to bring up the button
  const snapPoints = ['50%'];

  return (
    <BottomSheet
      ref={sheetRef}
      snapPoints={snapPoints} // Updated snap point to 50%
      index={0} // Always display at '50%'
      backgroundStyle={{ backgroundColor: 'transparent' }} // Set transparent background
      handleComponent={() => null} // Disable bottom sheet handle
      enableHandlePanningGesture={false} // Disable handle panning
      enableContentPanningGesture={false} // Disable content panning
    >
      <BottomSheetView style={styles.content}>
        <View style={styles.container}>
          {selectedBin ? (
            <BinState 
              bin={selectedBin} 
              onReportIssue={onReportIssue} 
              onClose={onCloseBin} 
            />
          ) : (
            <AreaState 
              stats={{
                totalBins: areaData?.bins?.length || 0,
                priorityBins: areaData?.bins?.filter(bin => bin.fillLevel > 70).length || 0,
                avgFill: areaData?.bins?.length ? areaData.bins.reduce((sum, bin) => sum + bin.fillLevel, 0) / areaData.bins.length : 0,
                urgentBins: areaData?.bins?.filter(bin => bin.fillLevel >= 95).length || 0
              }} 
              onCreateRoute={onCreateRoute}
              areaName={areaData?.areaName} // Pass area name here
            />
          )}
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  container: {
    // ...existing styles...
  },
  statusText: {
    fontSize: 14,
    color: '#000'
  },
  content: { padding: 0, gap: 10 }
});

export default BottomSheetWrapper;