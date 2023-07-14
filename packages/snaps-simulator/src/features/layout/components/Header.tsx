import { Container, Stack } from '@chakra-ui/react';
import type { FunctionComponent } from 'react';

import { Logo } from '../../../components';
import { Configuration } from '../../configuration';
import { StatusIndicator } from '../../status';

export const Header: FunctionComponent = () => (
  <Container
    as="header"
    size="fullWidth"
    borderBottom="muted"
    display="flex"
    flexDirection="row"
    justifyContent="space-between"
  >
    <Stack direction="row" height="7" align="center">
      <Logo />
    </Stack>
    <Stack direction="row" height="7" align="center">
      <StatusIndicator />
      <Configuration />
    </Stack>
  </Container>
);
