import { render } from '../../utils';
import { StatusIndicator } from './StatusIndicator';

describe('StatusIndicator', () => {
  it('renders', () => {
    expect(() => render(<StatusIndicator />)).not.toThrow();
  });
});
