import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS } from '../../../../constants';
import { UserProfile } from '../../../../types';

interface ProfileSetupProps {
    onComplete: (profile: UserProfile) => void;
    onSkip?: () => void;
}

interface FormStep {
    id: string;
    title: string;
    subtitle: string;
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
    fields: FormField[];
}

interface FormField {
    key: keyof UserProfile;
    label: string;
    type: 'select' | 'number' | 'multi-select';
    options?: { label: string; value: any; icon?: keyof typeof Ionicons.glyphMap }[];
    optional?: boolean;
    reward?: number; // GovCoins for completing this field
}

const formSteps: FormStep[] = [
    {
        id: 'demographics',
        title: 'About You',
        subtitle: 'Help us personalize your experience',
        icon: 'person-outline',
        color: '#3b82f6',
        fields: [
            {
                key: 'age',
                label: 'Your Age',
                type: 'select',
                reward: 10,
                options: [
                    { label: 'Under 18', value: 17 },
                    { label: '18-25', value: 22 },
                    { label: '26-35', value: 30 },
                    { label: '36-45', value: 40 },
                    { label: '46-60', value: 53 },
                    { label: 'Above 60', value: 65 },
                ]
            },
            {
                key: 'gender',
                label: 'Gender',
                type: 'select',
                optional: true,
                reward: 5,
                options: [
                    { label: 'Male', value: 'male', icon: 'man-outline' },
                    { label: 'Female', value: 'female', icon: 'woman-outline' },
                    { label: 'Other', value: 'other' },
                    { label: 'Prefer not to say', value: 'prefer-not-to-say' },
                ]
            },
            {
                key: 'occupation',
                label: 'Occupation',
                type: 'select',
                reward: 15,
                options: [
                    { label: 'Student', value: 'student', icon: 'school-outline' },
                    { label: 'Employee', value: 'employee', icon: 'briefcase-outline' },
                    { label: 'Self-employed', value: 'self-employed', icon: 'business-outline' },
                    { label: 'Homemaker', value: 'homemaker', icon: 'home-outline' },
                    { label: 'Retired', value: 'retired', icon: 'flower-outline' },
                    { label: 'Unemployed', value: 'unemployed' },
                    { label: 'Other', value: 'other' },
                ]
            }
        ]
    },
    {
        id: 'household',
        title: 'Your Household',
        subtitle: 'Understanding your family setup helps us serve you better',
        icon: 'home-outline',
        color: '#10b981',
        fields: [
            {
                key: 'householdSize',
                label: 'Family Members (including you)',
                type: 'select',
                reward: 10,
                options: [
                    { label: '1 (Just me)', value: 1 },
                    { label: '2', value: 2 },
                    { label: '3', value: 3 },
                    { label: '4', value: 4 },
                    { label: '5', value: 5 },
                    { label: '6+', value: 6 },
                ]
            },
            {
                key: 'householdIncome',
                label: 'Household Income (Monthly)',
                type: 'select',
                optional: true,
                reward: 20,
                options: [
                    { label: 'Below ₹25,000', value: 'below-25k' },
                    { label: '₹25,000 - ₹50,000', value: '25k-50k' },
                    { label: '₹50,000 - ₹1,00,000', value: '50k-100k' },
                    { label: '₹1,00,000 - ₹2,00,000', value: '100k-200k' },
                    { label: '₹2,00,000 - ₹5,00,000', value: '200k-500k' },
                    { label: 'Above ₹5,00,000', value: 'above-500k' },
                    { label: 'Prefer not to say', value: 'prefer-not-to-say' },
                ]
            }
        ]
    },
    {
        id: 'transport',
        title: 'Your Transport',
        subtitle: 'Tell us about your current transport situation',
        icon: 'car-outline',
        color: '#f59e0b',
        fields: [
            {
                key: 'usesPublicTransport',
                label: 'Do you use public transport regularly?',
                type: 'select',
                reward: 15,
                options: [
                    { label: 'Yes, frequently', value: true, icon: 'checkmark-circle' },
                    { label: 'No, rarely', value: false, icon: 'close-circle' },
                ]
            }
        ]
    }
];

