'use strict';

const Rule = require('./rule');

const checkAndErr = {
  Rule: rule => {
    if (!(rule instanceof Rule)) {
      throw new Error(`Invalid rule: ${rule}. Expected a rule object.`);
    }
  },
  Integer: value => {
    if (!Number.isInteger(value)) {
      throw new Error(`Invalid integer: ${value}.`);
    }
  },
  Array: array => {
    if (!Array.isArray(array)) {
      throw new Error(`Invalid array: ${array}.`);
    }
  },
};

const checkAndWarn = {
  Primitive: value => {
    if (typeof value === 'object' && value !== null) {
      console.warn(
        `Warning: ${value} is not a primitive. ` +
        `The rule may lead to undesired results.`,
      );
    }
  },
};

module.exports = {
  checkAndErr: checkAndErr,
  checkAndWarn: checkAndWarn,
};
