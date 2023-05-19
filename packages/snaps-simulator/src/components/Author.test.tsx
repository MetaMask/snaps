import { render } from '../utils';
import { Author } from './Author';

describe('Author', () => {
  it('renders', () => {
    expect(() =>
      render(
        <Author snapName="foo-snap" snapId="local:http://localhost:8000" />,
      ),
    ).not.toThrow();
  });
});