const ProfileSetup: React.FC<ProfileSetupProps> = ({ onComplete, onSkip }) => {
    const [currentStep, setCurrentStep] = React.useState(0);
    const [formData, setFormData] = React.useState<Partial<UserProfile>>({});
    const [vehicleData, setVehicleData] = React.useState({ cars: 0, twoWheelers: 0, cycles: 0 });

    const totalSteps = formSteps.length + 1; // +1 for vehicle ownership step
    const progress = ((currentStep + 1) / totalSteps) * 100;

    const totalReward = React.useMemo(() => {
        let reward = 0;
        formSteps.forEach(step => {
            step.fields.forEach(field => {
                if (formData[field.key] !== undefined && field.reward) {
                    reward += field.reward;
                }
            });
        });
        if (vehicleData.cars > 0 || vehicleData.twoWheelers > 0 || vehicleData.cycles > 0) {
            reward += 10; // Vehicle ownership reward
        }
        return reward;
    }, [formData, vehicleData]);

    const handleFieldSelect = (fieldKey: keyof UserProfile, value: any) => {
        setFormData(prev => ({
            ...prev,
            [fieldKey]: value
        }));
    };

    const handleNext = () => {
        if (currentStep < formSteps.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else if (currentStep === formSteps.length - 1) {
            // Move to vehicle ownership step
            setCurrentStep(formSteps.length);
        } else {
            // Complete onboarding
            const finalProfile: UserProfile = {
                ...formData,
                vehicleOwnership: vehicleData,
                profileCompletionPercentage: calculateCompletionPercentage(),
                lastUpdated: new Date(),
            };
            onComplete(finalProfile);
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const calculateCompletionPercentage = (): number => {
        const totalFields = formSteps.reduce((acc, step) => acc + step.fields.length, 0) + 1; // +1 for vehicle
        let completedFields = 0;

        formSteps.forEach(step => {
            step.fields.forEach(field => {
                if (formData[field.key] !== undefined) {
                    completedFields += 1;
                }
            });
        });

        if (vehicleData.cars > 0 || vehicleData.twoWheelers > 0 || vehicleData.cycles > 0) {
            completedFields += 1;
        }

        return Math.round((completedFields / totalFields) * 100);
    };

    const renderVehicleOwnership = () => (
        <View style={styles.stepContainer}>
            <View style={styles.stepHeader}>
                <View style={[styles.stepIcon, { backgroundColor: '#ef444415' }]}>
                    <Ionicons name="car-sport-outline" size={24} color="#ef4444" />
                </View>
                <Text style={styles.stepTitle}>Vehicle Ownership</Text>
                <Text style={styles.stepSubtitle}>How many vehicles does your household own?</Text>
            </View>

            <View style={styles.vehicleContainer}>
                {[
                    { key: 'cars', label: 'Cars', icon: 'car-outline' as keyof typeof Ionicons.glyphMap },
                    { key: 'twoWheelers', label: 'Two-wheelers', icon: 'bicycle-outline' as keyof typeof Ionicons.glyphMap },
                    { key: 'cycles', label: 'Cycles', icon: 'bicycle' as keyof typeof Ionicons.glyphMap },
                ].map((vehicle) => (
                    <View key={vehicle.key} style={styles.vehicleItem}>
                        <View style={styles.vehicleInfo}>
                            <Ionicons name={vehicle.icon} size={20} color={COLORS.textSecondary} />
                            <Text style={styles.vehicleLabel}>{vehicle.label}</Text>
                        </View>
                        <View style={styles.vehicleCounter}>
                            <TouchableOpacity
                                style={styles.counterButton}
                                onPress={() => setVehicleData(prev => ({
                                    ...prev,
                                    [vehicle.key]: Math.max(0, prev[vehicle.key as keyof typeof vehicleData] - 1)
                                }))}
                            >
                                <Ionicons name="remove" size={16} color={COLORS.textSecondary} />
                            </TouchableOpacity>
                            <Text style={styles.counterText}>
                                {vehicleData[vehicle.key as keyof typeof vehicleData]}
                            </Text>
                            <TouchableOpacity
                                style={styles.counterButton}
                                onPress={() => setVehicleData(prev => ({
                                    ...prev,
                                    [vehicle.key]: prev[vehicle.key as keyof typeof vehicleData] + 1
                                }))}
                            >
                                <Ionicons name="add" size={16} color={COLORS.textSecondary} />
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}
            </View>
        </View>
    );

    const renderStep = () => {
        if (currentStep >= formSteps.length) {
            return renderVehicleOwnership();
        }

        const step = formSteps[currentStep];

        return (
            <View style={styles.stepContainer}>
                <View style={styles.stepHeader}>
                    <View style={[styles.stepIcon, { backgroundColor: `${step.color}15` }]}>
                        <Ionicons name={step.icon} size={24} color={step.color} />
                    </View>
                    <Text style={styles.stepTitle}>{step.title}</Text>
                    <Text style={styles.stepSubtitle}>{step.subtitle}</Text>
                </View>

                <View style={styles.fieldsContainer}>
                    {step.fields.map((field) => (
                        <View key={field.key} style={styles.fieldContainer}>
                            <View style={styles.fieldHeader}>
                                <Text style={styles.fieldLabel}>{field.label}</Text>
                                {field.optional && <Text style={styles.optionalLabel}>Optional</Text>}
                                {field.reward && (
                                    <View style={styles.rewardBadge}>
                                        <Text style={styles.rewardText}>+{field.reward} coins</Text>
                                    </View>
                                )}
                            </View>

                            <View style={styles.optionsContainer}>
                                {field.options?.map((option) => (
                                    <TouchableOpacity
                                        key={option.value}
                                        style={[
                                            styles.optionButton,
                                            formData[field.key] === option.value && styles.selectedOption
                                        ]}
                                        onPress={() => handleFieldSelect(field.key, option.value)}
                                    >
                                        {option.icon && (
                                            <Ionicons
                                                name={option.icon}
                                                size={18}
                                                color={formData[field.key] === option.value ? '#ffffff' : COLORS.textSecondary}
                                            />
                                        )}
                                        <Text style={[
                                            styles.optionText,
                                            formData[field.key] === option.value && styles.selectedOptionText
                                        ]}>
                                            {option.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    ))}
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={handleBack}
                    disabled={currentStep === 0}
                >
                    <Ionicons
                        name="arrow-back"
                        size={24}
                        color={currentStep === 0 ? COLORS.textDisabled : COLORS.textPrimary}
                    />
                </TouchableOpacity>
                <View style={styles.headerContent}>
                    <Text style={styles.headerTitle}>Profile Setup</Text>
                    <Text style={styles.headerSubtitle}>Step {currentStep + 1} of {totalSteps}</Text>
                </View>
                <TouchableOpacity onPress={onSkip}>
                    <Text style={styles.skipText}>Skip</Text>
                </TouchableOpacity>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressContainer}>
                <View style={styles.progressBarBackground}>
                    <View style={[styles.progressBar, { width: `${progress}%` }]} />
                </View>
                <Text style={styles.progressText}>{Math.round(progress)}% Complete</Text>
            </View>

            {/* Reward Display */}
            {totalReward > 0 && (
                <View style={styles.rewardContainer}>
                    <Ionicons name="trophy" size={20} color="#f59e0b" />
                    <Text style={styles.rewardSummary}>You've earned {totalReward} GovCoins! 🎉</Text>
                </View>
            )}

            {/* Step Content */}
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {renderStep()}
            </ScrollView>

            {/* Navigation */}
            <View style={styles.navigation}>
                <TouchableOpacity
                    style={styles.nextButton}
                    onPress={handleNext}
                >
                    <Text style={styles.nextButtonText}>
                        {currentStep >= formSteps.length ? 'Complete Setup' : 'Continue'}
                    </Text>
                    <Ionicons name="arrow-forward" size={16} color="#ffffff" />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0, 0, 0, 0.05)',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        marginRight: 12,
    },
    headerContent: {
        flex: 1,
    },
    headerTitle: {
        fontSize: SIZES.heading,
        fontFamily: FONTS.bold,
        color: COLORS.textPrimary,
    },
    headerSubtitle: {
        fontSize: SIZES.body,
        fontFamily: FONTS.regular,
        color: COLORS.textSecondary,
    },
    skipText: {
        fontSize: SIZES.body,
        fontFamily: FONTS.semiBold,
        color: COLORS.primary,
    },
    progressContainer: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0, 0, 0, 0.05)',
    },
    progressBarBackground: {
        height: 6,
        backgroundColor: 'rgba(162, 142, 249, 0.2)',
        borderRadius: 3,
        marginBottom: 8,
    },
    progressBar: {
        height: '100%',
        backgroundColor: COLORS.primary,
        borderRadius: 3,
    },
    progressText: {
        fontSize: SIZES.body,
        fontFamily: FONTS.semiBold,
        color: COLORS.textSecondary,
        textAlign: 'center',
    },
    rewardContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        backgroundColor: '#fef3c7',
        marginHorizontal: 20,
        marginTop: 16,
        borderRadius: 12,
        gap: 8,
    },
    rewardSummary: {
        fontSize: SIZES.body,
        fontFamily: FONTS.semiBold,
        color: '#92400e',
    },
    scrollView: {
        flex: 1,
    },
    stepContainer: {
        padding: 20,
        gap: 24,
    },
    stepHeader: {
        alignItems: 'center',
        gap: 12,
    },
    stepIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
    },
    stepTitle: {
        fontSize: SIZES.heading,
        fontFamily: FONTS.bold,
        color: COLORS.textPrimary,
        textAlign: 'center',
    },
    stepSubtitle: {
        fontSize: SIZES.body,
        fontFamily: FONTS.regular,
        color: COLORS.textSecondary,
        textAlign: 'center',
        lineHeight: 20,
    },
    fieldsContainer: {
        gap: 24,
    },
    fieldContainer: {
        gap: 12,
    },
    fieldHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    fieldLabel: {
        fontSize: SIZES.subheading,
        fontFamily: FONTS.semiBold,
        color: COLORS.textPrimary,
        flex: 1,
    },
    optionalLabel: {
        fontSize: SIZES.caption,
        fontFamily: FONTS.medium,
        color: COLORS.textTertiary,
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    rewardBadge: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    rewardText: {
        fontSize: SIZES.caption,
        fontFamily: FONTS.bold,
        color: '#ffffff',
    },
    optionsContainer: {
        gap: 8,
    },
    optionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.1)',
        gap: 12,
    },
    selectedOption: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    optionText: {
        fontSize: SIZES.body,
        fontFamily: FONTS.medium,
        color: COLORS.textSecondary,
        flex: 1,
    },
    selectedOptionText: {
        color: '#ffffff',
        fontFamily: FONTS.semiBold,
    },
    vehicleContainer: {
        gap: 16,
    },
    vehicleItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#ffffff',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.1)',
    },
    vehicleInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    vehicleLabel: {
        fontSize: SIZES.body,
        fontFamily: FONTS.medium,
        color: COLORS.textPrimary,
    },
    vehicleCounter: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    counterButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    counterText: {
        fontSize: SIZES.subheading,
        fontFamily: FONTS.bold,
        color: COLORS.textPrimary,
        minWidth: 24,
        textAlign: 'center',
    },
    navigation: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#ffffff',
        borderTopWidth: 1,
        borderTopColor: 'rgba(0, 0, 0, 0.05)',
    },
    nextButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.primary,
        paddingVertical: 16,
        borderRadius: 12,
        gap: 8,
    },
    nextButtonText: {
        fontSize: SIZES.body,
        fontFamily: FONTS.semiBold,
        color: '#ffffff',
    },
});

export default ProfileSetup;
