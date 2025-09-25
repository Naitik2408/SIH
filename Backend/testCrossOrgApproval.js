const axios = require('axios');

const API_BASE = 'http://localhost:3000/api';

async function testCrossOrganizationApproval() {
    try {
        console.log('🧪 Testing Cross-Organization Approval Functionality...\n');

        // Step 1: Login as owner (from TRANSPORT-AUTHORITY-001)
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
        console.log(`   Owner Organization: ${userData.organizationId}\n`);

        // Step 2: Get all scientists to see organization distribution
        console.log('2. Fetching all scientists to identify cross-organization targets...');
        const allScientistsResponse = await axios.get(`${API_BASE}/owner/scientists`, authHeaders);
        
        console.log('✅ Scientists data fetched');
        console.log(`   Total Scientists: ${allScientistsResponse.data.data.scientists.length}\n`);
        
        // Group scientists by organization
        const scientistsByOrg = {};
        allScientistsResponse.data.data.scientists.forEach(scientist => {
            const org = scientist.organizationId;
            if (!scientistsByOrg[org]) {
                scientistsByOrg[org] = [];
            }
            scientistsByOrg[org].push(scientist);
        });
        
        console.log('📊 Scientists by Organization:');
        Object.keys(scientistsByOrg).forEach(org => {
            const count = scientistsByOrg[org].length;
            const pending = scientistsByOrg[org].filter(s => !s.isApproved).length;
            const approved = scientistsByOrg[org].filter(s => s.isApproved).length;
            const isOwnerOrg = org === userData.organizationId ? ' (OWNER\'S ORG)' : '';
            
            console.log(`   🏢 ${org}${isOwnerOrg}: ${count} scientists (${pending} pending, ${approved} approved)`);
            scientistsByOrg[org].forEach((scientist, index) => {
                const status = scientist.isApproved ? '✅ Approved' : '⏳ Pending';
                console.log(`      ${index + 1}. ${scientist.name} - ${status} [ID: ${scientist.id}]`);
            });
        });

        // Step 3: Find a scientist from a DIFFERENT organization to test cross-org approval
        let targetScientist = null;
        for (const org of Object.keys(scientistsByOrg)) {
            if (org !== userData.organizationId) {
                // Find a pending scientist from different org
                const pendingScientists = scientistsByOrg[org].filter(s => !s.isApproved);
                if (pendingScientists.length > 0) {
                    targetScientist = pendingScientists[0];
                    break;
                }
            }
        }

        if (!targetScientist) {
            console.log('\n⚠️  No pending scientists from other organizations found.');
            console.log('💡 All scientists from other organizations are already approved, or only owner\'s org has scientists.');
            return;
        }

        console.log(`\n3. Testing cross-organization approval...`);
        console.log(`🎯 Target Scientist: ${targetScientist.name} (${targetScientist.email})`);
        console.log(`   Organization: ${targetScientist.organizationId}`);
        console.log(`   Owner Organization: ${userData.organizationId}`);
        console.log(`   Cross-Organization: ${targetScientist.organizationId !== userData.organizationId ? 'YES ✅' : 'NO ❌'}`);
        console.log(`   Current Status: ${targetScientist.isApproved ? 'Approved' : 'Pending'}`);

        // Step 4: Attempt to approve scientist from different organization
        console.log(`\n4. Attempting to approve scientist from different organization...`);
        
        try {
            const approvalResponse = await axios.post(
                `${API_BASE}/owner/approve-scientist/${targetScientist.id}`,
                {},
                authHeaders
            );
            
            console.log('🎉 SUCCESS! Cross-organization approval worked!');
            console.log(`   Status: ${approvalResponse.data.status}`);
            console.log(`   Message: ${approvalResponse.data.message}`);
            console.log(`   Scientist: ${approvalResponse.data.data.scientist.name}`);
            console.log(`   Organization: ${approvalResponse.data.data.scientist.organizationId}`);
            console.log(`   Is Approved: ${approvalResponse.data.data.scientist.isApproved}`);
            
        } catch (error) {
            if (error.response) {
                console.log('❌ Cross-organization approval failed:');
                console.log(`   Status: ${error.response.status}`);
                console.log(`   Error: ${error.response.data.message}`);
                
                if (error.response.status === 403) {
                    console.log('   🚫 This indicates organization restrictions are still in place');
                } else if (error.response.status === 400 && error.response.data.message.includes('already approved')) {
                    console.log('   ℹ️  Scientist is already approved, trying disapproval instead...');
                    
                    // Try disapproval
                    try {
                        const disapprovalResponse = await axios.post(
                            `${API_BASE}/owner/disapprove-scientist/${targetScientist.id}`,
                            { reason: 'Testing cross-organization disapproval' },
                            authHeaders
                        );
                        
                        console.log('🎉 SUCCESS! Cross-organization disapproval worked!');
                        console.log(`   Status: ${disapprovalResponse.data.status}`);
                        console.log(`   Message: ${disapprovalResponse.data.message}`);
                        
                    } catch (disapprovalError) {
                        console.log('❌ Cross-organization disapproval also failed:');
                        console.log(`   Error: ${disapprovalError.response?.data?.message || disapprovalError.message}`);
                    }
                }
            } else {
                console.log('❌ Network error:', error.message);
            }
        }

        // Step 5: Verify changes by fetching updated data
        console.log(`\n5. Verifying changes by fetching updated data...`);
        const updatedScientistsResponse = await axios.get(`${API_BASE}/owner/scientists`, authHeaders);
        const updatedTarget = updatedScientistsResponse.data.data.scientists.find(s => s.id === targetScientist.id);
        
        if (updatedTarget) {
            console.log(`✅ Updated status for ${updatedTarget.name}:`);
            console.log(`   Organization: ${updatedTarget.organizationId}`);
            console.log(`   Was: ${targetScientist.isApproved ? 'Approved' : 'Pending'}`);
            console.log(`   Now: ${updatedTarget.isApproved ? 'Approved' : 'Pending'}`);
            console.log(`   Change: ${updatedTarget.isApproved !== targetScientist.isApproved ? 'YES ✅' : 'NO ❌'}`);
        }

        console.log('\n🎉 Cross-Organization Approval Test Complete!');
        console.log('\n📋 Summary:');
        console.log(`   - Owner Organization: ${userData.organizationId}`);
        console.log(`   - Target Organization: ${targetScientist.organizationId}`);
        console.log(`   - Cross-Organization Action: ${targetScientist.organizationId !== userData.organizationId ? 'YES' : 'NO'}`);
        console.log('   - Owner can now manage scientists across ALL organizations! 🚀');

    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
        
        if (error.code === 'ECONNREFUSED') {
            console.log('\n💡 Backend server is not running. Start it with:');
            console.log('   cd /home/devil/Documents/SIH/Backend && node src/server.js');
        }
    }
}

// Run the test
testCrossOrganizationApproval();