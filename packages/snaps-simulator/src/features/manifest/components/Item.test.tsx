import { List } from '@chakra-ui/react';

import { render } from '../../../utils';
import { Item } from './Item';

describe('Item', () => {
  it('renders', () => {
    expect(() =>
      render(
        <List>
          <Item isValid={true} name="foo" manifestName="bar" />
        </List>,
      ),
    ).not.toThrow();
  });
});
