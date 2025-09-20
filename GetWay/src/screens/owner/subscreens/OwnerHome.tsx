import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../../constants';
import { User } from '../../../types';

const { width } = Dimensions.get('window');

interface OwnerHomeProps {
    user: User;
}

const OwnerHome: React.FC<OwnerHomeProps> = ({ user }) => {
    const dashboardStats = [
        {
            title: 'Total Scientists',
            value: '45',
            icon: 'school',
            color: '#3b82f6',
            trend: '+12%',
            bgColor: '#eff6ff'
        },
        {
            title: 'Active Users',
            value: '1,247',
            icon: 'people',
            color: '#10b981',
            trend: '+8%',
            bgColor: '#f0fdf4'
        },
        {
            title: 'Data Points',
            value: '89.2K',
            icon: 'analytics',
            color: '#f59e0b',
            trend: '+15%',
            bgColor: '#fffbeb'
        },
        {
            title: 'Pending Approvals',
            value: '23',
            icon: 'time',
            color: '#ef4444',
            trend: '-5%',
            bgColor: '#fef2f2'
        }
    ];

    const recentActivities = [
        {
            title: 'New Scientist Registration',
            subtitle: 'Dr. Priya Sharma applied for access',
            time: '2 hours ago',
            icon: 'person-add',
            color: '#3b82f6'
        },
        {
            title: 'Data Quality Alert',
            subtitle: 'Low quality data detected in Mumbai region',
            time: '4 hours ago',
            icon: 'warning',
            color: '#f59e0b'
        },
        {
            title: 'System Performance',
            subtitle: 'Server response time improved by 15%',
            time: '6 hours ago',
            icon: 'speedometer',
            color: '#10b981'
        },
        {
            title: 'User Milestone',
            subtitle: '1000+ users reached this month',
            time: '1 day ago',
            icon: 'trophy',
            color: '#8b5cf6'
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

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Welcome Section */}
                <View style={styles.welcomeSection}>
                    <Text style={styles.welcomeText}>Welcome back, {user.name}! 👑</Text>
                    <Text style={styles.welcomeSubtext}>Here's what's happening on your platform today</Text>
                </View>

                {/* Dashboard Stats */}
                <View style={styles.statsGrid}>
                    {dashboardStats.map((stat, index) => (
                        <TouchableOpacity key={index} style={styles.statCard}>
                            <View style={[styles.statIconContainer, { backgroundColor: stat.bgColor }]}>
                                <Ionicons name={stat.icon as any} size={24} color={stat.color} />
                            </View>
                            <View style={styles.statContent}>
                                <Text style={styles.statValue}>{stat.value}</Text>
                                <Text style={styles.statTitle}>{stat.title}</Text>
                                <View style={styles.trendContainer}>
                                    <Text style={[
                                        styles.trendText,
                                        { color: stat.trend.startsWith('+') ? '#10b981' : '#ef4444' }
                                    ]}>
                                        {stat.trend}
                                    </Text>
                                    <Text style={styles.trendLabel}>vs last month</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Quick Actions */}
                <View style={styles.quickActionsSection}>
                    <Text style={styles.sectionTitle}>Quick Actions</Text>
                    <View style={styles.quickActionsGrid}>
                        <TouchableOpacity style={styles.actionCard}>
                            <Ionicons name="person-add" size={28} color={COLORS.primary} />
                            <Text style={styles.actionText}>Approve Scientists</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionCard}>
                            <Ionicons name="bar-chart" size={28} color={COLORS.primary} />
                            <Text style={styles.actionText}>View Reports</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionCard}>
                            <Ionicons name="settings" size={28} color={COLORS.primary} />
                            <Text style={styles.actionText}>System Settings</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionCard}>
                            <Ionicons name="shield-checkmark" size={28} color={COLORS.primary} />
                            <Text style={styles.actionText}>Data Governance</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Recent Activities */}
                <View style={styles.activitiesSection}>
                    <Text style={styles.sectionTitle}>Recent Activities</Text>
                    {recentActivities.map((activity, index) => (
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
                    ))}
                </View>

                {/* System Health */}
                <View style={styles.healthSection}>
                    <Text style={styles.sectionTitle}>System Health</Text>
                    <View style={styles.healthCard}>
                        <View style={styles.healthItem}>
                            <Text style={styles.healthLabel}>Server Status</Text>
                            <View style={styles.healthStatus}>
                                <View style={[styles.statusDot, { backgroundColor: '#10b981' }]} />
                                <Text style={styles.healthValue}>Operational</Text>
                            </View>
                        </View>
                        <View style={styles.healthItem}>
                            <Text style={styles.healthLabel}>Database</Text>
                            <View style={styles.healthStatus}>
                                <View style={[styles.statusDot, { backgroundColor: '#10b981' }]} />
                                <Text style={styles.healthValue}>Online</Text>
                            </View>
                        </View>
                        <View style={styles.healthItem}>
                            <Text style={styles.healthLabel}>API Response</Text>
                            <View style={styles.healthStatus}>
                                <Text style={styles.healthValue}>245ms</Text>
                            </View>
                        </View>
                        <View style={styles.healthItem}>
                            <Text style={styles.healthLabel}>Uptime</Text>
                            <View style={styles.healthStatus}>
                                <Text style={styles.healthValue}>99.9%</Text>
                            </View>
                        </View>
                    </View>
                </View>
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
});

export default OwnerHome;
