import { Box, Text, useInput } from 'ink';
import type { FunctionComponent } from 'react';
import { useState } from 'react';

import { Flow } from './components/Flow.js';
import { Metadata } from './components/Metadata.js';
import { PackageManager } from './components/PackageManager.js';
import type { InstallFlowContext } from './install-flow.js';
import { yarn } from './package-managers';

export const INSTALL_STEPS = [
  {
    title: 'Metadata',
    component: Metadata,
  },
  {
    title: 'Package manager',
    component: PackageManager,
  },
];

export const Install: FunctionComponent = () => {
  const [context, setContext] = useState<InstallFlowContext | null>(null);

  useInput(() => {});

  if (context) {
    return (
      <Box flexDirection="column" margin={1} padding={1}>
        <Text>Installation flow complete:</Text>
        <Text>{JSON.stringify(context, null, 2)}</Text>
      </Box>
    );
  }

  return (
    <Flow<InstallFlowContext>
      steps={INSTALL_STEPS}
      initialContext={{
        name: '',
        packageName: '',
        packageManager: yarn,
      }}
      onSubmit={setContext}
    />
  );
};
