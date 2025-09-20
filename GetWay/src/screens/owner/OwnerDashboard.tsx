import React from 'react';
import { User } from '../../types';
import OwnerTabNavigator from '../../navigation/OwnerTabNavigator';

interface OwnerDashboardProps {
    user: User;
    onLogout: () => void;
}

const OwnerDashboard: React.FC<OwnerDashboardProps> = ({ user, onLogout }) => {
    return <OwnerTabNavigator user={user} onLogout={onLogout} />;
};

export default OwnerDashboard;
