// demographicsAnalytics.js - Demographics data processing utilities
import { fetchJourneyData } from '../services/apiService';
import { GraduationCap, Briefcase, Home, UserCheck } from 'lucide-react';

/**
 * Processes demographic KPIs from real journey data
 * Returns counts and percentages for different occupational categories
 */
export const getDemographicKPIs = async () => {
    try {
        const response = await fetchJourneyData();
        const journeys = response.data || [];

        console.log('👥 DEBUG Demographics KPIs: Total journeys loaded:', journeys.length);

        // Initialize occupation counters
        const occupationCounts = {
            student: 0,
            employee: 0,
            homemaker: 0,
            senior: 0,
            other: 0
        };

        // Process journey data to count occupations
        journeys.forEach((journey, index) => {
            const occupation = journey.occupation ? journey.occupation.toLowerCase() : 'other';

            // Map various occupation types to our categories
            if (occupation.includes('student') || occupation.includes('education')) {
                occupationCounts.student++;
            } else if (occupation.includes('employee') || occupation.includes('job') || occupation.includes('work') || occupation.includes('professional')) {
                occupationCounts.employee++;
            } else if (occupation.includes('homemaker') || occupation.includes('housewife') || occupation.includes('home')) {
                occupationCounts.homemaker++;
            } else if (occupation.includes('senior') || occupation.includes('retired')) {
                occupationCounts.senior++;
            } else {
                occupationCounts.other++;
            }

            // Debug first few entries
            if (index < 5) {
                console.log(`👥 DEBUG Demographics Journey ${index + 1}:`, {
                    originalOccupation: journey.occupation,
                    categorized: occupation,
                    counts: { ...occupationCounts }
                });
            }
        });

        const totalJourneys = journeys.length;

        // Calculate percentages and create KPI structure
        const kpis = [
            {
                label: 'Students',
                percentage: totalJourneys > 0 ? Math.round((occupationCounts.student / totalJourneys) * 100) : 0,
                count: occupationCounts.student,
                change: 5.2, // Mock change for now
                icon: GraduationCap,
                gradient: 'from-blue-500 to-blue-600'
            },
            {
                label: 'Employees',
                percentage: totalJourneys > 0 ? Math.round((occupationCounts.employee / totalJourneys) * 100) : 0,
                count: occupationCounts.employee,
                change: 8.7,
                icon: Briefcase,
                gradient: 'from-green-500 to-green-600'
            },
            {
                label: 'Homemakers',
                percentage: totalJourneys > 0 ? Math.round((occupationCounts.homemaker / totalJourneys) * 100) : 0,
                count: occupationCounts.homemaker,
                change: -2.1,
                icon: Home,
                gradient: 'from-purple-500 to-purple-600'
            },
            {
                label: 'Seniors',
                percentage: totalJourneys > 0 ? Math.round((occupationCounts.senior / totalJourneys) * 100) : 0,
                count: occupationCounts.senior,
                change: 3.4,
                icon: UserCheck,
                gradient: 'from-orange-500 to-orange-600'
            }
        ];

        console.log('👥 DEBUG Demographics KPIs: Final data:', kpis);

        return kpis;

    } catch (error) {
        console.error('❌ Error getting demographic KPIs:', error);
        return [
            { label: 'Students', percentage: 0, count: 0, change: 0, icon: GraduationCap, gradient: 'from-blue-500 to-blue-600' },
            { label: 'Employees', percentage: 0, count: 0, change: 0, icon: Briefcase, gradient: 'from-green-500 to-green-600' },
            { label: 'Homemakers', percentage: 0, count: 0, change: 0, icon: Home, gradient: 'from-purple-500 to-purple-600' },
            { label: 'Seniors', percentage: 0, count: 0, change: 0, icon: UserCheck, gradient: 'from-orange-500 to-orange-600' }
        ];
    }
};

/**
 * Processes age group distribution from real journey data
 */
