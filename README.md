# XPolicy

[![CI](https://github.com/aiyan/xpolicy/workflows/ci/badge.svg)](https://github.com/aiyan/xpolicy/actions?query=workflow%3Aci)
[![Coverage Status](https://coveralls.io/repos/github/aiyan/xpolicy/badge.svg?branch=master&t=P6KFeX)](https://coveralls.io/github/aiyan/xpolicy?branch=master)

# Quick start

```shell script
npm install xpolicy
yarn add xpolicy
```

```javascript
const xp = require('xpolicy');
const { GreaterOrEq, Less, In, Eq, StartsWith } = xp.rules;

// Define a policy to enforce.
const policy = new xp.Policy({
  id: 1,
  description: `Allow users and creators to view, like, and comment
    on public videos if their account age is between 0 and 365`,
  effect: xp.Allow,
  subjects: [{
    username: Any(),
    role: In(['user', 'creator']),
  }],
  actions: [Eq('view'), Eq('like'), Eq('comment')],
  resources: [StartsWith('videos/public')],
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
console.log(enforcer.isAllowed(operation));
// true
```
