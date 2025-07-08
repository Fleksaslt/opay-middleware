require('dotenv').config();
const express = require('express');
const app = express();
const generateSignature = require('./generateSignature');

app.use(express.json());

app.post('/generate-signature', (req, res) => {
  const data = req.body.data;
  const signature = generateSignature(data);
  res.json({ signature });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
