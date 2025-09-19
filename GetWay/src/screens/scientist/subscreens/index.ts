// Scientist subscreens exports
export { default as DataVisualization } from './analytics/DataVisualization';
export { default as ReportGenerator } from './reports/ReportGenerator';

// Navigation helper types for scientist screens
export interface ScientistScreenProps {
    navigation: any;
    route?: any;
}

// Additional analytics components can be added here
export interface AnalyticsComponentProps {
    data?: any[];
    title?: string;
    onPress?: () => void;
}
