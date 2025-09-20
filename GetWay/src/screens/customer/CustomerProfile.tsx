import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS } from '../../constants';
import { User } from '../../types';

interface CustomerProfileProps {
    user: User;
    onLogout: () => void;
}

const CustomerProfile: React.FC<CustomerProfileProps> = ({
    user,
    onLogout
}) => {
    const handleEditProfile = () => {
        // TODO: Navigate to edit profile
        alert('Edit profile - Coming soon!');
    };

    const handleRefresh = () => {
        // TODO: Refresh profile data
        alert('Refresh - Coming soon!');
    };

    const profileStats = [
        { label: 'Trips Completed', value: '127', icon: 'checkmark-circle', color: '#10b981' },
        { label: 'Points Earned', value: '2,450', icon: 'trophy', color: '#f59e0b' },
        { label: 'Carbon Saved', value: '15.2kg', icon: 'leaf', color: '#22c55e' },
    ];

    const profileSections = [
        { id: 'personal', label: 'Personal Info', icon: 'person-outline' },
        { id: 'preferences', label: 'Travel Preferences', icon: 'settings-outline' },
        { id: 'privacy', label: 'Privacy Settings', icon: 'shield-outline' },
        { id: 'help', label: 'Help & Support', icon: 'help-circle-outline' },
        { id: 'about', label: 'About App', icon: 'information-circle-outline' },
    ];

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>My Profile</Text>
                <TouchableOpacity style={styles.settingsButton}>
                    <Ionicons
                        name="settings-outline"
                        size={SIZES.subheading + 2} // 18px
                        color={COLORS.textSecondary}
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
                        <View style={styles.onlineIndicator} />
                    </View>
                    <View style={styles.profileInfo}>
                        <Text style={styles.userName}>{user.name}</Text>
                        <Text style={styles.userType}>Travel Data Contributor</Text>
                        <Text style={styles.userLocation}>📍 Mumbai, Maharashtra</Text>
                    </View>
                </View>

                {/* Stats Cards */}
                <View style={styles.statsContainer}>
                    {profileStats.map((stat, index) => (
                        <View key={index} style={styles.statCard}>
                            <View style={[styles.statIconContainer, { backgroundColor: `${stat.color}15` }]}>
                                <Ionicons name={stat.icon as any} size={18} color={stat.color} />
                            </View>
                            <Text style={styles.statValue}>{stat.value}</Text>
                            <Text style={styles.statLabel}>{stat.label}</Text>
                        </View>
                    ))}
                </View>

                {/* Profile Sections */}
                <View style={styles.sectionsContainer}>
                    {profileSections.map((section) => (
                        <TouchableOpacity key={section.id} style={styles.sectionItem}>
                            <View style={styles.sectionLeft}>
                                <View style={styles.sectionIconContainer}>
                                    <Ionicons
                                        name={section.icon as any}
                                        size={20}
                                        color={COLORS.textSecondary}
                                    />
                                </View>
                                <Text style={styles.sectionLabel}>{section.label}</Text>
                            </View>
                            <Ionicons
                                name="chevron-forward"
                                size={16}
                                color={COLORS.textDisabled}
                            />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Logout Section */}
                <View style={styles.logoutContainer}>
                    <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
                        <Ionicons name="log-out-outline" size={20} color="#ef4444" />
                        <Text style={styles.logoutText}>Sign Out</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa', // Match CustomerTripLogs background
    },
    scrollContent: {
        paddingBottom: 120, // Extra padding to ensure content is above bottom navbar
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 24,
        backgroundColor: 'transparent',
    },
    title: {
        fontSize: SIZES.heading, // 20 - Match trip logs title size
        fontFamily: FONTS.bold,
        color: COLORS.textPrimary, // Use hierarchy colors
        marginBottom: 4,
    },
    settingsButton: {
        width: 35,
        height: 35,
        borderRadius: 12,
        backgroundColor: '#ffffff',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#00000062',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        marginTop: 4,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    profileCard: {
        flexDirection: 'row',
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        alignItems: 'center',
        shadowColor: '#00000062',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    avatarContainer: {
        marginRight: 16,
        position: 'relative',
    },
    avatar: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontSize: SIZES.heading + 4, // 24
        fontFamily: FONTS.bold,
        color: '#ffffff',
    },
    onlineIndicator: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#22c55e',
        borderWidth: 2,
        borderColor: '#ffffff',
    },
    profileInfo: {
        flex: 1,
    },
    userName: {
        fontSize: SIZES.subheading + 2, // 18
        fontFamily: FONTS.bold,
        color: COLORS.textPrimary,
        marginBottom: 4,
    },
    userType: {
        fontSize: SIZES.body, // 14
        fontFamily: FONTS.medium,
        color: COLORS.textSecondary,
        marginBottom: 2,
    },
    userLocation: {
        fontSize: SIZES.caption, // 12
        fontFamily: FONTS.regular,
        color: COLORS.textTertiary,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    statCard: {
        backgroundColor: '#ffffff',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        flex: 1,
        marginHorizontal: 6,
        minHeight: 100,
        justifyContent: 'center',
        shadowColor: '#00000062',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    statIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    statValue: {
        fontSize: SIZES.subheading, // 16
        fontFamily: FONTS.bold,
        color: COLORS.textPrimary,
        marginBottom: 3,
    },
    statLabel: {
        fontSize: 11,
        fontFamily: FONTS.medium,
        color: COLORS.textTertiary,
        textAlign: 'center',
        lineHeight: 14,
    },
    sectionsContainer: {
        marginBottom: 24,
    },
    sectionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#ffffff',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#00000062',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    sectionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    sectionIconContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(162, 142, 249, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    sectionLabel: {
        fontSize: SIZES.body, // 14
        fontFamily: FONTS.medium,
        color: COLORS.textSecondary,
    },
    logoutContainer: {
        marginBottom: 24,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ffffff',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#fee2e2',
        shadowColor: '#00000062',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    logoutText: {
        fontSize: SIZES.body, // 14
        fontFamily: FONTS.semiBold,
        color: '#ef4444',
        marginLeft: 8,
    },
});

export default CustomerProfile;