import {
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
} from '@chakra-ui/react';
import { HandlerType } from '@metamask/snaps-utils';
import type { FunctionComponent } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { Editor } from '../../../../components';
import { useDispatch, useSelector } from '../../../../hooks';
import { sendRequest } from '../../../simulation';
import { SAMPLE_JSON_RPC_REQUEST } from '../schema';
import { getJsonRpcRequest } from '../slice';

type JsonRpcFormData = {
  origin: string;
  request: string;
};

export const Request: FunctionComponent = () => {
  const { request, origin } = useSelector(getJsonRpcRequest);
  const {
    handleSubmit,
    register,
    control,
    formState: { errors },
  } = useForm<JsonRpcFormData>({
    defaultValues: {
      origin: origin ?? '',
      request: request
        ? JSON.stringify(request, null, 2)
        : SAMPLE_JSON_RPC_REQUEST,
    },
  });

  const dispatch = useDispatch();

  const onSubmit = (data: JsonRpcFormData) => {
    dispatch(
      sendRequest({
        origin: data.origin,
        handler: HandlerType.OnRpcRequest,
        request: JSON.parse(data.request),
      }),
    );
  };

  return (
    <Flex
      as="form"
      flexDirection="column"
      flex="1"
      /* eslint-disable-next-line @typescript-eslint/no-misused-promises */
      onSubmit={handleSubmit(onSubmit)}
      id="request-form"
    >
      <FormControl isInvalid={Boolean(errors.origin)}>
        <FormLabel htmlFor="origin">Origin</FormLabel>
        <Input
          id="origin"
          placeholder="metamask.io"
          fontFamily="code"
          data-testid="request-origin"
          {...register('origin')}
        />
        <FormErrorMessage>{errors.origin?.message}</FormErrorMessage>
      </FormControl>

      <FormControl
        isInvalid={Boolean(errors.request)}
        display="flex"
        flexDirection="column"
        flex="1"
      >
        <FormLabel htmlFor="request" data-testid="request-json">
          Request
        </FormLabel>
        <Controller
          control={control}
          name="request"
          render={({ field: { onChange, value } }) => (
            <Editor onChange={onChange} value={value} />
          )}
        />
      </FormControl>
    </Flex>
  );
};
