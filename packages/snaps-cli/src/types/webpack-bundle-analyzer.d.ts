declare module 'webpack-bundle-analyzer' {
  import type { Server } from 'http';
  import type { Compiler, WebpackPluginInstance } from 'webpack';

  export type BundleAnalyzerPluginOptions = {
    analyzerPort?: number | undefined;
    logLevel?: 'info' | 'warn' | 'error' | 'silent' | undefined;
    openAnalyzer?: boolean | undefined;
  };

  export class BundleAnalyzerPlugin implements WebpackPluginInstance {
    readonly opts: BundleAnalyzerPluginOptions;

    server?: Promise<{
      http: Server;
    }>;

    constructor(options?: BundleAnalyzerPluginOptions);

    apply(compiler: Compiler): void;
  }
}
