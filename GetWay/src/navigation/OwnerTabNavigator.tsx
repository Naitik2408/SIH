import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { User } from '../types';
import { OwnerHome, OwnerApprovals, OwnerProfile } from '../screens/owner/subscreens';
import CustomBottomTabBar, { TabItem } from '../components/CustomBottomTabBar';

interface OwnerTabNavigatorProps {
    user: User;
    onLogout: () => void;
}

const ownerTabItems: TabItem[] = [
    { name: 'Home', icon: 'home', iconOutline: 'home-outline' },
    { name: 'Approvals', icon: 'checkmark-done', iconOutline: 'checkmark-done-outline' },
    { name: 'Profile', icon: 'person', iconOutline: 'person-outline' },
];

const OwnerTabNavigator: React.FC<OwnerTabNavigatorProps> = ({ user, onLogout }) => {
    const [activeTab, setActiveTab] = useState('Home');
    const [approvalsFilter, setApprovalsFilter] = useState<'all' | 'pending' | 'approved'>('pending');

    const handleNavigateToApprovals = (filter?: 'all' | 'pending' | 'approved') => {
        if (filter) {
            setApprovalsFilter(filter);
        }
        setActiveTab('Approvals');
    };

    const renderActiveScreen = () => {
        switch (activeTab) {
            case 'Home':
                return <OwnerHome user={user} onNavigateToApprovals={handleNavigateToApprovals} />;
            case 'Approvals':
                return <OwnerApprovals initialFilter={approvalsFilter} />;
            case 'Profile':
                return <OwnerProfile user={user} onLogout={onLogout} />;
            default:
                return <OwnerHome user={user} onNavigateToApprovals={handleNavigateToApprovals} />;
        }
    };

    return (
        <View style={styles.container}>
            {renderActiveScreen()}
            <CustomBottomTabBar
                activeTab={activeTab}
                onTabPress={setActiveTab}
                tabItems={ownerTabItems}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

export default OwnerTabNavigator;
