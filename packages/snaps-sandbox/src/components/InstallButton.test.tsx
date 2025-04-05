import { fireEvent } from '@testing-library/dom';
import { describe, it, expect, vi } from 'vitest';

import { InstallButton } from './InstallButton';
import * as useInstallModule from '../hooks/useInstall';
import { render } from '../test-utils';

vi.mock('../hooks/useInstall');

describe('InstallButton', () => {
  it('renders the install button', () => {
    vi.spyOn(useInstallModule, 'useInstall').mockReturnValue({
      install: vi.fn(),
      loading: false,
    });

    const { getByText } = render(<InstallButton />);

    expect(getByText('Install Snap')).toBeInTheDocument();
  });

  it('calls the install function when clicked', () => {
    const install = vi.fn();
    vi.spyOn(useInstallModule, 'useInstall').mockReturnValue({
      install,
      loading: false,
    });

    const { getByText } = render(<InstallButton />);

    const button = getByText('Install Snap');
    fireEvent.click(button);

    expect(install).toHaveBeenCalled();
  });
});
