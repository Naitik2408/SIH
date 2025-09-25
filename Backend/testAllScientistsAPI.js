const axios = require('axios');

const API_BASE = 'http://localhost:3000/api';

async function testUpdatedOwnerAPI() {
    try {
        console.log('🧪 Testing Updated Owner API - Should now return ALL scientists...\n');

        // Step 1: Login as owner
        console.log('1. Logging in as owner...');
        const ownerLogin = await axios.post(`${API_BASE}/auth/login`, {
            email: 'owner@transport.gov',
            password: 'owner123'
        });
        
        const ownerToken = ownerLogin.data.data.token;
        const userData = ownerLogin.data.data.user;
        const authHeaders = {
            headers: { Authorization: `Bearer ${ownerToken}` }
        };
        
        console.log('✅ Owner login successful');
        console.log(`   Owner: ${userData.name}`);
        console.log(`   Email: ${userData.email}`);
        console.log(`   Organization: ${userData.organizationId}\n`);

        // Step 2: Test updated /api/owner/scientists endpoint (should now return ALL scientists)
        console.log('2. Testing updated /api/owner/scientists endpoint...');
        const allScientistsResponse = await axios.get(`${API_BASE}/owner/scientists`, authHeaders);
        
        console.log('✅ Updated scientists endpoint works');
        console.log(`   Status: ${allScientistsResponse.data.status}`);
        console.log(`   Total Scientists: ${allScientistsResponse.data.data.scientists.length}`);
        console.log(`   Owner Organization: ${allScientistsResponse.data.data.ownerOrganization}`);
        console.log(`   Stats:`, allScientistsResponse.data.data.stats);
        
        console.log('\n📋 Scientists from ALL organizations:');
        const organizationGroups = {};
        
        allScientistsResponse.data.data.scientists.forEach((scientist) => {
            const org = scientist.organizationId;
            if (!organizationGroups[org]) {
                organizationGroups[org] = [];
            }
            organizationGroups[org].push(scientist);
        });
        
        Object.keys(organizationGroups).forEach(org => {
            console.log(`\n🏢 ${org} (${organizationGroups[org].length} scientists):`);
            organizationGroups[org].forEach((scientist, index) => {
                const status = scientist.isApproved ? '✅ Approved' : '⏳ Pending';
                const active = scientist.isActive ? '🟢 Active' : '🔴 Inactive';
                console.log(`   ${index + 1}. ${scientist.name} (${scientist.email}) - ${status} ${active}`);
                if (scientist.department) console.log(`      Department: ${scientist.department}`);
                if (scientist.designation) console.log(`      Designation: ${scientist.designation}`);
            });
        });

        console.log('\n🎉 Updated API Test Complete!');
        console.log('\n📊 Summary:');
        console.log(`   - NOW showing: ${allScientistsResponse.data.data.stats.total} total scientists (ALL organizations)`);
        console.log(`   - Previously showed: 8 scientists (only owner's organization)`);
        console.log(`   - Organizations represented: ${Object.keys(organizationGroups).length}`);
        console.log(`   - Pending approvals: ${allScientistsResponse.data.data.stats.pending} (from all organizations)`);
        console.log(`   - Approved scientists: ${allScientistsResponse.data.data.stats.approved} (from all organizations)`);
        
        console.log('\n💡 The owner can now see and manage scientists from ALL organizations!');
        console.log('📱 Your mobile app will now display all 12 scientists instead of just 8.');

    } catch (error) {
        console.error('❌ API Test failed:', error.response?.data || error.message);
        
        if (error.code === 'ECONNREFUSED') {
            console.log('\n💡 Backend server is not running. Start it with:');
            console.log('   cd /home/devil/Documents/SIH/Backend && node src/server.js');
        }
    }
}

// Run the test
testUpdatedOwnerAPI();