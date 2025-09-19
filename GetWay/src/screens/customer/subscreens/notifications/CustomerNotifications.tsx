import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS } from '../../../../constants';

interface Notification {
    id: string;
    title: string;
    description: string;
    type: 'reward' | 'journey' | 'system' | 'promotion';
    timestamp: string;
    isRead: boolean;
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
}

interface CustomerNotificationsProps {
    onBack?: () => void;
}

const mockNotifications: Notification[] = [
    {
        id: '1',
        title: 'Journey Completed!',
        description: 'Your 45-minute trip from Central Station to Business District has been logged. You earned 25 points!',
        type: 'journey',
        timestamp: '2 hours ago',
        isRead: false,
        icon: 'checkmark-circle',
        color: '#10b981'
    },
    {
        id: '2',
        title: 'Reward Unlocked!',
        description: 'Congratulations! You can now get 15% off on your next train booking with your earned points.',
        type: 'reward',
        timestamp: '5 hours ago',
        isRead: false,
        icon: 'gift',
        color: '#f59e0b'
    },
    {
        id: '3',
        title: 'Route Optimization Available',
        description: 'We found a faster route for your daily commute that could save you 12 minutes. Check it out!',
        type: 'system',
        timestamp: '1 day ago',
        isRead: true,
        icon: 'trending-up',
        color: '#3b82f6'
    },
    {
        id: '4',
        title: 'Weekly Challenge',
        description: 'Complete 5 more trips this week to unlock exclusive rewards and double points!',
        type: 'promotion',
        timestamp: '1 day ago',
        isRead: true,
        icon: 'trophy',
        color: '#ef4444'
    },
    {
        id: '5',
        title: 'Trip Analysis Ready',
        description: 'Your monthly travel report is ready. View insights about your commute patterns and savings.',
        type: 'system',
        timestamp: '2 days ago',
        isRead: true,
        icon: 'analytics',
        color: '#8b5cf6'
    },
    {
        id: '6',
        title: 'Government Service Update',
        description: 'Fast-track passport renewal is now available for premium members. Apply with your points!',
        type: 'promotion',
        timestamp: '3 days ago',
        isRead: true,
        icon: 'document-text',
        color: '#06b6d4'
    },
    {
        id: '7',
        title: 'Points Milestone',
        description: 'Amazing! You\'ve reached 500 points. Unlock premium benefits and exclusive offers.',
        type: 'reward',
        timestamp: '1 week ago',
        isRead: true,
        icon: 'star',
        color: '#f59e0b'
    }
];

