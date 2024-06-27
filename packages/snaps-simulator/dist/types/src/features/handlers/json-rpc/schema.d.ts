export declare const JSON_RPC_SCHEMA_URL = "http://json-schema.org/draft-04/schema#";
export declare const JSON_RPC_SCHEMA: {
    $schema: string;
    type: string;
    properties: {
        jsonrpc: {
            const: string;
        };
        id: {
            oneOf: {
                type: string;
            }[];
        };
        method: {
            type: string;
        };
        params: {
            type: string[];
        };
    };
    required: string[];
    additionalProperties: boolean;
};
export declare const SAMPLE_JSON_RPC_REQUEST: string;
