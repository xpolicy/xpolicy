class Effect {
  constructor(allowed) {
    this._allowed = allowed;
  }

  allowed() {
    return this._allowed;
  }
}

module.exports = Effect;
