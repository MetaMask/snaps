import yargs from 'yargs';
import { YargsArgs } from '../../types/yargs';
declare const _default: {
    command: string[];
    desc: string;
    builder: (yarg: yargs.Argv) => void;
    handler: (argv: YargsArgs) => Promise<void>;
};
export = _default;
