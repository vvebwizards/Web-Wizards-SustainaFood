// Authentication Test Script
// Run this in your browser console to test the auth connectivity

import axiosInstance from './axiosConfig';

// Simple function to test if authentication is working
async function testAuthentication() {
  try {
    console.log('🔹 Starting authentication test...');
    
    // 1. Check if token exists
    const token = localStorage.getItem('token');
    console.log('🔹 Token exists:', !!token);
    
    // 2. Try to make an authenticated request
    console.log('🔹 Attempting to call /api/auth/me endpoint...');
    const response = await axiosInstance.get('/auth/me');
    console.log('✅ Authentication success! User data:', response.data);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('❌ Authentication test failed:', error);
    return {
      success: false,
      error: error.message || 'Unknown error',
      status: error.response?.status
    };
  }
}

// Test each endpoint that was failing
async function testEndpoints() {
  const endpoints = [
    { name: 'Categories', url: '/category/getAll' },
    { name: 'Food Items', url: '/foodItem/getAll' },
    { name: 'Donated Food', url: '/foodItem/toBedonatedFoodByDonor' }
  ];
  
  console.log('🔹 Starting endpoint tests...');
  
  for (const endpoint of endpoints) {
    try {
      console.log(`🔹 Testing ${endpoint.name} endpoint: ${endpoint.url}`);
      const response = await axiosInstance.get(endpoint.url);
      console.log(`✅ ${endpoint.name} endpoint working:`, response.data);
    } catch (error) {
      console.error(`❌ ${endpoint.name} endpoint failed:`, error);
      console.log('Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
    }
  }
}

// Export for use in browser console
window.authTest = {
  testAuthentication,
  testEndpoints
};

console.log('🔹 Auth test utilities loaded. Run window.authTest.testAuthentication() or window.authTest.testEndpoints() to test.');
