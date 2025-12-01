import { CaipChainId } from '@metamask/utils';
import type { ChangeEvent, FunctionComponent } from 'react';

export type SwitchChainProps = {
  onChange: (chainId: CaipChainId) => void;
};

export const SwitchChain: FunctionComponent<SwitchChainProps> = ({
  onChange,
}) => {
  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    onChange(event.target.value as CaipChainId);
  };

  return (
    <>
      <h3 className="h5">Select chain</h3>
      <select
        id="select-chain"
        className="form-select mb-3"
        onChange={handleChange}
      >
        <option value="eip155:1">Ethereum</option>
        <option value="eip155:59144">Linea</option>
        <option value="eip155:11155111">Sepolia</option>
        <option value="bip122:000000000019d6689c085ae165831e93">Bitcoin</option>
        <option value="solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp">Solana</option>
      </select>
    </>
  );
};
