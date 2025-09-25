const mongoose = require('mongoose');
require('dotenv').config();

// Import User model
const User = require('./src/models/User');

// MongoDB connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB Atlas connected successfully');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};

// Get all scientists from database
const getAllScientists = async () => {
    try {
        console.log('🔍 Fetching all scientists from MongoDB Atlas...\n');

        // Find all users with role 'scientist'
        const scientists = await User.find({ role: 'scientist' }).sort({ createdAt: -1 });
        
        console.log(`📊 Total Scientists Found: ${scientists.length}\n`);

        if (scientists.length === 0) {
            console.log('❌ No scientists found in database');
            return;
        }

        // Group scientists by organization
        const byOrganization = {};
        scientists.forEach(scientist => {
            const org = scientist.organizationId || 'No Organization';
            if (!byOrganization[org]) {
                byOrganization[org] = [];
            }
            byOrganization[org].push(scientist);
        });

        console.log('📋 Scientists by Organization:\n');
        
        Object.keys(byOrganization).forEach(org => {
            console.log(`🏢 ${org} (${byOrganization[org].length} scientists):`);
            
            byOrganization[org].forEach((scientist, index) => {
                const status = scientist.isApproved ? '✅ Approved' : '⏳ Pending';
                const active = scientist.isActive ? '🟢 Active' : '🔴 Inactive';
                
                console.log(`   ${index + 1}. ${scientist.name}`);
                console.log(`      📧 Email: ${scientist.email}`);
                console.log(`      🆔 ID: ${scientist._id}`);
                console.log(`      📊 Status: ${status} ${active}`);
                
                if (scientist.department) {
                    console.log(`      🏛️  Department: ${scientist.department}`);
                }
                if (scientist.designation) {
                    console.log(`      💼 Designation: ${scientist.designation}`);
                }
                
                console.log(`      📅 Created: ${new Date(scientist.createdAt).toLocaleDateString()}`);
                console.log(''); // Empty line for readability
            });
        });

        // Summary statistics
        console.log('📈 Summary Statistics:');
        console.log(`   Total Scientists: ${scientists.length}`);
        console.log(`   Approved: ${scientists.filter(s => s.isApproved).length}`);
        console.log(`   Pending: ${scientists.filter(s => !s.isApproved).length}`);
        console.log(`   Active: ${scientists.filter(s => s.isActive).length}`);
        console.log(`   Inactive: ${scientists.filter(s => !s.isActive).length}`);
        console.log(`   Organizations: ${Object.keys(byOrganization).length}`);

        console.log('\n✅ Data retrieval complete!');

    } catch (error) {
        console.error('❌ Error fetching scientists:', error);
    }
};

// Run the script
const main = async () => {
    await connectDB();
    await getAllScientists();
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
};

main();