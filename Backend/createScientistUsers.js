const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
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

// Create sample scientist users
const createScientistUsers = async () => {
    try {
        console.log('🧪 Creating sample scientist users...\n');

        // Sample scientist data
        const scientists = [
            {
                name: 'Dr. Priya Sharma',
                email: 'priya.sharma@scientist.gov',
                password: 'scientist123',
                role: 'scientist',
                organizationId: 'TRANSPORT-AUTHORITY-001', // Same as owner
                department: 'Transportation Engineering',
                designation: 'Senior Research Scientist',
                isApproved: false, // Pending approval
                isActive: true
            },
            {
                name: 'Dr. Rajesh Kumar',
                email: 'rajesh.kumar@scientist.gov',
                password: 'scientist123',
                role: 'scientist',
                organizationId: 'TRANSPORT-AUTHORITY-001', // Same as owner
                department: 'Data Science',
                designation: 'Research Analyst',
                isApproved: false, // Pending approval
                isActive: true
            },
            {
                name: 'Dr. Meera Patel',
                email: 'meera.patel@scientist.gov',
                password: 'scientist123',
                role: 'scientist',
                organizationId: 'TRANSPORT-AUTHORITY-001', // Same as owner
                department: 'Urban Planning',
                designation: 'Lead Scientist',
                isApproved: true, // Already approved
                isActive: true
            },
            {
                name: 'Dr. Amit Singh',
                email: 'amit.singh@scientist.gov',
                password: 'scientist123',
                role: 'scientist',
                organizationId: 'TRANSPORT-AUTHORITY-001', // Same as owner
                department: 'Environmental Studies',
                designation: 'Research Associate',
                isApproved: false, // Pending approval
                isActive: true
            },
            {
                name: 'Dr. Sneha Reddy',
                email: 'sneha.reddy@scientist.gov',
                password: 'scientist123',
                role: 'scientist',
                organizationId: 'TRANSPORT-AUTHORITY-001', // Same as owner
                department: 'Traffic Management',
                designation: 'Senior Analyst',
                isApproved: true, // Already approved
                isActive: true
            }
        ];

        // Check if scientists already exist and create new ones
        for (const scientistData of scientists) {
            const existingUser = await User.findOne({ email: scientistData.email });
            
            if (existingUser) {
                console.log(`⚠️  Scientist ${scientistData.name} already exists`);
                continue;
            }

            // Hash password
            const salt = await bcryptjs.genSalt(10);
            const hashedPassword = await bcryptjs.hash(scientistData.password, salt);

            // Create new scientist
            const scientist = new User({
                ...scientistData,
                password: hashedPassword
            });

            await scientist.save();
            
            const status = scientistData.isApproved ? '✅ Approved' : '⏳ Pending';
            console.log(`✅ Created scientist: ${scientistData.name} (${scientistData.email}) - ${status}`);
            console.log(`   Department: ${scientistData.department}`);
            console.log(`   Designation: ${scientistData.designation}\n`);
        }

        // Show summary
        console.log('📊 Summary:');
        const allScientists = await User.find({ 
            role: 'scientist', 
            organizationId: 'TRANSPORT-AUTHORITY-001' 
        });
        
        const pendingCount = allScientists.filter(s => !s.isApproved).length;
        const approvedCount = allScientists.filter(s => s.isApproved).length;
        
        console.log(`   Total Scientists: ${allScientists.length}`);
        console.log(`   Pending Approval: ${pendingCount}`);
        console.log(`   Already Approved: ${approvedCount}`);
        
        console.log('\n🎉 Scientist users created successfully!');
        console.log('\n📱 You can now test the owner approval panel with these accounts:');
        console.log('   - Login as owner: owner@transport.gov / owner123');
        console.log('   - Check pending scientists for approval');
        console.log('   - Test approve/reject functionality');

    } catch (error) {
        console.error('❌ Error creating scientist users:', error);
    }
};

// Run the script
const main = async () => {
    await connectDB();
    await createScientistUsers();
    process.exit(0);
};

main();