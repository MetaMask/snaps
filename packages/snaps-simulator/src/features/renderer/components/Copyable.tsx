import { assertJSXElement } from '@metamask/snaps-sdk/jsx';
import { assert } from '@metamask/utils';
import type { FunctionComponent } from 'react';

import { Copyable as CopyableComponent } from '../../../components';

export type CopyableProps = {
  id: string;
  node: unknown;
};

export const Copyable: FunctionComponent<CopyableProps> = ({ node, id }) => {
  assertJSXElement(node);
  assert(
    node.type === 'Copyable',
    'Expected value to be a copyable component.',
  );

  const { props } = node;

  return <CopyableComponent key={`${id}-copyable`} value={props.value} />;
};
