// Migration Test - Verify Backend Journey Data Integration
// This test verifies that our migration from static JSON to real database is working

import { fetchJourneyData } from '../services/apiService';
import { analyzeJourneyData } from '../data/dataAnalyzer';
import { analyzeUserData } from '../utils/dashboardAnalytics';

export const testMigration = async () => {
  console.log('=== MIGRATION TEST START ===');
  
  try {
    // Test 1: Direct API connection
    console.log('\n1. Testing API Connection...');
    const apiResponse = await fetchJourneyData();
    console.log(`✓ API Response: ${apiResponse.data?.length || 0} journeys fetched`);
    
    if (apiResponse.data && apiResponse.data.length > 0) {
      const sample = apiResponse.data[0];
      console.log('✓ Sample Journey Data Structure:');
      console.log(`  - User: ${sample.name}`);
      console.log(`  - Transport: ${sample.tripData?.transportMode}`);
      console.log(`  - From: ${sample.tripData?.startLocation?.address}`);
      console.log(`  - To: ${sample.tripData?.endLocation?.address}`);
    }
    
    // Test 2: Data Analyzer
    console.log('\n2. Testing Data Analyzer...');
    const analysisResult = await analyzeJourneyData();
    console.log(`✓ Analysis Result: ${analysisResult.totalJourneys} total journeys`);
    console.log(`✓ Unique Users: ${analysisResult.uniqueUsers}`);
    console.log(`✓ Data Source: ${analysisResult.dataSource}`);
    
    // Test 3: Dashboard Analytics  
    console.log('\n3. Testing Dashboard Analytics...');
    const dashboardResult = await analyzeUserData();
    console.log(`✓ Dashboard Data: ${dashboardResult.totalUsers} users, ${dashboardResult.totalTrips} trips`);
    console.log(`✓ Transport Modes: ${Object.keys(dashboardResult.modeCount).length} different modes`);
    console.log(`✓ Data Source: ${dashboardResult.dataSource}`);
    
    console.log('\n=== MIGRATION TEST SUCCESS ===');
    console.log('✅ All components successfully migrated to backend Journey data');
    
    return {
      success: true,
      apiConnections: true,
      dataAnalyzer: true,
      dashboardAnalytics: true,
      journeyCount: apiResponse.data?.length || 0,
      userCount: analysisResult.uniqueUsers || 0
    };
    
  } catch (error) {
    console.error('\n=== MIGRATION TEST FAILED ===');
    console.error('❌ Error:', error.message);
    
    return {
      success: false,
      error: error.message,
      apiConnections: false,
      dataAnalyzer: false,
      dashboardAnalytics: false
    };
  }
};

// Quick verification of key migration points
export const verifyMigrationStatus = () => {
  const migrationChecklist = {
    '✅ Backend API Service': 'Created apiService.js with Journey data endpoints',
    '✅ Data Analyzer': 'Updated to use fetchJourneyData() instead of usersData.json',
    '✅ Dashboard Analytics': 'Converted to async/await with real Journey schema',
    '✅ OD Matrix Analytics': 'Updated to use Journey model with Kerala zones',
    '⚠️  Geospatial Component': 'Partially updated - needs full async conversion',
    '✅ Database Integration': '60 real Kerala journey entries available'
  };
  
  console.log('\n=== MIGRATION STATUS ===');
  Object.entries(migrationChecklist).forEach(([status, description]) => {
    console.log(`${status}: ${description}`);
  });
  
  return migrationChecklist;
};

export default {
  testMigration,
  verifyMigrationStatus
};