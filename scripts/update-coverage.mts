/* eslint-disable no-console, n/no-process-exit, import-x/no-named-as-default-member */

import { promises as fs } from 'fs';
import type { CoverageMap } from 'istanbul-lib-coverage';
import istanbul from 'istanbul-lib-coverage';
import type { ReportBase } from 'istanbul-lib-report';
import { createContext } from 'istanbul-lib-report';
import type { ReportOptions, ReportType } from 'istanbul-reports';
import { create } from 'istanbul-reports';
import { resolve } from 'path';

const COVERAGE_JSON = resolve(process.cwd(), 'coverage.json');
const COVERAGE_PATH = resolve(process.cwd(), 'coverage');

/**
 * The threshold for coverage increase. If the coverage for a given file
 * does not increase by at least this percentage, the script will not update the
 * coverage percentages.
 */
const COVERAGE_INCREASE_THRESHOLD = 0.3;

/**
 * The threshold for coverage decrease. If the coverage for a given file
 * decreases by more than this percentage, the script will log an error
 * and exit with a non-zero exit code.
 */
const COVERAGE_DECREASE_THRESHOLD = 0.1;

const JEST_COVERAGE_FILE = resolve(
  COVERAGE_PATH,
  'jest',
  'coverage-final.json',
);

const VITE_COVERAGE_FILE = resolve(
  COVERAGE_PATH,
  'vite',
  'coverage-final.json',
);

const COVERAGE_KEYS = ['branches', 'functions', 'lines', 'statements'] as const;
type CoverageKey = (typeof COVERAGE_KEYS)[number];

/**
 * Given a target directory and a coverageMap generates a finalized coverage
 * summary report and saves it to the directory.
 *
 * @param directory - Directory to save the report to.
 * @param coverageMap - Coverage map to generate the report from.
 * @param reportType - Type of report to generate.
 * @param reportOptions - Options to pass to the report.
 * @returns The report.
 */
function generateSummaryReport<Report extends ReportType>(
  directory: string,
  coverageMap: CoverageMap,
  reportType: Report,
  reportOptions: Partial<ReportOptions[Report]> = {},
) {
  const context = createContext({
    dir: directory,
    coverageMap,
  });

  return (create(reportType, reportOptions) as unknown as ReportBase).execute(
    context,
  );
}

/**
 * Merge the coverage reports from Jest and Vite. This checks if the coverage
 * for a given file is higher in Vite than in Jest. If it is, it replaces the
 * Jest coverage with the Vite coverage.
 *
 * This is a workaround for Vite's coverage reporting having inaccurate line
 * numbers.
 *
 * @returns The summary of the merged coverage.
 */
// TODO: Check if Vite's coverage is actually inaccurate.
async function mergeReports() {
  const jestMap = await fs
    .readFile(JEST_COVERAGE_FILE, 'utf8')
    .then(JSON.parse)
    .then(istanbul.createCoverageMap);

  const viteMap = await fs
    .readFile(VITE_COVERAGE_FILE, 'utf8')
    .then(JSON.parse)
    .then(istanbul.createCoverageMap);

  const jestFiles = jestMap.files();

  viteMap.files().forEach((file) => {
    const coverage = viteMap.fileCoverageFor(file);
    const viteSummary = coverage.toSummary();
    const jestSummary = jestMap.fileCoverageFor(file).toSummary();

    if (
      !jestFiles.includes(file) ||
      COVERAGE_KEYS.every((key) => viteSummary[key].pct >= jestSummary[key].pct)
    ) {
      jestMap.filter((jestFile) => jestFile !== file);
      jestMap.addFileCoverage(coverage);
    }
  });

  generateSummaryReport(COVERAGE_PATH, jestMap, 'json');
  generateSummaryReport(COVERAGE_PATH, jestMap, 'json-summary');
  generateSummaryReport(COVERAGE_PATH, jestMap, 'html');
  generateSummaryReport(COVERAGE_PATH, jestMap, 'text');

  return jestMap.getCoverageSummary();
}

/**
 * This takes the coverage summary file and the current coverage file and
 * compares the two. If the coverage has decreased, it logs the errors and
 * exits with a non-zero exit code. Otherwise, it writes the new coverage
 * percentages to disk.
 */
async function main() {
  const summary = await mergeReports();
  const currentCoverage = await fs
    .readFile(COVERAGE_JSON, 'utf-8')
    .then(JSON.parse);

  type Result = {
    percentages: Record<keyof typeof COVERAGE_KEYS, number>;
    errors: string[];
  };

  // Compare the current coverage to the new coverage.
  const { percentages, errors } = Object.entries<number>(
    currentCoverage,
  ).reduce<Result>(
    (target, [key, currentValue]) => {
      const newValue = summary[key as CoverageKey].pct;
      if (
        newValue < currentValue &&
        currentValue - newValue > COVERAGE_DECREASE_THRESHOLD
      ) {
        target.errors.push(
          `Coverage for ${key} decreased from ${currentValue}% to ${newValue}%.`,
        );
      }

      // If the coverage has not increased by the threshold, do not update it.
      if (newValue - currentValue < COVERAGE_INCREASE_THRESHOLD) {
        return target;
      }

      target.percentages[key as keyof Result['percentages']] = newValue;
      return target;
    },
    {
      percentages: currentCoverage,
      errors: [],
    },
  );

  // If there are any errors, log them and exit with a non-zero exit code.
  if (errors.length > 0) {
    errors.forEach((error) => console.error(error));
    process.exit(1);
  }

  // Check if the coverage percentages have changed.
  const hasChanged = Object.entries(percentages).some(
    ([key, value]) => value !== currentCoverage[key as CoverageKey],
  );

  if (!hasChanged) {
    console.log('No changes in coverage percentages detected.');
    return;
  }

  // Write coverage percentages to disk.
  console.log('Writing new coverage percentages to disk.');
  await fs.writeFile(
    COVERAGE_JSON,
    `${JSON.stringify(percentages, null, 2)}\n`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
