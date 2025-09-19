import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS } from '../../../../constants';
import { UserTravelPreferences, TransportMode } from '../../../../types';

interface MonthlyCheckInProps {
    currentPreferences?: UserTravelPreferences;
    onComplete: (preferences: UserTravelPreferences) => void;
    onSkip: () => void;
}

const expenditureRanges = [
    { value: 'below-1k', label: 'Below ₹1,000', description: 'Minimal travel' },
    { value: '1k-3k', label: '₹1,000 - ₹3,000', description: 'Light commuting' },
    { value: '3k-5k', label: '₹3,000 - ₹5,000', description: 'Regular commuting' },
    { value: '5k-10k', label: '₹5,000 - ₹10,000', description: 'Heavy commuting' },
    { value: 'above-10k', label: 'Above ₹10,000', description: 'Extensive travel' },
];

const transportModes: {
    mode: TransportMode;
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
    description: string;
}[] = [
        { mode: 'bus', label: 'Bus', icon: 'bus-outline', color: '#3b82f6', description: 'Public buses' },
        { mode: 'train', label: 'Train', icon: 'train-outline', color: '#10b981', description: 'Railways' },
        { mode: 'metro', label: 'Metro', icon: 'subway-outline', color: '#f59e0b', description: 'Metro/Subway' },
        { mode: 'auto', label: 'Auto', icon: 'car-outline', color: '#ef4444', description: 'Auto rickshaw' },
        { mode: 'taxi', label: 'Taxi', icon: 'car-sport-outline', color: '#8b5cf6', description: 'Cab services' },
        { mode: 'car', label: 'Car', icon: 'car', color: '#06b6d4', description: 'Personal car' },
        { mode: 'bike', label: 'Bike', icon: 'bicycle-outline', color: '#84cc16', description: 'Two-wheeler' },
        { mode: 'walking', label: 'Walking', icon: 'walk-outline', color: '#64748b', description: 'On foot' },
    ];

