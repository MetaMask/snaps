// TODO: Add environment variable or URL parameter to override Snap ID.
export const LOCAL_SNAP_ID = `local:http://${new URL(window.location.href).host}`;

export const SAMPLE_JSON_RPC_REQUEST = JSON.stringify(
  {
    jsonrpc: '2.0',
    id: 1,
    method: 'subtract',
    params: [42, 23],
  },
  null,
  2,
);
