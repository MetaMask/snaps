import { Center, Heading, Text, Box, Skeleton } from '@chakra-ui/react';
import { HandlerType } from '@metamask/snaps-utils';

import { Delineator, Editor, Icon, Window } from '../../../components';
import { useSelector, useHandler } from '../../../hooks';
import { getSnapId } from '../../configuration';
import { Renderer } from '../../renderer';
import { getSnapName } from '../../simulation';

export const Response = () => {
  const handler = useHandler();
  const response = useSelector((state) => state[handler].response);
  const snapId = useSelector(getSnapId);
  const snapName = useSelector(getSnapName) as string;

  if (!response) {
    return (
      <Center
        background="background.alternative"
        flex="1"
        flexDirection="column"
      >
        <Icon icon="computer" width="34px" height="auto" marginBottom="1.5" />
        <Heading
          as="h3"
          fontSize="sm"
          fontWeight="700"
          color="text.muted"
          marginBottom="1"
        >
          No response yet
        </Heading>
        <Text fontSize="xs" textAlign="center" color="text.muted">
          Create a request via the
          <br />
          left-side config to get started.
        </Text>
      </Center>
    );
  }

  // TODO: Fix this type cast.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  const content = (response as any).result?.content;

  if (handler === HandlerType.OnTransaction && content) {
    return (
      <Box margin="4">
        <Window snapName={snapName} snapId={snapId} showAuthorship={false}>
          <Box margin="4" flex="1">
            <Skeleton height="38px" mb="4" speed={3} />
            <Skeleton height="285px" mb="4" speed={3} />
            <Delineator snapName={snapName}>
              <Renderer node={content} />
            </Delineator>
          </Box>
        </Window>
      </Box>
    );
  }

  return (
    <Editor
      border="none"
      value={JSON.stringify(response, null, 2)}
      options={{ readOnly: true, wordWrap: 'on' }}
    />
  );
};
