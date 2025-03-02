import axios from 'axios';
import { Platform } from 'react-native';

const API_BASE = Platform.OS === 'android'
  ? 'http://192.168.1.24:5000/api'
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
    console.log('API: Area data received', {
      areaName: response.data.areaName,
      binCount: response.data.bins?.length || 0,
      hasDumpLocation: !!response.data.dumpLocation
    });
    return response.data;
  } catch (error) {
    console.error('API: Failed to fetch area data:', error);
    throw error;
  }
};

export const reportIssue = async (binId: string, issueType: string, description: string) => {
  console.log('API: Reporting issue', { binId, issueType, description });
  try {
    const response = await axios.post(`${API_BASE}/bins/${binId}/report-issue`, {
      issueType,
      description
    });
    console.log('API: Issue reported successfully');
    return response.data;
  } catch (error) {
    console.error('API: Failed to report issue:', error);
    throw error;
  }
};

/**
 * Get an optimized route for bin collection
 * @param start Starting location
 * @param stops Array of bin coordinates
 * @param end Dump location
 * @returns Optimized route data
 */
export const getOptimizedRoute = async (
  start: { latitude: number; longitude: number },
  stops: Array<[number, number]>,
  end: { latitude: number; longitude: number }
): Promise<{
  route: [number, number][];
  distance: string;
  duration: string;
  stops_sequence?: number[];
}> => {
  console.log('API: Requesting route optimization', {
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
    console.log('API: Route optimization request payload:', JSON.stringify(requestData));
    
    const response = await axios.post(`${API_BASE}/routes/optimize`, requestData);
    
    console.log('API: Route optimization response received', {
      routePointsCount: response.data.route?.length,
      distance: response.data.distance,
      duration: response.data.duration
    });
    
    return response.data;
  } catch (error) {
    console.error('API: Failed to get optimized route:', error);
    throw error;
  }
};

/**
 * Get the collector's current location from the database
 * @param token Auth token
 * @returns Current location as [longitude, latitude]
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