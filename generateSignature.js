const crypto = require('crypto');

function generateSignature(websiteId, userId, orderId, amount, currency, secret) {
  const raw = websiteId + userId + orderId + amount + currency + secret;
  return crypto.createHash('sha1').update(raw).digest('hex');
}

module.exports = { generateSignature };
