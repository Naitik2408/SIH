import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    ActivityIndicator,
    RefreshControl,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../../constants';
import { User } from '../../../types';
import { ownerAPI } from '../../../services/api';

const { width } = Dimensions.get('window');

interface OwnerHomeProps {
    user: User;
}

interface DashboardStats {
    totalScientists: number;
    pendingApprovals: number;
    approvedScientists: number;
    totalOrganizations: number;
    organizationBreakdown: { [key: string]: number };
}

interface RecentActivity {
    title: string;
    subtitle: string;
    time: string;
    icon: string;
    color: string;
}

interface OwnerHomeProps {
    user: User;
}

const OwnerHome: React.FC<OwnerHomeProps> = ({ user }) => {
    // State for dynamic data
    const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
        totalScientists: 0,
        pendingApprovals: 0,
        approvedScientists: 0,
        totalOrganizations: 0,
        organizationBreakdown: {}
    });
    const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Fetch dashboard data
    const fetchDashboardData = async () => {
        try {
            console.log('🏠 [OWNER HOME] Fetching dashboard data...');
            
            const result = await ownerAPI.getAllScientists();
            console.log('📊 [OWNER HOME] Scientists data received:', result);
            
            // Calculate statistics
            const totalScientists = result.scientists.length;
            const pendingApprovals = result.scientists.filter(s => !s.isApproved).length;
            const approvedScientists = result.scientists.filter(s => s.isApproved).length;
            
            // Organization breakdown
            const organizationBreakdown: { [key: string]: number } = {};
            result.scientists.forEach(scientist => {
                const org = scientist.organizationId || 'Unknown';
                organizationBreakdown[org] = (organizationBreakdown[org] || 0) + 1;
            });
            
            const totalOrganizations = Object.keys(organizationBreakdown).length;
            
            setDashboardStats({
                totalScientists,
                pendingApprovals,
                approvedScientists,
                totalOrganizations,
                organizationBreakdown
            });
            
            // Generate recent activities based on actual data
            const activities: RecentActivity[] = [];
            
            // Add activities for recent scientist registrations
            const recentScientists = result.scientists
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .slice(0, 3);
                
            recentScientists.forEach((scientist, index) => {
                const timeAgo = getTimeAgo(scientist.createdAt);
                const status = scientist.isApproved ? 'approved' : 'pending approval';
                activities.push({
                    title: `Scientist ${scientist.isApproved ? 'Approved' : 'Registration'}`,
                    subtitle: `${scientist.name} from ${scientist.organizationId} - ${status}`,
                    time: timeAgo,
                    icon: scientist.isApproved ? 'checkmark-circle' : 'person-add',
                    color: scientist.isApproved ? '#10b981' : '#3b82f6'
                });
            });
            
            // Add system stats activity
            if (pendingApprovals > 0) {
                activities.push({
                    title: 'Approval Required',
                    subtitle: `${pendingApprovals} scientist${pendingApprovals > 1 ? 's' : ''} awaiting your approval`,
                    time: 'Now',
                    icon: 'time',
                    color: '#f59e0b'
                });
            }
            
            // Add organization overview
            const topOrg = Object.entries(organizationBreakdown)
                .sort(([,a], [,b]) => b - a)[0];
            
            if (topOrg) {
                activities.push({
                    title: 'Organization Insights',
                    subtitle: `${topOrg[0]} has the most scientists (${topOrg[1]})`,
                    time: 'Updated',
                    icon: 'business',
                    color: '#8b5cf6'
                });
            }
            
            setRecentActivities(activities);
            
            console.log('✅ [OWNER HOME] Dashboard data updated:', {
                totalScientists,
                pendingApprovals,
                approvedScientists,
                totalOrganizations
            });
            
        } catch (error) {
            console.error('❌ [OWNER HOME] Error fetching dashboard data:', error);
            Alert.alert('Error', 'Failed to load dashboard data. Please try again.');
        }
    };

    // Helper function to format time ago
    const getTimeAgo = (dateString: string): string => {
        const now = new Date();
        const date = new Date(dateString);
        const diffInMs = now.getTime() - date.getTime();
        const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
        const diffInDays = Math.floor(diffInHours / 24);
        
        if (diffInDays > 0) {
            return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
        } else if (diffInHours > 0) {
            return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
        } else {
            return 'Just now';
        }
    };

    // Load data on component mount
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await fetchDashboardData();
            setLoading(false);
        };
        
        loadData();
    }, []);

    // Refresh handler
    const onRefresh = async () => {
        setRefreshing(true);
        await fetchDashboardData();
        setRefreshing(false);
    };

    // Dynamic dashboard stats configuration
    const statsConfig = [
        {
            title: 'Total Scientists',
            value: dashboardStats.totalScientists.toString(),
            icon: 'school',
            color: '#3b82f6',
            trend: `${dashboardStats.totalOrganizations} orgs`,
            bgColor: '#eff6ff'
        },
        {
            title: 'Pending Approvals',
            value: dashboardStats.pendingApprovals.toString(),
            icon: 'time',
            color: '#f59e0b',
            trend: 'Need attention',
            bgColor: '#fffbeb'
        },
        {
            title: 'Approved Scientists',
            value: dashboardStats.approvedScientists.toString(),
            icon: 'checkmark-circle',
            color: '#10b981',
            trend: `${Math.round((dashboardStats.approvedScientists / dashboardStats.totalScientists) * 100) || 0}% approved`,
            bgColor: '#f0fdf4'
        },
        {
            title: 'Organizations',
            value: dashboardStats.totalOrganizations.toString(),
            icon: 'business',
            color: '#8b5cf6',
            trend: 'Active',
            bgColor: '#f3f4f6'
        }
    ];

    return (
        <View style={styles.container}>
            {/* Top Navigation Bar */}
            <View style={styles.topNavBar}>
                <View style={styles.navLeft}>
                    <View style={styles.logoContainer}>
                        <Text style={styles.logoText}>GetWay</Text>
                        <Text style={styles.adminBadge}>ADMIN</Text>
                    </View>
                </View>
                <View style={styles.navRight}>
                    <TouchableOpacity style={styles.notificationButton}>
                        <Ionicons name="notifications-outline" size={24} color={COLORS.white} />
                        <View style={styles.notificationDot} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.menuButton}>
                        <Ionicons name="menu" size={24} color={COLORS.white} />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView 
                style={styles.content} 
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
                {/* Welcome Section */}
                <View style={styles.welcomeSection}>
                    <Text style={styles.welcomeText}>Welcome back, {user.name}! 👑</Text>
                    <Text style={styles.welcomeSubtext}>
                        {loading 
                            ? 'Loading your dashboard...' 
                            : `Managing ${dashboardStats.totalScientists} scientists across ${dashboardStats.totalOrganizations} organizations`
                        }
                    </Text>
                </View>

                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={COLORS.primary} />
                        <Text style={styles.loadingText}>Loading dashboard data...</Text>
                    </View>
                ) : (
                    <>
                        {/* Dashboard Stats */}
                        <View style={styles.statsGrid}>
                            {statsConfig.map((stat, index) => (
                                <TouchableOpacity key={index} style={styles.statCard}>
                                    <View style={[styles.statIconContainer, { backgroundColor: stat.bgColor }]}>
                                        <Ionicons name={stat.icon as any} size={24} color={stat.color} />
                                    </View>
                                    <View style={styles.statContent}>
                                        <Text style={styles.statValue}>{stat.value}</Text>
                                        <Text style={styles.statTitle}>{stat.title}</Text>
                                        <View style={styles.trendContainer}>
                                            <Text style={[styles.trendText, { color: stat.color }]}>
                                                {stat.trend}
                                            </Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Organization Breakdown */}
                        {Object.keys(dashboardStats.organizationBreakdown).length > 0 && (
                            <View style={styles.organizationSection}>
                                <Text style={styles.sectionTitle}>Organizations Overview</Text>
                                <View style={styles.organizationCard}>
                                    {Object.entries(dashboardStats.organizationBreakdown)
                                        .sort(([,a], [,b]) => b - a)
                                        .map(([org, count]) => (
                                            <View key={org} style={styles.organizationItem}>
                                                <View style={styles.orgInfo}>
                                                    <Text style={styles.orgName}>{org}</Text>
                                                    <Text style={styles.orgCount}>{count} scientists</Text>
                                                </View>
                                                <View style={styles.orgProgress}>
                                                    <View 
                                                        style={[
                                                            styles.orgProgressBar, 
                                                            { width: `${(count / dashboardStats.totalScientists) * 100}%` }
                                                        ]} 
                                                    />
                                                </View>
                                            </View>
                                    ))}
                                </View>
                            </View>
                        )}

                        {/* Quick Actions */}
                        <View style={styles.quickActionsSection}>
                            <Text style={styles.sectionTitle}>Quick Actions</Text>
                            <View style={styles.quickActionsGrid}>
                                <TouchableOpacity style={styles.actionCard}>
                                    <Ionicons name="person-add" size={28} color={COLORS.primary} />
                                    <Text style={styles.actionText}>Approve Scientists</Text>
                                    {dashboardStats.pendingApprovals > 0 && (
                                        <View style={styles.actionBadge}>
                                            <Text style={styles.actionBadgeText}>{dashboardStats.pendingApprovals}</Text>
                                        </View>
                                    )}
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.actionCard}>
                                    <Ionicons name="people" size={28} color={COLORS.primary} />
                                    <Text style={styles.actionText}>View All Scientists</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.actionCard}>
                                    <Ionicons name="business" size={28} color={COLORS.primary} />
                                    <Text style={styles.actionText}>Organizations</Text>
                                    <View style={styles.actionBadge}>
                                        <Text style={styles.actionBadgeText}>{dashboardStats.totalOrganizations}</Text>
                                    </View>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.actionCard}>
                                    <Ionicons name="shield-checkmark" size={28} color={COLORS.primary} />
                                    <Text style={styles.actionText}>System Health</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Recent Activities */}
                        <View style={styles.activitiesSection}>
                            <Text style={styles.sectionTitle}>Recent Activities</Text>
                            {recentActivities.length > 0 ? (
                                recentActivities.map((activity, index) => (
                                    <TouchableOpacity key={index} style={styles.activityCard}>
                                        <View style={[styles.activityIcon, { backgroundColor: `${activity.color}15` }]}>
                                            <Ionicons name={activity.icon as any} size={20} color={activity.color} />
                                        </View>
                                        <View style={styles.activityContent}>
                                            <Text style={styles.activityTitle}>{activity.title}</Text>
                                            <Text style={styles.activitySubtitle}>{activity.subtitle}</Text>
                                            <Text style={styles.activityTime}>{activity.time}</Text>
                                        </View>
                                        <Ionicons name="chevron-forward" size={16} color={COLORS.gray} />
                                    </TouchableOpacity>
                                ))
                            ) : (
                                <View style={styles.emptyActivities}>
                                    <Ionicons name="time-outline" size={48} color={COLORS.gray} />
                                    <Text style={styles.emptyActivitiesText}>No recent activities</Text>
                                </View>
                            )}
                        </View>

                        {/* System Status */}
                        <View style={styles.healthSection}>
                            <Text style={styles.sectionTitle}>System Status</Text>
                            <View style={styles.healthCard}>
                                <View style={styles.healthItem}>
                                    <Text style={styles.healthLabel}>Database Connection</Text>
                                    <View style={styles.healthStatus}>
                                        <View style={[styles.statusDot, { backgroundColor: '#10b981' }]} />
                                        <Text style={styles.healthValue}>Connected</Text>
                                    </View>
                                </View>
                                <View style={styles.healthItem}>
                                    <Text style={styles.healthLabel}>Scientists Data</Text>
                                    <View style={styles.healthStatus}>
                                        <Text style={styles.healthValue}>Up to date</Text>
                                    </View>
                                </View>
                                <View style={styles.healthItem}>
                                    <Text style={styles.healthLabel}>Total Scientists</Text>
                                    <View style={styles.healthStatus}>
                                        <Text style={styles.healthValue}>{dashboardStats.totalScientists}</Text>
                                    </View>
                                </View>
                                <View style={styles.healthItem}>
                                    <Text style={styles.healthLabel}>Organizations</Text>
                                    <View style={styles.healthStatus}>
                                        <Text style={styles.healthValue}>{dashboardStats.totalOrganizations}</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    topNavBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SIZES.lg,
        paddingTop: 50,
        paddingBottom: SIZES.md,
        backgroundColor: COLORS.primary,
    },
    navLeft: {
        flex: 1,
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.white,
        marginRight: SIZES.xs,
    },
    adminBadge: {
        fontSize: 10,
        fontWeight: '600',
        color: COLORS.primary,
        backgroundColor: COLORS.white,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
    },
    navRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    notificationButton: {
        position: 'relative',
        marginRight: SIZES.md,
    },
    notificationDot: {
        position: 'absolute',
        top: -2,
        right: -2,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#ef4444',
    },
    menuButton: {
        // Menu button styles
    },
    content: {
        flex: 1,
    },
    welcomeSection: {
        paddingHorizontal: SIZES.lg,
        paddingTop: SIZES.lg,
        paddingBottom: SIZES.md,
    },
    welcomeText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.black,
        marginBottom: SIZES.xs,
    },
    welcomeSubtext: {
        fontSize: SIZES.md,
        color: COLORS.gray,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: SIZES.lg,
        justifyContent: 'space-between',
    },
    statCard: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: SIZES.md,
        marginBottom: SIZES.md,
        width: (width - SIZES.lg * 2 - SIZES.xs) / 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    statIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SIZES.sm,
    },
    statContent: {
        // Content styles
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.black,
        marginBottom: 2,
    },
    statTitle: {
        fontSize: SIZES.sm,
        color: COLORS.gray,
        marginBottom: SIZES.xs,
    },
    trendContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    trendText: {
        fontSize: SIZES.xs,
        fontWeight: '600',
        marginRight: 4,
    },
    trendLabel: {
        fontSize: SIZES.xs,
        color: COLORS.gray,
    },
    quickActionsSection: {
        paddingHorizontal: SIZES.lg,
        marginBottom: SIZES.lg,
    },
    sectionTitle: {
        fontSize: SIZES.lg,
        fontWeight: 'bold',
        color: COLORS.black,
        marginBottom: SIZES.md,
    },
    quickActionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    actionCard: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: SIZES.md,
        alignItems: 'center',
        width: (width - SIZES.lg * 2 - SIZES.xs) / 2,
        marginBottom: SIZES.sm,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    actionText: {
        fontSize: SIZES.sm,
        color: COLORS.black,
        textAlign: 'center',
        marginTop: SIZES.xs,
        fontWeight: '500',
    },
    activitiesSection: {
        paddingHorizontal: SIZES.lg,
        marginBottom: SIZES.lg,
    },
    activityCard: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: SIZES.md,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SIZES.sm,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    activityIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SIZES.sm,
    },
    activityContent: {
        flex: 1,
    },
    activityTitle: {
        fontSize: SIZES.md,
        fontWeight: '600',
        color: COLORS.black,
        marginBottom: 2,
    },
    activitySubtitle: {
        fontSize: SIZES.sm,
        color: COLORS.gray,
        marginBottom: 2,
    },
    activityTime: {
        fontSize: SIZES.xs,
        color: COLORS.gray,
    },
    healthSection: {
        paddingHorizontal: SIZES.lg,
        marginBottom: 100, // Extra space for bottom tab bar
    },
    healthCard: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: SIZES.md,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    healthItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: SIZES.sm,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    healthLabel: {
        fontSize: SIZES.md,
        color: COLORS.black,
        fontWeight: '500',
    },
    healthStatus: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: SIZES.xs,
    },
    healthValue: {
        fontSize: SIZES.md,
        color: COLORS.gray,
        fontWeight: '500',
    },
    // Loading styles
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: SIZES.xl,
    },
    loadingText: {
        marginTop: SIZES.sm,
        color: COLORS.gray,
        fontSize: SIZES.md,
    },
    // Organization section styles
    organizationSection: {
        paddingHorizontal: SIZES.lg,
        marginBottom: SIZES.lg,
    },
    organizationCard: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: SIZES.md,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    organizationItem: {
        marginBottom: SIZES.sm,
        paddingBottom: SIZES.sm,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    orgInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SIZES.xs,
    },
    orgName: {
        fontSize: SIZES.md,
        fontWeight: '600',
        color: COLORS.black,
        flex: 1,
    },
    orgCount: {
        fontSize: SIZES.sm,
        color: COLORS.gray,
    },
    orgProgress: {
        height: 4,
        backgroundColor: '#f3f4f6',
        borderRadius: 2,
        overflow: 'hidden',
    },
    orgProgressBar: {
        height: '100%',
        backgroundColor: COLORS.primary,
        borderRadius: 2,
    },
    // Action badge styles
    actionBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: '#ef4444',
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionBadgeText: {
        color: COLORS.white,
        fontSize: 10,
        fontWeight: 'bold',
    },
    // Empty activities styles
    emptyActivities: {
        alignItems: 'center',
        paddingVertical: SIZES.xl,
    },
    emptyActivitiesText: {
        marginTop: SIZES.sm,
        fontSize: SIZES.md,
        color: COLORS.gray,
    },
});

export default OwnerHome;
