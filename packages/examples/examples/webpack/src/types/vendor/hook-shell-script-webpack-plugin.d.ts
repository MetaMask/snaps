// eslint-disable-next-line import/unambiguous
declare module 'hook-shell-script-webpack-plugin' {
  import { Compiler } from 'webpack';

  export type Options = {
    afterEmit: string[];
  };

  export default class HookShellScriptWebpackPlugin {
    constructor(options: Options);

    apply(compiler: Compiler): void;
  }
}
