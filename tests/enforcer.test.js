'use strict';

const Policy = require('../src/policy');
const { effects } = require('../src/builtin');
const Enforcer = require('../src/enforcer');
const Operation = require('../src/operation');
const { Eq } = require('../src/builtin/relations');

describe('constructor', () => {
  it('validates the props', () => {
    // Mock the validateProps method.
    const validateProps = Enforcer.validateProps;

    Enforcer.validateProps = jest.fn();
    const props = {};
    const enforcer = new Enforcer(props);

    expect(enforcer).toBeDefined();
    expect(Enforcer.validateProps).toHaveBeenCalledTimes(1);
    expect(Enforcer.validateProps).toHaveBeenCalledWith(props);

    // Restore the original validateProps method.
    Enforcer.validateProps = validateProps;
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
        Enforcer.validateProps(props);
        expect(true).toEqual(false);
      } catch (e) {
        expect(e.message).toEqual(msg);
      }
    });
  });
});

describe('isAllowed', () => {
  it('throws an error when the operation is invalid', () => {
    // Mock the validateProps method.
    const validateProps = Enforcer.validateProps;
    Enforcer.validateProps = jest.fn();

    const enforcer = new Enforcer({});

    try {
      enforcer.isAllowed('foo');
    } catch (e) {
      expect(e.message).toEqual(
        'Invalid operation: foo. Expected an operation object.',
      );
    }

    // Restore the original validateProps method.
    Enforcer.validateProps = validateProps;
  });

  it('validates every property', () => {
    // Mock the validateProps method.
    const validateProps = Enforcer.validateProps;
    Enforcer.validateProps = jest.fn();

    const validateOneInArray = Enforcer.validateOneInArray;
    const recursivelyValidateParallel = Enforcer.recursivelyValidateParallel;

    Enforcer.validateOneInArray = jest.fn(() => true);
    Enforcer.recursivelyValidateParallel = jest.fn(() => true);

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

    const enforcer = new Enforcer(policy);
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
    expect(enforcer.isAllowed(operation)).toBe(true);

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
    Enforcer.validateProps = validateProps;
    Enforcer.recursivelyValidateParallel = recursivelyValidateParallel;
    Enforcer.validateOneInArray = validateOneInArray;
  });

  describe('returns false if a property does not match', () => {
    const testTable = [
      [
        new Policy({
          id: 1,
          actions: [Eq('go')],
          effect: effects.Allow,
        }),
        new Operation({
          actions: 'stop',
        }),
      ],
      [
        new Policy({
          id: 1,
          subjects: [Eq('sign')],
          effect: effects.Allow,
        }),
        new Operation({
          subject: 'flag',
        }),
      ],
      [
        new Policy({
          id: 1,
          resources: [Eq('sign')],
          effect: effects.Allow,
        }),
        new Operation({
          resource: 'flag',
        }),
      ],
      [
        new Policy({
          id: 1,
          context: { place: Eq('sign') },
          effect: effects.Allow,
        }),
        new Operation({
          context: { place: 'flag' },
        }),
      ],
    ];

    test.each(testTable)(
      'when the policy and operation are %p and %p',
      (policy, operation) => {
        const enforcer = new Enforcer(policy);
        expect(enforcer.isAllowed(operation)).toBe(false);
      },
    );
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
