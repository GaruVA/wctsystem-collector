import React, { useRef } from 'react';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import AreaState from './AreaState';
import BinState from './BinState';

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

  // Always use a single snap point to disable expansion
  const snapPoints = ['25%'];

  return (
    <BottomSheet
      ref={sheetRef}
      snapPoints={snapPoints} // Fixed snap point
      index={0} // Always display at '25%'
      handleComponent={() => null} // Disable bottom sheet handle
      enableHandlePanningGesture={false} // Disable handle panning
      enableContentPanningGesture={false} // Disable content panning
    >
      <BottomSheetView style={styles.content}>
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
          />
        )}
      </BottomSheetView>
    </BottomSheet>
  );
};

const styles = {
  content: { padding: 20, gap: 10 }
};

export default BottomSheetWrapper;