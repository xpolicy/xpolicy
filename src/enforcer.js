'use strict';

const Policy = require('./policy');
const Operation = require('./operation');
const Rule = require('./rule');

class Enforcer {
  constructor(policy) {
    Enforcer.validateProps(policy);

    this.policy = policy;
  }

  isAllowed(operation) {
    if (!(operation instanceof Operation)) {
      throw new Error(
        `Invalid operation: ${operation}. Expected an operation object.`,
      );
    }

    const effect = this.policy.effect.isAllowed();

    if (this.policy.actions) {
      if (!Enforcer.validateOneInArray(this.policy.actions, operation.action)) {
        return !effect;
      }
    }

    if (this.policy.subjects) {
      if (
        !Enforcer.validateOneInArray(this.policy.subjects, operation.subject)
      ) {
        return !effect;
      }
    }

    if (this.policy.resources) {
      if (
        !Enforcer.validateOneInArray(this.policy.resources, operation.resource)
      ) {
        return !effect;
      }
    }

    if (this.policy.context) {
      try {
        !Enforcer.recursivelyValidateParallel(
          this.policy.context,
          operation.context,
        );
      } catch (e) {
        return false;
      }
    }

    return effect;
  }

  static validateOneInArray(array, test) {
    for (const rule of array) {
      try {
        Enforcer.recursivelyValidateParallel(rule, test);
        // Subject validation passes if at least one subject matches.
        return true;
      } catch (e) {}
    }
    return false;
  }

  static recursivelyValidateParallel(rule, opData) {
    if (!rule) {
      throw new Error(
        'Recursive parallel validation requires a rule to enforce.',
      );
    }
    if (!opData) {
      throw new Error(
        'Recursive parallel validation requires operation data to check.',
      );
    }
    if (rule instanceof Rule) {
      const valid = rule.validate(opData);
      if (!valid) {
        throw new Error('Rule validation failed.');
      }
    }
    if (opData.constructor === Object && rule.constructor === Object) {
      if (Object.keys(opData).length !== Object.keys(rule).length) {
        throw new Error('Mismatched number of attributes.');
      }
      if (
        !Object.keys(opData).every(k => Object.keys(rule).indexOf(k) !== -1)
      ) {
        throw new Error('Attribute names do not match.');
      }
      for (const k of Object.keys(opData)) {
        Enforcer.recursivelyValidateParallel(rule[k], opData[k]);
      }
    }
  }

  static validateProps(policy) {
    if (!policy) {
      throw new Error('Enforcer requires a policy to enforce.');
    }
    if (!(policy instanceof Policy)) {
      throw new Error(`Invalid policy: ${policy}. Expected a policy object.`);
    }
  }
}

module.exports = Enforcer;
