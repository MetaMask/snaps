/* eslint-disable @typescript-eslint/consistent-type-definitions */
/* eslint-disable @typescript-eslint/naming-convention */
export {};

declare global {
  interface Window {
    /**
     * TODO: Improve and export only postMessage method instead of [any].
     * Source: https://github.com/react-native-webview/react-native-webview/issues/1269#issuecomment-604576223.
     *
     */
    ReactNativeWebView: any;
  }
}
