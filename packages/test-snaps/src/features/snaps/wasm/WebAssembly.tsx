import type { FunctionComponent } from 'react';

import { Snap } from '../../../components';
import { FibonacciInput } from './components';
import { WASM_SNAP_ID, WASM_SNAP_PORT } from './constants';

export const WASM: FunctionComponent = () => {
  return (
    <Snap
      name="WebAssembly Snap"
      snapId={WASM_SNAP_ID}
      port={WASM_SNAP_PORT}
      testId="wasm"
    >
      <FibonacciInput />
    </Snap>
  );
};
