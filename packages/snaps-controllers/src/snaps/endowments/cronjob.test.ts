import type { Caveat } from '@metamask/permission-controller';
import { PermissionType, SubjectType } from '@metamask/permission-controller';
import { SnapCaveatType } from '@metamask/snaps-utils';

import { SnapEndowments } from '.';
import {
  getCronjobCaveatMapper,
  cronjobEndowmentBuilder,
  validateCronjobCaveat,
  cronjobCaveatSpecifications,
} from './cronjob';

describe('endowment:cronjob', () => {
  describe('specificationBuilder', () => {
    it('builds the expected permission specification', () => {
      const specification = cronjobEndowmentBuilder.specificationBuilder({});
      expect(specification).toStrictEqual({
        permissionType: PermissionType.Endowment,
        targetName: SnapEndowments.Cronjob,
        endowmentGetter: expect.any(Function),
        allowedCaveats: [SnapCaveatType.SnapCronjob],
        subjectTypes: [SubjectType.Snap],
      });

      expect(specification.endowmentGetter()).toBeUndefined();
    });
  });

  describe('cronjobCaveatMapper', () => {
    it('returns a caveat value for the objects of cronjob specification', () => {
      expect(
        getCronjobCaveatMapper({
          jobs: [
            {
              expression: '* * * * *',
              request: {
                method: 'exampleMethodOne',
                params: ['p1'],
              },
            },
            {
              expression: {
                minute: '*',
                hour: '*',
                dayOfMonth: '*',
                month: '*',
                dayOfWeek: '*',
              },
              request: {
                method: 'exampleMethodTwo',
                params: ['p1', 'p2', 'p3'],
              },
            },
          ],
        }),
      ).toStrictEqual({
        caveats: [
          {
            type: SnapCaveatType.SnapCronjob,
            value: {
              jobs: [
                {
                  expression: '* * * * *',
                  request: {
                    method: 'exampleMethodOne',
                    params: ['p1'],
                  },
                },
                {
                  expression: {
                    minute: '*',
                    hour: '*',
                    dayOfMonth: '*',
                    month: '*',
                    dayOfWeek: '*',
                  },
                  request: {
                    method: 'exampleMethodTwo',
                    params: ['p1', 'p2', 'p3'],
                  },
                },
              ],
            },
          },
        ],
      });
    });
  });
});

describe('validateCronjobCaveat', () => {
  it('should not throw an error when provided specification is valid', () => {
    const caveat: Caveat<string, any> = {
      type: SnapCaveatType.SnapCronjob,
      value: {
        jobs: [
          {
            expression: {
              minute: '*',
              hour: '*',
              dayOfMonth: '*',
              month: '*',
              dayOfWeek: '*',
            },
            request: {
              method: 'exampleMethodOne',
              params: ['p1'],
            },
          },
          {
            expression: '* * * * *',
            request: {
              method: 'snapMethod',
              params: [],
            },
          },
        ],
      },
    };

    expect(() => validateCronjobCaveat(caveat)).not.toThrow();
  });

  it('should throw if caveat has no proper value', () => {
    const caveat: Caveat<string, any> = {
      type: SnapCaveatType.SnapCronjob,
      value: {},
    };

    expect(() => validateCronjobCaveat(caveat)).toThrow(
      `Expected a plain object.`,
    );
  });

  it('should throw an error when cron specification is missing', () => {
    const caveat: Caveat<string, any> = {
      type: SnapCaveatType.SnapCronjob,
      value: {
        jobs: [
          {
            expression: '* * * * *',
            request: undefined,
          },
        ],
      },
    };

    expect(() => validateCronjobCaveat(caveat)).toThrow(
      'Expected a valid cronjob specification array.',
    );
  });
});

describe('CronjobCaveatSpecifications', () => {
  describe('validator', () => {
    it('does not throw when parameters are valid', () => {
      const params = {
        jobs: [
          {
            expression: {
              minute: '*',
              hour: '*',
              dayOfMonth: '*',
              month: '*',
              dayOfWeek: '*',
            },
            request: { method: 'snapMethod', params: [] },
          },
          {
            expression: '*/2 * * * *',
            request: { method: 'anotherSnapMethod', params: ['a', 'b', 'c'] },
          },
        ],
      };

      expect(() =>
        cronjobCaveatSpecifications[SnapCaveatType.SnapCronjob].validator?.({
          type: SnapCaveatType.SnapCronjob,
          value: params,
        }),
      ).not.toThrow();
    });

    it('throws if the expression parameter value is invalid', () => {
      const invalidParams = {
        jobs: [
          {
            expression: '* * * * * * * * *',
            request: { method: 'snapMethod', params: [] },
          },
        ],
      };

      expect(() =>
        cronjobCaveatSpecifications[SnapCaveatType.SnapCronjob].validator?.({
          type: SnapCaveatType.SnapCronjob,
          value: invalidParams,
        }),
      ).toThrow('Expected a valid cronjob specification array.');
    });

    it('throws if the expression parameter value is invalid and provided in object format', () => {
      const invalidParams = {
        jobs: [
          {
            expression: {
              minute: 'aaa',
              hour: 'b',
              dayOfMonth: 'c',
              month: 'd',
              dayOfWeek: 'e',
            },
            request: { method: 'snapMethod', params: [] },
          },
        ],
      };

      expect(() =>
        cronjobCaveatSpecifications[SnapCaveatType.SnapCronjob].validator?.({
          type: SnapCaveatType.SnapCronjob,
          value: invalidParams,
        }),
      ).toThrow('Expected a valid cronjob specification array.');
    });
  });
});
