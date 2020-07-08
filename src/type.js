'use strict';

const Rule = require('./rule');

const checkAndErr = {
  /**
   * Checks whether the given variable is a Rule.
   *
   * @param v The variable to check.
   * @returns {void}
   * @throws {Error} if the variable is not a Rule.
   */
  Rule: v => {
    if (!(v instanceof Rule)) {
      throw new Error(`Invalid rule: ${v}. Expected a rule object.`);
    }
  },
  /**
   * Checks whether the given variable is a number.
   *
   * @param v The variable to check.
   * @returns {void}
   * @throws {Error} if the variable is not a number.
   */
  Number: v => {
    if (typeof v !== 'number') {
      throw new Error(`Invalid number: ${v}.`);
    }
  },
  /**
   * Checks whether the given variable is an array.
   *
   * @param v The variable to check.
   * @returns {void}
   * @throws {Error} if the variable is not an array.
   */
  Array: v => {
    if (!Array.isArray(v)) {
      throw new Error(`Invalid array: ${v}.`);
    }
  },
};

const checkAndWarn = {
  /**
   * Checks whether the given variable is a primitive. It logs a warning to the
   * console if the variable is not.
   *
   * @param v The variable to check.
   * @returns {void}
   */
  Primitive: v => {
    if (typeof v === 'object' && v !== null) {
      console.warn(
        `Warning: ${v} is not a primitive. ` +
          `The rule may lead to undesired results.`,
      );
    }
  },
};

module.exports = {
  checkAndErr: checkAndErr,
  checkAndWarn: checkAndWarn,
};
