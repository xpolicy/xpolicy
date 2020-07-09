'use strict';

const { effects } = require('../src/builtin');
const Policy = require('../src/policy');
const Rule = require('../src/rule');

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

describe('recursivelyMatch', () => {
  describe('matches the rule and operation data', () => {
    const mockRule = new Rule({ validator: () => true });

    const testTable = [
      [mockRule, 1, true],
      [mockRule, null, false],
      [mockRule, {}, true],
      [{ a: mockRule }, {}, false],
      [{ a: mockRule }, { a: null }, false],
      [{ a: mockRule }, { a: { b: 1 } }, true],
      [{ a: mockRule }, { a: 1 }, true],
      [{ a: { b: mockRule } }, { a: {} }, false],
      [{ a: { b: mockRule } }, { a: { b: '' } }, true],
    ];

    test.each(testTable)('when the test case is %#', (rule, opData, result) => {
      expect(Policy.recursivelyMatch(rule, opData)).toBe(result);
    });
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
        {
          id: 1,
          effect: effects.Allow,
          subject: ['flag'],
          resource: ['foo'],
          action: ['bar'],
          context: { a: 'b' },
          neg: 'bop',
        },
        'Invalid policy property: neg. Valid properties include "action", ' +
          '"subject", "resource", "context", "effect", "id", and ' +
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
