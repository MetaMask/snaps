import { render } from '../../../../utils';
import { TRANSACTION_PRESETS } from '../presets';
import { TransactionPrefill } from './TransactionPrefill';

describe('TransactionPrefill', () => {
  it('renders', () => {
    expect(() =>
      render(
        <TransactionPrefill
          name="ERC-20"
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          {...TRANSACTION_PRESETS[0]!.transaction}
          onClick={jest.fn()}
        />,
      ),
    ).not.toThrow();
  });
});
