import React, { useRef, useEffect } from 'react';
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

  useEffect(() => {
    if (selectedBin) {
      sheetRef.current?.expand();
    } else {
      sheetRef.current?.collapse();
    }
  }, [selectedBin]);

  return (
    <BottomSheet
      ref={sheetRef}
      snapPoints={['25%', '50%']}
      index={-1}
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