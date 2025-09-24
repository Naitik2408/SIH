// API Service for Scientist Dashboard
// Connects to backend Journey database instead of static JSON

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Fetch journey data from backend database
export const fetchJourneyData = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/journeys/scientist-data`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (result.success) {
      console.log('🔍 DEBUG apiService: Journey data fetched successfully:', {
        totalJourneys: result.data?.length,
        sampleJourney: result.data?.[0],
        metadata: result.metadata
      });
      return result; // Returns { success: true, data: [...], metadata: {...} }
    } else {
      throw new Error(result.message || 'Failed to fetch journey data');
    }
  } catch (error) {
    console.error('Error fetching journey data:', error);
    throw error;
  }
};

// Fetch journey analytics data
export const fetchJourneyAnalytics = async (options = {}) => {
  try {
    const { startDate, endDate, userId } = options;
    const params = new URLSearchParams();
    
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (userId) params.append('userId', userId);
    
    const queryString = params.toString();
    const url = `${API_BASE_URL}/journeys/analytics${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (result.success) {
      return result;
    } else {
      throw new Error(result.message || 'Failed to fetch analytics data');
    }
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    throw error;
  }
};

// Health check for backend connectivity
export const healthCheck = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
  } catch (error) {
    console.error('Backend health check failed:', error);
    return false;
  }
};

export default {
  fetchJourneyData,
  fetchJourneyAnalytics,
  healthCheck
};