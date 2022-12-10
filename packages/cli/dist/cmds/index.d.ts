/// <reference types="yargs" />
declare const commands: {
    command: string[];
    desc: string;
    builder: (yarg: import("yargs").Argv<{}>) => void;
    handler: (argv: import("../types/yargs").YargsArgs) => Promise<void>;
}[];
export default commands;
