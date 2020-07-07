const policy = new abac.Policy({
  id: 1,
  description: ``,
  subjects: [{role: 'contact_tracer'}],
  actions: [abac.In(['create', 'read', 'update', 'delete'])],
  resources: [
    {use: abac.Eq('organization/get')},
    {use: abac.Eq('case/stage')},
  ],
  context: {},
  effect: abac.ALLOW_ACCESS
});
