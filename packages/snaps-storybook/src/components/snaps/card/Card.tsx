import {
  Card as ChakraCard,
  CardBody,
  CardHeader,
  Flex,
  Image,
  Text,
} from '@chakra-ui/react';
import type { CardProps } from '@metamask/snaps-sdk/jsx';
import { bytesToBase64, stringToBytes } from '@metamask/utils';
import type { FunctionComponent } from 'react';

import type { RenderProps } from '../../Renderer';

/**
 * The card component renders a card with a title, description, and value.
 *
 * @param props - The props of the component.
 * @param props.image - The image to show as part of the card. If provided, this
 * must be an SVG string.
 * @param props.title - The title of the card.
 * @param props.description - The description to show below the title.
 * @param props.value - The value to show on the right side.
 * @param props.extra - An additional value to show below the value.
 * @returns The card element.
 * @see CardProps
 */
export const Card: FunctionComponent<RenderProps<CardProps>> = ({
  image,
  title,
  description,
  value,
  extra,
}) => (
  <ChakraCard direction="row">
    {image && (
      <Image
        src={`data:image/svg+xml;base64,${bytesToBase64(stringToBytes(image))}`}
        alt={title}
        width="32px"
        height="32px"
        borderRadius="full"
      />
    )}
    <CardBody>
      <CardHeader>
        <Text>{title}</Text>
        <Text>{value}</Text>
      </CardHeader>
      <Flex justifyContent="space-between" gap="2">
        {description ? <Text>{description}</Text> : <span />}
        {extra ? <Text>{extra}</Text> : <span />}
      </Flex>
    </CardBody>
  </ChakraCard>
);
