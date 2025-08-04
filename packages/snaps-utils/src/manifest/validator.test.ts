import { isReportFixable } from './validator';
import type { ValidatorReport } from './validator-types';
import { getSnapManifest } from '../test-utils';

describe('isReportFixable', () => {
  it('returns `true` if the error report has a fix', () => {
    const report = {
      severity: 'error',
      message: 'foo',
      fix: async () => {
        return {
          manifest: getSnapManifest(),
        };
      },
    } satisfies ValidatorReport;

    expect(isReportFixable(report)).toBe(true);
  });

  it('returns `true` if the warning report has a fix', () => {
    const report = {
      severity: 'warning',
      message: 'foo',
      fix: async () => {
        return {
          manifest: getSnapManifest(),
        };
      },
    } satisfies ValidatorReport;

    expect(isReportFixable(report)).toBe(true);
  });

  it('returns `false` if the report has no fix', () => {
    const report = {
      severity: 'error',
      message: 'foo',
    } satisfies ValidatorReport;

    expect(isReportFixable(report)).toBe(false);
  });

  it('returns `false` if the error report has a fix, and `errorsOnly` is `true`', () => {
    const report = {
      severity: 'error',
      message: 'foo',
      fix: async () => {
        return {
          manifest: getSnapManifest(),
        };
      },
    } satisfies ValidatorReport;

    expect(isReportFixable(report, true)).toBe(true);
  });

  it('returns `false` if the warning report has a fix, and `errorsOnly` is `true`', () => {
    const report = {
      severity: 'warning',
      message: 'foo',
      fix: async () => {
        return {
          manifest: getSnapManifest(),
        };
      },
    } satisfies ValidatorReport;

    expect(isReportFixable(report, true)).toBe(false);
  });
});
