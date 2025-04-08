import type { FunctionComponent } from 'react';

import { Editor } from './Editor';
import { useResponse } from '../hooks';

/**
 * A component that displays the response from the Snap.
 *
 * @returns The response component.
 */
export const Response: FunctionComponent = () => {
  const response = useResponse();

  return (
    <Editor
      height="100%"
      value={JSON.stringify(response, null, '\t')}
      options={{
        domReadOnly: true,
        lineNumbers: 'off',
        readOnly: true,
      }}
    />
  );
};