const MonthlyCheckIn: React.FC<MonthlyCheckInProps> = ({
    currentPreferences,
    onComplete,
    onSkip
}) => {
    const [selectedExpenditure, setSelectedExpenditure] = React.useState(
        currentPreferences?.monthlyTravelExpenditure || null
    );
    const [selectedModes, setSelectedModes] = React.useState<TransportMode[]>(
        currentPreferences?.preferredTransportModes || []
    );
    const [hasChanges, setHasChanges] = React.useState(false);

    React.useEffect(() => {
        const expenditureChanged = selectedExpenditure !== currentPreferences?.monthlyTravelExpenditure;
        const modesChanged = JSON.stringify(selectedModes.sort()) !==
            JSON.stringify((currentPreferences?.preferredTransportModes || []).sort());
        setHasChanges(expenditureChanged || modesChanged);
    }, [selectedExpenditure, selectedModes, currentPreferences]);

    const handleModeToggle = (mode: TransportMode) => {
        setSelectedModes(prev => {
            if (prev.includes(mode)) {
                return prev.filter(m => m !== mode);
            } else {
                return [...prev, mode];
            }
        });
    };

    const handleComplete = () => {
        const preferences: UserTravelPreferences = {
            monthlyTravelExpenditure: selectedExpenditure || 'below-1k',
            preferredTransportModes: selectedModes,
            lastUpdated: new Date(),
        };
        onComplete(preferences);
    };

    const getRewardAmount = (): number => {
        if (!hasChanges) return 10; // Just for checking in
        return 25; // For updating preferences
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.closeButton} onPress={onSkip}>
                    <Ionicons name="close" size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <View style={styles.headerContent}>
                    <Text style={styles.headerTitle}>Monthly Check-in</Text>
                    <Text style={styles.headerSubtitle}>Quick update on your travel patterns</Text>
                </View>
                <View style={styles.rewardBadge}>
                    <Text style={styles.rewardText}>+{getRewardAmount()}</Text>
                </View>
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Welcome Message */}
                <View style={styles.welcomeContainer}>
                    <View style={styles.welcomeIcon}>
                        <Ionicons name="calendar-outline" size={32} color={COLORS.primary} />
                    </View>
                    <Text style={styles.welcomeTitle}>Thanks for using GetWay! 🎉</Text>
                    <Text style={styles.welcomeDescription}>
                        Help us serve you better by updating your travel preferences.
                        This quick check-in takes less than 2 minutes.
                    </Text>
                </View>

                {/* Monthly Expenditure */}
                <View style={styles.sectionContainer}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="wallet-outline" size={20} color="#f59e0b" />
                        <Text style={styles.sectionTitle}>Monthly Travel Expenditure</Text>
                    </View>
                    <Text style={styles.sectionDescription}>
                        How much do you typically spend on transportation each month?
                    </Text>

                    <View style={styles.optionsContainer}>
                        {expenditureRanges.map((range) => (
                            <TouchableOpacity
                                key={range.value}
                                style={[
                                    styles.expenditureOption,
                                    selectedExpenditure === range.value && styles.selectedExpenditure
                                ]}
                                onPress={() => setSelectedExpenditure(range.value as any)}
                            >
                                <View style={styles.expenditureContent}>
                                    <Text style={[
                                        styles.expenditureLabel,
                                        selectedExpenditure === range.value && styles.selectedExpenditureText
                                    ]}>
                                        {range.label}
                                    </Text>
                                    <Text style={[
                                        styles.expenditureDescription,
                                        selectedExpenditure === range.value && styles.selectedExpenditureDescription
                                    ]}>
                                        {range.description}
                                    </Text>
                                </View>
                                {selectedExpenditure === range.value && (
                                    <Ionicons name="checkmark-circle" size={20} color="#ffffff" />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Preferred Transport Modes */}
                <View style={styles.sectionContainer}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="options-outline" size={20} color="#10b981" />
                        <Text style={styles.sectionTitle}>Preferred Transport Modes</Text>
                    </View>
                    <Text style={styles.sectionDescription}>
                        Select all the transport modes you use regularly (you can choose multiple)
                    </Text>

                    <View style={styles.modesGrid}>
                        {transportModes.map((transport) => (
                            <TouchableOpacity
                                key={transport.mode}
                                style={[
                                    styles.modeOption,
                                    selectedModes.includes(transport.mode) && styles.selectedMode,
                                    { borderColor: transport.color + '30' }
                                ]}
                                onPress={() => handleModeToggle(transport.mode)}
                            >
                                <View style={[
                                    styles.modeIcon,
                                    { backgroundColor: transport.color + '15' },
                                    selectedModes.includes(transport.mode) && { backgroundColor: transport.color }
                                ]}>
                                    <Ionicons
                                        name={transport.icon}
                                        size={20}
                                        color={selectedModes.includes(transport.mode) ? '#ffffff' : transport.color}
                                    />
                                </View>
                                <Text style={[
                                    styles.modeLabel,
                                    selectedModes.includes(transport.mode) && styles.selectedModeText
                                ]}>
                                    {transport.label}
                                </Text>
                                <Text style={[
                                    styles.modeDescription,
                                    selectedModes.includes(transport.mode) && styles.selectedModeDescription
                                ]}>
                                    {transport.description}
                                </Text>
                                {selectedModes.includes(transport.mode) && (
                                    <View style={styles.checkmark}>
                                        <Ionicons name="checkmark" size={14} color={transport.color} />
                                    </View>
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Data Usage Note */}
                <View style={styles.noteContainer}>
                    <Ionicons name="shield-checkmark-outline" size={20} color={COLORS.textSecondary} />
                    <View style={styles.noteContent}>
                        <Text style={styles.noteTitle}>Your Privacy Matters</Text>
                        <Text style={styles.noteText}>
                            This information helps us provide better route suggestions and
                            relevant rewards. Your data is secure and never shared with third parties.
                        </Text>
                    </View>
                </View>
            </ScrollView>

            {/* Action Buttons */}
            <View style={styles.actionContainer}>
                <TouchableOpacity
                    style={styles.skipButton}
                    onPress={onSkip}
                >
                    <Text style={styles.skipButtonText}>Skip for now</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.completeButton,
                        (!selectedExpenditure || selectedModes.length === 0) && styles.disabledButton
                    ]}
                    onPress={handleComplete}
                    disabled={!selectedExpenditure || selectedModes.length === 0}
                >
                    <Text style={[
                        styles.completeButtonText,
                        (!selectedExpenditure || selectedModes.length === 0) && styles.disabledButtonText
                    ]}>
                        {hasChanges ? 'Update Preferences' : 'Confirm Preferences'}
                    </Text>
                    <Ionicons
                        name="checkmark"
                        size={16}
                        color={(!selectedExpenditure || selectedModes.length === 0) ? COLORS.textDisabled : '#ffffff'}
                    />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
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
        paddingVertical: 16,
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
        marginRight: 12,
    },
    headerContent: {
        flex: 1,
    },
    headerTitle: {
        fontSize: SIZES.heading,
        fontFamily: FONTS.bold,
        color: COLORS.textPrimary,
    },
    headerSubtitle: {
        fontSize: SIZES.body,
        fontFamily: FONTS.regular,
        color: COLORS.textSecondary,
    },
    rewardBadge: {
        backgroundColor: '#10b981',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    rewardText: {
        fontSize: SIZES.body,
        fontFamily: FONTS.bold,
        color: '#ffffff',
    },
    scrollView: {
        flex: 1,
    },
    welcomeContainer: {
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#ffffff',
        marginBottom: 1,
    },
    welcomeIcon: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: COLORS.primary + '15',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    welcomeTitle: {
        fontSize: SIZES.heading,
        fontFamily: FONTS.bold,
        color: COLORS.textPrimary,
        marginBottom: 8,
        textAlign: 'center',
    },
    welcomeDescription: {
        fontSize: SIZES.body,
        fontFamily: FONTS.regular,
        color: COLORS.textSecondary,
        textAlign: 'center',
        lineHeight: 20,
    },
    sectionContainer: {
        backgroundColor: '#ffffff',
        padding: 20,
        marginBottom: 1,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    sectionTitle: {
        fontSize: SIZES.subheading,
        fontFamily: FONTS.bold,
        color: COLORS.textPrimary,
    },
    sectionDescription: {
        fontSize: SIZES.body,
        fontFamily: FONTS.regular,
        color: COLORS.textSecondary,
        marginBottom: 16,
        lineHeight: 20,
    },
    optionsContainer: {
        gap: 8,
    },
    expenditureOption: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.1)',
    },
    selectedExpenditure: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    expenditureContent: {
        flex: 1,
    },
    expenditureLabel: {
        fontSize: SIZES.body,
        fontFamily: FONTS.semiBold,
        color: COLORS.textPrimary,
        marginBottom: 2,
    },
    selectedExpenditureText: {
        color: '#ffffff',
    },
    expenditureDescription: {
        fontSize: SIZES.caption,
        fontFamily: FONTS.regular,
        color: COLORS.textSecondary,
    },
    selectedExpenditureDescription: {
        color: 'rgba(255, 255, 255, 0.8)',
    },
    modesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    modeOption: {
        width: '48%',
        backgroundColor: '#f8f9fa',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: 'center',
        position: 'relative',
    },
    selectedMode: {
        backgroundColor: 'rgba(162, 142, 249, 0.1)',
        borderColor: COLORS.primary,
    },
    modeIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    modeLabel: {
        fontSize: SIZES.body,
        fontFamily: FONTS.semiBold,
        color: COLORS.textPrimary,
        marginBottom: 2,
        textAlign: 'center',
    },
    selectedModeText: {
        color: COLORS.primary,
    },
    modeDescription: {
        fontSize: SIZES.caption,
        fontFamily: FONTS.regular,
        color: COLORS.textSecondary,
        textAlign: 'center',
    },
    selectedModeDescription: {
        color: COLORS.textSecondary,
    },
    checkmark: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#ffffff',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    noteContainer: {
        flexDirection: 'row',
        backgroundColor: '#ffffff',
        padding: 20,
        marginBottom: 1,
        gap: 12,
    },
    noteContent: {
        flex: 1,
    },
    noteTitle: {
        fontSize: SIZES.body,
        fontFamily: FONTS.semiBold,
        color: COLORS.textPrimary,
        marginBottom: 4,
    },
    noteText: {
        fontSize: SIZES.body,
        fontFamily: FONTS.regular,
        color: COLORS.textSecondary,
        lineHeight: 18,
    },
    actionContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#ffffff',
        borderTopWidth: 1,
        borderTopColor: 'rgba(0, 0, 0, 0.05)',
        gap: 12,
    },
    skipButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    skipButtonText: {
        fontSize: SIZES.body,
        fontFamily: FONTS.semiBold,
        color: COLORS.textSecondary,
    },
    completeButton: {
        flex: 2,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.primary,
        paddingVertical: 14,
        borderRadius: 12,
        gap: 8,
    },
    disabledButton: {
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
    },
    completeButtonText: {
        fontSize: SIZES.body,
        fontFamily: FONTS.semiBold,
        color: '#ffffff',
    },
    disabledButtonText: {
        color: COLORS.textDisabled,
    },
});

export default MonthlyCheckIn;
