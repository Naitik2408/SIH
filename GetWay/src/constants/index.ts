export const COLORS = {
    primary: '#a28ef9',
    secondary: '#a4f5a6',
    accent: '#ffd89d',
    background: '#eceef0',
    white: '#ffffff',
    black: '#000000',

    // Text colors - from darkest to lightest
    textPrimary: '#1a1a1a',      // Main headings, most important text
    textSecondary: '#2d2d2d',    // Subheadings, important content
    textTertiary: '#4a4a4a',     // Body text, regular content
    textQuaternary: '#666666',   // Supporting text, less important
    textDisabled: '#999999',     // Disabled, placeholder text

    gray: '#666666',
    lightGray: '#f5f5f5',
    error: '#FF6B6B',
    success: '#4ECDC4',
};

export const FONTS = {
    // Primary font (Caprasimo) - for headings and important text
    primary: 'Caprasimo_400Regular',

    // Secondary font (Open Sans) - for body text
    regular: 'OpenSans_400Regular',
    medium: 'OpenSans_500Medium',
    semiBold: 'OpenSans_600SemiBold',
    bold: 'OpenSans_700Bold',

    // Fallback system fonts
    system: 'System',
};

export const SIZES = {
    // Typography scale based on header size of 20
    heading: 20,        // Main page headings (H1)
    subheading: 14,     // Section headings, important content (H2)
    body: 14,           // Main body text, primary content
    caption: 12,        // Supporting text, labels
    small: 10,          // Timestamps, minor details
    tiny: 8,            // Legal text, minimal importance

    // Legacy sizes for backwards compatibility
    xs: 8,
    sm: 12,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
};

export const DEMO_USERS = {
    customer: {
        email: 'customer@getway.com',
        password: 'customer123',
        name: 'John Customer',
        role: 'customer' as const,
    },
    scientist: {
        email: 'scientist@getway.com',
        password: 'scientist123',
        name: 'Dr. Sarah Scientist',
        role: 'scientist' as const,
    },
    owner: {
        email: 'owner@getway.com',
        password: 'owner123',
        name: 'Admin Owner',
        role: 'owner' as const,
    },
};
