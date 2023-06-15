import { panel } from '@metamask/snaps-ui';

import { render } from '../../utils';
import { PromptDialog } from './PromptDialog';

describe('PromptDialog', () => {
  it('renders', () => {
    expect(() =>
      render(
        <PromptDialog
          snapName="foo-snap"
          snapId="local:http://localhost:8000"
          node={panel([])}
        />,
      ),
    ).not.toThrow();
  });
});
