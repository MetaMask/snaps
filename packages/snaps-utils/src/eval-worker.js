"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// eslint-disable-next-line import/no-unassigned-import
require("ses/lockdown");
const fs_1 = require("fs");
const mock_1 = require("./mock");
const types_1 = require("./types");
lockdown({
    consoleTaming: 'unsafe',
    errorTaming: 'unsafe',
    mathTaming: 'unsafe',
    dateTaming: 'unsafe',
    overrideTaming: 'severe',
    // TODO: See if there's an easier way to do this. This file is ran in a
    // separate process, so we can't mock SES with Jest.
    ...(process.env.NODE_ENV === 'test'
        ? {
            domainTaming: 'unsafe',
        }
        : {}),
});
/**
 * Get mock endowments that don't do anything. This is useful for running the
 * eval, for snaps that try to communicate with the extension on initialisation,
 * for example.
 *
 * @returns The mock endowments.
 */
function getMockEndowments() {
    const endowments = (0, mock_1.generateMockEndowments)();
    return {
        ...endowments,
        window: endowments,
        self: endowments,
    };
}
const snapFilePath = process.argv[2];
const snapModule = { exports: {} };
new Compartment({
    ...getMockEndowments(),
    module: snapModule,
    exports: snapModule.exports,
}).evaluate((0, fs_1.readFileSync)(snapFilePath, 'utf8'));
const invalidExports = Object.keys(snapModule.exports).filter((snapExport) => !types_1.SNAP_EXPORT_NAMES.includes(snapExport));
if (invalidExports.length > 0) {
    // eslint-disable-next-line no-console
    console.warn(`Invalid snap exports detected:\n${invalidExports.join('\n')}`);
}
setTimeout(() => process.exit(0), 1000); // Hack to ensure worker exits
