import * as init from './init';
import * as build from './build';
import * as evaluate from './eval';
import * as manifest from './manifest';
import * as serve from './serve';
import * as watch from './watch';

const commands = [init, build, evaluate, manifest, serve, watch];
export default commands;
