import type { Options } from 'yargs';

// eslint-disable-next-line @typescript-eslint/ban-types
type OptionalArguments<Type = {}> = Type & {
  /** Non-option arguments */
  _?: (string | number)[];

  /** The script name or node command */
  $0?: string;

  /** All remaining options */
  [argName: string]: unknown;
};

type YargsArgs = {
  directory?: string;
} & OptionalArguments;

type Option = {
  stripComments: boolean;
  transformHtmlComments: boolean;
} & Options;
