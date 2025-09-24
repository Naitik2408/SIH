import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { COLORS, SIZES, FONTS } from '../../constants';
import { journeyAPI, JourneyData, TokenManager } from '../../services/api';

interface TripItem {
    id: string;
    startTime: string;
    endTime: string;
    origin: string;
    destination: string;
    transport: 'bus' | 'train' | 'auto' | 'walk' | 'car' | 'metro' | 'bike';
    purpose: 'work' | 'study' | 'shopping' | 'health' | 'leisure' | 'personal';
    status: 'completed' | 'upcoming' | 'in-progress';
    date: string; // Date in YYYY-MM-DD format
    duration: string;
    satisfaction?: string;
}

const TripLogsScreen: React.FC = () => {
    const [tripData, setTripData] = useState<TripItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Convert API journey data to TripItem format
    const convertJourneyToTripItem = (journey: JourneyData): TripItem => {
        // Convert transport mode to match interface
        const transportMap: { [key: string]: TripItem['transport'] } = {
            'Bus': 'bus',
            'Train': 'train',
            'Auto/Taxi': 'auto',
            'Walking': 'walk',
            'Personal Vehicle': 'car',
            'Car': 'car',
            'Metro': 'metro',
            'Bike': 'bike'
        };

        // Convert journey purpose to match interface
        const purposeMap: { [key: string]: TripItem['purpose'] } = {
            'Work/Office': 'work',
            'Education': 'study',
            'Shopping': 'shopping',
            'Healthcare': 'health',
            'Leisure/Entertainment': 'leisure',
            'Personal': 'personal'
        };

        const startTime = new Date(journey.tripDetails.startTime);
        const endTime = journey.tripDetails.endTime ? new Date(journey.tripDetails.endTime) : null;

        return {
            id: journey._id,
            startTime: startTime.toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit', 
                hour12: true 
            }),
            endTime: endTime ? endTime.toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit', 
                hour12: true 
            }) : 'In Progress',
            origin: journey.tripDetails.startLocation?.address || 'Unknown',
            destination: journey.tripDetails.endLocation?.address || 'Unknown',
            transport: transportMap[journey.surveyData.transportMode] || 'bus',
            purpose: purposeMap[journey.surveyData.journeyPurpose] || 'personal',
            status: journey.status === 'completed' ? 'completed' : 
                   journey.status === 'in_progress' ? 'in-progress' : 'upcoming',
            date: new Date(journey.tripDetails.startTime).toISOString().split('T')[0],
            duration: journey.tripDetails.actualDurationFormatted || '0 min',
            satisfaction: journey.surveyData.routeSatisfaction
        };
    };

    // Fetch user journeys from API
    const fetchJourneys = async (showRefreshIndicator = false) => {
        try {
            if (showRefreshIndicator) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }
            setError(null);

            console.log('🚗 Fetching user journeys...');
            
            const response = await journeyAPI.getUserJourneys({
                limit: 50 // Get recent 50 trips
            });

            if (!response || !response.journeys) {
                console.error('❌ Invalid response format:', response);
                throw new Error('Invalid response format from server');
            }

            const convertedTrips = response.journeys.map(convertJourneyToTripItem);
            setTripData(convertedTrips);
            
            console.log('✅ Successfully loaded', convertedTrips.length, 'trips');

        } catch (err: any) {
            console.error('❌ Error fetching journeys:', err);
            console.error('❌ Error details:', {
                message: err.message,
                status: err.status,
                code: err.code,
                name: err.name
            });
            
            // More detailed error message
            let errorMessage = 'Failed to load your trips. Please try again.';
            
            if (err.status === 401) {
                errorMessage = 'Authentication failed. Please log in again.';
            } else if (err.status === 403) {
                errorMessage = 'Access denied. You don\'t have permission to view trips.';
            } else if (err.status === 404) {
                errorMessage = 'Trips endpoint not found. Please update the app.';
            } else if (err.status >= 500) {
                errorMessage = 'Server error. Please try again later.';
            } else if (err.code === 'NETWORK_ERROR' || err.code === 'TIMEOUT_ERROR') {
                errorMessage = 'Network error. Please check your internet connection.';
            } else if (err.message?.includes('Invalid response')) {
                errorMessage = 'Server returned invalid data format';
            } else if (err.message) {
                errorMessage = err.message;
            }
            
            setError(errorMessage);
            Alert.alert(
                'Error Loading Trips',
                errorMessage,
                [{ text: 'OK' }]
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // Load data on component mount
    useEffect(() => {
        fetchJourneys();
    }, []);

    // Handle pull to refresh
    const onRefresh = () => {
        fetchJourneys(true);
    };

    // Group trips by date
    const groupTripsByDate = (trips: TripItem[]) => {
        const grouped: { [key: string]: TripItem[] } = {};
        trips.forEach(trip => {
            if (!grouped[trip.date]) {
                grouped[trip.date] = [];
            }
            grouped[trip.date].push(trip);
        });

        // Sort dates in descending order (most recent first)
        const sortedDates = Object.keys(grouped).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

        return sortedDates.map(date => ({
            date,
            trips: grouped[date]
        }));
    };

    // Format date for display
    const formatDateLabel = (dateString: string) => {
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

        if (dateString === today) {
            return 'Today';
        } else if (dateString === yesterday) {
            return 'Yesterday';
        } else {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'short',
                day: 'numeric'
            });
        }
    };

    const getTransportIcon = (transport: string) => {
        switch (transport) {
            case 'bus': return '🚌';
            case 'train': return '🚊';
            case 'auto': return '🛺';
            case 'walk': return '🚶';
            case 'car': return '🚗';
            case 'metro': return '🚇';
            case 'bike': return '🚴';
            default: return '🚌';
        }
    };

    const getPurposeColor = (purpose: string) => {
        switch (purpose) {
            case 'work': return '#3b82f6';
            case 'study': return '#8b5cf6';
            case 'shopping': return '#f59e0b';
            case 'health': return '#10b981';
            case 'leisure': return '#ef4444';
            case 'personal': return '#6b7280';
            default: return '#6b7280';
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'completed':
                return { backgroundColor: '#dcfce7', borderColor: '#22c55e' };
            case 'in-progress':
                return { backgroundColor: '#fef3c7', borderColor: '#f59e0b' };
            case 'upcoming':
                return { backgroundColor: '#f3e8ff', borderColor: '#8b5cf6' };
            default:
                return { backgroundColor: '#f8f9fa', borderColor: '#e5e7eb' };
        }
    };

    const renderDateSection = (dateLabel: string) => {
        return (
            <View style={styles.dateSectionContainer}>
                <Text style={styles.dateSectionText}>{dateLabel}</Text>
                <View style={styles.dateSectionLine} />
            </View>
        );
    };

    const renderTripItem = (item: TripItem) => {
        const statusStyle = getStatusStyle(item.status);

        return (
            <View key={item.id} style={[styles.tripItem, statusStyle]}>
                <View style={styles.timeContainer}>
                    <Text style={styles.timeText}>{item.startTime}</Text>
                    <View style={styles.timeArrow}>
                        <Text style={styles.arrowText}>→</Text>
                    </View>
                    <Text style={styles.timeText}>{item.endTime}</Text>
                </View>

                <View style={styles.contentContainer}>
                    <View style={styles.routeContainer}>
                        <Text style={styles.originText}>{item.origin}</Text>
                        <Text style={styles.routeArrow}> → </Text>
                        <Text style={styles.destinationText}>{item.destination}</Text>
                    </View>

                    <View style={styles.detailsContainer}>
                        <View style={styles.transportContainer}>
                            <Text style={styles.transportIcon}>{getTransportIcon(item.transport)}</Text>
                            <Text style={styles.transportText}>{item.transport.charAt(0).toUpperCase() + item.transport.slice(1)}</Text>
                        </View>

                        <View style={styles.purposeContainer}>
                            <View style={[styles.purposeDot, { backgroundColor: getPurposeColor(item.purpose) }]} />
                            <Text style={styles.purposeText}>{item.purpose.charAt(0).toUpperCase() + item.purpose.slice(1)}</Text>
                        </View>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>My Trips</Text>
            </View>

            {/* Trip List */}
            <ScrollView 
                style={styles.scheduleContainer} 
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[COLORS.primary]}
                        tintColor={COLORS.primary}
                    />
                }
            >
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={COLORS.primary} />
                        <Text style={styles.loadingText}>Loading your trips...</Text>
                    </View>
                ) : error ? (
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>{error}</Text>
                        <TouchableOpacity 
                            style={styles.retryButton} 
                            onPress={() => fetchJourneys()}
                        >
                            <Text style={styles.retryButtonText}>Try Again</Text>
                        </TouchableOpacity>
                    </View>
                ) : tripData.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyIcon}>🗺️</Text>
                        <Text style={styles.emptyTitle}>No trips yet</Text>
                        <Text style={styles.emptySubtitle}>Start your first journey to see your trip history here.</Text>
                    </View>
                ) : (
                    <View style={styles.scheduleList}>
                        {groupTripsByDate(tripData).map(({ date, trips }, index) => (
                            <View key={date}>
                                <View style={[
                                    styles.dateSectionContainer,
                                    index === 0 && { marginTop: 8 } // Less margin for first section
                                ]}>
                                    <Text style={[
                                        styles.dateSectionText,
                                        // Adjust spacing for Today/Yesterday vs dates
                                        (formatDateLabel(date) === 'Today' || formatDateLabel(date) === 'Yesterday')
                                            ? { marginRight: 8 } // Less space for short labels
                                            : { marginRight: 12 } // Normal space for longer date labels
                                    ]}>{formatDateLabel(date)}</Text>
                                    <View style={styles.dateSectionLine} />
                                </View>
                                {trips.map((trip) => renderTripItem(trip))}
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>


        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
        paddingBottom: 0, // Remove bottom padding from container, let ScrollView handle it
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
    },
    title: {
        fontSize: SIZES.heading, // 20 - Main page heading
        fontFamily: FONTS.bold,
        color: COLORS.textPrimary, // Most important - main heading
    },
    scheduleContainer: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 16,
    },
    scheduleList: {
        paddingBottom: 100, // Increased padding to account for bottom tab bar
    },
    tripItem: {
        flexDirection: 'row',
        padding: 20,
        borderRadius: 16,
        marginBottom: 16,
        backgroundColor: '#ffffff',
    },
    timeContainer: {
        alignItems: 'center',
        marginRight: 16,
        minWidth: 80,
    },
    timeText: {
        fontSize: SIZES.caption, // 12 - Supporting timestamps
        color: COLORS.textQuaternary, // Supporting information - less important
        fontFamily: FONTS.semiBold,
    },
    timeArrow: {
        marginVertical: 4,
    },
    arrowText: {
        fontSize: SIZES.subheading, // 16 - Visual separator, needs to be visible
        color: COLORS.textDisabled, // Visual separator - least important
        fontFamily: FONTS.bold,
    },
    contentContainer: {
        flex: 1,
    },
    routeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        flexWrap: 'wrap',
    },
    originText: {
        fontSize: SIZES.subheading, // 16 - Important location info
        fontFamily: FONTS.bold,
        color: COLORS.textSecondary, // Important trip information - high priority
    },
    routeArrow: {
        fontSize: SIZES.body, // 14 - Route connector
        color: COLORS.textQuaternary, // Visual separator - supporting element
        marginHorizontal: 8,
        fontFamily: FONTS.regular,
    },
    destinationText: {
        fontSize: SIZES.subheading, // 16 - Important location info
        fontFamily: FONTS.bold,
        color: COLORS.textSecondary, // Important trip information - high priority
    },
    detailsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    transportContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f3f4f6',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    transportIcon: {
        fontSize: SIZES.subheading, // 16 - Icon needs to be visible and balanced
        marginRight: 6,
    },
    transportText: {
        fontSize: SIZES.caption, // 12 - Supporting label text
        color: COLORS.textTertiary, // Regular content - medium importance
        fontFamily: FONTS.semiBold,
    },
    purposeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    purposeDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    purposeText: {
        fontSize: SIZES.caption, // 12 - Supporting purpose labels
        color: COLORS.textQuaternary, // Supporting information - less important
        fontFamily: FONTS.medium,
    },
    dateSectionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 20,
        marginTop: 32, // Extra space from previous section
    },
    dateSectionText: {
        fontSize: SIZES.caption, // 16 - Date section headers
        fontFamily: FONTS.medium, // Reduced from bold to semiBold
        color: COLORS.textPrimary, // Important section headers
        marginRight: 12,
        minWidth: 'auto', // Let it size naturally to reduce spacing
    },
    dateSectionLine: {
        flex: 1,
        height: 1,
        backgroundColor: COLORS.textDisabled, // Subtle line color
        opacity: 0.3,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    loadingText: {
        fontSize: SIZES.body,
        fontFamily: FONTS.medium,
        color: COLORS.textTertiary,
        marginTop: 12,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
        paddingHorizontal: 20,
        paddingBottom: 100, // Account for bottom tab bar
    },
    errorText: {
        fontSize: SIZES.body,
        fontFamily: FONTS.medium,
        color: COLORS.error || '#ef4444',
        textAlign: 'center',
        marginBottom: 20,
    },
    retryButton: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    retryButtonText: {
        fontSize: SIZES.body,
        fontFamily: FONTS.semiBold,
        color: COLORS.white,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 80,
        paddingHorizontal: 40,
        paddingBottom: 100, // Account for bottom tab bar
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: SIZES.heading,
        fontFamily: FONTS.bold,
        color: COLORS.textPrimary,
        marginBottom: 8,
        textAlign: 'center',
    },
    emptySubtitle: {
        fontSize: SIZES.body,
        fontFamily: FONTS.regular,
        color: COLORS.textTertiary,
        textAlign: 'center',
        lineHeight: 22,
    },
});

export default TripLogsScreen;