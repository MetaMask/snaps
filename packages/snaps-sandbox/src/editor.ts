import { loader } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
// Seems to be a false positive.
// eslint-disable-next-line import-x/default
import JsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';

loader.config({ monaco });

/**
 * The JSON-RPC schema URL.
 */
export const JSON_RPC_SCHEMA_URL = 'http://json-schema.org/draft-04/schema#';

/**
 * The JSON-RPC schema.
 *
 * @see https://www.jsonrpc.org/specification
 */
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
  required: ['method'],
  additionalProperties: false,
};

// This is required for the Monaco editor to work with Vite.

self.MonacoEnvironment = {
  getWorker(_: any, label: string) {
    if (label === 'json') {
      return new JsonWorker();
    }

    return new EditorWorker();
  },
};