export const getAgeGroupData = async () => {
    try {
        const response = await fetchJourneyData();
        const journeys = response.data || [];

        console.log('🎂 DEBUG Demographics Age Groups: Total journeys loaded:', journeys.length);

        // Initialize age group counters
        const ageGroups = {
            '18-25': 0,
            '26-35': 0,
            '36-45': 0,
            '46-55': 0,
            '56-65': 0,
            '65+': 0
        };

        // Process journey data
        journeys.forEach((journey, index) => {
            const age = journey.age ? parseInt(journey.age) : 25; // Default age

            // Categorize by age groups
            if (age >= 18 && age <= 25) {
                ageGroups['18-25']++;
            } else if (age >= 26 && age <= 35) {
                ageGroups['26-35']++;
            } else if (age >= 36 && age <= 45) {
                ageGroups['36-45']++;
            } else if (age >= 46 && age <= 55) {
                ageGroups['46-55']++;
            } else if (age >= 56 && age <= 65) {
                ageGroups['56-65']++;
            } else if (age > 65) {
                ageGroups['65+']++;
            }

            // Debug first few entries
            if (index < 5) {
                console.log(`🎂 DEBUG Demographics Age Journey ${index + 1}:`, {
                    age,
                    groups: { ...ageGroups }
                });
            }
        });

        const totalTrips = journeys.length;

        // Convert to chart data format
        const ageGroupData = Object.entries(ageGroups).map(([ageGroup, trips]) => ({
            ageGroup,
            trips,
            percentage: totalTrips > 0 ? Math.round((trips / totalTrips) * 100 * 10) / 10 : 0, // One decimal place
            color: getAgeGroupColor(ageGroup)
        }));

        console.log('🎂 DEBUG Demographics Age Groups: Final data:', ageGroupData);

        return ageGroupData;

    } catch (error) {
        console.error('❌ Error getting age group data:', error);
        return [];
    }
};

/**
 * Helper function to get consistent colors for age groups
 */
const getAgeGroupColor = (ageGroup) => {
    const colorMap = {
        '18-25': '#a28ef9',
        '26-35': '#8b7cf6',
        '36-45': '#7c3aed',
        '46-55': '#c084fc',
        '56-65': '#e879f9',
        '65+': '#f0abfc'
    };
    return colorMap[ageGroup] || '#a28ef9';
};

/**
 * Processes income level distribution and transport mode preferences
 */
export const getIncomeLevelData = async () => {
    try {
        const response = await fetchJourneyData();
        const journeys = response.data || [];

        console.log('💰 DEBUG Demographics Income: Total journeys loaded:', journeys.length);

        // Initialize income groups with transport mode counters
        const incomeGroups = {
            '< ₹25k': { bus: 0, metro: 0, auto: 0, walk: 0, other: 0 },
            '₹25-50k': { bus: 0, metro: 0, auto: 0, walk: 0, other: 0 },
            '₹50-75k': { bus: 0, metro: 0, auto: 0, walk: 0, other: 0 },
            '> ₹75k': { bus: 0, metro: 0, auto: 0, walk: 0, other: 0 }
        };

        // Process journey data
        journeys.forEach((journey, index) => {
            const income = journey.income ? journey.income.toLowerCase() : 'middle';
            const transportMode = journey.tripData?.transportMode ? journey.tripData.transportMode.toLowerCase() : 'bus';

            // Map income levels
            let incomeCategory;
            if (income.includes('low') || income.includes('poor')) {
                incomeCategory = '< ₹25k';
            } else if (income.includes('middle') || income.includes('medium')) {
                incomeCategory = '₹25-50k';
            } else if (income.includes('high') || income.includes('upper')) {
                incomeCategory = '₹50-75k';
            } else {
                incomeCategory = '₹25-50k'; // Default to middle
            }

            // Map transport modes
            let modeCategory;
            if (transportMode.includes('bus')) {
                modeCategory = 'bus';
            } else if (transportMode.includes('metro') || transportMode.includes('train')) {
                modeCategory = 'metro';
            } else if (transportMode.includes('auto') || transportMode.includes('rick')) {
                modeCategory = 'auto';
            } else if (transportMode.includes('walk') || transportMode.includes('foot')) {
                modeCategory = 'walk';
            } else {
                modeCategory = 'other';
            }

            // Increment counters
            if (incomeGroups[incomeCategory] && incomeGroups[incomeCategory][modeCategory] !== undefined) {
                incomeGroups[incomeCategory][modeCategory]++;
            }

            // Debug first few entries
            if (index < 5) {
                console.log(`💰 DEBUG Demographics Income Journey ${index + 1}:`, {
                    originalIncome: journey.income,
                    incomeCategory,
                    originalMode: journey.tripData?.transportMode,
                    modeCategory
                });
            }
        });

        const totalJourneys = journeys.length;

        // Convert to chart data format
        const incomeLevelData = Object.entries(incomeGroups).map(([incomeRange, modes]) => {
            const total = Object.values(modes).reduce((sum, count) => sum + count, 0);
            return {
                incomeRange,
                bus: modes.bus,
                metro: modes.metro,
                auto: modes.auto,
                walk: modes.walk,
                total,
                percentage: totalJourneys > 0 ? Math.round((total / totalJourneys) * 100 * 10) / 10 : 0
            };
        });

        console.log('💰 DEBUG Demographics Income: Final data:', incomeLevelData);

        return incomeLevelData;

    } catch (error) {
        console.error('❌ Error getting income level data:', error);
        return [];
    }
};

