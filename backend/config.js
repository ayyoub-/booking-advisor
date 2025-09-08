export const config = {
  port: process.env.PORT || 3001,
  scraperPath: process.env.SCRAPER_PATH || '../booking-reviews-scraper',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173'
};
