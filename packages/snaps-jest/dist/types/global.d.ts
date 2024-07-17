import type { EnumToUnion, NotificationType, ComponentOrElement } from '@metamask/snaps-sdk';
interface SnapsMatchers {
    /**
     * Assert that the response is a JSON-RPC response with the given result. This
     * is equivalent to calling `expect(response.result).toStrictEqual(result)`.
     *
     * @param response - The expected response result.
     * @throws If the response is not a JSON-RPC response with the given result.
     * @example
     * const response = await request({ method: 'foo' });
     * expect(response).toRespondWith('bar');
     */
    toRespondWith(response: unknown): void;
    /**
     * Assert that the response is a JSON-RPC response with the given error. This
     * is equivalent to calling `expect(response.error).toStrictEqual(error)`.
     *
     * @param error - The expected response error.
     * @throws If the response is not a JSON-RPC response with the given error.
     * @example
     * const response = await request({ method: 'foo' });
     * expect(response).toRespondWithError({
     *   code: -32601,
     *   message: 'The method does not exist / is not available.',
     *   stack: expect.any(String),
     *   data: { method: 'foo', cause: null },
     * });
     */
    toRespondWithError(error: unknown): void;
    /**
     * Assert that the Snap sent a notification with the expected message, and
     * optionally the expected notification type. This is equivalent to calling
     * `expect(response.notifications).toContainEqual({ message, type })`.
     *
     * @param message - The expected notification message.
     * @param type - The expected notification type, i.e., 'inApp' or 'native'. If
     * not provided, the type will be ignored.
     * @throws If the snap did not send a notification with the expected message.
     * @example
     * const response = await request({ method: 'foo' });
     * expect(response).toSendNotification('bar', NotificationType.InApp);
     */
    toSendNotification(message: string, type?: EnumToUnion<NotificationType>): void;
    /**
     * Assert that the Snap rendered the expected component. This is equivalent to
     * calling `expect(interface.content).toStrictEqual(component)`.
     *
     * @param component - The expected rendered component.
     * @throws If the snap did not render the expected component.
     * @example
     * const response = request({ method: 'foo' });
     * const ui = await response.getInterface();
     * expect(ui).toRender(panel([heading('Hello, world!')]));
     */
    toRender(component: ComponentOrElement): void;
}
declare module 'expect' {
    interface AsymmetricMatchers extends SnapsMatchers {
    }
    interface Matchers<R> extends SnapsMatchers {
    }
}
declare global {
    namespace jest {
        interface Matchers<R> extends SnapsMatchers {
        }
    }
}
export {};
