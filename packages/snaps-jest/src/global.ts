/* eslint-disable @typescript-eslint/consistent-type-definitions, @typescript-eslint/naming-convention, @typescript-eslint/no-empty-object-type, @typescript-eslint/no-unused-vars, @typescript-eslint/no-namespace */

import type {
  EnumToUnion,
  NotificationType,
  ComponentOrElement,
} from '@metamask/snaps-sdk';
import type { JSXElement } from '@metamask/snaps-sdk/jsx';

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
   * @param type - The expected notification type, i.e., 'inApp' or 'native'.
   * @param title - The title of an expanded notification.
   * @param content - The content of an expanded notification.
   * @param footerLink - The footer link of an expanded notification (if it exists).
   * @param footerLink.text - The text of the footer link.
   * @param footerLink.href - The href of the footer link.
   * @throws If the snap did not send a notification with the expected message.
   * @example
   * const response = await request({ method: 'foo' });
   * expect(response).toSendNotification('bar', NotificationType.InApp);
   */
  toSendNotification(
    message: string,
    type: EnumToUnion<NotificationType>,
    title?: string,
    content?: JSXElement,
    footerLink?: { text: string; href: string },
  ): void;

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

  /**
   * Assert that the Snap tracked an error with the expected parameters. This
   * is equivalent to calling
   * `expect(response.tracked.errors).toContainEqual(error)`.
   *
   * @param error - The expected error parameters.
   * @throws If the snap did not track an error with the expected parameters.
   * @example
   * const response = await request({ method: 'foo' });
   * expect(response).toTrackError({
   *   name: 'Error',
   *   message: 'This is an error.',
   * });
   */
  toTrackError(error?: unknown): void;

  /**
   * Assert that the Snap tracked an event with the expected parameters. This
   * is equivalent to calling
   * `expect(response.tracked.events).toContainEqual(event)`.
   *
   * @param event - The expected event parameters.
   * @throws If the snap did not track an event with the expected parameters.
   * @example
   * const response = await request({ method: 'foo' });
   * expect(response).toTrackEvent({
   *   event: 'bar',
   *   properties: { baz: 'qux' },
   *   sensitiveProperties: { quux: 'corge' },
   * });
   */
  toTrackEvent(event?: unknown): void;

  /**
   * Assert that the Snap started and ended a trace with the expected
   * parameters. This is equivalent to calling
   * `expect(response.tracked.traces).toContainEqual(span)`.
   *
   * @param trace - The expected trace parameters.
   * @throws If the snap did not end a trace with the expected parameters.
   * @example
   * const response = await request({ method: 'foo' });
   * expect(response).toTrace({
   *   name: 'My Trace',
   * });
   */
  toTrace(trace?: unknown): void;
}

// Extend the `expect` interface with the new matchers. This is used when
// importing `expect` from `@jest/globals`.
declare module 'expect' {
  interface AsymmetricMatchers extends SnapsMatchers {}

  // Ideally we would use `Matchers<Result>` instead of `Matchers<R>`, but
  // TypeScript doesn't allow this:
  // TS2428: All declarations of 'Matchers' must have identical type parameters.
  interface Matchers<R> extends SnapsMatchers {}
}

// Extend the Jest global namespace with the new matchers. This is used when
// using the global `expect` function.
declare global {
  namespace jest {
    // Ideally we would use `Matchers<Result>` instead of `Matchers<R>`, but
    // TypeScript doesn't allow this:
    // TS2428: All declarations of 'Matchers' must have identical type parameters.
    interface Matchers<R> extends SnapsMatchers {}
  }
}
