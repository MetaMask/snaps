import type { SnapConfig } from '../../config';

const config: SnapConfig = {
  bundler: 'webpack',
  // @ts-expect-error - Invalid option.
  foo: 'bar',
};

export default config;
