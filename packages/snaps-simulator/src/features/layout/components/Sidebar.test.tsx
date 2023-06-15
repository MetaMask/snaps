import { render } from '../../../utils';
import { Sidebar } from './Sidebar';

describe('Sidebar', () => {
  it('renders', () => {
    expect(() => render(<Sidebar />)).not.toThrow();
  });
});
