import { FunctionComponent, ReactNode } from 'react';

import { isTestBuild } from '../utils';

export type TestProps = {
  children: ReactNode;
  isTest?: boolean;
};

/**
 * Renders the children only if the build is a test build.
 *
 * @param props - The props.
 * @param props.children - The children to render.
 * @param props.isTest - Whether to render only in test builds, or only in non-test
 * builds.
 * @returns The component.
 */
export const Test: FunctionComponent<TestProps> = ({
  children,
  isTest = true,
}) => {
  if (isTestBuild() === isTest) {
    return <>{children}</>;
  }

  return null;
};
