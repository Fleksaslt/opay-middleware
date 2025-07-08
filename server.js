const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const crypto = require("crypto");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const WEBSITE_ID = "8W22585YXJ";
const USER_ID = "8U22584SNF";
const SIGNATURE_PASSWORD = "24a4e5b1e2e59e8bbf19001ef2854fa3";

const OPAY_API_URL = "https://opay.lt/pay";
const REDIRECT_BASE = "https://opay.lt/pay";

function generateSignature(params, password) {
  const sortedKeys = Object.keys(params).sort();
  const sortedParams = sortedKeys.map((key) => `${key}=${params[key]}`).join("&");
  const stringToSign = sortedParams + password;
  return crypto.createHash("md5").update(stringToSign).digest("hex");
}

app.post("/api/opay-payment", async (req, res) => {
  const { amount, currency, order_id, return_url, cancel_url } = req.body;

  const amountCents = Math.round(parseFloat(amount) * 100);

  const data = {
    projectid: WEBSITE_ID,
    orderid: order_id,
    amount: amountCents,
    currency: currency,
    accepturl: return_url,
    cancelurl: cancel_url,
    callbackurl: "https://fleksas.lt/api/opay-callback",
    test: 0,
  };

  const sign = generateSignature(data, SIGNATURE_PASSWORD);
  data.sign = sign;

  const redirectUrl = `${REDIRECT_BASE}?${Object.entries(data)
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join("&")}`;

  res.json({ redirectUrl });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
