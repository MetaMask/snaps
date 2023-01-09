import { IframeExecutionService } from '../IframeExecutionService';

// Fix for JSDOM not setting `event.origin` or `event.source`: https://github.com/jsdom/jsdom/issues/2745
const fixJSDOMPostMessageEventSource = (
  iframeExecutionService: IframeExecutionService,
) => {
  const listener = (event: MessageEvent) => {
    if (event.source === null && !event.origin) {
      let source;
      let origin;
      if (event.data.target === 'child') {
        source = window;
        origin = window.location.origin;
      } else if (event.data.target === 'parent') {
        // @ts-expect-error Accessing private property
        const { worker } = iframeExecutionService.jobs.values().next().value;
        source = worker;
        origin = iframeExecutionService.iframeUrl.toString();
      }

      if (event.data.target) {
        event.stopImmediatePropagation();
        const args = Object.assign({
          ...event,
          data: event.data,
          source,
          origin,
        });
        const eventWithOrigin: MessageEvent = new MessageEvent('message', args);
        window.dispatchEvent(eventWithOrigin);
      }
    }
  };

  window.addEventListener('message', listener);

  return () => {
    window.removeEventListener('message', listener);
  };
};

export default fixJSDOMPostMessageEventSource;
