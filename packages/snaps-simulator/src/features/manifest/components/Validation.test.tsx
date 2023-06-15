import { render } from '../../../utils';
import { Validation } from './Validation';

describe('Validation', () => {
  it('renders', () => {
    expect(() => render(<Validation />)).not.toThrow();
  });
});
