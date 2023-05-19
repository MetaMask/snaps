import { Box, List, Text } from '@chakra-ui/react';
import { FunctionComponent } from 'react';

import { Icon } from '../../../components';
import { useDispatch } from '../../../hooks';
import { openConfigurationModal } from '../../configuration';
import { Item } from './Item';

export const Bottom: FunctionComponent = () => {
  const dispatch = useDispatch();

  const handleOpenConfiguration = () => {
    dispatch(openConfigurationModal());
  };

  return (
    <List borderTop="1px solid" borderTopColor="border.default" padding="2">
      <Item
        path="https://github.com/MetaMask/snaps-simulator"
        isExternal={true}
      >
        <Icon icon="gitHub" width="24px" />
        <Box>
          <Text>
            <Box as="span" fontWeight="600">
              GitHub
            </Box>
          </Text>
          <Text fontSize="sm" marginTop="1">
            Report an issue or contribute to the project
          </Text>
        </Box>
      </Item>
      <Item path="#" onClick={handleOpenConfiguration}>
        <Icon icon="configuration" width="24px" />
        <Box>
          <Text>
            <Box as="span" fontWeight="600">
              Settings
            </Box>
          </Text>
          <Text fontSize="sm" marginTop="1">
            Configure the simulation environment
          </Text>
        </Box>
      </Item>
    </List>
  );
};
