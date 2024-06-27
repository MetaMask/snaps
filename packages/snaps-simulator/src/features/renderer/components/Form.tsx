import { Box } from '@chakra-ui/react';
import { UserInputEventType } from '@metamask/snaps-sdk';
import type { JSXElement } from '@metamask/snaps-sdk/jsx';
import { assertJSXElement } from '@metamask/snaps-sdk/jsx';
import { getJsxChildren } from '@metamask/snaps-utils';
import { assert } from '@metamask/utils';
import type { FunctionComponent, FormEvent } from 'react';

import { useSnapInterfaceContext } from '../../../contexts';
import { SnapComponent } from '../SnapComponent';

export type FormProps = {
  id: string;
  node: unknown;
};

export const Form: FunctionComponent<FormProps> = ({ node, id }) => {
  assertJSXElement(node);
  assert(node.type === 'Form', 'Expected value to be a form component.');
  const { handleEvent } = useSnapInterfaceContext();

  const { props } = node;

  const handleSubmit = (event: FormEvent<HTMLElement>) => {
    event.preventDefault();
    handleEvent({
      event: UserInputEventType.FormSubmitEvent,
      name: props.name,
    });
  };
  return (
    <Box key={id} as="form" onSubmit={handleSubmit}>
      {getJsxChildren(node).map((child, index) => (
        <SnapComponent
          key={`${id}-form-child-${index}`}
          node={child as JSXElement}
          form={node.props.name}
        />
      ))}
    </Box>
  );
};
