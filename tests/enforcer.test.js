'use strict';

const Policy = require('../src/policy');
const { effects } = require('../src/builtin');
const Enforcer = require('../src/enforcer');
const Operation = require('../src/operation');
const { Eq } = require('../src/builtin/relations');

describe('add policy', () => {
  it('validates the props', () => {
    // Mock the validateProps method.
    const validateProps = Enforcer.validatePolicy;

    Enforcer.validatePolicy = jest.fn();
    const props = {};
    const enforcer = new Enforcer();
    enforcer.addPolicy(props);

    expect(enforcer).toBeDefined();
    expect(Enforcer.validatePolicy).toHaveBeenCalledTimes(1);
    expect(Enforcer.validatePolicy).toHaveBeenCalledWith(props);

    // Restore the original validateProps method.
    Enforcer.validatePolicy = validateProps;
  });
});

describe('validateProps', () => {
  describe('throws an error', () => {
    const testTable = [
      [undefined, 'Enforcer requires a policy to enforce.'],
      [{}, 'Invalid policy: [object Object]. Expected a policy object.'],
    ];

    test.each(testTable)('when the props are %j', (props, msg) => {
      try {
        Enforcer.validatePolicy(props);
        expect(true).toEqual(false);
      } catch (e) {
        expect(e.message).toEqual(msg);
      }
    });
  });
});

describe('isAllowed', () => {
  it('iterates over every policy', () => {
    const checkPolicy = Enforcer.checkPolicy;
    Enforcer.checkPolicy = jest.fn(() => false);

    const enforcer = new Enforcer();
    const policy1 = { id: 1, effect: { isAllowed: () => true } };
    const policy2 = { id: 2, effect: { isAllowed: () => true } };
    const policy3 = { id: 3, effect: { isAllowed: () => true } };
    enforcer.policies = [policy1, policy2, policy3];

    const operation = {};
    expect(enforcer.isAllowed(operation)).toBe(false);

    expect(Enforcer.checkPolicy).toHaveBeenCalledTimes(3);
    expect(Enforcer.checkPolicy).toHaveBeenCalledWith(operation, policy1);
    expect(Enforcer.checkPolicy).toHaveBeenCalledWith(operation, policy2);
    expect(Enforcer.checkPolicy).toHaveBeenCalledWith(operation, policy3);

    Enforcer.checkPolicy = checkPolicy;
  });
});

describe('checkPolicy', () => {
  it('throws an error when the operation is invalid', () => {
    try {
      Enforcer.checkPolicy('foo', {});
    } catch (e) {
      expect(e.message).toEqual(
        'Invalid operation: foo. Expected an operation object.',
      );
    }
  });

  it('validates every property', () => {
    // Mock the validateProps method.
    const validateProps = Enforcer.validatePolicy;
    Enforcer.validatePolicy = jest.fn();

    const validateOneInArray = Enforcer.validateOneInArray;
    const recursivelyValidateParallel = Enforcer.recursivelyValidateParallel;

    Enforcer.validateOneInArray = jest.fn(() => true);
    Enforcer.recursivelyValidateParallel = jest.fn();

    const actions = {};
    const subjects = {};
    const resources = {};
    const context = {};
    const policy = {
      actions,
      subjects,
      resources,
      context,
      effect: {
        isAllowed: jest.fn(() => true),
      },
    };

    const opAction = {};
    const opSubject = {};
    const opResource = {};
    const opContext = {};
    const operation = new Operation({
      action: opAction,
      subject: opSubject,
      resource: opResource,
      context: opContext,
    });
    expect(Enforcer.checkPolicy(operation, policy)).toBe(true);

    expect(Enforcer.validateOneInArray).toHaveBeenCalledTimes(3);
    expect(Enforcer.validateOneInArray).toHaveBeenCalledWith(actions, opAction);
    expect(Enforcer.validateOneInArray).toHaveBeenCalledWith(
      subjects,
      opSubject,
    );
    expect(Enforcer.validateOneInArray).toHaveBeenCalledWith(
      resources,
      opResource,
    );
    expect(Enforcer.recursivelyValidateParallel).toHaveBeenCalledTimes(1);
    expect(Enforcer.recursivelyValidateParallel).toHaveBeenCalledWith(
      context,
      opContext,
    );

    // Restore the original validateProps method.
    Enforcer.validatePolicy = validateProps;
    Enforcer.recursivelyValidateParallel = recursivelyValidateParallel;
    Enforcer.validateOneInArray = validateOneInArray;
  });

  describe('returns false if a property does not match', () => {
    const testTable = [
      [
        new Operation({
          actions: 'stop',
        }),
        new Policy({
          id: 1,
          actions: [Eq('go')],
          effect: effects.Allow,
        }),
      ],
      [
        new Operation({
          subject: 'flag',
        }),
        new Policy({
          id: 1,
          subjects: [Eq('sign')],
          effect: effects.Allow,
        }),
      ],
      [
        new Operation({
          resource: 'flag',
        }),
        new Policy({
          id: 1,
          resources: [Eq('sign')],
          effect: effects.Allow,
        }),
      ],
      [
        new Operation({
          context: { place: 'flag' },
        }),
        new Policy({
          id: 1,
          context: { place: Eq('sign') },
          effect: effects.Allow,
        }),
      ],
    ];

    test.each(testTable)(
      'when the operation and policy are from test %#',
      (operation, policy) => {
        expect(Enforcer.checkPolicy(operation, policy)).toBe(false);
      },
    );
  });
  it('returns true when the policy is empty', () => {
    const policy = new Policy({
      id: 1,
      effect: effects.Allow,
    });
    const operation = new Operation({});

    expect(Enforcer.checkPolicy(operation, policy)).toBe(true);
  });
});

describe('recursivelyValidateParallel', () => {
  describe('validates without an error', () => {
    const testTable = [
      [Eq('foo'), 'foo'],
      [Eq(1), 1],
      [
        {
          foo: Eq('bar'),
        },
        {
          foo: 'bar',
        },
      ],
      [
        {
          foo: {
            bar: Eq(10),
          },
        },
        {
          foo: {
            bar: 10,
          },
        },
      ],
    ];

    test.each(testTable)(
      'when the rule and operation data are %j and %j',
      (rule, opData) => {
        try {
          Enforcer.recursivelyValidateParallel(rule, opData);
          expect(true).toBe(true);
        } catch (e) {
          expect(e).toBeUndefined();
        }
      },
    );
  });

  describe('validates with an error', () => {
    const testTable = [
      [
        undefined,
        'foo',
        'Recursive parallel validation requires a rule to enforce.',
      ],
      [
        Eq('bar'),
        undefined,
        'Recursive parallel validation requires operation data to check.',
      ],
      [Eq('bar'), 'foo', 'Rule validation failed.'],
      [
        Eq('bar'),
        {
          foo: 'bar',
        },
        'Rule validation failed.',
      ],
      [
        {
          foo: Eq('bar'),
        },
        {
          foo: 'bar',
          bar: 'foo',
        },
        'Mismatched number of attributes.',
      ],
      [
        {
          foo: Eq('bar'),
          nop: Eq('foo'),
        },
        {
          foo: 'bar',
          bar: 'foo',
        },
        'Attribute names do not match.',
      ],
    ];

    test.each(testTable)(
      'when the rule and operation data are %j and %j',
      (rule, opData, msg) => {
        try {
          Enforcer.recursivelyValidateParallel(rule, opData);
          expect(true).toBe(false);
        } catch (e) {
          expect(e.message).toEqual(msg);
        }
      },
    );
  });
});
