'use strict';
const jwt = require('jsonwebtoken');

module.exports = () => {
  return function isAuthenticated(req, res, next) {
    console.log('isAuthenticated !!!!!');

    let token = getJWTToken(req);
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        console.log(err);
        next(err);
      } else {
        req.user = decoded;
        next();
      }
    });
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
