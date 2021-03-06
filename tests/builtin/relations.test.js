'use strict';

const relations = require('../../src/builtin/relations');

describe('relational rules correctly validate the input', () => {
  const testTable = [
    [relations.Eq(0), 0, true],
    [relations.Eq(0), 1, false],
    [relations.Eq(0), -1, false],
    [relations.Eq('foo'), 'foo', true],
    [relations.Eq('foo'), 'bar', false],
    [relations.Eq('foo'), ['foo'], false],
    [relations.NotEq(0), 0, false],
    [relations.NotEq(0), 1, true],
    [relations.NotEq(0), -1, true],
    [relations.NotEq('foo'), 'foo', false],
    [relations.NotEq('foo'), 'bar', true],
    [relations.NotEq('foo'), ['foo'], true],
    [relations.Greater(0), 1, true],
    [relations.Greater(0), 0, false],
    [relations.Greater(0), -1, false],
    [relations.Greater(0), 'foo', false],
    [relations.Less(0), 1, false],
    [relations.Less(0), 0, false],
    [relations.Less(0), -1, true],
    [relations.Less(0), 'foo', false],
    [relations.GreaterOrEq(0), 1, true],
    [relations.GreaterOrEq(0), 0, true],
    [relations.GreaterOrEq(0), -1, false],
    [relations.GreaterOrEq(0), 'foo', false],
    [relations.LessOrEq(0), 1, false],
    [relations.LessOrEq(0), 0, true],
    [relations.LessOrEq(0), -1, true],
    [relations.LessOrEq(0), 'foo', false],
    [relations.In([1, 'foo', 'bar']), 'foo', true],
    [relations.In([1, 'foo', 'bar']), 'bar', true],
    [relations.In([1, 'foo', 'bar']), 2, false],
    [
      relations.In([10, { foo: relations.Eq('bar') }, 'bar']),
      { foo: 'bar' },
      true,
    ],
    [
      relations.In([10, { foo: relations.Eq('neg') }, 'bar']),
      { foo: 'bar' },
      false,
    ],
    [relations.NotIn([1, 'foo', 'bar']), 'foo', false],
    [relations.NotIn([1, 'foo', 'bar']), 'bar', false],
    [relations.NotIn([1, 'foo', 'bar']), 2, true],
    [
      relations.NotIn([10, { foo: relations.Eq('bar') }, 'bar']),
      { foo: 'bar' },
      false,
    ],
    [
      relations.NotIn([10, { foo: relations.Eq('neg') }, 'bar']),
      { foo: 'bar' },
      true,
    ],
    [relations.AllIn([1, 'foo', 'bar']), [1, 'foo', 'bar'], true],
    [relations.AllIn([1, 'foo', 'bar']), ['foo', 'bar'], true],
    [relations.AllIn(['foo', 'bar']), [1, 'foo', 'bar'], false],
    [relations.StartsWith('foo'), 'foobar', true],
    [relations.StartsWith('foo'), 'barfoo', false],
    [relations.StartsWith(1), '1foo', true],
    [relations.EndsWith('foo'), 'foobar', false],
    [relations.EndsWith('foo'), 'barfoo', true],
    [relations.EndsWith(1), 'foo1', true],
    [relations.Contains('foo'), 'foobar', true],
    [relations.Contains('foo'), 'barfoo', true],
    [relations.Contains(1), 'foo1', true],
    [relations.Contains(1), 'foo', false],
  ];

  test.each(testTable)(
    'when the relation and input are %p and %p',
    (rule, input, result) => {
      expect(rule.validate(input)).toBe(result);
    },
  );
});
