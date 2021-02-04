import { Options } from 'yargs';

// eslint-disable-next-line @typescript-eslint/ban-types
type OptionalArguments<T = {}> = T & {

  /** Non-option arguments */
  _?: (string | number)[];

  /** The script name or node command */
  $0?: string;

  /** All remaining options */
  [argName: string]: unknown;
};

interface YargsArgs extends OptionalArguments {
  sourceMaps: boolean;
  stripComments: boolean;
  port: number;
  dist: string;
  src: string;
  outfileName?: string;
}

interface Option extends Options {
  stripComments: boolean;
}
