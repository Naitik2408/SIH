import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useSignIn } from '@clerk/clerk-expo';
import { COLORS, SIZES, FONTS } from '../../constants';
import { getAuthErrorMessage } from '../../utils/auth';

interface SignInScreenProps {
    onSignUp: () => void;
}

const SignInScreen: React.FC<SignInScreenProps> = ({ onSignUp }) => {
    const { signIn, setActive, isLoaded } = useSignIn();
    const [emailAddress, setEmailAddress] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const onSignInPress = async () => {
        if (!isLoaded) {
            return;
        }

        if (!emailAddress || !password) {
            Alert.alert('Error', 'Please enter both email and password');
            return;
        }

        setIsLoading(true);

        try {
            const completeSignIn = await signIn.create({
                identifier: emailAddress,
                password,
            });

            await setActive({ session: completeSignIn.createdSessionId });
        } catch (err: any) {
            console.error('Sign in error:', err);
            Alert.alert('Sign In Error', getAuthErrorMessage(err));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView 
            style={styles.container} 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.logoContainer}>
                    <Text style={styles.logoText}>GetWay</Text>
                    <Text style={styles.subtitleText}>Welcome back!</Text>
                </View>

                <View style={styles.formContainer}>
                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Email Address</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your email"
                            placeholderTextColor={COLORS.gray}
                            value={emailAddress}
                            onChangeText={setEmailAddress}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Password</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your password"
                            placeholderTextColor={COLORS.gray}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.signInButton, isLoading && styles.disabledButton]}
                        onPress={onSignInPress}
                        disabled={isLoading}
                    >
                        <Text style={styles.signInButtonText}>
                            {isLoading ? 'Signing In...' : 'Sign In'}
                        </Text>
                    </TouchableOpacity>

                    <View style={styles.divider}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>OR</Text>
                        <View style={styles.dividerLine} />
                    </View>

                    <TouchableOpacity
                        style={styles.signUpButton}
                        onPress={onSignUp}
                    >
                        <Text style={styles.signUpButtonText}>
                            Don't have an account? Sign Up
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 20,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 50,
    },
    logoText: {
        fontSize: 48,
        fontFamily: FONTS.primary,
        color: COLORS.primary,
        marginBottom: 8,
    },
    subtitleText: {
        fontSize: 18,
        fontFamily: FONTS.medium,
        color: COLORS.gray,
    },
    formContainer: {
        backgroundColor: COLORS.white,
        borderRadius: 15,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    inputContainer: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 16,
        fontFamily: FONTS.medium,
        color: COLORS.textPrimary,
        marginBottom: 8,
    },
    input: {
        backgroundColor: COLORS.lightGray,
        borderRadius: 10,
        padding: 15,
        fontSize: 16,
        fontFamily: FONTS.regular,
        color: COLORS.textPrimary,
        borderWidth: 1,
        borderColor: COLORS.lightGray,
    },
    signInButton: {
        backgroundColor: COLORS.primary,
        borderRadius: 10,
        padding: 16,
        alignItems: 'center',
        marginTop: 10,
    },
    signInButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontFamily: FONTS.semiBold,
    },
    disabledButton: {
        backgroundColor: COLORS.gray,
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 30,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: COLORS.lightGray,
    },
    dividerText: {
        marginHorizontal: 15,
        fontSize: 14,
        fontFamily: FONTS.regular,
        color: COLORS.gray,
    },
    signUpButton: {
        alignItems: 'center',
        padding: 10,
    },
    signUpButtonText: {
        fontSize: 16,
        fontFamily: FONTS.medium,
        color: COLORS.primary,
    },
});

export default SignInScreen;
