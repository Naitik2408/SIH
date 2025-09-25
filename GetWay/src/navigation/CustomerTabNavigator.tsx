import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';

import CustomerHome from '../screens/customer/CustomerHome';
import CustomerTripLogs from '../screens/customer/CustomerTripLogs';
import CustomerPosts from '../screens/customer/CustomerPosts';
import CustomerProfile from '../screens/customer/CustomerProfile';
import { CustomerNotifications, CreatePost } from '../screens/customer/subscreens';
import CustomBottomTabBar from '../components/CustomBottomTabBar';
import type { User } from '../types';

type TabName = 'home' | 'trip-logs' | 'blogs' | 'profile';

interface Notification {
    id: string;
    title: string;
    message: string;
    time: string;
    isRead: boolean;
    type: 'journey' | 'reward' | 'system' | 'update';
    data?: {
        tripId?: string;
        pointsEarned?: number;
        badges?: string[];
        duration?: string;
        [key: string]: any;
    };
}

interface CustomerTabNavigatorProps {
    user: User;
    onLogout: () => void;
}

const CustomerTabNavigator: React.FC<CustomerTabNavigatorProps> = ({ user, onLogout }) => {
    const [activeTab, setActiveTab] = React.useState('Home');
    const [showNotifications, setShowNotifications] = React.useState(false);
    const [showCreatePost, setShowCreatePost] = React.useState(false);

    // Notification states - shared between CustomerHome and CustomerNotifications
    const [notifications, setNotifications] = React.useState<Notification[]>([
        {
            id: '1',
            title: 'Welcome to GetWay!',
            message: 'Thank you for joining GetWay. Start logging your journeys to earn rewards.',
            time: '3 days ago',
            isRead: true,
            type: 'system',
        },
        {
            id: '2',
            title: 'Monthly Check-in Available',
            message: 'Complete your monthly travel survey to earn bonus rewards.',
            time: '1 day ago',
            isRead: false,
            type: 'reward',
        },
        {
            id: '3',
            title: 'App Update Available',
            message: 'New features and improvements are available. Update now for the best experience.',
            time: '1 week ago',
            isRead: false,
            type: 'update',
        },
    ]);

    const handleNotificationsUpdate = (updatedNotifications: Notification[]) => {
        setNotifications(updatedNotifications);
    };

    const handleTabPress = (tabName: string) => {
        setActiveTab(tabName);
        setShowNotifications(false);
        setShowCreatePost(false);
    };

    const handleShowNotifications = () => {
        setShowNotifications(true);
        setShowCreatePost(false);
    };

    const handleShowCreatePost = () => {
        setShowCreatePost(true);
        setShowNotifications(false);
    };

    const handleBackFromNotifications = () => {
        setShowNotifications(false);
    };

    const handleBackFromCreatePost = () => {
        setShowCreatePost(false);
    };

    const handlePostCreated = () => {
        // Refresh posts or show success message
        setShowCreatePost(false);
        setActiveTab('Blogs'); // Navigate back to posts
    };

    const renderScreen = () => {
        if (showNotifications) {
            return (
                <CustomerNotifications 
                    onBack={handleBackFromNotifications} 
                    notifications={notifications}
                    onNotificationsUpdate={handleNotificationsUpdate}
                />
            );
        }

        if (showCreatePost) {
            return <CreatePost onBack={handleBackFromCreatePost} onPostCreated={handlePostCreated} />;
        }

        switch (activeTab) {
            case 'Home':
                return (
                    <CustomerHome 
                        user={user} 
                        onNavigateToNotifications={handleShowNotifications}
                        notifications={notifications}
                        onNotificationsUpdate={handleNotificationsUpdate}
                    />
                );
            case 'TripLogs':
                return <CustomerTripLogs />;
            case 'Blogs':
                return <CustomerPosts currentUser={user} onNavigateToCreatePost={handleShowCreatePost} />;
            case 'Profile':
                return <CustomerProfile user={user} onLogout={onLogout} />;
            default:
                return (
                    <CustomerHome 
                        user={user} 
                        onNavigateToNotifications={handleShowNotifications}
                        notifications={notifications}
                        onNotificationsUpdate={handleNotificationsUpdate}
                    />
                );
        }
    };

    return (
        <View style={styles.container}>
            {renderScreen()}
            {!showNotifications && !showCreatePost && (
                <CustomBottomTabBar
                    activeTab={activeTab}
                    onTabPress={handleTabPress}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // Remove background color to allow transparency behind navbar
    },
});

export default CustomerTabNavigator;
