import type { FunctionComponent } from 'react';
import { Container } from 'react-bootstrap';

import { Fox } from './Fox';

export const Logo: FunctionComponent = () => {
  // Prevent SSR from rendering the logo.
  if (typeof document === 'undefined') {
    return <Container style={{ height: '500px' }} />;
  }

  return (
    <Container
      style={{
        height: '500px',
        position: 'relative',
      }}
    >
      <Fox
        left={0}
        phi={0}
        theta={Math.PI / 2}
        distance={500}
        hemisphereAxis={[0.1, 0.5, 0.2]}
        hemisphereColor1={[1, 1, 1]}
        hemisphereColor0={[1, 1, 1]}
        fogColor={[0.5, 0.5, 0.5]}
        interiorColor0={[1, 0.5, 0]}
        interiorColor1={[0.5, 0.2, 0]}
        noGLFallback={null}
        enableZoom={false}
        followMouse={false}
      />
    </Container>
  );
};
