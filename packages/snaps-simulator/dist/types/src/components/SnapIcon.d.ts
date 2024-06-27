import type { FunctionComponent } from 'react';
export declare type SnapIconProps = {
    snapName: string;
};
/**
 * A Snap icon, which renders the icon defined in the snap's manifest, or a
 * fallback icon if the snap doesn't define one.
 *
 * @param props - The props.
 * @param props.snapName - The name of the snap.
 * @returns The Snap icon component.
 */
export declare const SnapIcon: FunctionComponent<SnapIconProps>;
