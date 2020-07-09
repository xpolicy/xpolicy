'use strict';

const Effect = require('./effect');
const Rule = require('./rule');

class Policy {
  /**
   * Constructs a new policy.
   *
   * @param props {any} The properties of the policy.
   */
  constructor(props) {
    Policy.validateProps(props);

    this.id = props.id;
    this.description = props.description || '';
    this.effect = props.effect;

    this._rules = {};
    if (props.subject) {
      this._rules.subject = props.subject;
    }
    if (props.action) {
      this._rules.action = props.action;
    }
    if (props.resource) {
      this._rules.resource = props.resource;
    }
    if (props.context) {
      this._rules.context = props.context;
    }
  }

  getRules() {
    return this._rules;
  }

  /**
   * Checks whether the given operation structure matches that of the policy.
   *
   * @param operation {Operation} The operation to check.
   * @returns {boolean}
   */
  matches(operation) {
    return Policy.recursivelyMatch(this._rules, operation.getData());
  }

  /**
   * Checks whether the given rule structure matches that of the operation.
   *
   * @param rule {Rule} The rule data to check.
   * @param opData {Object} The operation data to check.
   * @returns {boolean} whether the structure matches.
   */
  static recursivelyMatch(rule, opData) {
    if (!rule || opData === undefined || opData === null) {
      return false;
    }
    if (rule instanceof Rule) {
      return true;
    }

    for (const k of Object.keys(rule)) {
      const matches = Policy.recursivelyMatch(rule[k], opData[k]);
      if (!matches) return false;
    }

    return true;
  }

  /**
   * Validates the given properties for the policy.
   *
   * @param props {any}
   * @returns {void}
   * @throws {Error} if the properties are invalid.
   */
  static validateProps(props) {
    if (!props) {
      throw new Error('Policy requires a map of properties.');
    }

    if (!props.id) {
      throw new Error(
        'Policy requires a unique identifier. Did you set the "id" property?',
      );
    }

    if (!props.effect) {
      throw new Error(
        'Policy requires an effect. Did you set the "effect" property?',
      );
    }
    if (!(props.effect instanceof Effect)) {
      throw new Error(
        `Invalid effect: ${props.effect}. Valid effects are ALLOW ` +
          `and DENY.`,
      );
    }

    if (props.subject !== undefined) {
      Policy.recursivelyValidateRule(props.subject);
    }

    if (props.resource !== undefined) {
      Policy.recursivelyValidateRule(props.resource);
    }

    if (props.action !== undefined) {
      Policy.recursivelyValidateRule(props.action);
    }

    if (props.context !== undefined) {
      Policy.recursivelyValidateRule(props.context);
    }

    // Check for extraneous keys.
    for (const k of Object.keys(props)) {
      if (
        [
          'action',
          'subject',
          'resource',
          'context',
          'effect',
          'id',
          'description',
        ].indexOf(k) === -1
      ) {
        throw new Error(
          `Invalid policy property: ${k}. Valid properties include ` +
            `"action", "subject", "resource", "context", "effect", "id", ` +
            `and "description".`,
        );
      }
    }
  }

  /**
   * Recursively validates whether the given rule is valid.
   *
   * @param rule {any} The rule to check.
   * @returns {void}
   * @throws {Error} if the rule is invalid.
   */
  static recursivelyValidateRule(rule) {
    if (rule instanceof Rule) return;
    if (rule.constructor !== Object) {
      throw new Error(
        `Invalid rule: ${rule}. Expected a key-value map or a single rule.`,
      );
    }
    for (const v of Object.values(rule)) {
      Policy.recursivelyValidateRule(v);
    }
  }
}

module.exports = Policy;
