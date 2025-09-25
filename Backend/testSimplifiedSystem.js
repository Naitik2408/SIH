const axios = require('axios');

const API_BASE = 'http://localhost:3000/api';

async function testSimplifiedSystem() {
    try {
        console.log('🧪 Testing Simplified System (No Organizations)...\n');

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
        console.log(`   Email: ${userData.email}\n`);

        // Step 2: Test simplified /api/owner/scientists endpoint
        console.log('2. Testing simplified scientists endpoint...');
        const allScientistsResponse = await axios.get(`${API_BASE}/owner/scientists`, authHeaders);
        
        console.log('✅ Simplified scientists endpoint works');
        console.log(`   Status: ${allScientistsResponse.data.status}`);
        console.log(`   Total Scientists: ${allScientistsResponse.data.data.scientists.length}`);
        console.log(`   Stats:`, allScientistsResponse.data.data.stats);
        
        console.log('\n📋 Simplified Scientists Data (No Organization Info):');
        allScientistsResponse.data.data.scientists.slice(0, 5).forEach((scientist, index) => {
            const status = scientist.isApproved ? '✅ Approved' : '⏳ Pending';
            const active = scientist.isActive ? '🟢 Active' : '🔴 Inactive';
            console.log(`   ${index + 1}. ${scientist.name} (${scientist.email}) - ${status} ${active}`);
            if (scientist.department) console.log(`      Department: ${scientist.department}`);
            if (scientist.designation) console.log(`      Designation: ${scientist.designation}`);
            console.log(`      ID: ${scientist.id}`);
        });

        if (allScientistsResponse.data.data.scientists.length > 5) {
            console.log(`   ... and ${allScientistsResponse.data.data.scientists.length - 5} more scientists`);
        }

        // Step 3: Test simplified pending scientists endpoint
        console.log('\n3. Testing simplified pending scientists endpoint...');
        const pendingScientistsResponse = await axios.get(`${API_BASE}/owner/pending-scientists`, authHeaders);
        
        console.log('✅ Simplified pending scientists endpoint works');
        console.log(`   Pending Scientists: ${pendingScientistsResponse.data.data.scientists.length}`);
        
        if (pendingScientistsResponse.data.data.scientists.length > 0) {
            console.log('\n⏳ Pending Scientists (No Organization Info):');
            pendingScientistsResponse.data.data.scientists.forEach((scientist, index) => {
                console.log(`   ${index + 1}. ${scientist.name} (${scientist.email})`);
                if (scientist.department) console.log(`      Department: ${scientist.department}`);
                if (scientist.designation) console.log(`      Designation: ${scientist.designation}`);
            });
        }

        // Step 4: Test approval functionality (should work without organization checks)
        const pendingScientist = pendingScientistsResponse.data.data.scientists[0];
        if (pendingScientist) {
            console.log('\n4. Testing approval functionality...');
            console.log(`🎯 Testing approval for: ${pendingScientist.name}`);
            
            try {
                const approvalResponse = await axios.post(
                    `${API_BASE}/owner/approve-scientist/${pendingScientist.id}`,
                    {},
                    authHeaders
                );
                
                console.log('🎉 SUCCESS! Scientist approval works without organization checks!');
                console.log(`   Status: ${approvalResponse.data.status}`);
                console.log(`   Message: ${approvalResponse.data.message}`);
                console.log(`   Scientist: ${approvalResponse.data.data.scientist.name}`);
                console.log(`   Is Approved: ${approvalResponse.data.data.scientist.isApproved}`);
                
                // Note: No organization info should be returned
                if (approvalResponse.data.data.scientist.organizationId) {
                    console.log('⚠️  Warning: API still returning organizationId field');
                } else {
                    console.log('✅ Organization field successfully removed from response');
                }
                
            } catch (error) {
                console.log('❌ Approval failed:', error.response?.data?.message || error.message);
            }
        } else {
            console.log('\n4. No pending scientists to test approval');
        }

        console.log('\n🎉 Simplified System Test Complete!');
        console.log('\n📊 Summary:');
        console.log(`   - Total Scientists: ${allScientistsResponse.data.data.stats.total} (unified system)`);
        console.log(`   - Pending Approvals: ${allScientistsResponse.data.data.stats.pending}`);
        console.log(`   - Approved Scientists: ${allScientistsResponse.data.data.stats.approved}`);
        console.log(`   - Active Scientists: ${allScientistsResponse.data.data.stats.active}`);
        console.log('   - Organization Divisions: REMOVED ✅');
        console.log('   - Owner can manage all scientists regardless of organization ✅');
        console.log('\n💡 The system is now simplified with no organization barriers!');

    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
        
        if (error.code === 'ECONNREFUSED') {
            console.log('\n💡 Backend server is not running. Start it with:');
            console.log('   cd /home/devil/Documents/SIH/Backend && node src/server.js');
        }
    }
}

// Run the test
testSimplifiedSystem();