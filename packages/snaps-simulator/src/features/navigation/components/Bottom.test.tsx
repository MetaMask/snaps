import { render } from '../../../utils';
import { Bottom } from './Bottom';

describe('Bottom', () => {
  it('renders', () => {
    expect(() => render(<Bottom />)).not.toThrow();
  });
});
