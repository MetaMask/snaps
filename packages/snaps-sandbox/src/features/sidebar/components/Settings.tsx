import {
  Dialog,
  Field,
  Fieldset,
  Heading,
  Input,
  Switch,
} from '@chakra-ui/react';
import { useAtom } from 'jotai';
import type { ChangeEvent, FunctionComponent } from 'react';

import { SettingsButton } from './SettingsButton';
import { LOCAL_SNAP_ID } from '../../../constants';
import { settingsAtom } from '../../../state';

type CheckedChangeDetails = Parameters<
  Exclude<Switch.RootProps['onCheckedChange'], undefined>
>[0];

export const Settings: FunctionComponent = () => {
  const [settings, setSettings] = useAtom(settingsAtom);

  const handleChangeSnapId = (event: ChangeEvent<HTMLInputElement>) => {
    setSettings((previous) => {
      return {
        ...previous,
        snapId: event.target.value,
      };
    });
  };

  const handleChangeCurrent = ({ checked }: CheckedChangeDetails) => {
    setSettings((previous) => ({
      ...previous,
      useCurrentSnapId: checked,
    }));
  };

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild={true}>
        <SettingsButton />
      </Dialog.Trigger>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content>
          <Dialog.CloseTrigger />
          <Dialog.Header>
            <Dialog.Title>Settings</Dialog.Title>
          </Dialog.Header>
          <Dialog.Body>
            <Fieldset.Root>
              <Fieldset.Legend>
                <Heading as="h3" size="md">
                  Snap ID
                </Heading>
              </Fieldset.Legend>
              <Fieldset.HelperText>
                Specify a custom Snap ID or use the current one.
              </Fieldset.HelperText>

              <Fieldset.Content gap="8">
                <Field.Root disabled={settings.useCurrentSnapId}>
                  <Field.Label>Custom Snap ID</Field.Label>
                  <Input
                    defaultValue={settings.snapId ?? LOCAL_SNAP_ID}
                    onChange={handleChangeSnapId}
                  />
                </Field.Root>

                <Field.Root
                  flexDirection="row"
                  justifyContent="space-between"
                  gap="2"
                >
                  <Field.Label>Use current Snap ID</Field.Label>
                  <Switch.Root
                    checked={settings.useCurrentSnapId}
                    onCheckedChange={handleChangeCurrent}
                  >
                    <Switch.HiddenInput />
                    <Switch.Control>
                      <Switch.Thumb />
                    </Switch.Control>
                    <Switch.Label />
                  </Switch.Root>
                </Field.Root>
              </Fieldset.Content>
            </Fieldset.Root>
          </Dialog.Body>
          <Dialog.Footer />
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
};
