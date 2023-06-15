import { render } from '../utils';
import { Icon } from './Icon';

describe('Icon', () => {
  it('renders', () => {
    expect(() => render(<Icon icon="arrowRight" />)).not.toThrow();
  });
});
