import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Animated,
    FlatList,
    Dimensions,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// import * as Location from 'expo-location'; // Temporarily commented out
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SIZES, FONTS } from '../../constants';
import { User } from '../../types';

interface CustomerHomeProps {
    user: User;
    onNavigateToNotifications?: () => void;
}

interface SurveyQuestion {
    id: string;
    question: string;
    options: string[];
    defaultAnswer: number; // Index of default selected option
}

interface BenefitCard {
    id: string;
    title: string;
    description: string;
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
    points: string;
}

// Add new interfaces for journey tracking
interface LocationPoint {
    lat: number;
    lng: number;
    accuracy: number;
    timestamp: string;
    speed: number | null;
    heading: number | null;
}

interface MockLocationObject {
    coords: {
        latitude: number;
        longitude: number;
        accuracy: number | null;
        speed: number | null;
        heading: number | null;
    };
    timestamp: number;
}

interface JourneyData {
    tripId: string;
    userId: string;
    status: 'in_progress' | 'completed';
    surveyData: {
        transportMode: string;
        journeyPurpose: string;
        routeSatisfaction: string;
        timeOfDay: string;
        travelCompanions: string;
    };
    tripDetails: {
        startTime: string;
        endTime: string | null;
        actualDuration: number;
        actualDurationFormatted: string;
        startLocation: {
            lat: number;
            lng: number;
            address: string;
            timestamp: string;
        } | null;
        endLocation: {
            lat: number;
            lng: number;
            address: string;
            timestamp: string;
        } | null;
    };
    gpsTrackingData: LocationPoint[];
    metadata: {
        appVersion: string;
        deviceInfo: {
            platform: string;
            model: string;
            osVersion: string;
        };
        networkType: string;
        batteryLevel: number;
        dataCollectionConsent: boolean;
        privacyLevel: string;
    };
    rewards: {
        pointsEarned: number;
        badgesUnlocked: string[];
        milestoneReached: boolean;
    } | null;
    createdAt: string;
    updatedAt: string;
}

const { width: screenWidth } = Dimensions.get('window');
const CARD_WIDTH = screenWidth * 0.8;

