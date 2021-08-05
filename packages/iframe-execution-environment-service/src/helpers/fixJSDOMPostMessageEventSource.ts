import { IframeExecutionEnvironmentService } from '../IframeExecutionEnvironmentService';

// fix for jsdom does not setting event.origin or event.source: https://github.com/jsdom/jsdom/issues/2745
const fixJSDOMPostMessageEventSource = (
  iframeExecutionEnvironmentService: IframeExecutionEnvironmentService,
) => {
  const oldCreateWindow = iframeExecutionEnvironmentService._createWindow;
  iframeExecutionEnvironmentService._createWindow = async (
    uri: string,
    envId: string,
  ) => {
    const result = await oldCreateWindow(uri, envId);

    const scriptElement = result.document.createElement('script');

    if (!scriptElement) {
      return result;
    }

    // fix the inside window
    scriptElement.textContent = `
    window.addEventListener('message', (postMessageEvent) => {
      if (postMessageEvent.source === null && !postMessageEvent.origin) {
        let source;
        let postMessageEventOrigin;
        if (postMessageEvent.data.target === 'child') {
          source = window.parent;
          postMessageEventOrigin = '*';
        } else if (postMessageEvent.data.target === 'parent') {
          source = window;
          postMessageEventOrigin = window.location.origin;
        }
        if (postMessageEvent.data.target) {
          postMessageEvent.stopImmediatePropagation();
          const args = Object.assign({
            ...postMessageEvent,
            data: postMessageEvent.data,
            source,
            origin: postMessageEventOrigin,
          });
          const postMessageEventWithOrigin = new MessageEvent(
            'message',
            args,
          );
          window.dispatchEvent(postMessageEventWithOrigin);
        }
      }
    });
  `;
    result.document.body.appendChild(scriptElement);

    return result;
  };
  const listener = (event: MessageEvent) => {
    if (event.source === null && !event.origin) {
      let source;
      let origin;
      if (event.data.target === 'child') {
        source = window;
        origin = window.location.origin;
      } else if (event.data.target === 'parent') {
        source = iframeExecutionEnvironmentService._iframeWindow;
        origin = iframeExecutionEnvironmentService.iframeUrl.toString();
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
