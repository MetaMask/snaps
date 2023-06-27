import { FunctionComponent } from 'react';

import { Snap } from '../../components';
import { FibonacciInput } from './FibonacciInput';

export const SNAP_ID = 'npm:@metamask/test-snap-wasm';
export const SNAP_PORT = 8009;

export const WebAssembly: FunctionComponent = () => {
  return (
    <Snap
      name="WebAssembly Snap"
      snapId={SNAP_ID}
      port={SNAP_PORT}
      testId="WasmSnap"
    >
      <FibonacciInput />
    </Snap>
  );
};
