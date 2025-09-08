import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAIService from './openai-service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize OpenAI service
const openaiService = new OpenAIService();

// Middleware
app.use(cors());
app.use(express.json());

// Helper function to extract hotel name and country from Booking.com URL
function validateHotelUrl(url) {
  // Vérifier que l'URL est valide
  try {
    new URL(url);
  } catch {
    return { valid: false, error: 'URL invalide' };
  }

  // Vérifier que c'est bien une URL Booking.com
  if (!url.includes('booking.com')) {
    return { valid: false, error: 'L\'URL doit être de Booking.com' };
  }

  // Vérifier que c'est bien une page d'hôtel
  if (!url.includes('/hotel/')) {
    return { valid: false, error: 'L\'URL doit pointer vers une page d\'hôtel' };
  }

  // Vérifier que l'URL contient des informations suffisantes
  const urlParts = url.split('/');
  const hotelIndex = urlParts.findIndex(part => part === 'hotel');
  
  if (hotelIndex === -1 || hotelIndex === urlParts.length - 1) {
    return { valid: false, error: 'Format d\'URL d\'hôtel invalide' };
  }

  // Vérifier qu'il y a au moins un identifiant d'hôtel
  const hotelId = urlParts[hotelIndex + 1];
  if (!hotelId || hotelId.length < 2) {
    return { valid: false, error: 'Identifiant d\'hôtel manquant dans l\'URL' };
  }

  return { valid: true };
}

function extractHotelInfo(url) {
  try {
    // Valider l'URL d'abord
    const validation = validateHotelUrl(url);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    
    // Extract hotel name from URL path (usually after /hotel/)
    const hotelIndex = pathParts.findIndex(part => part === 'hotel');
    if (hotelIndex === -1 || hotelIndex === pathParts.length - 1) {
      throw new Error('Invalid hotel URL format');
    }
    
    // Get the hotel name - it's usually the second part after /hotel/
    let hotelName = pathParts[hotelIndex + 2] || pathParts[hotelIndex + 1];
    
    // Clean up hotel name - remove .fr.html or similar extensions
    hotelName = hotelName.replace(/\.(fr|en|es|de|it)\.html$/, '');
    
    // Convert to a more readable format
    hotelName = hotelName
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    // Special cases for known hotels based on URL patterns
    if (url.includes('asri-villas')) {
      hotelName = 'Asri Villas';
    } else if (url.includes('novotel')) {
      hotelName = 'Novotel Paris Centre Tour Eiffel';
    } else if (url.includes('lumbung')) {
      hotelName = 'Lumbung Bukit Resort';
    } else if (url.includes('soko')) {
      hotelName = 'The Soko';
    }
    
    // Extract country from URL (usually in the subdomain or path)
    let country = 'us'; // default
    const subdomain = urlObj.hostname.split('.')[0];
    if (subdomain && subdomain.length === 2) {
      country = subdomain;
    }
    
    // Extract location from URL if possible
    let location = 'Unknown';
    if (url.includes('asri-villas')) {
      location = 'Bali, Indonesia';
    } else if (url.includes('novotel') && url.includes('paris')) {
      location = 'Paris, France';
    } else if (url.includes('lumbung')) {
      location = 'Bali, Indonesia';
    } else if (url.includes('soko')) {
      location = 'Bali, Indonesia';
    } else if (hotelName.toLowerCase().includes('villas')) {
      location = 'Bali, Indonesia';
    } else if (hotelName.toLowerCase().includes('paris')) {
      location = 'Paris, France';
    } else if (hotelName.toLowerCase().includes('london')) {
      location = 'London, UK';
    } else if (hotelName.toLowerCase().includes('new york')) {
      location = 'New York, USA';
    } else {
      // Try to extract from country code
      const countryNames = {
        'fr': 'France',
        'en': 'United Kingdom',
        'es': 'Spain',
        'de': 'Germany',
        'it': 'Italy',
        'id': 'Indonesia',
        'us': 'United States'
      };
      location = countryNames[country] || 'Unknown';
    }
    
    return { hotelName, country, location };
  } catch (error) {
    throw new Error('Invalid URL format: ' + error.message);
  }
}

