import express from 'express';
import cors from 'cors';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Path to the Python scraper
const SCRAPER_PATH = path.join(__dirname, '../booking-reviews-scraper');

// Helper function to extract hotel name and country from Booking.com URL
function extractHotelInfo(url) {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    
    // Extract hotel name from URL path (usually after /hotel/)
    const hotelIndex = pathParts.findIndex(part => part === 'hotel');
    if (hotelIndex === -1 || hotelIndex === pathParts.length - 1) {
      throw new Error('Invalid hotel URL format');
    }
    
    const hotelName = pathParts[hotelIndex + 1];
    
    // Extract country from URL (usually in the subdomain or path)
    let country = 'us'; // default
    const subdomain = urlObj.hostname.split('.')[0];
    if (subdomain && subdomain.length === 2) {
      country = subdomain;
    }
    
    return { hotelName, country };
  } catch (error) {
    throw new Error('Invalid URL format: ' + error.message);
  }
}

// API endpoint to scrape hotel reviews
app.post('/api/scrape-reviews', async (req, res) => {
  const { url, sortBy = 'newest_first', nReviews = 50 } = req.body;
  
  if (!url) {
    return res.status(400).json({ error: 'Hotel URL is required' });
  }

  try {
    const { hotelName, country } = extractHotelInfo(url);
    
    console.log(`Scraping reviews for hotel: ${hotelName}, country: ${country}`);
    
    // Install scraper dependencies if needed
    const installProcess = spawn('/usr/bin/python3', ['-m', 'pip', 'install', '-r', 'requirements.txt'], {
      cwd: SCRAPER_PATH,
      stdio: ['pipe', 'pipe', 'pipe'],
      env: {
        ...process.env,
        PATH: '/venv/bin:' + process.env.PATH
      }
    });

    installProcess.on('close', (installCode) => {
      if (installCode !== 0) {
        console.log('Warning: Failed to install scraper dependencies, continuing anyway...');
      }

      // Run the Python scraper using virtual environment
      const pythonProcess = spawn('/usr/bin/python3', [
        'run.py',
        hotelName,
        country,
        '--sort-by', sortBy,
        '--n-reviews', nReviews.toString(),
        '--no-save-review-to-disk'
      ], {
        cwd: SCRAPER_PATH,
        stdio: ['pipe', 'pipe', 'pipe'],
        env: {
          ...process.env,
          PATH: '/venv/bin:' + process.env.PATH
        }
      });

      let output = '';
      let errorOutput = '';

      pythonProcess.stdout.on('data', (data) => {
        output += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          console.error('Python scraper error:', errorOutput);
          return res.status(500).json({ 
            error: 'Scraping failed', 
            details: errorOutput 
          });
        }

        // Parse the output to extract review count
        const reviewCountMatch = output.match(/Total Reviews\s+(\d+)/);
        const reviewCount = reviewCountMatch ? parseInt(reviewCountMatch[1]) : 0;

        res.json({
          success: true,
          hotelName,
          country,
          reviewCount,
          message: `Successfully scraped ${reviewCount} reviews`,
          output: output.trim()
        });
      });

      pythonProcess.on('error', (error) => {
        console.error('Failed to start Python scraper:', error);
        res.status(500).json({ 
          error: 'Failed to start scraping process',
          details: error.message 
        });
      });
    });

  } catch (error) {
    console.error('Error processing request:', error);
    res.status(400).json({ 
      error: 'Invalid request', 
      details: error.message 
    });
  }
});

// API endpoint to get scraped data from files
app.get('/api/reviews/:hotelName', (req, res) => {
  const { hotelName } = req.params;
  const outputDir = path.join(SCRAPER_PATH, 'output');
  
  try {
    // Find the most recent folder for this hotel
    const folders = fs.readdirSync(outputDir)
      .filter(folder => folder.startsWith(hotelName))
      .sort()
      .reverse();
    
    if (folders.length === 0) {
      return res.status(404).json({ error: 'No data found for this hotel' });
    }
    
    const latestFolder = folders[0];
    const csvPath = path.join(outputDir, latestFolder, 'reviews_newest_first.csv');
    
    if (!fs.existsSync(csvPath)) {
      return res.status(404).json({ error: 'Review data not found' });
    }
    
    // Read and parse CSV data
    const csvData = fs.readFileSync(csvPath, 'utf-8');
    const lines = csvData.split('\n');
    const headers = lines[0].split(',');
    const reviews = lines.slice(1)
      .filter(line => line.trim())
      .map(line => {
        const values = line.split(',');
        const review = {};
        headers.forEach((header, index) => {
          review[header.trim()] = values[index] ? values[index].trim() : '';
        });
        return review;
      });
    
    res.json({
      success: true,
      hotelName,
      totalReviews: reviews.length,
      reviews: reviews.slice(0, 100) // Limit to first 100 reviews for performance
    });
    
  } catch (error) {
    console.error('Error reading review data:', error);
    res.status(500).json({ 
      error: 'Failed to read review data',
      details: error.message 
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
  console.log(`Scraper path: ${SCRAPER_PATH}`);
});
