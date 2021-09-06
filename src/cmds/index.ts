import init from './init';
import build from './build';
import evaluate from './eval';
import manifest from './manifest';
import serve from './serve';
import watch from './watch';

const commands = [init, build, evaluate, manifest, serve, watch];
export default commands;
