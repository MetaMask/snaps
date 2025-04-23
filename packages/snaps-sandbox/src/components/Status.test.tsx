import { act } from '@testing-library/react';
import { createStore } from 'jotai';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { Status } from './Status';
import { LOCAL_SNAP_ID } from '../constants';
import { useSnaps } from '../hooks';
import { settingsAtom } from '../state';
import { render } from '../test-utils';

vi.mock('../hooks');

describe('Status', () => {
  beforeEach(() => {
    vi.mocked(useSnaps).mockReturnValue({
      loading: false,
      snaps: [],
    });
  });

  it('renders the status component', async () => {
    const { getByText } = await act(() => render(<Status />));

    expect(getByText('local:http...lhost:3000')).toBeInTheDocument();
  });

  it('renders "No" if the Snap is not connected', async () => {
    const { getByText } = await act(() => render(<Status />));

    expect(getByText('No')).toBeInTheDocument();
  });

  it('renders "Yes" if the Snap is connected', async () => {
    vi.mocked(useSnaps).mockReturnValue({
      loading: false,
      snaps: [LOCAL_SNAP_ID],
    });

    const { getByText } = await act(() => render(<Status />));

    expect(getByText('Yes')).toBeInTheDocument();
  });

  it(`renders the full snap ID if it's less than 20 characters`, async () => {
    const store = createStore();
    store.set(settingsAtom, {
      snapId: 'npm:short-id',
      useCurrentSnapId: false,
    });

    vi.mocked(useSnaps).mockReturnValue({
      loading: false,
      snaps: ['local:http://localhost:3000'],
    });

    const { getAllByText } = await act(() => render(<Status />));

    expect(getAllByText('npm:short-id')).toHaveLength(2);
  });
});
