#!/usr/bin/env node

/**
 * Test script for OpenAI integration
 * Usage: node test-openai.js [openai-api-key]
 */

const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:3001';
const OPENAI_API_KEY = process.argv[2] || process.env.OPENAI_API_KEY;

async function testOpenAIIntegration() {
  console.log('🧪 Testing OpenAI Integration...\n');

  // Test data
  const testHotels = [
    {
      name: "Asri Villas",
      location: "Bali, Indonesia",
      rating: 4.2,
      totalReviews: 175,
      scrapedReviews: [
        { score: 4.5, review: "Amazing location with beautiful views", date: "2024-11-09" },
        { score: 4.0, review: "Great service and clean rooms", date: "2024-10-06" },
        { score: 4.8, review: "Perfect for couples, very romantic", date: "2024-09-15" },
        { score: 3.5, review: "Good but expensive for what you get", date: "2024-08-20" },
        { score: 4.2, review: "Nice pool and friendly staff", date: "2024-07-10" }
      ],
      keyInsights: ["175 reviews analyzed", "Average score: 4.2/5", "Real-time data from Booking.com"]
    },
    {
      name: "Novotel Paris Centre Tour Eiffel",
      location: "Paris, France",
      rating: 4.0,
      totalReviews: 120,
      scrapedReviews: [
        { score: 4.2, review: "Excellent location near Eiffel Tower", date: "2024-11-05" },
        { score: 3.8, review: "Good hotel but rooms are small", date: "2024-10-15" },
        { score: 4.5, review: "Great breakfast and helpful staff", date: "2024-09-20" },
        { score: 3.5, review: "Expensive but convenient location", date: "2024-08-25" },
        { score: 4.0, review: "Clean and modern facilities", date: "2024-07-30" }
      ],
      keyInsights: ["120 reviews analyzed", "Average score: 4.0/5", "Real-time data from Booking.com"]
    },
    {
      name: "Lumbung Bukit Resort",
      location: "Bali, Indonesia", 
      rating: 4.6,
      totalReviews: 95,
      scrapedReviews: [
        { score: 4.8, review: "Incredible views and peaceful atmosphere", date: "2024-11-01" },
        { score: 4.5, review: "Perfect for relaxation and nature lovers", date: "2024-10-10" },
        { score: 4.7, review: "Amazing sunsets and great food", date: "2024-09-25" },
        { score: 4.3, review: "Beautiful but remote location", date: "2024-08-15" },
        { score: 4.9, review: "Best resort experience ever", date: "2024-07-05" }
      ],
      keyInsights: ["95 reviews analyzed", "Average score: 4.6/5", "Real-time data from Booking.com"]
    }
  ];

  try {
    // Test 1: Check if backend is running
    console.log('1️⃣ Checking backend health...');
    const healthResponse = await fetch(`${API_BASE_URL}/api/health`);
    if (!healthResponse.ok) {
      throw new Error('Backend is not running');
    }
    console.log('✅ Backend is healthy\n');

    // Test 2: Test AI recommendation endpoint
    console.log('2️⃣ Testing AI recommendation endpoint...');
    
    if (!OPENAI_API_KEY) {
      console.log('⚠️  No OpenAI API key provided. Testing fallback behavior...');
    } else {
      console.log(`🔑 Using OpenAI API key: ${OPENAI_API_KEY.substring(0, 8)}...`);
    }

    const aiResponse = await fetch(`${API_BASE_URL}/api/ai-recommendation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ hotels: testHotels }),
    });

    const aiData = await aiResponse.json();
    
    if (aiData.success) {
      console.log('✅ AI recommendation successful!');
      console.log(`📊 Recommendation: ${aiData.recommendation}`);
      console.log(`🏆 Top Choice: Hotel ${aiData.topChoice + 1}`);
      
      if (aiData.analysis) {
        console.log('\n📋 Analysis Details:');
        console.log(`✅ Strengths: ${aiData.analysis.strengths.join(', ')}`);
        console.log(`⚠️  Considerations: ${aiData.analysis.considerations.join(', ')}`);
        console.log(`🎯 Best for: ${aiData.analysis.bestFor}`);
      }
    } else if (aiData.fallback) {
      console.log('⚠️  OpenAI not configured, using fallback mode');
      console.log(`📊 Fallback message: ${aiData.error}`);
    } else {
      console.log('❌ AI recommendation failed');
      console.log(`Error: ${aiData.error}`);
    }

    console.log('\n🎉 OpenAI integration test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
testOpenAIIntegration();
