'use strict';

const effects = require('./effects');
const logic = require('./logic');
const relations = require('./relations');

module.exports = {
  effects: {
    Allow: effects.Allow,
    Deny: effects.Deny,
  },
  rules: {
    Any: logic.Any,
    None: logic.None,
    And: logic.And,
    Or: logic.Or,
    Not: logic.Not,
    Eq: relations.Eq,
    NotEq: relations.NotEq,
    Greater: relations.Greater,
    Less: relations.Less,
    GreaterOrEq: relations.GreaterOrEq,
    LessOrEq: relations.LessOrEq,
    In: relations.In,
    NotIn: relations.NotIn,
    AllIn: relations.AllIn,
    StartsWith: relations.StartsWith,
    EndsWith: relations.EndsWith,
    Contains: relations.Contains,
  },
};
