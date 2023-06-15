import { List, Tabs } from '@chakra-ui/react';

import { render } from '../../../utils';
import { HistoryItem } from './HistoryItem';

describe('HistoryItem', () => {
  it('renders', () => {
    expect(() =>
      render(
        <Tabs>
          <List>
            <HistoryItem item={{ request: {}, date: new Date() }} />
          </List>
        </Tabs>,
        '/handler/onRpcRequest',
      ),
    ).not.toThrow();
  });
});
