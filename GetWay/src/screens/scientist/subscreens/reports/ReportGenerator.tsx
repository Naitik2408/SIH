import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    FlatList,
    Share,
} from 'react-native';
import { COLORS, SIZES, FONTS } from '../../../../constants';

interface ReportData {
    id: string;
    title: string;
    date: string;
    type: 'daily' | 'weekly' | 'monthly';
    status: 'draft' | 'published' | 'scheduled';
    insights: number;
    downloads: number;
}

interface ReportGeneratorProps {
    navigation: any;
}

const ReportGenerator: React.FC<ReportGeneratorProps> = ({ navigation }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedReportType, setSelectedReportType] = useState<'all' | 'daily' | 'weekly' | 'monthly'>('all');
    const [showCreateModal, setShowCreateModal] = useState(false);

    const reports: ReportData[] = [
        {
            id: '1',
            title: 'Weekly Traffic Analysis',
            date: '2024-01-15',
            type: 'weekly',
            status: 'published',
            insights: 12,
            downloads: 45,
        },
        {
            id: '2',
            title: 'Monthly Modal Share Report',
            date: '2024-01-01',
            type: 'monthly',
            status: 'published',
            insights: 25,
            downloads: 128,
        },
        {
            id: '3',
            title: 'Daily Peak Hour Analysis',
            date: '2024-01-16',
            type: 'daily',
            status: 'draft',
            insights: 8,
            downloads: 0,
        },
        {
            id: '4',
            title: 'O-D Matrix Weekly Summary',
            date: '2024-01-08',
            type: 'weekly',
            status: 'scheduled',
            insights: 15,
            downloads: 67,
        },
    ];

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

    const filteredReports = reports.filter(report => {
        const matchesSearch = report.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = selectedReportType === 'all' || report.type === selectedReportType;
        return matchesSearch && matchesType;
    });

    const handleShareReport = async (report: ReportData) => {
        try {
            await Share.share({
                message: `Check out this travel data report: ${report.title}\nGenerated on ${report.date}`,
                title: report.title,
            });
        } catch (error) {
            console.error('Error sharing report:', error);
        }
    };

    const renderReportCard = ({ item }: { item: ReportData }) => (
        <TouchableOpacity style={styles.reportCard}>
            <View style={styles.reportHeader}>
                <View style={styles.reportTitle}>
                    <Text style={styles.reportName}>{item.title}</Text>
                    <Text style={styles.reportDate}>{item.date}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                    <Text style={styles.statusIcon}>{getStatusIcon(item.status)}</Text>
                    <Text style={styles.statusText}>{item.status}</Text>
                </View>
            </View>

            <View style={styles.reportStats}>
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{item.insights}</Text>
                    <Text style={styles.statLabel}>Insights</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{item.downloads}</Text>
                    <Text style={styles.statLabel}>Downloads</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{item.type}</Text>
                    <Text style={styles.statLabel}>Frequency</Text>
                </View>
            </View>

            <View style={styles.reportActions}>
                <TouchableOpacity style={styles.actionButton}>
                    <Text style={styles.actionText}>📊 View</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                    <Text style={styles.actionText}>📝 Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleShareReport(item)}
                >
                    <Text style={styles.actionText}>📤 Share</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.backButtonText}>← Back</Text>
                </TouchableOpacity>
                <Text style={[styles.title, { fontFamily: FONTS.bold }]}>Report Generator</Text>
                <TouchableOpacity
                    style={styles.createButton}
                    onPress={() => setShowCreateModal(true)}
                >
                    <Text style={styles.createButtonText}>+ New</Text>
                </TouchableOpacity>
            </View>

            {/* Search and Filter */}
            <View style={styles.searchSection}>
                <View style={styles.searchContainer}>
                    <Text style={styles.searchIcon}>🔍</Text>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search reports..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholderTextColor={COLORS.textQuaternary}
                    />
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
                    {(['all', 'daily', 'weekly', 'monthly'] as const).map((type) => (
                        <TouchableOpacity
                            key={type}
                            style={[
                                styles.filterButton,
                                selectedReportType === type && styles.filterButtonActive
                            ]}
                            onPress={() => setSelectedReportType(type)}
                        >
                            <Text style={[
                                styles.filterText,
                                selectedReportType === type && styles.filterTextActive
                            ]}>
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
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
            <View style={styles.quickActions}>
                <Text style={styles.quickActionsTitle}>Quick Reports</Text>
                <View style={styles.quickActionButtons}>
                    <TouchableOpacity style={styles.quickActionButton}>
                        <Text style={styles.quickActionIcon}>📈</Text>
                        <Text style={styles.quickActionText}>Today's Summary</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.quickActionButton}>
                        <Text style={styles.quickActionIcon}>🚌</Text>
                        <Text style={styles.quickActionText}>Modal Analysis</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.quickActionButton}>
                        <Text style={styles.quickActionIcon}>🗺️</Text>
                        <Text style={styles.quickActionText}>Route Patterns</Text>
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
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: SIZES.xl,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.lightGray,
    },
    backButton: {
        flex: 1,
    },
    backButtonText: {
        color: COLORS.primary,
        fontSize: SIZES.body,
        fontFamily: FONTS.semiBold,
    },
    title: {
        flex: 2,
        fontSize: SIZES.heading,
        fontFamily: FONTS.primary,
        color: COLORS.textPrimary,
        textAlign: 'center',
    },
    createButton: {
        flex: 1,
        alignItems: 'flex-end',
    },
    createButtonText: {
        color: COLORS.primary,
        fontSize: SIZES.body,
        fontFamily: FONTS.bold,
    },

    // Search Section
    searchSection: {
        padding: SIZES.xl,
        backgroundColor: COLORS.white,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.lightGray,
        borderRadius: 12,
        paddingHorizontal: SIZES.md,
        marginBottom: SIZES.md,
    },
    searchIcon: {
        fontSize: 16,
        marginRight: SIZES.sm,
    },
    searchInput: {
        flex: 1,
        paddingVertical: SIZES.md,
        fontSize: SIZES.body,
        color: COLORS.textPrimary,
        fontFamily: FONTS.regular,
    },
    filterScroll: {
        flexGrow: 0,
    },
    filterButton: {
        paddingHorizontal: SIZES.md,
        paddingVertical: SIZES.sm,
        marginRight: SIZES.sm,
        backgroundColor: COLORS.lightGray,
        borderRadius: 12,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    filterButtonActive: {
        backgroundColor: COLORS.primary,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    filterText: {
        color: COLORS.textTertiary,
        fontSize: SIZES.caption,
        fontFamily: FONTS.medium,
    },
    filterTextActive: {
        color: COLORS.white,
        fontFamily: FONTS.semiBold,
    },

    // Reports List
    reportsList: {
        padding: SIZES.xl,
        paddingTop: 0,
    },
    reportCard: {
        backgroundColor: COLORS.white,
        borderRadius: 20,
        padding: SIZES.lg,
        marginBottom: SIZES.md,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 6,
    },
    reportHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: SIZES.md,
    },
    reportTitle: {
        flex: 1,
        marginRight: SIZES.md,
    },
    reportName: {
        fontSize: SIZES.body,
        fontFamily: FONTS.semiBold,
        color: COLORS.textPrimary,
        marginBottom: SIZES.xs,
    },
    reportDate: {
        fontSize: SIZES.caption,
        color: COLORS.textTertiary,
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
        paddingVertical: SIZES.md,
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
        minWidth: 70,
    },
    actionText: {
        fontSize: SIZES.caption,
        color: COLORS.textSecondary,
        textAlign: 'center',
        fontFamily: FONTS.medium,
    },

    // Quick Actions
    quickActions: {
        backgroundColor: COLORS.white,
        padding: SIZES.xl,
        borderTopWidth: 1,
        borderTopColor: COLORS.lightGray,
    },
    quickActionsTitle: {
        fontSize: SIZES.body,
        fontFamily: FONTS.semiBold,
        color: COLORS.textPrimary,
        marginBottom: SIZES.md,
    },
    quickActionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    quickActionButton: {
        alignItems: 'center',
        paddingVertical: SIZES.md,
        paddingHorizontal: SIZES.sm,
        backgroundColor: COLORS.lightGray,
        borderRadius: 16,
        minWidth: 80,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    quickActionIcon: {
        fontSize: 24,
        marginBottom: SIZES.xs,
    },
    quickActionText: {
        fontSize: SIZES.small,
        color: COLORS.textTertiary,
        textAlign: 'center',
        fontFamily: FONTS.medium,
    },
});

export default ReportGenerator;
