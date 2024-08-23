import {
  assert,
  DialogType,
  UserInputEventType,
  type OnHomePageHandler,
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
 * Handle incoming home page requests from the MetaMask clients.
 *
 * @returns A static panel rendered with custom UI.
 * @see https://docs.metamask.io/snaps/reference/exports/#onhomepage
 */
export const onHomePage: OnHomePageHandler = async () => {
  return {
    content: (
      <Container>
        <Box>
          <Heading>Hello world!</Heading>
          <Text>Welcome to my Snap home page!</Text>
        </Box>
        <Footer>
          <Button name="open_dialog">Open a dialog</Button>
        </Footer>
      </Container>
    ),
  };
};

/**
 * Handle incoming user events coming from the Snap interface. This handler
 * handles one event:
 *
 * - `open_dialog`: Opens a dialog window. It is triggered when the user clicks the home footer button.
 *
 * @param params - The event parameters.
 * @param params.event - The event object containing the event type, name and
 * value.
 * @see https://docs.metamask.io/snaps/reference/exports/#onuserinput
 */
export const onUserInput: OnUserInputHandler = async ({ event }) => {
  // Since this Snap only has one event, we can assert the event type and name
  // directly.
  assert(event.type === UserInputEventType.ButtonClickEvent);
  assert(event.name === 'open_dialog');

  await snap.request({
    method: 'snap_dialog',
    params: {
      type: DialogType.Alert,
      content: (
        <Box>
          <Text>Hello from a dialog!</Text>
        </Box>
      ),
    },
  });
};
