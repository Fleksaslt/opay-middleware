require('dotenv').config();
const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

function generateSignature(params, secret) {
  const sortedKeys = Object.keys(params).sort();
  const paramString = sortedKeys.map(key => key + params[key]).join('');
  return crypto.createHmac('sha256', secret).update(paramString).digest('hex');
}

app.post('/api/opay-payment', async (req, res) => {
  const { amount, currency, order_id, return_url, cancel_url } = req.body;

  const params = {
    projectid: process.env.OPAY_WEBSITE_ID,
    orderid: order_id,
    accepturl: return_url,
    cancelurl: cancel_url,
    callbackurl: return_url,
    amount: amount * 100,
    currency,
    payment: 'card',
    country: 'LT'
  };

  const signature = generateSignature(params, process.env.OPAY_SIGNATURE_PASSWORD);
  params.sign = signature;

  const url = `https://opay.lt/pay?${new URLSearchParams(params).toString()}`;
  res.json({ redirectUrl: url });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
