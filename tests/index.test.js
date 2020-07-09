'use strict';

const xp = require('../src');
const { Eq, In, Any, StartsWith } = xp.rules;

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
      effect: xp.Allow,
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
});
