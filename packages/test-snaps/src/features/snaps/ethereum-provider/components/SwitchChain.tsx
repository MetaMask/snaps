import type { ChangeEvent, FunctionComponent } from 'react';

export type SwitchChainProps = {
  onChange: (chainId: number) => void;
};

export const SwitchChain: FunctionComponent<SwitchChainProps> = ({
  onChange,
}) => {
  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    onChange(Number(event.target.value));
  };

  return (
    <>
      <h3 className="h5">Select chain</h3>
      <select
        id="select-chain"
        className="form-select mb-3"
        onChange={handleChange}
      >
        <option value="1">Ethereum</option>
        <option value="59144">Linea</option>
        <option value="11155111">Sepolia</option>
      </select>
    </>
  );
};
