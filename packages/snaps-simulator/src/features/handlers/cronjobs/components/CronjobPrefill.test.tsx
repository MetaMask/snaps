import { render } from '../../../../utils';
import { CronjobPrefill } from './CronjobPrefill';

describe('CronjobPrefill', () => {
  it('renders', () => {
    expect(() =>
      render(<CronjobPrefill method="foo" params="bar" onClick={jest.fn()} />),
    ).not.toThrow();
  });
});
