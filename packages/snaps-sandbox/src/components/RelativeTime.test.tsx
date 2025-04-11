import { act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { RelativeTime } from './RelativeTime';
import { render } from '../test-utils';

const MOCK_DATE = new Date('2025-01-01T12:00:00Z');

vi.useFakeTimers();
vi.setSystemTime(MOCK_DATE);

describe('RelativeTime', () => {
  it('renders the relative time', async () => {
    const { getByText } = render(
      <RelativeTime time={new Date(MOCK_DATE.getTime() - 20_000)} />,
    );

    expect(getByText('20s ago')).toBeInTheDocument();

    vi.setSystemTime(MOCK_DATE.getTime() + 1);
    await act(() => vi.runOnlyPendingTimers());

    expect(getByText('21s ago')).toBeInTheDocument();
  });
});
