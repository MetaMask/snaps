import buildModule from './build';
import evaluateModule from './eval';
import initModule from './init';
import manifestModule from './manifest';
import serveModule from './serve';
import watchModule from './watch';

export const commandModules = [
  buildModule,
  evaluateModule,
  initModule,
  manifestModule,
  serveModule,
  watchModule,
];

export const build = buildModule.handler;
export const evaluate = evaluateModule.handler;
export const init = initModule.handler;
export const manifest = manifestModule.handler;
export const serve = serveModule.handler;
export const watch = watchModule.handler;
