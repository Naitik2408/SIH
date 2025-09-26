// temporalAnalytics.js - Temporal data processing utilities
import { fetchJourneyData } from '../services/apiService';

/**
 * Generates heatmap data for hourly patterns across the week
 * Creates a 7x24 grid showing trip intensity for each hour of each day
 */
export const generateHeatmapData = async () => {
    try {
        const response = await fetchJourneyData();
        const journeys = response.data || [];

        console.log('🔥 DEBUG Temporal Heatmap: Total journeys loaded:', journeys.length);

        // Initialize data structure for 7 days x 24 hours
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const hours = Array.from({ length: 24 }, (_, i) => i);
        const heatmapGrid = {};

        // Initialize grid with zero values
        days.forEach((day, dayIndex) => {
            hours.forEach(hour => {
                const key = `${day}-${hour}`;
                heatmapGrid[key] = {
                    day,
                    hour,
                    dayIndex,
                    intensity: 0,
                    trips: 0
                };
            });
        });

        // Process real journey data
        journeys.forEach((journey, index) => {
            const timestamp = journey.tripData?.timestamp;
            if (timestamp) {
                const date = new Date(timestamp);
                const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
                const hour = date.getHours();

                // Convert Sunday (0) to be at end, and adjust other days
                const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
                const dayName = days[adjustedDay];

                const key = `${dayName}-${hour}`;

                if (heatmapGrid[key]) {
                    heatmapGrid[key].trips += 1;
                }

                // Debug first few entries
                if (index < 5) {
                    console.log(`🔥 DEBUG Temporal Journey ${index + 1}:`, {
                        timestamp,
                        dayOfWeek,
                        adjustedDay,
                        dayName,
                        hour,
                        key
                    });
                }
            }
        });

        // Calculate intensity as percentage of maximum trips
        const maxTrips = Math.max(...Object.values(heatmapGrid).map(cell => cell.trips));
        console.log('🔥 DEBUG Temporal Heatmap: Max trips in any hour:', maxTrips);

        // Convert to array and calculate intensity
        const heatmapData = Object.values(heatmapGrid).map(cell => ({
            ...cell,
            intensity: maxTrips > 0 ? Math.round((cell.trips / maxTrips) * 100) : 0
        }));

        console.log('🔥 DEBUG Temporal Heatmap: Sample processed cells:', heatmapData.slice(0, 5));
        console.log('🔥 DEBUG Temporal Heatmap: Total cells with trips > 0:', heatmapData.filter(cell => cell.trips > 0).length);

        return heatmapData;

    } catch (error) {
        console.error('❌ Error generating temporal heatmap data:', error);
        // Return empty grid as fallback
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const hours = Array.from({ length: 24 }, (_, i) => i);
        const fallbackData = [];

        days.forEach((day, dayIndex) => {
            hours.forEach(hour => {
                fallbackData.push({
                    day,
                    hour,
                    dayIndex,
                    intensity: 0,
                    trips: 0
                });
            });
        });

        return fallbackData;
    }
};

/**
 * Generates peak hours data showing hourly trip distribution
 */
export const generatePeakHoursData = async () => {
    try {
        const response = await fetchJourneyData();
        const journeys = response.data || [];

        console.log('📈 DEBUG Temporal Peak Hours: Total journeys loaded:', journeys.length);

        // Initialize hourly data
        const hourlyData = Array.from({ length: 24 }, (_, hour) => ({
            hour: `${hour.toString().padStart(2, '0')}:00`,
            hourNum: hour,
            trips: 0,
            avgDuration: 0,
            totalDuration: 0,
            durationsCount: 0
        }));

        // Process journey data
        journeys.forEach((journey, index) => {
            const timestamp = journey.tripData?.timestamp;
            const duration = journey.tripData?.actualDuration;

            if (timestamp) {
                const date = new Date(timestamp);
                const hour = date.getHours();

                hourlyData[hour].trips += 1;

                // Add duration data if available
                if (duration && !isNaN(duration)) {
                    hourlyData[hour].totalDuration += duration;
                    hourlyData[hour].durationsCount += 1;
                }

                // Debug first few entries
                if (index < 5) {
                    console.log(`📈 DEBUG Temporal Peak Journey ${index + 1}:`, {
                        timestamp,
                        hour,
                        duration,
                        trips: hourlyData[hour].trips
                    });
                }
            }
        });

        // Calculate average durations
        hourlyData.forEach(hourData => {
            if (hourData.durationsCount > 0) {
                hourData.avgDuration = Math.round(hourData.totalDuration / hourData.durationsCount);
            } else {
                hourData.avgDuration = 25; // Default fallback
            }

            // Clean up temporary fields
            delete hourData.totalDuration;
            delete hourData.durationsCount;
        });

        console.log('📈 DEBUG Temporal Peak Hours: Sample processed data:', hourlyData.slice(8, 10));
        console.log('📈 DEBUG Temporal Peak Hours: Total trips across all hours:', hourlyData.reduce((sum, h) => sum + h.trips, 0));

        return hourlyData;

    } catch (error) {
        console.error('❌ Error generating peak hours data:', error);
        // Return fallback data
        return Array.from({ length: 24 }, (_, hour) => ({
            hour: `${hour.toString().padStart(2, '0')}:00`,
            hourNum: hour,
            trips: 0,
            avgDuration: 25
        }));
    }
};

/**
 * Generates weekday vs weekend comparison data
 */
