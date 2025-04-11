import { waitFor } from '@testing-library/dom';
import { act } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Sandbox } from './Sandbox';
import { render } from '../test-utils';

describe('Sandbox', () => {
  it('renders the sandbox component', async () => {
    const { getByText, getAllByTestId } = await act(() => render(<Sandbox />));

    await waitFor(() => expect(getByText('Request')).toBeInTheDocument());

    expect(getByText('Response')).toBeInTheDocument();
    expect(getAllByTestId('editor')).toHaveLength(2);
  });
});