const surveyQuestions: SurveyQuestion[] = [
    {
        id: '1',
        question: 'What is your primary mode of transport today?',
        options: ['Bus', 'Train', 'Auto/Taxi', 'Walking', 'Personal Vehicle'],
        defaultAnswer: 0
    },
    {
        id: '2',
        question: 'What is the purpose of your journey?',
        options: ['Work/Office', 'Education', 'Shopping', 'Healthcare', 'Leisure/Entertainment'],
        defaultAnswer: 0
    },
    {
        id: '3',
        question: 'How would you rate your current route satisfaction?',
        options: ['Very Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'Very Dissatisfied'],
        defaultAnswer: 2
    },
    {
        id: '4',
        question: 'What time of day are you traveling?',
        options: ['Early Morning (6-9 AM)', 'Morning (9-12 PM)', 'Afternoon (12-5 PM)', 'Evening (5-8 PM)', 'Night (8 PM+)'],
        defaultAnswer: 0
    },
    {
        id: '5',
        question: 'How many people are traveling with you?',
        options: ['Just me', '1 person', '2-3 people', '4-5 people', 'More than 5'],
        defaultAnswer: 0
    }
];

const benefitCards: BenefitCard[] = [
    {
        id: '1',
        title: 'Train Ticket Discounts',
        description: 'Get up to 15% off on train bookings using your earned points',
        icon: 'train-outline',
        color: '#10b981',
        points: '50 pts'
    },
    {
        id: '2',
        title: 'Government Service Benefits',
        description: 'Fast-track processing for passport, license & other govt services',
        icon: 'document-text-outline',
        color: '#3b82f6',
        points: '100 pts'
    },
    {
        id: '3',
        title: 'Bus & Metro Cashback',
        description: 'Earn 5% cashback on all public transport transactions',
        icon: 'bus-outline',
        color: '#f59e0b',
        points: '25 pts'
    },
    {
        id: '4',
        title: 'Exclusive Rewards',
        description: 'Unlock premium rewards and special offers from partner brands',
        icon: 'gift-outline',
        color: '#ef4444',
        points: '200 pts'
    }
];

const CustomerHome: React.FC<CustomerHomeProps> = ({ user, onNavigateToNotifications }) => {
    const [showSurvey, setShowSurvey] = React.useState(false);
    const [currentQuestion, setCurrentQuestion] = React.useState(0);
    const [journeyStarted, setJourneyStarted] = React.useState(false);
    const [answers, setAnswers] = React.useState<{ [key: string]: number }>(() => {
        // Initialize with default answers
        const defaultAnswers: { [key: string]: number } = {};
        surveyQuestions.forEach(q => {
            defaultAnswers[q.id] = q.defaultAnswer;
        });
        return defaultAnswers;
    });

    // Timer states
    const [elapsedTime, setElapsedTime] = React.useState(0);
    const timerRef = React.useRef<NodeJS.Timeout | null>(null);

    // GPS tracking states
    const [currentJourney, setCurrentJourney] = React.useState<JourneyData | null>(null);
    const [locationWatcher, setLocationWatcher] = React.useState<NodeJS.Timeout | null>(null);
    const [currentLocation, setCurrentLocation] = React.useState<MockLocationObject | null>(null);
    const [gpsTrackingPoints, setGpsTrackingPoints] = React.useState<LocationPoint[]>([]);

    // Carousel states
    const [currentBenefitIndex, setCurrentBenefitIndex] = React.useState(0);
    const benefitFlatListRef = React.useRef<FlatList>(null);

    // ScrollView ref for smooth scrolling
    const scrollViewRef = React.useRef<ScrollView>(null);

    // Cleanup timer on unmount
    React.useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
            if (locationWatcher) {
                clearInterval(locationWatcher);
            }
        };
    }, []);

    // Animation for End Journey button
    const pulseAnim = React.useRef(new Animated.Value(1)).current;

    // Utility Functions
    const generateTripId = (): string => {
        const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
        const time = new Date().getTime().toString().slice(-6);
        return `TRIP_${date}_${time}`;
    };

    const formatTime = (seconds: number): string => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const requestLocationPermissions = async (): Promise<boolean> => {
        try {
            // Mock location permission - always granted for demo
            Alert.alert(
                'Location Permission',
                'Demo mode: Location tracking enabled with mock GPS data.',
                [{ text: 'OK' }]
            );
            return true;
        } catch (error) {
            console.error('Error requesting location permissions:', error);
            return false;
        }
    };

    const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
        try {
            // Mock reverse geocoding - return formatted coordinates
            const locations = [
                { lat: 12.9716, lng: 77.5946, name: "MG Road, Bangalore" },
                { lat: 13.0827, lng: 80.2707, name: "Anna Salai, Chennai" },
                { lat: 28.6139, lng: 77.2090, name: "Connaught Place, New Delhi" },
                { lat: 19.0760, lng: 72.8777, name: "Andheri West, Mumbai" },
            ];
            
            // Find closest location or return coordinates
            const closest = locations.find(loc => 
                Math.abs(loc.lat - lat) < 0.1 && Math.abs(loc.lng - lng) < 0.1
            );
            
            return closest ? closest.name : `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        } catch (error) {
            console.error('Error reverse geocoding:', error);
            return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        }
    };

    // Mock location generator
    const generateMockLocation = (baseLocation?: MockLocationObject): MockLocationObject => {
        const base = baseLocation || {
            coords: {
                latitude: 12.9716 + (Math.random() - 0.5) * 0.01,
                longitude: 77.5946 + (Math.random() - 0.5) * 0.01,
                accuracy: 3 + Math.random() * 3,
                speed: Math.random() * 50,
                heading: Math.random() * 360,
            },
            timestamp: Date.now(),
        };

        return {
            coords: {
                latitude: base.coords.latitude + (Math.random() - 0.5) * 0.001,
                longitude: base.coords.longitude + (Math.random() - 0.5) * 0.001,
                accuracy: 3 + Math.random() * 3,
                speed: Math.random() * 50,
                heading: Math.random() * 360,
            },
            timestamp: Date.now(),
        };
    };

    const saveJourneyToStorage = async (journey: JourneyData): Promise<void> => {
        try {
            // Save to AsyncStorage for app functionality
            const existingLogs = await AsyncStorage.getItem('journeyLogs');
            const logs = existingLogs ? JSON.parse(existingLogs) : { journeyLogs: [], summary: {} };
            
            const existingIndex = logs.journeyLogs.findIndex((log: JourneyData) => log.tripId === journey.tripId);
            
            if (existingIndex >= 0) {
                logs.journeyLogs[existingIndex] = journey;
            } else {
                logs.journeyLogs.push(journey);
            }

            // Update summary
            const completedTrips = logs.journeyLogs.filter((log: JourneyData) => log.status === 'completed');
            logs.summary = {
                totalTrips: logs.journeyLogs.length,
                completedTrips: completedTrips.length,
                inProgressTrips: logs.journeyLogs.filter((log: JourneyData) => log.status === 'in_progress').length,
                totalPoints: logs.journeyLogs.reduce((sum: number, log: JourneyData) => sum + (log.rewards?.pointsEarned || 0), 0),
                totalDistance: completedTrips.reduce((sum: number, log: JourneyData) => {
                    // Calculate distance between start and end points (approximate)
                    if (log.tripDetails.startLocation && log.tripDetails.endLocation) {
                        const start = log.tripDetails.startLocation;
                        const end = log.tripDetails.endLocation;
                        const distance = Math.sqrt(
                            Math.pow(end.lat - start.lat, 2) + Math.pow(end.lng - start.lng, 2)
                        ) * 111; // Rough conversion to km
                        return sum + distance;
                    }
                    return sum;
                }, 0),
                totalDuration: completedTrips.reduce((sum: number, log: JourneyData) => sum + log.tripDetails.actualDuration, 0),
                averageRating: completedTrips.length > 0 ? 4.0 : 0, // Default rating
                preferredModes: [...new Set(logs.journeyLogs.map((log: JourneyData) => log.surveyData.transportMode))],
                commonPurposes: [...new Set(logs.journeyLogs.map((log: JourneyData) => log.surveyData.journeyPurpose))]
            };

            await AsyncStorage.setItem('journeyLogs', JSON.stringify(logs));
            
            // Show the data that would be added to journeyLogs.json
            console.log('📝 Journey Data for journeyLogs.json:');
            console.log('=====================================');
            console.log(JSON.stringify(journey, null, 2));
            console.log('=====================================');
            console.log('📊 Updated Summary:');
            console.log(JSON.stringify(logs.summary, null, 2));
            
            // Create a user-friendly alert showing the data
            const dataPreview = `
🆔 Trip ID: ${journey.tripId}
🚌 Transport: ${journey.surveyData.transportMode}
🎯 Purpose: ${journey.surveyData.journeyPurpose}
⏱️ Duration: ${journey.tripDetails.actualDurationFormatted}
📍 GPS Points: ${journey.gpsTrackingData.length}
🏆 Points: ${journey.rewards?.pointsEarned || 0}
📱 Status: ${journey.status}
            `.trim();

            if (journey.status === 'completed') {
                Alert.alert(
                    '✅ Journey Saved!',
                    `Your journey data has been logged:\n\n${dataPreview}\n\nThis data would be added to journeyLogs.json in a real backend system.`,
                    [{ text: 'View in Console', onPress: () => console.log('Full Journey Data:', journey) }]
                );
            }

            console.log('Journey saved successfully:', journey.tripId);
        } catch (error) {
            console.error('Error saving journey to storage:', error);
            Alert.alert('Error', 'Failed to save journey data. Please check console for details.');
        }
    };

    // Animation functions
    const startPulseAnimation = () => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.1,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    };

    const stopPulseAnimation = () => {
        pulseAnim.stopAnimation();
        Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
        }).start();
    };

    // Timer functions
    const startTimer = () => {
        setElapsedTime(0);
        timerRef.current = setInterval(() => {
            setElapsedTime(prev => prev + 1);
        }, 1000);
    };

    const stopTimer = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        setElapsedTime(0);
    };

    // GPS Tracking Functions (Mock Implementation)
    const startLocationTracking = async (): Promise<void> => {
        try {
            const hasPermission = await requestLocationPermissions();
            if (!hasPermission) return;

            // Generate initial mock location
            const initialLocation = generateMockLocation();
            setCurrentLocation(initialLocation);

            // Start mock location updates every 5 seconds
            const watcher = setInterval(() => {
                const newLocation = generateMockLocation(currentLocation || undefined);
                setCurrentLocation(newLocation);
                
                // Add GPS point to tracking data
                const gpsPoint: LocationPoint = {
                    lat: newLocation.coords.latitude,
                    lng: newLocation.coords.longitude,
                    accuracy: newLocation.coords.accuracy || 0,
                    timestamp: new Date().toISOString(),
                    speed: newLocation.coords.speed || null,
                    heading: newLocation.coords.heading || null,
                };

                setGpsTrackingPoints(prev => [...prev, gpsPoint]);

                // Update current journey with new GPS data
                if (currentJourney) {
                    const updatedJourney = {
                        ...currentJourney,
                        gpsTrackingData: [...currentJourney.gpsTrackingData, gpsPoint],
                        tripDetails: {
                            ...currentJourney.tripDetails,
                            actualDuration: elapsedTime,
                            actualDurationFormatted: formatTime(elapsedTime),
                        },
                        updatedAt: new Date().toISOString(),
                    };

                    setCurrentJourney(updatedJourney);
                    // Auto-save progress every minute and simulate file update
                    if (elapsedTime % 60 === 0 && elapsedTime > 0) {
                        simulateFileUpdate(updatedJourney, 'UPDATE');
                        saveJourneyToStorage(updatedJourney);
                    }
                }
            }, 5000); // Update every 5 seconds

            setLocationWatcher(watcher);
        } catch (error) {
            console.error('Error starting location tracking:', error);
            Alert.alert('Error', 'Failed to start location tracking. Please try again.');
        }
    };

    const stopLocationTracking = (): void => {
        if (locationWatcher) {
            clearInterval(locationWatcher);
            setLocationWatcher(null);
        }
        setGpsTrackingPoints([]);
    };

    const createJourneyData = async (): Promise<JourneyData> => {
        const startTime = new Date().toISOString();
        const startLocation = currentLocation ? {
            lat: currentLocation.coords.latitude,
            lng: currentLocation.coords.longitude,
            address: await reverseGeocode(currentLocation.coords.latitude, currentLocation.coords.longitude),
            timestamp: startTime,
        } : null;

        const surveyData = {
            transportMode: surveyQuestions[0].options[answers['1'] || 0],
            journeyPurpose: surveyQuestions[1].options[answers['2'] || 0],
            routeSatisfaction: surveyQuestions[2].options[answers['3'] || 2],
            timeOfDay: surveyQuestions[3].options[answers['4'] || 0],
            travelCompanions: surveyQuestions[4].options[answers['5'] || 0],
        };

        const journey: JourneyData = {
            tripId: generateTripId(),
            userId: user.id || 'USER_DEFAULT',
            status: 'in_progress',
            surveyData,
            tripDetails: {
                startTime,
                endTime: null,
                actualDuration: 0,
                actualDurationFormatted: '00:00:00',
                startLocation,
                endLocation: null,
            },
            gpsTrackingData: currentLocation ? [{
                lat: currentLocation.coords.latitude,
                lng: currentLocation.coords.longitude,
                accuracy: currentLocation.coords.accuracy || 0,
                timestamp: startTime,
                speed: currentLocation.coords.speed || null,
                heading: currentLocation.coords.heading || null,
            }] : [],
            metadata: {
                appVersion: '1.0.0',
                deviceInfo: {
                    platform: 'React Native',
                    model: 'Mobile Device',
                    osVersion: 'Unknown',
                },
                networkType: 'Unknown',
                batteryLevel: 100,
                dataCollectionConsent: true,
                privacyLevel: 'standard',
            },
            rewards: {
                pointsEarned: 0,
                badgesUnlocked: [],
                milestoneReached: false,
            },
            createdAt: startTime,
            updatedAt: startTime,
        };

        return journey;
    };

    const handleStartJourney = () => {
        setShowSurvey(true);
        setCurrentQuestion(0);

        // Smooth scroll to bottom to show survey questions
        setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100); // Small delay to ensure survey is rendered first
    };

    const handleOptionSelect = (questionId: string, optionIndex: number) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: optionIndex
        }));
    };

    const handleNext = async () => {
        if (currentQuestion < surveyQuestions.length - 1) {
            setCurrentQuestion(prev => prev + 1);
            // Keep survey in view when moving to next question
            setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
            }, 50);
        } else {
            // Survey completed - Journey started
            console.log('Survey completed:', answers);
            setShowSurvey(false);
            setCurrentQuestion(0);
            setJourneyStarted(true); // Mark journey as started

            try {
                // Create and start tracking journey
                const journey = await createJourneyData();
                setCurrentJourney(journey);
                
                // Simulate file update for journey start
                simulateFileUpdate(journey, 'START');
                
                // Start GPS tracking
                await startLocationTracking();
                
                // Start the timer and pulsing animation for End Journey button
                startTimer();
                startPulseAnimation();

                // Save initial journey data
                await saveJourneyToStorage(journey);

                // Scroll to show the timer and end journey button
                setTimeout(() => {
                    scrollViewRef.current?.scrollToEnd({ animated: true });
                }, 100);

                Alert.alert(
                    'Journey Started! 🚀',
                    `Your journey tracking has begun. We'll collect data to help improve transportation in your area.\n\nTrip ID: ${journey.tripId}\nCheck console for detailed logs.`,
                    [{ text: 'Great!' }]
                );
            } catch (error) {
                console.error('Error starting journey:', error);
                Alert.alert('Error', 'Failed to start journey tracking. Please try again.');
                setJourneyStarted(false);
            }
        }
    };

    const handlePrevious = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(prev => prev - 1);
            // Keep survey in view when moving to previous question
            setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
            }, 50);
        }
    };

    const handleEndJourney = async () => {
        try {
            if (!currentJourney) {
                Alert.alert('Error', 'No active journey found.');
                return;
            }

            // Stop the timer and pulsing animation
            stopTimer();
            stopPulseAnimation();

            // Stop location tracking
            stopLocationTracking();

            const endTime = new Date().toISOString();
            const endLocation = currentLocation ? {
                lat: currentLocation.coords.latitude,
                lng: currentLocation.coords.longitude,
                address: await reverseGeocode(currentLocation.coords.latitude, currentLocation.coords.longitude),
                timestamp: endTime,
            } : null;

            // Calculate rewards based on journey
            const pointsEarned = Math.max(10, Math.floor(elapsedTime / 60) * 2); // 2 points per minute
            const badges = [];
            if (elapsedTime >= 1800) badges.push('Long Distance Traveler'); // 30+ minutes
            if (currentJourney.surveyData.transportMode === 'Bus' || currentJourney.surveyData.transportMode === 'Train') {
                badges.push('Public Transport Champion');
            }

            // Update journey with completion data
            const completedJourney: JourneyData = {
                ...currentJourney,
                status: 'completed',
                tripDetails: {
                    ...currentJourney.tripDetails,
                    endTime,
                    endLocation,
                    actualDuration: elapsedTime,
                    actualDurationFormatted: formatTime(elapsedTime),
                },
                gpsTrackingData: [...currentJourney.gpsTrackingData, ...gpsTrackingPoints],
                rewards: {
                    pointsEarned,
                    badgesUnlocked: badges,
                    milestoneReached: pointsEarned >= 50,
                },
                updatedAt: endTime,
            };

            // Simulate file update for journey completion
            simulateFileUpdate(completedJourney, 'COMPLETE');

            // Save completed journey
            await saveJourneyToStorage(completedJourney);

            // Reset states
            setJourneyStarted(false);
            setCurrentJourney(null);
            setCurrentLocation(null);
            setGpsTrackingPoints([]);

            // Reset answers to defaults
            const defaultAnswers: { [key: string]: number } = {};
            surveyQuestions.forEach(q => {
                defaultAnswers[q.id] = q.defaultAnswer;
            });
            setAnswers(defaultAnswers);

            // Show completion message
            Alert.alert(
                'Journey Completed! 🎉',
                `Great job! You've earned ${pointsEarned} points for this journey.${badges.length > 0 ? `\n\nNew badges unlocked: ${badges.join(', ')}` : ''}\n\nTrip ID: ${completedJourney.tripId}\nDuration: ${completedJourney.tripDetails.actualDurationFormatted}\n\nCheck console for detailed journey data that would be added to journeyLogs.json!`,
                [
                    { text: 'View Logs', onPress: showCurrentJourneyLogs },
                    { text: 'Awesome!' }
                ]
            );

            console.log('Journey ended successfully:', completedJourney.tripId);
        } catch (error) {
            console.error('Error ending journey:', error);
            Alert.alert('Error', 'Failed to complete journey. Please try again.');
        }
    };

    const renderBenefitCard = ({ item }: { item: BenefitCard }) => (
        <View style={styles.benefitCard}>
            <View style={styles.benefitCardHeader}>
                <View style={[styles.benefitIconContainer, { backgroundColor: `${item.color}15` }]}>
                    <Ionicons name={item.icon} size={24} color={item.color} />
                </View>
                <View style={[styles.pointsBadge, { backgroundColor: item.color }]}>
                    <Text style={styles.pointsText}>{item.points}</Text>
                </View>
            </View>
            <Text style={styles.benefitTitle}>{item.title}</Text>
            <Text style={styles.benefitDescription}>{item.description}</Text>
            <TouchableOpacity style={[styles.benefitButton, { borderColor: item.color }]}>
                <Text style={[styles.benefitButtonText, { color: item.color }]}>Learn More</Text>
                <Ionicons name="arrow-forward" size={14} color={item.color} />
            </TouchableOpacity>
        </View>
    );

    const onBenefitScroll = (event: any) => {
        const slideSize = CARD_WIDTH + 16; // Card width + margin
        const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);
        setCurrentBenefitIndex(index);
    };

    // Demo function to show current journey logs
    const showCurrentJourneyLogs = async (): Promise<void> => {
        try {
            const existingLogs = await AsyncStorage.getItem('journeyLogs');
            if (existingLogs) {
                const logs = JSON.parse(existingLogs);
                console.log('📂 Current Journey Logs:');
                console.log('========================');
                console.log(JSON.stringify(logs, null, 2));
                
                Alert.alert(
                    '📂 Journey Logs',
                    `Total Trips: ${logs.summary.totalTrips || 0}\nCompleted: ${logs.summary.completedTrips || 0}\nIn Progress: ${logs.summary.inProgressTrips || 0}\nTotal Points: ${logs.summary.totalPoints || 0}`,
                    [
                        { text: 'View Full Log', onPress: () => console.log('Full Logs:', logs) },
                        { text: 'OK' }
                    ]
                );
            } else {
                Alert.alert('📂 Journey Logs', 'No journey data found yet. Start your first journey!');
            }
        } catch (error) {
            console.error('Error reading journey logs:', error);
        }
    };

    // Demo function to simulate real-time file updates
    const simulateFileUpdate = (journey: JourneyData, action: 'START' | 'UPDATE' | 'COMPLETE'): void => {
        const timestamp = new Date().toISOString();
        let message = '';
        
        switch (action) {
            case 'START':
                message = `🟢 JOURNEY STARTED at ${timestamp}\n\nAdding to journeyLogs.json:\n- Trip ID: ${journey.tripId}\n- Status: ${journey.status}\n- Transport: ${journey.surveyData.transportMode}\n- Purpose: ${journey.surveyData.journeyPurpose}`;
                break;
            case 'UPDATE':
                message = `🔄 JOURNEY UPDATE at ${timestamp}\n\nUpdating journeyLogs.json:\n- Trip ID: ${journey.tripId}\n- Duration: ${journey.tripDetails.actualDurationFormatted}\n- GPS Points: ${journey.gpsTrackingData.length}`;
                break;
            case 'COMPLETE':
                message = `🔴 JOURNEY COMPLETED at ${timestamp}\n\nFinalizing in journeyLogs.json:\n- Trip ID: ${journey.tripId}\n- Status: ${journey.status}\n- Total Duration: ${journey.tripDetails.actualDurationFormatted}\n- Points Earned: ${journey.rewards?.pointsEarned}\n- Badges: ${journey.rewards?.badgesUnlocked.join(', ') || 'None'}`;
                break;
        }
        
        console.log('📄 FILE UPDATE SIMULATION:');
        console.log('============================');
        console.log(message);
        console.log('============================');
    };

    return (
        <ScrollView
            ref={scrollViewRef}
            style={styles.container}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
        >
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <Text style={styles.greeting}>Hello, {user.name}! 👋</Text>
                    <Text style={styles.subtitle}>Ready to log your journey?</Text>
                </View>
                <TouchableOpacity
                    style={styles.notificationButton}
                    onPress={onNavigateToNotifications}
                >
                    <Ionicons
                        name="notifications-outline"
                        size={SIZES.subheading + 2}
                        color={COLORS.textSecondary}
                    />
                    {/* Notification badge */}
                    <View style={styles.notificationBadge}>
                        <Text style={styles.badgeText}>3</Text>
                    </View>
                </TouchableOpacity>
            </View>

            <View style={styles.statsContainer}>
                <View style={styles.statCard}>
                    <View style={styles.statIconContainer}>
                        <Ionicons name="bus-outline" size={18} color={COLORS.primary} />
                    </View>
                    <Text style={styles.statNumber}>15</Text>
                    <Text style={styles.statLabel}>Trips Logged</Text>
                </View>
                <View style={styles.statCard}>
                    <View style={styles.statIconContainer}>
                        <Ionicons name="trophy-outline" size={18} color="#f59e0b" />
                    </View>
                    <Text style={styles.statNumber}>250</Text>
                    <Text style={styles.statLabel}>Points Earned</Text>
                </View>
                <TouchableOpacity style={styles.statCard} onPress={showCurrentJourneyLogs}>
                    <View style={styles.statIconContainer}>
                        <Ionicons name="document-text-outline" size={18} color="#10b981" />
                    </View>
                    <Text style={styles.statNumber}>📂</Text>
                    <Text style={styles.statLabel}>View Logs</Text>
                </TouchableOpacity>
            </View>

            {/* Benefits Carousel */}
            <View style={styles.benefitsSection}>
                <Text style={styles.benefitsSectionTitle}>Your Rewards & Benefits</Text>
                <FlatList
                    ref={benefitFlatListRef}
                    data={benefitCards}
                    renderItem={renderBenefitCard}
                    keyExtractor={(item) => item.id}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    pagingEnabled={false}
                    snapToInterval={CARD_WIDTH + 16}
                    snapToAlignment="center"
                    decelerationRate="fast"
                    contentContainerStyle={styles.benefitCarouselContainer}
                    onScroll={onBenefitScroll}
                    scrollEventThrottle={16}
                />

                {/* Carousel Indicators */}
                <View style={styles.carouselIndicators}>
                    {benefitCards.map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.indicator,
                                index === currentBenefitIndex && styles.activeIndicator
                            ]}
                        />
                    ))}
                </View>
            </View>

            {/* Journey Status and GPS Info */}
            {journeyStarted && currentJourney && (
                <View style={styles.journeyStatusContainer}>
                    <View style={styles.journeyStatusCard}>
                        <View style={styles.journeyHeader}>
                            <View style={styles.journeyTitleContainer}>
                                <Ionicons name="navigate-circle" size={20} color={COLORS.primary} />
                                <Text style={styles.journeyTitle}>Journey in Progress</Text>
                            </View>
                            <View style={styles.journeyIdContainer}>
                                <Text style={styles.journeyId}>{currentJourney.tripId}</Text>
                            </View>
                        </View>

                        <View style={styles.journeyStatsRow}>
                            <View style={styles.journeyStatItem}>
                                <Text style={styles.journeyStatLabel}>Transport</Text>
                                <Text style={styles.journeyStatValue}>{currentJourney.surveyData.transportMode}</Text>
                            </View>
                            <View style={styles.journeyStatItem}>
                                <Text style={styles.journeyStatLabel}>Purpose</Text>
                                <Text style={styles.journeyStatValue}>{currentJourney.surveyData.journeyPurpose}</Text>
                            </View>
                            <View style={styles.journeyStatItem}>
                                <Text style={styles.journeyStatLabel}>GPS Points</Text>
                                <Text style={styles.journeyStatValue}>{currentJourney.gpsTrackingData.length}</Text>
                            </View>
                        </View>

                        {currentLocation && (
                            <View style={styles.locationInfo}>
                                <Ionicons name="location" size={14} color={COLORS.textTertiary} />
                                <Text style={styles.locationText}>
                                    {currentLocation.coords.latitude.toFixed(4)}, {currentLocation.coords.longitude.toFixed(4)}
                                </Text>
                                <Text style={styles.accuracyText}>
                                    (±{currentLocation.coords.accuracy?.toFixed(0)}m)
                                </Text>
                            </View>
                        )}
                    </View>
                </View>
            )}

            {/* Timer Display */}
            {journeyStarted && (
                <View style={styles.timerContainer}>
                    <View style={styles.timerCard}>
                        <Ionicons name="time-outline" size={20} color={COLORS.primary} />
                        <Text style={styles.timerLabel}>Journey Time</Text>
                        <Text style={styles.timerText}>{formatTime(elapsedTime)}</Text>
                    </View>
                </View>
            )}

            {/* Journey Button */}
            <View style={styles.startButtonContainer}>
                <Animated.View
                    style={[
                        { transform: [{ scale: journeyStarted ? pulseAnim : 1 }] }
                    ]}
                >
                    <TouchableOpacity
                        style={[
                            styles.startButton,
                            journeyStarted && styles.endJourneyButton
                        ]}
                        onPress={journeyStarted ? handleEndJourney : handleStartJourney}
                    >
                        <Ionicons
                            name={journeyStarted ? "stop-circle" : "play-circle"}
                            size={24}
                            color="#ffffff"
                            style={styles.startIcon}
                        />
                        <Text style={styles.startButtonText}>
                            {journeyStarted ? "End Journey" : "Start Journey"}
                        </Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>

            {/* Inline Survey Questions */}
            {showSurvey && (
                <View style={styles.inlineSurveyContainer}>
                    {/* Progress Bar */}
                    <View style={styles.progressBarContainer}>
                        <View
                            style={[
                                styles.progressBar,
                                { width: `${((currentQuestion + 1) / surveyQuestions.length) * 100}%` }
                            ]}
                        />
                    </View>

                    {/* Progress Text */}
                    <Text style={styles.progressText}>
                        Question {currentQuestion + 1} of {surveyQuestions.length}
                    </Text>

                    {/* Question */}
                    <Text style={styles.inlineQuestionText}>
                        {surveyQuestions[currentQuestion]?.question}
                    </Text>

                    {/* Options */}
                    <View style={styles.inlineOptionsContainer}>
                        {surveyQuestions[currentQuestion]?.options.map((option, index) => {
                            const isSelected = answers[surveyQuestions[currentQuestion].id] === index;
                            return (
                                <TouchableOpacity
                                    key={index}
                                    style={[
                                        styles.inlineOptionButton,
                                        isSelected && styles.selectedInlineOption
                                    ]}
                                    onPress={() => handleOptionSelect(surveyQuestions[currentQuestion].id, index)}
                                >
                                    <Text style={[
                                        styles.inlineOptionText,
                                        isSelected && styles.selectedInlineOptionText
                                    ]}>
                                        {option}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {/* Navigation Buttons */}
                    <View style={styles.inlineNavigationContainer}>
                        <TouchableOpacity
                            style={[
                                styles.inlineNavButton,
                                styles.inlinePreviousButton,
                                currentQuestion === 0 && styles.disabledButton
                            ]}
                            onPress={handlePrevious}
                            disabled={currentQuestion === 0}
                        >
                            <Text style={[
                                styles.inlineNavButtonText,
                                currentQuestion === 0 && styles.disabledButtonText
                            ]}>
                                Previous
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.inlineNavButton, styles.inlineNextButton]}
                            onPress={handleNext}
                        >
                            <Text style={styles.inlineNextButtonText}>
                                {currentQuestion === surveyQuestions.length - 1 ? 'Complete' : 'Next'}
                            </Text>
                            <Ionicons
                                name={currentQuestion === surveyQuestions.length - 1 ? 'checkmark' : 'arrow-forward'}
                                size={16}
                                color="#ffffff"
                                style={styles.navIcon}
                            />
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa', // Match CustomerTripLogs background
    },
    scrollContent: {
        paddingBottom: 120, // Extra padding to ensure content is above bottom navbar
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 24,
        backgroundColor: 'transparent', // Remove background for cleaner look
    },
    headerContent: {
        flex: 1,
        marginRight: 16, // Space between content and notification button
    },
    notificationButton: {
        width: 35,
        height: 35,
        borderRadius: 12,
        backgroundColor: COLORS.white,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#00000062',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        position: 'relative',
        marginTop: 4,
    },
    notificationBadge: {
        position: 'absolute',
        top: -2,
        right: -2,
        backgroundColor: COLORS.primary,
        width: 16,
        height: 16,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: COLORS.white,
    },
    badgeText: {
        fontSize: SIZES.tiny,
        fontFamily: FONTS.bold,
        color: COLORS.white,
        lineHeight: 12,
    },
    greeting: {
        fontSize: SIZES.heading, // 20 - Match trip logs title size
        fontFamily: FONTS.bold,
        color: COLORS.textPrimary, // Use hierarchy colors
        marginBottom: 4,
    },
    subtitle: {
        fontSize: SIZES.body, // 14 - Consistent with body text
        fontFamily: FONTS.regular,
        color: COLORS.textTertiary, // Less prominent subtitle
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        marginBottom: 24,
    },
    statCard: {
        backgroundColor: '#ffffff',
        padding: 16, // Reduced from 20 to 16
        borderRadius: 12,
        alignItems: 'center',
        flex: 1,
        marginHorizontal: 6, // Reduced from 8 to 6
        minHeight: 100, // Reduced from 120 to 100
        justifyContent: 'center',
        // Card shadow styling
        shadowColor: '#00000062',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    statIconContainer: {
        width: 36, // Reduced from 48 to 36
        height: 36, // Reduced from 48 to 36
        borderRadius: 18, // Adjusted for new size
        backgroundColor: 'rgba(162, 142, 249, 0.1)', // Light purple background
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8, // Reduced from 12 to 8
    },
    statNumber: {
        fontSize: SIZES.subheading, // 16 - Reduced from heading (20) to subheading
        fontFamily: FONTS.bold,
        color: COLORS.primary,
        marginBottom: 3, // Reduced from 4 to 3
    },
    statLabel: {
        fontSize: 11, // Slightly smaller than caption (12) for compact look
        fontFamily: FONTS.medium,
        color: COLORS.textTertiary, // Consistent with hierarchy
        textAlign: 'center',
        lineHeight: 14, // Better line height for small text
    },
    startButtonContainer: {
        paddingHorizontal: 20,
        paddingTop: 40, // Distance from stats cards
        alignItems: 'center',
    },
    startButton: {
        backgroundColor: COLORS.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        paddingHorizontal: 32,
        borderRadius: 25, // Pill shape
        minWidth: 180,
        // Enhanced shadow for prominence
        shadowColor: COLORS.primary,
        shadowOffset: {
            width: 0,
            height: 6,
        },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    startIcon: {
        marginRight: 8,
    },
    startButtonText: {
        color: '#ffffff',
        fontSize: SIZES.subheading, // 16
        fontFamily: FONTS.bold,
        letterSpacing: 0.5, // Slight letter spacing for prominence
    },
    // Survey Modal Styles
    surveyContainer: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    surveyHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0, 0, 0, 0.05)',
    },
    closeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
    },
    surveyTitle: {
        fontSize: SIZES.subheading,
        fontFamily: FONTS.bold,
        color: COLORS.textPrimary,
    },
    surveyProgress: {
        fontSize: SIZES.caption,
        fontFamily: FONTS.medium,
        color: COLORS.textTertiary,
        minWidth: 50,
        textAlign: 'right',
    },
    progressBarContainer: {
        height: 4,
        backgroundColor: 'rgba(162, 142, 249, 0.2)',
        marginHorizontal: 20,
        borderRadius: 2,
        marginBottom: 20,
    },
    progressBar: {
        height: '100%',
        backgroundColor: COLORS.primary,
        borderRadius: 2,
    },
    questionContainer: {
        flex: 1,
        paddingHorizontal: 20,
    },
    questionText: {
        fontSize: SIZES.subheading,
        fontFamily: FONTS.bold,
        color: COLORS.textPrimary,
        marginBottom: 24,
        lineHeight: 24,
    },
    optionsContainer: {
        gap: 12,
    },
    optionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.05)',
        shadowColor: '#00000062',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    selectedOption: {
        borderColor: COLORS.primary,
        backgroundColor: 'rgba(162, 142, 249, 0.05)',
    },
    radioCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: COLORS.textDisabled,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    selectedRadio: {
        borderColor: COLORS.primary,
    },
    radioDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.primary,
    },
    optionText: {
        fontSize: SIZES.body,
        fontFamily: FONTS.regular,
        color: COLORS.textSecondary,
        flex: 1,
    },
    selectedOptionText: {
        color: COLORS.primary,
        fontFamily: FONTS.semiBold,
    },
    navigationContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 20,
        backgroundColor: '#ffffff',
        borderTopWidth: 1,
        borderTopColor: 'rgba(0, 0, 0, 0.05)',
        gap: 12,
    },
    navButton: {
        flex: 1,
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    previousButton: {
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
    },
    nextButton: {
        backgroundColor: COLORS.primary,
        flexDirection: 'row',
    },
    disabledButton: {
        backgroundColor: 'rgba(0, 0, 0, 0.02)',
    },
    navButtonText: {
        fontSize: SIZES.body,
        fontFamily: FONTS.semiBold,
        color: COLORS.textSecondary,
    },
    nextButtonText: {
        fontSize: SIZES.body,
        fontFamily: FONTS.semiBold,
        color: '#ffffff',
    },
    disabledButtonText: {
        color: COLORS.textDisabled,
    },
    navIcon: {
        marginLeft: 6,
    },
    endJourneyButton: {
        backgroundColor: '#ef4444', // Red color for end journey
        shadowColor: '#ef4444',
    },
    // Inline Survey Styles
    inlineSurveyContainer: {
        marginHorizontal: 20,
        marginTop: 24,
        padding: 20,
    },
    progressText: {
        fontSize: SIZES.caption,
        fontFamily: FONTS.medium,
        color: COLORS.textTertiary,
        textAlign: 'center',
        marginBottom: 16,
    },
    inlineQuestionText: {
        fontSize: SIZES.subheading,
        fontFamily: FONTS.bold,
        color: COLORS.textPrimary,
        marginBottom: 20,
        lineHeight: 22,
    },
    inlineOptionsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 10,
        marginBottom: 20,
    },
    inlineOptionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'transparent',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: COLORS.textDisabled,
    },
    selectedInlineOption: {
        borderColor: COLORS.primary,
        backgroundColor: COLORS.primary,
    },
    inlineOptionText: {
        fontSize: SIZES.body,
        fontFamily: FONTS.regular,
        color: COLORS.textSecondary,
    },
    selectedInlineOptionText: {
        color: '#ffffff',
        fontFamily: FONTS.semiBold,
    },
    inlineNavigationContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    inlineNavButton: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    inlinePreviousButton: {
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
    },
    inlineNextButton: {
        backgroundColor: COLORS.primary,
        flexDirection: 'row',
    },
    inlineNavButtonText: {
        fontSize: SIZES.body,
        fontFamily: FONTS.semiBold,
        color: COLORS.textSecondary,
    },
    inlineNextButtonText: {
        fontSize: SIZES.body,
        fontFamily: FONTS.semiBold,
        color: '#ffffff',
    },
    // Timer Styles
    timerContainer: {
        paddingHorizontal: 20,
        paddingTop: 20,
        alignItems: 'center',
    },
    timerCard: {
        backgroundColor: '#ffffff',
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#00000062',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        gap: 8,
    },
    timerLabel: {
        fontSize: SIZES.body,
        fontFamily: FONTS.medium,
        color: COLORS.textSecondary,
        marginLeft: 4,
    },
    timerText: {
        fontSize: SIZES.subheading,
        fontFamily: FONTS.bold,
        color: COLORS.primary,
        marginLeft: 8,
        minWidth: 60,
        textAlign: 'center',
    },
    // Benefits Carousel Styles
    benefitsSection: {
        paddingTop: 24,
        paddingBottom: 16,
    },
    benefitsSectionTitle: {
        fontSize: SIZES.subheading,
        fontFamily: FONTS.bold,
        color: COLORS.textPrimary,
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    benefitCarouselContainer: {
        paddingHorizontal: 20,
    },
    benefitCard: {
        width: CARD_WIDTH,
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 20,
        marginRight: 16,
        shadowColor: '#00000062',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 6,
    },
    benefitCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    benefitIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    pointsBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    pointsText: {
        fontSize: SIZES.caption,
        fontFamily: FONTS.bold,
        color: '#ffffff',
    },
    benefitTitle: {
        fontSize: SIZES.subheading,
        fontFamily: FONTS.bold,
        color: COLORS.textPrimary,
        marginBottom: 8,
        lineHeight: 20,
    },
    benefitDescription: {
        fontSize: SIZES.body,
        fontFamily: FONTS.regular,
        color: COLORS.textSecondary,
        lineHeight: 18,
        marginBottom: 16,
    },
    benefitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 1.5,
        backgroundColor: 'transparent',
        gap: 6,
    },
    benefitButtonText: {
        fontSize: SIZES.body,
        fontFamily: FONTS.semiBold,
    },
    carouselIndicators: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 16,
        gap: 8,
    },
    indicator: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
    },
    activeIndicator: {
        width: 20,
        backgroundColor: COLORS.primary,
    },
    // Journey Status Styles
    journeyStatusContainer: {
        paddingHorizontal: 20,
        paddingTop: 16,
    },
    journeyStatusCard: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#00000062',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        borderLeftWidth: 4,
        borderLeftColor: COLORS.primary,
    },
    journeyHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    journeyTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    journeyTitle: {
        fontSize: SIZES.subheading,
        fontFamily: FONTS.bold,
        color: COLORS.textPrimary,
        marginLeft: 8,
    },
    journeyIdContainer: {
        backgroundColor: 'rgba(162, 142, 249, 0.1)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    journeyId: {
        fontSize: SIZES.caption,
        fontFamily: FONTS.medium,
        color: COLORS.primary,
    },
    journeyStatsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    journeyStatItem: {
        flex: 1,
        alignItems: 'center',
    },
    journeyStatLabel: {
        fontSize: SIZES.caption,
        fontFamily: FONTS.medium,
        color: COLORS.textTertiary,
        marginBottom: 2,
    },
    journeyStatValue: {
        fontSize: SIZES.body,
        fontFamily: FONTS.semiBold,
        color: COLORS.textSecondary,
        textAlign: 'center',
    },
    locationInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.02)',
        padding: 8,
        borderRadius: 8,
        marginTop: 4,
    },
    locationText: {
        fontSize: SIZES.caption,
        fontFamily: FONTS.medium,
        color: COLORS.textSecondary,
        marginLeft: 4,
        flex: 1,
    },
    accuracyText: {
        fontSize: SIZES.caption,
        fontFamily: FONTS.regular,
        color: COLORS.textTertiary,
        marginLeft: 4,
    },
});

export default CustomerHome;
