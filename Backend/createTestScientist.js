const User = require('./src/models/User');
require('dotenv').config();
require('./src/config/db');

async function createTestScientist() {
    try {
        console.log('🧪 Creating test scientist for approval testing...\n');

        // Create a new test scientist
        const testScientist = new User({
            name: 'Test Scientist',
            email: 'test.approval@scientist.com',
            password: 'test123',
            role: 'scientist',
            organizationId: 'TEST-ORG-001',
            department: 'Testing Department',
            designation: 'Test Analyst',
            isApproved: false,
            isActive: true
        });

        await testScientist.save();
        console.log('✅ Test scientist created successfully!');
        console.log(`   Name: ${testScientist.name}`);
        console.log(`   Email: ${testScientist.email}`);
        console.log(`   ID: ${testScientist._id}`);
        console.log(`   Organization: ${testScientist.organizationId}`);
        console.log(`   Approved: ${testScientist.isApproved}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating test scientist:', error.message);
        process.exit(1);
    }
}

createTestScientist();