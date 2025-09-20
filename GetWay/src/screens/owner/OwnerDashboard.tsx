import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert,
} from 'react-native';
import { COLORS, SIZES } from '../../constants';
import { User } from '../../types';

interface OwnerDashboardProps {
    user: User;
    onLogout: () => void;
}

const OwnerDashboard: React.FC<OwnerDashboardProps> = ({ user, onLogout }) => {
    const handleManageUsers = () => {
        Alert.alert('User Management', 'Manage customer accounts.');
    };

    const handleSystemSettings = () => {
        Alert.alert('System Settings', 'Configure app settings and parameters.');
    };

    const handleViewReports = () => {
        Alert.alert('Platform Reports', 'View comprehensive platform analytics.');
    };

    const handleDataGovernance = () => {
        Alert.alert('Data Governance', 'Manage data privacy and compliance settings.');
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.greeting}>Admin Panel 👑</Text>
                <Text style={styles.subtitle}>Welcome, {user.name}</Text>
            </View>

            <View style={styles.statsContainer}>
                <View style={styles.statCard}>
                    <Text style={styles.statNumber}>89</Text>
                    <Text style={styles.statLabel}>Total Users</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statNumber}>1,247</Text>
                    <Text style={styles.statLabel}>Data Points</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statNumber}>98.5%</Text>
                    <Text style={styles.statLabel}>Uptime</Text>
                </View>
            </View>

            <View style={styles.metricsSection}>
                <Text style={styles.sectionTitle}>Platform Metrics</Text>

                <View style={styles.metricCard}>
                    <Text style={styles.metricTitle}>User Activity</Text>
                    <Text style={styles.metricText}>
                        👥 Active users increased by 32% this month
                    </Text>
                </View>

                <View style={styles.metricCard}>
                    <Text style={styles.metricTitle}>Data Quality</Text>
                    <Text style={styles.metricText}>
                        ✅ 94% data accuracy rate maintained
                    </Text>
                </View>

                <View style={styles.metricCard}>
                    <Text style={styles.metricTitle}>System Performance</Text>
                    <Text style={styles.metricText}>
                        ⚡ Average response time: 200ms
                    </Text>
                </View>
            </View>

            <View style={styles.actionsContainer}>
                <TouchableOpacity style={styles.primaryButton} onPress={handleManageUsers}>
                    <Text style={styles.primaryButtonText}>Manage Users</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.secondaryButton} onPress={handleSystemSettings}>
                    <Text style={styles.secondaryButtonText}>System Settings</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.secondaryButton} onPress={handleViewReports}>
                    <Text style={styles.secondaryButtonText}>Platform Reports</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.secondaryButton} onPress={handleDataGovernance}>
                    <Text style={styles.secondaryButtonText}>Data Governance</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
                <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
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
        backgroundColor: COLORS.primary,
        marginBottom: SIZES.lg,
    },
    greeting: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.white,
        marginBottom: SIZES.xs,
    },
    subtitle: {
        fontSize: SIZES.md,
        color: COLORS.white,
        opacity: 0.9,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: SIZES.xl,
        marginBottom: SIZES.lg,
    },
    statCard: {
        backgroundColor: COLORS.white,
        padding: SIZES.md,
        borderRadius: 12,
        alignItems: 'center',
        flex: 1,
        marginHorizontal: 4,
    },
    statNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    statLabel: {
        fontSize: SIZES.sm,
        color: COLORS.gray,
        textAlign: 'center',
    },
    metricsSection: {
        paddingHorizontal: SIZES.xl,
        marginBottom: SIZES.lg,
    },
    sectionTitle: {
        fontSize: SIZES.lg,
        fontWeight: 'bold',
        color: COLORS.black,
        marginBottom: SIZES.md,
    },
    metricCard: {
        backgroundColor: COLORS.white,
        padding: SIZES.md,
        borderRadius: 12,
        marginBottom: SIZES.md,
    },
    metricTitle: {
        fontSize: SIZES.md,
        fontWeight: 'bold',
        color: COLORS.black,
        marginBottom: SIZES.xs,
    },
    metricText: {
        fontSize: SIZES.sm,
        color: COLORS.gray,
    },
    actionsContainer: {
        paddingHorizontal: SIZES.xl,
    },
    primaryButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: SIZES.md,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: SIZES.md,
    },
    primaryButtonText: {
        color: COLORS.white,
        fontSize: SIZES.lg,
        fontWeight: 'bold',
    },
    secondaryButton: {
        backgroundColor: COLORS.white,
        paddingVertical: SIZES.md,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: SIZES.md,
        borderWidth: 1,
        borderColor: COLORS.primary,
    },
    secondaryButtonText: {
        color: COLORS.primary,
        fontSize: SIZES.md,
        fontWeight: '600',
    },
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

export default OwnerDashboard;
