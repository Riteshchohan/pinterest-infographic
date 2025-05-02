// server.js
const express = require('express');
const puppeteer = require('puppeteer');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Screenshot API endpoint
app.post('/api/screenshot', async (req, res) => {
  try {
    // Launch a headless browser
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      headless: true
    });
    
    // Create a new page
    const page = await browser.newPage();
    
    // Set viewport size - adjust to match your infographic dimensions
    await page.setViewport({
      width: 800,
      height: 1600,
      deviceScaleFactor: 2 // Higher resolution screenshot
    });
    
    // Navigate to the page (using the actual deployed URL in production)
    const pageUrl = process.env.NODE_ENV === 'production' 
      ? `${req.protocol}://${req.get('host')}` 
      : `http://localhost:${port}`;
      
    await page.goto(pageUrl, {
      waitUntil: 'networkidle2'
    });
    
    // Wait for the infographic to fully render
    await page.waitForSelector('.infographic');
    
    // Get the element to capture
    const element = await page.$('#capture');
    
    // Take a screenshot of just that element
    const screenshot = await element.screenshot({
      type: 'png',
      omitBackground: false
    });
    
    // Close the browser
    await browser.close();
    
    // Set proper content type and send the screenshot
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', 'attachment; filename="pinterest-marketing-infographic.png"');
    res.send(screenshot);
    
  } catch (error) {
    console.error('Error taking screenshot:', error);
    res.status(500).send('Error taking screenshot');
  }
});

// Serve the index.html for all routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});