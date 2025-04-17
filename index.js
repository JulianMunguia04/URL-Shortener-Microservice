require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.post('/api/shorturl', (req, res) => {
  const { url } = req.body;
  
  // Simple regex to check for a valid URL format
  const urlPattern = /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+/;
  if (!urlPattern.test(url)) {
    return res.json({ error: 'invalid url' });
  }

  // Verify the domain via DNS lookup
  const domain = url.split('://')[1].split('/')[0];
  dns.lookup(domain, (err) => {
    if (err) {
      return res.json({ error: 'invalid url' });
    }

    // Create a short URL
    const shortUrl = counter++;
    urlDatabase[shortUrl] = url;

    res.json({ original_url: url, short_url: shortUrl });
  });
});

// Redirect API - GET to redirect using short URL
app.get('/api/shorturl/:shorturl', (req, res) => {
  const shortUrl = req.params.shorturl;
  const originalUrl = urlDatabase[shortUrl];

  if (!originalUrl) {
    return res.json({ error: 'Short URL not found' });
  }

  res.redirect(originalUrl);
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
