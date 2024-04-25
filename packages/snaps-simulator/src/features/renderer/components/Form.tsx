import { Box } from '@chakra-ui/react';
import { assertIsComponent } from '@metamask/snaps-sdk';
import { assert } from '@metamask/utils';
import type { FunctionComponent } from 'react';

import { Renderer } from '../Renderer';

export type FormProps = {
  id: string;
  node: unknown;
};

export const Form: FunctionComponent<FormProps> = ({ node, id }) => {
  assertIsComponent(node);
  assert(node.type === 'form', 'Expected value to be a form component.');

  return (
    <Box key={`${id}-form`} as="form">
      {node.children.map((child, index) => (
        <Renderer
          key={`${id}-form-child-${index}`}
          id={`${id}-form-child-${index}`}
          node={child}
        />
      ))}
    </Box>
  );
};
