// OD Matrix Analytics Utility
// Processes user data for Origin-Destination matrix analysis

import usersData from '../data/usersData.json';

// Define zones based on actual user locations
const getZoneFromLocation = (lat, lng, area) => {
  // Define zone mapping based on Delhi NCR areas
  const zoneMapping = {
    'Connaught Place': { id: 'CP', name: 'Connaught Place' },
    'Noida': { id: 'NOI', name: 'Noida' },
    'Ghaziabad': { id: 'GHZ', name: 'Ghaziabad' },
    'AIIMS': { id: 'AIM', name: 'AIIMS' },
    'Khan Market': { id: 'KHM', name: 'Khan Market' },
    'Civil Lines': { id: 'CVL', name: 'Civil Lines' },
    'Dwarka': { id: 'DWK', name: 'Dwarka' },
    'Gurgaon': { id: 'GGN', name: 'Gurgaon' },
    'Vasant Kunj': { id: 'VAS', name: 'Vasant Kunj' },
    'Rajouri Garden': { id: 'RKP', name: 'Rajouri Garden' },
    'Lajpat Nagar': { id: 'LJN', name: 'Lajpat Nagar' },
    'Karol Bagh': { id: 'KLK', name: 'Karol Bagh' },
    'Rohini': { id: 'ROH', name: 'Rohini' },
    'Janakpuri': { id: 'JNK', name: 'Janakpuri' },
    'Pitampura': { id: 'PIT', name: 'Pitampura' },
    'Saket': { id: 'SAK', name: 'Saket' },
    'Green Park': { id: 'GRP', name: 'Green Park' },
    'Nehru Place': { id: 'NHP', name: 'Nehru Place' },
    'Indraprastha': { id: 'IND', name: 'Indraprastha' },
    'Mayur Vihar': { id: 'MAY', name: 'Mayur Vihar' }
  };

  // First try exact area match
  if (zoneMapping[area]) {
    return zoneMapping[area];
  }

  // Fallback to coordinate-based mapping for major zones
  if (lat >= 28.65 && lng >= 77.4) return { id: 'GHZ', name: 'Ghaziabad' };
  if (lat >= 28.5 && lat <= 28.6 && lng >= 77.35) return { id: 'NOI', name: 'Noida' };
  if (lat >= 28.4 && lat <= 28.5 && lng <= 77.1) return { id: 'GGN', name: 'Gurgaon' };
  if (lat <= 28.6 && lng <= 77.1) return { id: 'DWK', name: 'Dwarka' };
  if (lat >= 28.6 && lat <= 28.7 && lng >= 77.2 && lng <= 77.25) return { id: 'CP', name: 'Connaught Place' };
  
  // Default to CP for central Delhi areas
  return { id: 'CP', name: 'Connaught Place' };
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

// Generate real OD matrix from user data
const generateRealODMatrix = () => {
  const matrix = {};
  const zones = extractZonesFromUserData();
  
  // Initialize matrix
  zones.forEach(origin => {
    matrix[origin.id] = {};
    zones.forEach(destination => {
      matrix[origin.id][destination.id] = 0;
    });
  });

  // Process user trips
  usersData.users.forEach(user => {
    // Process daily trips
    user.daily_trips.forEach(trip => {
      const originZone = getZoneFromLocation(trip.origin[0], trip.origin[1], '');
      const destZone = getZoneFromLocation(trip.destination[0], trip.destination[1], '');
      
      if (matrix[originZone.id] && matrix[originZone.id][destZone.id] !== undefined) {
        matrix[originZone.id][destZone.id] += 1;
      }
    });

    // Process common destinations with frequency
    user.common_destinations?.forEach(dest => {
      const homeZone = getZoneFromLocation(
        user.home_location.lat, 
        user.home_location.lng, 
        user.home_location.area
      );
      const destZone = getZoneFromLocation(dest.lat, dest.lng, dest.area);
      
      if (matrix[homeZone.id] && matrix[homeZone.id][destZone.id] !== undefined) {
        matrix[homeZone.id][destZone.id] += dest.frequency || 1;
      }
      // Return trips
      if (matrix[destZone.id] && matrix[destZone.id][homeZone.id] !== undefined) {
        matrix[destZone.id][homeZone.id] += dest.frequency || 1;
      }
    });

    // Add work commute patterns
    const homeZone = getZoneFromLocation(
      user.home_location.lat, 
      user.home_location.lng, 
      user.home_location.area
    );
    const workZone = getZoneFromLocation(
      user.work_location.lat, 
      user.work_location.lng, 
      user.work_location.area
    );

    // Add weekly pattern multiplier
    const weeklyTrips = Object.values(user.weekly_pattern || {}).reduce((sum, trips) => sum + trips, 0);
    
    if (matrix[homeZone.id] && matrix[homeZone.id][workZone.id] !== undefined) {
      matrix[homeZone.id][workZone.id] += weeklyTrips;
    }
    if (matrix[workZone.id] && matrix[workZone.id][homeZone.id] !== undefined) {
      matrix[workZone.id][homeZone.id] += weeklyTrips;
    }
  });

  return { matrix, zones };
};

// Generate corridor analysis data from real user data
const generateRealCorridorData = (originId, destinationId) => {
  const relevantUsers = usersData.users.filter(user => {
    const homeZone = getZoneFromLocation(
      user.home_location.lat, 
      user.home_location.lng, 
      user.home_location.area
    );
    const workZone = getZoneFromLocation(
      user.work_location.lat, 
      user.work_location.lng, 
      user.work_location.area
    );
    
    return (homeZone.id === originId && workZone.id === destinationId) ||
           (workZone.id === originId && homeZone.id === destinationId);
  });

  // Generate daily trips from weekly patterns
  const dailyTrips = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => {
    const dayKey = day.toLowerCase() + 'day';
    const trips = relevantUsers.reduce((sum, user) => {
      return sum + (user.weekly_pattern[dayKey] || 0);
    }, 0);
    return { day, trips };
  });

  // Generate mode data from user preferences
  const modeCount = {};
  relevantUsers.forEach(user => {
    user.daily_trips.forEach(trip => {
      modeCount[trip.mode] = (modeCount[trip.mode] || 0) + 1;
    });
    user.transport_preference.forEach(mode => {
      modeCount[mode] = (modeCount[mode] || 0) + 1;
    });
  });

  const modeData = Object.entries(modeCount).map(([mode, count]) => ({
    mode: mode.charAt(0).toUpperCase() + mode.slice(1),
    trips: count
  }));

  // Generate peak hours from user trip times
  const hourlyTrips = new Array(24).fill(0);
  relevantUsers.forEach(user => {
    user.daily_trips.forEach(trip => {
      if (trip.time >= 0 && trip.time < 24) {
        hourlyTrips[trip.time] += 1;
      }
    });
  });

  const peakHours = hourlyTrips.map((trips, hour) => ({ hour, trips }));

  return { dailyTrips, modeData, peakHours };
};

// Get top corridors from real data
const getRealTopCorridors = (matrix, zones) => {
  const corridors = [];
  Object.keys(matrix).forEach(origin => {
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
  });
  return corridors.sort((a, b) => b.trips - a.trips).slice(0, 10);
};

export {
  extractZonesFromUserData,
  generateRealODMatrix,
  generateRealCorridorData,
  getRealTopCorridors,
  getZoneFromLocation
};