import { FunctionComponent, ReactNode } from 'react';
import { Card, Col } from 'react-bootstrap';
import CardHeader from 'react-bootstrap/CardHeader';

import { getSnapId } from '../utils/id';
import { Connect } from './Connect';

export type SnapProps = {
  /**
   * The name of the snap.
   */
  name: string;

  /**
   * The `data-testid` of the Snap.
   */
  testId?: string;

  /**
   * The snap ID. This is only used in production.
   */
  snapId?: `npm:${string}`;

  /**
   * The port that the Snap is listening on. This is only used in development.
   */
  port?: number;

  /**
   * The version of the Snap. This overrides the version in the `package.json`.
   */
  version?: string;

  hideConnect?: boolean;
  children?: ReactNode;
};

export const Snap: FunctionComponent<SnapProps> = ({
  name,
  snapId,
  testId,
  port,
  version,
  hideConnect,
  children,
}) => (
  <Col>
    <Card data-testid={testId}>
      <CardHeader>
        <h2 className="h4 mb-0">{name}</h2>
      </CardHeader>
      <div className="card-body">
        {!hideConnect && (
          <Connect
            name={name}
            testId={testId}
            snapId={getSnapId(snapId, port)}
            version={version}
          />
        )}

        {children}
      </div>
    </Card>
  </Col>
);
