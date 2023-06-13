export const JSON_RPC_SCHEMA_URL = 'http://json-schema.org/draft-04/schema#';
export const JSON_RPC_SCHEMA = {
  $schema: 'http://json-schema.org/draft-04/schema#',
  type: 'object',
  properties: {
    jsonrpc: {
      const: '2.0',
    },
    id: {
      oneOf: [
        {
          type: 'string',
        },
        {
          type: 'number',
        },
        {
          type: 'null',
        },
      ],
    },
    method: {
      type: 'string',
    },
    params: {
      type: ['number', 'string', 'boolean', 'object', 'array', 'null'],
    },
  },
  required: ['jsonrpc', 'id', 'method'],
  additionalProperties: false,
};

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
