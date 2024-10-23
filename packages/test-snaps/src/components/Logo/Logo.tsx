import type { FunctionComponent } from 'react';
import { Container } from 'react-bootstrap';

export const Logo: FunctionComponent = () => {
  // Prevent SSR from rendering the logo.
  if (typeof document === 'undefined') {
    return <Container style={{ height: '150px' }} />;
  }

  return (
    <Container
      style={{
        height: '150px',
        position: 'relative',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <h2>Test Snaps</h2>
    </Container>
  );
};
