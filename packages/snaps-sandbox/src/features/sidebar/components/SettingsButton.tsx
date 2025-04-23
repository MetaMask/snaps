import type { ButtonProps } from '@chakra-ui/react';
import { Button, Stack, Text } from '@chakra-ui/react';
import { forwardRef } from 'react';
import { FiSettings } from 'react-icons/fi';

export type SettingsButtonProps = ButtonProps;

export const SettingsButton = forwardRef<
  HTMLButtonElement,
  SettingsButtonProps
>((props, ref) => {
  return (
    <Button
      ref={ref}
      variant="plain"
      gap="3"
      justifyContent="flex-start"
      {...props}
    >
      <FiSettings />
      <Stack alignItems="flex-start">
        <Text>Settings</Text>
        <Text variant="muted">Configure the sandbox settings</Text>
      </Stack>
    </Button>
  );
});
