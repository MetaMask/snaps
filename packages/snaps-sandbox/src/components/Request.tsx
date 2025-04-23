import { Flex } from '@chakra-ui/react';
import { useAtom } from 'jotai';
import type { FunctionComponent } from 'react';

import { Editor } from './Editor';
import { requestAtom } from '../state';

/**
 * A component that displays the request editor and the request button.
 *
 * @returns The request component.
 */
export const Request: FunctionComponent = () => {
  const [value, setValue] = useAtom(requestAtom);

  const handleChange = (newValue: string | undefined) => {
    if (newValue) {
      setValue(newValue);
    }
  };

  return (
    <Flex height="100%" direction="column" gap="2" padding="2">
      <Editor height="100%" value={value} onChange={handleChange} />
    </Flex>
  );
};
