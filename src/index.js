'use strict';

const Enforcer = require('./enforcer');
const Operation = require('./operation');
const Policy = require('./policy');
const builtin = require('./builtin');

module.exports = {
  Enforcer,
  Operation,
  Policy,
  Allow: builtin.effects.Allow,
  Deny: builtin.effects.Deny,
  rules: builtin.rules,
};
