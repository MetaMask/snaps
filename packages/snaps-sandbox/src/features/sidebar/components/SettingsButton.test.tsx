import { describe, it, expect } from 'vitest';

import { SettingsButton } from './SettingsButton';
import { render } from '../../../test-utils';

describe('SettingsButton', () => {
  it('renders the settings button', () => {
    const { getByText } = render(<SettingsButton />);

    expect(getByText('Settings')).toBeInTheDocument();
  });
});
