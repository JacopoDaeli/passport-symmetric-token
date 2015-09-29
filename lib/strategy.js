/**
 * Module dependencies.
 */
var passport = require('passport-strategy')
  , Crypto = require('./crypto')
  , util = require('util')
  , lookup = require('./utils').lookup;


/**
 * `Strategy` constructor.
 *
 */
 function Strategy(config, verify) {

   if (typeof config == 'function') { throw new TypeError('SymmetricTokenStrategy must be configured'); }
   if (!config.strategy) { throw new TypeError('SymmetricTokenStrategy#strategy must be configured'); }
   if (!config.strategy.secret) { throw new TypeError('SymmetricTokenStrategy#strategy.secret must be configured'); }
   if (!config.strategy.algorithm) {
     console.log('SymmetricTokenStrategy: using aes-256-ctr');
     config.strategy.algorithm = 'aes-256-ctr';
   }
   if (!verify) { throw new TypeError('SymmetricTokenStrategy requires a verify callback'); }

   this._tokenField = config.tokenField || 'token';

   passport.Strategy.call(this);
   this.name = 'symmetric-token';
   this._verify = verify;
   this._crypto = new Crypto(config.strategy);
   this._passReqToCallback = config.passReqToCallback;
 }

/**
 * Inherit from `passport.Strategy`.
 */
util.inherits(Strategy, passport.Strategy);

/**
 * Authenticate request based on the contents of a form submission.
 *
 * @param {Object} req
 * @api protected
 */
Strategy.prototype.authenticate = function(req, options) {
  options = options || {};
  var encryptedToken = lookup(req.query, this._tokenField) || lookup(req.body, this._tokenField);

  if (!encryptedToken) {
    return this.fail({ message: options.badRequestMessage || 'Missing credentials' }, 400);
  }

  var decryptedToken = this._crypto.decrypt(encryptedToken);

  var self = this;

  function verified(err, user, info) {
    if (err) { return self.error(err); }
    if (!user) { return self.fail(info); }
    self.success(user, info);
  }

  try {

    if (self._passReqToCallback) {
      this._verify(req, decryptedToken, verified);
    } else {
      this._verify(decryptedToken, verified);
    }
  } catch (ex) {
    return self.error(ex);
  }
};


/**
 * Expose `Strategy`.
 */
module.exports = Strategy;
