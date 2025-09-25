const axios = require('axios');

const API_BASE = 'http://localhost:3000/api';

async function testOwnerAPI() {
    try {
        console.log('🧪 Testing Owner API endpoints...\n');

        // Step 1: Login as owner
        console.log('1. Logging in as owner...');
        const ownerLogin = await axios.post(`${API_BASE}/auth/login`, {
            email: 'owner@transport.gov',
            password: 'owner123'
        });
        
        console.log('Raw login response:', JSON.stringify(ownerLogin.data, null, 2));
        
        const ownerToken = ownerLogin.data.data.token; // Fixed: token is nested under data.data.token
        const authHeaders = {
            headers: { Authorization: `Bearer ${ownerToken}` }
        };
        
        console.log('✅ Owner login successful');
        if (ownerLogin.data.data.user) {
            console.log(`   Owner: ${ownerLogin.data.data.user.name}`);
            console.log(`   Email: ${ownerLogin.data.data.user.email}`);
            console.log(`   Organization: ${ownerLogin.data.data.user.organizationId}`);
            console.log(`   Role: ${ownerLogin.data.data.user.role}\n`);
        }

        // Step 2: Test /api/owner/scientists endpoint 
        console.log('2. Testing /api/owner/scientists endpoint...');
        try {
            const allScientistsResponse = await axios.get(`${API_BASE}/owner/scientists`, authHeaders);
            
            console.log('✅ All scientists endpoint response:');
            console.log(JSON.stringify(allScientistsResponse.data, null, 2));
            
        } catch (error) {
            console.error('❌ Error with /api/owner/scientists:');
            console.error('Status:', error.response?.status);
            console.error('Data:', error.response?.data);
            console.error('Message:', error.message);
        }

        // Step 3: Test scientist login for approved scientists  
        console.log('\n3. Testing approved scientist login...');
        
        // Try to login with approved scientists from the API response
        const approvedScientists = allScientistsResponse.data.data.scientists
            .filter(s => s.isApproved)
            .slice(0, 2); // Test first 2 approved
        
        for (const scientist of approvedScientists) {
            try {
                console.log(`\n   Testing login for: ${scientist.email} (${scientist.name})`);
                const scientistLogin = await axios.post(`${API_BASE}/auth/login`, {
                    email: scientist.email,
                    password: 'scientist123'
                });
                
                console.log(`   ✅ Login successful for ${scientistLogin.data.data.user.name}`);
                console.log(`      Role: ${scientistLogin.data.data.user.role}`);
                console.log(`      Approved: ${scientistLogin.data.data.user.isApproved}`);
                console.log(`      Active: ${scientistLogin.data.data.user.isActive}`);
                
            } catch (error) {
                console.log(`   ❌ Login failed for ${scientist.email}`);
                console.log(`      Error: ${error.response?.data?.message || error.message}`);
            }
        }

        console.log('\n🎉 API testing completed!');

    } catch (error) {
        console.error('❌ Test failed:');
        console.error('Response data:', error.response?.data);
        console.error('Error message:', error.message);
        
        if (error.code === 'ECONNREFUSED') {
            console.log('\n💡 Make sure the backend server is running on port 3000');
        }
    }
}

// Run the test
testOwnerAPI();