import type { OnRpcRequestHandler } from '@metamask/snaps-sdk';
import {
  DialogType,
  getImageComponent,
  image,
  panel,
  text,
  MethodNotFoundError,
} from '@metamask/snaps-sdk';
import { renderSVG } from 'uqr';

import pngIcon from './images/icon.png';
import svgIcon from './images/icon.svg';

/**
 * The parameters for the `getQrCode` method.
 *
 * @property data - The data to encode in the QR code.
 */
type GetQrCodeParams = {
  data: string;
};

/**
 * Handle incoming JSON-RPC requests from the dapp, sent through the
 * `wallet_invokeSnap` method. This handler handles two methods:
 *
 * - `getQrCode`: Show a QR code to the user. The QR code is generated using
 * the `uqr` library, and rendered using the `image` component.
 * - `getCat`: Show a cat to the user. The cat image is fetched using the
 * `getImageComponent` helper. The helper returns an `image` component, which
 * can be rendered in a Snap dialog, for example.
 *
 * @param params - The request parameters.
 * @param params.request - The JSON-RPC request object.
 * @returns The JSON-RPC response.
 * @see https://docs.metamask.io/snaps/reference/exports/#onrpcrequest
 * @see https://docs.metamask.io/snaps/reference/rpc-api/#snap_dialog
 * @see https://docs.metamask.io/snaps/how-to/use-custom-ui/#image
 */
export const onRpcRequest: OnRpcRequestHandler = async ({ request }) => {
  switch (request.method) {
    case 'getQrCode': {
      const { data } = request.params as GetQrCodeParams;

      // `renderSVG` returns a `<svg>` element as a string, which can be
      // rendered using the `image` component.
      const qr = renderSVG(data);

      return await snap.request({
        method: 'snap_dialog',
        params: {
          type: DialogType.Alert,
          content: panel([
            text(`The following is a QR code for the data "${data}":`),
            image(qr),
          ]),
        },
      });
    }

    case 'getCat': {
      return await snap.request({
        method: 'snap_dialog',
        params: {
          type: DialogType.Alert,
          content: panel([
            text('Enjoy your cat!'),

            // The `getImageComponent` helper can also be used to fetch an image
            // from a URL and render it using the `image` component.
            await getImageComponent('https://cataas.com/cat', {
              width: 400,
            }),
          ]),
        },
      });
    }

    case 'getSvgIcon': {
      return await snap.request({
        method: 'snap_dialog',
        params: {
          type: DialogType.Alert,

          // `.svg` files are imported as strings, so they can be used directly
          // with the `image` component.
          content: panel([text('Here is an SVG icon:'), image(svgIcon)]),
        },
      });
    }

    case 'getPngIcon': {
      return await snap.request({
        method: 'snap_dialog',
        params: {
          type: DialogType.Alert,

          // `.png` files are imported as SVGs containing an `<image>` tag,
          // so they can be used directly with the `image` component.
          content: panel([text('Here is a PNG icon:'), image(pngIcon)]),
        },
      });
    }

    default:
      throw new MethodNotFoundError({ method: request.method });
  }
};
