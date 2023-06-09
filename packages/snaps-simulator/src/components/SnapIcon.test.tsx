import { render } from '../utils';
import { SnapIcon } from './SnapIcon';

describe('SnapIcon', () => {
  it('renders', () => {
    expect(() => render(<SnapIcon snapName="foo-snap" />)).not.toThrow();
  });
});
