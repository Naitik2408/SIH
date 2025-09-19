import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    FlatList,
    TextInput,
} from 'react-native';
import { COLORS, SIZES, FONTS } from '../../constants';

interface DatasetItem {
    id: string;
    name: string;
    type: 'trips' | 'routes' | 'users' | 'patterns';
    size: string;
    lastUpdated: string;
    quality: number;
    status: 'active' | 'processing' | 'archived';
}

interface ScientistDataProps {
    user: any;
}

const ScientistData: React.FC<ScientistDataProps> = ({ user }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFilter, setSelectedFilter] = useState<'all' | 'trips' | 'routes' | 'users' | 'patterns'>('all');

    const datasets: DatasetItem[] = [
        {
            id: '1',
            name: 'Daily Trip Patterns',
            type: 'trips',
            size: '2.4 GB',
            lastUpdated: '2 hours ago',
            quality: 94,
            status: 'active'
        },
        {
            id: '2',
            name: 'Route Optimization Data',
            type: 'routes',
            size: '890 MB',
            lastUpdated: '5 hours ago',
            quality: 97,
            status: 'active'
        },
        {
            id: '3',
            name: 'User Demographics',
            type: 'users',
            size: '156 MB',
            lastUpdated: '1 day ago',
            quality: 89,
            status: 'processing'
        },
        {
            id: '4',
            name: 'Modal Share Analysis',
            type: 'patterns',
            size: '674 MB',
            lastUpdated: '3 hours ago',
            quality: 92,
            status: 'active'
        },
        {
            id: '5',
            name: 'Historical Transport Data',
            type: 'trips',
            size: '5.2 GB',
            lastUpdated: '1 week ago',
            quality: 86,
            status: 'archived'
        },
        {
            id: '6',
            name: 'Peak Hour Patterns',
            type: 'patterns',
            size: '423 MB',
            lastUpdated: '6 hours ago',
            quality: 95,
            status: 'active'
        },
    ];

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'trips': return '🚌';
            case 'routes': return '🗺️';
            case 'users': return '👥';
            case 'patterns': return '📊';
            default: return '📄';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return COLORS.success;
            case 'processing': return COLORS.accent;
            case 'archived': return COLORS.gray;
            default: return COLORS.gray;
        }
    };

    const getQualityColor = (quality: number) => {
        if (quality >= 95) return COLORS.success;
        if (quality >= 85) return COLORS.accent;
        return COLORS.error;
    };

    const filteredDatasets = datasets.filter(dataset => {
        const matchesSearch = dataset.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = selectedFilter === 'all' || dataset.type === selectedFilter;
        return matchesSearch && matchesFilter;
    });

    const renderDatasetCard = ({ item }: { item: DatasetItem }) => (
        <TouchableOpacity style={styles.datasetCard}>
            <View style={styles.datasetHeader}>
                <View style={styles.datasetInfo}>
                    <Text style={styles.datasetIcon}>{getTypeIcon(item.type)}</Text>
                    <View style={styles.datasetDetails}>
                        <Text style={styles.datasetName}>{item.name}</Text>
                        <Text style={styles.datasetType}>{item.type.charAt(0).toUpperCase() + item.type.slice(1)}</Text>
                    </View>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                    <Text style={styles.statusText}>{item.status}</Text>
                </View>
            </View>

            <View style={styles.datasetStats}>
                <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Size</Text>
                    <Text style={styles.statValue}>{item.size}</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Quality</Text>
                    <View style={styles.qualityContainer}>
                        <View style={styles.qualityBar}>
                            <View style={[
                                styles.qualityFill,
                                {
                                    width: `${item.quality}%`,
                                    backgroundColor: getQualityColor(item.quality)
                                }
                            ]} />
                        </View>
                        <Text style={[styles.qualityText, { color: getQualityColor(item.quality) }]}>
                            {item.quality}%
                        </Text>
                    </View>
                </View>
                <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Updated</Text>
                    <Text style={styles.statValue}>{item.lastUpdated}</Text>
                </View>
            </View>

            <View style={styles.datasetActions}>
                <TouchableOpacity style={styles.actionButton}>
                    <Text style={styles.actionText}>👁️ View</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                    <Text style={styles.actionText}>📊 Analyze</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                    <Text style={styles.actionText}>📤 Export</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Research Data</Text>
                <TouchableOpacity style={styles.addButton}>
                    <Text style={styles.addButtonText}>+ Import</Text>
                </TouchableOpacity>
            </View>

            {/* Search and Filter */}
            <View style={styles.searchSection}>
                <View style={styles.searchContainer}>
                    <Text style={styles.searchIcon}>🔍</Text>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search datasets..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholderTextColor={COLORS.textQuaternary}
                    />
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
                    {(['all', 'trips', 'routes', 'users', 'patterns'] as const).map((filter) => (
                        <TouchableOpacity
                            key={filter}
                            style={[
                                styles.filterButton,
                                selectedFilter === filter && styles.filterButtonActive
                            ]}
                            onPress={() => setSelectedFilter(filter)}
                        >
                            <Text style={[
                                styles.filterText,
                                selectedFilter === filter && styles.filterTextActive
                            ]}>
                                {filter.charAt(0).toUpperCase() + filter.slice(1)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Data Summary */}
            <View style={styles.summaryContainer}>
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryValue}>{datasets.length}</Text>
                    <Text style={styles.summaryLabel}>Total Datasets</Text>
                </View>
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryValue}>8.7 GB</Text>
                    <Text style={styles.summaryLabel}>Storage Used</Text>
                </View>
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryValue}>92%</Text>
                    <Text style={styles.summaryLabel}>Avg Quality</Text>
                </View>
            </View>

            {/* Datasets List */}
            <FlatList
                data={filteredDatasets}
                renderItem={renderDatasetCard}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.datasetsList}
                showsVerticalScrollIndicator={false}
            />
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
    addButton: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: SIZES.md,
        paddingVertical: SIZES.sm,
        borderRadius: 8,
    },
    addButtonText: {
        color: COLORS.white,
        fontSize: SIZES.caption,
        fontFamily: FONTS.semiBold,
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
        borderRadius: 8,
    },
    filterButtonActive: {
        backgroundColor: COLORS.primary,
    },
    filterText: {
        color: COLORS.textTertiary,
        fontSize: SIZES.caption,
        fontFamily: FONTS.medium,
    },
    filterTextActive: {
        color: COLORS.white,
    },

    // Summary
    summaryContainer: {
        flexDirection: 'row',
        paddingHorizontal: SIZES.xl,
        paddingBottom: SIZES.md,
        justifyContent: 'space-between',
    },
    summaryCard: {
        backgroundColor: COLORS.white,
        padding: SIZES.md,
        borderRadius: 12,
        alignItems: 'center',
        flex: 1,
        marginHorizontal: SIZES.xs,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    summaryValue: {
        fontSize: SIZES.subheading,
        fontFamily: FONTS.bold,
        color: COLORS.primary,
        marginBottom: SIZES.xs,
    },
    summaryLabel: {
        fontSize: SIZES.small,
        fontFamily: FONTS.regular,
        color: COLORS.textTertiary,
        textAlign: 'center',
    },

    // Datasets List
    datasetsList: {
        padding: SIZES.xl,
        paddingTop: 0,
    },
    datasetCard: {
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
    datasetHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: SIZES.md,
    },
    datasetInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    datasetIcon: {
        fontSize: 24,
        marginRight: SIZES.md,
    },
    datasetDetails: {
        flex: 1,
    },
    datasetName: {
        fontSize: SIZES.body,
        fontFamily: FONTS.semiBold,
        color: COLORS.textPrimary,
        marginBottom: SIZES.xs,
    },
    datasetType: {
        fontSize: SIZES.caption,
        fontFamily: FONTS.regular,
        color: COLORS.textTertiary,
    },
    statusBadge: {
        paddingHorizontal: SIZES.sm,
        paddingVertical: SIZES.xs,
        borderRadius: 8,
    },
    statusText: {
        color: COLORS.white,
        fontSize: SIZES.small,
        fontFamily: FONTS.medium,
        textTransform: 'capitalize',
    },

    // Dataset Stats
    datasetStats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: SIZES.md,
        paddingVertical: SIZES.sm,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: COLORS.lightGray,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statLabel: {
        fontSize: SIZES.small,
        fontFamily: FONTS.regular,
        color: COLORS.textTertiary,
        marginBottom: SIZES.xs,
    },
    statValue: {
        fontSize: SIZES.caption,
        fontFamily: FONTS.semiBold,
        color: COLORS.textSecondary,
    },
    qualityContainer: {
        alignItems: 'center',
        width: '100%',
    },
    qualityBar: {
        width: 40,
        height: 4,
        backgroundColor: COLORS.lightGray,
        borderRadius: 2,
        marginBottom: SIZES.xs,
    },
    qualityFill: {
        height: '100%',
        borderRadius: 2,
    },
    qualityText: {
        fontSize: SIZES.small,
        fontFamily: FONTS.semiBold,
    },

    // Dataset Actions
    datasetActions: {
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
        fontFamily: FONTS.medium,
        color: COLORS.textSecondary,
        textAlign: 'center',
    },
});

export default ScientistData;
