import type { FunctionComponent } from 'react';
import { useState } from 'react';

import {
  Flow,
  PackageManager,
  Metadata,
  Template,
} from './components/index.js';
import type { InstallFlowContext } from './types.js';
import { yarn } from '../../package-managers/index.js';
import { Install } from '../install/index.js';

export const INSTALL_STEPS = [
  {
    title: 'Template',
    component: Template,
  },
  {
    title: 'Metadata',
    component: Metadata,
  },
  {
    title: 'Package manager',
    component: PackageManager,
  },
];

export const InstallFlow: FunctionComponent = () => {
  const [context, setContext] = useState<InstallFlowContext | null>(null);

  if (context) {
    return <Install />;
  }

  return (
    <Flow<InstallFlowContext>
      steps={INSTALL_STEPS}
      initialContext={{
        metadata: {
          name: '',
          packageName: '',
        },
        template: 'minimal',
        packageManager: yarn,
      }}
      onSubmit={setContext}
    />
  );
};
