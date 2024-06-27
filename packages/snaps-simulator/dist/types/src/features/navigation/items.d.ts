import type { IconName } from '../../components';
import type { ApplicationState } from '../../store';
declare type ConditionFunction = (state: ApplicationState) => boolean;
export declare type NavigationItem = {
    label: string;
    tag: string;
    description: string;
    icon: IconName;
    path: string;
    /**
     * Conditionally render the navigation item. If not provided, the item will
     * always be rendered.
     */
    condition?: ConditionFunction;
};
export declare const NAVIGATION_ITEMS: NavigationItem[];
export {};
