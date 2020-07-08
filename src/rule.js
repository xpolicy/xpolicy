'use strict';

class Rule {
  constructor(props) {
    Rule.validateProps(props);

    this.name = props.name;
    this.validator = props.validator;
  }

  validate(data) {
    return this.validator(data);
  }

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
