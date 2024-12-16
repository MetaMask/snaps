import type {
  Caveat,
  PermissionConstraint,
} from '@metamask/permission-controller';
import { PermissionType, SubjectType } from '@metamask/permission-controller';
import { SnapCaveatType } from '@metamask/snaps-utils';

import {
  getCronjobCaveatMapper,
  cronjobEndowmentBuilder,
  validateCronjobCaveat,
  cronjobCaveatSpecifications,
  getCronjobCaveatJobs,
} from './cronjob';
import { SnapEndowments } from './enum';

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
        validator: expect.any(Function),
      });

      expect(specification.endowmentGetter()).toBeNull();
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
              ],
            },
          },
        ],
      });
    });
  });
});

describe('getCronjobCaveatJobs', () => {
  it('returns the jobs from a cronjob caveat', () => {
    const permission: PermissionConstraint = {
      date: 0,
      parentCapability: 'foo',
      invoker: 'bar',
      id: 'baz',
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
            ],
          },
        },
      ],
    };

    expect(getCronjobCaveatJobs(permission)).toStrictEqual([
      {
        expression: '* * * * *',
        request: {
          method: 'exampleMethodOne',
          params: ['p1'],
        },
      },
    ]);
  });

  it('returns null if there are no caveats', () => {
    const permission: PermissionConstraint = {
      date: 0,
      parentCapability: 'foo',
      invoker: 'bar',
      id: 'baz',
      caveats: null,
    };

    expect(getCronjobCaveatJobs(permission)).toBeNull();
  });

  it('will throw if there is more than one caveat', () => {
    const permission: PermissionConstraint = {
      date: 0,
      parentCapability: 'foo',
      invoker: 'bar',
      id: 'baz',
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
            ],
          },
        },
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
            ],
          },
        },
      ],
    };

    expect(() => getCronjobCaveatJobs(permission)).toThrow('Assertion failed.');
  });

  it('will throw if the caveat type is wrong', () => {
    const permission: PermissionConstraint = {
      date: 0,
      parentCapability: 'foo',
      invoker: 'bar',
      id: 'baz',
      caveats: [
        {
          type: SnapCaveatType.ChainIds,
          value: {
            jobs: [
              {
                expression: '* * * * *',
                request: {
                  method: 'exampleMethodOne',
                  params: ['p1'],
                },
              },
            ],
          },
        },
      ],
    };

    expect(() => getCronjobCaveatJobs(permission)).toThrow('Assertion failed.');
  });
});

describe('validateCronjobCaveat', () => {
  it('should not throw an error when provided specification is valid', () => {
    const caveat: Caveat<string, any> = {
      type: SnapCaveatType.SnapCronjob,
      value: {
        jobs: [
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
  });
});
