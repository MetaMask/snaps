import { describe, it, expect } from 'vitest';

import { InstallFlaskButton } from './InstallFlaskButton';
import { render } from '../test-utils';

describe('InstallFlaskButton', () => {
  it('renders the install button', () => {
    const { getByText } = render(<InstallFlaskButton />);

    expect(getByText('Install MetaMask Flask')).toBeInTheDocument();
  });
});
