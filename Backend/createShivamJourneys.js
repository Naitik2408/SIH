const mongoose = require('mongoose');
const { Journey, User } = require('./src/models');

// Connect to MongoDB - using the same database as the backend
mongoose.connect('mongodb://localhost:27017/sih_transportation_db', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Shivam's user ID from the provided data
const SHIVAM_USER_ID = "68d3029a6790029c0c288aa4";

// Sample locations in major Kerala cities
const locations = [
    // Thiruvananthapuram (Trivandrum)
    { name: 'Thiruvananthapuram Central', coordinates: [76.9366, 8.5241] },
    { name: 'Technopark', coordinates: [76.9166, 8.5486] },
    { name: 'Kovalam', coordinates: [76.9789, 8.4004] },
    { name: 'Vellayani', coordinates: [76.9833, 8.4333] },
    { name: 'Neyyattinkara', coordinates: [77.0833, 8.4000] },
    
    // Kochi (Cochin)
    { name: 'Marine Drive Kochi', coordinates: [76.2673, 9.9312] },
    { name: 'Infopark Kakkanad', coordinates: [76.3500, 10.0333] },
    { name: 'Fort Kochi', coordinates: [76.2366, 9.9658] },
    { name: 'Edappally', coordinates: [76.3080, 10.0248] },
    { name: 'Aluva', coordinates: [76.3525, 10.1081] },
    
    // Kozhikode (Calicut)
    { name: 'Kozhikode Beach', coordinates: [75.7704, 11.2588] },
    { name: 'Cyberpark Kozhikode', coordinates: [75.8333, 11.2500] },
    { name: 'Mavoor', coordinates: [75.9167, 11.2833] },
    { name: 'Ramanattukara', coordinates: [75.9333, 11.3167] },
    { name: 'Feroke', coordinates: [75.8333, 11.1833] },
    
    // Thrissur
    { name: 'Thrissur Round', coordinates: [76.2144, 10.5276] },
    { name: 'Sobha City Thrissur', coordinates: [76.2667, 10.5500] },
    { name: 'Ollur', coordinates: [76.1833, 10.5333] },
    { name: 'Irinjalakuda', coordinates: [76.2167, 10.3500] },
    { name: 'Chalakudy', coordinates: [76.3333, 10.3000] },
    
    // Kollam
    { name: 'Kollam Junction', coordinates: [76.6144, 8.8932] },
    { name: 'Kollam Beach', coordinates: [76.6000, 8.8833] },
    { name: 'Paravur', coordinates: [76.6667, 8.8000] },
    { name: 'Karunagappally', coordinates: [76.5333, 9.0500] },
    { name: 'Punalur', coordinates: [76.9167, 9.0167] },
    
    // Common student locations
    { name: 'University College Trivandrum', coordinates: [76.9339, 8.5097] },
    { name: 'Kerala University Campus', coordinates: [76.9019, 8.5565] },
    { name: 'Engineering College', coordinates: [76.9458, 8.5211] },
    { name: 'Medical College', coordinates: [76.9222, 8.5178] },
    { name: 'City Library', coordinates: [76.9299, 8.5084] }
];

// Transport modes suitable for a student (based on profile: uses public transport, no vehicles)
const transportModes = [
    { mode: 'Bus', weight: 50 }, // Most common for students
    { mode: 'Metro', weight: 25 },
    { mode: 'Auto/Taxi', weight: 15 }, // Occasional use
    { mode: 'Walking', weight: 10 } // Short distances
];

// Trip purposes suitable for a student
const tripPurposes = [
    { purpose: 'Education', weight: 60 }, // Primary purpose for student
    { purpose: 'Shopping', weight: 15 },
    { purpose: 'Leisure/Entertainment', weight: 15 },
    { purpose: 'Personal', weight: 10 }
];

// Route satisfaction options
const routeSatisfactionOptions = [
    { satisfaction: 'Very Satisfied', weight: 20 },
    { satisfaction: 'Satisfied', weight: 40 },
    { satisfaction: 'Neutral', weight: 25 },
    { satisfaction: 'Dissatisfied', weight: 10 },
    { satisfaction: 'Very Dissatisfied', weight: 5 }
];

// Travel companions options (students often travel with friends)
const travelCompanionsOptions = [
    { companions: 'Just me', weight: 30 },
    { companions: '1 person', weight: 35 }, // Common for students
    { companions: '2-3 people', weight: 25 },
    { companions: '4-5 people', weight: 10 }
];

// Time of day options (student schedule focused)
const timeOfDayOptions = [
    { time: 'Early Morning (6-9 AM)', weight: 25 }, // Classes
    { time: 'Morning (9-12 PM)', weight: 30 }, // Peak class time
    { time: 'Afternoon (12-5 PM)', weight: 25 }, // Afternoon classes/activities
    { time: 'Evening (5-8 PM)', weight: 15 }, // Return home
    { time: 'Night (8 PM+)', weight: 5 } // Minimal night travel
];

// Generate random weighted selection
function getRandomWeighted(items) {
    const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const item of items) {
        random -= item.weight;
        if (random <= 0) {
            return item.mode || item.purpose || item.satisfaction || item.companions || item.time;
        }
    }
    // Fallback to first item
    return items[0].mode || items[0].purpose || items[0].satisfaction || items[0].companions || items[0].time;
}

