var crypto = require('crypto');

function Crypto(config) {
  if (!config) { throw new TypeError('Crypto must be configured'); }
  if (!config.algorithm) { throw new TypeError('Crypto#algorithm must be configured'); }
  if (!config.secret) { throw new TypeError('Crypto#secret must be configured'); }
  this.algorithm = config.algorithm;
  this.secret = config.secret;
}

Crypto.prototype.encrypt = function(field) {
  var cipher = crypto.createCipher(this.algorithm, this.secret)
  var crypted = cipher.update(field,'utf8','hex')
  crypted += cipher.final('hex');
  return crypted;
};

Crypto.prototype.decrypt = function(cryptedField) {
  try {
    var decipher = crypto.createDecipher(this.algorithm,this.secret)
    var dec = decipher.update(cryptedField,'hex','utf8')
    dec += decipher.final('utf8');
    return dec;
  } catch (e) {
    return null;
  }
};

module.exports = Crypto;
