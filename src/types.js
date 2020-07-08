const Rule = require('./rule');

const checkAndErr = {
  Rule: r => {
    if (!(r instanceof Rule)) {
      throw new Error(`Invalid rule: ${r}. Expected a rule object.`);
    }
  },
  Integer: v => {
    if (!Number.isInteger(v)) {
      throw new Error(`Invalid integer: ${v}.`);
    }
  },
  Array: a => {
    if (!Array.isArray(a)) {
      throw new Error(`Invalid array: ${a}.`);
    }
  },
};

const checkAndWarn = {
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
