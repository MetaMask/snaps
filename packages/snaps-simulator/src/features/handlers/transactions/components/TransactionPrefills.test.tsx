import { render } from '../../../../utils';
import { TransactionPrefills } from './TransactionPrefills';

describe('TransactionPrefills', () => {
  it('renders', () => {
    expect(() =>
      render(<TransactionPrefills onClick={jest.fn()} />),
    ).not.toThrow();
  });
});
