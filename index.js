require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const dns = require('dns');
const validUrl = require('valid-url'); // To validate the URL
const cors = require('cors'); // To handle CORS

const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

// In-memory URL storage (for simplicity)
let urlDatabase = {};
let counter = 1;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Enable CORS
app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Short URL API - POST to create a short URL
app.post('/api/shorturl', (req, res) => {
  const { url } = req.body;

  // Validate URL
  console.log('URL to validate:', url); // Log the URL being validated
  if (!validUrl.isWebUri(url)) {
    return res.json({ error: 'invalid url' });
  }

  // Extract domain from URL for DNS lookup
  const domain = url.split('://')[1].split('/')[0];
  console.log('Domain to lookup:', domain); // Log the domain being looked up

  // Perform DNS lookup to verify if the domain exists
  dns.lookup(domain, (err) => {
    if (err) {
      console.log('DNS lookup failed:', err); // Log DNS errors
      return res.json({ error: 'invalid url' });
    }

    // Create a short URL by incrementing a counter
    const shortUrl = counter++;
    urlDatabase[shortUrl] = url;

    console.log('Created short URL:', shortUrl); // Log the created short URL
    res.json({ original_url: url, short_url: shortUrl });
  });
});

// Redirect API - GET to redirect using short URL
app.get('/api/shorturl/:shorturl', (req, res) => {
  const shortUrl = req.params.shorturl;
  console.log('Short URL requested:', shortUrl); // Log the requested short URL
  const originalUrl = urlDatabase[shortUrl];

  if (!originalUrl) {
    console.log('Short URL not found'); // Log when short URL is not found
    return res.json({ error: 'Short URL not found' });
  }

  // Redirect to the original URL
  console.log('Redirecting to:', originalUrl); // Log the redirection
  res.redirect(originalUrl);
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
