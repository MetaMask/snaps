export declare const TransactionOptionsStruct: import("@metamask/superstruct").Struct<{
    value: `0x${string}`;
    data: `0x${string}`;
    from: `0x${string}`;
    origin: string;
    chainId: string;
    to: `0x${string}`;
    gasLimit: `0x${string}`;
    maxFeePerGas: `0x${string}`;
    maxPriorityFeePerGas: `0x${string}`;
    nonce: `0x${string}`;
}, {
    /**
     * The CAIP-2 chain ID to send the transaction on. Defaults to `eip155:1`.
     */
    chainId: import("@metamask/superstruct").Struct<string, null>;
    /**
     * The origin to send the transaction from. Defaults to `metamask.io`.
     */
    origin: import("@metamask/superstruct").Struct<string, null>;
    /**
     * The address to send the transaction from. Defaults to a randomly generated
     * address.
     */
    from: import("@metamask/superstruct").Struct<`0x${string}`, null>;
    /**
     * The address to send the transaction to. Defaults to a randomly generated
     * address.
     */
    to: import("@metamask/superstruct").Struct<`0x${string}`, null>;
    /**
     * The value to send with the transaction. The value may be specified as a
     * `number`, `bigint`, `string`, or `Uint8Array`. Defaults to `0`.
     */
    value: import("@metamask/superstruct").Struct<`0x${string}`, null>;
    /**
     * The gas limit to use for the transaction. The gas limit may be specified
     * as a `number`, `bigint`, `string`, or `Uint8Array`. Defaults to `21_000`.
     */
    gasLimit: import("@metamask/superstruct").Struct<`0x${string}`, null>;
    /**
     * The max fee per gas (in Wei) to use for the transaction. The max fee per
     * gas may be specified as a `number`, `bigint`, `string`, or `Uint8Array`.
     * Defaults to `1`.
     */
    maxFeePerGas: import("@metamask/superstruct").Struct<`0x${string}`, null>;
    /**
     * The max priority fee per gas (in Wei) to use for the transaction. The max
     * priority fee per gas may be specified as a `number`, `bigint`, `string`,
     * or `Uint8Array`. Defaults to `1`.
     */
    maxPriorityFeePerGas: import("@metamask/superstruct").Struct<`0x${string}`, null>;
    /**
     * The nonce to use for the transaction. The nonce may be specified as a
     * `number`, `bigint`, `string`, or `Uint8Array`. Defaults to `0`.
     */
    nonce: import("@metamask/superstruct").Struct<`0x${string}`, null>;
    /**
     * The data to send with the transaction. The data may be specified as a
     * `number`, `bigint`, `string`, or `Uint8Array`. Defaults to `0x`.
     */
    data: import("@metamask/superstruct").Struct<`0x${string}`, null>;
}>;
export declare const SignatureOptionsStruct: import("@metamask/superstruct").Struct<{
    data: `0x${string}` | Record<string, any> | Record<string, any>[];
    from: `0x${string}`;
    origin: string;
    signatureMethod: "eth_sign" | "personal_sign" | "eth_signTypedData" | "eth_signTypedData_v3" | "eth_signTypedData_v4";
}, {
    /**
     * The origin making the signature request.
     */
    origin: import("@metamask/superstruct").Struct<string, null>;
    /**
     * The address signing the signature request. Defaults to a randomly generated
     * address.
     */
    from: import("@metamask/superstruct").Struct<`0x${string}`, null>;
    /**
     * The data to send with the transaction. The data may be specified as a
     * `string`, an object, or an array of objects. This covers the data types
     * for the supported signature methods. Defaults to `0x`.
     */
    data: import("@metamask/superstruct").Struct<`0x${string}` | Record<string, any> | Record<string, any>[], null>;
    /**
     * The signature method being used.
     */
    signatureMethod: import("@metamask/superstruct").Struct<"eth_sign" | "personal_sign" | "eth_signTypedData" | "eth_signTypedData_v3" | "eth_signTypedData_v4", null>;
}>;
export declare const SnapOptionsStruct: import("@metamask/superstruct").Struct<{
    timeout?: number | undefined;
}, {
    /**
     * The timeout in milliseconds to use for requests to the snap. Defaults to
     * `1000`.
     */
    timeout: import("@metamask/superstruct").Struct<number | undefined, null>;
}>;
export declare const JsonRpcMockOptionsStruct: import("@metamask/superstruct").Struct<{
    result: import("@metamask/snaps-sdk").Json;
    method: string;
}, {
    method: import("@metamask/superstruct").Struct<string, null>;
    result: import("@metamask/superstruct").Struct<import("@metamask/snaps-sdk").Json, unknown>;
}>;
export declare const InterfaceStruct: import("@metamask/superstruct").Struct<{
    content?: import("@metamask/snaps-sdk/jsx").JSXElement | undefined;
}, {
    content: import("@metamask/superstruct").Struct<import("@metamask/snaps-sdk/jsx").JSXElement | undefined, null>;
}>;
export declare const SnapResponseWithoutInterfaceStruct: import("@metamask/superstruct").Struct<{
    id: string;
    response: {
        result: import("@metamask/snaps-sdk").Json;
    } | {
        error: import("@metamask/snaps-sdk").Json;
    };
    notifications: {
        type: "native" | "inApp";
        message: string;
        id: string;
    }[];
}, {
    id: import("@metamask/superstruct").Struct<string, null>;
    response: import("@metamask/superstruct").Struct<{
        result: import("@metamask/snaps-sdk").Json;
    } | {
        error: import("@metamask/snaps-sdk").Json;
    }, null>;
    notifications: import("@metamask/superstruct").Struct<{
        type: "native" | "inApp";
        message: string;
        id: string;
    }[], import("@metamask/superstruct").Struct<{
        type: "native" | "inApp";
        message: string;
        id: string;
    }, {
        id: import("@metamask/superstruct").Struct<string, null>;
        message: import("@metamask/superstruct").Struct<string, null>;
        type: import("@metamask/superstruct").Struct<"native" | "inApp", null>;
    }>>;
}>;
export declare const SnapResponseWithInterfaceStruct: import("@metamask/superstruct").Struct<{
    id: string;
    response: {
        result: import("@metamask/snaps-sdk").Json;
    } | {
        error: import("@metamask/snaps-sdk").Json;
    };
    getInterface: Function;
    notifications: {
        type: "native" | "inApp";
        message: string;
        id: string;
    }[];
}, {
    getInterface: import("@metamask/superstruct").Struct<Function, null>;
    id: import("@metamask/superstruct").Struct<string, null>;
    response: import("@metamask/superstruct").Struct<{
        result: import("@metamask/snaps-sdk").Json;
    } | {
        error: import("@metamask/snaps-sdk").Json;
    }, null>;
    notifications: import("@metamask/superstruct").Struct<{
        type: "native" | "inApp";
        message: string;
        id: string;
    }[], import("@metamask/superstruct").Struct<{
        type: "native" | "inApp";
        message: string;
        id: string;
    }, {
        id: import("@metamask/superstruct").Struct<string, null>;
        message: import("@metamask/superstruct").Struct<string, null>;
        type: import("@metamask/superstruct").Struct<"native" | "inApp", null>;
    }>>;
}>;
export declare const SnapResponseStruct: import("@metamask/superstruct").Struct<{
    id: string;
    response: {
        result: import("@metamask/snaps-sdk").Json;
    } | {
        error: import("@metamask/snaps-sdk").Json;
    };
    notifications: {
        type: "native" | "inApp";
        message: string;
        id: string;
    }[];
} | {
    id: string;
    response: {
        result: import("@metamask/snaps-sdk").Json;
    } | {
        error: import("@metamask/snaps-sdk").Json;
    };
    getInterface: Function;
    notifications: {
        type: "native" | "inApp";
        message: string;
        id: string;
    }[];
}, null>;
