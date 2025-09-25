const axios = require('axios');

const API_BASE = 'http://localhost:3000/api';

async function createTestScientistViaAPI() {
    try {
        console.log('🧪 Creating test scientist via registration API...\n');

        // Register a new scientist
        const registerResponse = await axios.post(`${API_BASE}/auth/register`, {
            name: 'Test Scientist For Approval',
            email: 'test.approval.2@scientist.com',
            password: 'test123',
            phone: '+919876543210',
            role: 'scientist',
            organizationId: 'TEST-ORG-002',
            department: 'Testing Department',
            designation: 'Test Analyst'
        });

        console.log('✅ Test scientist created successfully!');
        console.log(`   Status: ${registerResponse.data.status}`);
        console.log(`   Message: ${registerResponse.data.message}`);
        console.log(`   Scientist ID: ${registerResponse.data.data.user.id}`);
        console.log(`   Name: ${registerResponse.data.data.user.name}`);
        console.log(`   Email: ${registerResponse.data.data.user.email}`);
        console.log(`   Organization: ${registerResponse.data.data.user.organizationId}`);
        console.log(`   Is Approved: ${registerResponse.data.data.user.isApproved}`);

    } catch (error) {
        console.error('❌ Error creating test scientist:', error.response?.data || error.message);
    }
}

createTestScientistViaAPI();