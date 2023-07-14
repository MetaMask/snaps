/* eslint-disable no-console */

import { promises as fs } from 'fs';
import type { CoverageMap } from 'istanbul-lib-coverage';
import { createCoverageMap } from 'istanbul-lib-coverage';
import type { ReportBase } from 'istanbul-lib-report';
import { createContext } from 'istanbul-lib-report';
import type { ReportOptions, ReportType } from 'istanbul-reports';
import reports from 'istanbul-reports';
import { resolve } from 'path';
import * as process from 'process';

const COVERAGE_JSON = resolve(__dirname, '..', 'coverage.json');
const COVERAGE_PATH = resolve(__dirname, '..', 'coverage');

const JEST_COVERAGE_FILE = resolve(
  COVERAGE_PATH,
  'jest',
  'coverage-final.json',
);

const WDIO_COVERAGE_FILE = resolve(
  COVERAGE_PATH,
  'wdio',
  'coverage-final.json',
);

const COVERAGE_KEYS = ['branches', 'functions', 'lines', 'statements'] as const;
type CoverageKey = typeof COVERAGE_KEYS[number];

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

  return (
    reports.create(reportType, reportOptions) as unknown as ReportBase
  ).execute(context);
}

/**
 * Merge the coverage reports from Jest and WebdriverIO. This checks if the
 * coverage for a given file is higher in WebdriverIO than in Jest. If it is,
 * it replaces the Jest coverage with the WebdriverIO coverage.
 *
 * This is a workaround for WebdriverIO's coverage reporting having inaccurate
 * line numbers.
 *
 * @returns The summary of the merged coverage.
 */
async function mergeReports() {
  const jestMap = await fs
    .readFile(JEST_COVERAGE_FILE, 'utf8')
    .then(JSON.parse)
    .then(createCoverageMap);

  const wdioMap = await fs
    .readFile(WDIO_COVERAGE_FILE, 'utf8')
    .then(JSON.parse)
    .then(createCoverageMap);

  const jestFiles = jestMap.files();

  wdioMap.files().forEach((file) => {
    const coverage = wdioMap.fileCoverageFor(file);
    const wdioSummary = coverage.toSummary();
    const jestSummary = jestMap.fileCoverageFor(file).toSummary();

    if (
      !jestFiles.includes(file) ||
      COVERAGE_KEYS.every((key) => wdioSummary[key].pct >= jestSummary[key].pct)
    ) {
      jestMap.filter((jestFile) => jestFile !== file);
      jestMap.addFileCoverage(coverage);
    }
  });

  generateSummaryReport(COVERAGE_PATH, jestMap, 'json');
  generateSummaryReport(COVERAGE_PATH, jestMap, 'json-summary');
  generateSummaryReport(COVERAGE_PATH, jestMap, 'html');

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
    (target, [key, value]) => {
      const percentage = summary[key as CoverageKey].pct;
      if (percentage < value) {
        target.errors.push(
          `Coverage for ${key} decreased from ${value} to ${percentage}.`,
        );
      }

      target.percentages[key as keyof Result['percentages']] = percentage;
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
