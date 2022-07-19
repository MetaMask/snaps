import { FunctionComponent } from 'react';
import { Renderer } from '../components';
import { fragment, input, row, text } from '../builder';

// Creates a JSON-representation of the element.
const element = fragment(
  text('Renderer proof-of-concept'),
  row(
    text('Hello, world!'),
    input('foo')
  )
);

const Index: FunctionComponent = () => (
  <Renderer element={element} />
);

export default Index;
