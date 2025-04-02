import axios from 'axios';
import { Platform } from 'react-native';

const API_BASE = Platform.OS === 'android'
  ? 'http://192.168.1.22:5000/api'
  : 'http://localhost:5000/api';

console.log('API_BASE URL:', API_BASE);

// Types for API responses
interface AreaData {
  areaName: string;
  areaID: string;
  coordinates: [number, number][];
  bins: Bin[];
  dumpLocation: {
    type: string;
    coordinates: [number, number]; // [longitude, latitude]
  };
}

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

// Login API call
export const loginCollector = async (username: string, password: string) => {
  console.log('API: Attempting login for user:', username);
  try {
    const response = await axios.post(`${API_BASE}/collector/login`, { username, password });
    console.log('API: Login successful, received token');
    return response.data;
  } catch (error) {
    console.error('API: Login failed:', error);
    throw error;
  }
};

/**
 * Get collector's assigned area including bins and dump location
 * @param token Auth token
 * @returns Area data including coordinates, bins, and dump location
 */
export const getCollectorArea = async (token: string): Promise<AreaData> => {
  console.log('API: Fetching collector area data');
  try {
    const response = await axios.get(`${API_BASE}/collector/area`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const areaData = response.data;

    console.log('API: Area data received', {
      areaName: areaData.areaName,
      binCount: areaData.bins?.length || 0,
      hasDumpLocation: !!areaData.dumpLocation
    });

    return areaData;
  } catch (error) {
    console.error('API: Failed to fetch area data:', error);
    throw error;
  }
};

export const reportIssue = async (binId: string, issueType: string, description: string, token: string) => {
  console.log('API: Reporting issue', { binId, issueType, description });
  try {
    const response = await axios.post(`${API_BASE}/bins/${binId}/report-issue`, {
      issueType,
      description
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log('API: Issue reported successfully');
    return response.data;
  } catch (error) {
    console.error('API: Failed to report issue:', error);
    throw error;
  }
};

/**
 * Mark a bin as collected
 */
export const collectBin = async (binId: string, token: string): Promise<Bin> => {
  console.log('API: Marking bin as collected:', binId);
  try {
    const response = await axios.post(`${API_BASE}/bins/${binId}/collect`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('API: Bin marked as collected, fill level reset');
    return response.data.bin;
  } catch (error) {
    console.error('API: Failed to mark bin as collected:', error);
    throw error;
  }
};

/**
 * Get optimized bin order
 */
export const optimizeBinOrder = async (
  start: { latitude: number; longitude: number },
  stops: Array<[number, number]>,
  end: { latitude: number; longitude: number },
  token: string
): Promise<{
  optimizedStops: [number, number][];
  stops_sequence: number[];
}> => {
  console.log('API: Requesting bin order optimization', {
    startPoint: start,
    stopsCount: stops.length,
    endPoint: end
  });
  try {
    const requestData = {
      start: [start.longitude, start.latitude],
      stops: stops,
      end: [end.longitude, end.latitude]
    };
    
    const response = await axios.post(`${API_BASE}/routes/optimize-bin-order`, requestData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('API: Bin order optimization received', {
      optimizedStopsCount: response.data.optimizedStops?.length,
      sequence: response.data.stops_sequence
    });
    
    return response.data;
  } catch (error) {
    console.error('API: Failed to get optimized bin order:', error);
    throw error;
  }
};

/**
 * Generate route polyline using optimized waypoints
 */
export const generateRoutePolyline = async (
  waypoints: Array<[number, number]>,
  stops_sequence: number[],
  token: string
): Promise<{
  route: [number, number][];
  distance: string;
  duration: string;
  stops_sequence: number[];
  steps?: Array<{
    instruction?: string;
    distance?: string;
    duration?: number;
    name?: string;
    maneuver?: {
      type: string;
      modifier?: string;
    };
  }>;
}> => {
  console.log('API: Requesting route polyline generation', {
    waypointsCount: waypoints.length,
    sequence: stops_sequence
  });
  try {
    const requestData = {
      waypoints,
      stops_sequence
    };
    
    const response = await axios.post(`${API_BASE}/routes/generate-polyline`, requestData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('API: Route polyline generated', {
      routePointsCount: response.data.route?.length,
      distance: response.data.distance,
      duration: response.data.duration
    });
    
    return response.data;
  } catch (error) {
    console.error('API: Failed to generate route polyline:', error);
    throw error;
  }
};

/**
 * Get the collector's current location from the database
 */
export const getCollectorLocation = async (token: string): Promise<[number, number] | null> => {
  console.log('API: Fetching collector location from database');
  try {
    const response = await axios.get(`${API_BASE}/collector/location`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('API: Collector location received', response.data.currentLocation);
    return response.data.currentLocation;
  } catch (error) {
    console.error('API: Failed to fetch collector location:', error);
    return null;
  }
};

// Export types for use in other files
export type { AreaData, Bin };