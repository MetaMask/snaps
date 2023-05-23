import { render } from '../../../utils';
import { History } from './History';

describe('History', () => {
  it('renders', () => {
    expect(() => render(<History />, '/handler/onRpcRequest')).not.toThrow();
  });
});
