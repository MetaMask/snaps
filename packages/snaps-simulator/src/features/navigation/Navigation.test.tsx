import { render } from '../../utils';
import { Navigation } from './Navigation';

describe('Navigation', () => {
  it('renders', () => {
    expect(() => render(<Navigation />)).not.toThrow();
  });
});
