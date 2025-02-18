import { TransactionPrefill } from './TransactionPrefill';
import { render } from '../../../../utils';
import { TRANSACTION_PRESETS } from '../presets';

describe('TransactionPrefill', () => {
  it('renders', () => {
    expect(() =>
      render(
        <TransactionPrefill
          name="ERC-20"
          {...TRANSACTION_PRESETS[0].transaction}
          onClick={jest.fn()}
        />,
      ),
    ).not.toThrow();
  });
});
