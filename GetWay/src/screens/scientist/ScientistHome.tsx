import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Animated,
    Dimensions,
    FlatList,
} from 'react-native';
import { COLORS, SIZES, FONTS } from '../../constants';

const { width: screenWidth } = Dimensions.get('window');
const CARD_WIDTH = screenWidth * 0.85;

interface AnalyticsCard {
    id: string;
    title: string;
    value: string;
    change: string;
    icon: string;
    color: string;
}

interface TrendData {
    id: string;
    title: string;
    description: string;
    icon: string;
    trend: 'up' | 'down' | 'stable';
    value: string;
}

interface ScientistHomeProps {
    user: any;
    onNavigateToDetails?: (screen: string) => void;
}

const ScientistHome: React.FC<ScientistHomeProps> = ({ user, onNavigateToDetails }) => {
    const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('week');
    const scrollX = useRef(new Animated.Value(0)).current;

    // Mock data for analytics cards
    const analyticsCards: AnalyticsCard[] = [
        {
            id: '1',
            title: 'Total Data Points',
            value: '24,847',
            change: '+18%',
            icon: '📊',
            color: COLORS.primary
        },
        {
            id: '2',
            title: 'Active Contributors',
            value: '3,284',
            change: '+12%',
            icon: '👥',
            color: COLORS.secondary
        },
        {
            id: '3',
            title: 'Route Patterns',
            value: '156',
            change: '+8%',
            icon: '🗺️',
            color: COLORS.accent
        },
        {
            id: '4',
            title: 'Data Quality',
            value: '94.2%',
            change: '+2%',
            icon: '✅',
            color: COLORS.success
        },
    ];

    const trendData: TrendData[] = [
        {
            id: '1',
            title: 'Peak Hour Analysis',
            description: 'Traffic peaks at 8-9 AM with 2,847 trips recorded',
            icon: '🕒',
            trend: 'up',
            value: '8-9 AM'
        },
        {
            id: '2',
            title: 'Popular Route',
            description: 'CBD to Residential Area A shows highest volume',
            icon: '🚌',
            trend: 'up',
            value: '18.5%'
        },
        {
            id: '3',
            title: 'Modal Share Leader',
            description: 'Public transit dominates with 42% share',
            icon: '🚊',
            trend: 'stable',
            value: '42%'
        },
        {
            id: '4',
            title: 'Data Coverage',
            description: 'Expanded to 12 new areas this week',
            icon: '📍',
            trend: 'up',
            value: '+12 areas'
        },
    ];

    const renderAnalyticsCard = ({ item }: { item: AnalyticsCard }) => (
        <View style={[styles.analyticsCard, { borderLeftColor: item.color }]}>
            <View style={styles.cardHeader}>
                <Text style={styles.cardIcon}>{item.icon}</Text>
                <View style={[styles.changeBadge, {
                    backgroundColor: item.change.includes('+') ? '#dcfce7' : '#fef2f2'
                }]}>
                    <Text style={[styles.cardChange, {
                        color: item.change.includes('+') ? COLORS.success : COLORS.error
                    }]}>
                        {item.change}
                    </Text>
                </View>
            </View>
            <Text style={styles.cardValue}>{item.value}</Text>
            <Text style={styles.cardTitle}>{item.title}</Text>
        </View>
    );

    const renderTrendItem = ({ item }: { item: TrendData }) => (
        <TouchableOpacity style={styles.trendCard}>
            <View style={styles.trendHeader}>
                <Text style={styles.trendIcon}>{item.icon}</Text>
                <View style={styles.trendInfo}>
                    <Text style={styles.trendTitle}>{item.title}</Text>
                    <Text style={styles.trendValue}>{item.value}</Text>
                </View>
                <View style={[styles.trendIndicator, {
                    backgroundColor: item.trend === 'up' ? COLORS.success :
                        item.trend === 'down' ? COLORS.error : COLORS.gray
                }]}>
                    <Text style={styles.trendArrow}>
                        {item.trend === 'up' ? '↗' : item.trend === 'down' ? '↘' : '→'}
                    </Text>
                </View>
            </View>
            <Text style={styles.trendDescription}>{item.description}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <Text style={styles.greeting}>Welcome back, {user?.name || 'Scientist'} 🔬</Text>
                    <Text style={styles.subtitle}>Research Dashboard & Analytics</Text>
                </View>
                <TouchableOpacity style={styles.notificationButton}>
                    <Text style={styles.notificationIcon}>🔔</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Period Filter */}
                <View style={styles.periodContainer}>
                    <Text style={styles.sectionTitle}>Analytics Overview</Text>
                    <View style={styles.periodButtons}>
                        {(['today', 'week', 'month'] as const).map((period) => (
                            <TouchableOpacity
                                key={period}
                                style={[
                                    styles.periodButton,
                                    selectedPeriod === period && styles.periodButtonActive
                                ]}
                                onPress={() => setSelectedPeriod(period)}
                            >
                                <Text style={[
                                    styles.periodText,
                                    selectedPeriod === period && styles.periodTextActive
                                ]}>
                                    {period.charAt(0).toUpperCase() + period.slice(1)}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Analytics Cards Carousel */}
                <View style={styles.carouselContainer}>
                    <FlatList
                        data={analyticsCards}
                        renderItem={renderAnalyticsCard}
                        keyExtractor={(item) => item.id}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        snapToInterval={CARD_WIDTH + SIZES.md}
                        decelerationRate="fast"
                        contentContainerStyle={styles.carouselContent}
                        onScroll={Animated.event(
                            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                            { useNativeDriver: false }
                        )}
                    />
                </View>

                {/* Quick Actions */}
                <View style={styles.quickActionsContainer}>
                    <Text style={styles.sectionTitle}>Quick Actions</Text>
                    <View style={styles.quickActions}>
                        <TouchableOpacity
                            style={styles.quickActionButton}
                            onPress={() => onNavigateToDetails?.('DataVisualization')}
                        >
                            <Text style={styles.quickActionIcon}>📊</Text>
                            <Text style={styles.quickActionText}>Interactive Charts</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.quickActionButton}
                            onPress={() => onNavigateToDetails?.('Reports')}
                        >
                            <Text style={styles.quickActionIcon}>📑</Text>
                            <Text style={styles.quickActionText}>Generate Reports</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.quickActionButton}>
                            <Text style={styles.quickActionIcon}>🎯</Text>
                            <Text style={styles.quickActionText}>ML Analysis</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.quickActionButton}>
                            <Text style={styles.quickActionIcon}>📤</Text>
                            <Text style={styles.quickActionText}>Export Data</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Recent Trends */}
                <View style={styles.trendsContainer}>
                    <Text style={styles.sectionTitle}>Recent Insights</Text>
                    <FlatList
                        data={trendData}
                        renderItem={renderTrendItem}
                        keyExtractor={(item) => item.id}
                        scrollEnabled={false}
                    />
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        paddingBottom: 100, // Space for bottom navigation
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingHorizontal: SIZES.xl,
        paddingTop: 60,
        paddingBottom: SIZES.lg,
        backgroundColor: COLORS.white,
    },
    headerContent: {
        flex: 1,
    },
    greeting: {
        fontSize: SIZES.heading,
        fontFamily: FONTS.bold,
        color: COLORS.textPrimary,
        marginBottom: SIZES.xs,
    },
    subtitle: {
        fontSize: SIZES.body,
        fontFamily: FONTS.regular,
        color: COLORS.textTertiary,
    },
    notificationButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: COLORS.lightGray,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: SIZES.xs,
    },
    notificationIcon: {
        fontSize: 20,
    },

    scrollContainer: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: SIZES.xl,
    },

    // Period Filter
    periodContainer: {
        paddingHorizontal: SIZES.xl,
        paddingVertical: SIZES.lg,
    },
    sectionTitle: {
        fontSize: SIZES.subheading,
        fontFamily: FONTS.semiBold,
        color: COLORS.textPrimary,
        marginBottom: SIZES.md,
    },
    periodButtons: {
        flexDirection: 'row',
        backgroundColor: COLORS.lightGray,
        borderRadius: 12,
        padding: 4,
    },
    periodButton: {
        flex: 1,
        paddingVertical: SIZES.sm,
        paddingHorizontal: SIZES.md,
        borderRadius: 8,
        alignItems: 'center',
    },
    periodButtonActive: {
        backgroundColor: COLORS.white,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    periodText: {
        fontSize: SIZES.caption,
        fontFamily: FONTS.medium,
        color: COLORS.textTertiary,
    },
    periodTextActive: {
        color: COLORS.textPrimary,
        fontFamily: FONTS.semiBold,
    },

    // Analytics Cards
    carouselContainer: {
        paddingBottom: SIZES.lg,
    },
    carouselContent: {
        paddingHorizontal: SIZES.xl,
    },
    analyticsCard: {
        backgroundColor: COLORS.white,
        padding: SIZES.lg,
        borderRadius: 16,
        marginRight: SIZES.md,
        width: CARD_WIDTH,
        borderLeftWidth: 4,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SIZES.sm,
    },
    cardIcon: {
        fontSize: 28,
    },
    changeBadge: {
        paddingHorizontal: SIZES.sm,
        paddingVertical: SIZES.xs,
        borderRadius: 12,
    },
    cardChange: {
        fontSize: SIZES.small,
        fontFamily: FONTS.semiBold,
    },
    cardValue: {
        fontSize: 32,
        fontFamily: FONTS.bold,
        color: COLORS.textPrimary,
        marginBottom: SIZES.xs,
    },
    cardTitle: {
        fontSize: SIZES.body,
        fontFamily: FONTS.regular,
        color: COLORS.textTertiary,
    },

    // Quick Actions
    quickActionsContainer: {
        paddingHorizontal: SIZES.xl,
        paddingBottom: SIZES.lg,
    },
    quickActions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    quickActionButton: {
        width: '48%',
        backgroundColor: COLORS.white,
        padding: SIZES.lg,
        borderRadius: 16,
        alignItems: 'center',
        marginBottom: SIZES.md,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    quickActionIcon: {
        fontSize: 32,
        marginBottom: SIZES.sm,
    },
    quickActionText: {
        fontSize: SIZES.caption,
        fontFamily: FONTS.medium,
        color: COLORS.textSecondary,
        textAlign: 'center',
    },

    // Trends
    trendsContainer: {
        paddingHorizontal: SIZES.xl,
    },
    trendCard: {
        backgroundColor: COLORS.white,
        padding: SIZES.lg,
        borderRadius: 16,
        marginBottom: SIZES.md,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    trendHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SIZES.sm,
    },
    trendIcon: {
        fontSize: 24,
        marginRight: SIZES.md,
    },
    trendInfo: {
        flex: 1,
    },
    trendTitle: {
        fontSize: SIZES.body,
        fontFamily: FONTS.semiBold,
        color: COLORS.textPrimary,
        marginBottom: SIZES.xs,
    },
    trendValue: {
        fontSize: SIZES.subheading,
        fontFamily: FONTS.bold,
        color: COLORS.primary,
    },
    trendIndicator: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    trendArrow: {
        fontSize: 16,
        color: COLORS.white,
        fontFamily: FONTS.bold,
    },
    trendDescription: {
        fontSize: SIZES.caption,
        fontFamily: FONTS.regular,
        color: COLORS.textTertiary,
        lineHeight: 18,
    },
});

export default ScientistHome;
