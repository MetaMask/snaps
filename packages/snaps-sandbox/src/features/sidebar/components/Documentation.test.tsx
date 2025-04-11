import { describe, it, expect } from 'vitest';

import { Documentation } from './Documentation';
import { render } from '../../../test-utils';

describe('Documentation', () => {
  it('renders the documentation button', () => {
    const { getByText } = render(<Documentation />);

    expect(getByText('Documentation')).toBeInTheDocument();
  });
});
