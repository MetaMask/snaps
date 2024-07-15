import { Flex, Text } from '@chakra-ui/react';
import type { ValueProps } from '@metamask/snaps-sdk/jsx';
import type { FunctionComponent } from 'react';

import type { RenderProps } from '../../Renderer';

/**
 * The value component renders a value with an extra description.
 *
 * @param props - The component props.
 * @param props.value - The value to render.
 * @param props.extra - The extra description to render.
 * @returns The value element.
 */
export const Value: FunctionComponent<RenderProps<ValueProps>> = ({
  value,
  extra,
}) => {
  return (
    <Flex gap="2">
      <Text color="text.muted">{extra}</Text>
      <Text>{value}</Text>
    </Flex>
  );
};
