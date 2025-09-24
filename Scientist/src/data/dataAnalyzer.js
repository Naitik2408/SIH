// Backend Journey Data Analyzer
// Processes real journey data from database using Journey model structure

import { fetchJourneyData } from '../services/apiService';

// Kerala cities mapping for location analysis
const KERALA_CITIES = {
  'Thiruvananthapuram': 'Thiruvananthapuram',
  'Technopark': 'Thiruvananthapuram', 
  'Kovalam': 'Thiruvananthapuram',
  'Kochi': 'Kochi',
  'Marine Drive': 'Kochi',
  'Infopark': 'Kochi',
  'Fort Kochi': 'Kochi',
  'Kozhikode': 'Kozhikode',
  'Cyberpark': 'Kozhikode',
  'Thrissur': 'Thrissur',
  'Kollam': 'Kollam',
  'Alappuzha': 'Alappuzha',
  'Kottayam': 'Kottayam',
  'Palakkad': 'Palakkad',
  'Malappuram': 'Malappuram',
  'Kannur': 'Kannur'
};

// Get city from location address
const getCityFromLocation = (address) => {
  if (!address) return 'Unknown';
  
  for (const [key, city] of Object.entries(KERALA_CITIES)) {
    if (address.includes(key)) {
      return city;
    }
  }
  return 'Other Kerala';
};

// Analyze real journey data from backend
export const analyzeJourneyData = async () => {
  try {
    const response = await fetchJourneyData();
    const journeys = response.data || [];
    
    console.log('=== JOURNEY DATA ANALYSIS ===');
    console.log(`Total Journeys: ${journeys.length}`);
    
    // User demographics analysis
    const ageGroups = journeys.reduce((acc, journey) => {
      const age = journey.age || 25;
      if (age < 30) acc.young++;
      else if (age < 50) acc.middle++;
      else acc.senior++;
      return acc;
    }, { young: 0, middle: 0, senior: 0 });
    
    const genderDistribution = journeys.reduce((acc, journey) => {
      const gender = journey.gender || 'unknown';
      acc[gender] = (acc[gender] || 0) + 1;
      return acc;
    }, {});
    
    // Transport mode analysis from Journey surveyData
    const transportCounts = {};
    journeys.forEach(journey => {
      const mode = journey.tripData?.transportMode || 'Unknown';
      transportCounts[mode] = (transportCounts[mode] || 0) + 1;
    });
    
    // Journey purpose analysis
    const purposeCounts = {};
    journeys.forEach(journey => {
      const purpose = journey.tripData?.purpose || 'Other';
      purposeCounts[purpose] = (purposeCounts[purpose] || 0) + 1;
    });
    
    // Location analysis
    const startCities = {};
    const endCities = {};
    journeys.forEach(journey => {
      const startAddr = journey.tripData?.startLocation?.address;
      const endAddr = journey.tripData?.endLocation?.address;
      
      if (startAddr) {
        const startCity = getCityFromLocation(startAddr);
        startCities[startCity] = (startCities[startCity] || 0) + 1;
      }
      
      if (endAddr) {
        const endCity = getCityFromLocation(endAddr);
        endCities[endCity] = (endCities[endCity] || 0) + 1;
      }
    });
    
    // Distance and duration analysis
    const distances = journeys
      .map(j => j.tripData?.distance)
      .filter(d => d && d > 0);
    const durations = journeys
      .map(j => j.tripData?.duration)
      .filter(d => d && d > 0);
      
    const avgDistance = distances.length ? 
      (distances.reduce((sum, d) => sum + d, 0) / distances.length).toFixed(2) : 0;
    const avgDuration = durations.length ? 
      Math.round(durations.reduce((sum, d) => sum + d, 0) / durations.length) : 0;
    
    // Satisfaction analysis
    const satisfactionScores = journeys
      .map(j => j.tripData?.satisfaction)
      .filter(s => s !== undefined && s !== null);
    const avgSatisfaction = satisfactionScores.length ?
      (satisfactionScores.reduce((sum, s) => sum + s, 0) / satisfactionScores.length).toFixed(1) : 0;
    
    const analysis = {
      totalJourneys: journeys.length,
      uniqueUsers: new Set(journeys.map(j => j.userId)).size,
      ageGroups,
      genderDistribution,
      transportCounts,
      purposeCounts,
      startCities,
      endCities,
      avgDistance: parseFloat(avgDistance),
      avgDuration,
      avgSatisfaction: parseFloat(avgSatisfaction),
      dataSource: 'backend-database',
      lastUpdated: new Date().toISOString()
    };
    
    console.log('Analysis Results:', analysis);
    return analysis;
    
  } catch (error) {
    console.error('Error analyzing journey data:', error);
    return {
      totalJourneys: 0,
      uniqueUsers: 0,
      ageGroups: { young: 0, middle: 0, senior: 0 },
      genderDistribution: {},
      transportCounts: {},
      purposeCounts: {},
      startCities: {},
      endCities: {},
      avgDistance: 0,
      avgDuration: 0,
      avgSatisfaction: 0,
      error: error.message,
      dataSource: 'backend-database-error'
    };
  }
};

// Get sample journey data for inspection
export const getSampleJourneyData = async (limit = 5) => {
  try {
    const response = await fetchJourneyData();
    const journeys = response.data || [];
    
    return journeys.slice(0, limit).map(journey => ({
      id: journey.id,
      user: journey.name,
      transport: journey.tripData?.transportMode,
      from: journey.tripData?.startLocation?.address,
      to: journey.tripData?.endLocation?.address,
      distance: journey.tripData?.distance,
      duration: journey.tripData?.duration,
      timestamp: journey.tripData?.timestamp
    }));
  } catch (error) {
    console.error('Error getting sample data:', error);
    return [];
  }
};

// Compatibility export for existing code
export const analyzeUserData = analyzeJourneyData;

export default {
  analyzeJourneyData,
  getSampleJourneyData,
  analyzeUserData
};
