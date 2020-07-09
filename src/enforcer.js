'use strict';

const Policy = require('./policy');
const Operation = require('./operation');
const Rule = require('./rule');

class Enforcer {
  /**
   * Constructs a new enforcer.
   */
  constructor() {
    this.policies = [];
  }

  /**
   * Adds a new policy to the array of enforced policies.
   *
   * @param {Policy} policy
   */
  addPolicy(policy) {
    Enforcer.validatePolicy(policy);

    // TODO: Check duplicate ids
    this.policies.push(policy);
  }

  /**
   * Checks whether the given operation is allowed according to the enforced
   * policies.
   *
   * @param operation {Operation} The operation to check.
   * @returns {boolean} whether the operation is allowed.
   */
  isAllowed(operation) {
    for (const p of this.policies) {
      const effect = p.effect.isAllowed();
      if (Enforcer.checkPolicy(operation, p)) {
        return effect;
      }
    }
    return false;
  }

  /**
   * Checks if the operation is allowed according to the given policy.
   *
   * @param operation {Operation} The attempted operation.
   * @param policy {Policy} The policy to enforce.
   * @returns {boolean} whether the operation is matches the policy.
   */
  static checkPolicy(operation, policy) {
    if (!(operation instanceof Operation)) {
      throw new Error(
        `Invalid operation: ${operation}. Expected an operation object.`,
      );
    }

    const arrayProps = ['action', 'subject', 'resource'];

    for (const prop of arrayProps) {
      const policyRules = policy[`${prop}s`];
      if (!policyRules) continue;

      const valid = Enforcer.validateOneInArray(policyRules, operation[prop]);
      if (!valid) return false;
    }

    if (policy.context) {
      try {
        Enforcer.recursivelyValidateParallel(policy.context, operation.context);
      } catch (e) {
        return false;
      }
    }

    return true;
  }

  /**
   * Checks if the operation data is allowed by at least one of the rules in the
   * array.
   *
   * @param array {Rule[]} The array of rules.
   * @param opData {any} The operation data.
   * @returns {boolean} whether the operation data is allowed.
   */
  static validateOneInArray(array, opData) {
    for (const rule of array) {
      try {
        Enforcer.recursivelyValidateParallel(rule, opData);
        // Subject validation passes if at least one subject matches.
        return true;
      } catch (e) {}
    }
    return false;
  }

  /**
   * Recursively validates the properties of the operation data according to the
   * properties of the rule.
   *
   * An error with a reason for the invalidation is thrown if validation fails.
   *
   * @param rule The rule to enforce.
   * @param opData The operation data to check.
   * @returns {void}
   */
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

  /**
   * Validates the given variable and checks whether it is a policy object.
   *
   * @param policy The variable to check.
   * @returns {void}
   * @throws {Error} if the policy is invalid.
   */
  static validatePolicy(policy) {
    if (!policy) {
      throw new Error('Enforcer requires a policy to enforce.');
    }
    if (!(policy instanceof Policy)) {
      throw new Error(`Invalid policy: ${policy}. Expected a policy object.`);
    }
  }
}

module.exports = Enforcer;
