import { isComponent } from '@metamask/snaps-sdk';
import { assert } from '@metamask/utils';
import type { FunctionComponent } from 'react';

import { Copyable as CopyableComponent } from '../../../components';

export type CopyableProps = {
  id: string;
  node: unknown;
};

export const Copyable: FunctionComponent<CopyableProps> = ({ node, id }) => {
  assert(isComponent(node), 'Expected value to be a valid UI component.');
  assert(
    node.type === 'copyable',
    'Expected value to be a copyable component.',
  );

  return <CopyableComponent key={`${id}-copyable`} value={node.value} />;
};
