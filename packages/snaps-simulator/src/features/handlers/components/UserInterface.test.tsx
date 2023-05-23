import { Tabs } from '@chakra-ui/react';

import { render } from '../../../utils';
import { UserInterface } from './UserInterface';

describe('UserInterface', () => {
  it('renders', () => {
    expect(() =>
      render(
        <Tabs>
          <UserInterface />
        </Tabs>,
        '/handler/onRpcRequest',
      ),
    ).not.toThrow();
  });
});
