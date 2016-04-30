var jwt = require('jwt-simple');

// this middleware can be used to check the scope of a user's token
// to see if they have correct permissions
module.exports = function (app) {
    var secret = app.get('config').secret;

    return function (routeScopes) {
        return function (req, res, next) {
            var authorization = req.headers.authorization || '';
            var token = authorization.trim();
            var decoded;
            var authorized = false;
            var needsUserAuth = false;
            var error = {
                status: 401,
                message: 'Unauthorized user token'
            };

            // decode JSON web token
            if (token) {
                try {
                    decoded = jwt.decode(token, secret);
                } catch (e) {
                    e.status = 401;
                    return next(e);
                }
            }

            // add decoded token and scopes to res object to be checked later.
            // full authentication occurrs in authenticator function in /lib/models
            if (decoded && decoded.scopes && decoded.scopes.length) {

                // compare scopes in token with scopes in middleware to find match
                for (var i = 0, l = decoded.scopes.length; i < l; i++) {
                    for (var j = 0, m = routeScopes.length; j < m; j++) {
                        if (routeScopes[j] === 'currentUser') {
                            needsUserAuth = true;
                        } else if (!authorized && decoded.scopes[i] === routeScopes[j]) {
                            authorized = true;
                        }
                    }
                }

                if (!authorized && !needsUserAuth) {
                    return next(error);
                } else {
                    res.locals.auth = {
                        decoded: decoded,
                        authorized: authorized,
                        needsUserAuth: needsUserAuth
                    };
                    return next();
                }
            } else {
                return next(error);
            }

        };
    };
};
