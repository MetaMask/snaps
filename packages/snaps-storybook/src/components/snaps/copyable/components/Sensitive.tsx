import { Tooltip } from '@chakra-ui/react';
import type { FunctionComponent } from 'react';

import { EyeIcon, EyeSlashIcon } from '../../../icons';

/**
 * The props for the {@link Sensitive} component.
 */
export type SensitiveProps = {
  /**
   * Whether the sensitive content is revealed.
   */
  isRevealed: boolean;

  /**
   * A callback to hide the sensitive content.
   */
  onHide?: () => void;
};

/**
 * A sensitive content icon, that reveals and hides the content when clicked.
 *
 * @param props - The component props.
 * @param props.isRevealed - Whether the sensitive content is revealed.
 * @param props.onHide - A callback to hide the sensitive content.
 * @returns The sensitive element.
 */
export const Sensitive: FunctionComponent<SensitiveProps> = ({
  isRevealed,
  onHide,
}) => {
  if (isRevealed) {
    return (
      <Tooltip label="Hide sensitive content">
        <EyeSlashIcon onClick={onHide} cursor="pointer" />
      </Tooltip>
    );
  }

  return (
    <Tooltip label="Do not share this with anyone">
      <EyeIcon />
    </Tooltip>
  );
};
