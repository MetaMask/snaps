import type yargs from 'yargs';
import type { YargsArgs } from '../../types/yargs';
declare const command: {
    command: string[];
    desc: string;
    builder: (yarg: yargs.Argv) => void;
    handler: (argv: YargsArgs) => Promise<void>;
};
export default command;
