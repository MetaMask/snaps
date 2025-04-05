import { waitFor } from '@testing-library/dom';
import { act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { App } from './App';
import { render } from './test-utils';

describe('App', () => {
  it('renders the app component', async () => {
    const { getByText } = await act(() => render(<App />));

    await waitFor(() => expect(getByText('Request')).toBeInTheDocument());
  });
});
