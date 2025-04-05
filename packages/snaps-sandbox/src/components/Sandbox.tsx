import { Box, Container, Grid, Heading } from '@chakra-ui/react';
import type { FunctionComponent } from 'react';

import { Request } from './Request';
import { Response } from './Response';

/**
 * The main component of the Snaps Sandbox.
 *
 * @returns The main component.
 */
export const Sandbox: FunctionComponent = () => {
  return (
    <Container width="10/12">
      <Grid templateColumns="1fr 1fr" gap="4">
        <Heading as="h3" size="sm" color="gray.500">
          Request
        </Heading>

        <Heading as="h3" size="sm" color="gray.500">
          Response
        </Heading>

        <Box
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
