const express = require('express');
const cors = require('cors');
const priceRouter = require('./api/price');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', priceRouter);

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 