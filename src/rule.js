'use strict';

class Rule {
  constructor(props) {
    Rule.validateProps(props);

    this.name = props.name;
    this.validator = props.validator;
  }

  /**
   * Runs the validator on the given data.
   *
   * @param data The data to validate.
   * @returns {boolean} whether the data is valid.
   */
  validate(data) {
    return this.validator(data);
  }

  /**
   * Validates the given rule properties.
   *
   * @param props {any} The properties to validate.
   * @returns {void}
   */
  static validateProps(props) {
    if (!props) {
      throw new Error('Rule requires a map of properties.');
    }
    if (!props.validator) {
      throw new Error('Rule requires a validator function.');
    }
    if (typeof props.validator !== 'function') {
      throw new Error(
        `Invalid validator: ${props.validator}. Expected a function.`,
      );
    }
  }
}

module.exports = Rule;
