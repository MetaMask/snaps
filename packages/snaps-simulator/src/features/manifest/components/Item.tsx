import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Flex,
  ListItem,
  Tag,
  Text,
} from '@chakra-ui/react';
import type { FunctionComponent } from 'react';

import { Icon } from '../../../components';

type ItemProps = {
  isValid: boolean;
  name: string;
  manifestName: string;
  message?: string | undefined;
};

const BaseItem: FunctionComponent<ItemProps> = ({
  isValid,
  name,
  manifestName,
}) => (
  <Flex
    alignItems="center"
    gap="2"
    paddingY="2"
    marginX="4"
    marginY="2"
    flex="1"
  >
    <Icon icon={isValid ? 'playSuccess' : 'errorTriangle'} width="14px" />
    <Text fontSize="sm" fontWeight="500">
      {name}
    </Text>
    <Tag
      variant="code"
      background="background.alternative"
      color="text.alternative"
      fontSize="xs"
    >
      {manifestName}
    </Tag>
  </Flex>
);

/**
 * A manifest validation item.
 *
 * @param props - The Item component props.
 * @param props.isValid - Whether the item is valid.
 * @param props.name - The name of the item.
 * @param props.manifestName - The name of the item in the manifest.
 * @param props.message - The validation message.
 * @returns The Item component.
 */
export const Item: FunctionComponent<ItemProps> = ({
  isValid,
  name,
  manifestName,
  message,
}) => {
  if (isValid || !message) {
    return (
      <ListItem>
        <BaseItem isValid={isValid} name={name} manifestName={manifestName} />
      </ListItem>
    );
  }

  return (
    <ListItem>
      <Accordion allowToggle={true}>
        <AccordionItem border="none">
          <AccordionButton
            padding="0"
            _hover={{
              background: 'none',
            }}
          >
            <BaseItem
              isValid={isValid}
              name={name}
              manifestName={manifestName}
            />
            <AccordionIcon marginRight="4" color="text.muted" />
          </AccordionButton>
          <AccordionPanel padding="0">
            <Box
              background="error.muted"
              color="error.default"
              borderRadius="4px"
              sx={{
                p: {
                  color: 'error.default',
                  fontSize: 'xs',
                },
              }}
              marginX="4"
              marginBottom="4"
              padding="2"
            >
              <Text>{message}</Text>
            </Box>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </ListItem>
  );
};
