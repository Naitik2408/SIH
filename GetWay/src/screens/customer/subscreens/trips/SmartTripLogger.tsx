import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert,
    Vibration,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS } from '../../../../constants';
import { TravelData, TransportMode, TripPurpose, Location, TripSuggestion } from '../../../../types';

interface SmartTripLoggerProps {
    userId: string;
    onTripComplete: (tripData: TravelData) => void;
    onCancel: () => void;
    suggestions?: TripSuggestion[];
}

const transportModes: { mode: TransportMode; label: string; icon: keyof typeof Ionicons.glyphMap; color: string }[] = [
    { mode: 'bus', label: 'Bus', icon: 'bus-outline', color: '#3b82f6' },
    { mode: 'train', label: 'Train', icon: 'train-outline', color: '#10b981' },
    { mode: 'metro', label: 'Metro', icon: 'subway-outline', color: '#f59e0b' },
    { mode: 'auto', label: 'Auto', icon: 'car-outline', color: '#ef4444' },
    { mode: 'taxi', label: 'Taxi', icon: 'car-sport-outline', color: '#8b5cf6' },
    { mode: 'car', label: 'Car', icon: 'car', color: '#06b6d4' },
    { mode: 'bike', label: 'Bike', icon: 'bicycle-outline', color: '#84cc16' },
    { mode: 'walking', label: 'Walking', icon: 'walk-outline', color: '#64748b' },
];

const tripPurposes: { purpose: TripPurpose; label: string; icon: keyof typeof Ionicons.glyphMap; color: string }[] = [
    { purpose: 'work', label: 'Work', icon: 'briefcase-outline', color: '#3b82f6' },
    { purpose: 'education', label: 'Education', icon: 'school-outline', color: '#10b981' },
    { purpose: 'shopping', label: 'Shopping', icon: 'basket-outline', color: '#f59e0b' },
    { purpose: 'healthcare', label: 'Healthcare', icon: 'medical-outline', color: '#ef4444' },
    { purpose: 'leisure', label: 'Leisure', icon: 'cafe-outline', color: '#8b5cf6' },
    { purpose: 'social', label: 'Social', icon: 'people-outline', color: '#06b6d4' },
    { purpose: 'personal', label: 'Personal', icon: 'person-outline', color: '#84cc16' },
    { purpose: 'other', label: 'Other', icon: 'help-outline', color: '#64748b' },
];

