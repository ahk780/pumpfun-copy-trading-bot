const express = require('express');
const fetch = require('node-fetch');

const router = express.Router();

router.get('/price', async (req, res) => {
  try {
    const { ca, 'x-api-key': apiKey } = req.query;

    if (!ca || !apiKey) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const url = `https://api.coinvera.io/api/v1/price?ca=${ca}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      }
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Price fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch price' });
  }
});

module.exports = router; 