import { render } from '../../../../utils';
import { Request } from './Request';

jest.mock('react-monaco-editor');

describe('Request', () => {
  it('renders', () => {
    expect(() => render(<Request />)).not.toThrow();
  });
});
