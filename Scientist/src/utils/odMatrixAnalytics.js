// OD Matrix Analytics Utility
// Processes real journey data for Origin-Destination matrix analysis

import { fetchJourneyData } from '../services/apiService';

// Define zones based on Kerala locations
const getZoneFromLocation = (lat, lng, address) => {
  // Define Kerala zone mapping 
  const zoneMapping = {
    'Thiruvananthapuram': { id: 'TRV', name: 'Thiruvananthapuram' },
    'Technopark': { id: 'TRV', name: 'Thiruvananthapuram' },
    'Kovalam': { id: 'TRV', name: 'Thiruvananthapuram' },
    'Kochi': { id: 'COK', name: 'Kochi' },
    'Marine Drive': { id: 'COK', name: 'Kochi' },
    'Infopark': { id: 'COK', name: 'Kochi' },
    'Fort Kochi': { id: 'COK', name: 'Kochi' },
    'Kozhikode': { id: 'KZD', name: 'Kozhikode' },
    'Cyberpark': { id: 'KZD', name: 'Kozhikode' },
    'Thrissur': { id: 'TSR', name: 'Thrissur' },
    'Kollam': { id: 'KLM', name: 'Kollam' },
    'Alappuzha': { id: 'ALP', name: 'Alappuzha' },
    'Kottayam': { id: 'KTM', name: 'Kottayam' },
    'Palakkad': { id: 'PKD', name: 'Palakkad' },
    'Malappuram': { id: 'MPM', name: 'Malappuram' },
    'Kannur': { id: 'KNR', name: 'Kannur' }
  };

  // Try to match by address first
  if (address) {
    for (const [key, zone] of Object.entries(zoneMapping)) {
      if (address.includes(key)) {
        return { ...zone, coords: [lat || 0, lng || 0] };
      }
    }
  }

  // Default to coordinate-based mapping for Kerala
  if (lat && lng) {
    // Basic coordinate ranges for Kerala cities
    if (lat >= 8.4 && lat <= 8.6 && lng >= 76.8 && lng <= 77.1) {
      return { ...zoneMapping['Thiruvananthapuram'], coords: [lat, lng] };
    } else if (lat >= 9.8 && lat <= 10.1 && lng >= 76.2 && lng <= 76.4) {
      return { ...zoneMapping['Kochi'], coords: [lat, lng] };
    } else if (lat >= 11.2 && lat <= 11.3 && lng >= 75.7 && lng <= 75.9) {
      return { ...zoneMapping['Kozhikode'], coords: [lat, lng] };
    }
  }

  return { id: 'OTH', name: 'Other Kerala', coords: [lat || 0, lng || 0] };
};

// Extract zones from journey data
const extractZonesFromJourneyData = async () => {
  try {
    const response = await fetchJourneyData();
    const journeys = response.data || [];

    const zoneSet = new Set();
    const zoneCoords = {};

    journeys.forEach(journey => {
      // Add start location zone
      const startLoc = journey.tripData?.startLocation;
      if (startLoc) {
        const startZone = getZoneFromLocation(
          startLoc.latitude,
          startLoc.longitude,
          startLoc.address
        );
        zoneSet.add(startZone.id);
        if (!zoneCoords[startZone.id]) {
          zoneCoords[startZone.id] = startZone;
        }
      }

      // Add end location zone
      const endLoc = journey.tripData?.endLocation;
      if (endLoc) {
        const endZone = getZoneFromLocation(
          endLoc.latitude,
          endLoc.longitude,
          endLoc.address
        );
        zoneSet.add(endZone.id);
        if (!zoneCoords[endZone.id]) {
          zoneCoords[endZone.id] = endZone;
        }
      }
    });

    return Object.values(zoneCoords);
  } catch (error) {
    console.error('Error extracting zones from journey data:', error);
    return [];
  }
};

// Extract unique zones from user data
const extractZonesFromUserData = () => {
  const zoneSet = new Set();
  const zoneCoords = {};

  usersData.users.forEach(user => {
    // Add home location zone
    const homeZone = getZoneFromLocation(
      user.home_location.lat,
      user.home_location.lng,
      user.home_location.area
    );
    zoneSet.add(homeZone.id);
    if (!zoneCoords[homeZone.id]) {
      zoneCoords[homeZone.id] = {
        ...homeZone,
        coords: [user.home_location.lat, user.home_location.lng]
      };
    }

    // Add work location zone
    const workZone = getZoneFromLocation(
      user.work_location.lat,
      user.work_location.lng,
      user.work_location.area
    );
    zoneSet.add(workZone.id);
    if (!zoneCoords[workZone.id]) {
      zoneCoords[workZone.id] = {
        ...workZone,
        coords: [user.work_location.lat, user.work_location.lng]
      };
    }

    // Add common destinations
    user.common_destinations?.forEach(dest => {
      const destZone = getZoneFromLocation(dest.lat, dest.lng, dest.area);
      zoneSet.add(destZone.id);
      if (!zoneCoords[destZone.id]) {
        zoneCoords[destZone.id] = {
          ...destZone,
          coords: [dest.lat, dest.lng]
        };
      }
    });
  });

  return Object.values(zoneCoords);
};

