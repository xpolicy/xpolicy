const abac = require('../src');
const { Eq, Any } = abac.rules;

describe('abac', () => {
  it('correctly enforces a policy', () => {
    const policy = new abac.Policy({
      id: 1,
      actions: [Any()],
      subjects: [
        {
          role: Eq('admin'),
        },
        Eq('contact_tracer'),
      ],
      resources: [Eq('control_panel')],
      effect: abac.Allow,
    });

    const enforcer = new abac.Enforcer(policy);

    const operation = new abac.Operation({
      action: 'modify',
      subject: {
        role: 'admin',
      },
      resource: 'control_panel',
    });

    expect(enforcer.isAllowed(operation)).toBe(true);
  });
});
