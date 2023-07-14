import type { PropsOf } from '@chakra-ui/react';
import { Image, useColorMode } from '@chakra-ui/react';
import { hasProperty } from '@metamask/utils';
import type { ForwardRefExoticComponent } from 'react';
import { forwardRef } from 'react';

import alertIcon from '../assets/icons/alert.svg';
import arrowDownIcon from '../assets/icons/arrow-down.svg';
import arrowRightIcon from '../assets/icons/arrow-right.svg';
import arrowTopRightIcon from '../assets/icons/arrow-top-right.svg';
import computerIcon from '../assets/icons/computer.svg';
import configurationDarkIcon from '../assets/icons/configuration-dark.svg';
import configurationIcon from '../assets/icons/configuration.svg';
import copiedIcon from '../assets/icons/copied.svg';
import copyIcon from '../assets/icons/copy.svg';
import copyableIcon from '../assets/icons/copyable.svg';
import cronjobIcon from '../assets/icons/cronjob.svg';
import crossDarkIcon from '../assets/icons/cross-dark.svg';
import crossIcon from '../assets/icons/cross.svg';
import darkArrowTopRightIcon from '../assets/icons/dark-arrow-top-right.svg';
import dividerIcon from '../assets/icons/divider.svg';
import dotIcon from '../assets/icons/dot.svg';
import dragIcon from '../assets/icons/drag.svg';
import errorTriangleIcon from '../assets/icons/error-triangle.svg';
import gitHubDarkIcon from '../assets/icons/github-dark.svg';
import gitHubIcon from '../assets/icons/github.svg';
import headingIcon from '../assets/icons/heading.svg';
import insightsIcon from '../assets/icons/insights.svg';
import jsonRpcIcon from '../assets/icons/json-rpc.svg';
import manifestIcon from '../assets/icons/manifest.svg';
import moonIcon from '../assets/icons/moon.svg';
import panelIcon from '../assets/icons/panel.svg';
import playErrorIcon from '../assets/icons/play-error.svg';
import playMutedIcon from '../assets/icons/play-muted.svg';
import playSuccessIcon from '../assets/icons/play-success.svg';
import playIcon from '../assets/icons/play.svg';
import snapIcon from '../assets/icons/snap.svg';
import textBubbleIcon from '../assets/icons/text-bubble.svg';
import textIcon from '../assets/icons/text.svg';
import uiIcon from '../assets/icons/ui.svg';

const DEFAULT_ICONS = {
  alert: {
    alt: 'Alert',
    src: alertIcon,
  },
  arrowRight: {
    alt: 'Arrow pointing right',
    src: arrowRightIcon,
  },
  arrowTopRight: {
    alt: 'Arrow pointing top right',
    src: arrowTopRightIcon,
  },
  darkArrowTopRightIcon: {
    alt: 'Arrow pointing top right',
    src: darkArrowTopRightIcon,
  },
  arrowDown: {
    alt: 'Arrow pointing down',
    src: arrowDownIcon,
  },
  textBubble: {
    alt: 'Text bubble',
    src: textBubbleIcon,
  },
  configuration: {
    alt: 'Configuration',
    src: configurationIcon,
    srcDark: configurationDarkIcon,
  },
  play: {
    alt: 'Play',
    src: playIcon,
  },
  playMuted: {
    alt: 'Play',
    src: playMutedIcon,
  },
  playSuccess: {
    alt: 'Success',
    src: playSuccessIcon,
  },
  playError: {
    alt: 'Error',
    src: playErrorIcon,
  },
  dot: {
    alt: 'OK',
    src: dotIcon,
  },
  errorTriangle: {
    alt: 'Error',
    src: errorTriangleIcon,
  },
  computer: {
    alt: 'Computer',
    src: computerIcon,
  },
  snap: {
    alt: 'Snap',
    src: snapIcon,
  },
  copy: {
    alt: 'Copy',
    src: copyIcon,
  },
  copied: {
    alt: 'Copied',
    src: copiedIcon,
  },
  moon: {
    alt: 'Moon',
    src: moonIcon,
  },
  manifest: {
    alt: 'Manifest',
    src: manifestIcon,
  },
  gitHub: {
    alt: 'GitHub',
    src: gitHubIcon,
    srcDark: gitHubDarkIcon,
  },
  cronjob: {
    alt: 'Cronjob',
    src: cronjobIcon,
  },
  insights: {
    alt: 'Insights',
    src: insightsIcon,
  },
  jsonRpc: {
    alt: 'JSON-RPC',
    src: jsonRpcIcon,
  },
  cross: {
    alt: 'Cross',
    src: crossIcon,
    srcDark: crossDarkIcon,
  },
  drag: {
    alt: 'Drag',
    src: dragIcon,
  },
  heading: {
    alt: 'Heading',
    src: headingIcon,
  },
  text: {
    alt: 'Text',
    src: textIcon,
  },
  copyable: {
    alt: 'Copyable',
    src: copyableIcon,
  },
  divider: {
    alt: 'Divider',
    src: dividerIcon,
  },
  panel: {
    alt: 'Panel',
    src: panelIcon,
  },
  ui: {
    alt: 'UI',
    src: uiIcon,
  },
};

export type IconName = keyof typeof DEFAULT_ICONS;

export type IconProps = {
  icon: IconName;
  alt?: string;
  width?: string;
  height?: string;
} & PropsOf<typeof Image>;

/**
 * Icon component, which renders one of the predefined icons.
 *
 * The component is based on Chakra UI's {@link Image} component, so all props
 * supported by {@link Image} are also supported by this component.
 *
 * @param props - Icon props.
 * @param props.icon - The name of the icon, e.g. 'alert'.
 * @param props.alt - The alt text for the icon.
 * @param props.width - The width of the icon. Defaults to '32px'.
 * @param props.height - The height of the icon. Defaults to '32px'.
 * @returns The icon component.
 */
export const Icon: ForwardRefExoticComponent<IconProps> = forwardRef(
  (
    {
      icon,
      alt = DEFAULT_ICONS[icon].alt,
      width = '32px',
      height = width,
      ...props
    },
    ref,
  ) => {
    const { colorMode } = useColorMode();

    const iconMetadata = DEFAULT_ICONS[icon];
    const defaultSrc = iconMetadata.src;
    const darkSrc = hasProperty(iconMetadata, 'srcDark')
      ? iconMetadata.srcDark
      : iconMetadata.src;

    const src = colorMode === 'light' ? defaultSrc : darkSrc;

    return (
      <Image
        ref={ref}
        src={src}
        alt={alt}
        width={width}
        height={height}
        {...props}
      />
    );
  },
);
