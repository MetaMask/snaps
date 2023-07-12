import type { FunctionComponent } from 'react';
import { Container, Row } from 'react-bootstrap';

import { Logo } from './components';
import { InstalledSnaps, snaps } from './features';

export const App: FunctionComponent = () => {
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
