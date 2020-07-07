class Modifier {
  constructor(validator) {
    this._validator = validator;
  }

  validate(input) {
    return this._validator(input);
  }
}

module.exports = Modifier;
