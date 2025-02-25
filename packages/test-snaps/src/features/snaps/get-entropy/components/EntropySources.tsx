import type { EntropySource } from '@metamask/snaps-sdk';
import type { ChangeEvent, FunctionComponent } from 'react';

import { Result } from '../../../../components';
import { useEntropySources } from '../hooks';

export type EntropySourcesProps = {
  onChange: (source: string) => void;
};

/**
 * Get the name of the source.
 *
 * @param source - The source.
 * @returns The name of the source.
 */
function getSourceName(source: EntropySource) {
  const name = source.name.length === 0 ? source.id : source.name;

  if (source.primary) {
    return `${name} (primary)`;
  }

  return name;
}

export const EntropySources: FunctionComponent<EntropySourcesProps> = ({
  onChange,
}) => {
  const entropySources = useEntropySources();

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    onChange(event.target.value);
  };

  return (
    <>
      <h3 className="h5">Entropy source</h3>
      <select
        id="select-chain"
        className="form-select mb-3"
        onChange={handleChange}
      >
        <option value="" disabled={true}>
          Select an entropy source
        </option>
        {entropySources?.map((source) => (
          <option key={source.id} value={source.id}>
            {getSourceName(source)}
          </option>
        ))}
      </select>
      <Result className="mb-3">
        <pre id="entropySourcesResult" style={{ margin: 0 }}>
          {JSON.stringify(entropySources, null, 2)}
        </pre>
      </Result>
    </>
  );
};
