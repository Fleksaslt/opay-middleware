require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { generateSignature } = require('./generateSignature');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post('/generate-signature', (req, res) => {
  const { websiteId, userId, orderId, amount, currency } = req.body;
  const secret = process.env.OPAY_SECRET;

  if (!websiteId || !userId || !orderId || !amount || !currency || !secret) {
    return res.status(400).json({ error: 'Missing required fields or secret' });
  }

  const signature = generateSignature(websiteId, userId, orderId, amount, currency, secret);
  res.json({ signature });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
