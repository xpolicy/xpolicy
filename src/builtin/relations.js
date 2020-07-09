'use strict';

const Rule = require('../rule');
const Enforcer = require('../enforcer');
const types = require('../type');

module.exports = {
  Eq: wanted => {
    types.checkAndWarn.Primitive(wanted);
    return new Rule({
      name: 'equal to',
      validator: given => wanted === given,
    });
  },
  NotEq: wanted => {
    types.checkAndWarn.Primitive(wanted);
    return new Rule({
      name: 'not equal to',
      validator: given => wanted !== given,
    });
  },
  Greater: threshold => {
    types.checkAndErr.Number(threshold);
    return new Rule({
      name: 'greater than',
      validator: given => Number.isInteger(given) && given > threshold,
    });
  },
  Less: threshold => {
    types.checkAndErr.Number(threshold);
    return new Rule({
      name: 'less than',
      validator: given => Number.isInteger(given) && given < threshold,
    });
  },
  GreaterOrEq: threshold => {
    types.checkAndErr.Number(threshold);
    return new Rule({
      name: 'greater than or equal to',
      validator: given => Number.isInteger(given) && given >= threshold,
    });
  },
  LessOrEq: threshold => {
    types.checkAndErr.Number(threshold);
    return new Rule({
      name: 'less than or equal to',
      validator: given => Number.isInteger(given) && given <= threshold,
    });
  },
  In: array => {
    types.checkAndErr.Array(array);

    const validator = test => {
      for (const rule of array) {
        if (rule instanceof Rule) {
          const valid = rule.validate(test);
          if (valid) return true;
        } else if (rule.constructor === Object) {
          const valid = Enforcer.recursivelyValidate(rule, test);
          if (valid) return true;
        } else {
          if (test === rule) return true;
        }
      }

      return false;
    };

    return new Rule({
      name: 'in array',
      validator,
    });
  },
  NotIn: array => {
    types.checkAndErr.Array(array);
    return new Rule({
      name: 'not in array',
      validator: ele => array.indexOf(ele) === -1,
    });
  },
  AllIn: array => {
    types.checkAndErr.Array(array);
    return new Rule({
      name: 'all in array',
      validator: testArray => {
        return (
          Array.isArray(testArray) &&
          // Check that every test element is in the target array.
          testArray.every(testEle => array.indexOf(testEle) !== -1)
        );
      },
    });
  },
  StartsWith: start => {
    types.checkAndWarn.Primitive(start);
    return new Rule({
      name: 'starts with',
      validator: test => test.startsWith(start),
    });
  },
  EndsWith: end => {
    types.checkAndWarn.Primitive(end);
    return new Rule({
      name: 'ends with',
      validator: test => test.endsWith(end),
    });
  },
  Contains: cont => {
    types.checkAndWarn.Primitive(cont);
    return new Rule({
      name: 'contains',
      validator: test => test.includes(cont),
    });
  },
};
