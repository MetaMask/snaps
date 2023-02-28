/* eslint-disable no-console */

import { promises as fs } from 'fs';
import { resolve } from 'path';
import * as process from 'process';

const COVERAGE_FILE = resolve(__dirname, '..', 'coverage.json');
const COVERAGE_SUMMARY = resolve(
  __dirname,
  '..',
  'coverage',
  'report',
  'coverage-summary.json',
);

const COVERAGE_KEYS = ['branches', 'functions', 'lines', 'statements'];

/**
 * This takes the coverage summary file and the current coverage file and
 * compares the two. If the coverage has decreased, it logs the errors and
 * exits with a non-zero exit code. Otherwise, it writes the new coverage
 * percentages to disk.
 */
async function main() {
  // Read the coverage summary file and the current coverage file.
  const summary = await fs.readFile(COVERAGE_SUMMARY, 'utf-8').then(JSON.parse);
  const currentCoverage = await fs
    .readFile(COVERAGE_FILE, 'utf-8')
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
      const percentage = summary.total[key].pct;
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
    COVERAGE_FILE,
    `${JSON.stringify(percentages, null, 2)}\n`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
