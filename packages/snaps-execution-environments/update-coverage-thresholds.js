/* eslint-disable no-console */

// This script is a custom replacement for jest-it-up.
// Since two test runners are used in the snaps-execution-environments package,
// it is required that coverage process runs independently based on the results
// from both test runners.
// This script will update changes to coverage thresholds when they're improved.

'use strict';

const fs = require('fs');

const nycConfig = require('./nyc.config');

/**
 * Round float number to two decimal places.
 *
 * @param {number} value - Float number.
 * @returns {number} A number rounded to two decimals.
 */
function getRoundedFloat(value) {
  return value.toFixed(2);
}

/**
 * This function will check coverage reports at the final stage and do update
 * of the coverage thresholds if they're improved by latest changes.
 */
async function checkCoverage() {
  console.log('Checking and updating coverage thresholds...');

  // Read current coverage report
  const rawCoverageData = await fs.promises.readFile(
    './coverage/coverage-summary.json',
  );
  const coverageAll = JSON.parse(rawCoverageData.toString());
  const coverage = coverageAll.total;

  // Update coverage report
  if (
    nycConfig.branches < coverage.branches.pct ||
    nycConfig.lines < coverage.lines.pct ||
    nycConfig.functions < coverage.functions.pct ||
    nycConfig.statements < coverage.statements.pct
  ) {
    console.log('\nCoverage thresholds are changed. Updating...');
    // Display difference
    console.log(
      `Branches: +${getRoundedFloat(
        coverage.branches.pct - nycConfig.branches,
      )}%`,
    );
    console.log(
      `Lines: +${getRoundedFloat(coverage.lines.pct - nycConfig.lines)}%`,
    );
    console.log(
      `Functions: +${getRoundedFloat(
        coverage.functions.pct - nycConfig.functions,
      )}%`,
    );
    console.log(
      `Statements: +${getRoundedFloat(
        coverage.statements.pct - nycConfig.statements,
      )}%`,
    );

    // Update file
    const updatedNycConfig = `/**
 * NYC coverage reporter configuration.
 */
module.exports = {
  'check-coverage': true,
  branches: ${getRoundedFloat(coverage.branches.pct)},
  lines: ${getRoundedFloat(coverage.lines.pct)},
  functions: ${getRoundedFloat(coverage.functions.pct)},
  statements: ${getRoundedFloat(coverage.statements.pct)},
};\n`;
    await fs.promises.writeFile('nyc.config.js', updatedNycConfig);
    console.log('\nCoverage thresholds updated!');
  } else {
    console.log('No changes detected to coverage thresholds.');
  }
}

checkCoverage().catch(console.error);
