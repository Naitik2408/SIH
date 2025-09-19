import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Animated,
    Dimensions,
    Modal,
    FlatList,
} from 'react-native';
import { COLORS, SIZES, FONTS } from '../constants';
import { User, TravelData } from '../types';

const { width } = Dimensions.get('window');

interface AnalyticsCard {
    id: string;
    title: string;
    value: string;
    change: string;
    icon: string;
    color: string;
}

interface ODPair {
    origin: string;
    destination: string;
    volume: number;
    percentage: number;
}

interface ModalShareData {
    mode: string;
    percentage: number;
    trips: number;
    color: string;
}

interface ScientistDashboardProps {
    user: User;
    onLogout: () => void;
}

const ScientistDashboard: React.FC<ScientistDashboardProps> = ({ user, onLogout }) => {
    const [selectedTimeFilter, setSelectedTimeFilter] = useState<'day' | 'week' | 'month'>('week');
    const [showExportModal, setShowExportModal] = useState(false);
    const [selectedVisualization, setSelectedVisualization] = useState<'od' | 'modal' | 'temporal' | 'spatial'>('od');
    const scrollX = useRef(new Animated.Value(0)).current;

    // Mock data for analytics
    const analyticsCards: AnalyticsCard[] = [
        { id: '1', title: 'Total Trips', value: '12,847', change: '+15%', icon: '🚌', color: COLORS.primary },
        { id: '2', title: 'Active Users', value: '1,234', change: '+8%', icon: '👥', color: COLORS.secondary },
        { id: '3', title: 'Avg Trip Time', value: '23 min', change: '-3%', icon: '⏱️', color: COLORS.accent },
        { id: '4', title: 'CO₂ Saved', value: '2.1t', change: '+12%', icon: '🌱', color: COLORS.success },
    ];

    const odMatrix: ODPair[] = [
        { origin: 'CBD', destination: 'Residential Area A', volume: 2847, percentage: 18.5 },
        { origin: 'University', destination: 'CBD', volume: 1923, percentage: 12.3 },
        { origin: 'Airport', destination: 'CBD', volume: 1456, percentage: 9.4 },
        { origin: 'Industrial Zone', destination: 'Residential Area B', volume: 1234, percentage: 8.1 },
        { origin: 'Shopping Mall', destination: 'Residential Area A', volume: 1087, percentage: 7.1 },
    ];

    const modalShareData: ModalShareData[] = [
        { mode: 'Public Transit', percentage: 42, trips: 5397, color: COLORS.primary },
        { mode: 'Private Car', percentage: 28, trips: 3597, color: COLORS.secondary },
        { mode: 'Walking', percentage: 15, trips: 1927, color: COLORS.accent },
        { mode: 'Cycling', percentage: 10, trips: 1285, color: COLORS.success },
        { mode: 'Others', percentage: 5, trips: 641, color: COLORS.gray },
    ];

    const renderAnalyticsCard = ({ item }: { item: AnalyticsCard }) => (
        <View style={[styles.analyticsCard, { borderLeftColor: item.color }]}>
            <View style={styles.cardHeader}>
                <Text style={styles.cardIcon}>{item.icon}</Text>
                <Text style={[styles.cardChange, { color: item.change.includes('+') ? COLORS.success : COLORS.error }]}>
                    {item.change}
                </Text>
            </View>
            <Text style={styles.cardValue}>{item.value}</Text>
            <Text style={styles.cardTitle}>{item.title}</Text>
        </View>
    );

    const renderODPair = ({ item }: { item: ODPair }) => (
        <View style={styles.odPairCard}>
            <View style={styles.odPairHeader}>
                <Text style={styles.odOrigin}>{item.origin}</Text>
                <Text style={styles.odArrow}>→</Text>
                <Text style={styles.odDestination}>{item.destination}</Text>
            </View>
            <View style={styles.odPairStats}>
                <Text style={styles.odVolume}>{item.volume.toLocaleString()} trips</Text>
                <Text style={styles.odPercentage}>{item.percentage}%</Text>
            </View>
            <View style={[styles.odPairBar, { width: `${item.percentage * 5}%` }]} />
        </View>
    );

    const renderModalShare = ({ item }: { item: ModalShareData }) => (
        <View style={styles.modalCard}>
            <View style={[styles.modalIndicator, { backgroundColor: item.color }]} />
            <View style={styles.modalContent}>
                <Text style={styles.modalMode}>{item.mode}</Text>
                <Text style={styles.modalTrips}>{item.trips.toLocaleString()} trips</Text>
            </View>
            <Text style={styles.modalPercentage}>{item.percentage}%</Text>
        </View>
    );

    const renderVisualizationContent = () => {
        switch (selectedVisualization) {
            case 'od':
                return (
                    <View style={styles.visualizationContainer}>
                        <Text style={styles.visualizationTitle}>Origin-Destination Matrix</Text>
                        <FlatList
                            data={odMatrix}
                            renderItem={renderODPair}
                            keyExtractor={(item, index) => index.toString()}
                            showsVerticalScrollIndicator={false}
                        />
                    </View>
                );
            case 'modal':
                return (
                    <View style={styles.visualizationContainer}>
                        <Text style={styles.visualizationTitle}>Modal Share Analysis</Text>
                        <FlatList
                            data={modalShareData}
                            renderItem={renderModalShare}
                            keyExtractor={(item) => item.mode}
                            showsVerticalScrollIndicator={false}
                        />
                    </View>
                );
            case 'temporal':
                return (
                    <View style={styles.visualizationContainer}>
                        <Text style={styles.visualizationTitle}>Temporal Distribution</Text>
                        <View style={styles.temporalChart}>
                            <Text style={styles.chartTitle}>Peak Hours Analysis</Text>
                            <View style={styles.timeSlots}>
                                {['6-9', '9-12', '12-15', '15-18', '18-21', '21-24'].map((slot, index) => (
                                    <View key={slot} style={styles.timeSlot}>
                                        <View style={[styles.timeBar, { height: [60, 40, 35, 75, 85, 30][index] }]} />
                                        <Text style={styles.timeLabel}>{slot}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    </View>
                );
            case 'spatial':
                return (
                    <View style={styles.visualizationContainer}>
                        <Text style={styles.visualizationTitle}>Spatial Analysis</Text>
                        <View style={styles.spatialMap}>
                            <Text style={styles.mapPlaceholder}>🗺️ Interactive Map View</Text>
                            <Text style={styles.mapSubtext}>Heat map showing trip density</Text>
                        </View>
                    </View>
                );
            default:
                return null;
        }
    };

    return (
        <ScrollView
            style={styles.container}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
        >
            {/* Header Section */}
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <Text style={[styles.greeting, { fontFamily: FONTS.bold }]}>Welcome, {user.name} 🔬</Text>
                    <Text style={[styles.subtitle, { fontFamily: FONTS.regular }]}>Analyze travel patterns and insights</Text>
                </View>
                <TouchableOpacity
                    style={styles.exportButton}
                    onPress={() => setShowExportModal(true)}
                >
                    <Text style={styles.exportButtonText}>📊 Export</Text>
                </TouchableOpacity>
            </View>

            {/* Time Filter */}
            <View style={styles.filterContainer}>
                {(['day', 'week', 'month'] as const).map((filter) => (
                    <TouchableOpacity
                        key={filter}
                        style={[
                            styles.filterButton,
                            selectedTimeFilter === filter && styles.filterButtonActive
                        ]}
                        onPress={() => setSelectedTimeFilter(filter)}
                    >
                        <Text style={[
                            styles.filterText,
                            selectedTimeFilter === filter && styles.filterTextActive
                        ]}>
                            {filter.charAt(0).toUpperCase() + filter.slice(1)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Analytics Cards Carousel */}
            <View style={styles.carouselContainer}>
                <FlatList
                    data={analyticsCards}
                    renderItem={renderAnalyticsCard}
                    keyExtractor={(item) => item.id}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    snapToInterval={width * 0.8 + SIZES.md}
                    decelerationRate="fast"
                    contentContainerStyle={styles.carouselContent}
                    onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                        { useNativeDriver: false }
                    )}
                />
            </View>

            {/* Visualization Selector */}
            <View style={styles.visualizationSelector}>
                <Text style={[styles.sectionTitle, { fontFamily: FONTS.bold }]}>Data Visualization</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {[
                        { key: 'od', label: 'O-D Matrix', icon: '🔄' },
                        { key: 'modal', label: 'Modal Share', icon: '📈' },
                        { key: 'temporal', label: 'Time Analysis', icon: '⏰' },
                        { key: 'spatial', label: 'Spatial View', icon: '🗺️' },
                    ].map((viz) => (
                        <TouchableOpacity
                            key={viz.key}
                            style={[
                                styles.vizButton,
                                selectedVisualization === viz.key && styles.vizButtonActive
                            ]}
                            onPress={() => setSelectedVisualization(viz.key as any)}
                        >
                            <Text style={styles.vizIcon}>{viz.icon}</Text>
                            <Text style={[
                                styles.vizLabel,
                                selectedVisualization === viz.key && styles.vizLabelActive
                            ]}>
                                {viz.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Visualization Content */}
            {renderVisualizationContent()}

            {/* Advanced Analytics Section */}
            <View style={styles.advancedSection}>
                <Text style={[styles.sectionTitle, { fontFamily: FONTS.bold }]}>Advanced Analytics</Text>
                <View style={styles.advancedButtons}>
                    <TouchableOpacity style={styles.advancedButton}>
                        <Text style={styles.advancedIcon}>📊</Text>
                        <Text style={styles.advancedLabel}>Interactive Charts</Text>
                        <Text style={styles.advancedDescription}>Detailed visualization tools</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.advancedButton}>
                        <Text style={styles.advancedIcon}>📑</Text>
                        <Text style={styles.advancedLabel}>Report Generator</Text>
                        <Text style={styles.advancedDescription}>Create custom reports</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.advancedButtons}>
                    <TouchableOpacity style={styles.advancedButton}>
                        <Text style={styles.advancedIcon}>🎯</Text>
                        <Text style={styles.advancedLabel}>Predictive Analysis</Text>
                        <Text style={styles.advancedDescription}>ML-based predictions</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.advancedButton}>
                        <Text style={styles.advancedIcon}>🌍</Text>
                        <Text style={styles.advancedLabel}>Geo Analytics</Text>
                        <Text style={styles.advancedDescription}>Spatial data insights</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Logout Button */}
            <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
                <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>

            {/* Export Modal */}
            <Modal
                visible={showExportModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowExportModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.exportModal}>
                        <Text style={[styles.modalTitle, { fontFamily: FONTS.bold }]}>Export Data</Text>
                        <View style={styles.exportOptions}>
                            {[
                                { format: 'CSV', icon: '📄', description: 'Comma-separated values' },
                                { format: 'JSON', icon: '📋', description: 'JavaScript Object Notation' },
                                { format: 'PDF', icon: '📑', description: 'Portable Document Format' },
                                { format: 'Excel', icon: '📊', description: 'Microsoft Excel format' },
                            ].map((option) => (
                                <TouchableOpacity key={option.format} style={styles.exportOption}>
                                    <Text style={styles.exportIcon}>{option.icon}</Text>
                                    <View style={styles.exportDetails}>
                                        <Text style={styles.exportFormat}>{option.format}</Text>
                                        <Text style={styles.exportDescription}>{option.description}</Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <TouchableOpacity
                            style={styles.closeModal}
                            onPress={() => setShowExportModal(false)}
                        >
                            <Text style={styles.closeModalText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollContent: {
        paddingBottom: SIZES.xl,
    },
    header: {
        padding: SIZES.xl,
        backgroundColor: COLORS.accent,
        marginBottom: SIZES.lg,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    headerContent: {
        flex: 1,
    },
    greeting: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginBottom: SIZES.xs,
    },
    subtitle: {
        fontSize: SIZES.md,
        color: COLORS.textTertiary,
    },
    exportButton: {
        backgroundColor: COLORS.white,
        paddingHorizontal: SIZES.md,
        paddingVertical: SIZES.sm,
        borderRadius: 8,
        marginTop: SIZES.xs,
    },
    exportButtonText: {
        color: COLORS.primary,
        fontSize: SIZES.caption,
        fontWeight: '600',
    },

    // Filter Section
    filterContainer: {
        flexDirection: 'row',
        paddingHorizontal: SIZES.xl,
        marginBottom: SIZES.lg,
    },
    filterButton: {
        paddingHorizontal: SIZES.md,
        paddingVertical: SIZES.sm,
        marginRight: SIZES.sm,
        backgroundColor: COLORS.white,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.lightGray,
    },
    filterButtonActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    filterText: {
        color: COLORS.textTertiary,
        fontSize: SIZES.caption,
        fontWeight: '500',
    },
    filterTextActive: {
        color: COLORS.white,
    },

    // Analytics Cards Carousel
    carouselContainer: {
        marginBottom: SIZES.lg,
    },
    carouselContent: {
        paddingHorizontal: SIZES.xl,
    },
    analyticsCard: {
        backgroundColor: COLORS.white,
        padding: SIZES.lg,
        borderRadius: 16,
        marginRight: SIZES.md,
        width: width * 0.75,
        borderLeftWidth: 4,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SIZES.sm,
    },
    cardIcon: {
        fontSize: 24,
    },
    cardChange: {
        fontSize: SIZES.caption,
        fontWeight: '600',
    },
    cardValue: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginBottom: SIZES.xs,
    },
    cardTitle: {
        fontSize: SIZES.body,
        color: COLORS.textTertiary,
        fontWeight: '500',
    },

    // Visualization Section
    visualizationSelector: {
        paddingHorizontal: SIZES.xl,
        marginBottom: SIZES.lg,
    },
    sectionTitle: {
        fontSize: SIZES.heading,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginBottom: SIZES.md,
    },
    vizButton: {
        backgroundColor: COLORS.white,
        paddingHorizontal: SIZES.md,
        paddingVertical: SIZES.sm,
        borderRadius: 12,
        marginRight: SIZES.sm,
        alignItems: 'center',
        minWidth: 80,
        borderWidth: 1,
        borderColor: COLORS.lightGray,
    },
    vizButtonActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    vizIcon: {
        fontSize: 20,
        marginBottom: SIZES.xs,
    },
    vizLabel: {
        fontSize: SIZES.small,
        color: COLORS.textTertiary,
        textAlign: 'center',
    },
    vizLabelActive: {
        color: COLORS.white,
    },

    // Visualization Content
    visualizationContainer: {
        paddingHorizontal: SIZES.xl,
        marginBottom: SIZES.lg,
    },
    visualizationTitle: {
        fontSize: SIZES.subheading,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginBottom: SIZES.md,
    },

    // O-D Matrix Styles
    odPairCard: {
        backgroundColor: COLORS.white,
        padding: SIZES.lg,
        borderRadius: 12,
        marginBottom: SIZES.sm,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    odPairHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SIZES.sm,
    },
    odOrigin: {
        flex: 1,
        fontSize: SIZES.body,
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    odArrow: {
        fontSize: SIZES.body,
        color: COLORS.primary,
        marginHorizontal: SIZES.sm,
    },
    odDestination: {
        flex: 1,
        fontSize: SIZES.body,
        fontWeight: '600',
        color: COLORS.textPrimary,
        textAlign: 'right',
    },
    odPairStats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SIZES.sm,
    },
    odVolume: {
        fontSize: SIZES.caption,
        color: COLORS.textTertiary,
    },
    odPercentage: {
        fontSize: SIZES.caption,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    odPairBar: {
        height: 4,
        backgroundColor: COLORS.primary,
        borderRadius: 2,
    },

    // Modal Share Styles
    modalCard: {
        backgroundColor: COLORS.white,
        padding: SIZES.lg,
        borderRadius: 12,
        marginBottom: SIZES.sm,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    modalIndicator: {
        width: 4,
        height: 40,
        borderRadius: 2,
        marginRight: SIZES.md,
    },
    modalContent: {
        flex: 1,
    },
    modalMode: {
        fontSize: SIZES.body,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginBottom: SIZES.xs,
    },
    modalTrips: {
        fontSize: SIZES.caption,
        color: COLORS.textTertiary,
    },
    modalPercentage: {
        fontSize: SIZES.subheading,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
    },

    // Temporal Chart Styles
    temporalChart: {
        backgroundColor: COLORS.white,
        padding: SIZES.lg,
        borderRadius: 12,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    chartTitle: {
        fontSize: SIZES.body,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginBottom: SIZES.lg,
        textAlign: 'center',
    },
    timeSlots: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        height: 120,
    },
    timeSlot: {
        alignItems: 'center',
        flex: 1,
    },
    timeBar: {
        backgroundColor: COLORS.primary,
        width: 20,
        borderRadius: 2,
        marginBottom: SIZES.sm,
    },
    timeLabel: {
        fontSize: SIZES.small,
        color: COLORS.textTertiary,
        textAlign: 'center',
    },

    // Spatial Map Styles
    spatialMap: {
        backgroundColor: COLORS.white,
        padding: SIZES.xl * 2,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        height: 200,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    mapPlaceholder: {
        fontSize: 48,
        marginBottom: SIZES.sm,
    },
    mapSubtext: {
        fontSize: SIZES.caption,
        color: COLORS.textTertiary,
        textAlign: 'center',
    },

    // Advanced Analytics Section
    advancedSection: {
        paddingHorizontal: SIZES.xl,
        marginBottom: SIZES.lg,
    },
    advancedButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: SIZES.md,
    },
    advancedButton: {
        backgroundColor: COLORS.white,
        padding: SIZES.lg,
        borderRadius: 16,
        alignItems: 'center',
        flex: 1,
        marginHorizontal: SIZES.xs,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    advancedIcon: {
        fontSize: 32,
        marginBottom: SIZES.sm,
    },
    advancedLabel: {
        fontSize: SIZES.body,
        fontFamily: FONTS.semiBold,
        color: COLORS.textPrimary,
        marginBottom: SIZES.xs,
        textAlign: 'center',
    },
    advancedDescription: {
        fontSize: SIZES.caption,
        color: COLORS.textTertiary,
        textAlign: 'center',
    },

    // Export Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    exportModal: {
        backgroundColor: COLORS.white,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: SIZES.xl,
        maxHeight: '70%',
    },
    modalTitle: {
        fontSize: SIZES.subheading,
        color: COLORS.textPrimary,
        textAlign: 'center',
        marginBottom: SIZES.lg,
    },
    exportOptions: {
        marginBottom: SIZES.lg,
    },
    exportOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SIZES.lg,
        backgroundColor: COLORS.lightGray,
        borderRadius: 12,
        marginBottom: SIZES.sm,
    },
    exportIcon: {
        fontSize: 24,
        marginRight: SIZES.md,
    },
    exportDetails: {
        flex: 1,
    },
    exportFormat: {
        fontSize: SIZES.body,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginBottom: SIZES.xs,
    },
    exportDescription: {
        fontSize: SIZES.caption,
        color: COLORS.textTertiary,
    },
    closeModal: {
        backgroundColor: COLORS.primary,
        padding: SIZES.lg,
        borderRadius: 12,
        alignItems: 'center',
    },
    closeModalText: {
        color: COLORS.white,
        fontSize: SIZES.body,
        fontWeight: '600',
    },

    // Logout Button
    logoutButton: {
        margin: SIZES.xl,
        paddingVertical: SIZES.md,
        alignItems: 'center',
    },
    logoutText: {
        color: COLORS.error,
        fontSize: SIZES.md,
        fontWeight: '600',
    },
});

export default ScientistDashboard;
