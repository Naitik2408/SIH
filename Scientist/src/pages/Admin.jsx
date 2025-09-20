import React from 'react';

const Admin = () => {
    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">System Administration</h1>
                <p className="text-gray-600 mt-2">System configuration and administration tools</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-md border">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">System Status</h2>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Database Status</span>
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">Online</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">API Services</span>
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">Operational</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Data Processing</span>
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">Delayed</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md border">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
                    <div className="space-y-2">
                        <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 border">
                            System Backup
                        </button>
                        <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 border">
                            Clear Cache
                        </button>
                        <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 border">
                            Update Configurations
                        </button>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md border lg:col-span-2">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">System Logs</h2>
                    <div className="bg-gray-100 h-64 rounded-lg flex items-center justify-center">
                        <p className="text-gray-500">System logs will be displayed here...</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Admin;
