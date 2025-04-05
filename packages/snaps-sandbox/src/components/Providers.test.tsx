import { describe, it, expect } from 'vitest';

import { Providers } from './Providers';
import { render } from '../test-utils';

describe('Providers', () => {
  it('renders the children', () => {
    const { getByText } = render(
      <Providers>
        <div>Test</div>
      </Providers>,
    );

    expect(getByText('Test')).toBeInTheDocument();
  });
});
