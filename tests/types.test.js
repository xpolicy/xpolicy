const types = require('../src/types');

describe('checks throw an error', () => {
  const testTable = [
    [types.checkAndErr.Integer, 'foo', 'Invalid integer: foo.'],
    [
      types.checkAndErr.Rule,
      'foo',
      'Invalid rule: foo. Expected a rule object.',
    ],
    [types.checkAndErr.Array, 'foo', 'Invalid array: foo.'],
  ];

  test.each(testTable)('when the check is %p', (check, input, msg) => {
    try {
      check(input);
      expect(true).toBe(false);
    } catch (e) {
      expect(e.message).toEqual(msg);
    }
  });
});

describe('checks log a warning', () => {
  const testTable = [
    [
      types.checkAndWarn.Primitive,
      {},
      'Warning: [object Object] is not a primitive. The rule may lead to ' +
        'undesired results.',
    ],
  ];

  test.each(testTable)('when the check is %p', (check, input, msg) => {
    const consoleWarn = console.warn;
    console.warn = jest.fn();

    check(input);
    expect(console.warn).toHaveBeenCalledWith(msg);

    console.warn = consoleWarn;
  });
});
