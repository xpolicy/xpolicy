const Operation = require('./operation');

class Enforcer {
  constructor(policy) {
    if (!policy) {
      throw new Error('Enforcer requires a policy to enforce.');
    }
  }

  isAllowed(operation) {
    if (!(operation instanceof Operation)) {
      throw new Error(
        `Invalid operation: ${operation}. Expected an Operation object.`,
      );
    }


  }
}

module.exports = Enforcer;
