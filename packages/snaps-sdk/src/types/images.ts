// eslint-disable-next-line import-x/unambiguous
declare module '*.svg' {
  const content: string;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore Redeclared in .d.cts file
  export default content;
}

declare module '*.png' {
  const content: string;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore Redeclared in .d.cts file
  export default content;
}

declare module '*.jpg' {
  const content: string;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore Redeclared in .d.cts file
  export default content;
}