// Mock data for demonstration - Generate more diverse reviews
const generateMockReviews = (count) => {
  const baseReviews = [
    { score: 4.5, review: "Excellent hotel with great service", date: "2024-01-15" },
    { score: 4.0, review: "Good location and clean rooms", date: "2024-01-10" },
    { score: 4.8, review: "Amazing experience, highly recommended", date: "2024-01-05" },
    { score: 3.5, review: "Decent hotel but could be better", date: "2024-01-01" },
    { score: 4.2, review: "Nice stay overall", date: "2023-12-28" },
    { score: 4.7, review: "Perfect location and friendly staff", date: "2023-12-20" },
    { score: 3.8, review: "Good value for money", date: "2023-12-15" },
    { score: 4.9, review: "Outstanding service and beautiful rooms", date: "2023-12-10" },
    { score: 3.2, review: "Average hotel, nothing special", date: "2023-12-05" },
    { score: 4.6, review: "Great breakfast and comfortable beds", date: "2023-11-28" },
    { score: 4.1, review: "Clean and modern facilities", date: "2023-11-20" },
    { score: 3.9, review: "Good but overpriced", date: "2023-11-15" },
    { score: 4.4, review: "Nice pool and spa area", date: "2023-11-10" },
    { score: 3.7, review: "Decent stay, could improve breakfast", date: "2023-11-05" },
    { score: 4.8, review: "Fantastic views and excellent staff", date: "2023-10-28" },
    { score: 4.3, review: "Very clean and well maintained", date: "2023-10-20" },
    { score: 3.6, review: "Okay hotel, noisy at night", date: "2023-10-15" },
    { score: 4.7, review: "Lovely decor and great amenities", date: "2023-10-10" },
    { score: 4.0, review: "Good location near city center", date: "2023-10-05" },
    { score: 3.4, review: "Old building but functional", date: "2023-09-28" }
  ];

  const reviews = [];
  for (let i = 0; i < count; i++) {
    const baseReview = baseReviews[i % baseReviews.length];
    const variation = (Math.random() - 0.5) * 0.4; // ±0.2 variation
    const score = Math.max(1, Math.min(5, baseReview.score + variation));
    
    reviews.push({
      score: Math.round(score * 10) / 10,
      review: baseReview.review,
      date: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });
  }
  
  return reviews;
};

// API endpoint to scrape hotel reviews (mock version)
app.post('/api/scrape-reviews', async (req, res) => {
  const { url, sortBy = 'newest_first', nReviews = 50 } = req.body;
  
  if (!url) {
    return res.status(400).json({ 
      success: false,
      error: 'URL is required',
      code: 'MISSING_URL'
    });
  }

  // Valider l'URL
  const validation = validateHotelUrl(url);
  if (!validation.valid) {
    return res.status(400).json({
      success: false,
      error: validation.error,
      code: 'INVALID_URL'
    });
  }

  try {
    const { hotelName, country, location } = extractHotelInfo(url);
    
    console.log(`Mock scraping reviews for hotel: ${hotelName}, country: ${country}, location: ${location}`);
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate mock data - up to 200 reviews, or all available if less
    const maxReviews = Math.min(nReviews, 200);
    const availableReviews = Math.floor(Math.random() * 200) + 50; // Simulate 50-250 available reviews
    const actualReviewCount = Math.min(maxReviews, availableReviews);
    const reviews = generateMockReviews(actualReviewCount);
    
    res.json({
      success: true,
      hotelName,
      country,
      location,
      reviewCount: actualReviewCount,
      message: `Successfully scraped ${actualReviewCount} reviews (${availableReviews} available, mock data)`,
      reviews: reviews
    });

  } catch (error) {
    console.error('Error processing request:', error);
    res.status(400).json({ 
      success: false,
      error: error.message,
      code: 'PROCESSING_ERROR',
      details: error.message 
    });
  }
});

// API endpoint to get scraped data from files
app.get('/api/reviews/:hotelName', (req, res) => {
  const { hotelName } = req.params;
  
  // Generate mock data for the specific hotel
  const availableReviews = Math.floor(Math.random() * 200) + 50; // Simulate 50-250 available reviews
  const reviews = generateMockReviews(availableReviews);
  
  res.json({
    success: true,
    hotelName,
    totalReviews: reviews.length,
    reviews: reviews
  });
});

// AI-powered hotel recommendation
app.post('/api/ai-recommendation', async (req, res) => {
  try {
    const { hotels, criteria } = req.body;
    
    if (!hotels || !Array.isArray(hotels) || hotels.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Hotels data is required'
      });
    }

    // Check if OpenAI is configured
    if (!openaiService.isConfigured()) {
      return res.status(503).json({
        success: false,
        error: 'OpenAI API key not configured. Please set OPENAI_API_KEY environment variable.',
        fallback: true
      });
    }

    console.log('🤖 Starting AI analysis for', hotels.length, 'hotels');
    if (criteria && Object.keys(criteria).length > 0) {
      console.log('🎯 User criteria provided:', criteria);
    }
    
    const aiAnalysis = await openaiService.analyzeHotels(hotels, criteria || {});
    
    console.log('✅ AI analysis completed:', aiAnalysis.success ? 'Success' : 'Failed');
    
    res.json({
      success: true,
      ...aiAnalysis
    });

  } catch (error) {
    console.error('AI recommendation error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      fallback: true
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
  console.log(`Using mock data for demonstration`);
});
