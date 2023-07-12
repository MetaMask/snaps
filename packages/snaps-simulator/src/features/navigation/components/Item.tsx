import { ListItem, Stack } from '@chakra-ui/react';
import type { FunctionComponent, ReactNode } from 'react';
import { useMatch } from 'react-router-dom';

import { Link } from '../../../components';

type ItemProps = {
  path: string;
  tag: string;
  isExternal?: boolean;
  onClick?: () => void;
  children: ReactNode;
};

export const Item: FunctionComponent<ItemProps> = ({
  path,
  tag,
  isExternal = false,
  onClick,
  children,
}) => {
  const active = useMatch(path);
  const isActive = Boolean(active);

  return (
    <ListItem>
      <Link
        padding="2"
        variant={isActive ? 'navigation-active' : 'navigation-default'}
        to={path}
        display="block"
        isExternal={isExternal}
        onClick={onClick}
        data-testid={`navigation-${tag}`}
        _hover={{
          textDecoration: 'none',
          opacity: 1,
          background: 'background.hover',
        }}
      >
        <Stack direction="row" align="center">
          {children}
        </Stack>
      </Link>
    </ListItem>
  );
};
