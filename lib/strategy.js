/**
 * Module dependencies.
 */
var passport = require('passport-strategy')
  , util = require('util')
  , lookup = require('./utils').lookup;


/**
 * `Strategy` constructor.
 *
 */
function Strategy(options, verify) {
  if (typeof options == 'function') {
    verify = options;
    options = {};
  }
  if (!verify) { throw new TypeError('SymmetricTokenStrategy requires a verify callback'); }

  this._tokenField = options.tokenField || 'token';

  passport.Strategy.call(this);
  this.name = 'symmetric-token';
  this._verify = verify;
  this._passReqToCallback = options.passReqToCallback;
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

  var decryptedToken = decrypt(encryptedToken);

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
