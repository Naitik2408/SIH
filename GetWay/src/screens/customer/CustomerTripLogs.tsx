import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { COLORS, SIZES, FONTS } from '../../constants';

interface TripItem {
    id: string;
    startTime: string;
    endTime: string;
    origin: string;
    destination: string;
    transport: 'bus' | 'train' | 'auto' | 'walk' | 'car';
    purpose: 'work' | 'study' | 'shopping' | 'health' | 'leisure';
    status: 'completed' | 'upcoming' | 'in-progress';
    date: string; // Date in YYYY-MM-DD format
}

const mockTripData: TripItem[] = [
    // Today's trips
    { id: '1', startTime: '8:30 AM', endTime: '9:15 AM', origin: 'Home', destination: 'Office', transport: 'bus', purpose: 'work', status: 'completed', date: new Date().toISOString().split('T')[0] },
    { id: '2', startTime: '9:30 AM', endTime: '10:00 AM', origin: 'Office', destination: 'Client Meeting', transport: 'auto', purpose: 'work', status: 'completed', date: new Date().toISOString().split('T')[0] },
    { id: '3', startTime: '12:00 PM', endTime: '12:45 PM', origin: 'Office', destination: 'Restaurant', transport: 'walk', purpose: 'leisure', status: 'in-progress', date: new Date().toISOString().split('T')[0] },
    { id: '4', startTime: '2:15 PM', endTime: '3:00 PM', origin: 'Restaurant', destination: 'Shopping Mall', transport: 'auto', purpose: 'shopping', status: 'upcoming', date: new Date().toISOString().split('T')[0] },

    // Yesterday's trips
    { id: '5', startTime: '4:30 PM', endTime: '5:15 PM', origin: 'Shopping Mall', destination: 'Gym', transport: 'bus', purpose: 'health', status: 'completed', date: new Date(Date.now() - 86400000).toISOString().split('T')[0] },
    { id: '6', startTime: '6:00 PM', endTime: '6:45 PM', origin: 'Gym', destination: 'Home', transport: 'train', purpose: 'leisure', status: 'completed', date: new Date(Date.now() - 86400000).toISOString().split('T')[0] },

    // Day before yesterday
    { id: '7', startTime: '8:00 PM', endTime: '8:30 PM', origin: 'Home', destination: 'Friends Place', transport: 'car', purpose: 'leisure', status: 'completed', date: new Date(Date.now() - 172800000).toISOString().split('T')[0] },
    { id: '8', startTime: '10:00 AM', endTime: '10:45 AM', origin: 'Home', destination: 'Market', transport: 'walk', purpose: 'shopping', status: 'completed', date: new Date(Date.now() - 172800000).toISOString().split('T')[0] },
];

const TripLogsScreen: React.FC = () => {

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
            <ScrollView style={styles.scheduleContainer} showsVerticalScrollIndicator={false}>
                <View style={styles.scheduleList}>
                    {groupTripsByDate(mockTripData).map(({ date, trips }, index) => (
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
                            {trips.map(renderTripItem)}
                        </View>
                    ))}
                </View>
            </ScrollView>


        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
        paddingBottom: 20, // Minimal padding - content will be visible behind transparent navbar
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
        paddingBottom: 20,
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
});

export default TripLogsScreen;