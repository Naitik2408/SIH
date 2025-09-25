const mongoose = require('mongoose');
require('dotenv').config();

// Import User model
const User = require('./src/models/User');

// MongoDB connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB connected successfully');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};

// Check existing scientist data in database
const checkExistingData = async () => {
    try {
        console.log('🔍 Checking existing scientist data in database...\n');

        // Find all scientists
        const allScientists = await User.find({ role: 'scientist' });
        console.log(`📊 Total Scientists in Database: ${allScientists.length}`);

        if (allScientists.length === 0) {
            console.log('❌ No scientists found in database!');
            console.log('💡 You need to have scientists register through your signup process first.');
            return;
        }

        // Group by organization
        const organizations = {};
        allScientists.forEach(scientist => {
            const org = scientist.organizationId || 'No Organization';
            if (!organizations[org]) {
                organizations[org] = [];
            }
            organizations[org].push(scientist);
        });

        console.log('\n📋 Scientists by Organization:');
        Object.keys(organizations).forEach(org => {
            console.log(`\n🏢 ${org}:`);
            organizations[org].forEach(scientist => {
                const status = scientist.isApproved ? '✅ Approved' : '⏳ Pending';
                const active = scientist.isActive ? '🟢 Active' : '🔴 Inactive';
                console.log(`   • ${scientist.name} (${scientist.email}) - ${status} ${active}`);
                if (scientist.department) console.log(`     Department: ${scientist.department}`);
                if (scientist.designation) console.log(`     Designation: ${scientist.designation}`);
            });
        });

        // Show owner organizations
        const owners = await User.find({ role: 'owner' });
        console.log(`\n👥 Available Owners: ${owners.length}`);
        owners.forEach(owner => {
            console.log(`   • ${owner.name} (${owner.email}) - Organization: ${owner.organizationId}`);
            const orgScientists = allScientists.filter(s => s.organizationId === owner.organizationId);
            const pending = orgScientists.filter(s => !s.isApproved).length;
            const approved = orgScientists.filter(s => s.isApproved).length;
            console.log(`     Scientists in org: ${orgScientists.length} (${pending} pending, ${approved} approved)`);
        });

        console.log('\n✅ Database check complete!');
        console.log('\n📱 The owner panel should fetch this data automatically when you:');
        console.log('   1. Start the backend server (npm start)');
        console.log('   2. Open the GetWay app');
        console.log('   3. Login as an owner');
        console.log('   4. Navigate to the Approvals section');

    } catch (error) {
        console.error('❌ Error checking database:', error);
    }
};

// Run the script
const main = async () => {
    await connectDB();
    await checkExistingData();
    process.exit(0);
};

main();