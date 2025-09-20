import React, { useState } from 'react';
import {
    User,
    Mail,
    Phone,
    Building,
    Shield,
    Edit3,
    Save,
    X,
    Moon,
    Sun,
    Bell,
    BellOff,
    Download,
    FileText,
    Calendar,
    Clock,
    MapPin,
    BarChart3,
    Users,
    TrendingUp,
    Activity,
    Settings,
    LogOut,
    Eye,
    EyeOff,
    Lock,
    Globe,
    Smartphone,
    Monitor,
    CheckCircle,
    AlertCircle,
    Trash2,
    ExternalLink
} from 'lucide-react';

// Dummy user data
const initialUserData = {
    id: 'SCI001',
    name: 'Dr. Priya Sharma',
    email: 'priya.sharma@transportresearch.gov.in',
    phone: '+91-9876543210',
    organization: 'National Transportation Research Institute',
    role: 'Senior Transportation Analyst',
    department: 'Urban Mobility Analytics',
    joinDate: '2022-03-15',
    location: 'New Delhi, India',
    avatar: null,
    bio: 'Specialized in urban transportation analytics, demand modeling, and sustainable mobility solutions. PhD in Transportation Engineering from IIT Delhi.',
    expertise: ['Demand Modeling', 'Geospatial Analysis', 'Traffic Flow Analysis', 'Sustainable Transportation'],
    publications: 23,
    projectsCompleted: 47
};

// Dummy saved reports data
const savedReports = [
    {
        id: 'RPT001',
        title: 'Q3 2025 Urban Mobility Analysis',
        type: 'Dashboard Report',
        generatedDate: '2025-09-18',
        fileSize: '2.4 MB',
        format: 'PDF',
        pages: 24,
        status: 'completed'
    },
    {
        id: 'RPT002',
        title: 'Metro Corridor Demand Forecast',
        type: 'Demand Modeling',
        generatedDate: '2025-09-15',
        fileSize: '1.8 MB',
        format: 'Excel',
        pages: 12,
        status: 'completed'
    },
    {
        id: 'RPT003',
        title: 'Geospatial Heat Map Analysis',
        type: 'Geospatial Report',
        generatedDate: '2025-09-12',
        fileSize: '3.2 MB',
        format: 'PDF',
        pages: 18,
        status: 'completed'
    },
    {
        id: 'RPT004',
        title: 'Demographic Travel Patterns Study',
        type: 'Demographics Report',
        generatedDate: '2025-09-10',
        fileSize: '2.1 MB',
        format: 'PDF',
        pages: 15,
        status: 'completed'
    },
    {
        id: 'RPT005',
        title: 'Modal Share Analysis - August 2025',
        type: 'Mode Analysis',
        generatedDate: '2025-09-08',
        fileSize: '1.5 MB',
        format: 'Excel',
        pages: 8,
        status: 'processing'
    },
    {
        id: 'RPT006',
        title: 'Temporal Traffic Flow Report',
        type: 'Temporal Analysis',
        generatedDate: '2025-09-05',
        fileSize: '2.8 MB',
        format: 'PDF',
        pages: 21,
        status: 'completed'
    }
];

