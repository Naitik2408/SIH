// Example integration of smart data collection components
import React from 'react';
import { ProfileSetup, MonthlyCheckIn, SmartTripLogger } from '../subscreens';
import { User, UserProfile, UserTravelPreferences, TravelData } from '../../../types';

interface SmartDataCollectionExampleProps {
    user: User;
    onUserUpdate: (updatedUser: User) => void;
}

const SmartDataCollectionExample: React.FC<SmartDataCollectionExampleProps> = ({
    user,
    onUserUpdate
}) => {
    const [showProfileSetup, setShowProfileSetup] = React.useState(!user.onboardingCompleted);
    const [showMonthlyCheckIn, setShowMonthlyCheckIn] = React.useState(false);
    const [showTripLogger, setShowTripLogger] = React.useState(false);

    // Check if monthly check-in is due
    React.useEffect(() => {
        const lastUpdate = user.travelPreferences?.lastUpdated;
        if (lastUpdate) {
            const daysSinceUpdate = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24);
            if (daysSinceUpdate > 30) {
                // Show monthly check-in after 30 days
                setShowMonthlyCheckIn(true);
            }
        }
    }, [user.travelPreferences]);

    const handleProfileSetupComplete = (profile: UserProfile) => {
        const updatedUser: User = {
            ...user,
            profile,
            onboardingCompleted: true,
            govCoins: (user.govCoins || 0) + 50, // Onboarding reward
        };
        onUserUpdate(updatedUser);
        setShowProfileSetup(false);
    };

    const handleMonthlyCheckInComplete = (preferences: UserTravelPreferences) => {
        const updatedUser: User = {
            ...user,
            travelPreferences: preferences,
            govCoins: (user.govCoins || 0) + 25, // Check-in reward
        };
        onUserUpdate(updatedUser);
        setShowMonthlyCheckIn(false);
    };

    const handleTripComplete = (tripData: TravelData) => {
        // Save trip data to database
        console.log('Trip completed:', tripData);

        // Update user's GovCoins
        const updatedUser: User = {
            ...user,
            govCoins: (user.govCoins || 0) + (tripData.govCoinsEarned || 0),
        };
        onUserUpdate(updatedUser);
        setShowTripLogger(false);
    };

    // Mock trip suggestions based on user's pattern
    const getTripSuggestions = () => {
        if (!user.profile) return [];

        // In real app, this would come from ML/pattern recognition
        return [
            {
                id: 'suggestion_1',
                userId: user.id,
                suggestedOrigin: {
                    latitude: 28.6139,
                    longitude: 77.2090,
                    address: 'Home, Sector 15, Noida',
                    placeName: 'Home'
                },
                suggestedDestination: {
                    latitude: 28.5355,
                    longitude: 77.3910,
                    address: 'College Campus, Greater Noida',
                    placeName: 'College'
                },
                suggestedMode: 'bus' as const,
                suggestedPurpose: 'education' as const,
                confidence: 0.92,
                basedOnPattern: 'frequency' as const,
                lastUsed: new Date(),
            }
        ];
    };

    // Render appropriate screen based on flow
    if (showProfileSetup) {
        return (
            <ProfileSetup
                onComplete={handleProfileSetupComplete}
                onSkip={() => setShowProfileSetup(false)}
            />
        );
    }

    if (showMonthlyCheckIn) {
        return (
            <MonthlyCheckIn
                currentPreferences={user.travelPreferences}
                onComplete={handleMonthlyCheckInComplete}
                onSkip={() => setShowMonthlyCheckIn(false)}
            />
        );
    }

    if (showTripLogger) {
        return (
            <SmartTripLogger
                userId={user.id}
                suggestions={getTripSuggestions()}
                onTripComplete={handleTripComplete}
                onCancel={() => setShowTripLogger(false)}
            />
        );
    }

    // Regular app content with trigger buttons
    return (
        <div>
            <button onClick={() => setShowTripLogger(true)}>
                Start Trip Logging
            </button>
            <button onClick={() => setShowMonthlyCheckIn(true)}>
                Monthly Check-in
            </button>
            <button onClick={() => setShowProfileSetup(true)}>
                Edit Profile
            </button>
        </div>
    );
};

export default SmartDataCollectionExample;
