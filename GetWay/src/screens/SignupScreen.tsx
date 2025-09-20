import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants';
import Toast from '../components/Toast';

const { width } = Dimensions.get('window');

interface SignupData {
    emailOrPhone: string;
    password: string;
    confirmPassword: string;
    name: string;
    age: string;
    gender: 'male' | 'female' | 'other' | 'prefer-not-to-say' | '';
    occupation: 'student' | 'employee' | 'homemaker' | 'retired' | 'self-employed' | 'unemployed' | 'other' | '';
    householdSize: string;
    vehicleOwnership: {
        cars: string;
        twoWheelers: string;
        cycles: string;
    };
    usesPublicTransport: boolean | null;
    incomeRange: 'below-25k' | '25k-50k' | '50k-100k' | '100k-200k' | '200k-500k' | 'above-500k' | 'prefer-not-to-say' | '';
}

interface CarouselStep {
    id: string;
    title: string;
    subtitle: string;
    field: keyof SignupData;
    type: 'text' | 'select' | 'number' | 'boolean' | 'vehicles' | 'income';
    options?: { label: string; value: string }[];
    required: boolean;
}

const carouselSteps: CarouselStep[] = [
    {
        id: 'name',
        title: 'What\'s your name?',
        subtitle: 'This helps us personalize your experience',
        field: 'name',
        type: 'text',
        required: true,
    },
    {
        id: 'age',
        title: 'How old are you?',
        subtitle: 'Age helps us understand travel patterns',
        field: 'age',
        type: 'number',
        required: true,
    },
    {
        id: 'gender',
        title: 'Select your gender',
        subtitle: 'This information is kept private',
        field: 'gender',
        type: 'select',
        options: [
            { label: 'Male', value: 'male' },
            { label: 'Female', value: 'female' },
            { label: 'Other', value: 'other' },
            { label: 'Prefer not to say', value: 'prefer-not-to-say' },
        ],
        required: true,
    },
    {
        id: 'occupation',
        title: 'What\'s your occupation?',
        subtitle: 'Helps us understand travel needs',
        field: 'occupation',
        type: 'select',
        options: [
            { label: 'Student', value: 'student' },
            { label: 'Employee', value: 'employee' },
            { label: 'Homemaker', value: 'homemaker' },
            { label: 'Retired', value: 'retired' },
            { label: 'Self-employed', value: 'self-employed' },
            { label: 'Unemployed', value: 'unemployed' },
            { label: 'Other', value: 'other' },
        ],
        required: true,
    },
    {
        id: 'householdSize',
        title: 'Household size?',
        subtitle: 'Number of people in your household',
        field: 'householdSize',
        type: 'number',
        required: true,
    },
    {
        id: 'vehicles',
        title: 'Vehicle ownership',
        subtitle: 'Tell us about vehicles in your household',
        field: 'vehicleOwnership',
        type: 'vehicles',
        required: true,
    },
    {
        id: 'publicTransport',
        title: 'Do you use public transport?',
        subtitle: 'Bus, train, metro, auto, etc.',
        field: 'usesPublicTransport',
        type: 'boolean',
        required: true,
    },
    {
        id: 'income',
        title: 'Income range (Optional)',
        subtitle: 'This helps improve our services',
        field: 'incomeRange',
        type: 'income',
        options: [
            { label: 'Below ₹25,000', value: 'below-25k' },
            { label: '₹25,000 - ₹50,000', value: '25k-50k' },
            { label: '₹50,000 - ₹1,00,000', value: '50k-100k' },
            { label: '₹1,00,000 - ₹2,00,000', value: '100k-200k' },
            { label: '₹2,00,000 - ₹5,00,000', value: '200k-500k' },
            { label: 'Above ₹5,00,000', value: 'above-500k' },
            { label: 'Prefer not to say', value: 'prefer-not-to-say' },
        ],
        required: false,
    },
];

interface SignupScreenProps {
    onSignupSuccess: () => void;
    onBack?: () => void;
}

