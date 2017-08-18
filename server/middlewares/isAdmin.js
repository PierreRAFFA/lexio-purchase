'use strict';
const jwt = require('jsonwebtoken');
const get = require('lodash/get');
const reduce = require('lodash/reduce');

module.exports = () => {
  return function isAdmin(req, res, next) {
    console.log('isAdmin !!!!!');

    console.log(req.user.roles);

    const roles = get(req, 'user.roles');

    let isAdmin = false;
    if (roles) {
      isAdmin = reduce(roles, (result, role) => result || role.name === 'admin', false);
    }

    if (isAdmin) {
      next();
    } else {
      const error = new Error('Not Authorized');
      error.statusCode = 401;
      next(error);
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
