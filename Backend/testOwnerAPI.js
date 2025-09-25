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
        
        const ownerToken = ownerLogin.data.token;
        const authHeaders = {
            headers: { Authorization: `Bearer ${ownerToken}` }
        };
        
        console.log('✅ Owner login successful');
        console.log(`   Owner: ${ownerLogin.data.user.name}`);
        console.log(`   Email: ${ownerLogin.data.user.email}`);
        console.log(`   Organization: ${ownerLogin.data.user.organizationId}`);
        console.log(`   Role: ${ownerLogin.data.user.role}\n`);

        // Step 2: Test /api/owner/scientists endpoint (should return all scientists)
        console.log('2. Testing /api/owner/scientists endpoint...');
        try {
            const allScientistsResponse = await axios.get(`${API_BASE}/owner/scientists`, authHeaders);
            
            console.log('✅ All scientists endpoint works');
            console.log(`   Status: ${allScientistsResponse.data.status}`);
            console.log(`   Scientists count: ${allScientistsResponse.data.data.scientists.length}`);
            console.log(`   Stats:`, allScientistsResponse.data.data.stats);
            
            console.log('\n   📋 Scientists details:');
            allScientistsResponse.data.data.scientists.forEach((scientist, index) => {
                const status = scientist.isApproved ? '✅ Approved' : '⏳ Pending';
                console.log(`   ${index + 1}. ${scientist.name} (${scientist.email}) - ${status}`);
                if (scientist.department) console.log(`      Dept: ${scientist.department}`);
                if (scientist.designation) console.log(`      Role: ${scientist.designation}`);
            });
            
        } catch (error) {
            console.error('❌ Error with /api/owner/scientists:', error.response?.data || error.message);
        }

        // Step 3: Test /api/owner/pending-scientists endpoint
        console.log('\n3. Testing /api/owner/pending-scientists endpoint...');
        try {
            const pendingResponse = await axios.get(`${API_BASE}/owner/pending-scientists`, authHeaders);
            
            console.log('✅ Pending scientists endpoint works');
            console.log(`   Status: ${pendingResponse.data.status}`);
            console.log(`   Pending count: ${pendingResponse.data.data.scientists.length}`);
            
            console.log('\n   📋 Pending scientists:');
            pendingResponse.data.data.scientists.forEach((scientist, index) => {
                console.log(`   ${index + 1}. ${scientist.name} (${scientist.email})`);
                if (scientist.department) console.log(`      Dept: ${scientist.department}`);
            });
            
        } catch (error) {
            console.error('❌ Error with /api/owner/pending-scientists:', error.response?.data || error.message);
        }

        // Step 4: Test scientist login for approved scientists
        console.log('\n4. Testing approved scientist login...');
        
        // Try to login with an approved scientist
        const approvedScientists = ['meera.patel@scientist.gov', 'sneha.reddy@scientist.gov', 'priya.sharma@scientist.gov'];
        
        for (const email of approvedScientists) {
            try {
                console.log(`\n   Testing login for: ${email}`);
                const scientistLogin = await axios.post(`${API_BASE}/auth/login`, {
                    email: email,
                    password: 'scientist123'
                });
                
                console.log(`   ✅ Login successful for ${scientistLogin.data.user.name}`);
                console.log(`      Role: ${scientistLogin.data.user.role}`);
                console.log(`      Approved: ${scientistLogin.data.user.isApproved}`);
                console.log(`      Active: ${scientistLogin.data.user.isActive}`);
                
            } catch (error) {
                console.log(`   ❌ Login failed for ${email}`);
                console.log(`      Error: ${error.response?.data?.message || error.message}`);
            }
        }

        console.log('\n🎉 API testing completed!');

    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
        
        if (error.code === 'ECONNREFUSED') {
            console.log('\n💡 Make sure the backend server is running:');
            console.log('   cd /home/devil/Documents/SIH/Backend && npm start');
        }
    }
}

// Run the test
testOwnerAPI();
        
        console.log('✅ Owner login successful');
        console.log(`   Owner: ${ownerLogin.data.user.name}`);
        console.log(`   Organization: ${ownerLogin.data.user.organizationId}\n`);

        // Step 2: Fetch all scientists
        console.log('2. Fetching all scientists from database...');
        const allScientists = await axios.get(`${API_BASE}/owner/scientists`, authHeaders);
        
        console.log('✅ Scientists data fetched successfully');
        console.log(`   Total Scientists: ${allScientists.data.data.scientists.length}`);
        console.log(`   Stats:`, allScientists.data.data.stats);
        
        console.log('\n📋 Scientists in your organization:');
        allScientists.data.data.scientists.forEach(scientist => {
            const status = scientist.isApproved ? '✅ Approved' : '⏳ Pending';
            const active = scientist.isActive ? '🟢 Active' : '🔴 Inactive';
            console.log(`   • ${scientist.name} (${scientist.email}) - ${status} ${active}`);
            if (scientist.department) console.log(`     Department: ${scientist.department}`);
            if (scientist.designation) console.log(`     Designation: ${scientist.designation}`);
        });

        // Step 3: Fetch pending scientists specifically
        console.log('\n3. Fetching pending scientists...');
        const pendingScientists = await axios.get(`${API_BASE}/owner/pending-scientists`, authHeaders);
        
        console.log('✅ Pending scientists data fetched');
        console.log(`   Pending Count: ${pendingScientists.data.data.scientists.length}`);
        
        if (pendingScientists.data.data.scientists.length > 0) {
            console.log('\n⏳ Scientists awaiting approval:');
            pendingScientists.data.data.scientists.forEach(scientist => {
                console.log(`   • ${scientist.name} (${scientist.email})`);
                if (scientist.department) console.log(`     Department: ${scientist.department}`);
                if (scientist.designation) console.log(`     Designation: ${scientist.designation}`);
            });
        }

        console.log('\n🎉 API Test Complete!');
        console.log('\n📱 Your owner panel should now display:');
        console.log(`   - ${allScientists.data.data.stats.total} total scientists`);
        console.log(`   - ${allScientists.data.data.stats.pending} pending approvals`);
        console.log(`   - ${allScientists.data.data.stats.approved} approved scientists`);
        console.log('\n💡 The data comes directly from your MongoDB database, not static files!');

    } catch (error) {
        console.error('❌ API Test failed:', error.response?.data || error.message);
        
        if (error.code === 'ECONNREFUSED') {
            console.log('\n💡 Backend server is not running. Start it with:');
            console.log('   cd /home/devil/Documents/SIH/Backend && npm start');
        }
        
        if (error.response?.status === 401) {
            console.log('\n💡 Authentication failed. Check owner credentials:');
            console.log('   Email: owner@transport.gov');
            console.log('   Password: owner123');
        }
    }
}

// Run the test
testOwnerAPI();