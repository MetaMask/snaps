import { graphql, useStaticQuery } from 'gatsby';
import { FunctionComponent } from 'react';
import { Container, Row } from 'react-bootstrap';

import { Logo } from '../components';
import { InstalledSnaps, snaps } from '../features';

type Query = {
  site: {
    siteMetadata: {
      title: string;
    };
  };
};

const Index: FunctionComponent = () => {
  return (
    <Container fluid>
      <Logo />

      <Row className="gx-3 gy-3 row-cols-xs-1 row-cols-sm-2 row-cols-lg-3">
        {/* Installed Snaps list */}
        <InstalledSnaps />

        {/* Snap test UI */}
        {Object.values(snaps).map((Component, index) => (
          <Component key={`snap-${index}`} />
        ))}
      </Row>
    </Container>
  );
};

export const Head: FunctionComponent = () => {
  const { site } = useStaticQuery<Query>(graphql`
    query Head {
      site {
        siteMetadata {
          title
        }
      }
    }
  `);

  return <title>{site.siteMetadata.title}</title>;
};

export default Index;