const CustomerNotifications: React.FC<CustomerNotificationsProps> = ({ onBack }) => {
    const [notifications, setNotifications] = React.useState<Notification[]>(mockNotifications);
    const [filter, setFilter] = React.useState<'all' | 'unread'>('all');

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const filteredNotifications = filter === 'all'
        ? notifications
        : notifications.filter(n => !n.isRead);

    const markAsRead = (id: string) => {
        setNotifications(prev =>
            prev.map(notification =>
                notification.id === id
                    ? { ...notification, isRead: true }
                    : notification
            )
        );
    };

    const markAllAsRead = () => {
        setNotifications(prev =>
            prev.map(notification => ({ ...notification, isRead: true }))
        );
    };

    const getTypeLabel = (type: Notification['type']) => {
        switch (type) {
            case 'reward': return 'Reward';
            case 'journey': return 'Journey';
            case 'system': return 'System';
            case 'promotion': return 'Offer';
            default: return 'Info';
        }
    };

    const renderNotification = (notification: Notification) => (
        <TouchableOpacity
            key={notification.id}
            style={[
                styles.notificationCard,
                !notification.isRead && styles.unreadCard
            ]}
            onPress={() => markAsRead(notification.id)}
            activeOpacity={0.7}
        >
            <View style={styles.notificationContent}>
                <View style={styles.notificationHeader}>
                    <View style={[
                        styles.iconContainer,
                        { backgroundColor: `${notification.color}15` }
                    ]}>
                        <Ionicons
                            name={notification.icon}
                            size={20}
                            color={notification.color}
                        />
                    </View>
                    <View style={styles.headerText}>
                        <View style={styles.titleRow}>
                            <Text style={[
                                styles.notificationTitle,
                                !notification.isRead && styles.unreadTitle
                            ]}>
                                {notification.title}
                            </Text>
                            {!notification.isRead && <View style={styles.unreadDot} />}
                        </View>
                        <View style={styles.metaRow}>
                            <Text style={[
                                styles.typeLabel,
                                { color: notification.color }
                            ]}>
                                {getTypeLabel(notification.type)}
                            </Text>
                            <Text style={styles.timestamp}>
                                {notification.timestamp}
                            </Text>
                        </View>
                    </View>
                </View>
                <Text style={styles.notificationDescription}>
                    {notification.description}
                </Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={onBack}
                >
                    <Ionicons
                        name="arrow-back"
                        size={24}
                        color={COLORS.textPrimary}
                    />
                </TouchableOpacity>
                <View style={styles.headerContent}>
                    <Text style={styles.headerTitle}>Notifications</Text>
                    {unreadCount > 0 && (
                        <View style={styles.unreadBadge}>
                            <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
                        </View>
                    )}
                </View>
                {unreadCount > 0 && (
                    <TouchableOpacity
                        style={styles.markAllButton}
                        onPress={markAllAsRead}
                    >
                        <Text style={styles.markAllText}>Mark all</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Filter Tabs */}
            <View style={styles.filterContainer}>
                <TouchableOpacity
                    style={[
                        styles.filterTab,
                        filter === 'all' && styles.activeFilterTab
                    ]}
                    onPress={() => setFilter('all')}
                >
                    <Text style={[
                        styles.filterText,
                        filter === 'all' && styles.activeFilterText
                    ]}>
                        All ({notifications.length})
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.filterTab,
                        filter === 'unread' && styles.activeFilterTab
                    ]}
                    onPress={() => setFilter('unread')}
                >
                    <Text style={[
                        styles.filterText,
                        filter === 'unread' && styles.activeFilterText
                    ]}>
                        Unread ({unreadCount})
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Notifications List */}
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {filteredNotifications.length > 0 ? (
                    <View style={styles.notificationsList}>
                        {filteredNotifications.map(renderNotification)}
                    </View>
                ) : (
                    <View style={styles.emptyState}>
                        <Ionicons
                            name="notifications-off-outline"
                            size={64}
                            color={COLORS.textDisabled}
                        />
                        <Text style={styles.emptyTitle}>No notifications</Text>
                        <Text style={styles.emptyDescription}>
                            {filter === 'unread'
                                ? "You're all caught up! No unread notifications."
                                : "You don't have any notifications yet."
                            }
                        </Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 16,
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0, 0, 0, 0.05)',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        marginRight: 12,
    },
    headerContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: SIZES.heading,
        fontFamily: FONTS.bold,
        color: COLORS.textPrimary,
        marginRight: 8,
    },
    unreadBadge: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
        minWidth: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    unreadBadgeText: {
        fontSize: SIZES.caption,
        fontFamily: FONTS.bold,
        color: '#ffffff',
    },
    markAllButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: COLORS.primary,
    },
    markAllText: {
        fontSize: SIZES.body,
        fontFamily: FONTS.semiBold,
        color: '#ffffff',
    },
    filterContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0, 0, 0, 0.05)',
        gap: 12,
    },
    filterTab: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
    },
    activeFilterTab: {
        backgroundColor: COLORS.primary,
    },
    filterText: {
        fontSize: SIZES.body,
        fontFamily: FONTS.medium,
        color: COLORS.textSecondary,
    },
    activeFilterText: {
        color: '#ffffff',
        fontFamily: FONTS.semiBold,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 120, // Space for bottom navigation
    },
    notificationsList: {
        padding: 20,
        gap: 12,
    },
    notificationCard: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#00000062',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
        borderLeftWidth: 3,
        borderLeftColor: 'transparent',
    },
    unreadCard: {
        borderLeftColor: COLORS.primary,
        backgroundColor: '#ffffff',
    },
    notificationContent: {
        gap: 12,
    },
    notificationHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerText: {
        flex: 1,
        gap: 4,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    notificationTitle: {
        fontSize: SIZES.subheading,
        fontFamily: FONTS.semiBold,
        color: COLORS.textPrimary,
        flex: 1,
    },
    unreadTitle: {
        fontFamily: FONTS.bold,
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.primary,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    typeLabel: {
        fontSize: SIZES.caption,
        fontFamily: FONTS.semiBold,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    timestamp: {
        fontSize: SIZES.caption,
        fontFamily: FONTS.regular,
        color: COLORS.textQuaternary,
    },
    notificationDescription: {
        fontSize: SIZES.body,
        fontFamily: FONTS.regular,
        color: COLORS.textSecondary,
        lineHeight: 20,
        marginLeft: 52, // Align with title
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
        paddingVertical: 64,
    },
    emptyTitle: {
        fontSize: SIZES.heading,
        fontFamily: FONTS.bold,
        color: COLORS.textSecondary,
        marginTop: 16,
        marginBottom: 8,
    },
    emptyDescription: {
        fontSize: SIZES.body,
        fontFamily: FONTS.regular,
        color: COLORS.textTertiary,
        textAlign: 'center',
        lineHeight: 20,
    },
});

export default CustomerNotifications;
