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
    const policy1 = new Policy({
      id: 1,
      effect: effects.Allow,
      context: Eq('cat'),
    });
    const policy2 = new Policy({
      id: 2,
      effect: effects.Allow,
      context: Eq('cat'),
    });
    const policy3 = new Policy({
      id: 3,
      effect: effects.Allow,
      context: Eq('cat'),
    });
    enforcer.policies = [policy1, policy2, policy3];

    const operation = new Operation({ context: 'cat' });
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

    const recursivelyValidate = Enforcer.recursivelyValidate;

    Enforcer.recursivelyValidate = jest.fn(() => true);

    const action = Eq(1);
    const subject = Eq(2);
    const resource = Eq(3);
    const context = Eq(4);
    const policy = new Policy({
      id: 1,
      action,
      subject,
      resource,
      context,
      effect: effects.Allow,
    });

    const opAction = 1;
    const opSubject = 2;
    const opResource = 3;
    const opContext = 4;
    const operation = new Operation({
      action: opAction,
      subject: opSubject,
      resource: opResource,
      context: opContext,
    });
    expect(Enforcer.checkPolicy(operation, policy)).toBe(true);

    expect(Enforcer.recursivelyValidate).toHaveBeenCalledTimes(4);
    expect(Enforcer.recursivelyValidate).toHaveBeenCalledWith(action, opAction);
    expect(Enforcer.recursivelyValidate).toHaveBeenCalledWith(
      subject,
      opSubject,
    );
    expect(Enforcer.recursivelyValidate).toHaveBeenCalledWith(
      resource,
      opResource,
    );
    expect(Enforcer.recursivelyValidate).toHaveBeenCalledWith(
      context,
      opContext,
    );

    // Restore the original validateProps method.
    Enforcer.validatePolicy = validateProps;
    Enforcer.recursivelyValidate = recursivelyValidate;
  });

  describe('returns false if a property does not match', () => {
    const testTable = [
      [
        new Operation({
          action: 'stop',
        }),
        new Policy({
          id: 1,
          action: Eq('go'),
          effect: effects.Allow,
        }),
      ],
      [
        new Operation({
          subject: 'flag',
        }),
        new Policy({
          id: 1,
          subject: Eq('sign'),
          effect: effects.Allow,
        }),
      ],
      [
        new Operation({
          resource: 'flag',
        }),
        new Policy({
          id: 1,
          resource: Eq('sign'),
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
  describe('returns true', () => {
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
        const valid = Enforcer.recursivelyValidate(rule, opData);
        expect(valid).toBe(true);
      },
    );
  });

  describe('returns false', () => {
    const testTable = [
      [undefined, 'foo'],
      [Eq('bar'), undefined],
      [Eq('bar'), 'foo', 'Rule validation failed.'],
      [
        Eq('bar'),
        {
          foo: 'bar',
        },
      ],
      [
        {
          foo: Eq('bar'),
        },
        {
          foo: 'bar',
          bar: 'foo',
        },
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
      ],
      [
        {
          foo: { bar: Eq(1) },
        },
        {
          foo: 1,
        },
      ],
    ];

    test.each(testTable)(
      'when the rule and operation data are %j and %j',
      (rule, opData) => {
        const valid = Enforcer.recursivelyValidate(rule, opData);
        expect(valid).toBe(false);
      },
    );
  });
});
