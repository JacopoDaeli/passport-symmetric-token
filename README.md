# passport-symmetric-token

[Passport](http://passportjs.org/) strategy for authenticating with encrypted token based credentials.

This module lets you authenticate in one Node.js application `A` from another
application `B` where the user is already authenticated, using a
token based on an encrypted `user.field`.

## Install

    $ npm install passport-symmetric-token

## Usage

### Configure Strategy

The two applications share the same algorithm and secret used for encrypt/decrypt
the user information.

#### Application where user is already logged (B)

```
var Crypto = new require('passport-symmetric-token').Crypto;
var crypto = new Crypto({ algorithm: 'aes-256-ctr', secret: 'YOUR SECRET HERE' });

var encryptedField = crypto.encrypt(user.field);

app.redirect(config.appWhereYouWantLoginTheUserURL + '/auth/symmetric-token?token=' + encryptedField)
```

#### Application where to you want login the user (A)

##### Enable the Strategy
The symmetric-token authentication strategy authenticates users using a token
created encrypting `user.field`. The strategy requires a `verify` callback,
which accepts these credentials and calls `done` providing a user.
```
    passport.use(new SymmetricTokenStrategy (
      function(decryptedToken , done) {
        User.findOne({ field: decryptedToken }, function (err, user) {
          if (err) { return done(err); }
          if (!user) { return done(null, false); }
          return done(null, user);
        });
      }
    ));
```

##### Authenticate Requests

Use `passport.authenticate()`, specifying the `'symmetric-token'` strategy, to
authenticate requests.

For example, as route middleware in an [Express](http://expressjs.com/)
application:
```
  router.get('/auth/symmetric-token',
    passport.authenticate('symmetric-token'));
```

## Credits

  - [Jacopo Daeli](http://github.com/JacopoDaeli)

## License

[The MIT License](http://opensource.org/licenses/MIT)

Copyright (c) 2011-2014 Jared Hanson <[http://jaredhanson.net/](http://jaredhanson.net/)>
