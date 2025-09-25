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
    notifications: Notification[];
    onNotificationsUpdate: (notifications: Notification[]) => void;
}

interface Notification {
    id: string;
    title: string;
    message: string;
    time: string;
    isRead: boolean;
    type: 'journey' | 'reward' | 'system' | 'update';
}

const CustomerNotifications: React.FC<CustomerNotificationsProps> = ({ onBack, notifications, onNotificationsUpdate }) => {
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
        // Mark the notification as read if it's unread
        if (!notification.isRead) {
            const updatedNotifications = notifications.map(n =>
                n.id === notification.id ? { ...n, isRead: true } : n
            );
            onNotificationsUpdate(updatedNotifications);
        }

        // Show the notification details
        Alert.alert(
            notification.title,
            notification.message,
            [{ text: 'OK', style: 'default' }]
        );
    };

    const markAllAsRead = () => {
        const unreadCount = notifications.filter(n => !n.isRead).length;
        
        if (unreadCount === 0) {
            Alert.alert(
                'All Notifications Read',
                'All notifications are already marked as read.',
                [{ text: 'OK', style: 'default' }]
            );
            return;
        }

        Alert.alert(
            'Mark All as Read',
            `Are you sure you want to mark all ${unreadCount} unread notifications as read?`,
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'Yes', 
                    style: 'default',
                    onPress: () => {
                        const updatedNotifications = notifications.map(notification => ({
                            ...notification,
                            isRead: true
                        }));
                        onNotificationsUpdate(updatedNotifications);
                        
                        // Show success feedback
                        Alert.alert(
                            'Success',
                            'All notifications have been marked as read.',
                            [{ text: 'OK', style: 'default' }]
                        );
                    }
                }
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
                <TouchableOpacity 
                    onPress={markAllAsRead} 
                    style={[
                        styles.markReadButton,
                        notifications.filter(n => !n.isRead).length === 0 && styles.disabledButton
                    ]}
                    disabled={notifications.filter(n => !n.isRead).length === 0}
                >
                    <Text style={[
                        styles.markReadText,
                        notifications.filter(n => !n.isRead).length === 0 && styles.disabledButtonText
                    ]}>
                        Mark All Read
                        {notifications.filter(n => !n.isRead).length > 0 && 
                            ` (${notifications.filter(n => !n.isRead).length})`
                        }
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Notifications List */}
            <ScrollView style={styles.notificationsList} showsVerticalScrollIndicator={false}>
                {/* Notifications Summary */}
                {notifications.length > 0 && (
                    <View style={styles.summaryContainer}>
                        <Text style={styles.summaryText}>
                            {notifications.filter(n => !n.isRead).length > 0
                                ? `${notifications.filter(n => !n.isRead).length} unread of ${notifications.length} total`
                                : `All ${notifications.length} notifications read`
                            }
                        </Text>
                    </View>
                )}

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
    disabledButton: {
        backgroundColor: COLORS.background,
        opacity: 0.6,
    },
    disabledButtonText: {
        color: COLORS.textQuaternary,
    },
    notificationsList: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 16,
    },
    summaryContainer: {
        backgroundColor: COLORS.white,
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: COLORS.lightGray,
    },
    summaryText: {
        fontSize: SIZES.body,
        fontFamily: FONTS.medium,
        color: COLORS.textSecondary,
        textAlign: 'center',
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
