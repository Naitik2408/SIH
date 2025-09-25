const axios = require('axios');

const API_BASE = 'http://localhost:3000/api';

async function quickApprovalTest() {
    try {
        console.log('🧪 Quick Test: Check organizationId in Response...\n');

        // Step 1: Login as owner
        const ownerLogin = await axios.post(`${API_BASE}/auth/login`, {
            email: 'owner@transport.gov',
            password: 'owner123'
        });
        
        const ownerToken = ownerLogin.data.data.token;
        const authHeaders = {
            headers: { Authorization: `Bearer ${ownerToken}` }
        };
        
        console.log('✅ Owner logged in successfully\n');

        // Step 2: Get pending scientists
        const pendingResponse = await axios.get(`${API_BASE}/owner/pending-scientists`, authHeaders);
        const pendingScientist = pendingResponse.data.data.scientists[0];
        
        if (!pendingScientist) {
            console.log('❌ No pending scientists found for testing');
            return;
        }

        console.log(`🎯 Testing approval for: ${pendingScientist.name}`);
        console.log(`   Scientist ID: ${pendingScientist.id}`);
        
        if (pendingScientist.organizationId) {
            console.log(`   📋 Pending scientist has organizationId: ${pendingScientist.organizationId}`);
        } else {
            console.log(`   ✅ Pending scientist response has no organizationId field`);
        }

        // Step 3: Test approval
        const approvalResponse = await axios.post(
            `${API_BASE}/owner/approve-scientist/${pendingScientist.id}`,
            {},
            authHeaders
        );
        
        console.log('\n📄 Full Approval Response:');
        console.log(JSON.stringify(approvalResponse.data, null, 2));
        
        // Check if organizationId is in the response
        const scientistData = approvalResponse.data.data.scientist;
        if (scientistData.organizationId) {
            console.log(`\n⚠️  organizationId found in response: ${scientistData.organizationId}`);
        } else {
            console.log('\n✅ No organizationId field in the approval response');
        }

    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
    }
}

quickApprovalTest();