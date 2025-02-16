import axios from 'axios';
import { Platform } from 'react-native';

const API_BASE = Platform.OS === 'android'
  ? 'http://10.0.2.2:5000/api'
  : 'http://localhost:5000/api';

export const getCollectorArea = async (token: string) => {
  const response = await axios.get(`${API_BASE}/driver/area`, {
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