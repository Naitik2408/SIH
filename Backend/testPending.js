const axios = require('axios');

async function testPendingEndpoint() {
    try {
        const API_BASE = 'http://localhost:3000/api';
        
        // Login as owner
        const ownerLogin = await axios.post(`${API_BASE}/auth/login`, {
            email: 'owner@transport.gov',
            password: 'owner123'
        });
        
        const ownerToken = ownerLogin.data.data.token;
        const authHeaders = { headers: { Authorization: `Bearer ${ownerToken}` } };
        
        // Get pending scientists
        const response = await axios.get(`${API_BASE}/owner/pending-scientists`, authHeaders);
        
        console.log('📄 Pending Scientists Response:');
        console.log(JSON.stringify(response.data, null, 2));
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testPendingEndpoint();