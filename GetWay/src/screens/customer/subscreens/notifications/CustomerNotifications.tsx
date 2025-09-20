import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS } from '../../../../constants';

interface CustomerNotificationsProps {
    onBack: () => void;
}

interface Notification {
    id: string;
    title: string;
    message: string;
    time: string;
    isRead: boolean;
    type: 'journey' | 'reward' | 'system' | 'update';
}

const CustomerNotifications: React.FC<CustomerNotificationsProps> = ({ onBack }) => {
    // Sample notifications data
    const notifications: Notification[] = [
        {
            id: '1',
            title: 'Journey Completed!',
            message: 'Your trip from Delhi to Mumbai has been successfully logged. You earned 50 GovCoins!',
            time: '2 hours ago',
            isRead: false,
            type: 'journey'
        },
        {
            id: '2',
            title: 'Monthly Check-in Available',
            message: 'Complete your monthly travel survey to earn bonus rewards.',
            time: '1 day ago',
            isRead: false,
            type: 'reward'
        },
        {
            id: '3',
            title: 'Welcome to GetWay!',
            message: 'Thank you for joining GetWay. Start logging your journeys to earn rewards.',
            time: '3 days ago',
            isRead: true,
            type: 'system'
        },
        {
            id: '4',
            title: 'App Update Available',
            message: 'New features and improvements are available. Update now for the best experience.',
            time: '1 week ago',
            isRead: true,
            type: 'update'
        }
    ];

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'journey':
                return 'location-outline';
            case 'reward':
                return 'gift-outline';
            case 'system':
                return 'information-circle-outline';
            case 'update':
                return 'download-outline';
            default:
                return 'notifications-outline';
        }
    };

    const getNotificationColor = (type: string) => {
        switch (type) {
            case 'journey':
                return COLORS.primary;
            case 'reward':
                return COLORS.secondary;
            case 'system':
                return COLORS.accent;
            case 'update':
                return COLORS.textSecondary;
            default:
                return COLORS.textTertiary;
        }
    };

    const handleNotificationPress = (notification: Notification) => {
        Alert.alert(
            notification.title,
            notification.message,
            [{ text: 'OK', style: 'default' }]
        );
    };

    const markAllAsRead = () => {
        Alert.alert(
            'Mark All as Read',
            'Are you sure you want to mark all notifications as read?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Yes', style: 'default' }
            ]
        );
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <Ionicons 
                        name="arrow-back" 
                        size={SIZES.heading} 
                        color={COLORS.textPrimary} 
                    />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Notifications</Text>
                <TouchableOpacity onPress={markAllAsRead} style={styles.markReadButton}>
                    <Text style={styles.markReadText}>Mark All Read</Text>
                </TouchableOpacity>
            </View>

            {/* Notifications List */}
            <ScrollView style={styles.notificationsList} showsVerticalScrollIndicator={false}>
                {notifications.map((notification) => (
                    <TouchableOpacity
                        key={notification.id}
                        style={[
                            styles.notificationItem,
                            !notification.isRead && styles.unreadNotification
                        ]}
                        onPress={() => handleNotificationPress(notification)}
                    >
                        <View style={styles.notificationContent}>
                            <View style={styles.notificationHeader}>
                                <View style={styles.iconContainer}>
                                    <Ionicons
                                        name={getNotificationIcon(notification.type)}
                                        size={SIZES.subheading}
                                        color={getNotificationColor(notification.type)}
                                    />
                                </View>
                                <View style={styles.textContainer}>
                                    <Text style={[
                                        styles.notificationTitle,
                                        !notification.isRead && styles.unreadTitle
                                    ]}>
                                        {notification.title}
                                    </Text>
                                    <Text style={styles.notificationTime}>
                                        {notification.time}
                                    </Text>
                                </View>
                                {!notification.isRead && (
                                    <View style={styles.unreadDot} />
                                )}
                            </View>
                            <Text style={styles.notificationMessage}>
                                {notification.message}
                            </Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Empty State */}
            {notifications.length === 0 && (
                <View style={styles.emptyState}>
                    <Ionicons 
                        name="notifications-off-outline" 
                        size={48} 
                        color={COLORS.textQuaternary} 
                    />
                    <Text style={styles.emptyStateText}>No notifications yet</Text>
                    <Text style={styles.emptyStateSubtext}>
                        You'll see your journey updates and rewards here
                    </Text>
                </View>
            )}
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
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.lightGray,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: SIZES.heading,
        fontFamily: FONTS.bold,
        color: COLORS.textPrimary,
        flex: 1,
        textAlign: 'center',
        marginHorizontal: 20,
    },
    markReadButton: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: COLORS.lightGray,
    },
    markReadText: {
        fontSize: SIZES.caption,
        fontFamily: FONTS.medium,
        color: COLORS.textSecondary,
    },
    notificationsList: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 16,
    },
    notificationItem: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        marginBottom: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    unreadNotification: {
        borderLeftWidth: 3,
        borderLeftColor: COLORS.primary,
    },
    notificationContent: {
        flex: 1,
    },
    notificationHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    iconContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: COLORS.lightGray,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    textContainer: {
        flex: 1,
    },
    notificationTitle: {
        fontSize: SIZES.body,
        fontFamily: FONTS.semiBold,
        color: COLORS.textSecondary,
        marginBottom: 2,
    },
    unreadTitle: {
        color: COLORS.textPrimary,
        fontFamily: FONTS.bold,
    },
    notificationTime: {
        fontSize: SIZES.caption,
        fontFamily: FONTS.regular,
        color: COLORS.textQuaternary,
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.primary,
        marginLeft: 8,
        marginTop: 4,
    },
    notificationMessage: {
        fontSize: SIZES.body,
        fontFamily: FONTS.regular,
        color: COLORS.textTertiary,
        lineHeight: 20,
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 40,
    },
    emptyStateText: {
        fontSize: SIZES.subheading,
        fontFamily: FONTS.semiBold,
        color: COLORS.textSecondary,
        marginTop: 16,
        marginBottom: 8,
    },
    emptyStateSubtext: {
        fontSize: SIZES.body,
        fontFamily: FONTS.regular,
        color: COLORS.textQuaternary,
        textAlign: 'center',
        lineHeight: 20,
    },
});

export default CustomerNotifications;
