import { logError } from '@metamask/snaps-utils';
import { graphql, useStaticQuery } from 'gatsby';
import { ChangeEvent, FormEvent, FunctionComponent, useState } from 'react';
import { Button, Form } from 'react-bootstrap';

import { ButtonSpinner } from './ButtonSpinner';
import { useInstallSnapMutation } from '../api';
import { useInstalled } from '../utils';

type ConnectProps = {
  name: string;
  testId: string;
  snapId?: string;
  version?: string;
};

type Query = {
  site: {
    siteMetadata: {
      version: string;
    };
  };
};

export const Connect: FunctionComponent<ConnectProps> = ({
  name,
  testId,
  snapId: defaultSnapId = '',
  version: defaultVersion,
}) => {
  const [installSnap, { isLoading }] = useInstallSnapMutation();
  const [snapId, setSnapId] = useState(defaultSnapId);
  const isInstalled = useInstalled(snapId);

  const { site } = useStaticQuery<Query>(graphql`
    query Version {
      site {
        siteMetadata {
          version
        }
      }
    }
  `);

  const { version } = site.siteMetadata;

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSnapId(event.target.value);
  };

  const handleConnect = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    installSnap({ snapId, version: defaultVersion ?? version }).catch(logError);
  };

  return (
    <Form onSubmit={handleConnect} className="mb-3">
      <Form.Group className="mb-3">
        <Form.Label>Snap ID</Form.Label>
        <Form.Control
          type="text"
          placeholder="Snap ID"
          value={snapId}
          onChange={handleChange}
          data-testid="connect-snap-id"
          disabled={true}
        />
      </Form.Group>

      <Button
        variant="primary"
        type="submit"
        id={`connect${testId}`}
        data-testid="connect-button"
        disabled={isLoading}
      >
        {isLoading ? (
          <ButtonSpinner>Connecting</ButtonSpinner>
        ) : (
          <span>
            {isInstalled ? 'Reconnect' : 'Connect'} to {name}
          </span>
        )}
      </Button>
    </Form>
  );
};
