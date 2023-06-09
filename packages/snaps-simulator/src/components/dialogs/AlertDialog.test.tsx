import { panel } from '@metamask/snaps-ui';

import { render } from '../../utils';
import { AlertDialog } from './AlertDialog';

describe('AlertDialog', () => {
  it('renders', () => {
    expect(() =>
      render(
        <AlertDialog
          snapName="foo-snap"
          snapId="local:http://localhost:8000"
          node={panel([])}
        />,
      ),
    ).not.toThrow();
  });
});
