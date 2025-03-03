import type { EntropySource } from '@metamask/snaps-sdk';
import type { ChangeEvent, FunctionComponent } from 'react';

import { Result } from '../../../../components';

export type EntropySourcesProps = {
  sources: EntropySource[];
  id: string;
  raw?: boolean | undefined;
  onChange: (source: string | undefined) => void;
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

export const EntropySelector: FunctionComponent<EntropySourcesProps> = ({
  sources,
  id,
  raw,
  onChange,
}) => {
  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    if (event.target.value === '') {
      onChange(undefined);
      return;
    }

    onChange(event.target.value);
  };

  return (
    <>
      <h3 className="h6">Entropy source</h3>
      <select
        id={`${id}-entropy-selector`}
        className="form-select mb-3"
        onChange={handleChange}
      >
        <option value="">None</option>
        {sources.map((source) => (
          <option key={source.id} value={source.id}>
            {getSourceName(source)}
          </option>
        ))}
        <option value="invalid">Invalid</option>
      </select>
      {raw && (
        <Result className="mb-3">
          <pre id={`${id}-raw-entropy-sources`} style={{ margin: 0 }}>
            {JSON.stringify(sources, null, 2)}
          </pre>
        </Result>
      )}
    </>
  );
};
