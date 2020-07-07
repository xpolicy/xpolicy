'use strict';

const Operation = require('./operation');
const Modifier = require('./modifier');

class Enforcer {
  constructor(policy) {
    Enforcer.validateProps(policy);

    this.policy = policy;
  }

  isAllowed(operation) {
    if (!(operation instanceof Operation)) {
      throw new Error(
        `Invalid operation: ${operation}. Expected an Operation object.`,
      );
    }

    if (this.policy.subjects) {
      for (const subject of this.policy.subjects) {
        Enforcer.recursivelyValidateParallel(operation.subject, subject);
      }
    }
  }

  static recursivelyValidateParallel(opData, rule) {
    if (!opData) {
      throw new Error(
        'Recurse parallel validation requires operation data to authorize.',
      );
    }
    if (!rule) {
      throw new Error(
        'Recursive parallel validation requires a rule to enforce.',
      );
    }
    if (rule instanceof Modifier) {
      const valid = rule.validate(opData);
      if (!valid) {
        throw new Error('Modifier validation failed.');
      }
    }
    if (opData.constructor === Object && rule.constructor === Object) {
      if (Object.keys(opData).length !== Object.keys(rule).length) {
        throw new Error('Mismatched number of attributes.');
      }
      if (!Object.keys(opData).every(k => Object.keys(rule).indexOf(k))) {
        throw new Error('Attribute names do not match.');
      }
      for (const k of Object.keys(opData)) {
        Enforcer.recursivelyValidateParallel(opData[k], rule[k]);
      }
    }
  }

  static validateProps(policy) {
    if (!policy) {
      throw new Error('Enforcer requires a policy to enforce.');
    }
  }
}

module.exports = Enforcer;
