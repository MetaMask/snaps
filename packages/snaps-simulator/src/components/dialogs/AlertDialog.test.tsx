import { Box } from '@metamask/snaps-sdk/jsx';

import { render } from '../../utils';
import { AlertDialog } from './AlertDialog';

describe('AlertDialog', () => {
  it('renders', () => {
    expect(() =>
      render(
        <AlertDialog
          snapName="foo-snap"
          snapId="local:http://localhost:8000"
          content={Box({ children: null })}
        />,
      ),
    ).not.toThrow();
  });
});
