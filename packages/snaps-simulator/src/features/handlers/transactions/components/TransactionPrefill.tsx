import type { FunctionComponent } from 'react';

import { Prefill } from '../../../../components';
import type { TransactionFormData } from '../utils';

export type TransactionPrefillProps = TransactionFormData & {
  name: string;
  onClick: (prefill: TransactionFormData) => void;
};

export const TransactionPrefill: FunctionComponent<TransactionPrefillProps> = ({
  name,
  onClick,
  ...transaction
}) => {
  const handleClick = () => {
    onClick(transaction);
  };

  return (
    <Prefill cursor="pointer" onClick={handleClick}>
      {name}
    </Prefill>
  );
};