export const generateWeekdayWeekendData = async () => {
    try {
        const response = await fetchJourneyData();
        const journeys = response.data || [];

        console.log('📊 DEBUG Temporal Weekday/Weekend: Total journeys loaded:', journeys.length);

        // Initialize hourly data for weekdays and weekends
        const hourlyComparison = Array.from({ length: 24 }, (_, hour) => ({
            hour: `${hour.toString().padStart(2, '0')}:00`,
            hourNum: hour,
            weekday: 0,
            weekend: 0
        }));

        // Process journey data
        journeys.forEach((journey, index) => {
            const timestamp = journey.tripData?.timestamp;

            if (timestamp) {
                const date = new Date(timestamp);
                const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
                const hour = date.getHours();

                // Classify as weekday (Mon-Fri) or weekend (Sat-Sun)
                const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

                if (isWeekend) {
                    hourlyComparison[hour].weekend += 1;
                } else {
                    hourlyComparison[hour].weekday += 1;
                }

                // Debug first few entries
                if (index < 5) {
                    console.log(`📊 DEBUG Temporal Weekday/Weekend Journey ${index + 1}:`, {
                        timestamp,
                        dayOfWeek,
                        hour,
                        isWeekend,
                        weekdayTotal: hourlyComparison[hour].weekday,
                        weekendTotal: hourlyComparison[hour].weekend
                    });
                }
            }
        });

        console.log('📊 DEBUG Temporal Weekday/Weekend: Sample processed data:', hourlyComparison.slice(8, 10));
        console.log('📊 DEBUG Temporal Weekday/Weekend: Total weekday trips:', hourlyComparison.reduce((sum, h) => sum + h.weekday, 0));
        console.log('📊 DEBUG Temporal Weekday/Weekend: Total weekend trips:', hourlyComparison.reduce((sum, h) => sum + h.weekend, 0));

        return hourlyComparison;

    } catch (error) {
        console.error('❌ Error generating weekday/weekend data:', error);
        // Return fallback data
        return Array.from({ length: 24 }, (_, hour) => ({
            hour: `${hour.toString().padStart(2, '0')}:00`,
            weekday: 0,
            weekend: 0
        }));
    }
};

/**
 * Gets temporal performance metrics and insights
 */
export const getTemporalMetrics = async () => {
    try {
        const response = await fetchJourneyData();
        const journeys = response.data || [];

        console.log('📊 DEBUG Temporal Metrics: Total journeys loaded:', journeys.length);

        // Initialize metrics
        let totalTrips = journeys.length;
        let peakHourTrips = 0;
        let peakHour = '08:00';
        let avgDuration = 0;
        let totalDuration = 0;
        let durationsCount = 0;

        // Hourly distribution for peak detection
        const hourlyDistribution = new Array(24).fill(0);

        // Process journeys for metrics
        journeys.forEach((journey) => {
            const timestamp = journey.tripData?.timestamp;
            const duration = journey.tripData?.actualDuration;

            if (timestamp) {
                const date = new Date(timestamp);
                const hour = date.getHours();
                hourlyDistribution[hour] += 1;
            }

            if (duration && !isNaN(duration)) {
                totalDuration += duration;
                durationsCount += 1;
            }
        });

        // Find peak hour
        const maxTripsInHour = Math.max(...hourlyDistribution);
        const peakHourIndex = hourlyDistribution.indexOf(maxTripsInHour);
        peakHour = `${peakHourIndex.toString().padStart(2, '0')}:00`;
        peakHourTrips = maxTripsInHour;

        // Calculate average duration
        if (durationsCount > 0) {
            avgDuration = Math.round(totalDuration / durationsCount);
        }

        // Calculate rush hour impact
        const morningRush = hourlyDistribution.slice(7, 10).reduce((sum, trips) => sum + trips, 0);
        const eveningRush = hourlyDistribution.slice(17, 20).reduce((sum, trips) => sum + trips, 0);
        const offPeakAvg = hourlyDistribution.reduce((sum, trips, hour) => {
            if (hour < 7 || (hour > 9 && hour < 17) || hour > 19) {
                return sum + trips;
            }
            return sum;
        }, 0) / 15; // 15 off-peak hours

        const rushHourTotal = morningRush + eveningRush;
        const rushHourImpact = offPeakAvg > 0 ? Math.round(((rushHourTotal / 6) / offPeakAvg - 1) * 100) : 0;

        const metrics = {
            totalTrips,
            peakHour,
            peakHourTrips,
            avgDuration,
            rushHourImpact,
            lastUpdated: new Date().toISOString()
        };

        console.log('📊 DEBUG Temporal Metrics: Final metrics:', metrics);

        return metrics;

    } catch (error) {
        console.error('❌ Error getting temporal metrics:', error);
        return {
            totalTrips: 0,
            peakHour: '08:00',
            peakHourTrips: 0,
            avgDuration: 0,
            rushHourImpact: 0,
            lastUpdated: new Date().toISOString()
        };
    }
};

/**
 * Combined temporal data generation for React Query
 */
export const generateTemporalData = async () => {
    try {
        const [
            heatmapData,
            peakHoursData,
            weekdayWeekendData,
            temporalMetrics
        ] = await Promise.all([
            generateHeatmapData(),
            generatePeakHoursData(),
            generateWeekdayWeekendData(),
            getTemporalMetrics()
        ]);

        return {
            heatmapData,
            peakHoursData,
            weekdayWeekendData,
            temporalMetrics,
            lastFetched: new Date().toISOString()
        };
    } catch (error) {
        console.error('Error generating temporal data:', error);
        throw error;
    }
};