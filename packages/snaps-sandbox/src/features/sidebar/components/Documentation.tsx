import { Button, Stack, Text } from '@chakra-ui/react';
import type { FunctionComponent } from 'react';
import { FiBook } from 'react-icons/fi';

export const Documentation: FunctionComponent = () => {
  return (
    <Button variant="plain" gap="3" justifyContent="flex-start" asChild={true}>
      <a
        href="https://docs.metamask.io/snaps"
        target="_blank"
        rel="noopener noreferrer"
      >
        <FiBook />
        <Stack alignItems="flex-start">
          <Text>Documentation</Text>
          <Text variant="muted">View the Snaps documentation</Text>
        </Stack>
      </a>
    </Button>
  );
};
