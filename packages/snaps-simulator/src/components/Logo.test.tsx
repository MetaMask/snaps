import { render } from '../utils';
import { Logo } from './Logo';

describe('Logo', () => {
  it('renders', () => {
    expect(() => render(<Logo />)).not.toThrow();
  });
});
