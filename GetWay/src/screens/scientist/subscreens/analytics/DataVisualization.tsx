import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { COLORS, SIZES, FONTS } from '../../../../constants';

const { width } = Dimensions.get('window');

interface DataVisualizationProps {
    navigation: any;
}

interface ChartData {
    label: string;
    value: number;
    color: string;
}

const DataVisualization: React.FC<DataVisualizationProps> = ({ navigation }) => {
    const [selectedChart, setSelectedChart] = useState<'bar' | 'pie' | 'line'>('bar');

    // Mock data for different chart types
    const transportModeData: ChartData[] = [
        { label: 'Bus', value: 42, color: COLORS.primary },
        { label: 'Metro', value: 28, color: COLORS.secondary },
        { label: 'Car', value: 18, color: COLORS.accent },
        { label: 'Walk', value: 8, color: COLORS.success },
        { label: 'Bike', value: 4, color: COLORS.error },
    ];

    const hourlyTrafficData = [
        { hour: '6', trips: 120 },
        { hour: '7', trips: 280 },
        { hour: '8', trips: 450 },
        { hour: '9', trips: 320 },
        { hour: '10', trips: 180 },
        { hour: '11', trips: 150 },
        { hour: '12', trips: 200 },
        { hour: '13', trips: 180 },
        { hour: '14', trips: 160 },
        { hour: '15', trips: 220 },
        { hour: '16', trips: 280 },
        { hour: '17', trips: 380 },
        { hour: '18', trips: 420 },
        { hour: '19', trips: 350 },
        { hour: '20', trips: 250 },
        { hour: '21', trips: 180 },
    ];

    const maxTrips = Math.max(...hourlyTrafficData.map(d => d.trips));

    const renderPieChart = () => (
        <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Transport Mode Distribution</Text>
            <View style={styles.pieChartContainer}>
                <View style={styles.pieChart}>
                    <Text style={styles.pieChartCenter}>100%</Text>
                </View>
                <View style={styles.pieChartLegend}>
                    {transportModeData.map((item, index) => (
                        <View key={index} style={styles.legendItem}>
                            <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                            <Text style={styles.legendLabel}>{item.label}</Text>
                            <Text style={styles.legendValue}>{item.value}%</Text>
                        </View>
                    ))}
                </View>
            </View>
        </View>
    );

    const renderBarChart = () => (
        <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Hourly Traffic Distribution</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.barChart}>
                    {hourlyTrafficData.map((item, index) => (
                        <View key={index} style={styles.barContainer}>
                            <View
                                style={[
                                    styles.bar,
                                    {
                                        height: (item.trips / maxTrips) * 120,
                                        backgroundColor: item.trips > 300 ? COLORS.error :
                                            item.trips > 200 ? COLORS.accent :
                                                COLORS.primary
                                    }
                                ]}
                            />
                            <Text style={styles.barLabel}>{item.hour}:00</Text>
                            <Text style={styles.barValue}>{item.trips}</Text>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </View>
    );

    const renderLineChart = () => (
        <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Weekly Trend Analysis</Text>
            <View style={styles.lineChartContainer}>
                <Text style={styles.lineChartPlaceholder}>📈</Text>
                <Text style={styles.lineChartText}>Interactive line chart showing</Text>
                <Text style={styles.lineChartText}>weekly travel patterns</Text>
                <View style={styles.trendStats}>
                    <View style={styles.trendStat}>
                        <Text style={styles.trendLabel}>Growth</Text>
                        <Text style={[styles.trendValue, { color: COLORS.success }]}>+12%</Text>
                    </View>
                    <View style={styles.trendStat}>
                        <Text style={styles.trendLabel}>Peak Day</Text>
                        <Text style={styles.trendValue}>Monday</Text>
                    </View>
                </View>
            </View>
        </View>
    );

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.backButtonText}>← Back</Text>
                </TouchableOpacity>
                <Text style={[styles.title, { fontFamily: FONTS.bold }]}>Data Visualization</Text>
            </View>

            {/* Chart Type Selector */}
            <View style={styles.chartSelector}>
                {[
                    { key: 'bar', label: 'Bar Chart', icon: '📊' },
                    { key: 'pie', label: 'Pie Chart', icon: '🥧' },
                    { key: 'line', label: 'Line Chart', icon: '📈' },
                ].map((chart) => (
                    <TouchableOpacity
                        key={chart.key}
                        style={[
                            styles.chartButton,
                            selectedChart === chart.key && styles.chartButtonActive
                        ]}
                        onPress={() => setSelectedChart(chart.key as any)}
                    >
                        <Text style={styles.chartIcon}>{chart.icon}</Text>
                        <Text style={[
                            styles.chartLabel,
                            selectedChart === chart.key && styles.chartLabelActive
                        ]}>
                            {chart.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Chart Content */}
            {selectedChart === 'pie' && renderPieChart()}
            {selectedChart === 'bar' && renderBarChart()}
            {selectedChart === 'line' && renderLineChart()}

            {/* Quick Stats */}
            <View style={styles.quickStats}>
                <Text style={styles.statsTitle}>Quick Insights</Text>
                <View style={styles.statsGrid}>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>2,847</Text>
                        <Text style={styles.statLabel}>Total Trips Today</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>18.5%</Text>
                        <Text style={styles.statLabel}>Peak Hour Share</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>23 min</Text>
                        <Text style={styles.statLabel}>Avg Trip Duration</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>89%</Text>
                        <Text style={styles.statLabel}>Public Transport</Text>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        padding: SIZES.xl,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.lightGray,
    },
    backButton: {
        marginBottom: SIZES.sm,
    },
    backButtonText: {
        color: COLORS.primary,
        fontSize: SIZES.body,
        fontFamily: FONTS.semiBold,
    },
    title: {
        fontSize: SIZES.heading,
        fontFamily: FONTS.primary,
        color: COLORS.textPrimary,
    },

    // Chart Selector
    chartSelector: {
        flexDirection: 'row',
        padding: SIZES.xl,
        justifyContent: 'space-around',
    },
    chartButton: {
        alignItems: 'center',
        padding: SIZES.md,
        borderRadius: 16,
        backgroundColor: COLORS.white,
        minWidth: 80,
        borderWidth: 1,
        borderColor: COLORS.lightGray,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    chartButtonActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 4,
    },
    chartIcon: {
        fontSize: 24,
        marginBottom: SIZES.xs,
    },
    chartLabel: {
        fontSize: SIZES.caption,
        color: COLORS.textTertiary,
        textAlign: 'center',
        fontFamily: FONTS.medium,
    },
    chartLabelActive: {
        color: COLORS.white,
        fontFamily: FONTS.semiBold,
    },

    // Chart Container
    chartContainer: {
        margin: SIZES.xl,
        backgroundColor: COLORS.white,
        borderRadius: 20,
        padding: SIZES.lg,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 6,
    },
    chartTitle: {
        fontSize: SIZES.subheading,
        fontFamily: FONTS.semiBold,
        color: COLORS.textPrimary,
        marginBottom: SIZES.lg,
        textAlign: 'center',
    },

    // Pie Chart
    pieChartContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    pieChart: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SIZES.lg,
    },
    pieChartCenter: {
        color: COLORS.white,
        fontSize: SIZES.body,
        fontFamily: FONTS.bold,
    },
    pieChartLegend: {
        flex: 1,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SIZES.sm,
    },
    legendColor: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: SIZES.sm,
    },
    legendLabel: {
        flex: 1,
        fontSize: SIZES.caption,
        color: COLORS.textTertiary,
    },
    legendValue: {
        fontSize: SIZES.caption,
        fontFamily: FONTS.semiBold,
        color: COLORS.textPrimary,
    },

    // Bar Chart
    barChart: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: SIZES.sm,
    },
    barContainer: {
        alignItems: 'center',
        marginHorizontal: 4,
    },
    bar: {
        width: 16,
        borderRadius: 2,
        marginBottom: SIZES.sm,
    },
    barLabel: {
        fontSize: SIZES.tiny,
        color: COLORS.textTertiary,
        marginBottom: SIZES.xs,
    },
    barValue: {
        fontSize: SIZES.tiny,
        color: COLORS.textSecondary,
        fontFamily: FONTS.medium,
    },

    // Line Chart
    lineChartContainer: {
        alignItems: 'center',
        paddingVertical: SIZES.xl,
    },
    lineChartPlaceholder: {
        fontSize: 48,
        marginBottom: SIZES.md,
    },
    lineChartText: {
        fontSize: SIZES.caption,
        color: COLORS.textTertiary,
        textAlign: 'center',
    },
    trendStats: {
        flexDirection: 'row',
        marginTop: SIZES.lg,
    },
    trendStat: {
        alignItems: 'center',
        marginHorizontal: SIZES.lg,
    },
    trendLabel: {
        fontSize: SIZES.small,
        color: COLORS.textTertiary,
        marginBottom: SIZES.xs,
    },
    trendValue: {
        fontSize: SIZES.body,
        fontFamily: FONTS.bold,
        color: COLORS.textPrimary,
    },

    // Quick Stats
    quickStats: {
        margin: SIZES.xl,
        backgroundColor: COLORS.white,
        borderRadius: 20,
        padding: SIZES.lg,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 6,
    },
    statsTitle: {
        fontSize: SIZES.subheading,
        fontFamily: FONTS.semiBold,
        color: COLORS.textPrimary,
        marginBottom: SIZES.lg,
        textAlign: 'center',
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    statItem: {
        width: '50%',
        alignItems: 'center',
        paddingVertical: SIZES.md,
    },
    statValue: {
        fontSize: SIZES.heading,
        fontFamily: FONTS.bold,
        color: COLORS.primary,
        marginBottom: SIZES.xs,
    },
    statLabel: {
        fontSize: SIZES.caption,
        color: COLORS.textTertiary,
        textAlign: 'center',
    },
});

export default DataVisualization;
