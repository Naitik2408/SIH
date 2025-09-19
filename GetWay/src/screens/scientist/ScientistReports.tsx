import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    FlatList,
} from 'react-native';
import { COLORS, SIZES, FONTS } from '../../constants';

interface ReportItem {
    id: string;
    title: string;
    description: string;
    type: 'traffic' | 'modal' | 'route' | 'temporal';
    status: 'draft' | 'published' | 'scheduled';
    createdDate: string;
    views: number;
    downloads: number;
}

interface ScientistReportsProps {
    user: any;
}

const ScientistReports: React.FC<ScientistReportsProps> = ({ user }) => {
    const [selectedCategory, setSelectedCategory] = useState<'all' | 'traffic' | 'modal' | 'route' | 'temporal'>('all');

    const reports: ReportItem[] = [
        {
            id: '1',
            title: 'Weekly Traffic Analysis Report',
            description: 'Comprehensive analysis of traffic patterns across major routes',
            type: 'traffic',
            status: 'published',
            createdDate: '2024-01-15',
            views: 245,
            downloads: 67
        },
        {
            id: '2',
            title: 'Modal Share Trends Q1 2024',
            description: 'Public transport adoption and modal shift patterns',
            type: 'modal',
            status: 'published',
            createdDate: '2024-01-12',
            views: 189,
            downloads: 43
        },
        {
            id: '3',
            title: 'Route Optimization Study',
            description: 'Analysis of route efficiency and optimization opportunities',
            type: 'route',
            status: 'draft',
            createdDate: '2024-01-18',
            views: 12,
            downloads: 0
        },
        {
            id: '4',
            title: 'Peak Hour Distribution Analysis',
            description: 'Temporal analysis of travel demand patterns',
            type: 'temporal',
            status: 'scheduled',
            createdDate: '2024-01-16',
            views: 56,
            downloads: 15
        },
        {
            id: '5',
            title: 'Congestion Impact Assessment',
            description: 'Economic and environmental impact of traffic congestion',
            type: 'traffic',
            status: 'published',
            createdDate: '2024-01-10',
            views: 312,
            downloads: 89
        },
    ];

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'traffic': return '🚦';
            case 'modal': return '🚌';
            case 'route': return '🗺️';
            case 'temporal': return '⏰';
            default: return '📊';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'published': return COLORS.success;
            case 'draft': return COLORS.accent;
            case 'scheduled': return COLORS.primary;
            default: return COLORS.gray;
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'published': return '✅';
            case 'draft': return '📝';
            case 'scheduled': return '⏰';
            default: return '📄';
        }
    };

    const filteredReports = reports.filter(report =>
        selectedCategory === 'all' || report.type === selectedCategory
    );

    const renderReportCard = ({ item }: { item: ReportItem }) => (
        <TouchableOpacity style={styles.reportCard}>
            <View style={styles.reportHeader}>
                <View style={styles.reportInfo}>
                    <Text style={styles.reportIcon}>{getTypeIcon(item.type)}</Text>
                    <View style={styles.reportDetails}>
                        <Text style={styles.reportTitle}>{item.title}</Text>
                        <Text style={styles.reportDescription}>{item.description}</Text>
                        <Text style={styles.reportDate}>Created: {item.createdDate}</Text>
                    </View>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                    <Text style={styles.statusIcon}>{getStatusIcon(item.status)}</Text>
                    <Text style={styles.statusText}>{item.status}</Text>
                </View>
            </View>

            <View style={styles.reportStats}>
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{item.views}</Text>
                    <Text style={styles.statLabel}>Views</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{item.downloads}</Text>
                    <Text style={styles.statLabel}>Downloads</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{item.type}</Text>
                    <Text style={styles.statLabel}>Category</Text>
                </View>
            </View>

            <View style={styles.reportActions}>
                <TouchableOpacity style={styles.actionButton}>
                    <Text style={styles.actionText}>👁️ Preview</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                    <Text style={styles.actionText}>✏️ Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                    <Text style={styles.actionText}>📤 Share</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Research Reports</Text>
                <TouchableOpacity style={styles.createButton}>
                    <Text style={styles.createButtonText}>+ Create</Text>
                </TouchableOpacity>
            </View>

            {/* Category Filter */}
            <View style={styles.categoryContainer}>
                <Text style={styles.sectionTitle}>Report Categories</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                    {(['all', 'traffic', 'modal', 'route', 'temporal'] as const).map((category) => (
                        <TouchableOpacity
                            key={category}
                            style={[
                                styles.categoryButton,
                                selectedCategory === category && styles.categoryButtonActive
                            ]}
                            onPress={() => setSelectedCategory(category)}
                        >
                            <Text style={styles.categoryIcon}>
                                {category === 'all' ? '📋' : getTypeIcon(category)}
                            </Text>
                            <Text style={[
                                styles.categoryText,
                                selectedCategory === category && styles.categoryTextActive
                            ]}>
                                {category.charAt(0).toUpperCase() + category.slice(1)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Summary Stats */}
            <View style={styles.summaryContainer}>
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryValue}>{reports.length}</Text>
                    <Text style={styles.summaryLabel}>Total Reports</Text>
                </View>
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryValue}>{reports.filter(r => r.status === 'published').length}</Text>
                    <Text style={styles.summaryLabel}>Published</Text>
                </View>
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryValue}>{reports.reduce((sum, r) => sum + r.views, 0)}</Text>
                    <Text style={styles.summaryLabel}>Total Views</Text>
                </View>
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryValue}>{reports.reduce((sum, r) => sum + r.downloads, 0)}</Text>
                    <Text style={styles.summaryLabel}>Downloads</Text>
                </View>
            </View>

            {/* Reports List */}
            <FlatList
                data={filteredReports}
                renderItem={renderReportCard}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.reportsList}
                showsVerticalScrollIndicator={false}
            />

            {/* Quick Actions */}
            <View style={styles.quickActionsContainer}>
                <Text style={styles.sectionTitle}>Quick Templates</Text>
                <View style={styles.quickActions}>
                    <TouchableOpacity style={styles.templateButton}>
                        <Text style={styles.templateIcon}>🚦</Text>
                        <Text style={styles.templateText}>Traffic Report</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.templateButton}>
                        <Text style={styles.templateIcon}>📊</Text>
                        <Text style={styles.templateText}>Data Summary</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.templateButton}>
                        <Text style={styles.templateIcon}>📈</Text>
                        <Text style={styles.templateText}>Trend Analysis</Text>
                    </TouchableOpacity>
                </View>
            </View>
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
        alignItems: 'center',
        paddingHorizontal: SIZES.xl,
        paddingTop: 60,
        paddingBottom: SIZES.lg,
        backgroundColor: COLORS.white,
    },
    title: {
        fontSize: SIZES.heading,
        fontFamily: FONTS.bold,
        color: COLORS.textPrimary,
    },
    createButton: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: SIZES.md,
        paddingVertical: SIZES.sm,
        borderRadius: 8,
    },
    createButtonText: {
        color: COLORS.white,
        fontSize: SIZES.caption,
        fontFamily: FONTS.semiBold,
    },

    // Category Filter
    categoryContainer: {
        padding: SIZES.xl,
        backgroundColor: COLORS.white,
    },
    sectionTitle: {
        fontSize: SIZES.subheading,
        fontFamily: FONTS.semiBold,
        color: COLORS.textPrimary,
        marginBottom: SIZES.md,
    },
    categoryScroll: {
        flexGrow: 0,
    },
    categoryButton: {
        alignItems: 'center',
        paddingHorizontal: SIZES.md,
        paddingVertical: SIZES.sm,
        marginRight: SIZES.sm,
        backgroundColor: COLORS.lightGray,
        borderRadius: 12,
        minWidth: 80,
    },
    categoryButtonActive: {
        backgroundColor: COLORS.primary,
    },
    categoryIcon: {
        fontSize: 20,
        marginBottom: SIZES.xs,
    },
    categoryText: {
        fontSize: SIZES.small,
        fontFamily: FONTS.medium,
        color: COLORS.textTertiary,
        textAlign: 'center',
    },
    categoryTextActive: {
        color: COLORS.white,
    },

    // Summary Stats
    summaryContainer: {
        flexDirection: 'row',
        paddingHorizontal: SIZES.xl,
        paddingBottom: SIZES.md,
        justifyContent: 'space-between',
    },
    summaryCard: {
        backgroundColor: COLORS.white,
        padding: SIZES.sm,
        borderRadius: 12,
        alignItems: 'center',
        flex: 1,
        marginHorizontal: 2,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    summaryValue: {
        fontSize: SIZES.body,
        fontFamily: FONTS.bold,
        color: COLORS.primary,
        marginBottom: SIZES.xs,
    },
    summaryLabel: {
        fontSize: SIZES.tiny,
        fontFamily: FONTS.regular,
        color: COLORS.textTertiary,
        textAlign: 'center',
    },

    // Reports List
    reportsList: {
        padding: SIZES.xl,
        paddingTop: 0,
    },
    reportCard: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: SIZES.lg,
        marginBottom: SIZES.md,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    reportHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: SIZES.md,
    },
    reportInfo: {
        flexDirection: 'row',
        flex: 1,
        marginRight: SIZES.md,
    },
    reportIcon: {
        fontSize: 24,
        marginRight: SIZES.md,
    },
    reportDetails: {
        flex: 1,
    },
    reportTitle: {
        fontSize: SIZES.body,
        fontFamily: FONTS.semiBold,
        color: COLORS.textPrimary,
        marginBottom: SIZES.xs,
    },
    reportDescription: {
        fontSize: SIZES.caption,
        fontFamily: FONTS.regular,
        color: COLORS.textTertiary,
        marginBottom: SIZES.xs,
        lineHeight: 18,
    },
    reportDate: {
        fontSize: SIZES.small,
        fontFamily: FONTS.regular,
        color: COLORS.textQuaternary,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SIZES.sm,
        paddingVertical: SIZES.xs,
        borderRadius: 8,
    },
    statusIcon: {
        fontSize: 12,
        marginRight: SIZES.xs,
    },
    statusText: {
        color: COLORS.white,
        fontSize: SIZES.small,
        fontFamily: FONTS.medium,
        textTransform: 'capitalize',
    },

    // Report Stats
    reportStats: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: SIZES.md,
        paddingVertical: SIZES.sm,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: COLORS.lightGray,
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: SIZES.subheading,
        fontFamily: FONTS.bold,
        color: COLORS.primary,
        marginBottom: SIZES.xs,
    },
    statLabel: {
        fontSize: SIZES.small,
        fontFamily: FONTS.regular,
        color: COLORS.textTertiary,
    },

    // Report Actions
    reportActions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    actionButton: {
        paddingHorizontal: SIZES.md,
        paddingVertical: SIZES.sm,
        backgroundColor: COLORS.lightGray,
        borderRadius: 8,
        minWidth: 80,
    },
    actionText: {
        fontSize: SIZES.caption,
        fontFamily: FONTS.medium,
        color: COLORS.textSecondary,
        textAlign: 'center',
    },

    // Quick Actions
    quickActionsContainer: {
        backgroundColor: COLORS.white,
        padding: SIZES.xl,
        borderTopWidth: 1,
        borderTopColor: COLORS.lightGray,
    },
    quickActions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    templateButton: {
        alignItems: 'center',
        paddingVertical: SIZES.md,
        paddingHorizontal: SIZES.sm,
        backgroundColor: COLORS.lightGray,
        borderRadius: 12,
        minWidth: 90,
    },
    templateIcon: {
        fontSize: 24,
        marginBottom: SIZES.xs,
    },
    templateText: {
        fontSize: SIZES.small,
        fontFamily: FONTS.medium,
        color: COLORS.textTertiary,
        textAlign: 'center',
    },
});

export default ScientistReports;
