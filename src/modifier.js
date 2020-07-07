'use strict';

class Modifier {
  constructor(validator) {
    Modifier.validateProps(validator);

    this.validator = validator;
  }

  validate(data) {
    return this.validator(data);
  }

  static validateProps(validator) {
    if (!validator) {
      throw new Error('Modifier requires a validator function.');
    }
    if (typeof validator !== 'function') {
      throw new Error(`Invalid validator: ${validator}. Expected a function.`);
    }
  }
}

module.exports = Modifier;
