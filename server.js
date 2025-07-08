require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const axios = require('axios');
const { generateSignature } = require('./utils/generateSignature');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post('/initiate-payment', (req, res) => {
  const { order_id, amount } = req.body;
  const currency = 'EUR';

  const signature = generateSignature(
    process.env.OPAY_WEBSITE_ID,
    process.env.OPAY_USER_ID,
    order_id,
    amount,
    currency,
    process.env.OPAY_SIGNATURE_PASSWORD
  );

  const redirectUrl = `https://payment.opay.lt/pay?websiteid=${process.env.OPAY_WEBSITE_ID}&userid=${process.env.OPAY_USER_ID}&orderid=${order_id}&amount=${amount}&currency=${currency}&signature=${signature}`;

  return res.redirect(redirectUrl);
});

app.post('/opay-ipn', async (req, res) => {
  const { orderid, amount, currency, payment_status, signature } = req.body;

  const expectedSignature = generateSignature(
    process.env.OPAY_WEBSITE_ID,
    process.env.OPAY_USER_ID,
    orderid,
    amount,
    currency,
    process.env.OPAY_SIGNATURE_PASSWORD
  );

  if (signature !== expectedSignature) {
    return res.status(400).send('Invalid signature');
  }

  if (payment_status === 'SUCCESS') {
    try {
      await axios.post(
        `https://${process.env.SHOPIFY_STORE}.myshopify.com/admin/api/2023-07/orders/${orderid}/transactions.json`,
        {
          transaction: {
            kind: "sale",
            status: "success"
          }
        },
        {
          headers: {
            'X-Shopify-Access-Token': process.env.SHOPIFY_API_TOKEN,
            'Content-Type': 'application/json'
          }
        }
      );

      return res.send('Order marked as paid');
    } catch (error) {
      console.error('Shopify API error:', error.response?.data || error.message);
      return res.status(500).send('Failed to update order');
    }
  } else {
    return res.send('Payment not successful');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`OPAY middleware server listening on port ${PORT}`);
});
