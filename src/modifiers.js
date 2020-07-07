const Modifier = require('./modifier');

module.exports = {
  Eq: wanted => new Modifier(given => wanted === given),
};