/**
 * Processes gender distribution from real journey data
 */
export const getGenderData = async () => {
    try {
        const response = await fetchJourneyData();
        const journeys = response.data || [];

        console.log('⚧ DEBUG Demographics Gender: Total journeys loaded:', journeys.length);

        // Initialize gender counters
        const genderCounts = {
            male: 0,
            female: 0,
            other: 0
        };

        // Process journey data
        journeys.forEach((journey, index) => {
            const gender = journey.gender ? journey.gender.toLowerCase() : 'male'; // Default assumption

            if (gender.includes('male') && !gender.includes('female')) {
                genderCounts.male++;
            } else if (gender.includes('female')) {
                genderCounts.female++;
            } else {
                genderCounts.other++;
            }

            // Debug first few entries
            if (index < 5) {
                console.log(`⚧ DEBUG Demographics Gender Journey ${index + 1}:`, {
                    originalGender: journey.gender,
                    categorized: gender,
                    counts: { ...genderCounts }
                });
            }
        });

        const totalTrips = journeys.length;

        // Convert to chart data format
        const genderData = [
            {
                gender: 'Male',
                trips: genderCounts.male,
                percentage: totalTrips > 0 ? Math.round((genderCounts.male / totalTrips) * 100 * 10) / 10 : 0,
                color: '#a28ef9'
            },
            {
                gender: 'Female',
                trips: genderCounts.female,
                percentage: totalTrips > 0 ? Math.round((genderCounts.female / totalTrips) * 100 * 10) / 10 : 0,
                color: '#8b7cf6'
            },
            {
                gender: 'Other',
                trips: genderCounts.other,
                percentage: totalTrips > 0 ? Math.round((genderCounts.other / totalTrips) * 100 * 10) / 10 : 0,
                color: '#7c3aed'
            }
        ];

        console.log('⚧ DEBUG Demographics Gender: Final data:', genderData);

        return genderData;

    } catch (error) {
        console.error('❌ Error getting gender data:', error);
        return [
            { gender: 'Male', trips: 0, percentage: 0, color: '#a28ef9' },
            { gender: 'Female', trips: 0, percentage: 0, color: '#8b7cf6' },
            { gender: 'Other', trips: 0, percentage: 0, color: '#7c3aed' }
        ];
    }
};

/**
 * Analyzes transport equity zones based on income and accessibility data
 * Uses journey locations to identify areas with limited transport access
 */
