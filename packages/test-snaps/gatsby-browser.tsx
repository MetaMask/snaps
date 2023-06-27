import { GatsbyBrowser } from 'gatsby';
import { SSRProvider } from 'react-bootstrap';

// eslint-disable-next-line import/no-unassigned-import
import 'bootstrap/dist/css/bootstrap.min.css';

export const wrapRootElement: GatsbyBrowser['wrapRootElement'] = ({
  element,
}) => {
  return <SSRProvider>{element}</SSRProvider>;
};
