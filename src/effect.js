'use strict';

class Effect {
  constructor(allowed) {
    this._allowed = allowed;
  }

  isAllowed() {
    return this._allowed;
  }
}

module.exports = Effect;
