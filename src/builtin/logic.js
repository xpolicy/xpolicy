'use strict';

const Rule = require('../rule');
const types = require('../type');

module.exports = {
  Any: () =>
    new Rule({
      name: 'any',
      validator: () => true,
    }),
  None: () =>
    new Rule({
      name: 'none',
      validator: () => false,
    }),
  And: (r1, r2) => {
    types.checkAndErr.Rule(r1);
    types.checkAndErr.Rule(r2);
    return new Rule({
      name: 'and',
      validator: d => r1.validate(d) && r2.validate(d),
    });
  },
  Or: (r1, r2) => {
    types.checkAndErr.Rule(r1);
    types.checkAndErr.Rule(r2);
    return new Rule({
      name: 'or',
      validator: d => r1.validate(d) || r2.validate(d),
    });
  },
  Not: r => {
    types.checkAndErr.Rule(r);
    return new Rule({
      name: 'not',
      validator: d => !r.validate(d),
    });
  },
};
