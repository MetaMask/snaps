import build from './build';
import evaluate from './eval';
import init from './init';
import manifest from './manifest';
import serve from './serve';
import sign from './sign';
import verify from './verify';
import watch from './watch';

const commands = [build, evaluate, init, manifest, serve, watch, sign, verify];
export default commands;
