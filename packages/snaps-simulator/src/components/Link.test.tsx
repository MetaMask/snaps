import { render } from '../utils';
import { Link } from './Link';

describe('Link', () => {
  it('renders', () => {
    expect(() => render(<Link to="foo" />)).not.toThrow();
  });
});
