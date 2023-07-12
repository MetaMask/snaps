import { Divider as ChakraDivider } from '@chakra-ui/react';
import type { FunctionComponent } from 'react';

export type DividerProps = {
  id: string;
  node: unknown;
};

export const Divider: FunctionComponent<DividerProps> = ({ id }) => (
  <ChakraDivider
    orientation="horizontal"
    marginTop="3"
    marginBottom="4"
    borderColor="border.default"
    key={`${id}-divider`}
  />
);
