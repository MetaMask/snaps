import build from './build';
import evaluate from './eval';
import init from './init';
import manifest from './manifest';
import serve from './serve';
import watch from './watch';

const commands = [build, evaluate, init, manifest, serve, watch];
export default commands;
