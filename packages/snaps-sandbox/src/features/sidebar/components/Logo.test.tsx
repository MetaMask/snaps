import { describe, it, expect } from 'vitest';

import { Logo } from './Logo';
import { render } from '../../../test-utils';

describe('Logo', () => {
  it('renders the logo', () => {
    const { getByAltText, getByText } = render(<Logo />);

    expect(getByAltText('MetaMask Logo')).toBeInTheDocument();
    expect(getByText('Snaps Sandbox')).toBeInTheDocument();
  });
});
