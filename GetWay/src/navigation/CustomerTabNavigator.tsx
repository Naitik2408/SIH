import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';

import CustomerHome from '../screens/customer/CustomerHome';
import CustomerTripLogs from '../screens/customer/CustomerTripLogs';
import CustomerPosts from '../screens/customer/CustomerPosts';
import CustomerProfile from '../screens/customer/CustomerProfile';
import CustomerNotifications from '../screens/customer/subscreens/notifications/CustomerNotifications';
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

    const handleTabPress = (tabName: string) => {
        setActiveTab(tabName);
        setShowNotifications(false); // Hide notifications when switching tabs
    };

    const handleNavigateToNotifications = () => {
        setShowNotifications(true);
    };

    const handleBackFromNotifications = () => {
        setShowNotifications(false);
    };

    const renderScreen = () => {
        if (showNotifications) {
            return <CustomerNotifications onBack={handleBackFromNotifications} />;
        }

        switch (activeTab) {
            case 'Home':
                return <CustomerHome user={user} onNavigateToNotifications={handleNavigateToNotifications} />;
            case 'TripLogs':
                return <CustomerTripLogs />;
            case 'Blogs':
                return <CustomerPosts />;
            case 'Profile':
                return <CustomerProfile user={user} onLogout={onLogout} />;
            default:
                return <CustomerHome user={user} onNavigateToNotifications={handleNavigateToNotifications} />;
        }
    };

    return (
        <View style={styles.container}>
            {renderScreen()}
            {!showNotifications && (
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
