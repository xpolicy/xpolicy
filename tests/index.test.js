'use strict';

const xp = require('../src');
const { effects } = xp;
const { And, Eq, In, Any, StartsWith } = xp.rules;

describe('xpolicy', () => {
  it('correctly enforces a policy', () => {
    const policy = new xp.Policy({
      id: 1,
      action: In([Any()]),
      subject: In([
        Eq('contact_tracer'),
        {
          role: Eq('admin'),
        },
      ]),
      resource: In([Eq('control_panel')]),
      context: {
        ip: StartsWith('12'),
      },
      effect: effects.Allow,
    });

    const enforcer = new xp.Enforcer();
    enforcer.addPolicy(policy);

    const operation = new xp.Operation({
      action: 'modify',
      subject: {
        role: 'admin',
      },
      resource: 'control_panel',
      context: {
        ip: '123',
      },
    });

    expect(enforcer.isAllowed(operation)).toBe(true);
  });

  it('works with the example code', () => {
    const { GreaterOrEq, Less, In, StartsWith } = xp.rules;

    // Define a policy to enforce.
    const policy = new xp.Policy({
      id: 1,
      description: `Allow users and creators to view, like, and comment
        on public videos if their account age is between 0 and 365`,
      effect: xp.effects.Allow,
      subject: {
        username: Any(),
        role: In(['user', 'creator']),
      },
      action: In(['view', 'like', 'comment']),
      resource: StartsWith('videos/public'),
      context: {
        accountAge: And(GreaterOrEq(0), Less(365)),
      },
    });

    // Create an enforcer and add the policy to it.
    const enforcer = new xp.Enforcer();
    enforcer.addPolicy(policy);

    // Define a desired operation.
    const operation = new xp.Operation({
      subject: { username: 'cat', role: 'user' },
      action: 'like',
      resource: 'videos/public/cat-montage',
      context: { accountAge: 101 },
    });

    // Enforcer will determine whether the operation is allowed
    // according to the defined policies.
    expect(enforcer.isAllowed(operation)).toBe(true);
  });
});
