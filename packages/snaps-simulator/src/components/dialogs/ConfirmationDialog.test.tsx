import { panel } from '@metamask/snaps-ui';

import { render } from '../../utils';
import { ConfirmationDialog } from './ConfirmationDialog';

describe('ConfirmationDialog', () => {
  it('renders', () => {
    expect(() =>
      render(
        <ConfirmationDialog
          snapName="foo-snap"
          snapId="local:http://localhost:8000"
          node={panel([])}
        />,
      ),
    ).not.toThrow();
  });
});