// Generate realistic GPS tracking data
function generateGPSTracking(startCoords, endCoords, duration, startTime) {
    const coordinates = [];
    const steps = Math.max(3, Math.floor(duration / 5)); // One point every 5 minutes
    
    for (let i = 0; i <= steps; i++) {
        const ratio = i / steps;
        const lat = startCoords[1] + (endCoords[1] - startCoords[1]) * ratio;
        const lng = startCoords[0] + (endCoords[0] - startCoords[0]) * ratio;
        
        // Add small random variations to simulate real GPS tracking
        const variance = 0.001;
        const finalLat = lat + (Math.random() - 0.5) * variance;
        const finalLng = lng + (Math.random() - 0.5) * variance;
        
        coordinates.push({
            lat: finalLat,
            lng: finalLng,
            timestamp: new Date(startTime.getTime() + (i * (duration * 60 * 1000) / steps)),
            accuracy: Math.random() * 10 + 5, // 5-15 meters accuracy
            speed: Math.random() * 50 + 10, // 10-60 km/h
            heading: Math.random() * 360 // Random heading 0-360 degrees
        });
    }
    
    return coordinates;
}

// Calculate distance between two coordinates (approximate)
function calculateDistance(coord1, coord2) {
    const R = 6371; // Earth's radius in km
    const dLat = (coord2[1] - coord1[1]) * Math.PI / 180;
    const dLon = (coord2[0] - coord1[0]) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(coord1[1] * Math.PI / 180) * Math.cos(coord2[1] * Math.PI / 180) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// Generate realistic journey data for Shivam (student profile)
function generateShivamJourneyData(userId, index) {
    const startLocation = locations[Math.floor(Math.random() * locations.length)];
    let endLocation;
    do {
        endLocation = locations[Math.floor(Math.random() * locations.length)];
    } while (endLocation.name === startLocation.name);
    
    const transportMode = getRandomWeighted(transportModes);
    const journeyPurpose = getRandomWeighted(tripPurposes);
    const routeSatisfaction = getRandomWeighted(routeSatisfactionOptions);
    const travelCompanions = getRandomWeighted(travelCompanionsOptions);
    const timeOfDay = getRandomWeighted(timeOfDayOptions);
    
    const distance = calculateDistance(startLocation.coordinates, endLocation.coordinates);
    
    // Calculate duration based on transport mode and distance
    const speedMultipliers = {
        'Walking': 5, // 5 km/h
        'Auto/Taxi': 20, // 20 km/h
        'Bus': 25, // 25 km/h
        'Metro': 35 // 35 km/h
    };
    
    const duration = Math.max(5, Math.round((distance / speedMultipliers[transportMode]) * 60)); // in minutes, minimum 5 minutes
    
    // Generate journey timestamp (random time in last 15 days for recent activity)
    const daysBack = Math.floor(Math.random() * 15);
    const hoursBack = Math.floor(Math.random() * 24);
    const minutesBack = Math.floor(Math.random() * 60);
    const startTime = new Date();
    startTime.setDate(startTime.getDate() - daysBack);
    startTime.setHours(hoursBack);
    startTime.setMinutes(minutesBack);
    startTime.setSeconds(0);
    
    const endTime = new Date(startTime.getTime() + (duration * 60 * 1000));
    
    // Generate unique trip ID for Shivam
    const tripId = `SHIVAM_${userId.slice(-8)}_${Date.now()}_${index}`;
    
    return {
        tripId,
        userId: new mongoose.Types.ObjectId(userId),
        status: Math.random() > 0.9 ? 'in_progress' : 'completed', // 90% completed trips
        surveyData: {
            transportMode,
            journeyPurpose,
            routeSatisfaction,
            timeOfDay,
            travelCompanions
        },
        tripDetails: {
            startTime,
            endTime,
            actualDuration: duration,
            actualDurationFormatted: duration < 60 
                ? `${duration} min` 
                : `${Math.floor(duration / 60)}h ${duration % 60}m`,
            startLocation: {
                lat: startLocation.coordinates[1],
                lng: startLocation.coordinates[0],
                address: `${startLocation.name}, Kerala, India`,
                timestamp: startTime
            },
            endLocation: {
                lat: endLocation.coordinates[1],
                lng: endLocation.coordinates[0],
                address: `${endLocation.name}, Kerala, India`,
                timestamp: endTime
            }
        },
        gpsTrackingData: generateGPSTracking(startLocation.coordinates, endLocation.coordinates, duration, startTime),
        metadata: {
            deviceInfo: {
                platform: 'android', // Assuming Android for student
                version: '12.0'
            },
            appVersion: '1.0.0',
            totalDistance: Math.round(distance * 100) / 100,
            averageSpeed: Math.round((distance / (duration / 60)) * 100) / 100
        },
        rewards: {
            pointsEarned: Math.floor(Math.random() * 20) + 10, // 10-30 points
            description: 'Journey completion reward'
        },
        createdAt: startTime,
        updatedAt: endTime
    };
}

async function generateShivamJourneys() {
    try {
        console.log('🚀 Starting Shivam\'s journey data generation...\n');
        
        // Verify Shivam exists in database
        const shivam = await User.findById(SHIVAM_USER_ID);
        if (!shivam) {
            console.log('❌ Shivam user not found! Please check the user ID');
            process.exit(1);
        }
        
        console.log(`👤 Found user: ${shivam.name} (${shivam.email})`);
        console.log(`📊 Profile: ${shivam.profile.age} year old ${shivam.profile.gender} ${shivam.profile.occupation}`);
        console.log(`🚌 Uses Public Transport: ${shivam.profile.usesPublicTransport}`);
        console.log(`🏠 Household Size: ${shivam.profile.householdSize}\n`);
        
        // Generate 15-20 journeys for Shivam (good sample size for testing)
        const numberOfJourneys = 15 + Math.floor(Math.random() * 6); // 15-20 journeys
        const journeysToCreate = [];
        
        console.log(`🎯 Generating ${numberOfJourneys} journeys for Shivam...\n`);
        
        for (let i = 0; i < numberOfJourneys; i++) {
            const journeyData = generateShivamJourneyData(SHIVAM_USER_ID, i);
            journeysToCreate.push(journeyData);
            
            console.log(`📝 Journey ${i + 1}: ${journeyData.tripDetails.startLocation.address.split(',')[0]} → ${journeyData.tripDetails.endLocation.address.split(',')[0]} (${journeyData.surveyData.transportMode}, ${journeyData.surveyData.journeyPurpose})`);
        }
        
        // Insert all journeys into database
        console.log(`\n💾 Inserting ${journeysToCreate.length} journeys into database...`);
        const insertedJourneys = await Journey.insertMany(journeysToCreate);
        
        console.log(`✅ Successfully created ${insertedJourneys.length} journeys for Shivam!\n`);
        
        // Generate summary statistics
        const stats = {
            totalJourneys: insertedJourneys.length,
            transportModes: {},
            purposes: {},
            avgDistance: 0,
            avgDuration: 0,
            totalDistance: 0,
            totalDuration: 0
        };
        
        let totalDistance = 0;
        let totalDuration = 0;
        
        insertedJourneys.forEach(journey => {
            // Count transport modes
            const mode = journey.surveyData.transportMode;
            stats.transportModes[mode] = (stats.transportModes[mode] || 0) + 1;
            
            // Count purposes
            const purpose = journey.surveyData.journeyPurpose;
            stats.purposes[purpose] = (stats.purposes[purpose] || 0) + 1;
            
            // Sum for averages
            totalDistance += journey.metadata.totalDistance;
            totalDuration += journey.tripDetails.actualDuration;
        });
        
        stats.avgDistance = Math.round((totalDistance / insertedJourneys.length) * 100) / 100;
        stats.avgDuration = Math.round(totalDuration / insertedJourneys.length);
        stats.totalDistance = Math.round(totalDistance * 100) / 100;
        stats.totalDuration = Math.round(totalDuration);
        
        // Display statistics
        console.log('📈 Shivam\'s Journey Summary:');
        console.log(`   Total Journeys: ${stats.totalJourneys}`);
        console.log(`   Total Distance: ${stats.totalDistance} km`);
        console.log(`   Total Duration: ${Math.floor(stats.totalDuration / 60)}h ${stats.totalDuration % 60}m`);
        console.log(`   Average Distance: ${stats.avgDistance} km`);
        console.log(`   Average Duration: ${stats.avgDuration} minutes`);
        
        console.log('\n🚌 Transport Mode Distribution:');
        Object.entries(stats.transportModes).forEach(([mode, count]) => {
            const percentage = Math.round((count / stats.totalJourneys) * 100);
            console.log(`   ${mode}: ${count} (${percentage}%)`);
        });
        
        console.log('\n🎯 Trip Purpose Distribution:');
        Object.entries(stats.purposes).forEach(([purpose, count]) => {
            const percentage = Math.round((count / stats.totalJourneys) * 100);
            console.log(`   ${purpose}: ${count} (${percentage}%)`);
        });
        
        console.log('\n🔗 API Testing:');
        console.log('   User Journey Endpoint: GET /api/journeys/my-journeys');
        console.log('   Scientist Data Endpoint: GET /api/journeys/scientist-data');
        console.log(`   User ID: ${SHIVAM_USER_ID}`);
        
        console.log('\n📱 Mobile App Testing:');
        console.log('   Login with: shivam@user.com');
        console.log('   Navigate to: Customer Trip Logs');
        console.log('   Expected: Display all generated journeys with real data');
        
        console.log('\n✨ Shivam\'s journey data generation completed successfully!');
        
    } catch (error) {
        console.error('❌ Error generating Shivam\'s journeys:', error);
    } finally {
        mongoose.disconnect();
    }
}

// Run the generation
generateShivamJourneys();