import { Box } from '@metamask/snaps-sdk/jsx';

import { render } from '../../utils';
import { PromptDialog } from './PromptDialog';

describe('PromptDialog', () => {
  it('renders', () => {
    expect(() =>
      render(
        <PromptDialog
          snapName="foo-snap"
          snapId="local:http://localhost:8000"
          content={Box({ children: null })}
        />,
      ),
    ).not.toThrow();
  });
});
