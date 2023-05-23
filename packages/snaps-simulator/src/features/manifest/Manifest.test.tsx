import { render } from '../../utils';
import { Manifest } from './Manifest';

jest.mock('react-monaco-editor');

describe('Manifest', () => {
  it('renders', () => {
    expect(() => render(<Manifest />)).not.toThrow();
  });
});
