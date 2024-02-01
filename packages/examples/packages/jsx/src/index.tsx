import { Panel, Heading, Text } from '@metamask/snaps-sdk/jsx-runtime';

export const onHomePage = async () => {
  return {
    content: (
      <>
        <Panel>
          <Heading>Hello world!</Heading>
          <Text>Welcome to my Snap home page!</Text>
        </Panel>
      </>
    ),
  };
};
