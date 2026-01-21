import type { Options } from 'yargs';

import type { ProcessedConfig } from '../config';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type OptionalArguments<Type = {}> = Type & {
  /** Non-option arguments */
  _?: (string | number)[];

  /** The script name or node command */
  $0?: string;

  /** All remaining options */
  [argName: string]: unknown;
};

type YargsArgs = {
  // Context is added by the config middleware.
  context: {
    config: ProcessedConfig;
  };

  analyze?: boolean;
  build?: boolean;
  fix?: boolean;
  input?: string;
  preinstalled?: boolean;

  config?: string;
  sourceMaps: boolean;
  stripComments: boolean;
  transformHtmlComments: boolean;
  port: number;
  dist: string;
  src: string;
  eval: boolean;
  manifest?: string;
  outfileName: string;
  serve: boolean;
  directory?: string;
} & OptionalArguments;

type Option = {
  stripComments: boolean;
  transformHtmlComments: boolean;
} & Options;
