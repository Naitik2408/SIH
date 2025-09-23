const http = require('http');

const API_BASE = 'localhost';
const API_PORT = 3000;
const API_PATH = '/api/auth/register';

const sampleUsers = [
  {
    name: 'Priya Sharma',
    email: 'priya.sharma@email.com',
    password: 'password123',
    phone: '9876543210',
    role: 'customer',
    profile: {
      age: 28,
      gender: 'female',
      occupation: 'employee',
      householdSize: 3,
      usesPublicTransport: true,
      incomeRange: '50k-100k',
      vehicleOwnership: { cars: 0, twoWheelers: 1, cycles: 2 }
    }
  },
  {
    name: 'Rahul Patel',
    email: 'rahul.patel@email.com',
    password: 'password123',
    phone: '9876543211',
    role: 'customer',
    profile: {
      age: 32,
      gender: 'male',
      occupation: 'self-employed',
      householdSize: 4,
      usesPublicTransport: false,
      incomeRange: '100k-200k',
      vehicleOwnership: { cars: 1, twoWheelers: 2, cycles: 0 }
    }
  },
  {
    name: 'Anita Singh',
    email: 'anita.singh@email.com',
    password: 'password123',
    phone: '9876543212',
    role: 'customer',
    profile: {
      age: 24,
      gender: 'female',
      occupation: 'student',
      householdSize: 2,
      usesPublicTransport: true,
      incomeRange: 'below-25k',
      vehicleOwnership: { cars: 0, twoWheelers: 0, cycles: 1 }
    }
  },
  {
    name: 'Vikram Kumar',
    email: 'vikram.kumar@email.com',
    password: 'password123',
    phone: '9876543213',
    role: 'customer',
    profile: {
      age: 45,
      gender: 'male',
      occupation: 'employee',
      householdSize: 5,
      usesPublicTransport: true,
      incomeRange: '200k-500k',
      vehicleOwnership: { cars: 2, twoWheelers: 1, cycles: 3 }
    }
  },
  {
    name: 'Sunita Reddy',
    email: 'sunita.reddy@email.com',
    password: 'password123',
    phone: '9876543214',
    role: 'customer',
    profile: {
      age: 36,
      gender: 'female',
      occupation: 'homemaker',
      householdSize: 4,
      usesPublicTransport: false,
      incomeRange: '50k-100k',
      vehicleOwnership: { cars: 1, twoWheelers: 1, cycles: 2 }
    }
  },
  {
    name: 'Arjun Mehta',
    email: 'arjun.mehta@email.com',
    password: 'password123',
    phone: '9876543215',
    role: 'customer',
    profile: {
      age: 29,
      gender: 'male',
      occupation: 'employee',
      householdSize: 2,
      usesPublicTransport: true,
      incomeRange: '25k-50k',
      vehicleOwnership: { cars: 0, twoWheelers: 1, cycles: 1 }
    }
  },
  {
    name: 'Dr. Kavita Iyer',
    email: 'kavita.iyer@transport.gov.in',
    password: 'password123',
    phone: '9876543216',
    role: 'scientist',
    organizationId: 'TRANSPORT-RESEARCH-001',
    department: 'Urban Planning',
    designation: 'Senior Research Scientist'
  },
  {
    name: 'Prof. Amit Gupta',
    email: 'amit.gupta@iisc.ac.in',
    password: 'password123',
    phone: '9876543217',
    role: 'scientist',
    organizationId: 'IISC-TRANSPORT-LAB',
    department: 'Transportation Engineering',
    designation: 'Professor'
  },
  {
    name: 'Deepika Nair',
    email: 'deepika.nair@email.com',
    password: 'password123',
    phone: '9876543218',
    role: 'customer',
    profile: {
      age: 26,
      gender: 'female',
      occupation: 'employee',
      householdSize: 1,
      usesPublicTransport: true,
      incomeRange: '25k-50k',
      vehicleOwnership: { cars: 0, twoWheelers: 0, cycles: 1 }
    }
  },
  {
    name: 'Rajesh Agarwal',
    email: 'rajesh.agarwal@email.com',
    password: 'password123',
    phone: '9876543219',
    role: 'customer',
    profile: {
      age: 55,
      gender: 'male',
      occupation: 'retired',
      householdSize: 2,
      usesPublicTransport: false,
      incomeRange: '100k-200k',
      vehicleOwnership: { cars: 1, twoWheelers: 0, cycles: 2 }
    }
  }
];

function makeRequest(userData) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(userData);
    
    const options = {
      hostname: API_BASE,
      port: API_PORT,
      path: API_PATH,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve({ statusCode: res.statusCode, data: response });
        } catch (error) {
          resolve({ statusCode: res.statusCode, data: { message: data } });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

async function createUsers() {
  console.log('🚀 Creating sample users for testing...\n');
  
  for (let i = 0; i < sampleUsers.length; i++) {
    const user = sampleUsers[i];
    try {
      const response = await makeRequest(user);
      
      if (response.statusCode === 201) {
        console.log(`✅ [${i+1}/10] Created user: ${user.name} (${user.role})`);
      } else if (response.statusCode === 409) {
        console.log(`⚠️  [${i+1}/10] User ${user.name} already exists`);
      } else {
        console.log(`❌ [${i+1}/10] Failed to create ${user.name}: ${response.data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.log(`❌ [${i+1}/10] Network error for ${user.name}: ${error.message}`);
    }
    
    // Small delay to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('\n🎉 Sample user creation completed!');
  console.log('📊 Created users with diverse profiles:');
  console.log('   - 8 Customers (various ages, occupations, transport preferences)');
  console.log('   - 2 Scientists (for research access)');
  console.log('\n🔐 All users have password: password123');
  console.log('\n📱 You can now test posts creation and user interactions!');
  console.log('\n💡 Login with any of these emails:');
  sampleUsers.slice(0, 5).forEach(user => {
    console.log(`   - ${user.email} (${user.role})`);
  });
  console.log('   - ... and 5 more users');
}

// Check if server is running before creating users
const testReq = http.request({
  hostname: API_BASE,
  port: API_PORT,
  path: '/api/auth/verify-token',
  method: 'GET'
}, (res) => {
  console.log('✅ Backend server is running, proceeding with user creation...\n');
  createUsers().catch(console.error);
});

testReq.on('error', (error) => {
  console.log('❌ Cannot connect to backend server.');
  console.log('💡 Make sure your backend is running on http://localhost:3000');
  console.log('   Run: npm run dev (in Backend directory)');
});

testReq.end();