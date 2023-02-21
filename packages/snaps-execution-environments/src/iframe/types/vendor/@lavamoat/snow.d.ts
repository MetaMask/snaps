// eslint-disable-next-line import/unambiguous
declare module '@lavamoat/snow' {
  export default function snow(
    callback: (newWindow?: Window) => void,
    window?: Window,
  ): void;
}
