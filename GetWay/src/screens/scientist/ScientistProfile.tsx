import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Switch,
    Alert,
} from 'react-native';
import { COLORS, SIZES, FONTS } from '../../constants';

interface ScientistProfileProps {
    user: any;
    onLogout: () => void;
}

const ScientistProfile: React.FC<ScientistProfileProps> = ({ user, onLogout }) => {
    const [notifications, setNotifications] = useState(true);
    const [dataSharing, setDataSharing] = useState(true);
    const [autoExport, setAutoExport] = useState(false);

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Logout', style: 'destructive', onPress: onLogout },
            ]
        );
    };

    const profileStats = [
        { label: 'Reports Created', value: '47' },
        { label: 'Data Points Analyzed', value: '124K' },
        { label: 'Insights Generated', value: '89' },
        { label: 'Days Active', value: '156' },
    ];

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Profile & Settings</Text>
            </View>

            <ScrollView
                style={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* User Info Card */}
                <View style={styles.userCard}>
                    <View style={styles.avatarContainer}>
                        <Text style={styles.avatarText}>
                            {(user?.name || 'S').charAt(0).toUpperCase()}
                        </Text>
                    </View>
                    <View style={styles.userInfo}>
                        <Text style={styles.userName}>{user?.name || 'Research Scientist'}</Text>
                        <Text style={styles.userEmail}>{user?.email || 'scientist@research.gov'}</Text>
                        <Text style={styles.userRole}>Transportation Data Scientist</Text>
                    </View>
                    <TouchableOpacity style={styles.editButton}>
                        <Text style={styles.editButtonText}>Edit</Text>
                    </TouchableOpacity>
                </View>

                {/* Stats Grid */}
                <View style={styles.statsContainer}>
                    <Text style={styles.sectionTitle}>Research Statistics</Text>
                    <View style={styles.statsGrid}>
                        {profileStats.map((stat, index) => (
                            <View key={index} style={styles.statCard}>
                                <Text style={styles.statValue}>{stat.value}</Text>
                                <Text style={styles.statLabel}>{stat.label}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Settings Section */}
                <View style={styles.settingsContainer}>
                    <Text style={styles.sectionTitle}>Preferences</Text>

                    <View style={styles.settingItem}>
                        <View style={styles.settingInfo}>
                            <Text style={styles.settingTitle}>Email Notifications</Text>
                            <Text style={styles.settingDescription}>Receive updates about new data</Text>
                        </View>
                        <Switch
                            value={notifications}
                            onValueChange={setNotifications}
                            trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
                            thumbColor={notifications ? COLORS.white : COLORS.gray}
                        />
                    </View>

                    <View style={styles.settingItem}>
                        <View style={styles.settingInfo}>
                            <Text style={styles.settingTitle}>Data Sharing</Text>
                            <Text style={styles.settingDescription}>Share insights with research community</Text>
                        </View>
                        <Switch
                            value={dataSharing}
                            onValueChange={setDataSharing}
                            trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
                            thumbColor={dataSharing ? COLORS.white : COLORS.gray}
                        />
                    </View>

                    <View style={styles.settingItem}>
                        <View style={styles.settingInfo}>
                            <Text style={styles.settingTitle}>Auto Export</Text>
                            <Text style={styles.settingDescription}>Automatically export weekly reports</Text>
                        </View>
                        <Switch
                            value={autoExport}
                            onValueChange={setAutoExport}
                            trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
                            thumbColor={autoExport ? COLORS.white : COLORS.gray}
                        />
                    </View>
                </View>

                {/* Research Tools */}
                <View style={styles.toolsContainer}>
                    <Text style={styles.sectionTitle}>Research Tools</Text>

                    <TouchableOpacity style={styles.toolItem}>
                        <Text style={styles.toolIcon}>📊</Text>
                        <View style={styles.toolInfo}>
                            <Text style={styles.toolTitle}>Data Export Center</Text>
                            <Text style={styles.toolDescription}>Download datasets in various formats</Text>
                        </View>
                        <Text style={styles.toolArrow}>→</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.toolItem}>
                        <Text style={styles.toolIcon}>🔗</Text>
                        <View style={styles.toolInfo}>
                            <Text style={styles.toolTitle}>API Access</Text>
                            <Text style={styles.toolDescription}>Generate API keys for data access</Text>
                        </View>
                        <Text style={styles.toolArrow}>→</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.toolItem}>
                        <Text style={styles.toolIcon}>📚</Text>
                        <View style={styles.toolInfo}>
                            <Text style={styles.toolTitle}>Research Documentation</Text>
                            <Text style={styles.toolDescription}>Access methodology and data guides</Text>
                        </View>
                        <Text style={styles.toolArrow}>→</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.toolItem}>
                        <Text style={styles.toolIcon}>🤝</Text>
                        <View style={styles.toolInfo}>
                            <Text style={styles.toolTitle}>Collaboration Hub</Text>
                            <Text style={styles.toolDescription}>Connect with other researchers</Text>
                        </View>
                        <Text style={styles.toolArrow}>→</Text>
                    </TouchableOpacity>
                </View>

                {/* Account Actions */}
                <View style={styles.actionsContainer}>
                    <TouchableOpacity style={styles.actionButton}>
                        <Text style={styles.actionIcon}>🔒</Text>
                        <Text style={styles.actionText}>Change Password</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionButton}>
                        <Text style={styles.actionIcon}>📱</Text>
                        <Text style={styles.actionText}>Manage Devices</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionButton}>
                        <Text style={styles.actionIcon}>❓</Text>
                        <Text style={styles.actionText}>Help & Support</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionButton, styles.logoutButton]}
                        onPress={handleLogout}
                    >
                        <Text style={styles.actionIcon}>🚪</Text>
                        <Text style={[styles.actionText, styles.logoutText]}>Logout</Text>
                    </TouchableOpacity>
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

    scrollContainer: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: SIZES.xl,
    },

    // User Card
    userCard: {
        backgroundColor: COLORS.white,
        margin: SIZES.xl,
        padding: SIZES.lg,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    avatarContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SIZES.md,
    },
    avatarText: {
        fontSize: 24,
        fontFamily: FONTS.bold,
        color: COLORS.white,
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: SIZES.body,
        fontFamily: FONTS.semiBold,
        color: COLORS.textPrimary,
        marginBottom: SIZES.xs,
    },
    userEmail: {
        fontSize: SIZES.caption,
        fontFamily: FONTS.regular,
        color: COLORS.textTertiary,
        marginBottom: SIZES.xs,
    },
    userRole: {
        fontSize: SIZES.small,
        fontFamily: FONTS.medium,
        color: COLORS.primary,
    },
    editButton: {
        backgroundColor: COLORS.lightGray,
        paddingHorizontal: SIZES.md,
        paddingVertical: SIZES.sm,
        borderRadius: 8,
    },
    editButtonText: {
        fontSize: SIZES.caption,
        fontFamily: FONTS.medium,
        color: COLORS.textSecondary,
    },

    // Stats
    statsContainer: {
        paddingHorizontal: SIZES.xl,
        marginBottom: SIZES.lg,
    },
    sectionTitle: {
        fontSize: SIZES.subheading,
        fontFamily: FONTS.semiBold,
        color: COLORS.textPrimary,
        marginBottom: SIZES.md,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    statCard: {
        backgroundColor: COLORS.white,
        padding: SIZES.md,
        borderRadius: 12,
        alignItems: 'center',
        width: '48%',
        marginBottom: SIZES.sm,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
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
        textAlign: 'center',
    },

    // Settings
    settingsContainer: {
        backgroundColor: COLORS.white,
        marginHorizontal: SIZES.xl,
        marginBottom: SIZES.lg,
        borderRadius: 16,
        padding: SIZES.lg,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SIZES.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.lightGray,
    },
    settingInfo: {
        flex: 1,
        marginRight: SIZES.md,
    },
    settingTitle: {
        fontSize: SIZES.body,
        fontFamily: FONTS.medium,
        color: COLORS.textPrimary,
        marginBottom: SIZES.xs,
    },
    settingDescription: {
        fontSize: SIZES.caption,
        fontFamily: FONTS.regular,
        color: COLORS.textTertiary,
    },

    // Tools
    toolsContainer: {
        backgroundColor: COLORS.white,
        marginHorizontal: SIZES.xl,
        marginBottom: SIZES.lg,
        borderRadius: 16,
        padding: SIZES.lg,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    toolItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SIZES.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.lightGray,
    },
    toolIcon: {
        fontSize: 24,
        marginRight: SIZES.md,
        width: 32,
        textAlign: 'center',
    },
    toolInfo: {
        flex: 1,
    },
    toolTitle: {
        fontSize: SIZES.body,
        fontFamily: FONTS.medium,
        color: COLORS.textPrimary,
        marginBottom: SIZES.xs,
    },
    toolDescription: {
        fontSize: SIZES.caption,
        fontFamily: FONTS.regular,
        color: COLORS.textTertiary,
    },
    toolArrow: {
        fontSize: 16,
        color: COLORS.textQuaternary,
    },

    // Actions
    actionsContainer: {
        paddingHorizontal: SIZES.xl,
        marginBottom: SIZES.lg,
    },
    actionButton: {
        backgroundColor: COLORS.white,
        flexDirection: 'row',
        alignItems: 'center',
        padding: SIZES.lg,
        borderRadius: 12,
        marginBottom: SIZES.sm,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    logoutButton: {
        borderWidth: 1,
        borderColor: COLORS.error,
    },
    actionIcon: {
        fontSize: 20,
        marginRight: SIZES.md,
        width: 24,
        textAlign: 'center',
    },
    actionText: {
        fontSize: SIZES.body,
        fontFamily: FONTS.medium,
        color: COLORS.textPrimary,
    },
    logoutText: {
        color: COLORS.error,
    },
});

export default ScientistProfile;
