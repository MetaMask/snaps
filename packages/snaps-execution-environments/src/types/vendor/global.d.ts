/* eslint-disable @typescript-eslint/consistent-type-definitions */
/* eslint-disable @typescript-eslint/naming-convention */
export {};

// react-native-webview-message-handlers.d.ts
declare const webkit: Webkit;

declare global {
  interface Window {
    webkit: Webkit;
    /**
     * A convenience API that we seem to expose in iOS.
     * Source: https://github.com/react-native-community/react-native-webview/blob/25552977852427cf5fdc7b233fd1bbc7c77c18b0/ios/RNCWebView.m#L1128-L1146
     */
    ReactNativeWebView: {
      postMessage(message: string): void;
    };
  }

  interface Webkit {
    messageHandlers: {
      /**
       * Added due to our call to addScriptMessageHandler.
       * Source: https://github.com/react-native-community/react-native-webview/blob/25552977852427cf5fdc7b233fd1bbc7c77c18b0/ios/RNCWebView.m#L1244
       */
      ReactNativeWebView: {
        postMessage(message: string): void;
      };
      /**
       * Added due to our call to addScriptMessageHandler.
       * Source: https://github.com/react-native-community/react-native-webview/blob/25552977852427cf5fdc7b233fd1bbc7c77c18b0/ios/RNCWebView.m#L214
       */
      ReactNativeHistoryShim: {
        postMessage(message: string): void;
      };
    };
  }
}
