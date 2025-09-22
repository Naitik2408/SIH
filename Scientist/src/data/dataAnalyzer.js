// Sample Data Viewer for usersData.json
// This demonstrates the structure and content of our 100-user dataset

import usersData from './usersData.json';

// Example usage and data analysis functions
export const analyzeUserData = () => {
  const users = usersData.users;
  
  console.log('=== USER DATA ANALYSIS ===');
  console.log(`Total Users: ${users.length}`);
  
  // Age distribution
  const ageGroups = users.reduce((acc, user) => {
    if (user.age < 30) acc.young++;
    else if (user.age < 50) acc.middle++;
    else acc.senior++;
    return acc;
  }, { young: 0, middle: 0, senior: 0 });
  
  console.log('Age Distribution:', ageGroups);
  
  // Transport preferences
  const transportCounts = {};
  users.forEach(user => {
    user.transport_preference.forEach(mode => {
      transportCounts[mode] = (transportCounts[mode] || 0) + 1;
    });
  });
  
  console.log('Transport Preferences:', transportCounts);
  
  // Income distribution
  const incomeDistribution = users.reduce((acc, user) => {
    acc[user.income_bracket]++;
    return acc;
  }, { low: 0, middle: 0, high: 0 });
  
  console.log('Income Distribution:', incomeDistribution);
  
  // Most common areas
  const areas = {};
  users.forEach(user => {
    areas[user.home_location.area] = (areas[user.home_location.area] || 0) + 1;
    areas[user.work_location.area] = (areas[user.work_location.area] || 0) + 1;
  });
  
  const topAreas = Object.entries(areas)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10);
  
  console.log('Top 10 Areas:', topAreas);
  
  // Sample user profiles
  console.log('\n=== SAMPLE USER PROFILES ===');
  users.slice(0, 3).forEach(user => {
    console.log(`\nUser ${user.id}: ${user.name}`);
    console.log(`- Age: ${user.age}, Gender: ${user.gender}`);
    console.log(`- Occupation: ${user.occupation}`);
    console.log(`- Income: ${user.income_bracket}`);
    console.log(`- Home: ${user.home_location.area}`);
    console.log(`- Work: ${user.work_location.area}`);
    console.log(`- Transport: ${user.transport_preference.join(', ')}`);
    console.log(`- Daily trips: ${user.daily_trips.length}`);
    console.log(`- Common destinations: ${user.common_destinations.length}`);
  });
  
  return {
    totalUsers: users.length,
    ageGroups,
    transportCounts,
    incomeDistribution,
    topAreas
  };
};

// Generate heatmap data points from user data
export const generateVisualizationData = () => {
  const heatmapPoints = [];
  const odFlows = [];
  
  usersData.users.forEach((user, index) => {
    // Add home location
    heatmapPoints.push({
      id: `home_${index}`,
      lat: user.home_location.lat,
      lng: user.home_location.lng,
      intensity: user.weekly_pattern.monday + user.weekly_pattern.tuesday + 
                user.weekly_pattern.wednesday + user.weekly_pattern.thursday + 
                user.weekly_pattern.friday,
      type: 'residential',
      area: user.home_location.area,
      user_info: {
        name: user.name,
        age: user.age,
        occupation: user.occupation,
        income: user.income_bracket
      }
    });
    
    // Add work location
    heatmapPoints.push({
      id: `work_${index}`,
      lat: user.work_location.lat,
      lng: user.work_location.lng,
      intensity: user.weekly_pattern.monday + user.weekly_pattern.tuesday + 
                user.weekly_pattern.wednesday + user.weekly_pattern.thursday + 
                user.weekly_pattern.friday,
      type: 'commercial',
      area: user.work_location.area,
      user_info: {
        name: user.name,
        age: user.age,
        occupation: user.occupation,
        income: user.income_bracket
      }
    });
    
    // Add OD flows
    user.daily_trips.forEach((trip, tripIndex) => {
      odFlows.push({
        id: `trip_${index}_${tripIndex}`,
        origin: trip.origin,
        destination: trip.destination,
        trips: user.weekly_pattern.monday + user.weekly_pattern.tuesday + 
               user.weekly_pattern.wednesday + user.weekly_pattern.thursday + 
               user.weekly_pattern.friday,
        mode: trip.mode,
        purpose: trip.purpose,
        time: trip.time,
        duration: trip.duration,
        user_info: {
          name: user.name,
          age: user.age,
          occupation: user.occupation,
          income: user.income_bracket
        }
      });
    });
  });
  
  return { heatmapPoints, odFlows };
};

// Example: Run analysis
if (typeof window !== 'undefined') {
  // Browser environment
  console.log('User Data Analysis Ready!');
  window.analyzeUserData = analyzeUserData;
  window.generateVisualizationData = generateVisualizationData;
} else {
  // Node environment
  analyzeUserData();
}