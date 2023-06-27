import { graphql, useStaticQuery } from 'gatsby';
import { FunctionComponent } from 'react';
import { Container, Row } from 'react-bootstrap';

import { Logo } from '../components';
import { BIP32 } from '../features/bip-32-snap';
import { BIP44 } from '../features/bip-44-snap';
import { Cronjob } from '../features/cronjob-snap';
import { Dialog } from '../features/dialog-snap';
import { ErrorSnap } from '../features/error-snap';
import { Ethersjs } from '../features/ethersjs-snap';
import { Ethprovider } from '../features/ethprovider-snap';
import { GetEntropy } from '../features/getentropy-snap';
import { Insights } from '../features/insights-snap';
import { Snaps } from '../features/installed-snaps';
import { ManageState } from '../features/manage-state-snap';
import { NetworkAccess } from '../features/networkaccess-snap';
import { Notification } from '../features/notification-snap';
import { Rpc } from '../features/rpc-snap';
import { Update } from '../features/update-snap';
import { WebAssembly } from '../features/wasm-snap';

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
        <Snaps />

        {/* Snap test UI */}
        <ErrorSnap />
        <Dialog />
        <BIP44 />
        <ManageState />
        <Notification />
        <BIP32 />
        <Update />
        <Insights />
        <Rpc />
        <Cronjob />
        <WebAssembly />
        <GetEntropy />
        <NetworkAccess />
        <Ethprovider />
        <Ethersjs />
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
