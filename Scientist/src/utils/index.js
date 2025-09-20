// Date utilities
export const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

export const formatDateTime = (date) => {
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

// Data formatting utilities
export const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num);
};

export const formatPercentage = (num) => {
    return `${(num * 100).toFixed(1)}%`;
};

// Color utilities for charts
export const getRandomColor = () => {
    const colors = [
        '#3B82F6', '#EF4444', '#10B981', '#F59E0B',
        '#8B5CF6', '#06B6D4', '#F97316', '#84CC16'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
};

export const getStatusColor = (status) => {
    const statusColors = {
        active: 'text-green-600 bg-green-100',
        inactive: 'text-gray-600 bg-gray-100',
        warning: 'text-yellow-600 bg-yellow-100',
        error: 'text-red-600 bg-red-100',
    };
    return statusColors[status] || statusColors.inactive;
};