const SignupScreen: React.FC<SignupScreenProps> = ({ onSignupSuccess, onBack }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [showCarousel, setShowCarousel] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');
    const [screenWidth, setScreenWidth] = useState(width);
    const [isScrolling, setIsScrolling] = useState(false);
    const [signupData, setSignupData] = useState<SignupData>({
        emailOrPhone: '',
        password: '',
        confirmPassword: '',
        name: '',
        age: '',
        gender: '',
        occupation: '',
        householdSize: '',
        vehicleOwnership: {
            cars: '0',
            twoWheelers: '0',
            cycles: '0',
        },
        usesPublicTransport: null,
        incomeRange: '',
    });

    const scrollViewRef = useRef<ScrollView>(null);

    // Handle scrolling when currentStep changes
    useEffect(() => {
        if (showCarousel && scrollViewRef.current && screenWidth > 0 && !isScrolling) {
            const scrollX = currentStep * screenWidth;
            setIsScrolling(true);
            
            // Use requestAnimationFrame for smoother scrolling
            requestAnimationFrame(() => {
                scrollViewRef.current?.scrollTo({
                    x: scrollX,
                    animated: true,
                });
                
                // Reset scrolling flag after animation
                setTimeout(() => {
                    setIsScrolling(false);
                }, 300);
            });
        }
    }, [currentStep, showCarousel, screenWidth]);

    const showToastMessage = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
        setToastMessage(message);
        setToastType(type);
        setShowToast(true);
    };

    const validateInitialForm = () => {
        if (!signupData.emailOrPhone.trim()) {
            showToastMessage('Please enter email or phone number', 'error');
            return false;
        }
        if (!signupData.password.trim()) {
            showToastMessage('Please enter password', 'error');
            return false;
        }
        if (signupData.password !== signupData.confirmPassword) {
            showToastMessage('Passwords do not match', 'error');
            return false;
        }
        if (signupData.password.length < 6) {
            showToastMessage('Password must be at least 6 characters', 'error');
            return false;
        }
        return true;
    };

    const handleContinue = () => {
        if (validateInitialForm()) {
            setShowCarousel(true);
        }
    };

    const handleStepInput = (value: any, fieldName?: keyof SignupData) => {
        const step = carouselSteps[currentStep];
        const targetField = fieldName || step.field;
        
        setSignupData(prev => ({
            ...prev,
            [targetField]: value
        }));
    };

    const handleVehicleChange = (vehicleType: 'cars' | 'twoWheelers' | 'cycles', increment: boolean) => {
        setSignupData(prev => {
            const currentCount = parseInt(prev.vehicleOwnership[vehicleType]) || 0;
            const newCount = increment ? currentCount + 1 : Math.max(0, currentCount - 1);
            
            return {
                ...prev,
                vehicleOwnership: {
                    ...prev.vehicleOwnership,
                    [vehicleType]: newCount.toString()
                }
            };
        });
    };

    const validateCurrentStep = () => {
        const currentStepData = carouselSteps[currentStep];
        const currentValue = signupData[currentStepData.field];
        
        if (currentStepData.required) {
            if (currentStepData.type === 'text' || currentStepData.type === 'number') {
                if (!currentValue || (currentValue as string).trim() === '') {
                    showToastMessage(`Please enter ${currentStepData.title.toLowerCase()}`, 'error');
                    return false;
                }
                
                // Additional validation for age
                if (currentStepData.field === 'age') {
                    const age = parseInt(currentValue as string);
                    if (isNaN(age) || age < 1 || age > 120) {
                        showToastMessage('Please enter a valid age (1-120)', 'error');
                        return false;
                    }
                }
                
                // Additional validation for household size
                if (currentStepData.field === 'householdSize') {
                    const size = parseInt(currentValue as string);
                    if (isNaN(size) || size < 1 || size > 20) {
                        showToastMessage('Please enter a valid household size (1-20)', 'error');
                        return false;
                    }
                }
                
                // Additional validation for name
                if (currentStepData.field === 'name') {
                    if ((currentValue as string).trim().length < 2) {
                        showToastMessage('Please enter a valid name (at least 2 characters)', 'error');
                        return false;
                    }
                }
            }
            
            if (currentStepData.type === 'select' || currentStepData.type === 'income') {
                if (!currentValue || currentValue === '') {
                    showToastMessage(`Please select ${currentStepData.title.toLowerCase()}`, 'error');
                    return false;
                }
            }
            
            if (currentStepData.type === 'boolean') {
                if (currentValue === null || currentValue === undefined) {
                    showToastMessage(`Please answer ${currentStepData.title.toLowerCase()}`, 'error');
                    return false;
                }
            }
            
            if (currentStepData.type === 'vehicles') {
                // Vehicle ownership can be 0, so we don't need to validate
                // The field is always valid as it has default values
                return true;
            }
        }
        
        return true;
    };

    const goToNextStep = () => {
        if (currentStep < carouselSteps.length - 1 && !isScrolling) {
            if (validateCurrentStep()) {
                const nextStep = currentStep + 1;
                setCurrentStep(nextStep);
            }
        }
    };

    const isCurrentStepValid = () => {
        const currentStepData = carouselSteps[currentStep];
        const currentValue = signupData[currentStepData.field];
        
        if (currentStepData.required) {
            if (currentStepData.type === 'text' || currentStepData.type === 'number') {
                if (!currentValue || (currentValue as string).trim() === '') {
                    return false;
                }
                
                // Additional validation for age
                if (currentStepData.field === 'age') {
                    const age = parseInt(currentValue as string);
                    if (isNaN(age) || age < 1 || age > 120) {
                        return false;
                    }
                }
                
                // Additional validation for household size
                if (currentStepData.field === 'householdSize') {
                    const size = parseInt(currentValue as string);
                    if (isNaN(size) || size < 1 || size > 20) {
                        return false;
                    }
                }
                
                // Additional validation for name
                if (currentStepData.field === 'name') {
                    if ((currentValue as string).trim().length < 2) {
                        return false;
                    }
                }
            }
            
            if (currentStepData.type === 'select' || currentStepData.type === 'income') {
                if (!currentValue || currentValue === '') {
                    return false;
                }
            }
            
            if (currentStepData.type === 'boolean') {
                if (currentValue === null || currentValue === undefined) {
                    return false;
                }
            }
        }
        
        return true;
    };

    const goToPrevStep = () => {
        if (currentStep > 0 && !isScrolling) {
            const prevStep = currentStep - 1;
            setCurrentStep(prevStep);
        }
    };

    const handleSignup = () => {
        // Validate required fields
        const requiredSteps = carouselSteps.filter(step => step.required);
        for (const step of requiredSteps) {
            const value = signupData[step.field];
            if (!value || value === '' || value === null) {
                showToastMessage(`Please fill in ${step.title.toLowerCase()}`, 'error');
                return;
            }
        }

        // Show success toast and redirect
        showToastMessage('🎉 Account created successfully!', 'success');
        setTimeout(() => {
            onSignupSuccess();
        }, 1500);
    };

    const renderStepContent = (step: CarouselStep, index: number) => {
        const currentValue = signupData[step.field];
        const isCurrentStep = index === currentStep;
        const hasError = isCurrentStep && step.required && !isCurrentStepValid();

        return (
            <View key={step.id} style={styles.stepContainer}>
                <Text style={styles.stepTitle}>
                    {step.title}
                    {step.required && <Text style={styles.requiredMark}> *</Text>}
                </Text>
                <Text style={styles.stepSubtitle}>{step.subtitle}</Text>

                {step.type === 'text' && (
                    <TextInput
                        style={[
                            styles.textInput,
                            hasError && styles.errorInput
                        ]}
                        value={currentValue as string}
                        onChangeText={(text) => handleStepInput(text, step.field)}
                        placeholder={`Enter your ${step.field === 'name' ? 'full name' : step.field}`}
                        autoFocus={false}
                        autoCapitalize="words"
                        maxLength={step.field === 'name' ? 50 : 20}
                    />
                )}

                {step.type === 'number' && (
                    <TextInput
                        style={[
                            styles.textInput,
                            hasError && styles.errorInput
                        ]}
                        value={currentValue as string}
                        onChangeText={(text) => {
                            // Only allow numeric input
                            const numericText = text.replace(/[^0-9]/g, '');
                            handleStepInput(numericText, step.field);
                        }}
                        placeholder={`Enter ${step.field === 'age' ? 'your age' : step.field === 'householdSize' ? 'household size' : step.field}`}
                        keyboardType="numeric"
                        autoFocus={false}
                        maxLength={step.field === 'age' ? 3 : 2}
                    />
                )}

                {(step.type === 'select' || step.type === 'income') && (
                    <View style={styles.optionsContainer}>
                        {step.options?.map((option) => (
                            <TouchableOpacity
                                key={option.value}
                                style={[
                                    styles.optionButton,
                                    currentValue === option.value && styles.selectedOption
                                ]}
                                onPress={() => handleStepInput(option.value, step.field)}
                            >
                                <Text style={[
                                    styles.optionText,
                                    currentValue === option.value && styles.selectedOptionText
                                ]}>
                                    {option.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                        {step.type === 'income' && (
                            <TouchableOpacity
                                style={[
                                    styles.optionButton,
                                    styles.skipButton,
                                    currentValue === '' && styles.selectedOption
                                ]}
                                onPress={() => handleStepInput('', step.field)}
                            >
                                <Text style={[
                                    styles.optionText,
                                    currentValue === '' && styles.selectedOptionText
                                ]}>
                                    Skip this question
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}

                {step.type === 'boolean' && (
                    <View style={styles.booleanContainer}>
                        <TouchableOpacity
                            style={[
                                styles.booleanButton,
                                currentValue === true && styles.selectedOption
                            ]}
                            onPress={() => handleStepInput(true, step.field)}
                        >
                            <Ionicons 
                                name="checkmark-circle" 
                                size={24} 
                                color={currentValue === true ? COLORS.white : COLORS.primary} 
                            />
                            <Text style={[
                                styles.booleanText,
                                currentValue === true && styles.selectedOptionText
                            ]}>
                                Yes
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.booleanButton,
                                currentValue === false && styles.selectedOption
                            ]}
                            onPress={() => handleStepInput(false, step.field)}
                        >
                            <Ionicons 
                                name="close-circle" 
                                size={24} 
                                color={currentValue === false ? COLORS.white : '#ef4444'} 
                            />
                            <Text style={[
                                styles.booleanText,
                                currentValue === false && styles.selectedOptionText
                            ]}>
                                No
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}

                {step.type === 'vehicles' && (
                    <View style={styles.vehiclesContainer}>
                        <View style={styles.vehicleItem}>
                            <Ionicons name="car" size={24} color={COLORS.primary} />
                            <Text style={styles.vehicleLabel}>Cars</Text>
                            <View style={styles.vehicleCounter}>
                                <TouchableOpacity
                                    style={styles.counterButton}
                                    onPress={() => handleVehicleChange('cars', false)}
                                >
                                    <Ionicons name="remove" size={16} color={COLORS.white} />
                                </TouchableOpacity>
                                <Text style={styles.counterText}>{signupData.vehicleOwnership.cars}</Text>
                                <TouchableOpacity
                                    style={styles.counterButton}
                                    onPress={() => handleVehicleChange('cars', true)}
                                >
                                    <Ionicons name="add" size={16} color={COLORS.white} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.vehicleItem}>
                            <Ionicons name="bicycle" size={24} color={COLORS.primary} />
                            <Text style={styles.vehicleLabel}>Two Wheelers</Text>
                            <View style={styles.vehicleCounter}>
                                <TouchableOpacity
                                    style={styles.counterButton}
                                    onPress={() => handleVehicleChange('twoWheelers', false)}
                                >
                                    <Ionicons name="remove" size={16} color={COLORS.white} />
                                </TouchableOpacity>
                                <Text style={styles.counterText}>{signupData.vehicleOwnership.twoWheelers}</Text>
                                <TouchableOpacity
                                    style={styles.counterButton}
                                    onPress={() => handleVehicleChange('twoWheelers', true)}
                                >
                                    <Ionicons name="add" size={16} color={COLORS.white} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.vehicleItem}>
                            <Ionicons name="bicycle" size={24} color={COLORS.primary} />
                            <Text style={styles.vehicleLabel}>Cycles</Text>
                            <View style={styles.vehicleCounter}>
                                <TouchableOpacity
                                    style={styles.counterButton}
                                    onPress={() => handleVehicleChange('cycles', false)}
                                >
                                    <Ionicons name="remove" size={16} color={COLORS.white} />
                                </TouchableOpacity>
                                <Text style={styles.counterText}>{signupData.vehicleOwnership.cycles}</Text>
                                <TouchableOpacity
                                    style={styles.counterButton}
                                    onPress={() => handleVehicleChange('cycles', true)}
                                >
                                    <Ionicons name="add" size={16} color={COLORS.white} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                )}
            </View>
        );
    };

    if (!showCarousel) {
        return (
            <KeyboardAvoidingView 
                style={styles.container} 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView contentContainerStyle={styles.scrollContainer}>
                    <View style={styles.header}>
                        {onBack && (
                            <TouchableOpacity style={styles.backButton} onPress={onBack}>
                                <Ionicons name="chevron-back" size={24} color={COLORS.primary} />
                                <Text style={styles.backText}>Back to Login</Text>
                            </TouchableOpacity>
                        )}
                        <Text style={styles.title}>Create Account</Text>
                        <Text style={styles.subtitle}>Join GetWay and start your journey</Text>
                    </View>

                    <View style={styles.formContainer}>
                        <View style={styles.inputContainer}>
                            <Ionicons name="mail-outline" size={20} color={COLORS.gray} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Email or Phone Number"
                                value={signupData.emailOrPhone}
                                onChangeText={(text) => setSignupData(prev => ({ ...prev, emailOrPhone: text }))}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Ionicons name="lock-closed-outline" size={20} color={COLORS.gray} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Password"
                                value={signupData.password}
                                onChangeText={(text) => setSignupData(prev => ({ ...prev, password: text }))}
                                secureTextEntry
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Ionicons name="lock-closed-outline" size={20} color={COLORS.gray} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Confirm Password"
                                value={signupData.confirmPassword}
                                onChangeText={(text) => setSignupData(prev => ({ ...prev, confirmPassword: text }))}
                                secureTextEntry
                            />
                        </View>

                        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
                            <Text style={styles.continueButtonText}>Continue</Text>
                            <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
                        </TouchableOpacity>
                    </View>
                </ScrollView>
                <Toast
                    visible={showToast}
                    message={toastMessage}
                    type={toastType}
                    onHide={() => setShowToast(false)}
                />
            </KeyboardAvoidingView>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.carouselHeader}>
                <TouchableOpacity onPress={goToPrevStep} disabled={currentStep === 0}>
                    <Ionicons 
                        name="chevron-back" 
                        size={24} 
                        color={currentStep === 0 ? COLORS.gray : COLORS.black} 
                    />
                </TouchableOpacity>
                
                <View style={styles.progressContainer}>
                    <Text style={styles.progressText}>{currentStep + 1} of {carouselSteps.length}</Text>
                    <View style={styles.progressBar}>
                        <View 
                            style={[
                                styles.progressFill, 
                                { width: `${((currentStep + 1) / carouselSteps.length) * 100}%` }
                            ]} 
                        />
                    </View>
                </View>

                <TouchableOpacity onPress={() => setShowCarousel(false)}>
                    <Ionicons name="close" size={24} color={COLORS.black} />
                </TouchableOpacity>
            </View>

            <ScrollView
                ref={scrollViewRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                scrollEnabled={false}
                style={styles.carousel}
                decelerationRate="fast"
                bounces={false}
                onLayout={(event) => {
                    const { width: layoutWidth } = event.nativeEvent.layout;
                    setScreenWidth(layoutWidth);
                    
                    // Ensure we're on the correct step after layout
                    if (currentStep > 0) {
                        requestAnimationFrame(() => {
                            scrollViewRef.current?.scrollTo({
                                x: currentStep * layoutWidth,
                                animated: false,
                            });
                        });
                    }
                }}
            >
                {carouselSteps.map((step, index) => (
                    <View key={step.id} style={[styles.carouselPage, { width: screenWidth }]}>
                        {renderStepContent(step, index)}
                    </View>
                ))}
            </ScrollView>

            <View style={styles.carouselFooter}>
                {currentStep === carouselSteps.length - 1 ? (
                    <TouchableOpacity style={styles.signupButton} onPress={handleSignup}>
                        <Text style={styles.signupButtonText}>Sign Up</Text>
                        <Ionicons name="checkmark" size={20} color={COLORS.white} />
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity 
                        style={[
                            styles.nextButton, 
                            !isCurrentStepValid() && styles.disabledButton
                        ]} 
                        onPress={goToNextStep}
                        disabled={!isCurrentStepValid()}
                    >
                        <Text style={[
                            styles.nextButtonText,
                            !isCurrentStepValid() && styles.disabledButtonText
                        ]}>
                            Next
                        </Text>
                        <Ionicons 
                            name="arrow-forward" 
                            size={20} 
                            color={isCurrentStepValid() ? COLORS.white : '#9ca3af'} 
                        />
                    </TouchableOpacity>
                )}
            </View>
            <Toast
                visible={showToast}
                message={toastMessage}
                type={toastType}
                onHide={() => setShowToast(false)}
            />
        </View>
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
        paddingHorizontal: SIZES.lg,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        marginBottom: SIZES.lg,
    },
    backText: {
        fontSize: SIZES.md,
        color: COLORS.primary,
        fontWeight: '500',
        marginLeft: SIZES.xs,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: COLORS.black,
        marginBottom: SIZES.xs,
    },
    subtitle: {
        fontSize: SIZES.md,
        color: COLORS.gray,
        textAlign: 'center',
    },
    formContainer: {
        width: '100%',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderRadius: 12,
        marginBottom: SIZES.md,
        paddingHorizontal: SIZES.md,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    inputIcon: {
        marginRight: SIZES.sm,
    },
    input: {
        flex: 1,
        paddingVertical: SIZES.md,
        fontSize: SIZES.md,
        color: COLORS.black,
    },
    continueButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.primary,
        paddingVertical: SIZES.md,
        borderRadius: 12,
        marginTop: SIZES.lg,
    },
    continueButtonText: {
        color: COLORS.white,
        fontSize: SIZES.lg,
        fontWeight: 'bold',
        marginRight: SIZES.xs,
    },
    carouselHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SIZES.lg,
        paddingTop: 50,
        paddingBottom: SIZES.md,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    progressContainer: {
        flex: 1,
        alignItems: 'center',
        marginHorizontal: SIZES.lg,
    },
    progressText: {
        fontSize: SIZES.sm,
        color: COLORS.gray,
        marginBottom: SIZES.xs,
    },
    progressBar: {
        width: '100%',
        height: 4,
        backgroundColor: '#e5e7eb',
        borderRadius: 2,
    },
    progressFill: {
        height: '100%',
        backgroundColor: COLORS.primary,
        borderRadius: 2,
    },
    carousel: {
        flex: 1,
    },
    carouselPage: {
        width: width,
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: SIZES.lg,
    },
    stepContainer: {
        alignItems: 'center',
    },
    stepTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.black,
        textAlign: 'center',
        marginBottom: SIZES.sm,
    },
    requiredMark: {
        color: '#ef4444',
        fontSize: 28,
        fontWeight: 'bold',
    },
    stepSubtitle: {
        fontSize: SIZES.md,
        color: COLORS.gray,
        textAlign: 'center',
        marginBottom: 40,
    },
    textInput: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        paddingHorizontal: SIZES.md,
        paddingVertical: SIZES.md,
        fontSize: SIZES.lg,
        color: COLORS.black,
        width: '100%',
        textAlign: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    errorInput: {
        borderWidth: 2,
        borderColor: '#ef4444',
    },
    optionsContainer: {
        width: '100%',
    },
    optionButton: {
        backgroundColor: COLORS.white,
        paddingVertical: SIZES.md,
        paddingHorizontal: SIZES.lg,
        borderRadius: 12,
        marginBottom: SIZES.sm,
        borderWidth: 2,
        borderColor: 'transparent',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    selectedOption: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    optionText: {
        fontSize: SIZES.md,
        color: COLORS.black,
        textAlign: 'center',
        fontWeight: '500',
    },
    selectedOptionText: {
        color: COLORS.white,
    },
    skipButton: {
        backgroundColor: '#f3f4f6',
    },
    booleanContainer: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
    },
    booleanButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.white,
        paddingVertical: SIZES.lg,
        borderRadius: 12,
        marginHorizontal: SIZES.xs,
        borderWidth: 2,
        borderColor: 'transparent',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    booleanText: {
        fontSize: SIZES.lg,
        fontWeight: 'bold',
        marginLeft: SIZES.xs,
        color: COLORS.black,
    },
    vehiclesContainer: {
        width: '100%',
    },
    vehicleItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        paddingVertical: SIZES.md,
        paddingHorizontal: SIZES.lg,
        borderRadius: 12,
        marginBottom: SIZES.md,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    vehicleLabel: {
        flex: 1,
        fontSize: SIZES.md,
        color: COLORS.black,
        fontWeight: '500',
        marginLeft: SIZES.sm,
    },
    vehicleCounter: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    counterButton: {
        backgroundColor: COLORS.primary,
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    counterText: {
        fontSize: SIZES.lg,
        fontWeight: 'bold',
        color: COLORS.black,
        marginHorizontal: SIZES.md,
        minWidth: 30,
        textAlign: 'center',
    },
    carouselFooter: {
        paddingHorizontal: SIZES.lg,
        paddingVertical: SIZES.lg,
        backgroundColor: COLORS.white,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    nextButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.primary,
        paddingVertical: SIZES.md,
        borderRadius: 12,
    },
    nextButtonText: {
        color: COLORS.white,
        fontSize: SIZES.lg,
        fontWeight: 'bold',
        marginRight: SIZES.xs,
    },
    signupButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#10b981',
        paddingVertical: SIZES.md,
        borderRadius: 12,
    },
    signupButtonText: {
        color: COLORS.white,
        fontSize: SIZES.lg,
        fontWeight: 'bold',
        marginRight: SIZES.xs,
    },
    disabledButton: {
        backgroundColor: '#d1d5db',
        opacity: 0.6,
    },
    disabledButtonText: {
        color: '#9ca3af',
    },
});

export default SignupScreen;
