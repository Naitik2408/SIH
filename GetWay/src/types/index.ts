export type UserRole = 'customer' | 'owner' | 'scientist';

// Fixed Data - Collected Once at Onboarding
export interface UserProfile {
    // Basic Demographics
    age?: number;
    gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
    occupation?: 'student' | 'employee' | 'homemaker' | 'retired' | 'self-employed' | 'unemployed' | 'other';

    // Household Information
    householdSize?: number;
    householdIncome?: 'below-25k' | '25k-50k' | '50k-100k' | '100k-200k' | '200k-500k' | 'above-500k' | 'prefer-not-to-say';

    // Vehicle Ownership
    vehicleOwnership?: {
        cars?: number;
        twoWheelers?: number;
        cycles?: number;
    };

    // Transport Usage
    usesPublicTransport?: boolean;

    // Profile completion for gamification
    profileCompletionPercentage?: number;
    lastUpdated?: Date;
}

// Semi-Fixed Data - Asked Occasionally
export interface UserTravelPreferences {
    monthlyTravelExpenditure?: 'below-1k' | '1k-3k' | '3k-5k' | '5k-10k' | 'above-10k';
    preferredTransportModes?: TransportMode[];
    lastUpdated?: Date;
}

// Enhanced User Interface
export interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    profile?: UserProfile;
    travelPreferences?: UserTravelPreferences;
    onboardingCompleted?: boolean;
    govCoins?: number;
    joinedAt?: Date;
    // Backend specific fields
    organizationId?: string;
    isApproved?: boolean;
    lastLogin?: string;
    isActive?: boolean;
}

// Transport and Travel Types
export type TransportMode = 'bus' | 'train' | 'metro' | 'auto' | 'taxi' | 'car' | 'bike' | 'cycle' | 'walking' | 'other';
export type TripPurpose = 'work' | 'education' | 'shopping' | 'leisure' | 'healthcare' | 'social' | 'personal' | 'other';
export type TripFrequency = 'daily' | 'weekly' | 'monthly' | 'rarely' | 'first-time';

// GPS Location Interface
export interface Location {
    latitude: number;
    longitude: number;
    address?: string;
    placeName?: string;
}

// Enhanced Travel Data - Dynamic Collection
export interface TravelData {
    id: string;
    userId: string;

    // Trip Details
    origin: Location;
    destination: Location;
    distance?: number; // in kilometers

    // Timing
    startTime: Date;
    endTime?: Date;
    duration?: number; // in minutes

    // Transport Details
    transportMode: TransportMode;
    transfers?: TransportMode[]; // For multi-modal trips

    // Trip Context
    purpose: TripPurpose;
    frequency?: TripFrequency;

    // Auto-detected patterns
    isRecurringTrip?: boolean;
    recurringTripId?: string;

    // User Experience
    satisfaction?: 1 | 2 | 3 | 4 | 5;
    issues?: string[];

    // Rewards
    govCoinsEarned?: number;

    // Data Quality
    dataSource: 'manual' | 'auto-gps' | 'smart-suggestion';
    accuracy?: 'high' | 'medium' | 'low';

    createdAt: Date;
    updatedAt?: Date;
}

// Smart Trip Suggestion
export interface TripSuggestion {
    id: string;
    userId: string;
    suggestedOrigin: Location;
    suggestedDestination: Location;
    suggestedMode: TransportMode;
    suggestedPurpose: TripPurpose;
    confidence: number; // 0-1
    basedOnPattern: 'time' | 'location' | 'frequency' | 'day-of-week';
    lastUsed: Date;
}

// Recurring Trip Pattern
export interface RecurringTrip {
    id: string;
    userId: string;
    origin: Location;
    destination: Location;
    preferredMode: TransportMode;
    purpose: TripPurpose;
    frequency: TripFrequency;
    usualTimes: string[]; // e.g., ['08:00', '17:30']
    daysOfWeek: number[]; // 0-6, Sunday=0
    isActive: boolean;
    tripCount: number;
    lastTripDate?: Date;
    createdAt: Date;
}

export interface OnboardingSlide {
    id: number;
    title: string;
    description: string;
    image?: string;
}

// Navigation Types
export type CustomerTabParamList = {
    Home: undefined;
    TripLogs: undefined;
    Blogs: undefined;
    Profile: undefined;
};

export type OwnerTabParamList = {
    Overview: undefined;
    Users: undefined;
    Reports: undefined;
    Profile: undefined;
};

export type ProfileStackParamList = {
    ProfileHome: undefined;
    Settings: undefined;
    Rewards: undefined;
    Help: undefined;
    About: undefined;
};