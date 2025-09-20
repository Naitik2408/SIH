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

interface CustomerTabNavigatorProps {
    user: User;
    onLogout: () => void;
}

const CustomerTabNavigator: React.FC<CustomerTabNavigatorProps> = ({ user, onLogout }) => {
    const [activeTab, setActiveTab] = React.useState('Home');
    const [showNotifications, setShowNotifications] = React.useState(false);
    const [showCreatePost, setShowCreatePost] = React.useState(false);

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
            return <CustomerNotifications onBack={handleBackFromNotifications} />;
        }

        if (showCreatePost) {
            return <CreatePost onBack={handleBackFromCreatePost} onPostCreated={handlePostCreated} />;
        }

        switch (activeTab) {
            case 'Home':
                return <CustomerHome user={user} onNavigateToNotifications={handleShowNotifications} />;
            case 'TripLogs':
                return <CustomerTripLogs />;
            case 'Blogs':
                return <CustomerPosts onNavigateToCreatePost={handleShowCreatePost} />;
            case 'Profile':
                return <CustomerProfile user={user} onLogout={onLogout} />;
            default:
                return <CustomerHome user={user} onNavigateToNotifications={handleShowNotifications} />;
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
