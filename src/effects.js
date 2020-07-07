const Effect = require('./effect');

module.exports = {
  ALLOW: new Effect(true),
  DENY: new Effect(false),
};
