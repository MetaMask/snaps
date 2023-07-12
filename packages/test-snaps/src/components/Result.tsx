import type { FunctionComponent, ReactNode } from 'react';
import type { AlertProps } from 'react-bootstrap';
import { Alert } from 'react-bootstrap';

export type ResultProps = {
  children: ReactNode;
};

export const Result: FunctionComponent<ResultProps & AlertProps> = ({
  children,
  className,
  ...props
}) => (
  <Alert
    className={`info-text alert-secondary mb-0 ${className ?? ''}`}
    {...props}
  >
    {children}
  </Alert>
);
