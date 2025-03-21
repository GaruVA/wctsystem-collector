export type RootStackParamList = {
  Login: undefined;
  Main: undefined;
  RouteCompletion: {
    collectedBinsCount: number;
    totalBinsCount: number;
    totalDistance: string;
    totalDuration: string;
    averageTimePerBin: string;
    startTime: string;
    endTime: string;
    routeEfficiencyScore: number;
  };
};