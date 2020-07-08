'use strict';

const abac = require('../src');
const { Eq, Any, StartsWith } = abac.rules;

describe('abac', () => {
  it('correctly enforces a policy', () => {
    const policy = new abac.Policy({
      id: 1,
      actions: [Any()],
      subjects: [
        Eq('contact_tracer'),
        {
          role: Eq('admin'),
        },
      ],
      resources: [Eq('control_panel')],
      context: {
        ip: StartsWith('12'),
      },
      effect: abac.Allow,
    });

    const enforcer = new abac.Enforcer();
    enforcer.addPolicy(policy);

    const operation = new abac.Operation({
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
