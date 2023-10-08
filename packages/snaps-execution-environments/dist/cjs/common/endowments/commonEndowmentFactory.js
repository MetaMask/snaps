"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const _globalObject = require("../globalObject");
const _console = /*#__PURE__*/ _interop_require_default(require("./console"));
const _crypto = /*#__PURE__*/ _interop_require_default(require("./crypto"));
const _date = /*#__PURE__*/ _interop_require_default(require("./date"));
const _interval = /*#__PURE__*/ _interop_require_default(require("./interval"));
const _math = /*#__PURE__*/ _interop_require_default(require("./math"));
const _network = /*#__PURE__*/ _interop_require_default(require("./network"));
const _textDecoder = /*#__PURE__*/ _interop_require_default(require("./textDecoder"));
const _textEncoder = /*#__PURE__*/ _interop_require_default(require("./textEncoder"));
const _timeout = /*#__PURE__*/ _interop_require_default(require("./timeout"));
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
// Array of common endowments
const commonEndowments = [
    {
        endowment: AbortController,
        name: 'AbortController'
    },
    {
        endowment: AbortSignal,
        name: 'AbortSignal'
    },
    {
        endowment: ArrayBuffer,
        name: 'ArrayBuffer'
    },
    {
        endowment: atob,
        name: 'atob',
        bind: true
    },
    {
        endowment: BigInt,
        name: 'BigInt'
    },
    {
        endowment: BigInt64Array,
        name: 'BigInt64Array'
    },
    {
        endowment: BigUint64Array,
        name: 'BigUint64Array'
    },
    {
        endowment: btoa,
        name: 'btoa',
        bind: true
    },
    {
        endowment: DataView,
        name: 'DataView'
    },
    {
        endowment: Float32Array,
        name: 'Float32Array'
    },
    {
        endowment: Float64Array,
        name: 'Float64Array'
    },
    {
        endowment: Int8Array,
        name: 'Int8Array'
    },
    {
        endowment: Int16Array,
        name: 'Int16Array'
    },
    {
        endowment: Int32Array,
        name: 'Int32Array'
    },
    {
        endowment: Uint8Array,
        name: 'Uint8Array'
    },
    {
        endowment: Uint8ClampedArray,
        name: 'Uint8ClampedArray'
    },
    {
        endowment: Uint16Array,
        name: 'Uint16Array'
    },
    {
        endowment: Uint32Array,
        name: 'Uint32Array'
    },
    {
        endowment: URL,
        name: 'URL'
    },
    {
        endowment: WebAssembly,
        name: 'WebAssembly'
    }
];
/**
 * Creates a consolidated collection of common endowments.
 * This function will return factories for all common endowments including
 * the additionally attenuated. All hardened with SES.
 *
 * @returns An object with common endowments.
 */ const buildCommonEndowments = ()=>{
    const endowmentFactories = [
        _crypto.default,
        _interval.default,
        _math.default,
        _network.default,
        _timeout.default,
        _textDecoder.default,
        _textEncoder.default,
        _date.default,
        _console.default
    ];
    commonEndowments.forEach((endowmentSpecification)=>{
        const endowment = {
            names: [
                endowmentSpecification.name
            ],
            factory: ()=>{
                const boundEndowment = typeof endowmentSpecification.endowment === 'function' && endowmentSpecification.bind ? endowmentSpecification.endowment.bind(_globalObject.rootRealmGlobal) : endowmentSpecification.endowment;
                return {
                    [endowmentSpecification.name]: harden(boundEndowment)
                };
            }
        };
        endowmentFactories.push(endowment);
    });
    return endowmentFactories;
};
const _default = buildCommonEndowments;

//# sourceMappingURL=commonEndowmentFactory.js.map