const Profile = () => {
    const [userData, setUserData] = useState(initialUserData);
    const [isEditing, setIsEditing] = useState(false);
    const [editedData, setEditedData] = useState(initialUserData);
    const [showPasswordChange, setShowPasswordChange] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });
    const [preferences, setPreferences] = useState({
        darkMode: false,
        emailNotifications: true,
        pushNotifications: true,
        smsNotifications: false,
        reportAlerts: true,
        systemUpdates: true,
        marketingEmails: false,
        language: 'en',
        timezone: 'Asia/Kolkata',
        dateFormat: 'DD/MM/YYYY',
        autoSave: true
    });
    const [activeTab, setActiveTab] = useState('profile');

    // Handle profile editing
    const handleEdit = () => {
        setIsEditing(true);
        setEditedData(userData);
    };

    const handleSave = () => {
        setUserData(editedData);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditedData(userData);
        setIsEditing(false);
    };

    const handleInputChange = (field, value) => {
        setEditedData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Handle password change
    const handlePasswordChange = (field, value) => {
        setPasswordData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handlePasswordSubmit = () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            alert('New passwords do not match!');
            return;
        }
        if (passwordData.newPassword.length < 8) {
            alert('Password must be at least 8 characters long!');
            return;
        }

        console.log('Password change request:', {
            userId: userData.id,
            timestamp: new Date().toISOString()
        });

        alert('Password changed successfully!');
        setPasswordData({
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        });
        setShowPasswordChange(false);
    };

    // Handle preferences
    const handlePreferenceChange = (key, value) => {
        setPreferences(prev => ({
            ...prev,
            [key]: value
        }));
    };

    // Handle report actions
    const handleDownloadReport = (report) => {
        console.log('Downloading report:', report);
        alert(`Downloading ${report.title}...`);
    };

    const handleDeleteReport = (reportId) => {
        if (window.confirm('Are you sure you want to delete this report?')) {
            console.log('Deleting report:', reportId);
            alert('Report deleted successfully!');
        }
    };

    const handleViewReport = (report) => {
        console.log('Viewing report:', report);
        alert(`Opening ${report.title} in viewer...`);
    };

    // Handle logout
    const handleLogout = () => {
        if (window.confirm('Are you sure you want to logout?')) {
            console.log('User logout:', userData.id);
            alert('Logging out... (In a real app, this would redirect to login)');
        }
    };

    // Toggle password visibility
    const togglePasswordVisibility = (field) => {
        setShowPasswords(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    const getReportIcon = (type) => {
        switch (type) {
            case 'Dashboard Report': return <BarChart3 className="w-4 h-4" />;
            case 'Demand Modeling': return <TrendingUp className="w-4 h-4" />;
            case 'Geospatial Report': return <MapPin className="w-4 h-4" />;
            case 'Demographics Report': return <Users className="w-4 h-4" />;
            case 'Mode Analysis': return <Activity className="w-4 h-4" />;
            case 'Temporal Analysis': return <Clock className="w-4 h-4" />;
            default: return <FileText className="w-4 h-4" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'text-green-600 bg-green-100';
            case 'processing': return 'text-yellow-600 bg-yellow-100';
            case 'failed': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Profile & Settings</h1>
                <p className="text-gray-600 mt-2">Manage your profile, preferences, and account settings</p>
            </div>

            {/* Main Layout */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Left Column - Profile Card */}
                <div className="xl:col-span-1 space-y-6">
                    {/* Profile Card */}
                    <div className="bg-white rounded-2xl shadow-md border overflow-hidden">
                        {/* Profile Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-24"></div>

                        {/* Profile Content */}
                        <div className="p-6 -mt-12 relative">
                            {/* Avatar */}
                            <div className="relative mb-4">
                                <div className="w-20 h-20 bg-white rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                                    <User className="w-10 h-10 text-gray-400" />
                                </div>
                                <button className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-1.5 hover:bg-blue-700 transition-colors">
                                    <Edit3 className="w-3 h-3" />
                                </button>
                            </div>

                            {/* Profile Info */}
                            <div className="space-y-3">
                                {isEditing ? (
                                    <div className="space-y-3">
                                        <input
                                            type="text"
                                            value={editedData.name}
                                            onChange={(e) => handleInputChange('name', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-semibold"
                                        />
                                        <input
                                            type="email"
                                            value={editedData.email}
                                            onChange={(e) => handleInputChange('email', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                        <input
                                            type="tel"
                                            value={editedData.phone}
                                            onChange={(e) => handleInputChange('phone', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                        <textarea
                                            value={editedData.bio}
                                            onChange={(e) => handleInputChange('bio', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            rows="3"
                                        />
                                    </div>
                                ) : (
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">{userData.name}</h2>
                                        <p className="text-blue-600 font-medium">{userData.role}</p>
                                        <p className="text-gray-600 text-sm mt-2">{userData.bio}</p>
                                    </div>
                                )}

                                {/* Contact Info */}
                                <div className="space-y-2 pt-4 border-t border-gray-200">
                                    <div className="flex items-center text-sm text-gray-600">
                                        <Mail className="w-4 h-4 mr-2" />
                                        {userData.email}
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600">
                                        <Phone className="w-4 h-4 mr-2" />
                                        {userData.phone}
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600">
                                        <Building className="w-4 h-4 mr-2" />
                                        {userData.organization}
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600">
                                        <MapPin className="w-4 h-4 mr-2" />
                                        {userData.location}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="pt-4 border-t border-gray-200">
                                    {isEditing ? (
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={handleSave}
                                                className="flex-1 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                                            >
                                                <Save className="w-4 h-4 mr-2" />
                                                Save
                                            </button>
                                            <button
                                                onClick={handleCancel}
                                                className="flex-1 bg-gray-600 text-white px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center"
                                            >
                                                <X className="w-4 h-4 mr-2" />
                                                Cancel
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={handleEdit}
                                            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                                        >
                                            <Edit3 className="w-4 h-4 mr-2" />
                                            Edit Profile
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="bg-white rounded-2xl shadow-md border p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Stats</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Publications</span>
                                <span className="font-semibold text-blue-600">{userData.publications}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Projects Completed</span>
                                <span className="font-semibold text-green-600">{userData.projectsCompleted}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Member Since</span>
                                <span className="font-semibold text-purple-600">
                                    {new Date(userData.joinDate).toLocaleDateString()}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Reports Generated</span>
                                <span className="font-semibold text-orange-600">{savedReports.length}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Settings */}
                <div className="xl:col-span-2 space-y-6">
                    {/* Settings Tabs */}
                    <div className="bg-white rounded-2xl shadow-md border">
                        <div className="border-b border-gray-200">
                            <nav className="flex space-x-8 px-6">
                                <button
                                    onClick={() => setActiveTab('profile')}
                                    className={`py-4 px-2 border-b-2 font-medium text-sm ${activeTab === 'profile'
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    <Settings className="w-4 h-4 inline mr-2" />
                                    Account Settings
                                </button>
                                <button
                                    onClick={() => setActiveTab('preferences')}
                                    className={`py-4 px-2 border-b-2 font-medium text-sm ${activeTab === 'preferences'
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    <Bell className="w-4 h-4 inline mr-2" />
                                    Preferences
                                </button>
                            </nav>
                        </div>

                        <div className="p-6">
                            {activeTab === 'profile' && (
                                <div className="space-y-6">
                                    {/* Change Password Section */}
                                    <div>
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-semibold text-gray-800">Security</h3>
                                            <button
                                                onClick={() => setShowPasswordChange(!showPasswordChange)}
                                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                                            >
                                                <Lock className="w-4 h-4 mr-2" />
                                                Change Password
                                            </button>
                                        </div>

                                        {showPasswordChange && (
                                            <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Current Password
                                                    </label>
                                                    <div className="relative">
                                                        <input
                                                            type={showPasswords.current ? 'text' : 'password'}
                                                            value={passwordData.currentPassword}
                                                            onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                                                            placeholder="Enter current password"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => togglePasswordVisibility('current')}
                                                            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                                                        >
                                                            {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                        </button>
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        New Password
                                                    </label>
                                                    <div className="relative">
                                                        <input
                                                            type={showPasswords.new ? 'text' : 'password'}
                                                            value={passwordData.newPassword}
                                                            onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                                                            placeholder="Enter new password"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => togglePasswordVisibility('new')}
                                                            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                                                        >
                                                            {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                        </button>
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Confirm New Password
                                                    </label>
                                                    <div className="relative">
                                                        <input
                                                            type={showPasswords.confirm ? 'text' : 'password'}
                                                            value={passwordData.confirmPassword}
                                                            onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                                                            placeholder="Confirm new password"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => togglePasswordVisibility('confirm')}
                                                            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                                                        >
                                                            {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="flex space-x-3 pt-2">
                                                    <button
                                                        onClick={handlePasswordSubmit}
                                                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                                                    >
                                                        Update Password
                                                    </button>
                                                    <button
                                                        onClick={() => setShowPasswordChange(false)}
                                                        className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Account Information */}
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Account Information</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    User ID
                                                </label>
                                                <input
                                                    type="text"
                                                    value={userData.id}
                                                    disabled
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Department
                                                </label>
                                                <input
                                                    type="text"
                                                    value={userData.department}
                                                    disabled
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Join Date
                                                </label>
                                                <input
                                                    type="text"
                                                    value={new Date(userData.joinDate).toLocaleDateString()}
                                                    disabled
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Account Status
                                                </label>
                                                <div className="flex items-center">
                                                    <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                                                    <span className="text-green-600 font-medium">Active</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'preferences' && (
                                <div className="space-y-6">
                                    {/* Appearance */}
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Appearance</h3>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center">
                                                    {preferences.darkMode ? <Moon className="w-5 h-5 mr-3 text-blue-600" /> : <Sun className="w-5 h-5 mr-3 text-yellow-600" />}
                                                    <div>
                                                        <p className="font-medium text-gray-800">Dark Mode</p>
                                                        <p className="text-sm text-gray-600">Toggle dark theme</p>
                                                    </div>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={preferences.darkMode}
                                                        onChange={(e) => handlePreferenceChange('darkMode', e.target.checked)}
                                                        className="sr-only peer"
                                                    />
                                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                                </label>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Language
                                                    </label>
                                                    <select
                                                        value={preferences.language}
                                                        onChange={(e) => handlePreferenceChange('language', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    >
                                                        <option value="en">English</option>
                                                        <option value="hi">हिन्दी (Hindi)</option>
                                                        <option value="bn">বাংলা (Bengali)</option>
                                                        <option value="ta">தமிழ் (Tamil)</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Date Format
                                                    </label>
                                                    <select
                                                        value={preferences.dateFormat}
                                                        onChange={(e) => handlePreferenceChange('dateFormat', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    >
                                                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Notifications */}
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Notification Settings</h3>
                                        <div className="space-y-4">
                                            {[
                                                { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive notifications via email', icon: Mail },
                                                { key: 'pushNotifications', label: 'Push Notifications', desc: 'Browser push notifications', icon: Monitor },
                                                { key: 'smsNotifications', label: 'SMS Notifications', desc: 'Text message alerts', icon: Smartphone },
                                                { key: 'reportAlerts', label: 'Report Alerts', desc: 'Notifications for report generation', icon: FileText },
                                                { key: 'systemUpdates', label: 'System Updates', desc: 'Platform updates and maintenance', icon: Settings },
                                                { key: 'marketingEmails', label: 'Marketing Emails', desc: 'Product updates and newsletters', icon: Globe }
                                            ].map((item) => (
                                                <div key={item.key} className="flex items-center justify-between">
                                                    <div className="flex items-center">
                                                        <item.icon className="w-5 h-5 mr-3 text-gray-600" />
                                                        <div>
                                                            <p className="font-medium text-gray-800">{item.label}</p>
                                                            <p className="text-sm text-gray-600">{item.desc}</p>
                                                        </div>
                                                    </div>
                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={preferences[item.key]}
                                                            onChange={(e) => handlePreferenceChange(item.key, e.target.checked)}
                                                            className="sr-only peer"
                                                        />
                                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* System Preferences */}
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4">System Preferences</h3>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center">
                                                    <Save className="w-5 h-5 mr-3 text-gray-600" />
                                                    <div>
                                                        <p className="font-medium text-gray-800">Auto Save</p>
                                                        <p className="text-sm text-gray-600">Automatically save work in progress</p>
                                                    </div>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={preferences.autoSave}
                                                        onChange={(e) => handlePreferenceChange('autoSave', e.target.checked)}
                                                        className="sr-only peer"
                                                    />
                                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                                </label>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Timezone
                                                </label>
                                                <select
                                                    value={preferences.timezone}
                                                    onChange={(e) => handlePreferenceChange('timezone', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                >
                                                    <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                                                    <option value="UTC">UTC</option>
                                                    <option value="America/New_York">America/New_York (EST)</option>
                                                    <option value="Europe/London">Europe/London (GMT)</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Logout Button */}
                    <div className="bg-white rounded-2xl shadow-md border p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800">Account Actions</h3>
                                <p className="text-gray-600 text-sm">Manage your account access</p>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center"
                            >
                                <LogOut className="w-4 h-4 mr-2" />
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Saved Reports Section */}
            <div className="bg-white rounded-2xl shadow-md border">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                        <Download className="w-5 h-5 mr-2 text-green-600" />
                        Saved Reports ({savedReports.length})
                    </h2>
                    <p className="text-gray-600 text-sm mt-1">Your previously generated reports and exports</p>
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {savedReports.map((report) => (
                            <div key={report.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center">
                                        <div className="p-2 bg-blue-100 rounded-lg mr-3">
                                            {getReportIcon(report.type)}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-medium text-gray-800 text-sm leading-tight">{report.title}</h4>
                                            <p className="text-xs text-gray-500 mt-1">{report.type}</p>
                                        </div>
                                    </div>
                                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(report.status)}`}>
                                        {report.status}
                                    </span>
                                </div>

                                <div className="space-y-2 text-xs text-gray-600 mb-4">
                                    <div className="flex justify-between">
                                        <span>Generated:</span>
                                        <span>{new Date(report.generatedDate).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Size:</span>
                                        <span>{report.fileSize}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Format:</span>
                                        <span>{report.format}</span>
                                    </div>
                                    {report.pages && (
                                        <div className="flex justify-between">
                                            <span>Pages:</span>
                                            <span>{report.pages}</span>
                                        </div>
                                    )}
                                </div>

                                {report.status === 'completed' && (
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleViewReport(report)}
                                            className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-xs hover:bg-blue-700 transition-colors flex items-center justify-center"
                                        >
                                            <Eye className="w-3 h-3 mr-1" />
                                            View
                                        </button>
                                        <button
                                            onClick={() => handleDownloadReport(report)}
                                            className="flex-1 bg-green-600 text-white px-3 py-2 rounded text-xs hover:bg-green-700 transition-colors flex items-center justify-center"
                                        >
                                            <Download className="w-3 h-3 mr-1" />
                                            Download
                                        </button>
                                        <button
                                            onClick={() => handleDeleteReport(report.id)}
                                            className="bg-red-600 text-white px-3 py-2 rounded text-xs hover:bg-red-700 transition-colors flex items-center justify-center"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </div>
                                )}

                                {report.status === 'processing' && (
                                    <div className="bg-yellow-50 p-2 rounded text-center">
                                        <p className="text-xs text-yellow-700">Processing...</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
