import { FunctionComponent } from 'react';
import { Renderer } from '../components';
import { fragment, input, row, text } from '../builder';

const element = {
  type: 'row',
  foo: 'bar'
};

const Index: FunctionComponent = () => (
  <>
    {/* @ts-expect-error Invalid element. */}
    <Renderer element={element} />
  </>
);

export default Index;
