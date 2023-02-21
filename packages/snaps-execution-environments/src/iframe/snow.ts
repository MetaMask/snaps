import snow from '@lavamoat/snow';

// Set up `@lavamoat/snow` to prevent the creation of new iframes.
snow((newWindow) => {
  newWindow?.frameElement?.remove();
}, window);
