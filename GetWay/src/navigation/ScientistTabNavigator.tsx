import React, { useState } from 'react';
import {
    View,
    StyleSheet,
} from 'react-native';
import { COLORS, SIZES, FONTS } from '../constants';

// Import main scientist screens
import ScientistHome from '../screens/scientist/ScientistHome';
import ScientistData from '../screens/scientist/ScientistData';
import ScientistReports from '../screens/scientist/ScientistReports';
import ScientistProfile from '../screens/scientist/ScientistProfile';

// Import the custom bottom tab bar
import CustomBottomTabBar from '../components/CustomBottomTabBar';

// Import TabItem type
import { TabItem } from '../components/CustomBottomTabBar';

// Define the tab items for scientist navigation
const scientistTabItems: TabItem[] = [
    { name: 'Home', icon: 'analytics', iconOutline: 'analytics-outline' },
    { name: 'Data', icon: 'server', iconOutline: 'server-outline' },
    { name: 'Reports', icon: 'document-text', iconOutline: 'document-text-outline' },
    { name: 'Profile', icon: 'person', iconOutline: 'person-outline' },
];

interface ScientistTabNavigatorProps {
    user: any;
    onLogout: () => void;
}

const ScientistTabNavigator: React.FC<ScientistTabNavigatorProps> = ({
    user,
    onLogout
}) => {
    const [activeTab, setActiveTab] = useState('Home');

    const handleTabPress = (tabName: string) => {
        setActiveTab(tabName);
    };

    const renderActiveScreen = () => {
        switch (activeTab) {
            case 'Home':
                return (
                    <ScientistHome
                        user={user}
                        onNavigateToDetails={(screen) => {
                            // Handle navigation to detail screens
                            console.log('Navigate to:', screen);
                        }}
                    />
                );
            case 'Data':
                return <ScientistData user={user} />;
            case 'Reports':
                return <ScientistReports user={user} />;
            case 'Profile':
                return <ScientistProfile user={user} onLogout={onLogout} />;
            default:
                return <ScientistHome user={user} />;
        }
    };

    return (
        <View style={styles.container}>
            {/* Active Screen Content */}
            <View style={styles.screenContainer}>
                {renderActiveScreen()}
            </View>

            {/* Custom Bottom Tab Bar */}
            <CustomBottomTabBar
                activeTab={activeTab}
                onTabPress={handleTabPress}
                tabItems={scientistTabItems}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    screenContainer: {
        flex: 1,
    },
});

export default ScientistTabNavigator;
