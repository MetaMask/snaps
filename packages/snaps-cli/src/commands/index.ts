import buildCommand from './build';
import evaluateCommand from './eval';
import manifestCommand from './manifest';
import serveCommand from './serve';
import watchCommand from './watch';

const commands = [
  buildCommand,
  evaluateCommand,
  manifestCommand,
  serveCommand,
  watchCommand,
];

export default commands;
