import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import { COLORS, SIZES } from '../constants';
import { OnboardingSlide } from '../types';

const { width } = Dimensions.get('window');

const onboardingData: OnboardingSlide[] = [
    {
        id: 1,
        title: 'Welcome to GetWay',
        description: 'Your travel data helps build better transportation systems for everyone.',
    },
    {
        id: 2,
        title: 'Share Your Journey',
        description: 'Log your daily travels easily - we capture location automatically, you add the details.',
    },
    {
        id: 3,
        title: 'Make a Difference',
        description: 'Your contributions help plan new routes, optimize schedules, and improve public transport.',
    },
    {
        id: 4,
        title: 'Earn Rewards',
        description: 'Get points for each trip logged. Use them for metro recharge, bus passes, and more!',
    },
];

interface OnboardingScreenProps {
    onComplete: () => void;
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const handleNext = () => {
        if (currentIndex < onboardingData.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            onComplete();
        }
    };

    const handleSkip = () => {
        onComplete();
    };

    const renderSlide = (slide: OnboardingSlide) => (
        <View key={slide.id} style={styles.slide}>
            <View style={styles.illustration}>
                <Text style={styles.illustrationText}>🚌</Text>
            </View>
            <Text style={styles.title}>{slide.title}</Text>
            <Text style={styles.description}>{slide.description}</Text>
        </View>
    );

    const renderPagination = () => (
        <View style={styles.pagination}>
            {onboardingData.map((_, index) => (
                <View
                    key={index}
                    style={[
                        styles.dot,
                        index === currentIndex ? styles.activeDot : styles.inactiveDot,
                    ]}
                />
            ))}
        </View>
    );

    return (
        <View style={styles.container}>
            <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={(event) => {
                    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / width);
                    setCurrentIndex(slideIndex);
                }}
                scrollEventThrottle={16}
            >
                {onboardingData.map(renderSlide)}
            </ScrollView>

            {renderPagination()}

            <View style={styles.buttonContainer}>
                <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
                    <Text style={styles.skipText}>Skip</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleNext} style={styles.nextButton}>
                    <Text style={styles.nextText}>
                        {currentIndex === onboardingData.length - 1 ? 'Get Started' : 'Next'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    slide: {
        width,
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: SIZES.xl,
    },
    illustration: {
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SIZES.xxl,
    },
    illustrationText: {
        fontSize: 80,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.black,
        textAlign: 'center',
        marginBottom: SIZES.md,
    },
    description: {
        fontSize: SIZES.md,
        color: COLORS.gray,
        textAlign: 'center',
        lineHeight: 24,
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: SIZES.xl,
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginHorizontal: 5,
    },
    activeDot: {
        backgroundColor: COLORS.primary,
    },
    inactiveDot: {
        backgroundColor: COLORS.gray,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SIZES.xl,
        paddingBottom: SIZES.xxl,
    },
    skipButton: {
        paddingVertical: SIZES.md,
        paddingHorizontal: SIZES.lg,
    },
    skipText: {
        fontSize: SIZES.md,
        color: COLORS.gray,
    },
    nextButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: SIZES.md,
        paddingHorizontal: SIZES.xl,
        borderRadius: 25,
    },
    nextText: {
        fontSize: SIZES.md,
        color: COLORS.white,
        fontWeight: 'bold',
    },
});

export default OnboardingScreen;
