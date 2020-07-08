'use strict';

const { effects } = require('../src/builtin');
const Policy = require('../src/policy');

describe('constructor', () => {
  it('validates the props', () => {
    const validateProps = Policy.validateProps;
    Policy.validateProps = jest.fn();

    const props = {};
    const policy = new Policy(props);

    expect(policy).toBeDefined();
    expect(Policy.validateProps).toHaveBeenCalledTimes(1);
    expect(Policy.validateProps).toHaveBeenCalledWith(props);

    Policy.validateProps = validateProps;
  });
});

describe('validateProps', () => {
  describe('throws an error', () => {
    const recursivelyValidateRule = Policy.recursivelyValidateRule;
    Policy.recursivelyValidateRule = jest.fn();

    const testTable = [
      [undefined, 'Policy requires a map of properties.'],
      [
        {},
        'Policy requires a unique identifier. Did you set the "id" property?',
      ],
      [
        { id: 1 },
        'Policy requires an effect. Did you set the "effect" property?',
      ],
      [
        { id: 1, effect: true },
        'Invalid effect: true. Valid effects are ALLOW and DENY.',
      ],
      [
        { id: 1, effect: effects.Allow, subjects: 'flag' },
        'Invalid subjects: flag. Expected an array of rules.',
      ],
      [
        { id: 1, effect: effects.Allow, subjects: ['flag'], resources: 'foo' },
        'Invalid resources: foo. Expected an array of rules.',
      ],
      [
        {
          id: 1,
          effect: effects.Allow,
          subjects: ['flag'],
          resources: ['foo'],
          actions: 'bar',
        },
        'Invalid actions: bar. Expected an array of rules.',
      ],
      [
        {
          id: 1,
          effect: effects.Allow,
          subjects: ['flag'],
          resources: ['foo'],
          actions: ['bar'],
          context: 'nop',
        },
        'Invalid context: nop. Expected a map of keys and rules.',
      ],
      [
        {
          id: 1,
          effect: effects.Allow,
          subjects: ['flag'],
          resources: ['foo'],
          actions: ['bar'],
          context: { a: 'b' },
          neg: 'bop',
        },
        'Invalid policy attribute: neg. Valid attributes include "actions", ' +
          '"subjects", "resources", "context", "effect", "id", and ' +
          '"description".',
      ],
    ];

    test.each(testTable)('when the props are %j', (props, msg) => {
      try {
        Policy.validateProps(props);
        expect(true).toBe(false);
      } catch (e) {
        expect(e.message).toEqual(msg);
      }
    });

    afterAll(() => {
      Policy.recursivelyValidateRule = recursivelyValidateRule;
    });
  });
});

describe('recursivelyValidateRule', () => {
  it('throws an error when the rule is neither a rule object nor a map', () => {
    try {
      Policy.recursivelyValidateRule(1);
      expect(true).toBe(false);
    } catch (e) {
      expect(e.message).toEqual(
        'Invalid rule: 1. Expected a key-value map or a single ' + 'rule.',
      );
    }
  });
});
