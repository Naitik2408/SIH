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
import { useSignUp } from '@clerk/clerk-expo';
import { COLORS, SIZES, FONTS } from '../../constants';
import { getAuthErrorMessage } from '../../utils/auth';

interface SignUpScreenProps {
    onSignIn: () => void;
}

const SignUpScreen: React.FC<SignUpScreenProps> = ({ onSignIn }) => {
    const { signUp, setActive, isLoaded } = useSignUp();
    const [emailAddress, setEmailAddress] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [pendingVerification, setPendingVerification] = useState(false);
    const [code, setCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const onSignUpPress = async () => {
        if (!isLoaded) {
            return;
        }

        if (!emailAddress || !password || !firstName || !lastName) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setIsLoading(true);

        try {
            await signUp.create({
                emailAddress,
                password,
                firstName,
                lastName,
            });

            await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });

            setPendingVerification(true);
        } catch (err: any) {
            console.error('Sign up error:', err);
            Alert.alert('Sign Up Error', getAuthErrorMessage(err));
        } finally {
            setIsLoading(false);
        }
    };

    const onPressVerify = async () => {
        if (!isLoaded) {
            return;
        }

        if (!code) {
            Alert.alert('Error', 'Please enter the verification code');
            return;
        }

        setIsLoading(true);

        try {
            const completeSignUp = await signUp.attemptEmailAddressVerification({
                code,
            });

            await setActive({ session: completeSignUp.createdSessionId });
        } catch (err: any) {
            console.error('Verification error:', err);
            Alert.alert('Verification Error', getAuthErrorMessage(err));
        } finally {
            setIsLoading(false);
        }
    };

    if (pendingVerification) {
        return (
            <KeyboardAvoidingView 
                style={styles.container} 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView contentContainerStyle={styles.scrollContainer}>
                    <View style={styles.logoContainer}>
                        <Text style={styles.logoText}>GetWay</Text>
                        <Text style={styles.subtitleText}>Verify your email</Text>
                    </View>

                    <View style={styles.formContainer}>
                        <Text style={styles.verificationText}>
                            We've sent a verification code to {emailAddress}
                        </Text>

                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Verification Code</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter verification code"
                                placeholderTextColor={COLORS.gray}
                                value={code}
                                onChangeText={setCode}
                                keyboardType="number-pad"
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                        </View>

                        <TouchableOpacity
                            style={[styles.verifyButton, isLoading && styles.disabledButton]}
                            onPress={onPressVerify}
                            disabled={isLoading}
                        >
                            <Text style={styles.verifyButtonText}>
                                {isLoading ? 'Verifying...' : 'Verify Email'}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => setPendingVerification(false)}
                        >
                            <Text style={styles.backButtonText}>
                                Back to Sign Up
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        );
    }

    return (
        <KeyboardAvoidingView 
            style={styles.container} 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.logoContainer}>
                    <Text style={styles.logoText}>GetWay</Text>
                    <Text style={styles.subtitleText}>Create your account</Text>
                </View>

                <View style={styles.formContainer}>
                    <View style={styles.nameRow}>
                        <View style={[styles.inputContainer, styles.nameInput]}>
                            <Text style={styles.inputLabel}>First Name</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="First name"
                                placeholderTextColor={COLORS.gray}
                                value={firstName}
                                onChangeText={setFirstName}
                                autoCapitalize="words"
                                autoCorrect={false}
                            />
                        </View>

                        <View style={[styles.inputContainer, styles.nameInput]}>
                            <Text style={styles.inputLabel}>Last Name</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Last name"
                                placeholderTextColor={COLORS.gray}
                                value={lastName}
                                onChangeText={setLastName}
                                autoCapitalize="words"
                                autoCorrect={false}
                            />
                        </View>
                    </View>

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
                        style={[styles.signUpButton, isLoading && styles.disabledButton]}
                        onPress={onSignUpPress}
                        disabled={isLoading}
                    >
                        <Text style={styles.signUpButtonText}>
                            {isLoading ? 'Creating Account...' : 'Sign Up'}
                        </Text>
                    </TouchableOpacity>

                    <View style={styles.divider}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>OR</Text>
                        <View style={styles.dividerLine} />
                    </View>

                    <TouchableOpacity
                        style={styles.signInButton}
                        onPress={onSignIn}
                    >
                        <Text style={styles.signInButtonText}>
                            Already have an account? Sign In
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
    nameRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    nameInput: {
        flex: 1,
        marginHorizontal: 4,
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
    signUpButton: {
        backgroundColor: COLORS.primary,
        borderRadius: 10,
        padding: 16,
        alignItems: 'center',
        marginTop: 10,
    },
    signUpButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontFamily: FONTS.semiBold,
    },
    verifyButton: {
        backgroundColor: COLORS.primary,
        borderRadius: 10,
        padding: 16,
        alignItems: 'center',
        marginTop: 10,
    },
    verifyButtonText: {
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
    signInButton: {
        alignItems: 'center',
        padding: 10,
    },
    signInButtonText: {
        fontSize: 16,
        fontFamily: FONTS.medium,
        color: COLORS.primary,
    },
    backButton: {
        alignItems: 'center',
        padding: 10,
        marginTop: 10,
    },
    backButtonText: {
        fontSize: 16,
        fontFamily: FONTS.medium,
        color: COLORS.gray,
    },
    verificationText: {
        fontSize: 16,
        fontFamily: FONTS.regular,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 22,
    },
});

export default SignUpScreen;
