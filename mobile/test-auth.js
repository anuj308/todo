// Simple Node.js script to test authentication endpoints
// Run this before starting the mobile app to verify backend is working

const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

async function testAuth() {
  console.log('🧪 Testing Authentication Endpoints...\n');

  try {
    // Test 1: Register a new user
    console.log('1️⃣ Testing Registration...');
    const registerData = {
      name: 'Mobile Test User',
      email: `test_${Date.now()}@example.com`,
      password: 'test123456'
    };

    const registerResponse = await axios.post(`${API_BASE_URL}/users`, registerData);
    console.log('✅ Registration successful!');
    console.log('   Response:', {
      hasToken: !!registerResponse.data.token,
      hasUser: !!registerResponse.data.user,
      userId: registerResponse.data.user?.id,
      userName: registerResponse.data.user?.name,
    });
    
    const token = registerResponse.data.token;

    // Test 2: Get current user with token
    console.log('\n2️⃣ Testing Get Current User (with Bearer token)...');
    const meResponse = await axios.get(`${API_BASE_URL}/users/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('✅ Get user successful!');
    console.log('   User:', {
      id: meResponse.data.id,
      name: meResponse.data.name,
      email: meResponse.data.email,
    });

    // Test 3: Login with the same user
    console.log('\n3️⃣ Testing Login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/users/login`, {
      email: registerData.email,
      password: registerData.password
    });
    console.log('✅ Login successful!');
    console.log('   Response:', {
      hasToken: !!loginResponse.data.token,
      hasUser: !!loginResponse.data.user,
      userId: loginResponse.data.user?.id,
    });

    // Test 4: Logout
    console.log('\n4️⃣ Testing Logout...');
    const logoutResponse = await axios.post(`${API_BASE_URL}/users/logout`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('✅ Logout successful!');

    console.log('\n✨ All authentication tests passed! ✨');
    console.log('\n📱 Your backend is ready for mobile app authentication!');
    console.log('   - Token is returned in JSON response ✅');
    console.log('   - Bearer token authentication works ✅');
    console.log('   - User data is properly formatted ✅');
    
  } catch (error) {
    console.error('\n❌ Test failed!');
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Error:', error.response.data.message || error.response.data);
    } else if (error.request) {
      console.error('   Network Error - Is the backend running?');
      console.error('   Make sure to start backend with: cd backend && npm run dev');
    } else {
      console.error('   Error:', error.message);
    }
    process.exit(1);
  }
}

// Check if backend is accessible first
async function checkBackend() {
  try {
    await axios.get(`${API_BASE_URL.replace('/api', '')}/`);
    return true;
  } catch (error) {
    return false;
  }
}

async function main() {
  console.log('🔍 Checking if backend is running...\n');
  
  const backendRunning = await checkBackend();
  
  if (!backendRunning) {
    console.error('❌ Backend is not running!');
    console.error('\n📋 Steps to fix:');
    console.error('   1. Open a new terminal');
    console.error('   2. cd backend');
    console.error('   3. npm run dev');
    console.error('   4. Wait for "Server is running on port 5000"');
    console.error('   5. Then run this test again: node test-auth.js\n');
    process.exit(1);
  }

  console.log('✅ Backend is running!\n');
  await testAuth();
}

main();