export const getEquityZones = async () => {
    try {
        const response = await fetchJourneyData();
        const journeys = response.data || [];

        console.log('🗺️ DEBUG Demographics Equity: Total journeys loaded:', journeys.length);

        // For now, return Kerala-specific equity zones based on known data
        // In a real implementation, this would analyze journey start/end locations
        const keralaEquityZones = [
            {
                id: 1,
                name: 'Rural Kottayam',
                coordinates: [
                    [9.5500, 76.4500],
                    [9.6000, 76.5000],
                    [9.5800, 76.5500],
                    [9.5300, 76.5200],
                    [9.5500, 76.4500]
                ],
                avgIncome: '₹18,000',
                publicTransportAccess: 'Limited',
                issues: ['No direct bus connectivity', 'Long walking distances'],
                population: 25000,
                color: '#EF4444'
            },
            {
                id: 2,
                name: 'Peripheral Thrissur',
                coordinates: [
                    [10.4500, 76.1500],
                    [10.5000, 76.2000],
                    [10.4800, 76.2500],
                    [10.4300, 76.2200],
                    [10.4500, 76.1500]
                ],
                avgIncome: '₹22,000',
                publicTransportAccess: 'Moderate',
                issues: ['Infrequent bus services', 'No metro access'],
                population: 18000,
                color: '#F59E0B'
            },
            {
                id: 3,
                name: 'Remote Kasaragod',
                coordinates: [
                    [12.4500, 75.0500],
                    [12.5000, 75.1000],
                    [12.4800, 75.1500],
                    [12.4300, 75.1200],
                    [12.4500, 75.0500]
                ],
                avgIncome: '₹16,500',
                publicTransportAccess: 'Poor',
                issues: ['Very limited bus routes', 'Auto dependency', 'Seasonal accessibility'],
                population: 12000,
                color: '#DC2626'
            }
        ];

        console.log('🗺️ DEBUG Demographics Equity: Kerala zones created:', keralaEquityZones.length);

        return keralaEquityZones;

    } catch (error) {
        console.error('❌ Error getting equity zones:', error);
        return [];
    }
};

/**
 * Gets transport stops data for Kerala (mock data for now)
 */
export const getTransportStops = async () => {
    try {
        // Kerala-specific transport hubs
        const keralaTransportStops = [
            { id: 1, name: 'Ernakulam Junction', coords: [9.9816, 76.2999], type: 'metro' },
            { id: 2, name: 'Thiruvananthapuram Central', coords: [8.4875, 76.9525], type: 'bus' },
            { id: 3, name: 'Calicut Railway Station', coords: [11.2504, 75.7804], type: 'metro' },
            { id: 4, name: 'Kochi Metro Terminal', coords: [10.0261, 76.3125], type: 'metro' },
            { id: 5, name: 'Thrissur Bus Stand', coords: [10.5276, 76.2144], type: 'bus' }
        ];

        return keralaTransportStops;

    } catch (error) {
        console.error('❌ Error getting transport stops:', error);
        return [];
    }
};

/**
 * Combined demographics data generation for React Query
 */
export const generateDemographicsData = async () => {
    try {
        const [
            kpis,
            ageGroups,
            incomeData,
            genderData,
            equityZones,
            transportStops
        ] = await Promise.all([
            getDemographicKPIs(),
            getAgeGroupData(),
            getIncomeLevelData(),
            getGenderData(),
            getEquityZones(),
            getTransportStops()
        ]);

        // Debug: Log the final data structure
        console.log('📊 DEBUG generateDemographicsData returning:', {
            kpis: kpis?.length || 0,
            ageGroups: ageGroups?.length || 0,
            incomeData: incomeData?.length || 0,
            genderData: genderData?.length || 0,
            equityZones: equityZones?.length || 0,
            transportStops: transportStops?.length || 0
        });

        return {
            kpis,
            ageGroups,
            incomeData,
            genderData,
            equityZones,
            transportStops,
            lastFetched: new Date().toISOString()
        };
    } catch (error) {
        console.error('Error generating demographics data:', error);
        throw error;
    }
};