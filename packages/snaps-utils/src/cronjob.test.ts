import {
  isCronjobSpecification,
  isCronjobSpecificationArray,
  parseCronExpression,
} from './cronjob';

describe('Cronjob Utilities', () => {
  describe('isCronjobSpecification', () => {
    it('returns true for a valid cronjob specification', () => {
      const cronjobSpecification = {
        expression: '* * * * *',
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
      expect(isCronjobSpecificationArray(cronjobSpecificationArray)).toBe(
        false,
      );
    });
  });

  describe('parseCronExpression', () => {
    it('successfully parses cronjob expression that is provided as a string', () => {
      const cronjobExpression = '* * * * *';

      const parsedExpression = parseCronExpression(cronjobExpression);
      expect(parsedExpression.next()).toBeDefined();
      expect(typeof parsedExpression.next().getTime()).toBe('number');
    });
  });
});
