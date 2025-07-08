
require('dotenv').config();
const express = require('express');
const crypto = require('crypto');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());

const { OPAY_WEBSITE_ID, OPAY_SIGNATURE_PASSWORD, ALLOWED_DOMAIN } = process.env;

function generateSignature(params) {
  const keys = Object.keys(params).sort();
  const str = keys.map(k => `${k}=${params[k]}`).join('&') + OPAY_SIGNATURE_PASSWORD;
  return crypto.createHash('md5').update(str).digest('hex');
}

app.post('/api/opay-payment', (req, res) => {
  const o = req.body;
  const data = {
    version: "1.6",
    projectid: OPAY_WEBSITE_ID,
    orderid: o.id,
    amount: Math.round(o.amount * 100),
    currency: "EUR",
    country: "LT",
    accepturl: `https://${ALLOWED_DOMAIN}/payment-success`,
    cancelurl: `https://${ALLOWED_DOMAIN}/payment-cancel`,
    callbackurl: `https://${ALLOWED_DOMAIN}/api/opay-callback`,
    payment: "",
    lang: "LIT",
    test: 0,
    user_email: o.email,
    p_firstname: o.firstName,
    p_lastname: o.lastName
  };
  data.sign = generateSignature(data);
  const url = `https://opay.lt/pay?${new URLSearchParams(data).toString()}`;
  res.json({ redirectUrl: url });
});

app.post('/api/opay-callback', (req, res) => {
  const received = req.body;
  const sign = received.sign;
  delete received.sign;
  if (sign === generateSignature(received)) {
    console.log("Patvirtintas: ", received.orderid);
    res.send("OK");
  } else {
    console.error("Netinkamas sign");
    res.status(400).send("Bad signature");
  }
});

app.listen(process.env.PORT || 3000, () =>
  console.log(`Serveris veikia per portą ${process.env.PORT || 3000}`)
);
