import type { Json } from '@metamask/utils';
import type { FunctionComponent } from 'react';

import { Prefill } from '../../../../components/Prefill';

export type CronjobData = {
  method: string;
  params?: Json | undefined;
};

export type CronjobPrefillProps = CronjobData & {
  onClick: (prefill: CronjobData) => void;
};

export const CronjobPrefill: FunctionComponent<CronjobPrefillProps> = ({
  method,
  params,
  onClick,
}) => {
  const handleClick = () => {
    onClick({ method, params });
  };

  return (
    <Prefill cursor="pointer" onClick={handleClick}>
      {method}
    </Prefill>
  );
};
