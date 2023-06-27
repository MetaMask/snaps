import { FunctionComponent } from 'react';

import { FibonacciInput } from './components';
import { WASM_SNAP_ID, WASM_SNAP_PORT } from './constants';
import { Snap } from '../../../components';

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
