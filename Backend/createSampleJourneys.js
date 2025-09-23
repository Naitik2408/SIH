const mongoose = require('mongoose');
const { Journey, User } = require('./src/models');

// Connect to MongoDB - using the same database as the backend
mongoose.connect('mongodb://localhost:27017/sih_transportation_db', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

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
    
    // Other Kerala locations
    { name: 'Alappuzha Backwaters', coordinates: [76.3388, 9.4981] },
    { name: 'Kottayam', coordinates: [76.5222, 9.5916] },
    { name: 'Palakkad', coordinates: [76.6547, 10.7867] },
    { name: 'Malappuram', coordinates: [76.0742, 11.0510] },
    { name: 'Kannur', coordinates: [75.3704, 11.8745] }
];

// Transport modes with realistic distributions (matching schema enum values)
const transportModes = [
    { mode: 'Bus', weight: 30 },
    { mode: 'Metro', weight: 25 },
    { mode: 'Auto/Taxi', weight: 20 },
    { mode: 'Bike', weight: 15 },
    { mode: 'Car', weight: 8 },
    { mode: 'Walking', weight: 2 }
];

// Trip purposes with realistic distributions (matching schema enum values)
const tripPurposes = [
    { purpose: 'Work/Office', weight: 40 },
    { purpose: 'Shopping', weight: 20 },
    { purpose: 'Education', weight: 15 },
    { purpose: 'Healthcare', weight: 10 },
    { purpose: 'Leisure/Entertainment', weight: 10 },
    { purpose: 'Personal', weight: 5 }
];

// Route satisfaction options
const routeSatisfactionOptions = [
    { satisfaction: 'Very Satisfied', weight: 20 },
    { satisfaction: 'Satisfied', weight: 40 },
    { satisfaction: 'Neutral', weight: 25 },
    { satisfaction: 'Dissatisfied', weight: 10 },
    { satisfaction: 'Very Dissatisfied', weight: 5 }
];

// Travel companions options
const travelCompanionsOptions = [
    { companions: 'Just me', weight: 40 },
    { companions: '1 person', weight: 30 },
    { companions: '2-3 people', weight: 20 },
    { companions: '4-5 people', weight: 8 },
    { companions: 'More than 5', weight: 2 }
];

// Time of day options (matching schema enum values)
const timeOfDayOptions = [
    { time: 'Early Morning (6-9 AM)', weight: 15 },
    { time: 'Morning (9-12 PM)', weight: 25 },
    { time: 'Afternoon (12-5 PM)', weight: 20 },
    { time: 'Evening (5-8 PM)', weight: 30 },
    { time: 'Night (8 PM+)', weight: 10 }
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

// Generate realistic GPS tracking data (matching schema structure)
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

// Generate realistic journey data matching the schema
function generateJourneyData(user, index) {
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
        'Bike': 15, // 15 km/h
        'Auto/Taxi': 20, // 20 km/h
        'Bus': 25, // 25 km/h
        'Metro': 35, // 35 km/h
        'Car': 30, // 30 km/h
        'Train': 50, // 50 km/h
        'Personal Vehicle': 30 // 30 km/h
    };
    
    const duration = Math.max(5, Math.round((distance / speedMultipliers[transportMode]) * 60)); // in minutes, minimum 5 minutes
    
    // Generate journey timestamp (random time in last 30 days)
    const daysBack = Math.floor(Math.random() * 30);
    const hoursBack = Math.floor(Math.random() * 24);
    const minutesBack = Math.floor(Math.random() * 60);
    const startTime = new Date();
    startTime.setDate(startTime.getDate() - daysBack);
    startTime.setHours(hoursBack);
    startTime.setMinutes(minutesBack);
    startTime.setSeconds(0);
    
    const endTime = new Date(startTime.getTime() + (duration * 60 * 1000));
    
    // Generate unique trip ID
    const tripId = `TRIP_${user._id.toString().slice(-8)}_${Date.now()}_${index}`;
    
    return {
        tripId,
        userId: user._id,
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
            actualDurationFormatted: `${Math.floor(duration / 60)}h ${duration % 60}m`,
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
                platform: ['android', 'ios'][Math.floor(Math.random() * 2)],
                version: ['11.0', '12.0', '13.0', '14.0'][Math.floor(Math.random() * 4)]
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

async function generateSampleJourneys() {
    try {
        console.log('🚀 Starting sample journey data generation...\n');
        
        // Get all customer users
        const customers = await User.find({ role: 'customer' });
        console.log(`📊 Found ${customers.length} customer users`);
        
        if (customers.length === 0) {
            console.log('❌ No customer users found! Please run createSampleUsers.js first');
            process.exit(1);
        }
        
        // Generate 50+ journeys (6-8 journeys per customer)
        const journeysToCreate = [];
        const journeysPerCustomer = Math.ceil(55 / customers.length); // Ensure at least 55 journeys
        
        console.log(`🎯 Generating ${journeysPerCustomer} journeys per customer (${journeysPerCustomer * customers.length} total)\n`);
        
        for (const customer of customers) {
            console.log(`👤 Generating journeys for ${customer.name}...`);
            
            for (let i = 0; i < journeysPerCustomer; i++) {
                const journeyData = generateJourneyData(customer, i);
                journeysToCreate.push(journeyData);
            }
        }
        
        // Insert all journeys into database
        console.log(`\n💾 Inserting ${journeysToCreate.length} journeys into database...`);
        const insertedJourneys = await Journey.insertMany(journeysToCreate);
        
        console.log(`✅ Successfully created ${insertedJourneys.length} sample journeys!\n`);
        
        // Generate summary statistics
        const stats = {
            totalJourneys: insertedJourneys.length,
            transportModes: {},
            purposes: {},
            avgDistance: 0,
            avgDuration: 0,
            avgSatisfaction: 0
        };
        
        let totalDistance = 0;
        let totalDuration = 0;
        let totalSatisfaction = 0;
        
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
            
            // Convert satisfaction to numeric value for averaging
            const satisfactionMap = {
                'Very Satisfied': 5,
                'Satisfied': 4,
                'Neutral': 3,
                'Dissatisfied': 2,
                'Very Dissatisfied': 1
            };
            totalSatisfaction += satisfactionMap[journey.surveyData.routeSatisfaction] || 3;
        });
        
        stats.avgDistance = Math.round((totalDistance / insertedJourneys.length) * 100) / 100;
        stats.avgDuration = Math.round(totalDuration / insertedJourneys.length);
        stats.avgSatisfaction = Math.round((totalSatisfaction / insertedJourneys.length) * 10) / 10;
        
        // Display statistics
        console.log('📈 Journey Data Summary:');
        console.log(`   Total Journeys: ${stats.totalJourneys}`);
        console.log(`   Average Distance: ${stats.avgDistance} km`);
        console.log(`   Average Duration: ${stats.avgDuration} minutes`);
        console.log(`   Average Satisfaction: ${stats.avgSatisfaction}/5`);
        
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
        
        console.log('\n🔬 Ready for Scientist Analysis!');
        console.log('   API Endpoint: GET /api/journeys/scientist-data');
        console.log('   Data includes: GPS tracking, demographics, transport patterns, temporal analysis');
        console.log('\n✨ Sample journey data generation completed successfully!');
        
    } catch (error) {
        console.error('❌ Error generating sample journeys:', error);
    } finally {
        mongoose.disconnect();
    }
}

// Run the generation
generateSampleJourneys();