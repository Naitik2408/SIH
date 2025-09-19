import React from 'react';
import {
    View,
    TouchableOpacity,
    StyleSheet,
    Animated,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants';

const { width } = Dimensions.get('window');

export interface TabItem {
    name: string;
    icon: keyof typeof Ionicons.glyphMap;
    iconOutline: keyof typeof Ionicons.glyphMap;
}

interface CustomBottomTabBarProps {
    activeTab: string;
    onTabPress: (tabName: string) => void;
    tabItems?: TabItem[];
}

const defaultTabItems: TabItem[] = [
    { name: 'Home', icon: 'home', iconOutline: 'home-outline' },
    { name: 'TripLogs', icon: 'bus', iconOutline: 'bus-outline' }, // Better for trips
    { name: 'Blogs', icon: 'chatbubbles', iconOutline: 'chatbubbles-outline' }, // Using chatbubbles for posts
    { name: 'Profile', icon: 'person', iconOutline: 'person-outline' },
];

const CustomBottomTabBar: React.FC<CustomBottomTabBarProps> = ({
    activeTab,
    onTabPress,
    tabItems = defaultTabItems,
}) => {
    const animatedValue = React.useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        Animated.spring(animatedValue, {
            toValue: 1,
            useNativeDriver: true,
            tension: 100,
            friction: 8,
        }).start();
    }, [activeTab]);

    const renderTabItem = (item: TabItem) => {
        const isActive = activeTab === item.name;

        return (
            <TouchableOpacity
                key={item.name}
                style={styles.tabItem}
                onPress={() => onTabPress(item.name)}
                activeOpacity={0.8}
            >
                <Animated.View
                    style={[
                        styles.iconContainer,
                        isActive && styles.activeIconContainer,
                        isActive && {
                            transform: [
                                {
                                    scale: animatedValue.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [0.9, 1.1],
                                    }),
                                },
                            ],
                        },
                    ]}
                >
                    <Ionicons
                        name={isActive ? item.icon : item.iconOutline}
                        size={isActive ? 22 : 20}
                        color={COLORS.white}
                        style={[
                            styles.icon,
                            !isActive && styles.inactiveIcon,
                        ]}
                    />
                </Animated.View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.tabBar}>
                {tabItems.map(renderTabItem)}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 8, // Safe area padding
        left: 0,
        right: 0,
        alignItems: 'center', // Center the navbar
        paddingTop: 10,
        backgroundColor: 'transparent', // Ensure transparent background
        pointerEvents: 'box-none', // Allow touches to pass through empty areas
    },
    tabBar: {
        flexDirection: 'row',
        backgroundColor: '#1a1a1a', // Slightly lighter than pure black
        borderRadius: 58,
        paddingVertical: 10,
        paddingHorizontal: 24,
        justifyContent: 'center', // Center content within the bar
        alignItems: 'center',
        alignSelf: 'center', // Center the bar itself
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 12,
        },
        shadowOpacity: 0.4,
        shadowRadius: 24,
        elevation: 20,
        // Floating effect with subtle border
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    tabItem: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 4,
        paddingHorizontal: 8, // Add horizontal padding between items
        minWidth: 47, // Ensure minimum touch area
    },
    iconContainer: {
        width: 47,
        height: 47,
        borderRadius: 26,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
    },
    activeIconContainer: {
        backgroundColor: COLORS.primary,
        shadowColor: COLORS.primary,
        shadowOffset: {
            width: 0,
            height: 6,
        },
        shadowOpacity: 0.5,
        shadowRadius: 12,
        elevation: 12,
        // Add subtle inner glow effect
        borderWidth: 2,
        borderColor: `${COLORS.primary}40`,
    },
    icon: {
        // Default icon styling
    },
    inactiveIcon: {
        opacity: 0.5,
    },
});

export default CustomBottomTabBar;