// Generate real OD matrix from journey data
const generateRealODMatrix = async () => {
  try {
    const response = await fetchJourneyData();
    const journeys = response.data || [];
    const matrix = {};
    const zones = await extractZonesFromJourneyData();

    // Initialize matrix
    zones.forEach(origin => {
      matrix[origin.id] = {};
      zones.forEach(destination => {
        matrix[origin.id][destination.id] = 0;
      });
    });

    // Process journey trips
    journeys.forEach(journey => {
      const startLoc = journey.tripData?.startLocation;
      const endLoc = journey.tripData?.endLocation;

      if (startLoc && endLoc) {
        const originZone = getZoneFromLocation(
          startLoc.latitude,
          startLoc.longitude,
          startLoc.address
        );
        const destZone = getZoneFromLocation(
          endLoc.latitude,
          endLoc.longitude,
          endLoc.address
        );

        if (matrix[originZone.id] && matrix[originZone.id][destZone.id] !== undefined) {
          matrix[originZone.id][destZone.id] += 1;
        }
      }
    });

    return { matrix, zones };
  } catch (error) {
    console.error('Error generating OD matrix:', error);
    return { matrix: {}, zones: [] };
  }
};

// Generate corridor analysis data from real journey data
const generateRealCorridorData = async (originId, destinationId) => {
  try {
    const response = await fetchJourneyData();
    const journeys = response.data || [];

    const relevantJourneys = journeys.filter(journey => {
      const startLoc = journey.tripData?.startLocation;
      const endLoc = journey.tripData?.endLocation;

      if (!startLoc || !endLoc) return false;

      const originZone = getZoneFromLocation(
        startLoc.latitude,
        startLoc.longitude,
        startLoc.address
      );
      const destZone = getZoneFromLocation(
        endLoc.latitude,
        endLoc.longitude,
        endLoc.address
      );

      return (originZone.id === originId && destZone.id === destinationId) ||
        (destZone.id === originId && originZone.id === destinationId);
    });

    // Generate mode data from journey transport modes
    const modeCount = {};
    relevantJourneys.forEach(journey => {
      const mode = journey.tripData?.transportMode || 'Unknown';
      modeCount[mode] = (modeCount[mode] || 0) + 1;
    });

    const modeData = Object.entries(modeCount).map(([mode, count]) => ({
      mode: mode.charAt(0).toUpperCase() + mode.slice(1),
      trips: count
    }));

    // Generate hourly patterns from timestamps
    const hourlyTrips = new Array(24).fill(0);
    relevantJourneys.forEach(journey => {
      const timestamp = journey.tripData?.timestamp;
      if (timestamp) {
        const hour = new Date(timestamp).getHours();
        if (hour >= 0 && hour < 24) {
          hourlyTrips[hour] += 1;
        }
      }
    });

    const peakHours = hourlyTrips.map((trips, hour) => ({ hour, trips }));

    // Generate daily trips (mock data for now since we don't have weekly patterns)
    const dailyTrips = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => ({
      day,
      trips: Math.floor(relevantJourneys.length / 7) // Distribute evenly
    }));

    return { dailyTrips, modeData, peakHours };
  } catch (error) {
    console.error('Error generating corridor data:', error);
    return { dailyTrips: [], modeData: [], peakHours: [] };
  }
};

;

// Get top corridors from real data
const getRealTopCorridors = async (matrix, zones) => {
  const corridors = [];

  // Add null check for matrix
  if (!matrix || typeof matrix !== 'object') {
    console.warn('Matrix is null or undefined in getRealTopCorridors');
    return [];
  }

  Object.keys(matrix).forEach(origin => {
    if (matrix[origin] && typeof matrix[origin] === 'object') {
      Object.keys(matrix[origin]).forEach(destination => {
        if (matrix[origin][destination] > 0) {
          const originZone = zones.find(z => z.id === origin);
          const destinationZone = zones.find(z => z.id === destination);
          corridors.push({
            origin,
            destination,
            trips: matrix[origin][destination],
            originName: originZone?.name || origin,
            destinationName: destinationZone?.name || destination
          });
        }
      });
    }
  });
  return corridors.sort((a, b) => b.trips - a.trips).slice(0, 10);
};

/**
 * Combined OD Matrix data generation for React Query
 */
const generateODMatrixData = async () => {
  try {
    // First get zones and matrix, then use them for other operations
    const [zones, matrixResult, corridors] = await Promise.all([
      extractZonesFromJourneyData(),
      generateRealODMatrix(),
      generateRealCorridorData()
    ]);

    const matrix = matrixResult?.matrix || {};

    // Now get top corridors with the matrix and zones data
    const topCorridors = await getRealTopCorridors(matrix, zones);

    return {
      zones,
      matrix,
      corridors,
      topCorridors,
      lastFetched: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error generating OD Matrix data:', error);
    throw error;
  }
};

// Export functions with Journey data compatibility
export {
  extractZonesFromJourneyData,
  extractZonesFromJourneyData as extractZonesFromUserData, // Backward compatibility
  generateRealODMatrix,
  generateRealCorridorData,
  getRealTopCorridors,
  getZoneFromLocation,
  generateODMatrixData
};