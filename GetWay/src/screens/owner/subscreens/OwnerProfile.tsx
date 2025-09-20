import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert,
    Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../../constants';
import { User } from '../../../types';

interface OwnerProfileProps {
    user: User;
    onLogout: () => void;
}

const OwnerProfile: React.FC<OwnerProfileProps> = ({ user, onLogout }) => {
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [autoApprovalEnabled, setAutoApprovalEnabled] = useState(false);
    const [dataAnalyticsEnabled, setDataAnalyticsEnabled] = useState(true);
    const [maintenanceModeEnabled, setMaintenanceModeEnabled] = useState(false);

    const adminStats = [
        { label: 'Years as Admin', value: '3', icon: 'time', color: '#3b82f6' },
        { label: 'Total Decisions', value: '1,247', icon: 'checkmark-done', color: '#10b981' },
        { label: 'Active Scientists', value: '45', icon: 'people', color: '#f59e0b' },
        { label: 'Data Quality', value: '98.5%', icon: 'analytics', color: '#8b5cf6' },
    ];

    const profileSections = [
        {
            title: 'Account Management',
            items: [
                { id: 'personal', label: 'Personal Information', icon: 'person-outline', hasArrow: true },
                { id: 'security', label: 'Security Settings', icon: 'shield-outline', hasArrow: true },
                { id: 'permissions', label: 'Admin Permissions', icon: 'key-outline', hasArrow: true },
                { id: 'backup', label: 'Account Backup', icon: 'cloud-download-outline', hasArrow: true },
            ]
        },
        {
            title: 'System Configuration',
            items: [
                { id: 'users', label: 'User Management', icon: 'people-outline', hasArrow: true },
                { id: 'data', label: 'Data Management', icon: 'server-outline', hasArrow: true },
                { id: 'api', label: 'API Configuration', icon: 'code-outline', hasArrow: true },
                { id: 'logs', label: 'System Logs', icon: 'list-outline', hasArrow: true },
            ]
        },
        {
            title: 'Platform Analytics',
            items: [
                { id: 'reports', label: 'Generate Reports', icon: 'bar-chart-outline', hasArrow: true },
                { id: 'insights', label: 'Data Insights', icon: 'analytics-outline', hasArrow: true },
                { id: 'performance', label: 'Performance Metrics', icon: 'speedometer-outline', hasArrow: true },
                { id: 'export', label: 'Export Data', icon: 'download-outline', hasArrow: true },
            ]
        },
        {
            title: 'Help & Support',
            items: [
                { id: 'docs', label: 'Admin Documentation', icon: 'book-outline', hasArrow: true },
                { id: 'support', label: 'Technical Support', icon: 'help-buoy-outline', hasArrow: true },
                { id: 'feedback', label: 'Send Feedback', icon: 'chatbubble-outline', hasArrow: true },
                { id: 'about', label: 'About GetWay Admin', icon: 'information-circle-outline', hasArrow: true },
            ]
        }
    ];

    const handleSectionPress = (sectionId: string) => {
        switch (sectionId) {
            case 'personal':
                Alert.alert('Personal Information', 'Edit personal details and contact information.');
                break;
            case 'security':
                Alert.alert('Security Settings', 'Manage password, 2FA, and security preferences.');
                break;
            case 'permissions':
                Alert.alert('Admin Permissions', 'View and manage admin access levels.');
                break;
            case 'users':
                Alert.alert('User Management', 'Manage user accounts and permissions.');
                break;
            case 'data':
                Alert.alert('Data Management', 'Configure data collection and storage settings.');
                break;
            case 'reports':
                Alert.alert('Generate Reports', 'Create and download platform reports.');
                break;
            case 'logs':
                Alert.alert('System Logs', 'View system activity and error logs.');
                break;
            default:
                Alert.alert('Coming Soon', `${sectionId} feature is under development.`);
        }
    };

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout from admin panel?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Logout', style: 'destructive', onPress: onLogout }
            ]
        );
    };

    const handleDeleteAccount = () => {
        Alert.alert(
            'Delete Account',
            'This action cannot be undone. Are you absolutely sure?',
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'Delete', 
                    style: 'destructive', 
                    onPress: () => {
                        Alert.alert('Account Deleted', 'Admin account has been permanently deleted.');
                    }
                }
            ]
        );
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Admin Profile</Text>
                <TouchableOpacity style={styles.settingsButton}>
                    <Ionicons
                        name="settings-outline"
                        size={24}
                        color={COLORS.white}
                    />
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Profile Card */}
                <View style={styles.profileCard}>
                    <View style={styles.avatarContainer}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>{user.name.charAt(0).toUpperCase()}</Text>
                        </View>
                        <View style={styles.adminBadge}>
                            <Ionicons name="shield-checkmark" size={16} color={COLORS.white} />
                            <Text style={styles.adminBadgeText}>ADMIN</Text>
                        </View>
                    </View>
                    <View style={styles.profileInfo}>
                        <Text style={styles.userName}>{user.name}</Text>
                        <Text style={styles.userRole}>Platform Administrator</Text>
                        <Text style={styles.userEmail}>{user.email}</Text>
                        <Text style={styles.joinDate}>Admin since March 2021</Text>
                    </View>
                </View>

                {/* Admin Stats */}
                <View style={styles.statsContainer}>
                    <Text style={styles.sectionTitle}>Admin Statistics</Text>
                    <View style={styles.statsGrid}>
                        {adminStats.map((stat, index) => (
                            <View key={index} style={styles.statCard}>
                                <View style={[styles.statIconContainer, { backgroundColor: `${stat.color}15` }]}>
                                    <Ionicons name={stat.icon as any} size={20} color={stat.color} />
                                </View>
                                <Text style={styles.statValue}>{stat.value}</Text>
                                <Text style={styles.statLabel}>{stat.label}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Quick Settings */}
                <View style={styles.quickSettingsContainer}>
                    <Text style={styles.sectionTitle}>Quick Settings</Text>
                    <View style={styles.settingsCard}>
                        <View style={styles.settingItem}>
                            <View style={styles.settingLeft}>
                                <Ionicons name="notifications-outline" size={20} color={COLORS.gray} />
                                <Text style={styles.settingLabel}>Push Notifications</Text>
                            </View>
                            <Switch
                                value={notificationsEnabled}
                                onValueChange={setNotificationsEnabled}
                                trackColor={{ false: '#e5e7eb', true: `${COLORS.primary}40` }}
                                thumbColor={notificationsEnabled ? COLORS.primary : '#f4f3f4'}
                            />
                        </View>

                        <View style={styles.settingItem}>
                            <View style={styles.settingLeft}>
                                <Ionicons name="checkmark-done-outline" size={20} color={COLORS.gray} />
                                <Text style={styles.settingLabel}>Auto-approve Scientists</Text>
                            </View>
                            <Switch
                                value={autoApprovalEnabled}
                                onValueChange={setAutoApprovalEnabled}
                                trackColor={{ false: '#e5e7eb', true: `${COLORS.primary}40` }}
                                thumbColor={autoApprovalEnabled ? COLORS.primary : '#f4f3f4'}
                            />
                        </View>

                        <View style={styles.settingItem}>
                            <View style={styles.settingLeft}>
                                <Ionicons name="analytics-outline" size={20} color={COLORS.gray} />
                                <Text style={styles.settingLabel}>Advanced Analytics</Text>
                            </View>
                            <Switch
                                value={dataAnalyticsEnabled}
                                onValueChange={setDataAnalyticsEnabled}
                                trackColor={{ false: '#e5e7eb', true: `${COLORS.primary}40` }}
                                thumbColor={dataAnalyticsEnabled ? COLORS.primary : '#f4f3f4'}
                            />
                        </View>

                        <View style={styles.settingItem}>
                            <View style={styles.settingLeft}>
                                <Ionicons name="construct-outline" size={20} color={COLORS.gray} />
                                <Text style={styles.settingLabel}>Maintenance Mode</Text>
                            </View>
                            <Switch
                                value={maintenanceModeEnabled}
                                onValueChange={setMaintenanceModeEnabled}
                                trackColor={{ false: '#e5e7eb', true: '#ef444440' }}
                                thumbColor={maintenanceModeEnabled ? '#ef4444' : '#f4f3f4'}
                            />
                        </View>
                    </View>
                </View>

                {/* Profile Sections */}
                {profileSections.map((section, index) => (
                    <View key={index} style={styles.sectionContainer}>
                        <Text style={styles.sectionTitle}>{section.title}</Text>
                        <View style={styles.sectionCard}>
                            {section.items.map((item, itemIndex) => (
                                <TouchableOpacity
                                    key={item.id}
                                    style={[
                                        styles.sectionItem,
                                        itemIndex === section.items.length - 1 && styles.lastSectionItem
                                    ]}
                                    onPress={() => handleSectionPress(item.id)}
                                >
                                    <View style={styles.sectionLeft}>
                                        <View style={styles.sectionIconContainer}>
                                            <Ionicons
                                                name={item.icon as any}
                                                size={20}
                                                color={COLORS.gray}
                                            />
                                        </View>
                                        <Text style={styles.sectionLabel}>{item.label}</Text>
                                    </View>
                                    {item.hasArrow && (
                                        <Ionicons
                                            name="chevron-forward"
                                            size={16}
                                            color={COLORS.gray}
                                        />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                ))}

                {/* Action Buttons */}
                <View style={styles.actionButtonsContainer}>
                    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                        <Ionicons name="log-out-outline" size={20} color={COLORS.white} />
                        <Text style={styles.logoutButtonText}>Logout</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
                        <Ionicons name="trash-outline" size={20} color={COLORS.white} />
                        <Text style={styles.deleteButtonText}>Delete Account</Text>
                    </TouchableOpacity>
                </View>

                {/* App Info */}
                <View style={styles.appInfoContainer}>
                    <Text style={styles.appVersion}>GetWay Admin v2.1.0</Text>
                    <Text style={styles.buildNumber}>Build 2024.03.15</Text>
                </View>

                <View style={styles.bottomSpacing} />
            </ScrollView>
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
        paddingHorizontal: SIZES.lg,
        paddingTop: 50,
        paddingBottom: SIZES.md,
        backgroundColor: COLORS.primary,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.white,
    },
    settingsButton: {
        // Settings button styles
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 100,
    },
    profileCard: {
        backgroundColor: COLORS.white,
        margin: SIZES.lg,
        borderRadius: 20,
        padding: SIZES.lg,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 6,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: SIZES.md,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    avatarText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: COLORS.white,
    },
    adminBadge: {
        position: 'absolute',
        bottom: -5,
        right: -5,
        backgroundColor: '#10b981',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: COLORS.white,
    },
    adminBadgeText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: COLORS.white,
        marginLeft: 2,
    },
    profileInfo: {
        alignItems: 'center',
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.black,
        marginBottom: 4,
    },
    userRole: {
        fontSize: SIZES.md,
        color: COLORS.primary,
        fontWeight: '600',
        marginBottom: 2,
    },
    userEmail: {
        fontSize: SIZES.sm,
        color: COLORS.gray,
        marginBottom: 2,
    },
    joinDate: {
        fontSize: SIZES.sm,
        color: COLORS.gray,
    },
    statsContainer: {
        paddingHorizontal: SIZES.lg,
        marginBottom: SIZES.lg,
    },
    sectionTitle: {
        fontSize: SIZES.lg,
        fontWeight: 'bold',
        color: COLORS.black,
        marginBottom: SIZES.md,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    statCard: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: SIZES.md,
        alignItems: 'center',
        width: '48%',
        marginBottom: SIZES.sm,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    statIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SIZES.sm,
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.black,
        marginBottom: 2,
    },
    statLabel: {
        fontSize: SIZES.xs,
        color: COLORS.gray,
        textAlign: 'center',
    },
    quickSettingsContainer: {
        paddingHorizontal: SIZES.lg,
        marginBottom: SIZES.lg,
    },
    settingsCard: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: SIZES.md,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    settingItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: SIZES.sm,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    settingLabel: {
        fontSize: SIZES.md,
        color: COLORS.black,
        marginLeft: SIZES.sm,
        fontWeight: '500',
    },
    sectionContainer: {
        paddingHorizontal: SIZES.lg,
        marginBottom: SIZES.lg,
    },
    sectionCard: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    sectionItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SIZES.md,
        paddingVertical: SIZES.sm,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    lastSectionItem: {
        borderBottomWidth: 0,
    },
    sectionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    sectionIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: `${COLORS.primary}10`,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SIZES.sm,
    },
    sectionLabel: {
        fontSize: SIZES.md,
        color: COLORS.black,
        fontWeight: '500',
    },
    actionButtonsContainer: {
        paddingHorizontal: SIZES.lg,
        marginBottom: SIZES.lg,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.primary,
        paddingVertical: SIZES.md,
        borderRadius: 12,
        marginBottom: SIZES.sm,
    },
    logoutButtonText: {
        color: COLORS.white,
        fontSize: SIZES.md,
        fontWeight: 'bold',
        marginLeft: SIZES.xs,
    },
    deleteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ef4444',
        paddingVertical: SIZES.md,
        borderRadius: 12,
    },
    deleteButtonText: {
        color: COLORS.white,
        fontSize: SIZES.md,
        fontWeight: 'bold',
        marginLeft: SIZES.xs,
    },
    appInfoContainer: {
        alignItems: 'center',
        paddingHorizontal: SIZES.lg,
        marginBottom: SIZES.lg,
    },
    appVersion: {
        fontSize: SIZES.sm,
        color: COLORS.gray,
        fontWeight: '500',
    },
    buildNumber: {
        fontSize: SIZES.xs,
        color: COLORS.gray,
        marginTop: 2,
    },
    bottomSpacing: {
        height: 20,
    },
});

export default OwnerProfile;
