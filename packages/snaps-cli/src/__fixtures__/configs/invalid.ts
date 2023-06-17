import type { SnapConfig } from '../../config';

// @ts-expect-error - Missing required properties.
const config: SnapConfig = {
  bundler: 'webpack',
};

export default config;
