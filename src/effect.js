'use strict';

class Effect {
  /**
   * Constructs a new effect.
   *
   * @param allowed {boolean}
   */
  constructor(allowed) {
    this._allowed = allowed;
  }

  isAllowed() {
    return this._allowed;
  }
}

module.exports = Effect;
