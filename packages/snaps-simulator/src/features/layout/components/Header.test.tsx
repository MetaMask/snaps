import { render } from '../../../utils';
import { Header } from './Header';

describe('Header', () => {
  it('renders', () => {
    expect(() => render(<Header />)).not.toThrow();
  });
});
