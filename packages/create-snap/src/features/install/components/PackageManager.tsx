/* eslint-disable import-x/no-useless-path-segments */

import { Box, Text } from 'ink';
import Link from 'ink-link';
import SelectInput from 'ink-select-input';
import type { FunctionComponent, ComponentProps } from 'react';
import { useState } from 'react';

import { GITHUB_ISSUES_URL } from '../../../constants.js';
import { useFlow } from '../hooks/useFlow.js';
import {
  PACKAGE_MANAGERS,
  getPackageManagerByName,
  yarn,
} from '../package-managers/index.js';

type Item<Type> = Parameters<
  Exclude<ComponentProps<typeof SelectInput>['onSelect'], undefined>
>[0] & {
  value: Type;
};

export const PackageManager: FunctionComponent = () => {
  const { context, setContext, next } = useFlow();

  const items = Object.entries(PACKAGE_MANAGERS).map(([key, { name }]) => ({
    label: name,
    value: key as keyof typeof PACKAGE_MANAGERS,
  }));

  const handleSelect = (item: Item<keyof typeof PACKAGE_MANAGERS>) => {
    setContext({
      ...context,
      packageManager: getPackageManagerByName(item.value),
    });

    next();
  };

  return (
    <Box flexDirection="column" margin={1}>
      <Text>
        Select your preferred package manager, and press{' '}
        <Text color="green">Enter</Text> to continue.
      </Text>
      <Box margin={1}>
        <SelectInput items={items} onSelect={handleSelect} initialIndex={1} />
      </Box>
      <Text dimColor={true}>
        If your preferred package manager is not listed, feel free to open an
        issue on <Link url={GITHUB_ISSUES_URL}>GitHub</Link> to request support
        for it.
      </Text>
    </Box>
  );
};
