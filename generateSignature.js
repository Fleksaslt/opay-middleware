const crypto = require('crypto');

function generateSignature(data) {
  const secret = process.env.OPAY_SIGNATURE_PASSWORD;
  return crypto.createHmac('sha256', secret).update(data).digest('hex');
}

module.exports = generateSignature;
