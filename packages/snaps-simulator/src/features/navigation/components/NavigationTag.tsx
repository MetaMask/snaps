import { Tag } from '@chakra-ui/react';
import type { FunctionComponent, ReactNode } from 'react';
import { useMatch } from 'react-router-dom';

type NavigationTagProps = {
  path: string;
  children: ReactNode;
};

export const NavigationTag: FunctionComponent<NavigationTagProps> = ({
  children,
  path,
}) => {
  const active = useMatch(path);
  const isActive = Boolean(active);

  return (
    <Tag
      borderRadius="base"
      variant="code"
      color={isActive ? '#0376C9' : 'info.default'}
      backgroundColor={isActive ? 'rgba(3, 118, 201, 0.1)' : 'info.muted'}
    >
      {children}
    </Tag>
  );
};
