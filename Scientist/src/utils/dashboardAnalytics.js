// Dashboard Analytics Utility - Backend Journey Data Integration
import { fetchJourneyData } from '../services/apiService';

// Calculate distance between two GPS coordinates using Haversine formula
const calculateDistance = (coord1, coord2) => {
  if (!coord1 || !coord2 || !coord1.lat || !coord1.lng || !coord2.lat || !coord2.lng) {
    return 0;
  }

  const R = 6371; // Earth's radius in km
  const dLat = (coord2.lat - coord1.lat) * Math.PI / 180;
  const dLon = (coord2.lng - coord1.lng) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(coord1.lat * Math.PI / 180) * Math.cos(coord2.lat * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Age categorization helper
const categorizeAge = (age) => {
  if (age < 30) return 'Young (18-29)';
  if (age < 50) return 'Middle-aged (30-49)';
  return 'Senior (50+)';
};

// Combined dashboard data generation function
export const generateDashboardData = async () => {
  try {
    const [chartData, performanceMetrics] = await Promise.all([
      getChartData(),
      getPerformanceMetrics()
    ]);

    return {
      chartData,
      performanceMetrics,
      lastFetched: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error generating dashboard data:', error);
    throw error;
  }
};

// Main analytics function for dashboard
export const analyzeUserData = async () => {
  try {
    const response = await fetchJourneyData();
    const journeys = response.data || [];


    console.log('🔍 DEBUG: Full journey object keys:', Object.keys(journeys[0] || {}));
    console.log('🔍 DEBUG: All available fields in first journey:', JSON.stringify(journeys[0], null, 2));


    const totalUsers = new Set(journeys.map(j => j.userId)).size;
    const totalTrips = journeys.length;

    // Demographics analysis
    const ageDistribution = journeys.reduce((acc, journey) => {
      const age = journey.age || 25;
      const category = categorizeAge(age);
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});

    const genderDistribution = journeys.reduce((acc, journey) => {
      const gender = journey.gender || 'unknown';
      acc[gender] = (acc[gender] || 0) + 1;
      return acc;
    }, {});

    // Transport mode analysis (FIX: Use correct field path)
    const modeCount = {};
    const tripPurposeCount = {};
    let totalDuration = 0;
    let totalDistance = 0;
    let tripCount = 0;
    let distanceCount = 0;



    journeys.forEach((journey, index) => {
      // FIX: Use the actual API response structure
      const mode = journey.tripData?.transportMode || 'Unknown';
      const purpose = journey.tripData?.journeyPurpose || journey.tripData?.purpose || 'Other';

      // Calculate duration from timestamps if available
      let duration = 0;
      if (journey.tripData?.startLocation?.timestamp && journey.tripData?.endLocation?.timestamp) {
        const startTime = new Date(journey.tripData.startLocation.timestamp);
        const endTime = new Date(journey.tripData.endLocation.timestamp);
        duration = Math.round((endTime - startTime) / (1000 * 60)); // in minutes
      }

      // Calculate distance from GPS coordinates
      let distance = 0;
      if (journey.tripData?.startLocation && journey.tripData?.endLocation) {
        distance = calculateDistance(
          { lat: journey.tripData.startLocation.lat, lng: journey.tripData.startLocation.lng },
          { lat: journey.tripData.endLocation.lat, lng: journey.tripData.endLocation.lng }
        );
      }



      modeCount[mode] = (modeCount[mode] || 0) + 1;
      tripPurposeCount[purpose] = (tripPurposeCount[purpose] || 0) + 1;

      if (duration > 0) {
        totalDuration += duration;
        tripCount++;
      }

      if (distance > 0) {
        totalDistance += distance;
        distanceCount++;
      }
    });

    const avgDuration = tripCount > 0 ? Math.round(totalDuration / tripCount) : 0;
    const avgDistance = distanceCount > 0 ? Math.round((totalDistance / distanceCount) * 100) / 100 : 0;




    return {
      totalUsers,
      totalTrips,
      avgDuration,
      avgDistance,
      ageDistribution,
      genderDistribution,
      modeCount,
      tripPurposeCount,
      dataSource: 'backend-database'
    };

  } catch (error) {
    console.error('Error analyzing journey data:', error);
    return {
      totalUsers: 0,
      totalTrips: 0,
      avgDuration: 0,
      avgDistance: 0,
      ageDistribution: {},
      genderDistribution: {},
      modeCount: {},
      tripPurposeCount: {},
      error: error.message,
      dataSource: 'backend-database-error'
    };
  }
};


// export default { analyzeUserData };

// Chart data function for Dashboard.jsx compatibility
export const getChartData = async () => {
  try {
    const response = await fetchJourneyData();
    const journeys = response.data || [];



    // Age distribution chart data
    const ageData = journeys.reduce((acc, journey) => {
      const age = journey.age || 25;
      const category = categorizeAge(age);
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});

    // Transport mode distribution (FIX: Use correct field path from actual API)
    const modeData = journeys.reduce((acc, journey) => {
      const mode = journey.tripData?.transportMode || 'Unknown';
      acc[mode] = (acc[mode] || 0) + 1;
      return acc;
    }, {});

    // Hourly trip distribution (FIX: Use correct field path from actual API)
    const hourlyData = new Array(24).fill(0);
    journeys.forEach(journey => {
      if (journey.tripData?.timestamp) {
        const hour = new Date(journey.tripData.timestamp).getHours();
        if (hour >= 0 && hour < 24) {
          hourlyData[hour]++;
        }
      }
    });

    // Purpose distribution - Now using correct API field
    const purposeData = journeys.reduce((acc, journey) => {
      const purpose = journey.tripData?.journeyPurpose || 'Other';
      acc[purpose] = (acc[purpose] || 0) + 1;
      return acc;
    }, {});



    // Format for chart components with colors
    const ageChartData = Object.entries(ageData).map(([age, count], index) => ({
      name: age,
      value: count,
      percentage: ((count / journeys.length) * 100).toFixed(1),
      color: ['#8b7cf6', '#06b6d4', '#10b981'][index % 3]
    }));

    const modeColors = {
      'Bus': '#8b7cf6',
      'Metro': '#06b6d4',
      'Auto/Taxi': '#10b981',
      'Car': '#f59e0b',
      'Bike': '#ef4444',
      'Walking': '#8b5cf6',
      'Unknown': '#6b7280'
    };

    const modeChartData = Object.entries(modeData).map(([mode, count]) => ({
      name: mode,
      value: count,
      percentage: ((count / journeys.length) * 100).toFixed(1),
      color: modeColors[mode] || '#6b7280'
    }));

    const hourlyChartData = hourlyData.map((count, hour) => ({
      hour: `${hour}:00`,
      traffic: count,
      congestion: Math.floor(count * 0.7) // Estimate congestion based on traffic
    }));

    const purposeColors = {
      'Work/Office': '#8b7cf6',
      'Education': '#06b6d4',
      'Shopping': '#10b981',
      'Healthcare': '#f59e0b',
      'Leisure/Entertainment': '#ef4444',
      'Personal': '#8b5cf6',
      'Other': '#6b7280'
    };

    const purposeChartData = Object.entries(purposeData).map(([purpose, count]) => ({
      name: purpose,
      trips: count,
      percentage: ((count / journeys.length) * 100).toFixed(1),
      fill: purposeColors[purpose] || '#6b7280'
    }));

    // Daily trends calculation (last 7 days)
    const dailyTrends = [];
    const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayOfWeek = daysOfWeek[date.getDay() === 0 ? 6 : date.getDay() - 1];

      // Filter journeys for this day (FIX: Use correct field path from actual API)
      const dayJourneys = journeys.filter(journey => {
        if (!journey.tripData?.timestamp) return false;
        const journeyDate = new Date(journey.tripData.timestamp);
        return journeyDate.toDateString() === date.toDateString();
      });

      const dayUsers = new Set(dayJourneys.map(j => j.userId)).size;

      dailyTrends.push({
        day: dayOfWeek,
        trips: dayJourneys.length,
        users: dayUsers
      });
    }



    return {
      ageData: ageChartData,
      transportData: modeChartData,
      hourlyData: hourlyChartData,
      purposeData: purposeChartData,
      dailyTrends,
      totalJourneys: journeys.length,
      totalUsers: new Set(journeys.map(j => j.userId)).size
    };

  } catch (error) {
    console.error('Error getting chart data:', error);
    return {
      ageData: [],
      transportData: [],
      hourlyData: [],
      purposeData: [],
      dailyTrends: [],
      totalJourneys: 0,
      totalUsers: 0
    };
  }
};

// Performance metrics function for Dashboard.jsx compatibility  
export const getPerformanceMetrics = async () => {
  try {
    const response = await fetchJourneyData();
    const journeys = response.data || [];



    // Calculate performance metrics
    const totalTrips = journeys.length;
    const uniqueUsers = new Set(journeys.map(j => j.userId)).size;

    // Average satisfaction score (FIX: Use correct field from updated API)
    const satisfactionMap = {
      'Very Satisfied': 5,
      'Satisfied': 4,
      'Neutral': 3,
      'Dissatisfied': 2,
      'Very Dissatisfied': 1
    };

    const satisfactionScores = journeys
      .map(j => satisfactionMap[j.tripData?.routeSatisfaction])
      .filter(s => s !== undefined && s !== null);
    const avgSatisfaction = satisfactionScores.length ?
      (satisfactionScores.reduce((sum, s) => sum + s, 0) / satisfactionScores.length).toFixed(1) : 4.2;

    // Most popular transport mode (FIX: Use correct field path from actual API)
    const modeCount = {};
    journeys.forEach(journey => {
      const mode = journey.tripData?.transportMode || 'Unknown';
      modeCount[mode] = (modeCount[mode] || 0) + 1;
    });
    const popularMode = Object.entries(modeCount)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || 'Unknown';

    // Average trip duration (FIX: Use duration from API or calculate from timestamps)
    let totalDuration = 0;
    let durationCount = 0;

    journeys.forEach(journey => {
      let duration = journey.tripData?.duration; // Direct duration from API

      // If no direct duration, calculate from timestamps
      if (!duration && journey.tripData?.startLocation?.timestamp && journey.tripData?.endLocation?.timestamp) {
        const startTime = new Date(journey.tripData.startLocation.timestamp);
        const endTime = new Date(journey.tripData.endLocation.timestamp);
        duration = Math.round((endTime - startTime) / (1000 * 60)); // in minutes
      }

      if (duration > 0) {
        totalDuration += duration;
        durationCount++;
      }
    });

    const avgDuration = durationCount > 0 ? Math.round(totalDuration / durationCount) : 0;

    // Average distance calculation (FIX: Use distance from API or calculate from GPS)
    let totalDistance = 0;
    let distanceCount = 0;

    journeys.forEach(journey => {
      let distance = journey.tripData?.distance; // Direct distance from API

      // If no direct distance, calculate from GPS coordinates
      if (!distance && journey.tripData?.startLocation && journey.tripData?.endLocation) {
        distance = calculateDistance(
          { lat: journey.tripData.startLocation.lat, lng: journey.tripData.startLocation.lng },
          { lat: journey.tripData.endLocation.lat, lng: journey.tripData.endLocation.lng }
        );
      }

      if (distance > 0) {
        totalDistance += distance;
        distanceCount++;
      }
    });

    const avgDistance = distanceCount > 0 ?
      Math.round((totalDistance / distanceCount) * 100) / 100 : 0;

    // Peak hour analysis (FIX: Use correct field path from actual API)
    const hourCounts = {};
    journeys.forEach(journey => {
      if (journey.tripData?.timestamp) {
        const hour = new Date(journey.tripData.timestamp).getHours();
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      }
    });
    const peakHourEntry = Object.entries(hourCounts)
      .sort(([, a], [, b]) => b - a)[0];
    const peakHour = peakHourEntry ? parseInt(peakHourEntry[0]) : 9; // default to 9 AM
    const peakTraffic = peakHourEntry ? peakHourEntry[1] : 0;

    const result = {
      totalTrips,
      uniqueUsers,
      avgSatisfaction: parseFloat(avgSatisfaction),
      popularMode,
      avgDuration,
      avgDistance,
      peakHour,
      peakTraffic,
      dataQuality: avgDistance > 0 ? 'Good' : 'Limited',
      lastUpdated: new Date().toISOString()
    };



    return result;

  } catch (error) {
    console.error('Error getting performance metrics:', error);
    return {
      totalTrips: 0,
      uniqueUsers: 0,
      avgSatisfaction: 0,
      popularMode: 'Unknown',
      avgDuration: 0,
      avgDistance: 0,
      peakHour: 9,
      peakTraffic: 0,
      dataQuality: 'Error',
      lastUpdated: new Date().toISOString()
    };
  }
};
