import type { MatcherFunction } from '@jest/expect';
import type { NotificationType, EnumToUnion, ComponentOrElement } from '@metamask/snaps-sdk';
import type { Json } from '@metamask/utils';
/**
 * Check if a JSON-RPC response matches the expected value. This matcher is
 * intended to be used with the `expect` global.
 *
 * @param actual - The actual response.
 * @param expected - The expected response.
 * @returns The status and message.
 */
export declare const toRespondWith: MatcherFunction<[expected: Json]>;
export declare const toRespondWithError: MatcherFunction<[expected: Json]>;
/**
 * Check if the snap sent a notification with the expected message. This matcher
 * is intended to be used with the `expect` global.
 *
 * @param actual - The actual response.
 * @param expected - The expected notification message.
 * @param type - The expected notification type.
 * @returns The status and message.
 */
export declare const toSendNotification: MatcherFunction<[
    expected: string,
    type?: EnumToUnion<NotificationType> | undefined
]>;
export declare const toRender: MatcherFunction<[expected: ComponentOrElement]>;
