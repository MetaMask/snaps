import { render } from '../../../utils';
import { Handler } from './Handler';

describe('Handler', () => {
  it('renders', () => {
    expect(() => render(<Handler />, '/handler/onRpcRequest')).not.toThrow();
  });
});
