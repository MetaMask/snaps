import { fireEvent } from '@testing-library/dom';
import { act } from '@testing-library/react';
import { createStore } from 'jotai';
import { describe, it, expect } from 'vitest';

import { Settings } from './Settings';
import { settingsAtom } from '../../../state';
import { render } from '../../../test-utils';

describe('Settings', () => {
  it('renders the settings component', () => {
    const { getByText } = render(<Settings />);

    expect(getByText('Settings')).toBeInTheDocument();
  });

  it('renders the settings items in the modal', async () => {
    const { getByText } = render(<Settings />);

    const button = getByText('Settings');
    await act(async () => act(() => fireEvent.click(button)));

    expect(getByText('Custom Snap ID')).toBeInTheDocument();
    expect(getByText('Use current Snap ID')).toBeInTheDocument();
  });

  it('updates the snap ID in the state', async () => {
    const store = createStore();
    const { getByText, getByLabelText } = render(<Settings />, { store });

    const button = getByText('Settings');
    await act(async () => act(() => fireEvent.click(button)));

    const input = getByLabelText('Custom Snap ID');
    await act(() =>
      fireEvent.change(input, { target: { value: 'new-snap-id' } }),
    );

    expect(input).toHaveValue('new-snap-id');
    expect(store.get(settingsAtom)).toHaveProperty('snapId', 'new-snap-id');
  });

  it('toggles the "Use current Snap ID" option in the state', async () => {
    const store = createStore();
    store.set(settingsAtom, {
      snapId: 'current-snap-id',
      useCurrentSnapId: false,
    });

    const { getByText, getByLabelText } = render(<Settings />, { store });

    const button = getByText('Settings');
    await act(async () => act(() => fireEvent.click(button)));

    const checkbox = getByLabelText('Use current Snap ID');
    await act(async () => await act(() => fireEvent.click(checkbox)));

    expect(checkbox).toBeChecked();
    expect(store.get(settingsAtom)).toHaveProperty('useCurrentSnapId', true);
  });
});
