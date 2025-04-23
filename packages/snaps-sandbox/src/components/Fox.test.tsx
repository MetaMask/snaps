import { screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { Fox } from './Fox';
import { render } from '../test-utils';

describe('Fox', () => {
  it('renders the MetaMask fox logo', async () => {
    render(<Fox />);

    expect(screen.getByAltText('MetaMask logo')).toBeInTheDocument();
  });
});
