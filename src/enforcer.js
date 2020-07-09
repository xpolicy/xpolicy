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

    // TODO: Check duplicate ids.
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
    const policies = this.policies.filter(p => p.matches(operation));

    for (const p of policies) {
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

    const policyData = policy.getRules();
    const opData = operation.getData();
    const arrayProps = ['action', 'subject', 'resource', 'context'];

    for (const prop of arrayProps) {
      if (!policyData[prop]) continue;

      const valid = Enforcer.recursivelyValidate(
        policyData[prop],
        opData[prop],
      );
      if (!valid) return false;
    }

    return true;
  }

  /**
   * Recursively validates the properties of the operation data according to the
   * properties of the rule.
   *
   * @param rule The rule to enforce.
   * @param opData The operation data to check.
   * @returns {boolean} whether the operation data matches the rule.
   */
  static recursivelyValidate(rule, opData) {
    if (!rule || opData === undefined || opData === null) {
      return false;
    }
    // Execute the rule if one is reached.
    if (rule instanceof Rule) {
      return rule.validate(opData);
    }
    // Descend into each object's properties.
    if (opData.constructor === Object && rule.constructor === Object) {
      // Make sure the number of keys of each object match.
      if (Object.keys(opData).length !== Object.keys(rule).length) {
        return false;
      }
      // Make sure the objects have the same keys.
      if (
        !Object.keys(opData).every(k => Object.keys(rule).indexOf(k) !== -1)
      ) {
        return false;
      }
      // Descend into the keys.
      for (const k of Object.keys(opData)) {
        const valid = Enforcer.recursivelyValidate(rule[k], opData[k]);
        if (!valid) return false;
      }
      // Validation has passed, return true.
      return true;
    }
    // Unexpected structure, return false.
    return false;
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
