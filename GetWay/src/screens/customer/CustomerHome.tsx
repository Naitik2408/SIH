import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Animated,
    FlatList,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS } from '../../constants';
import { User } from '../../types';

interface CustomerHomeProps {
    user: User;
    onNavigateToNotifications?: () => void;
}

interface SurveyQuestion {
    id: string;
    question: string;
    options: string[];
    defaultAnswer: number; // Index of default selected option
}

interface BenefitCard {
    id: string;
    title: string;
    description: string;
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
    points: string;
}

const { width: screenWidth } = Dimensions.get('window');
const CARD_WIDTH = screenWidth * 0.8;

const surveyQuestions: SurveyQuestion[] = [
    {
        id: '1',
        question: 'What is your primary mode of transport today?',
        options: ['Bus', 'Train', 'Auto/Taxi', 'Walking', 'Personal Vehicle'],
        defaultAnswer: 0
    },
    {
        id: '2',
        question: 'What is the purpose of your journey?',
        options: ['Work/Office', 'Education', 'Shopping', 'Healthcare', 'Leisure/Entertainment'],
        defaultAnswer: 0
    },
    {
        id: '3',
        question: 'How would you rate your current route satisfaction?',
        options: ['Very Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'Very Dissatisfied'],
        defaultAnswer: 2
    },
    {
        id: '4',
        question: 'What time of day are you traveling?',
        options: ['Early Morning (6-9 AM)', 'Morning (9-12 PM)', 'Afternoon (12-5 PM)', 'Evening (5-8 PM)', 'Night (8 PM+)'],
        defaultAnswer: 0
    },
    {
        id: '5',
        question: 'How many people are traveling with you?',
        options: ['Just me', '1 person', '2-3 people', '4-5 people', 'More than 5'],
        defaultAnswer: 0
    }
];

const benefitCards: BenefitCard[] = [
    {
        id: '1',
        title: 'Train Ticket Discounts',
        description: 'Get up to 15% off on train bookings using your earned points',
        icon: 'train-outline',
        color: '#10b981',
        points: '50 pts'
    },
    {
        id: '2',
        title: 'Government Service Benefits',
        description: 'Fast-track processing for passport, license & other govt services',
        icon: 'document-text-outline',
        color: '#3b82f6',
        points: '100 pts'
    },
    {
        id: '3',
        title: 'Bus & Metro Cashback',
        description: 'Earn 5% cashback on all public transport transactions',
        icon: 'bus-outline',
        color: '#f59e0b',
        points: '25 pts'
    },
    {
        id: '4',
        title: 'Exclusive Rewards',
        description: 'Unlock premium rewards and special offers from partner brands',
        icon: 'gift-outline',
        color: '#ef4444',
        points: '200 pts'
    }
];

const CustomerHome: React.FC<CustomerHomeProps> = ({ user, onNavigateToNotifications }) => {
    const [showSurvey, setShowSurvey] = React.useState(false);
    const [currentQuestion, setCurrentQuestion] = React.useState(0);
    const [journeyStarted, setJourneyStarted] = React.useState(false);
    const [answers, setAnswers] = React.useState<{ [key: string]: number }>(() => {
        // Initialize with default answers
        const defaultAnswers: { [key: string]: number } = {};
        surveyQuestions.forEach(q => {
            defaultAnswers[q.id] = q.defaultAnswer;
        });
        return defaultAnswers;
    });

    // Timer states
    const [elapsedTime, setElapsedTime] = React.useState(0);
    const timerRef = React.useRef<NodeJS.Timeout | null>(null);

    // Carousel states
    const [currentBenefitIndex, setCurrentBenefitIndex] = React.useState(0);
    const benefitFlatListRef = React.useRef<FlatList>(null);

    // ScrollView ref for smooth scrolling
    const scrollViewRef = React.useRef<ScrollView>(null);

    // Cleanup timer on unmount
    React.useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, []);

    // Animation for End Journey button
    const pulseAnim = React.useRef(new Animated.Value(1)).current;

    // Animation functions
    const startPulseAnimation = () => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.1,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    };

    const stopPulseAnimation = () => {
        pulseAnim.stopAnimation();
        Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
        }).start();
    };

    // Timer functions
    const startTimer = () => {
        setElapsedTime(0);
        timerRef.current = setInterval(() => {
            setElapsedTime(prev => prev + 1);
        }, 1000);
    };

    const stopTimer = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        setElapsedTime(0);
    };

    const formatTime = (seconds: number): string => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleStartJourney = () => {
        setShowSurvey(true);
        setCurrentQuestion(0);

        // Smooth scroll to bottom to show survey questions
        setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100); // Small delay to ensure survey is rendered first
    };

    const handleOptionSelect = (questionId: string, optionIndex: number) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: optionIndex
        }));
    };

    const handleNext = () => {
        if (currentQuestion < surveyQuestions.length - 1) {
            setCurrentQuestion(prev => prev + 1);
            // Keep survey in view when moving to next question
            setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
            }, 50);
        } else {
            // Survey completed - Journey started
            console.log('Survey completed:', answers);
            setShowSurvey(false);
            setCurrentQuestion(0);
            setJourneyStarted(true); // Mark journey as started

            // Start the timer and pulsing animation for End Journey button
            startTimer();
            startPulseAnimation();

            // Scroll to show the timer and end journey button
            setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
            }, 100);
            // Here you can navigate to trip logging or process the data
        }
    };

    const handlePrevious = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(prev => prev - 1);
            // Keep survey in view when moving to previous question
            setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
            }, 50);
        }
    };

    const handleEndJourney = () => {
        // Stop the timer and pulsing animation
        stopTimer();
        stopPulseAnimation();

        // End the journey and reset to initial state
        setJourneyStarted(false);
        // Reset answers to defaults
        const defaultAnswers: { [key: string]: number } = {};
        surveyQuestions.forEach(q => {
            defaultAnswers[q.id] = q.defaultAnswer;
        });
        setAnswers(defaultAnswers);
        console.log('Journey ended');
        // Here you can process end journey data
    };

    const renderBenefitCard = ({ item }: { item: BenefitCard }) => (
        <View style={styles.benefitCard}>
            <View style={styles.benefitCardHeader}>
                <View style={[styles.benefitIconContainer, { backgroundColor: `${item.color}15` }]}>
                    <Ionicons name={item.icon} size={24} color={item.color} />
                </View>
                <View style={[styles.pointsBadge, { backgroundColor: item.color }]}>
                    <Text style={styles.pointsText}>{item.points}</Text>
                </View>
            </View>
            <Text style={styles.benefitTitle}>{item.title}</Text>
            <Text style={styles.benefitDescription}>{item.description}</Text>
            <TouchableOpacity style={[styles.benefitButton, { borderColor: item.color }]}>
                <Text style={[styles.benefitButtonText, { color: item.color }]}>Learn More</Text>
                <Ionicons name="arrow-forward" size={14} color={item.color} />
            </TouchableOpacity>
        </View>
    );

    const onBenefitScroll = (event: any) => {
        const slideSize = CARD_WIDTH + 16; // Card width + margin
        const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);
        setCurrentBenefitIndex(index);
    };

    return (
        <ScrollView
            ref={scrollViewRef}
            style={styles.container}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
        >
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <Text style={styles.greeting}>Hello, {user.name}! 👋</Text>
                    <Text style={styles.subtitle}>Ready to log your journey?</Text>
                </View>
                <TouchableOpacity
                    style={styles.notificationButton}
                    onPress={onNavigateToNotifications}
                >
                    <Ionicons
                        name="notifications-outline"
                        size={SIZES.subheading + 2} // 18px - slightly larger than subheading
                        color={COLORS.textSecondary}
                    />
                    {/* Notification badge */}
                    <View style={styles.notificationBadge}>
                        <Text style={styles.badgeText}>3</Text>
                    </View>
                </TouchableOpacity>
            </View>

            <View style={styles.statsContainer}>
                <View style={styles.statCard}>
                    <View style={styles.statIconContainer}>
                        <Ionicons name="bus-outline" size={18} color={COLORS.primary} />
                    </View>
                    <Text style={styles.statNumber}>15</Text>
                    <Text style={styles.statLabel}>Trips Logged</Text>
                </View>
                <View style={styles.statCard}>
                    <View style={styles.statIconContainer}>
                        <Ionicons name="trophy-outline" size={18} color="#f59e0b" />
                    </View>
                    <Text style={styles.statNumber}>250</Text>
                    <Text style={styles.statLabel}>Points Earned</Text>
                </View>
                <View style={styles.statCard}>
                    <View style={styles.statIconContainer}>
                        <Ionicons name="trending-up-outline" size={18} color="#10b981" />
                    </View>
                    <Text style={styles.statNumber}>2</Text>
                    <Text style={styles.statLabel}>Routes Improved</Text>
                </View>
            </View>

            {/* Benefits Carousel */}
            <View style={styles.benefitsSection}>
                <Text style={styles.benefitsSectionTitle}>Your Rewards & Benefits</Text>
                <FlatList
                    ref={benefitFlatListRef}
                    data={benefitCards}
                    renderItem={renderBenefitCard}
                    keyExtractor={(item) => item.id}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    pagingEnabled={false}
                    snapToInterval={CARD_WIDTH + 16}
                    snapToAlignment="center"
                    decelerationRate="fast"
                    contentContainerStyle={styles.benefitCarouselContainer}
                    onScroll={onBenefitScroll}
                    scrollEventThrottle={16}
                />

                {/* Carousel Indicators */}
                <View style={styles.carouselIndicators}>
                    {benefitCards.map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.indicator,
                                index === currentBenefitIndex && styles.activeIndicator
                            ]}
                        />
                    ))}
                </View>
            </View>

            {/* Timer Display */}
            {journeyStarted && (
                <View style={styles.timerContainer}>
                    <View style={styles.timerCard}>
                        <Ionicons name="time-outline" size={20} color={COLORS.primary} />
                        <Text style={styles.timerLabel}>Journey Time</Text>
                        <Text style={styles.timerText}>{formatTime(elapsedTime)}</Text>
                    </View>
                </View>
            )}

            {/* Journey Button */}
            <View style={styles.startButtonContainer}>
                <Animated.View
                    style={[
                        { transform: [{ scale: journeyStarted ? pulseAnim : 1 }] }
                    ]}
                >
                    <TouchableOpacity
                        style={[
                            styles.startButton,
                            journeyStarted && styles.endJourneyButton
                        ]}
                        onPress={journeyStarted ? handleEndJourney : handleStartJourney}
                    >
                        <Ionicons
                            name={journeyStarted ? "stop-circle" : "play-circle"}
                            size={24}
                            color="#ffffff"
                            style={styles.startIcon}
                        />
                        <Text style={styles.startButtonText}>
                            {journeyStarted ? "End Journey" : "Start Journey"}
                        </Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>

            {/* Inline Survey Questions */}
            {showSurvey && (
                <View style={styles.inlineSurveyContainer}>
                    {/* Progress Bar */}
                    <View style={styles.progressBarContainer}>
                        <View
                            style={[
                                styles.progressBar,
                                { width: `${((currentQuestion + 1) / surveyQuestions.length) * 100}%` }
                            ]}
                        />
                    </View>

                    {/* Progress Text */}
                    <Text style={styles.progressText}>
                        Question {currentQuestion + 1} of {surveyQuestions.length}
                    </Text>

                    {/* Question */}
                    <Text style={styles.inlineQuestionText}>
                        {surveyQuestions[currentQuestion]?.question}
                    </Text>

                    {/* Options */}
                    <View style={styles.inlineOptionsContainer}>
                        {surveyQuestions[currentQuestion]?.options.map((option, index) => {
                            const isSelected = answers[surveyQuestions[currentQuestion].id] === index;
                            return (
                                <TouchableOpacity
                                    key={index}
                                    style={[
                                        styles.inlineOptionButton,
                                        isSelected && styles.selectedInlineOption
                                    ]}
                                    onPress={() => handleOptionSelect(surveyQuestions[currentQuestion].id, index)}
                                >
                                    <Text style={[
                                        styles.inlineOptionText,
                                        isSelected && styles.selectedInlineOptionText
                                    ]}>
                                        {option}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {/* Navigation Buttons */}
                    <View style={styles.inlineNavigationContainer}>
                        <TouchableOpacity
                            style={[
                                styles.inlineNavButton,
                                styles.inlinePreviousButton,
                                currentQuestion === 0 && styles.disabledButton
                            ]}
                            onPress={handlePrevious}
                            disabled={currentQuestion === 0}
                        >
                            <Text style={[
                                styles.inlineNavButtonText,
                                currentQuestion === 0 && styles.disabledButtonText
                            ]}>
                                Previous
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.inlineNavButton, styles.inlineNextButton]}
                            onPress={handleNext}
                        >
                            <Text style={styles.inlineNextButtonText}>
                                {currentQuestion === surveyQuestions.length - 1 ? 'Complete' : 'Next'}
                            </Text>
                            <Ionicons
                                name={currentQuestion === surveyQuestions.length - 1 ? 'checkmark' : 'arrow-forward'}
                                size={16}
                                color="#ffffff"
                                style={styles.navIcon}
                            />
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa', // Match CustomerTripLogs background
    },
    scrollContent: {
        paddingBottom: 120, // Extra padding to ensure content is above bottom navbar
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 24,
        backgroundColor: 'transparent', // Remove background for cleaner look
    },
    headerContent: {
        flex: 1,
        marginRight: 16, // Space between content and notification button
    },
    greeting: {
        fontSize: SIZES.heading, // 20 - Match trip logs title size
        fontFamily: FONTS.bold,
        color: COLORS.textPrimary, // Use hierarchy colors
        marginBottom: 4,
    },
    subtitle: {
        fontSize: SIZES.body, // 14 - Consistent with body text
        fontFamily: FONTS.regular,
        color: COLORS.textTertiary, // Less prominent subtitle
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        marginBottom: 24,
    },
    statCard: {
        backgroundColor: '#ffffff',
        padding: 16, // Reduced from 20 to 16
        borderRadius: 12, // Match notification button radius
        alignItems: 'center',
        flex: 1,
        marginHorizontal: 6, // Reduced from 8 to 6
        minHeight: 100, // Reduced from 120 to 100
        justifyContent: 'center',
        // Match notification button shadow exactly
        shadowColor: '#00000062',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    statIconContainer: {
        width: 36, // Reduced from 48 to 36
        height: 36, // Reduced from 48 to 36
        borderRadius: 18, // Adjusted for new size
        backgroundColor: 'rgba(162, 142, 249, 0.1)', // Light purple background
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8, // Reduced from 12 to 8
    },
    statNumber: {
        fontSize: SIZES.subheading, // 16 - Reduced from heading (20) to subheading
        fontFamily: FONTS.bold,
        color: COLORS.primary,
        marginBottom: 3, // Reduced from 4 to 3
    },
    statLabel: {
        fontSize: 11, // Slightly smaller than caption (12) for compact look
        fontFamily: FONTS.medium,
        color: COLORS.textTertiary, // Consistent with hierarchy
        textAlign: 'center',
        lineHeight: 14, // Better line height for small text
    },
    startButtonContainer: {
        paddingHorizontal: 20,
        paddingTop: 40, // Distance from stats cards
        alignItems: 'center',
    },
    startButton: {
        backgroundColor: COLORS.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        paddingHorizontal: 32,
        borderRadius: 25, // Pill shape
        minWidth: 180,
        // Enhanced shadow for prominence
        shadowColor: COLORS.primary,
        shadowOffset: {
            width: 0,
            height: 6,
        },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    startIcon: {
        marginRight: 8,
    },
    startButtonText: {
        color: '#ffffff',
        fontSize: SIZES.subheading, // 16
        fontFamily: FONTS.bold,
        letterSpacing: 0.5, // Slight letter spacing for prominence
    },
    notificationButton: {
        width: 35,
        height: 35,
        borderRadius: 12, // Perfectly round
        backgroundColor: '#ffffff',
        alignItems: 'center',
        justifyContent: 'center',
        // Shadow for floating effect
        shadowColor: '#00000062',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        // Position for absolute positioning if needed
        position: 'relative',
        marginTop: 4, // Slight alignment with greeting text
    },
    notificationBadge: {
        position: 'absolute',
        top: -2,
        right: -2,
        backgroundColor: COLORS.primary, // Red notification color
        width: 16,
        height: 16,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#ffffff', // White border to separate from button
    },
    badgeText: {
        fontSize: 10,
        fontFamily: FONTS.bold,
        color: '#ffffff',
        lineHeight: 12,
    },
    // Survey Modal Styles
    surveyContainer: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    surveyHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0, 0, 0, 0.05)',
    },
    closeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
    },
    surveyTitle: {
        fontSize: SIZES.subheading,
        fontFamily: FONTS.bold,
        color: COLORS.textPrimary,
    },
    surveyProgress: {
        fontSize: SIZES.caption,
        fontFamily: FONTS.medium,
        color: COLORS.textTertiary,
        minWidth: 50,
        textAlign: 'right',
    },
    progressBarContainer: {
        height: 4,
        backgroundColor: 'rgba(162, 142, 249, 0.2)',
        marginHorizontal: 20,
        borderRadius: 2,
        marginBottom: 20,
    },
    progressBar: {
        height: '100%',
        backgroundColor: COLORS.primary,
        borderRadius: 2,
    },
    questionContainer: {
        flex: 1,
        paddingHorizontal: 20,
    },
    questionText: {
        fontSize: SIZES.subheading,
        fontFamily: FONTS.bold,
        color: COLORS.textPrimary,
        marginBottom: 24,
        lineHeight: 24,
    },
    optionsContainer: {
        gap: 12,
    },
    optionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.05)',
        shadowColor: '#00000062',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    selectedOption: {
        borderColor: COLORS.primary,
        backgroundColor: 'rgba(162, 142, 249, 0.05)',
    },
    radioCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: COLORS.textDisabled,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    selectedRadio: {
        borderColor: COLORS.primary,
    },
    radioDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.primary,
    },
    optionText: {
        fontSize: SIZES.body,
        fontFamily: FONTS.regular,
        color: COLORS.textSecondary,
        flex: 1,
    },
    selectedOptionText: {
        color: COLORS.primary,
        fontFamily: FONTS.semiBold,
    },
    navigationContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 20,
        backgroundColor: '#ffffff',
        borderTopWidth: 1,
        borderTopColor: 'rgba(0, 0, 0, 0.05)',
        gap: 12,
    },
    navButton: {
        flex: 1,
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    previousButton: {
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
    },
    nextButton: {
        backgroundColor: COLORS.primary,
        flexDirection: 'row',
    },
    disabledButton: {
        backgroundColor: 'rgba(0, 0, 0, 0.02)',
    },
    navButtonText: {
        fontSize: SIZES.body,
        fontFamily: FONTS.semiBold,
        color: COLORS.textSecondary,
    },
    nextButtonText: {
        fontSize: SIZES.body,
        fontFamily: FONTS.semiBold,
        color: '#ffffff',
    },
    disabledButtonText: {
        color: COLORS.textDisabled,
    },
    navIcon: {
        marginLeft: 6,
    },
    endJourneyButton: {
        backgroundColor: '#ef4444', // Red color for end journey
        shadowColor: '#ef4444',
    },
    // Inline Survey Styles
    inlineSurveyContainer: {
        marginHorizontal: 20,
        marginTop: 24,
        padding: 20,
    },
    progressText: {
        fontSize: SIZES.caption,
        fontFamily: FONTS.medium,
        color: COLORS.textTertiary,
        textAlign: 'center',
        marginBottom: 16,
    },
    inlineQuestionText: {
        fontSize: SIZES.subheading,
        fontFamily: FONTS.bold,
        color: COLORS.textPrimary,
        marginBottom: 20,
        lineHeight: 22,
    },
    inlineOptionsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 10,
        marginBottom: 20,
    },
    inlineOptionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'transparent',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: COLORS.textDisabled,
    },
    selectedInlineOption: {
        borderColor: COLORS.primary,
        backgroundColor: COLORS.primary,
    },
    inlineOptionText: {
        fontSize: SIZES.body,
        fontFamily: FONTS.regular,
        color: COLORS.textSecondary,
    },
    selectedInlineOptionText: {
        color: '#ffffff',
        fontFamily: FONTS.semiBold,
    },
    inlineNavigationContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    inlineNavButton: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    inlinePreviousButton: {
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
    },
    inlineNextButton: {
        backgroundColor: COLORS.primary,
        flexDirection: 'row',
    },
    inlineNavButtonText: {
        fontSize: SIZES.body,
        fontFamily: FONTS.semiBold,
        color: COLORS.textSecondary,
    },
    inlineNextButtonText: {
        fontSize: SIZES.body,
        fontFamily: FONTS.semiBold,
        color: '#ffffff',
    },
    // Timer Styles
    timerContainer: {
        paddingHorizontal: 20,
        paddingTop: 20,
        alignItems: 'center',
    },
    timerCard: {
        backgroundColor: '#ffffff',
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#00000062',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        gap: 8,
    },
    timerLabel: {
        fontSize: SIZES.body,
        fontFamily: FONTS.medium,
        color: COLORS.textSecondary,
        marginLeft: 4,
    },
    timerText: {
        fontSize: SIZES.subheading,
        fontFamily: FONTS.bold,
        color: COLORS.primary,
        marginLeft: 8,
        minWidth: 60,
        textAlign: 'center',
    },
    // Benefits Carousel Styles
    benefitsSection: {
        paddingTop: 24,
        paddingBottom: 16,
    },
    benefitsSectionTitle: {
        fontSize: SIZES.subheading,
        fontFamily: FONTS.bold,
        color: COLORS.textPrimary,
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    benefitCarouselContainer: {
        paddingHorizontal: 20,
    },
    benefitCard: {
        width: CARD_WIDTH,
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 20,
        marginRight: 16,
        shadowColor: '#00000062',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 6,
    },
    benefitCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    benefitIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    pointsBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    pointsText: {
        fontSize: SIZES.caption,
        fontFamily: FONTS.bold,
        color: '#ffffff',
    },
    benefitTitle: {
        fontSize: SIZES.subheading,
        fontFamily: FONTS.bold,
        color: COLORS.textPrimary,
        marginBottom: 8,
        lineHeight: 20,
    },
    benefitDescription: {
        fontSize: SIZES.body,
        fontFamily: FONTS.regular,
        color: COLORS.textSecondary,
        lineHeight: 18,
        marginBottom: 16,
    },
    benefitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 1.5,
        backgroundColor: 'transparent',
        gap: 6,
    },
    benefitButtonText: {
        fontSize: SIZES.body,
        fontFamily: FONTS.semiBold,
    },
    carouselIndicators: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 16,
        gap: 8,
    },
    indicator: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
    },
    activeIndicator: {
        width: 20,
        backgroundColor: COLORS.primary,
    },
});

export default CustomerHome;
