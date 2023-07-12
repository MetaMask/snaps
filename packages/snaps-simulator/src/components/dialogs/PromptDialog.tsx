import { Box, Button, Flex, FormControl, Input } from '@chakra-ui/react';
import type { Component } from '@metamask/snaps-ui';
import type { FunctionComponent } from 'react';
import { useForm } from 'react-hook-form';

import { Renderer } from '../../features/renderer';
import { Delineator } from '../Delineator';
import { Window } from '../Window';

export type PromptDialogProps = {
  snapName: string;
  snapId: string;
  placeholder?: string;
  node: Component;
  onCancel?: () => void;
  onSubmit?: (value: string) => void;
};

type PromptForm = {
  value: string;
};

/**
 * Snap prompt dialog.
 *
 * @param props - The component props.
 * @param props.snapName - The snap name.
 * @param props.snapId - The snap ID.
 * @param props.placeholder - The placeholder text.
 * @param props.node - The component to render.
 * @param props.onCancel - The cancel callback.
 * @param props.onSubmit - The submit callback. The value is passed as the first
 * argument.
 * @returns The component.
 */
export const PromptDialog: FunctionComponent<PromptDialogProps> = ({
  snapName,
  snapId,
  placeholder,
  node,
  onCancel,
  onSubmit,
}) => {
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<PromptForm>({
    defaultValues: {
      value: '',
    },
  });

  const onFormSubmit = (data: PromptForm) => {
    onSubmit?.(data.value);
  };

  return (
    <Window snapName={snapName} snapId={snapId}>
      <Box margin="4" marginTop="0" flex="1">
        <Delineator snapName={snapName}>
          <Renderer node={node} />
          {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
          <form onSubmit={handleSubmit(onFormSubmit)} id="prompt-form">
            <FormControl
              marginTop="3"
              isInvalid={Boolean(errors.value)}
              /* eslint-disable-next-line @typescript-eslint/naming-convention */
              sx={{ '& input': { marginBottom: '0' } }}
            >
              <Input placeholder={placeholder} {...register('value')} />
            </FormControl>
          </form>
        </Delineator>
      </Box>
      <Flex
        borderTop="1px solid"
        borderTopColor="border.default"
        paddingTop="4"
        paddingX="4"
        gap="4"
      >
        <Button variant="outline" flex="1" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" form="prompt-form" variant="primary" flex="1">
          Submit
        </Button>
      </Flex>
    </Window>
  );
};
