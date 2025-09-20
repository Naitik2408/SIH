import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet, View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Font imports
import {
    useFonts,
    Caprasimo_400Regular,
} from '@expo-google-fonts/caprasimo';
import {
    OpenSans_400Regular,
    OpenSans_500Medium,
    OpenSans_600SemiBold,
    OpenSans_700Bold,
} from '@expo-google-fonts/open-sans';

import OnboardingScreen from './src/screens/OnboardingScreen';
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import CustomerTabNavigator from './src/navigation/CustomerTabNavigator';
import OwnerDashboard from './src/screens/owner/OwnerDashboard';
import { User } from './src/types';
import { COLORS } from './src/constants';

type AppState = 'loading' | 'onboarding' | 'login' | 'signup' | 'dashboard';

export default function App() {
    const [appState, setAppState] = useState<AppState>('loading');
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    // Load fonts
    let [fontsLoaded] = useFonts({
        Caprasimo_400Regular,
        OpenSans_400Regular,
        OpenSans_500Medium,
        OpenSans_600SemiBold,
        OpenSans_700Bold,
    });

    useEffect(() => {
        if (fontsLoaded) {
            checkFirstLaunch();
        }
    }, [fontsLoaded]);

    const checkFirstLaunch = async () => {
        try {
            const hasLaunched = await AsyncStorage.getItem('hasLaunched');
            if (hasLaunched === null) {
                setAppState('onboarding');
            } else {
                setAppState('login');
            }
        } catch (error) {
            console.error('Error checking first launch:', error);
            setAppState('onboarding');
        }
    };

    const handleOnboardingComplete = async () => {
        try {
            await AsyncStorage.setItem('hasLaunched', 'true');
            setAppState('login');
        } catch (error) {
            console.error('Error saving first launch:', error);
            setAppState('login');
        }
    };

    const handleLogin = (user: User) => {
        setCurrentUser(user);
        setAppState('dashboard');
    };

    const handleLogout = () => {
        setCurrentUser(null);
        setAppState('login');
    };

    const handleSignUp = () => {
        setAppState('signup');
    };

    const handleSignupSuccess = () => {
        // Create a mock user for demonstration
        const newUser: User = {
            id: 'new-user-' + Date.now(),
            email: 'newuser@example.com',
            name: 'New User',
            role: 'customer',
            onboardingCompleted: true,
            govCoins: 0,
            joinedAt: new Date(),
        };
        setCurrentUser(newUser);
        setAppState('dashboard');
    };

    const handleBackToLogin = () => {
        setAppState('login');
    };

    const renderDashboard = () => {
        if (!currentUser) return null;

        switch (currentUser.role) {
            case 'customer':
                return <CustomerTabNavigator user={currentUser} onLogout={handleLogout} />;
            case 'owner':
                return <OwnerDashboard user={currentUser} onLogout={handleLogout} />;
            default:
                return (
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>Unknown user role</Text>
                    </View>
                );
        }
    };

    // Show loading screen while fonts are loading
    if (!fontsLoaded) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading fonts...</Text>
            </View>
        );
    }

    const renderCurrentScreen = () => {
        switch (appState) {
            case 'loading':
                return (
                    <View style={styles.loadingContainer}>
                        <Text style={styles.loadingText}>Loading...</Text>
                    </View>
                );
            case 'onboarding':
                return <OnboardingScreen onComplete={handleOnboardingComplete} />;
            case 'login':
                return <LoginScreen onLogin={handleLogin} onSignUp={handleSignUp} />;
            case 'signup':
                return <SignupScreen onSignupSuccess={handleSignupSuccess} onBack={handleBackToLogin} />;
            case 'dashboard':
                return renderDashboard();
            default:
                return <LoginScreen onLogin={handleLogin} onSignUp={handleSignUp} />;
        }
    };

    return (
        <NavigationContainer>
            <SafeAreaView style={styles.container}>
                <StatusBar style="auto" />
                {renderCurrentScreen()}
            </SafeAreaView>
        </NavigationContainer>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 18,
        color: COLORS.gray,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        fontSize: 16,
        color: COLORS.error,
    },
});
