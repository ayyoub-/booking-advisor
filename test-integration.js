#!/usr/bin/env node

/**
 * Test script to verify the integration between React frontend, Express backend, and Python scraper
 */

const http = require('http');

const API_BASE_URL = 'http://localhost:3001/api';
const FRONTEND_URL = 'http://localhost:5173';

// Test data
const testHotelUrl = 'https://www.booking.com/hotel/fr/novotel-paris-centre-tour-eiffel.fr.html';

console.log('🧪 Testing Booking Advisor Integration...\n');

// Test 1: Backend Health Check
async function testBackendHealth() {
  console.log('1️⃣ Testing backend health...');
  
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    const data = await response.json();
    
    if (data.status === 'OK') {
      console.log('✅ Backend is healthy');
      return true;
    } else {
      console.log('❌ Backend health check failed');
      return false;
    }
  } catch (error) {
    console.log('❌ Backend is not responding:', error.message);
    return false;
  }
}

// Test 2: Frontend Accessibility
async function testFrontendAccess() {
  console.log('\n2️⃣ Testing frontend accessibility...');
  
  try {
    const response = await fetch(FRONTEND_URL);
    const html = await response.text();
    
    if (html.includes('HotelChoice AI') || html.includes('root')) {
      console.log('✅ Frontend is accessible');
      return true;
    } else {
      console.log('❌ Frontend content not found');
      return false;
    }
  } catch (error) {
    console.log('❌ Frontend is not responding:', error.message);
    return false;
  }
}

// Test 3: Scraping API
async function testScrapingAPI() {
  console.log('\n3️⃣ Testing scraping API...');
  
  try {
    const response = await fetch(`${API_BASE_URL}/scrape-reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: testHotelUrl,
        sortBy: 'newest_first',
        nReviews: 5
      }),
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Scraping API is working');
      console.log(`   Hotel: ${data.hotelName}`);
      console.log(`   Reviews found: ${data.reviewCount}`);
      return true;
    } else {
      console.log('❌ Scraping API failed:', data.error);
      return false;
    }
  } catch (error) {
    console.log('❌ Scraping API error:', error.message);
    return false;
  }
}

// Test 4: Reviews Data API
async function testReviewsAPI() {
  console.log('\n4️⃣ Testing reviews data API...');
  
  try {
    const response = await fetch(`${API_BASE_URL}/reviews/novotel-paris-centre-tour-eiffel`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Reviews API is working');
      console.log(`   Total reviews: ${data.totalReviews}`);
      return true;
    } else if (response.status === 404) {
      console.log('⚠️  No reviews data found (this is normal for test hotel)');
      return true;
    } else {
      console.log('❌ Reviews API failed with status:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Reviews API error:', error.message);
    return false;
  }
}

// Run all tests
async function runTests() {
  const results = [];
  
  results.push(await testBackendHealth());
  results.push(await testFrontendAccess());
  results.push(await testScrapingAPI());
  results.push(await testReviewsAPI());
  
  const passed = results.filter(r => r).length;
  const total = results.length;
  
  console.log('\n📊 Test Results:');
  console.log(`✅ Passed: ${passed}/${total}`);
  
  if (passed === total) {
    console.log('\n🎉 All tests passed! Integration is working correctly.');
    console.log('\n🚀 You can now:');
    console.log('   1. Open http://localhost:5173 in your browser');
    console.log('   2. Enter hotel URLs from Booking.com');
    console.log('   3. Click "Analyze Hotels" to see the magic!');
  } else {
    console.log('\n❌ Some tests failed. Please check the logs above.');
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Make sure backend is running: cd backend && npm run dev');
    console.log('   2. Make sure frontend is running: cd hotel-advisor && npm run dev');
    console.log('   3. Make sure Python dependencies are installed: pip3 install -r requirements.txt');
  }
}

// Check if fetch is available (Node.js 18+)
if (typeof fetch === 'undefined') {
  console.log('❌ This script requires Node.js 18+ or a fetch polyfill');
  console.log('   Please upgrade Node.js or install node-fetch');
  process.exit(1);
}

// Run the tests
runTests().catch(console.error);
