import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ScrollView,
} from 'react-native';
import { COLORS, SIZES, DEMO_USERS } from '../constants';
import { User, UserRole } from '../types';

interface LoginScreenProps {
    onLogin: (user: User) => void;
    onSignUp: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onSignUp }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please enter both email and password');
            return;
        }

        setIsLoading(true);

        // Demo login logic
        const demoUser = Object.values(DEMO_USERS).find(
            user => user.email === email && user.password === password
        );

        if (demoUser) {
            const user: User = {
                id: Math.random().toString(36).substr(2, 9),
                email: demoUser.email,
                name: demoUser.name,
                role: demoUser.role,
            };

            setTimeout(() => {
                setIsLoading(false);
                onLogin(user);
            }, 1000);
        } else {
            setTimeout(() => {
                setIsLoading(false);
                Alert.alert('Error', 'Invalid credentials. Please try the demo accounts.');
            }, 1000);
        }
    };

    const fillDemoCredentials = (role: UserRole) => {
        const user = DEMO_USERS[role];
        setEmail(user.email);
        setPassword(user.password);
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            <View style={styles.header}>
                <Text style={styles.title}>Welcome to GetWay</Text>
                <Text style={styles.subtitle}>Sign in to continue your journey</Text>
            </View>

            <View style={styles.form}>
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Email</Text>
                    <TextInput
                        style={styles.input}
                        value={email}
                        onChangeText={setEmail}
                        placeholder="Enter your email"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Password</Text>
                    <TextInput
                        style={styles.input}
                        value={password}
                        onChangeText={setPassword}
                        placeholder="Enter your password"
                        secureTextEntry
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                </View>

                <TouchableOpacity
                    style={[styles.loginButton, isLoading && styles.disabledButton]}
                    onPress={handleLogin}
                    disabled={isLoading}
                >
                    <Text style={styles.loginButtonText}>
                        {isLoading ? 'Signing in...' : 'Sign In'}
                    </Text>
                </TouchableOpacity>
            </View>

            <View style={styles.demoSection}>
                <Text style={styles.demoTitle}>Demo Accounts</Text>
                <Text style={styles.demoSubtitle}>Try different user roles:</Text>

                <View style={styles.demoButtons}>
                    <TouchableOpacity
                        style={[styles.demoButton, { backgroundColor: COLORS.secondary }]}
                        onPress={() => fillDemoCredentials('customer')}
                    >
                        <Text style={styles.demoButtonText}>Customer</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.demoButton, { backgroundColor: COLORS.accent }]}
                        onPress={() => fillDemoCredentials('scientist')}
                    >
                        <Text style={styles.demoButtonText}>Scientist</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.demoButton, { backgroundColor: COLORS.primary }]}
                        onPress={() => fillDemoCredentials('owner')}
                    >
                        <Text style={styles.demoButtonText}>Owner</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.footer}>
                <Text style={styles.footerText}>Don't have an account? </Text>
                <TouchableOpacity onPress={onSignUp}>
                    <Text style={styles.signUpText}>Sign Up</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    contentContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: SIZES.xl,
    },
    header: {
        alignItems: 'center',
        marginBottom: SIZES.xxl,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: COLORS.black,
        marginBottom: SIZES.sm,
    },
    subtitle: {
        fontSize: SIZES.md,
        color: COLORS.gray,
        textAlign: 'center',
    },
    form: {
        marginBottom: SIZES.xxl,
    },
    inputContainer: {
        marginBottom: SIZES.lg,
    },
    label: {
        fontSize: SIZES.md,
        fontWeight: '600',
        color: COLORS.black,
        marginBottom: SIZES.xs,
    },
    input: {
        borderWidth: 1,
        borderColor: COLORS.gray,
        borderRadius: 12,
        paddingHorizontal: SIZES.md,
        paddingVertical: SIZES.md,
        fontSize: SIZES.md,
        backgroundColor: COLORS.white,
    },
    loginButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: SIZES.md,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: SIZES.lg,
    },
    disabledButton: {
        opacity: 0.6,
    },
    loginButtonText: {
        color: COLORS.white,
        fontSize: SIZES.lg,
        fontWeight: 'bold',
    },
    demoSection: {
        backgroundColor: COLORS.white,
        padding: SIZES.lg,
        borderRadius: 12,
        marginBottom: SIZES.xxl,
    },
    demoTitle: {
        fontSize: SIZES.lg,
        fontWeight: 'bold',
        color: COLORS.black,
        textAlign: 'center',
        marginBottom: SIZES.xs,
    },
    demoSubtitle: {
        fontSize: SIZES.sm,
        color: COLORS.gray,
        textAlign: 'center',
        marginBottom: SIZES.md,
    },
    demoButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    demoButton: {
        flex: 1,
        paddingVertical: SIZES.sm,
        marginHorizontal: 4,
        borderRadius: 8,
        alignItems: 'center',
    },
    demoButtonText: {
        color: COLORS.black,
        fontSize: SIZES.sm,
        fontWeight: '600',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    footerText: {
        fontSize: SIZES.md,
        color: COLORS.gray,
    },
    signUpText: {
        fontSize: SIZES.md,
        color: COLORS.primary,
        fontWeight: 'bold',
    },
});

export default LoginScreen;
