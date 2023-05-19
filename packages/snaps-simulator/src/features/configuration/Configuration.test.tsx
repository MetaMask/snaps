import { render } from '../../utils';
import { Configuration } from './Configuration';

describe('Configuration', () => {
  it('renders', () => {
    expect(() => render(<Configuration />)).not.toThrow();
  });
});
