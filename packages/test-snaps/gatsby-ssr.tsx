import { GatsbySSR } from 'gatsby';
import { SSRProvider } from 'react-bootstrap';

export const wrapRootElement: GatsbySSR['wrapRootElement'] = ({ element }) => {
  return <SSRProvider>{element}</SSRProvider>;
};
