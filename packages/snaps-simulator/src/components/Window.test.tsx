import { render } from '../utils';
import { Window } from './Window';

describe('Window', () => {
  it('renders', () => {
    expect(() =>
      render(
        <Window snapName="foo-snap" snapId="local:http://localhost:8000">
          Foo
        </Window>,
      ),
    ).not.toThrow();
  });
});
