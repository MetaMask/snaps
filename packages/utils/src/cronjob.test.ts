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

    it('returns true for a valid cronjob specification when object is provided', () => {
      const cronjobSpecification = {
        expression: {
          minute: '*/15',
          hour: '1',
          dayOfMonth: '3',
          month: '6',
          dayOfWeek: '*',
        },
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

    it('returns false for an invalid cronjob specification when object is provided', () => {
      const cronjobSpecification = {
        expression: {
          minute: 'aaaa',
          hour: 'bbbb',
          dayOfMonth: 'cccc',
          month: 'dddd',
          dayOfWeek: 'eeee',
        },
        request: {
          method: 'exampleMethodOne',
          params: ['p1'],
        },
      };
      expect(isCronjobSpecification(cronjobSpecification)).toBe(false);
    });

    it('returns true for cronjob specification when object is provided with missing values', () => {
      // This case should use '*' by default
      const cronjobSpecification = {
        expression: {
          minute: undefined,
          hour: undefined,
          dayOfMonth: undefined,
          month: undefined,
          dayOfWeek: undefined,
        },
        request: {
          method: 'exampleMethodOne',
          params: ['p1'],
        },
      };
      expect(isCronjobSpecification(cronjobSpecification)).toBe(true);
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

    it('returns true for a valid cronjob specification array when object specification is provided', () => {
      const cronjobSpecificationArray = [
        {
          expression: {
            minute: '*/15',
            hour: '1',
            dayOfMonth: '3',
            month: '6',
            dayOfWeek: '*',
          },
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

    it('returns false for an invalid cronjob specification array when object specification is provided', () => {
      const cronjobSpecificationArray = {
        expression: {
          minute: 'aaaa',
          hour: 'bbbb',
          dayOfMonth: 'cccc',
          month: 'dddd',
          dayOfWeek: 'eeee',
        },
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
    it('successfully parses cronjob expression that is provided as an object', () => {
      const cronjobExpression = {
        minute: '*',
        hour: '*',
        dayOfMonth: '*',
        month: '*',
        dayOfWeek: '*',
      };

      const parsedExpression = parseCronExpression(cronjobExpression);
      expect(parsedExpression.next()).toBeDefined();
      expect(typeof parsedExpression.next().getTime()).toBe('number');
    });

    it('successfully parses cronjob expression that is provided as a string', () => {
      const cronjobExpression = '* * * * *';

      const parsedExpression = parseCronExpression(cronjobExpression);
      expect(parsedExpression.next()).toBeDefined();
      expect(typeof parsedExpression.next().getTime()).toBe('number');
    });
  });
});
