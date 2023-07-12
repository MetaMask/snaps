import type { TagProps } from '@chakra-ui/react';
import { Tag } from '@chakra-ui/react';
import type { ReactNode } from 'react';
import { forwardRef } from 'react';

import type { IconName } from './Icon';
import { Icon } from './Icon';

type PrefillProps = TagProps & {
  icon?: IconName;
  iconLocation?: 'left' | 'right';
  children: ReactNode;
};

export const Prefill = forwardRef<unknown, PrefillProps>(
  (
    {
      children,
      icon = 'darkArrowTopRightIcon',
      iconLocation = 'right',
      ...props
    },
    ref,
  ) => (
    <Tag
      ref={ref}
      width="fit-content"
      fontWeight="400"
      fontSize="xs"
      fontFamily="code"
      borderRadius="xl"
      background="background.alternative"
      _hover={{
        background: 'info.muted',
      }}
      {...props}
    >
      {iconLocation === 'left' && (
        <Icon icon={icon} width="10px" marginRight="1" />
      )}
      {children}
      {iconLocation === 'right' && (
        <Icon icon={icon} width="10px" marginLeft="1" />
      )}
    </Tag>
  ),
);
