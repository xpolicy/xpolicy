const Rule = require('../../src/rule');
const logic = require('../../src/builtin/logic');

describe('logical rules correctly validate', () => {
  const trueRule = new Rule({ validator: () => true });
  const falseRule = new Rule({ validator: () => false });

  const testTable = [
    [logic.And(trueRule, trueRule), true],
    [logic.And(trueRule, falseRule), false],
    [logic.And(falseRule, trueRule), false],
    [logic.And(falseRule, falseRule), false],
    [logic.Or(trueRule, trueRule), true],
    [logic.Or(trueRule, falseRule), true],
    [logic.Or(falseRule, trueRule), true],
    [logic.Or(falseRule, falseRule), false],
    [logic.Not(trueRule), false],
    [logic.Not(falseRule), true],
    [logic.Any(), true],
    [logic.None(), false],
  ];

  test.each(testTable)('when the logic is %p', (logic, result) => {
    expect(logic.validate()).toBe(result);
  });
});
