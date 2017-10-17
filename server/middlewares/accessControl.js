'use strict';
const jwt = require('jsonwebtoken');
const get = require('lodash/get');
const reduce = require('lodash/reduce');
const assign = require('lodash/assign');
const acl = require('node-access-control');

/**
 * Populates the request by setting the user.
 * This user can be retrieved from the next middlewares or the remote methods
 *
 * @returns {authenticateUser}
 */
module.exports = () => {

  acl.denyAll();
  acl.add(['admin'], 'any', '.*', 'allow');
  acl.add(['player'], 'POST', '/api/purchases.*', 'allow');

  return function accessControl(req, res, next) {
    console.log('middleware:accessControl');

    //get user information from JWT
    let token = getJWTToken(req);
    if (token) {
      jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
          res.status(500).send(err);
        } else {
          console.log(user);
          const authorised = acl.can(user, req.method, req.baseUrl);
          console.log('authorised: ' + authorised);
          if (authorised) {
            req.user = user;
            next();
          }else{
            const error = new Error('Not Authorized');
            error.statusCode = 401;
            next(error);
          }
        }
      });
    }else{
      next();
    }
  };
};

function getJWTToken(req) {
  let token = req.headers.Authorization || req.headers.authorization;
  if (token) {
    const split = token.split(' ');

    if (split.length === 2) {
      token = split[1];
    }
  }

  return token;
}
