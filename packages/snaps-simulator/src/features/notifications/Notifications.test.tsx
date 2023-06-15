import { render } from '../../utils';
import { Notifications } from './Notifications';

describe('Notifications', () => {
  it('renders', () => {
    expect(() => render(<Notifications />)).not.toThrow();
  });
});
