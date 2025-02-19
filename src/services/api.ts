import axios from 'axios';
import { Platform } from 'react-native';

const API_BASE = Platform.OS === 'android'
  ? 'https://wctsystem-backend.onrender.com/api'
  : 'http://localhost:5000/api';

// NEW: Login API call moved here
export const loginCollector = async (username: string, password: string) => {
  const response = await axios.post(`${API_BASE}/collector/login`, { username, password });
  return response.data;
};

export const getCollectorArea = async (token: string) => {
  const response = await axios.get(`${API_BASE}/collector/area`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const reportIssue = async (binId: string, issueType: string, description: string, token: string) => {
  const response = await axios.post(`${API_BASE}/bin/${binId}/report-issue`, {
    issueType,
    description
  }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

// Add other API calls here