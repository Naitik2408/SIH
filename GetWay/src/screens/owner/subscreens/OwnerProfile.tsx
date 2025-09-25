import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS } from '../../../constants';
import { User } from '../../../types';
import { ownerAPI } from '../../../services/api';

interface OwnerProfileProps {
    user: User;
    onLogout: () => void;
}

const OwnerProfile: React.FC<OwnerProfileProps> = ({ user, onLogout }) => {
    const [activeScientists, setActiveScientists] = useState(0);
    const [loading, setLoading] = useState(true);

    // Fetch real admin data from backend
    useEffect(() => {
        const fetchAdminData = async () => {
            try {
                const response = await ownerAPI.getAllScientists();
                
                // Count active scientists only
                const activeCount = response.scientists.filter(
                    scientist => scientist.isActive && scientist.isApproved
                ).length;
                
                setActiveScientists(activeCount);
            } catch (error) {
                console.error('Error fetching admin data:', error);
                setActiveScientists(0); // Default to 0 on error
            } finally {
                setLoading(false);
            }
        };

        fetchAdminData();
    }, []);

    // Handle section navigation
    const handleSectionPress = (sectionId: string) => {
        switch (sectionId) {
            case 'personal':
                Alert.alert(
                    'Personal Information',
                    'Personal Information Settings:\n\n• Edit admin profile details\n• Update contact information\n• Change profile picture\n• Update admin credentials\n• Set display preferences\n\nKeep your admin profile up to date for better system management.',
                    [{ text: 'OK' }]
                );
                break;
            case 'security':
                Alert.alert(
                    'Security Settings',
                    'Admin Security Management:\n\n🔒 Two-Factor Authentication\n🔑 Password Management\n🛡️ Login Activity Monitoring\n📱 Device Management\n⚠️ Security Alerts\n\n🚨 Admin Security Features:\n• Enhanced encryption\n• IP whitelisting\n• Session management\n• Audit logs\n\nYour admin account has enhanced security protocols.',
                    [{ text: 'OK' }]
                );
                break;
            case 'privacy':
                Alert.alert(
                    'Privacy Settings',
                    'Admin Privacy Controls:\n\n• Data Access Permissions\n• Scientist Data Handling\n• System Logs Privacy\n• Analytics Data Usage\n• Admin Activity Tracking\n\n🔐 Admin Privacy Features:\n• Encrypted communications\n• Secure data storage\n• Privacy-compliant operations\n• GDPR compliance tools\n\nManage how admin data is collected and used.',
                    [{ text: 'OK' }]
                );
                break;
            case 'help':
                Alert.alert(
                    'Admin Help & Support',
                    'Admin Support Resources:\n\n📧 Admin Support: admin@getway.app\n📞 Priority Line: +91 9876543210\n🕒 24/7 Admin Support Available\n\n📖 Admin Resources:\n• Admin documentation\n• System management guides\n• API documentation\n• Troubleshooting guides\n• Video tutorials\n\n🚀 Training Resources:\n• Admin best practices\n• Security protocols\n• Data management\n• User support guidelines',
                    [
                        { text: 'OK' },
                        { text: 'Contact Admin Support', onPress: () => alert('Opening admin support...') }
                    ]
                );
                break;
            case 'about':
                Alert.alert(
                    'About GetWay Admin',
                    'GetWay Admin Panel v2.1.0\n\n🏢 Administrative Control Center\n\nPowerful admin tools for managing the GetWay platform and scientist community.\n\n👨‍💼 Admin Features:\n• Scientist approval system\n• Data management tools\n• Analytics dashboard\n• System monitoring\n• User support tools\n\n🛠️ Admin Capabilities:\n• Real-time system status\n• Advanced reporting\n• Bulk operations\n• Security management\n\n© 2024 GetWay Admin. Enterprise Edition.',
                    [{ text: 'OK' }]
                );
                break;
            default:
                break;
        }
    };

    // Updated admin stats with real backend data
    const adminStats = [
        { 
            label: 'Active Scientists', 
            value: loading ? '...' : activeScientists.toString(), 
            icon: 'people', 
            color: '#10b981' 
        },
    ];

    // Simplified profile sections matching CustomerProfile style
    const profileSections = [
        { id: 'personal', label: 'Personal Information', icon: 'person-outline' },
        { id: 'security', label: 'Security Settings', icon: 'shield-outline' },
        { id: 'privacy', label: 'Privacy Settings', icon: 'lock-closed-outline' },
        { id: 'help', label: 'Help & Support', icon: 'help-circle-outline' },
        { id: 'about', label: 'About Admin Panel', icon: 'information-circle-outline' },
    ];

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

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Admin Profile</Text>
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
                            <Ionicons name="shield-checkmark" size={12} color={COLORS.white} />
                            <Text style={styles.adminBadgeText}>ADMIN</Text>
                        </View>
                    </View>
                    <View style={styles.profileInfo}>
                        <Text style={styles.userName}>{user.name}</Text>
                        <Text style={styles.userType}>Platform Administrator</Text>
                        <Text style={styles.userLocation}>📍 System Admin</Text>
                    </View>
                </View>

                {/* Admin Stats */}
                <View style={styles.statsContainer}>
                    {adminStats.map((stat, index) => (
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
                        <TouchableOpacity 
                            key={section.id} 
                            style={styles.sectionItem}
                            onPress={() => handleSectionPress(section.id)}
                        >
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
                    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
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
        backgroundColor: '#f8f9fa', // Match CustomerProfile background
    },
    scrollContent: {
        paddingBottom: 120, // Extra padding to ensure content is above bottom navbar
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 24,
        backgroundColor: 'transparent',
    },
    title: {
        fontSize: SIZES.heading, // 20 - Match customer profile title size
        fontFamily: FONTS.bold,
        color: COLORS.textPrimary,
        marginBottom: 4,
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
    adminBadge: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        backgroundColor: '#10b981',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#ffffff',
    },
    adminBadgeText: {
        fontSize: 8,
        fontFamily: FONTS.bold,
        color: '#ffffff',
        marginLeft: 2,
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

export default OwnerProfile;
