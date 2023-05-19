import { render } from '../../../../utils';
import { CronjobPrefills } from './CronjobPrefills';

describe('CronjobPrefills', () => {
  it('renders', () => {
    expect(() => render(<CronjobPrefills onClick={jest.fn()} />)).not.toThrow();
  });
});
