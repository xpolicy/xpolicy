# XPolicy

[![CI](https://github.com/aiyan/xpolicy/workflows/ci/badge.svg)](https://github.com/aiyan/xpolicy/actions?query=workflow%3Aci)
[![Coverage Status](https://coveralls.io/repos/github/aiyan/xpolicy/badge.svg?branch=master&t=P6KFeX)](https://coveralls.io/github/aiyan/xpolicy?branch=master)

Fine-grained access control policy and enforcement for modern applications.

XPolicy implements the flexible attribute-based access control model, which
_encompasses_ most access control paradigms. The wide range of rules allows you
to define and enforce extremely specific policies.

## Table of Contents

- [Quick start](#quick-start)
- [Policy](#policy)
- [Enforcer](#enforcer)
- [Operation](#operation)
- [Rule](#rule)
  - [Constant rules](#constant-rules)
  - [Relational rules](#relational-rules)
  - [Array rules](#array-rules)
  - [String rules](#string-rules)

# Quick start

```shell script
# Install with NPM
npm install xpolicy

# Install with Yarn
yarn add xpolicy
```

```javascript
const xp = require('xpolicy');
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
console.log(enforcer.isAllowed(operation));
// true
```

# Policy

A **policy** is a set of rules that you want to enforce. You can create and add
multiple policies to be enforced.

It contains the following attributes:

| Attribute     | Description                                                                                           |
| ------------- | ----------------------------------------------------------------------------------------------------- |
| `id`          | _Required:_ A unique identifier of the policy.                                                        |
| `description` | _Optional:_ A helpful description of the policy.                                                      |
| `subject`     | _Optional:_ The allowed entity. Can either be a rule or object.                                       |
| `action`      | _Optional:_ The allowed action. Can either be a rule or object.                                       |
| `resource`    | _Optional:_ The allowed resource. Can either be a rule or object.                                     |
| `context`     | _Optional:_ The allowed context. Can either be a rule or object.                                      |
| `effect`      | _Required:_ The result if the conditions are met.<br>Can either be `effects.Allow` or `effects.Deny`. |

Here is an example policy:

```javascript
const policy = new xp.Policy({
  id: 1,
  description: `Allow an admin to create, read, update, and delete
    any resource except for permissions if their IP is 0.0.0.0.`,
  subject: Eq('admin'),
  action: In('create', 'read', 'update', 'delete'),
  resource: And(Any(), NotEq('permissions')),
  context: { ip: Eq('0.0.0.0') },
  effect: xp.effects.Allow,
});
```

See the [rule](#rule) section for more information about composing complex
rules.

# Enforcer

An **enforcer** enforces the given policies by deciding whether a desired
activity adheres to the policies. Enforcer exposes two methods:

`enforcer.addPolicy(yourPolicy)`

- Adds a `Policy` object to the enforcer. When later authorizing an operation,

`enforcer.isAllowed(yourOperation)`

- Returns a boolean of whether the `Operation` object is allowed based on the
  enforced policies.

Here is an example usage of enforcer:

```javascript
const enforcer = new xp.Enforcer();
enforcer.addPolicy(yourPolicy);
enforcer.addPolicy(anotherPolicy);

enforcer.isAllowed(attemptedOperation);
```

# Operation

An **operation** is an attempted activity that needs to be authorized by the
rules defined by one or more policies.

To do this, you construct a new `Operation` object and check it by calling
`enforcer.isAllowed(operation)`. The enforcer will return a boolean value
dictating whether the given operation is allowed according to the policies.

Here is an example operation:

```javascript
const operation = new xp.Operation({
  subject: 'user0',
  action: 'view',
  resource: 'video',
  context: { location: 'USA' },
});
```

Note that all the properties are _optional_. However, if the policy contains a
property, the corresponding property _must_ be present on the operation, or else
it will be rejected.

For example, if the policy contains `subject`, then the operation must also
contain `subject`, or else it is automatically rejected.

# Rule

A rule allows you to impose conditions on the attributes of a desired operation.
You can use rules on the `subject`, `action`, `resource`, and `context` of an
operation.

Rules can be applied directly or within an object:

```javascript
// The subject itself has to equal "admin".
subject: Eq('admin');
```

```javascript
// The subject has to be an object with a "role" attribute
// that equals "admin".
subject: {
  role: Eq('admin');
}
```

Both are valid syntaxes and are be enforced accordingly. The choice depends on
your use case and desired fidelity of control.

## Constant rules

Constant rules always result in the same outcome.

| Rule     | Description           | Valid Example                 |
| -------- | --------------------- | ----------------------------- |
| `Any()`  | Always allow any data | `"cats"` ⟶ `Any()`            |
| `None()` | Always deny any data  | Nothing will satisfy `None()` |

\* Note that `None()` does not have much practical use.

## Composition rules

Composition rules allow you to combine and modify other rules to form more
complex rules.

| Rule        | Description                     |
| ----------- | ------------------------------- |
| `And(a, b)` | Both `a` and `b` must be true.  |
| `Or(a, b)`  | Either `a` or `b` must be true. |
| `Not(a)`    | `a` must not be true.           |

## Relational rules

Relational rules allow you to compare pieces of data.

| Rule             | Description                                          | Valid Example              |
| ---------------- | ---------------------------------------------------- | -------------------------- |
| `Eq(d)`          | Must strictly equal `d`                              | `202` ⟶ `Eq(202)`          |
| `NotEq(d)`       | Must strictly not equal `d`                          | `200` ⟶ `NotEq(300)`       |
| `Greater(n)`     | Must be a number and be greater than `n`             | `201` ⟶ `Greater(200)`     |
| `Less(n)`        | Must be a number and be less than `n`                | `200` ⟶ `Less(201)`        |
| `GreaterOrEq(n)` | Must be a number and be greater than or equal to `n` | `200` ⟶ `GreaterOrEq(200)` |
| `LessOrEq(n)`    | Must be a number and be less than or equal to `n`    | `200` ⟶ `LessOrEq(200)`    |

## Array rules

Array rules allow you to compare arrays with elements and arrays with arrays.

| Rule       | Description                                      | Valid Example                          |
| ---------- | ------------------------------------------------ | -------------------------------------- |
| `In(a)`    | Must be an element of array `a`                  | `"zz"` ⟶ `In(["yy", "zz"])`            |
| `NotIn(a)` | Must not be an element of array `a`              | `"ww"` ⟶ `NotIn(["yy", "zz"])`         |
| `AllIn(a)` | All input elements must be elements of array `a` | `["zz", "yy"]` ⟶ `AllIn(["yy", "zz"])` |

## String rules

String rules allow you to match a subset of a string with another string.

| Rule            | Description                   | Valid Example                 |
| --------------- | ----------------------------- | ----------------------------- |
| `StartsWith(s)` | Must start with the value `s` | `"yolo"` ⟶ `StartsWith("yo")` |
| `EndsWith(s)`   | Must end with the value `s`   | `"yolo"` ⟶ `EndsWith("lo")`   |
| `Contains(s)`   | Must contain the value `s`    | `"yolo"` ⟶ `Contains("ol")`   |
