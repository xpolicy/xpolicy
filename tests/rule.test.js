const Rule = require('../src/rule');

describe('rule constructor', () => {
  it('validates the props', () => {
    // Mock the validateProps method.
    const validateProps = Rule.validateProps;

    Rule.validateProps = jest.fn();
    const props = {};
    const rule = new Rule(props);

    expect(rule).toBeDefined();
    expect(Rule.validateProps).toHaveBeenCalledTimes(1);
    expect(Rule.validateProps).toHaveBeenCalledWith(props);

    // Restore original validateProps method.
    Rule.validateProps = validateProps;
  });
});

describe('validate', () => {
  it('returns the result provided by the validator', () => {
    const validator = jest.fn(() => true);
    const rule = new Rule({ validator });
    const data = {};

    expect(rule.validate(data)).toBe(true);
    expect(validator).toHaveBeenCalledTimes(1);
    expect(validator).toHaveBeenCalledWith(data);
  });
});

describe('validateProps', () => {
  describe('throws an error', () => {
    const testTable = [
      [undefined, 'Rule requires a map of properties.'],
      [{}, 'Rule requires a validator function.'],
      [{ validator: 1 }, 'Invalid validator: 1. Expected a function.'],
    ];

    test.each(testTable)('when the props are %j', (props, msg) => {
      try {
        Rule.validateProps(props);
        expect(true).toBe(false);
      } catch (e) {
        expect(e.message).toEqual(msg);
      }
    });
  });

  it('succeeds when the props are valid', () => {
    try {
      Rule.validateProps({
        validator: () => null,
      });
      expect(true).toBe(true);
    } catch (e) {
      expect(e).toBeUndefined();
    }
  });
});
