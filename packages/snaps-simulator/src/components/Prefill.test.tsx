import { render } from '../utils';
import { Prefill } from './Prefill';

describe('Prefill', () => {
  it('renders', () => {
    expect(() => render(<Prefill>Prefill</Prefill>)).not.toThrow();
  });
});
