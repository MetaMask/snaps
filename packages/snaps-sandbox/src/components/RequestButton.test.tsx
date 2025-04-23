import { act, fireEvent } from '@testing-library/react';
import { createStore } from 'jotai';
import { describe, it, expect, vi } from 'vitest';

import { RequestButton } from './RequestButton';
import { LOCAL_SNAP_ID, SAMPLE_JSON_RPC_REQUEST } from '../constants';
import * as hooks from '../hooks';
import { providerAtom, requestAtom } from '../state';
import { render } from '../test-utils';

vi.mock('../hooks');

describe('RequestButton', () => {
  it('renders the install button when the provider is not available', async () => {
    vi.spyOn(hooks, 'useSnaps').mockReturnValue({
      loading: false,
      snaps: [],
    });

    vi.spyOn(hooks, 'useRequest').mockReturnValue({
      loading: false,
      data: null,
      request: vi.fn(),
    });

    const { getByText } = await act(() => render(<RequestButton />));

    expect(getByText('Install MetaMask Flask')).toBeInTheDocument();
  });

  it('renders the install Snap button when the installed Snaps are loading', () => {
    vi.spyOn(hooks, 'useSnaps').mockReturnValue({
      loading: true,
      snaps: [],
    });

    vi.spyOn(hooks, 'useRequest').mockReturnValue({
      loading: false,
      data: null,
      request: vi.fn(),
    });

    vi.spyOn(hooks, 'useInstall').mockReturnValue({
      loading: false,
      install: vi.fn(),
    });

    const store = createStore();

    // @ts-expect-error: Mock for provider.
    store.set(providerAtom, {});

    const { getByText } = render(<RequestButton />, { store });

    expect(getByText('Install Snap')).toBeInTheDocument();
  });

  it('renders the install Snap button when the Snap is not installed', () => {
    vi.spyOn(hooks, 'useSnaps').mockReturnValue({
      loading: false,
      snaps: [],
    });

    vi.spyOn(hooks, 'useRequest').mockReturnValue({
      loading: false,
      data: null,
      request: vi.fn(),
    });

    vi.spyOn(hooks, 'useInstall').mockReturnValue({
      loading: false,
      install: vi.fn(),
    });

    const store = createStore();

    // @ts-expect-error: Mock for provider.
    store.set(providerAtom, {});

    const { getByText } = render(<RequestButton />, { store });

    expect(getByText('Install Snap')).toBeInTheDocument();
  });

  it('renders the request button when the Snap is installed', () => {
    vi.spyOn(hooks, 'useSnaps').mockReturnValue({
      loading: false,
      snaps: [LOCAL_SNAP_ID],
    });

    vi.spyOn(hooks, 'useRequest').mockReturnValue({
      loading: false,
      data: null,
      request: vi.fn(),
    });

    const store = createStore();

    // @ts-expect-error: Mock for provider.
    store.set(providerAtom, {});

    const { getByText } = render(<RequestButton />, { store });

    expect(getByText('Execute request')).toBeInTheDocument();
  });

  it('sends the request when the button is clicked', () => {
    vi.spyOn(hooks, 'useSnaps').mockReturnValue({
      loading: false,
      snaps: [LOCAL_SNAP_ID],
    });

    const request = vi.fn();
    vi.spyOn(hooks, 'useRequest').mockReturnValue({
      loading: false,
      data: null,
      request,
    });

    const store = createStore();

    // @ts-expect-error: Mock for provider.
    store.set(providerAtom, {});

    const { getByText } = render(<RequestButton />, { store });

    const button = getByText('Execute request');
    fireEvent.click(button);

    expect(request).toHaveBeenCalledWith(JSON.parse(SAMPLE_JSON_RPC_REQUEST));
  });

  it('disables the button when the request is invalid', () => {
    vi.spyOn(hooks, 'useSnaps').mockReturnValue({
      loading: false,
      snaps: [LOCAL_SNAP_ID],
    });

    const request = vi.fn();
    vi.spyOn(hooks, 'useRequest').mockReturnValue({
      loading: false,
      data: null,
      request,
    });

    const store = createStore();

    // @ts-expect-error: Mock for provider.
    store.set(providerAtom, {});
    store.set(requestAtom, 'invalid request');

    const { getByText } = render(<RequestButton />, { store });

    const button = getByText('Execute request').parentElement;
    expect(button).toBeDisabled();
  });
});
