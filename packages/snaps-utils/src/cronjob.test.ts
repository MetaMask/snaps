import { create } from '@metamask/superstruct';

import {
  CronjobSpecificationStruct,
  isCronjobSpecification,
  isCronjobSpecificationArray,
} from './cronjob';

describe('CronjobSpecificationStruct', () => {
  it.each([
    ['100 * * * * *', 'Expected an object, but received: "100 * * * * *"'],
    ['PT10S', 'Expected an object, but received: "PT10S"'],
    [
      {
        expression: '100 * * * * *',
        request: {
          method: 'exampleMethodOne',
          params: ['p1'],
        },
      },
      'At path: expression -- Expected a cronjob expression, but received: "100 * * * * *"',
    ],
    [
      {
        duration: '10S',
        request: {
          method: 'exampleMethodOne',
          params: ['p1'],
        },
      },
      'At path: duration -- Not a valid ISO 8601 duration',
    ],
    [
      {
        request: {
          method: 'exampleMethodOne',
          params: ['p1'],
        },
      },
      'At path: expression -- Expected a string, but received: undefined',
    ],
  ])('return a readable error for %p', (value, error) => {
    expect(() => create(value, CronjobSpecificationStruct)).toThrow(error);
  });
});

describe('isCronjobSpecification', () => {
  it('returns true for a valid cronjob specification with an expression', () => {
    const cronjobSpecification = {
      expression: '* * * * *',
      request: {
        method: 'exampleMethodOne',
        params: ['p1'],
      },
    };
    expect(isCronjobSpecification(cronjobSpecification)).toBe(true);
  });

  it('returns true for a valid cronjob specification with a duration', () => {
    const cronjobSpecification = {
      duration: 'PT10S',
      request: {
        method: 'exampleMethodOne',
        params: ['p1'],
      },
    };
    expect(isCronjobSpecification(cronjobSpecification)).toBe(true);
  });

  it('returns false for an invalid cronjob specification', () => {
    const cronjobSpecification = {
      expression: '* * * * * * * * * * *',
      request: {
        method: 'exampleMethodOne',
        params: ['p1'],
      },
    };
    expect(isCronjobSpecification(cronjobSpecification)).toBe(false);
  });
});

describe('isCronjobSpecificationArray', () => {
  it('returns true for a valid cronjob specification array', () => {
    const cronjobSpecificationArray = [
      {
        expression: '* * * * *',
        request: {
          method: 'exampleMethodOne',
          params: ['p1'],
        },
      },
      {
        duration: 'PT10S',
        request: {
          method: 'exampleMethodOne',
          params: ['p1'],
        },
      },
    ];
    expect(isCronjobSpecificationArray(cronjobSpecificationArray)).toBe(true);
  });

  it('returns false for an invalid cronjob specification array', () => {
    const cronjobSpecificationArray = {
      expression: '* * * * *',
      request: {
        method: 'exampleMethodOne',
        params: ['p1'],
      },
    };
    expect(isCronjobSpecificationArray(cronjobSpecificationArray)).toBe(false);
  });
});