const SmartTripLogger: React.FC<SmartTripLoggerProps> = ({
    userId,
    onTripComplete,
    onCancel,
    suggestions = []
}) => {
    const [tripState, setTripState] = React.useState<'pre-trip' | 'active' | 'post-trip'>('pre-trip');
    const [startTime, setStartTime] = React.useState<Date | null>(null);
    const [endTime, setEndTime] = React.useState<Date | null>(null);
    const [elapsedTime, setElapsedTime] = React.useState(0);

    // Trip data
    const [selectedMode, setSelectedMode] = React.useState<TransportMode | null>(null);
    const [selectedPurpose, setSelectedPurpose] = React.useState<TripPurpose | null>(null);
    const [currentLocation, setCurrentLocation] = React.useState<Location | null>(null);
    const [startLocation, setStartLocation] = React.useState<Location | null>(null);
    const [endLocation, setEndLocation] = React.useState<Location | null>(null);

    // Smart suggestions
    const [usingSuggestion, setUsingSuggestion] = React.useState<TripSuggestion | null>(null);
    const [showSuggestions, setShowSuggestions] = React.useState(true);

    // Timer
    const timerRef = React.useRef<NodeJS.Timeout | null>(null);

    React.useEffect(() => {
        // Simulate GPS location detection
        const mockLocation: Location = {
            latitude: 28.6139,
            longitude: 77.2090,
            address: 'Connaught Place, New Delhi',
            placeName: 'Central Delhi'
        };
        setCurrentLocation(mockLocation);

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, []);

    React.useEffect(() => {
        if (tripState === 'active' && startTime) {
            timerRef.current = setInterval(() => {
                setElapsedTime(Math.floor((Date.now() - startTime.getTime()) / 1000));
            }, 1000);
        } else {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        }
    }, [tripState, startTime]);

    const formatTime = (seconds: number): string => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleUseSuggestion = (suggestion: TripSuggestion) => {
        setUsingSuggestion(suggestion);
        setSelectedMode(suggestion.suggestedMode);
        setSelectedPurpose(suggestion.suggestedPurpose);
        setStartLocation(suggestion.suggestedOrigin);
        setEndLocation(suggestion.suggestedDestination);
        setShowSuggestions(false);

        // Vibration feedback
        Vibration.vibrate(50);
    };

    const handleStartTrip = () => {
        if (!selectedMode || !selectedPurpose) {
            Alert.alert('Missing Information', 'Please select transport mode and trip purpose before starting.');
            return;
        }

        const now = new Date();
        setStartTime(now);
        setStartLocation(currentLocation);
        setTripState('active');

        // Vibration feedback
        Vibration.vibrate(100);
    };

    const handleEndTrip = () => {
        if (!startTime) return;

        const now = new Date();
        setEndTime(now);
        setEndLocation(currentLocation); // In real app, this would be actual GPS location
        setTripState('post-trip');

        // Vibration feedback
        Vibration.vibrate([100, 50, 100]);
    };

    const handleCompleteTrip = () => {
        if (!startTime || !endTime || !startLocation || !endLocation || !selectedMode || !selectedPurpose) {
            Alert.alert('Error', 'Missing trip information. Please try again.');
            return;
        }

        const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000 / 60); // minutes
        const distance = 5.2; // Mock distance - in real app, calculate from GPS

        const tripData: TravelData = {
            id: `trip_${Date.now()}`,
            userId,
            origin: startLocation,
            destination: endLocation,
            distance,
            startTime,
            endTime,
            duration,
            transportMode: selectedMode,
            purpose: selectedPurpose,
            isRecurringTrip: usingSuggestion ? true : false,
            recurringTripId: usingSuggestion?.id,
            govCoinsEarned: Math.floor(distance * 2) + (duration > 30 ? 5 : 10), // Longer trips get bonus
            dataSource: usingSuggestion ? 'smart-suggestion' : 'manual',
            accuracy: 'high',
            createdAt: new Date(),
        };

        onTripComplete(tripData);
    };

    const renderSuggestions = () => {
        if (!showSuggestions || suggestions.length === 0) return null;

        return (
            <View style={styles.suggestionsContainer}>
                <Text style={styles.suggestionsTitle}>🎯 Smart Suggestions</Text>
                <Text style={styles.suggestionsSubtitle}>Based on your travel patterns</Text>

                {suggestions.slice(0, 2).map((suggestion) => (
                    <TouchableOpacity
                        key={suggestion.id}
                        style={styles.suggestionCard}
                        onPress={() => handleUseSuggestion(suggestion)}
                    >
                        <View style={styles.suggestionHeader}>
                            <View style={styles.suggestionRoute}>
                                <Text style={styles.suggestionLocation} numberOfLines={1}>
                                    {suggestion.suggestedOrigin.placeName || 'Current Location'}
                                </Text>
                                <Ionicons name="arrow-forward" size={16} color={COLORS.textSecondary} />
                                <Text style={styles.suggestionLocation} numberOfLines={1}>
                                    {suggestion.suggestedDestination.placeName}
                                </Text>
                            </View>
                            <View style={styles.confidenceBadge}>
                                <Text style={styles.confidenceText}>
                                    {Math.round(suggestion.confidence * 100)}%
                                </Text>
                            </View>
                        </View>

                        <View style={styles.suggestionDetails}>
                            <View style={styles.suggestionMeta}>
                                <Ionicons
                                    name={transportModes.find(m => m.mode === suggestion.suggestedMode)?.icon || 'help-outline'}
                                    size={14}
                                    color={COLORS.textTertiary}
                                />
                                <Text style={styles.suggestionMetaText}>
                                    {transportModes.find(m => m.mode === suggestion.suggestedMode)?.label}
                                </Text>
                            </View>
                            <View style={styles.suggestionMeta}>
                                <Ionicons
                                    name={tripPurposes.find(p => p.purpose === suggestion.suggestedPurpose)?.icon || 'help-outline'}
                                    size={14}
                                    color={COLORS.textTertiary}
                                />
                                <Text style={styles.suggestionMetaText}>
                                    {tripPurposes.find(p => p.purpose === suggestion.suggestedPurpose)?.label}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.useSuggestionButton}>
                            <Text style={styles.useSuggestionText}>Tap to use</Text>
                            <Ionicons name="checkmark-circle" size={16} color={COLORS.primary} />
                        </View>
                    </TouchableOpacity>
                ))}

                <TouchableOpacity
                    style={styles.manualButton}
                    onPress={() => setShowSuggestions(false)}
                >
                    <Text style={styles.manualButtonText}>Enter details manually</Text>
                </TouchableOpacity>
            </View>
        );
    };

    const renderTripControls = () => {
        if (tripState === 'active') {
            return (
                <View style={styles.activeTrip}>
                    <View style={styles.activeTripHeader}>
                        <View style={styles.statusIndicator}>
                            <View style={styles.pulseDot} />
                            <Text style={styles.statusText}>Trip in progress</Text>
                        </View>
                        <Text style={styles.elapsedTime}>{formatTime(elapsedTime)}</Text>
                    </View>

                    <View style={styles.tripInfo}>
                        <Text style={styles.tripInfoText}>
                            {transportModes.find(m => m.mode === selectedMode)?.label} • {tripPurposes.find(p => p.purpose === selectedPurpose)?.label}
                        </Text>
                    </View>

                    <TouchableOpacity
                        style={styles.endTripButton}
                        onPress={handleEndTrip}
                    >
                        <Ionicons name="stop-circle" size={24} color="#ffffff" />
                        <Text style={styles.endTripButtonText}>End Trip</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        if (tripState === 'post-trip') {
            const duration = endTime && startTime ? Math.floor((endTime.getTime() - startTime.getTime()) / 1000 / 60) : 0;
            const coins = Math.floor(5.2 * 2) + (duration > 30 ? 5 : 10);

            return (
                <View style={styles.tripSummary}>
                    <View style={styles.summaryHeader}>
                        <Ionicons name="checkmark-circle" size={32} color="#10b981" />
                        <Text style={styles.summaryTitle}>Trip Completed!</Text>
                    </View>

                    <View style={styles.summaryStats}>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{duration} min</Text>
                            <Text style={styles.statLabel}>Duration</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>5.2 km</Text>
                            <Text style={styles.statLabel}>Distance</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>+{coins}</Text>
                            <Text style={styles.statLabel}>GovCoins</Text>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={styles.completeButton}
                        onPress={handleCompleteTrip}
                    >
                        <Text style={styles.completeButtonText}>Save Trip</Text>
                        <Ionicons name="save-outline" size={18} color="#ffffff" />
                    </TouchableOpacity>
                </View>
            );
        }

        return null;
    };

    const renderModeSelection = () => {
        if (tripState !== 'pre-trip' || showSuggestions) return null;

        return (
            <View style={styles.selectionContainer}>
                <Text style={styles.selectionTitle}>🚌 Transport Mode</Text>
                <View style={styles.optionsGrid}>
                    {transportModes.map((transport) => (
                        <TouchableOpacity
                            key={transport.mode}
                            style={[
                                styles.optionCard,
                                selectedMode === transport.mode && styles.selectedCard,
                                { borderColor: transport.color + '20' }
                            ]}
                            onPress={() => setSelectedMode(transport.mode)}
                        >
                            <View style={[styles.optionIcon, { backgroundColor: transport.color + '15' }]}>
                                <Ionicons name={transport.icon} size={20} color={transport.color} />
                            </View>
                            <Text style={[
                                styles.optionLabel,
                                selectedMode === transport.mode && styles.selectedLabel
                            ]}>
                                {transport.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        );
    };

    const renderPurposeSelection = () => {
        if (tripState !== 'pre-trip' || showSuggestions) return null;

        return (
            <View style={styles.selectionContainer}>
                <Text style={styles.selectionTitle}>🎯 Trip Purpose</Text>
                <View style={styles.optionsGrid}>
                    {tripPurposes.map((purpose) => (
                        <TouchableOpacity
                            key={purpose.purpose}
                            style={[
                                styles.optionCard,
                                selectedPurpose === purpose.purpose && styles.selectedCard,
                                { borderColor: purpose.color + '20' }
                            ]}
                            onPress={() => setSelectedPurpose(purpose.purpose)}
                        >
                            <View style={[styles.optionIcon, { backgroundColor: purpose.color + '15' }]}>
                                <Ionicons name={purpose.icon} size={20} color={purpose.color} />
                            </View>
                            <Text style={[
                                styles.optionLabel,
                                selectedPurpose === purpose.purpose && styles.selectedLabel
                            ]}>
                                {purpose.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        );
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.closeButton} onPress={onCancel}>
                    <Ionicons name="close" size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Log Your Trip</Text>
                <View style={styles.placeholder} />
            </View>

            {/* Smart Suggestions */}
            {renderSuggestions()}

            {/* Trip Controls */}
            {renderTripControls()}

            {/* Mode Selection */}
            {renderModeSelection()}

            {/* Purpose Selection */}
            {renderPurposeSelection()}

            {/* Start Trip Button */}
            {tripState === 'pre-trip' && !showSuggestions && selectedMode && selectedPurpose && (
                <View style={styles.startButtonContainer}>
                    <TouchableOpacity
                        style={styles.startButton}
                        onPress={handleStartTrip}
                    >
                        <Ionicons name="play-circle" size={24} color="#ffffff" />
                        <Text style={styles.startButtonText}>Start Trip</Text>
                    </TouchableOpacity>
                </View>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
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
    headerTitle: {
        flex: 1,
        fontSize: SIZES.heading,
        fontFamily: FONTS.bold,
        color: COLORS.textPrimary,
        textAlign: 'center',
    },
    placeholder: {
        width: 40,
    },
    suggestionsContainer: {
        padding: 20,
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0, 0, 0, 0.05)',
    },
    suggestionsTitle: {
        fontSize: SIZES.subheading,
        fontFamily: FONTS.bold,
        color: COLORS.textPrimary,
        marginBottom: 4,
    },
    suggestionsSubtitle: {
        fontSize: SIZES.body,
        fontFamily: FONTS.regular,
        color: COLORS.textSecondary,
        marginBottom: 16,
    },
    suggestionCard: {
        backgroundColor: '#f8f9fa',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(162, 142, 249, 0.2)',
    },
    suggestionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    suggestionRoute: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 8,
    },
    suggestionLocation: {
        fontSize: SIZES.body,
        fontFamily: FONTS.semiBold,
        color: COLORS.textPrimary,
        flex: 1,
    },
    confidenceBadge: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    confidenceText: {
        fontSize: SIZES.caption,
        fontFamily: FONTS.bold,
        color: '#ffffff',
    },
    suggestionDetails: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 8,
    },
    suggestionMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    suggestionMetaText: {
        fontSize: SIZES.caption,
        fontFamily: FONTS.medium,
        color: COLORS.textTertiary,
    },
    useSuggestionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 8,
    },
    useSuggestionText: {
        fontSize: SIZES.body,
        fontFamily: FONTS.semiBold,
        color: COLORS.primary,
    },
    manualButton: {
        alignItems: 'center',
        paddingVertical: 12,
    },
    manualButtonText: {
        fontSize: SIZES.body,
        fontFamily: FONTS.medium,
        color: COLORS.textSecondary,
        textDecorationLine: 'underline',
    },
    selectionContainer: {
        padding: 20,
        backgroundColor: '#ffffff',
        marginBottom: 1,
    },
    selectionTitle: {
        fontSize: SIZES.subheading,
        fontFamily: FONTS.bold,
        color: COLORS.textPrimary,
        marginBottom: 16,
    },
    optionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    optionCard: {
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        minWidth: 80,
        flex: 1,
        maxWidth: '48%',
    },
    selectedCard: {
        backgroundColor: COLORS.primary + '10',
        borderColor: COLORS.primary,
    },
    optionIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 6,
    },
    optionLabel: {
        fontSize: SIZES.caption,
        fontFamily: FONTS.medium,
        color: COLORS.textSecondary,
        textAlign: 'center',
    },
    selectedLabel: {
        color: COLORS.primary,
        fontFamily: FONTS.semiBold,
    },
    startButtonContainer: {
        padding: 20,
    },
    startButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.primary,
        paddingVertical: 16,
        borderRadius: 12,
        gap: 8,
    },
    startButtonText: {
        fontSize: SIZES.subheading,
        fontFamily: FONTS.bold,
        color: '#ffffff',
    },
    activeTrip: {
        backgroundColor: '#ffffff',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0, 0, 0, 0.05)',
    },
    activeTripHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    statusIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    pulseDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#10b981',
    },
    statusText: {
        fontSize: SIZES.body,
        fontFamily: FONTS.semiBold,
        color: '#10b981',
    },
    elapsedTime: {
        fontSize: SIZES.heading,
        fontFamily: FONTS.bold,
        color: COLORS.textPrimary,
    },
    tripInfo: {
        marginBottom: 20,
    },
    tripInfoText: {
        fontSize: SIZES.body,
        fontFamily: FONTS.regular,
        color: COLORS.textSecondary,
    },
    endTripButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ef4444',
        paddingVertical: 16,
        borderRadius: 12,
        gap: 8,
    },
    endTripButtonText: {
        fontSize: SIZES.subheading,
        fontFamily: FONTS.bold,
        color: '#ffffff',
    },
    tripSummary: {
        backgroundColor: '#ffffff',
        padding: 20,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0, 0, 0, 0.05)',
    },
    summaryHeader: {
        alignItems: 'center',
        marginBottom: 20,
    },
    summaryTitle: {
        fontSize: SIZES.heading,
        fontFamily: FONTS.bold,
        color: COLORS.textPrimary,
        marginTop: 8,
    },
    summaryStats: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginBottom: 24,
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: SIZES.heading,
        fontFamily: FONTS.bold,
        color: COLORS.primary,
    },
    statLabel: {
        fontSize: SIZES.body,
        fontFamily: FONTS.regular,
        color: COLORS.textSecondary,
        marginTop: 4,
    },
    completeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#10b981',
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 12,
        gap: 8,
    },
    completeButtonText: {
        fontSize: SIZES.subheading,
        fontFamily: FONTS.bold,
        color: '#ffffff',
    },
});

export default SmartTripLogger;
