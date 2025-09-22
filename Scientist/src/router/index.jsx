import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Dashboard from '../pages/Dashboard';
import Geospatial from '../pages/Geospatial';
import ODMatrix from '../pages/ODMatrix';
import ModePurpose from '../pages/ModePurpose';
import Temporal from '../pages/Temporal';
import Demographics from '../pages/Demographics';
import DemandModeling from '../pages/DemandModeling';
import Reports from '../pages/Reports';
import Alerts from '../pages/Alerts';
import Users from '../pages/Users';
import Admin from '../pages/Admin';
import SignUp from '../pages/SignUp';
import SignIn from '../pages/SignIn';
import ProtectedRoute from '../components/ProtectedRoute';

export const router = createBrowserRouter([
    {
        path: '/signin',
        element: <SignIn />,
    },
    {
        path: '/signup',
        element: <SignUp />,
    },
    {
        path: '/',
        element: (
            <ProtectedRoute>
                <MainLayout />
            </ProtectedRoute>
        ),
        children: [
            {
                index: true,
                element: <Dashboard />,
            },
            {
                path: 'geospatial',
                element: <Geospatial />,
            },
            {
                path: 'od-matrix',
                element: <ODMatrix />,
            },
            {
                path: 'mode-purpose',
                element: <ModePurpose />,
            },
            {
                path: 'temporal',
                element: <Temporal />,
            },
            {
                path: 'demographics',
                element: <Demographics />,
            },
            {
                path: 'demand-modeling',
                element: <DemandModeling />,
            },
            {
                path: 'reports',
                element: <Reports />,
            },
            {
                path: 'alerts',
                element: <Alerts />,
            },
            {
                path: 'users',
                element: <Users />,
            },
            {
                path: 'admin',
                element: <Admin />,
            },
        ],
    },
]);
