import type { SnapConfig } from '../../config';

const config: SnapConfig = {
  // @ts-expect-error - Invalid option.
  foo: 'bar',
};

export default config;
