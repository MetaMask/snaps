import * as dotenv from 'dotenv';
import * as dotenvExpand from 'dotenv-expand';
import * as fs from 'fs/promises';
import path from 'path';
import process from 'process';
import { assert } from './assert';
import { fromEntries } from './object';

export function search(): string {
  return path.resolve(process.cwd(), '.env');
}

export interface DotEnvParseArgs {
  /**
   * The filepath where the .env will be searched for
   */
  path: string;
  /**
   * Will filter resulting variables to only the ones starting with value of `filterPrefix`.
   */
  filterPrefix: string;
}

export async function parse(
  { path, filterPrefix }: DotEnvParseArgs = {
    path: search(),
    filterPrefix: 'SNAP_',
  },
): Promise<Record<string, string>> {
  const file = await fs.readFile(path);
  const result = dotenvExpand.expand({
    ignoreProcessEnv: true,
    parsed: dotenv.parse(path),
  });
  if (result.error !== undefined) {
    throw result.error;
  }
  assert(result.parsed !== undefined);
  return fromEntries(
    Object.entries(result.parsed).filter(([key]) =>
      key.startsWith(filterPrefix),
    ),
  );
}
