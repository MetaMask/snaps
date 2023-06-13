import { render } from '../../../utils';
import { Response } from './Response';

describe('Response', () => {
  it('renders', () => {
    expect(() => render(<Response />, '/handler/onRpcRequest')).not.toThrow();
  });
});
