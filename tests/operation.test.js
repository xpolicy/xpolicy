'use strict';

const Operation = require('../src/operation');

describe('validateProps', () => {
  describe('throws an error', () => {
    test('when an unknown property is found', () => {
      try {
        const operation = new Operation({ foo: 'bar' });
        expect(operation).toBeUndefined();
      } catch (e) {
        expect(e.message).toEqual(
          'Invalid operation property: foo. ' +
            'Valid properties include "subject", "action", "resource", and ' +
            '"context".',
        );
      }
    });
  });
});
