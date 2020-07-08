'use strict';

class Operation {
  /**
   * Constructs a new operation.
   *
   * @param props {any}
   */
  constructor(props) {
    this.subject = props.subject;
    this.action = props.action;
    this.resource = props.resource;
    this.context = props.context;
  }
}

module.exports = Operation;
