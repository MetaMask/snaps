#!/usr/bin/env node

const cli = require('./cli');
const commands = require('./cmds');
const { applyConfig } = require('./utils');

main();

// application
async function main() {
  await applyConfig();
  cli(commands);
}
