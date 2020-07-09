'use strict';

class Operation {
  /**
   * Constructs a new operation.
   *
   * @param props {any}
   */
  constructor(props) {
    Operation.validateProps(props);
    this._data = props;
  }

  getData() {
    return this._data;
  }

  static validateProps(props) {
    for (const k of Object.keys(props)) {
      if (['subject', 'action', 'resource', 'context'].indexOf(k) === -1) {
        throw new Error(
          `Invalid operation property: ${k}. Valid properties include ` +
            `"subject", "action", "resource", and "context".`,
        );
      }
    }
  }
}

module.exports = Operation;
