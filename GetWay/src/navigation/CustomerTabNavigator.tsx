import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';

import CustomerHome from '../screens/customer/CustomerHome';
import CustomerTripLogs from '../screens/customer/CustomerTripLogs';
import CustomerPosts from '../screens/customer/CustomerPosts';
import CustomerProfile from '../screens/customer/CustomerProfile';
import CustomBottomTabBar from '../components/CustomBottomTabBar';
import type { User } from '../types';

type TabName = 'home' | 'trip-logs' | 'blogs' | 'profile';

interface CustomerTabNavigatorProps {
    user: User;
    onLogout: () => void;
}

const CustomerTabNavigator: React.FC<CustomerTabNavigatorProps> = ({ user, onLogout }) => {
    const [activeTab, setActiveTab] = React.useState('Home');

    const handleTabPress = (tabName: string) => {
        setActiveTab(tabName);
    };

    const renderScreen = () => {
        switch (activeTab) {
            case 'Home':
                return <CustomerHome user={user} />;
            case 'TripLogs':
                return <CustomerTripLogs />;
            case 'Blogs':
                return <CustomerPosts />;
            case 'Profile':
                return <CustomerProfile user={user} onLogout={onLogout} />;
            default:
                return <CustomerHome user={user} />;
        }
    };

    return (
        <View style={styles.container}>
            {renderScreen()}
            <CustomBottomTabBar
                activeTab={activeTab}
                onTabPress={handleTabPress}
            />
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
