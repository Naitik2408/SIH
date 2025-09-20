import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet, View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth, useUser } from '@clerk/clerk-expo';
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

import OnboardingScreen from '../screens/OnboardingScreen';
import { SignInScreen, SignUpScreen } from '../screens/auth';
import CustomerTabNavigator from '../navigation/CustomerTabNavigator';
import OwnerDashboard from '../screens/owner/OwnerDashboard';
import { User } from '../types';
import { COLORS } from '../constants';
import { createAppUser } from '../utils/auth';

type AppState = 'loading' | 'onboarding' | 'auth';
type AuthMode = 'signin' | 'signup';

export default function AppContent() {
    const { isSignedIn, isLoaded: authLoaded, signOut } = useAuth();
    const { user: clerkUser } = useUser();
    const [appState, setAppState] = useState<AppState>('loading');
    const [authMode, setAuthMode] = useState<AuthMode>('signin');
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
        if (fontsLoaded && authLoaded) {
            initializeApp();
        }
    }, [fontsLoaded, authLoaded, isSignedIn]);

    const initializeApp = async () => {
        try {
            if (isSignedIn && clerkUser) {
                // User is authenticated, create our app user object
                const user = createAppUser(clerkUser);
                setCurrentUser(user);
                setAppState('loading'); // Will show dashboard once user is set
            } else {
                // User is not authenticated, check if they've seen onboarding
                const hasLaunched = await AsyncStorage.getItem('hasLaunched');
                if (hasLaunched === null) {
                    setAppState('onboarding');
                } else {
                    setAppState('auth');
                }
            }
        } catch (error) {
            console.error('Error initializing app:', error);
            setAppState('auth');
        }
    };

    const handleOnboardingComplete = async () => {
        try {
            await AsyncStorage.setItem('hasLaunched', 'true');
            setAppState('auth');
        } catch (error) {
            console.error('Error saving first launch:', error);
            setAppState('auth');
        }
    };

    const handleAuthModeChange = (mode: AuthMode) => {
        setAuthMode(mode);
    };

    const handleLogout = async () => {
        try {
            await signOut();
            setCurrentUser(null);
            setAppState('auth');
        } catch (error) {
            console.error('Error signing out:', error);
        }
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

    // Show loading screen while fonts or auth are loading
    if (!fontsLoaded || !authLoaded) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading...</Text>
            </View>
        );
    }

    // If user is signed in and we have user data, show dashboard
    if (isSignedIn && currentUser) {
        return (
            <NavigationContainer>
                <SafeAreaView style={styles.container}>
                    <StatusBar style="auto" />
                    {renderDashboard()}
                </SafeAreaView>
            </NavigationContainer>
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
            case 'auth':
                if (authMode === 'signin') {
                    return (
                        <SignInScreen 
                            onSignUp={() => handleAuthModeChange('signup')}
                        />
                    );
                } else {
                    return (
                        <SignUpScreen 
                            onSignIn={() => handleAuthModeChange('signin')}
                        />
                    );
                }
            default:
                return (
                    <SignInScreen 
                        onSignUp={() => handleAuthModeChange('signup')}
                    />
                );
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="auto" />
            {renderCurrentScreen()}
        </SafeAreaView>
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
