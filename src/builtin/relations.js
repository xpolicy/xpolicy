'use strict';

const Rule = require('../rule');
const Enforcer = require('../enforcer');
const types = require('../type');

function Eq(wanted) {
  types.checkAndWarn.Primitive(wanted);
  return new Rule({
    name: 'equal to',
    validator: given => wanted === given,
  });
}

function NotEq(wanted) {
  types.checkAndWarn.Primitive(wanted);
  return new Rule({
    name: 'not equal to',
    validator: given => wanted !== given,
  });
}

function Greater(threshold) {
  types.checkAndErr.Number(threshold);
  return new Rule({
    name: 'greater than',
    validator: given => Number.isInteger(given) && given > threshold,
  });
}

function Less(threshold) {
  types.checkAndErr.Number(threshold);
  return new Rule({
    name: 'less than',
    validator: given => Number.isInteger(given) && given < threshold,
  });
}

function GreaterOrEq(threshold) {
  types.checkAndErr.Number(threshold);
  return new Rule({
    name: 'greater than or equal to',
    validator: given => Number.isInteger(given) && given >= threshold,
  });
}

function LessOrEq(threshold) {
  types.checkAndErr.Number(threshold);
  return new Rule({
    name: 'less than or equal to',
    validator: given => Number.isInteger(given) && given <= threshold,
  });
}

function In(array) {
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
}

function NotIn(array) {
  types.checkAndErr.Array(array);

  const validator = data => !In(array).validate(data);

  return new Rule({
    name: 'not in array',
    validator,
  });
}

function AllIn(array) {
  types.checkAndErr.Array(array);
  return new Rule({
    name: 'all in array',
    validator: testArray => {
      return (
        Array.isArray(testArray) &&
        // Check that every test element satisfies an element in the target array.
        testArray.every(testEle => In(array).validate(testEle))
      );
    },
  });
}

function StartsWith(start) {
  types.checkAndWarn.Primitive(start);
  return new Rule({
    name: 'starts with',
    validator: test => test.startsWith(start),
  });
}

function EndsWith(end) {
  types.checkAndWarn.Primitive(end);
  return new Rule({
    name: 'ends with',
    validator: test => test.endsWith(end),
  });
}

function Contains(cont) {
  types.checkAndWarn.Primitive(cont);
  return new Rule({
    name: 'contains',
    validator: test => test.includes(cont),
  });
}

module.exports = {
  Eq,
  NotEq,
  Greater,
  Less,
  GreaterOrEq,
  LessOrEq,
  In,
  NotIn,
  AllIn,
  StartsWith,
  EndsWith,
  Contains,
};
