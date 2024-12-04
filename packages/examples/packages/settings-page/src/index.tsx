import type { OnSettingsPageHandler } from '@metamask/snaps-sdk';
import {
  assert,
  UserInputEventType,
  type OnUserInputHandler,
} from '@metamask/snaps-sdk';
import {
  Box,
  Container,
  Footer,
  Heading,
  Text,
  Button,
} from '@metamask/snaps-sdk/jsx';

/**
 * Handle incoming settings page requests from the MetaMask clients.
 *
 * @returns A static panel rendered with custom UI.
 * @see https://docs.metamask.io/snaps/reference/exports/#onsettingspage
 */
export const onSettingsPage: OnSettingsPageHandler = async () => {
  return {
    content: (
      <Container>
        <Box>
          <Heading>Hello world!</Heading>
          <Text>Welcome to my Snap settings page!</Text>
        </Box>
        <Footer>
          <Button name="footer_button">Footer button</Button>
        </Footer>
      </Container>
    ),
  };
};

/**
 * Handle incoming user events coming from the Snap interface.
 *
 * @param params - The event parameters.
 * @param params.id - The Snap interface ID where the event was fired.
 * @param params.event - The event object containing the event type, name and
 * value.
 * @see https://docs.metamask.io/snaps/reference/exports/#onuserinput
 */
export const onUserInput: OnUserInputHandler = async ({ event, id }) => {
  // Since this Snap only has one event, we can assert the event type and name
  // directly.
  assert(event.type === UserInputEventType.ButtonClickEvent);
  assert(event.name === 'footer_button');

  await snap.request({
    method: 'snap_updateInterface',
    params: {
      id,
      ui: (
        <Box>
          <Text>Footer button was pressed</Text>
        </Box>
      ),
    },
  });
};
