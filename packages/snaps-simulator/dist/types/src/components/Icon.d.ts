import type { PropsOf } from '@chakra-ui/react';
import { Image } from '@chakra-ui/react';
import type { ForwardRefExoticComponent } from 'react';
declare const DEFAULT_ICONS: {
    alert: {
        alt: string;
        src: string;
    };
    arrowRight: {
        alt: string;
        src: string;
    };
    arrowTopRight: {
        alt: string;
        src: string;
    };
    darkArrowTopRightIcon: {
        alt: string;
        src: string;
    };
    arrowDown: {
        alt: string;
        src: string;
    };
    textBubble: {
        alt: string;
        src: string;
    };
    configuration: {
        alt: string;
        src: string;
        srcDark: string;
    };
    play: {
        alt: string;
        src: string;
    };
    playMuted: {
        alt: string;
        src: string;
    };
    playSuccess: {
        alt: string;
        src: string;
    };
    playError: {
        alt: string;
        src: string;
    };
    dot: {
        alt: string;
        src: string;
    };
    errorTriangle: {
        alt: string;
        src: string;
    };
    computer: {
        alt: string;
        src: string;
    };
    snap: {
        alt: string;
        src: string;
    };
    snapError: {
        alt: string;
        src: string;
    };
    copy: {
        alt: string;
        src: string;
    };
    copied: {
        alt: string;
        src: string;
    };
    moon: {
        alt: string;
        src: string;
    };
    manifest: {
        alt: string;
        src: string;
    };
    gitHub: {
        alt: string;
        src: string;
        srcDark: string;
    };
    cronjob: {
        alt: string;
        src: string;
    };
    insights: {
        alt: string;
        src: string;
    };
    jsonRpc: {
        alt: string;
        src: string;
    };
    cross: {
        alt: string;
        src: string;
        srcDark: string;
    };
    drag: {
        alt: string;
        src: string;
    };
    linkOut: {
        alt: string;
        src: string;
    };
    heading: {
        alt: string;
        src: string;
    };
    text: {
        alt: string;
        src: string;
    };
    copyable: {
        alt: string;
        src: string;
    };
    divider: {
        alt: string;
        src: string;
    };
    box: {
        alt: string;
        src: string;
    };
    ui: {
        alt: string;
        src: string;
    };
    image: {
        alt: string;
        src: string;
    };
    button: {
        alt: string;
        src: string;
    };
    form: {
        alt: string;
        src: string;
    };
    input: {
        alt: string;
        src: string;
    };
    field: {
        alt: string;
        src: string;
    };
};
export declare type IconName = keyof typeof DEFAULT_ICONS;
export declare type IconProps = {
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
export declare const Icon: ForwardRefExoticComponent<IconProps>;
export {};
