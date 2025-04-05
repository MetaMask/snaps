import buildCommand from './build';
import evaluateCommand from './eval';
import manifestCommand from './manifest';
import sandboxCommand from './sandbox';
import serveCommand from './serve';
import watchCommand from './watch';

const commands = [
  buildCommand,
  evaluateCommand,
  manifestCommand,
  sandboxCommand,
  serveCommand,
  watchCommand,
];

export default commands;
