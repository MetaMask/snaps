import { Box, Container, Grid, Heading, HStack } from '@chakra-ui/react';
import type { FunctionComponent } from 'react';

import { Request } from './Request';
import { RequestButton } from './RequestButton';
import { Response } from './Response';

/**
 * The main component of the Snaps Sandbox.
 *
 * @returns The main component.
 */
export const Sandbox: FunctionComponent = () => {
  return (
    <Container width="10/12">
      <Grid
        templateColumns="1fr 1fr"
        templateRows="auto 1fr"
        gap="4"
        height="100%"
      >
        <HStack gap="3">
          <Heading as="h3" size="lg">
            Request
          </Heading>
          <RequestButton />
        </HStack>

        <Heading as="h3" size="lg">
          Response
        </Heading>

        <Box
          height="100%"
          borderRightWidth="1px"
          borderRightStyle="solid"
          borderColor="gray.200"
        >
          <Request />
        </Box>

        <Response />
      </Grid>
    </Container>
  );
};
