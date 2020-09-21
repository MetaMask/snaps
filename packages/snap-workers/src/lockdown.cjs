'use strict';

/**
 * commons.js
 * Declare shorthand functions. Sharing these declarations across modules
 * improves on consistency and minification. Unused declarations are
 * dropped by the tree shaking process.
 *
 * We capture these, not just for brevity, but for security. If any code
 * modifies Object to change what 'assign' points to, the Compatment shim
 * would be corrupted.
 */

const {
  assign,
  create,
  defineProperties,
  entries,
  freeze,
  getOwnPropertyDescriptor,
  getOwnPropertyDescriptors,
  getOwnPropertyNames,
  getPrototypeOf,
  keys,
  prototype: objectPrototype,
  setPrototypeOf,
  values,
} = Object;

const defineProperty = (object, prop, descriptor) => {
  // Object.defineProperty is allowed to fail silently so we use
  // Object.defineProperties instead.
  return defineProperties(object, { [prop]: descriptor });
};

const { apply, construct, get: reflectGet, set: reflectSet } = Reflect;

const { isArray, prototype: arrayPrototype } = Array;
const { revocable: proxyRevocable } = Proxy;
const { prototype: regexpPrototype } = RegExp;
const { prototype: stringPrototype } = String;
const { prototype: weakmapPrototype } = WeakMap;

/**
 * uncurryThis()
 * This form of uncurry uses Reflect.apply()
 *
 * The original uncurry uses:
 * const bind = Function.prototype.bind;
 * const uncurryThis = bind.bind(bind.call);
 *
 * See those reference for a complete explanation:
 * http://wiki.ecmascript.org/doku.php?id=conventions:safe_meta_programming
 * which only lives at
 * http://web.archive.org/web/20160805225710/http://wiki.ecmascript.org/doku.php?id=conventions:safe_meta_programming
 */
const uncurryThis = fn => (thisArg, ...args) => apply(fn, thisArg, args);

const objectHasOwnProperty = uncurryThis(objectPrototype.hasOwnProperty);
//
const arrayFilter = uncurryThis(arrayPrototype.filter);
const arrayJoin = uncurryThis(arrayPrototype.join);
const arrayPush = uncurryThis(arrayPrototype.push);
const arrayPop = uncurryThis(arrayPrototype.pop);
const arrayIncludes = uncurryThis(arrayPrototype.includes);
//
const regexpTest = uncurryThis(regexpPrototype.test);
//
const stringMatch = uncurryThis(stringPrototype.match);
const stringSearch = uncurryThis(stringPrototype.search);
const stringSlice = uncurryThis(stringPrototype.slice);
const stringSplit = uncurryThis(stringPrototype.split);
//
const weakmapGet = uncurryThis(weakmapPrototype.get);
const weakmapSet = uncurryThis(weakmapPrototype.set);
const weakmapHas = uncurryThis(weakmapPrototype.has);

/**
 * immutableObject
 * An immutable (frozen) exotic object and is safe to share.
 */
const immutableObject = freeze({ __proto__: null });

const nativeSuffix = ') { [native code] }';

function tameFunctionToString() {
  const nativeBrand = new WeakSet();

  const originalFunctionToString = Function.prototype.toString;

  const tamingMethods = {
    toString() {
      const str = apply(originalFunctionToString, this, []);
      if (str.endsWith(nativeSuffix) || !nativeBrand.has(this)) {
        return str;
      }
      return `function ${this.name}() { [native code] }`;
    },
  };

  defineProperty(Function.prototype, 'toString', {
    value: tamingMethods.toString,
  });

  return func => nativeBrand.add(func);
}

/**
 * @fileoverview Exports {@code whitelist}, a recursively defined
 * JSON record enumerating all intrinsics and their properties
 * according to ECMA specs.
 *
 * @author JF Paradis
 */

/* eslint max-lines: 0 */

/**
 * constantProperties
 * non-configurable, non-writable data properties of all global objects.
 * Must be powerless.
 * Maps from property name to the actual value
 */
const constantProperties = {
  // *** 18.1 Value Properties of the Global Object

  Infinity,
  NaN,
  undefined,
};

/**
 * universalPropertyNames
 * Properties of all global objects.
 * Must be powerless.
 * Maps from property name to the intrinsic name in the whitelist.
 */
const universalPropertyNames = {
  // *** 18.2 Function Properties of the Global Object

  isFinite: 'isFinite',
  isNaN: 'isNaN',
  parseFloat: 'parseFloat',
  parseInt: 'parseInt',

  decodeURI: 'decodeURI',
  decodeURIComponent: 'decodeURIComponent',
  encodeURI: 'encodeURI',
  encodeURIComponent: 'encodeURIComponent',

  // *** 18.3 Constructor Properties of the Global Object

  Array: 'Array',
  ArrayBuffer: 'ArrayBuffer',
  BigInt: 'BigInt',
  BigInt64Array: 'BigInt64Array',
  BigUint64Array: 'BigUint64Array',
  Boolean: 'Boolean',
  DataView: 'DataView',
  EvalError: 'EvalError',
  Float32Array: 'Float32Array',
  Float64Array: 'Float64Array',
  Int8Array: 'Int8Array',
  Int16Array: 'Int16Array',
  Int32Array: 'Int32Array',
  Map: 'Map',
  Number: 'Number',
  Object: 'Object',
  Promise: 'Promise',
  Proxy: 'Proxy',
  RangeError: 'RangeError',
  ReferenceError: 'ReferenceError',
  Set: 'Set',
  String: 'String',
  Symbol: 'Symbol',
  SyntaxError: 'SyntaxError',
  TypeError: 'TypeError',
  Uint8Array: 'Uint8Array',
  Uint8ClampedArray: 'Uint8ClampedArray',
  Uint16Array: 'Uint16Array',
  Uint32Array: 'Uint32Array',
  URIError: 'URIError',
  WeakMap: 'WeakMap',
  WeakSet: 'WeakSet',

  // *** 18.4 Other Properties of the Global Object

  JSON: 'JSON',
  Reflect: 'Reflect',

  // *** Annex B

  escape: 'escape',
  unescape: 'unescape',

  // ESNext

  lockdown: 'lockdown',
  harden: 'harden',
  HandledPromise: 'HandledPromise', // TODO: Until Promise.delegate (see below).
  StaticModuleRecord: 'StaticModuleRecord',
};

/**
 * initialGlobalPropertyNames
 * Those found only on the initial global, i.e., the global of the
 * start compartment, as well as any compartments created before lockdown.
 * These may provide much of the power provided by the original.
 * Maps from property name to the intrinsic name in the whitelist.
 */
const initialGlobalPropertyNames = {
  // *** 18.3 Constructor Properties of the Global Object

  Date: '%InitialDate%',
  Error: '%InitialError%',
  RegExp: '%InitialRegExp%',

  // *** 18.4 Other Properties of the Global Object

  Math: '%InitialMath%',

  // ESNext

  // From Error-stack proposal
  // Only on initial global. No corresponding
  // powerless form for other globals.
  getStackString: '%InitialGetStackString%',
};

/**
 * sharedGlobalPropertyNames
 * Those found only on the globals of new compartments created after lockdown,
 * which must therefore be powerless.
 * Maps from property name to the intrinsic name in the whitelist.
 */
const sharedGlobalPropertyNames = {
  // *** 18.3 Constructor Properties of the Global Object

  Date: '%SharedDate%',
  Error: '%SharedError%',
  RegExp: '%SharedRegExp%',

  // *** 18.4 Other Properties of the Global Object

  Math: '%SharedMath%',
};

// All the "subclasses" of Error. These are collectively represented in the
// EcmaScript spec by the meta variable NativeError.
const NativeErrors = [
  EvalError,
  RangeError,
  ReferenceError,
  SyntaxError,
  TypeError,
  URIError,
];

/**
 * <p>Each JSON record enumerates the disposition of the properties on
 *    some corresponding intrinsic object.
 *
 * <p>All records are made of key-value pairs where the key
 *    is the property to process, and the value is the associated
 *    dispositions a.k.a. the "permit". Those permits can be:
 * <ul>
 * <li>The boolean value "false", in which case this property is
 *     blacklisted and simply removed. Properties not mentioned
 *     are also considered blacklisted and are removed.
 * <li>A string value equal to a primitive ("number", "string", etc),
 *     in which case the property is whitelisted if its value property
 *     is typeof the given type. For example, {@code "Infinity"} leads to
 *     "number" and property values that fail {@code typeof "number"}.
 *     are removed.
 * <li>A string value equal to an intinsic name ("ObjectPrototype",
 *     "Array", etc), in which case the property whitelisted if its
 *     value property is equal to the value of the corresponfing
 *     intrinsics. For example, {@code Map.prototype} leads to
 *     "MapPrototype" and the property is removed if its value is
 *     not equal to %MapPrototype%
 * <li>Another record, in which case this property is simply
 *     whitelisted and that next record represents the disposition of
 *     the object which is its value. For example, {@code "Object"}
 *     leads to another record explaining what properties {@code
 *     "Object"} may have and how each such property should be treated.
 *
 * <p>Notes:
 * <li>"[[Proto]]" is used to refer to the "[[Prototype]]" internal
 *     slot, which says which object this object inherits from.
 * <li>"--proto--" is used to refer to the "__proto__" property name,
 *     which is the name of an accessor property on Object.prototype.
 *     In practice, it is used to access the [[Proto]] internal slot,
 *     but is distinct from the internal slot itself. We use
 *     "--proto--" rather than "__proto__" below because "__proto__"
 *     in an object literal is special syntax rather than a normal
 *     property definition.
 * <li>"ObjectPrototype" is the default "[[Proto]]" (when not specified).
 * <li>Constants "fn" and "getter" are used to keep the structure DRY.
 * <li>Symbol properties are listed using the "@@name" form.
 */

// 19.2.4 Function Instances
const FunctionInstance = {
  // Mentioned in "19.2.4.3 prototype"
  '[[Proto]]': '%FunctionPrototype%',
  // 19.2.4.1 length
  length: 'number',
  // 19.2.4.2 name
  name: 'string',
  // 19.2.4.3 prototype
  // Do not specify "prototype" here, since only Function instances that can
  // be used as a constructor have a prototype property. For constructors,
  // since prototype properties are instance-specific, we define it there.
};

// Aliases
const fn = FunctionInstance;

const getter = {
  get: fn,
  set: 'undefined',
};

// Possible but not encountered in the specs
// export const setter = {
//   get: 'undefined',
//   set: fn,
// };

const accessor = {
  get: fn,
  set: fn,
};

function isAccessorPermit(permit) {
  return permit === getter || permit === accessor;
}

// 19.5.6 NativeError Object Structure
function NativeError(prototype) {
  return {
    // 19.5.6.2 Properties of the NativeError Constructors
    '[[Proto]]': '%SharedError%',

    // 19.5.6.2.1 NativeError.prototype
    prototype,
  };
}

function NativeErrorPrototype(constructor) {
  return {
    // 19.5.6.3 Properties of the NativeError Prototype Objects
    '[[Proto]]': '%ErrorPrototype%',
    // 19.5.6.3.1 NativeError.prototype.constructor
    constructor,
    // 19.5.6.3.2 NativeError.prototype.message
    message: 'string',
    // 19.5.6.3.3 NativeError.prototype.name
    name: 'string',
    // Redundantly present only on v8. Safe to remove.
    toString: false,
  };
}

// 22.2.4 The TypedArray Constructors
function TypedArray(prototype) {
  return {
    // 22.2.5 Properties of the TypedArray Constructors
    '[[Proto]]': '%TypedArray%',

    // 22.2.5.1 TypedArray.BYTES_PER_ELEMENT
    BYTES_PER_ELEMENT: 'number',
    // 22.2.5.2 TypedArray.prototype
    prototype,
  };
}

function TypedArrayPrototype(constructor) {
  return {
    // 22.2.6 Properties of the TypedArray Prototype Objects
    '[[Proto]]': '%TypedArrayPrototype%',
    // 22.2.6.1 TypedArray.prototype.BYTES_PER_ELEMENT
    BYTES_PER_ELEMENT: 'number',
    // 22.2.6.2TypedArray.prototype.constructor
    constructor,
  };
}

// Without Math.random
const SharedMath = {
  // 20.3.1.1 Math.E
  E: 'number',
  // 20.3.1.2 Math.LN10
  LN10: 'number',
  // 20.3.1.3 Math.LN2
  LN2: 'number',
  // 20.3.1.4 Math.LOG10E
  LOG10E: 'number',
  // 20.3.1.5 Math.LOG2E
  LOG2E: 'number',
  // 20.3.1.6 Math.PI
  PI: 'number',
  // 20.3.1.7 Math.SQRT1_2
  SQRT1_2: 'number',
  // 20.3.1.8 Math.SQRT2
  SQRT2: 'number',
  // 20.3.1.9 Math [ @@toStringTag ]
  '@@toStringTag': 'string',
  // 20.3.2.1 Math.abs
  abs: fn,
  // 20.3.2.2 Math.acos
  acos: fn,
  // 20.3.2.3 Math.acosh
  acosh: fn,
  // 20.3.2.4 Math.asin
  asin: fn,
  // 20.3.2.5 Math.asinh
  asinh: fn,
  // 20.3.2.6 Math.atan
  atan: fn,
  // 20.3.2.7 Math.atanh
  atanh: fn,
  // 20.3.2.8 Math.atan2
  atan2: fn,
  // 20.3.2.9 Math.cbrt
  cbrt: fn,
  // 20.3.2.10 Math.ceil
  ceil: fn,
  // 20.3.2.11 Math.clz32
  clz32: fn,
  // 20.3.2.12 Math.cos
  cos: fn,
  // 20.3.2.13 Math.cosh
  cosh: fn,
  // 20.3.2.14 Math.exp
  exp: fn,
  // 20.3.2.15 Math.expm1
  expm1: fn,
  // 20.3.2.16 Math.floor
  floor: fn,
  // 20.3.2.17 Math.fround
  fround: fn,
  // 20.3.2.18 Math.hypot
  hypot: fn,
  // 20.3.2.19 Math.imul
  imul: fn,
  // 20.3.2.20 Math.log
  log: fn,
  // 20.3.2.21 Math.log1p
  log1p: fn,
  // 20.3.2.22 Math.log10
  log10: fn,
  // 20.3.2.23 Math.log2
  log2: fn,
  // 20.3.2.24 Math.max
  max: fn,
  // 20.3.2.25 Math.min
  min: fn,
  // 20.3.2.26Math.pow
  pow: fn,
  // 20.3.2.28 Math.round
  round: fn,
  // 20.3.2.29 Math.sign
  sign: fn,
  // 20.3.2.30 Math.sin
  sin: fn,
  // 20.3.2.31 Math.sinh
  sinh: fn,
  // 20.3.2.32 Math.sqrt
  sqrt: fn,
  // 20.3.2.33 Math.tan
  tan: fn,
  // 20.3.2.34 Math.tanh
  tanh: fn,
  // 20.3.2.35 Math.trunc
  trunc: fn,
  // 20.3.2.35Math.trunc
};

const whitelist = {
  // ECMA https://tc39.es/ecma262

  // The intrinsics object has no prototype to avoid conflicts.
  '[[Proto]]': null,

  // 9.2.4.1 %ThrowTypeError%
  '%ThrowTypeError%': fn,

  // *** 18 The Global Object

  // *** 18.1 Value Properties of the Global Object

  // 18.1.1 Infinity
  Infinity: 'number',
  // 18.1.2 NaN
  NaN: 'number',
  // 18.1.3 undefined
  undefined: 'undefined',

  // *** 18.2 Function Properties of the Global Object

  // 18.2.1 eval
  '%UniqueEval%': fn,
  // 18.2.2 isFinite
  isFinite: fn,
  // 18.2.3 isNaN
  isNaN: fn,
  // 18.2.4 parseFloat
  parseFloat: fn,
  // 18.2.5 parseInt
  parseInt: fn,
  // 18.2.6.2 decodeURI
  decodeURI: fn,
  // 18.2.6.3 decodeURIComponent
  decodeURIComponent: fn,
  // 18.2.6.4 encodeURI
  encodeURI: fn,
  // 18.2.6.5 encodeURIComponent
  encodeURIComponent: fn,

  // *** 19 Fundamental Objects

  Object: {
    // 19.1.2 Properties of the Object Constructor
    '[[Proto]]': '%FunctionPrototype%',
    // 19.1.2.1 Object.assign
    assign: fn,
    // 19.1.2.2 Object.create
    create: fn,
    // 19.1.2.3 Object.defineProperties
    defineProperties: fn,
    // 19.1.2.4 Object.defineProperty
    defineProperty: fn,
    // 19.1.2.5 Object.entries
    entries: fn,
    // 19.1.2.6 Object.freeze
    freeze: fn,
    // 19.1.2.7 Object.fromEntries
    fromEntries: fn,
    // 19.1.2.8 Object.getOwnPropertyDescriptor
    getOwnPropertyDescriptor: fn,
    // 19.1.2.9 Object.getOwnPropertyDescriptors
    getOwnPropertyDescriptors: fn,
    // 19.1.2.10 Object.getOwnPropertyNames
    getOwnPropertyNames: fn,
    // 19.1.2.11 Object.getOwnPropertySymbols
    getOwnPropertySymbols: fn,
    // 19.1.2.12 Object.getPrototypeOf
    getPrototypeOf: fn,
    // 19.1.2.13 Object.is
    is: fn,
    // 19.1.2.14 Object.isExtensible
    isExtensible: fn,
    // 19.1.2.15 Object.isFrozen
    isFrozen: fn,
    // 19.1.2.16 Object.isSealed
    isSealed: fn,
    // 19.1.2.17 Object.keys
    keys: fn,
    // 19.1.2.18 Object.preventExtensions
    preventExtensions: fn,
    // 19.1.2.19 Object.prototype
    prototype: '%ObjectPrototype%',
    // 19.1.2.20 Object.seal
    seal: fn,
    // 19.1.2.21 Object.setPrototypeOf
    setPrototypeOf: fn,
    // 19.1.2.22 Object.values
    values: fn,
  },

  '%ObjectPrototype%': {
    // 19.1.3 Properties of the Object Prototype Object
    '[[Proto]]': null,
    // 19.1.3.1 Object.prototype.constructor
    constructor: 'Object',
    // 19.1.3.2 Object.prototype.hasOwnProperty
    hasOwnProperty: fn,
    // 19.1.3.3 Object.prototype.isPrototypeOf
    isPrototypeOf: fn,
    // 19.1.3.4 Object.prototype.propertyIsEnumerable
    propertyIsEnumerable: fn,
    // 19.1.3.5 Object.prototype.toLocaleString
    toLocaleString: fn,
    // 19.1.3.6 Object.prototype.toString
    toString: fn,
    // 19.1.3.7 Object.prototype.valueOf
    valueOf: fn,

    // B.2.2 Additional Properties of the Object.prototype Object

    // B.2.2.1 Object.prototype.__proto__
    '--proto--': accessor,
    // B.2.2.2 Object.prototype.__defineGetter__
    __defineGetter__: fn,
    // B.2.2.3 Object.prototype.__defineSetter__
    __defineSetter__: fn,
    // B.2.2.4 Object.prototype.__lookupGetter__
    __lookupGetter__: fn,
    // B.2.2.5 Object.prototype.__lookupSetter__
    __lookupSetter__: fn,
  },

  '%UniqueFunction%': {
    // 19.2.2 Properties of the Function Constructor
    '[[Proto]]': '%FunctionPrototype%',
    // 19.2.2.2 Function.prototype
    prototype: '%FunctionPrototype%',
  },

  '%InertFunction%': {
    '[[Proto]]': '%FunctionPrototype%',
    prototype: '%FunctionPrototype%',
  },

  '%FunctionPrototype%': {
    // 19.2.3.1 Function.prototype.apply
    apply: fn,
    // 19.2.3.2 Function.prototype.bind
    bind: fn,
    // 19.2.3.3 Function.prototype.call
    call: fn,
    // 19.2.3.4 Function.prototype.constructor
    constructor: '%InertFunction%', // TODO test
    // 19.2.3.5 Function.prototype.toString
    toString: fn,
    // 19.2.3.6 Function.prototype [ @@hasInstance ]
    '@@hasInstance': fn,
    // non-std yet but proposed. To be removed if there
    caller: false,
    arguments: false,
  },

  Boolean: {
    // 19.3.2 Properties of the Boolean Constructor
    '[[Proto]]': '%FunctionPrototype%',
    // 19.3.2.1 Boolean.prototype
    prototype: '%BooleanPrototype%',
  },

  '%BooleanPrototype%': {
    // 19.3.3.1 Boolean.prototype.constructor
    constructor: 'Boolean',
    // 19.3.3.2 Boolean.prototype.toString
    toString: fn,
    // 19.3.3.3 Boolean.prototype.valueOf
    valueOf: fn,
  },

  Symbol: {
    // 19.4.2 Properties of the Symbol Constructor
    '[[Proto]]': '%FunctionPrototype%',
    // 19.4.2.1 Symbol.asyncIterator
    asyncIterator: 'symbol',
    // 19.4.2.2 Symbol.for
    for: fn,
    // 19.4.2.3 Symbol.hasInstance
    hasInstance: 'symbol',
    // 19.4.2.4 Symbol.isConcatSpreadable
    isConcatSpreadable: 'symbol',
    // 19.4.2.5 Symbol.iterator
    iterator: 'symbol',
    // 19.4.2.6 Symbol.keyFor
    keyFor: fn,
    // 19.4.2.7 Symbol.match
    match: 'symbol',
    // 19.4.2.8 Symbol.matchAll
    matchAll: 'symbol',
    // 19.4.2.9 Symbol.prototype
    prototype: '%SymbolPrototype%',
    // 19.4.2.10 Symbol.replace
    replace: 'symbol',
    // 19.4.2.11 Symbol.search
    search: 'symbol',
    // 19.4.2.12 Symbol.species
    species: 'symbol',
    // 19.4.2.13 Symbol.split
    split: 'symbol',
    // 19.4.2.14 Symbol.toPrimitive
    toPrimitive: 'symbol',
    // 19.4.2.15 Symbol.toStringTag
    toStringTag: 'symbol',
    // 19.4.2.16 Symbol.unscopables
    unscopables: 'symbol',
  },

  '%SymbolPrototype%': {
    // 19.4.3 Properties of the Symbol Prototype Object

    // 19.4.3.1 Symbol.prototype.constructor
    constructor: 'Symbol',
    // 19.4.3.2 get Symbol.prototype.description
    description: getter,
    // 19.4.3.3 Symbol.prototype.toString
    toString: fn,
    // 19.4.3.4 Symbol.prototype.valueOf
    valueOf: fn,
    // 19.4.3.5 Symbol.prototype [ @@toPrimitive ]
    '@@toPrimitive': fn,
    // 19.4.3.6 Symbol.prototype [ @@toStringTag ]
    '@@toStringTag': 'string',
  },

  '%InitialError%': {
    // 19.5.2 Properties of the Error Constructor
    '[[Proto]]': '%FunctionPrototype%',
    // 19.5.2.1 Error.prototype
    prototype: '%ErrorPrototype%',
    // Non standard, v8 only, used by tap
    captureStackTrace: fn,
    // Non standard, v8 only, used by tap, tamed to accessor
    stackTraceLimit: accessor,
    // Non standard, v8 only, used by several, tamed to accessor
    prepareStackTrace: accessor,
  },

  '%SharedError%': {
    // 19.5.2 Properties of the Error Constructor
    '[[Proto]]': '%FunctionPrototype%',
    // 19.5.2.1 Error.prototype
    prototype: '%ErrorPrototype%',
    // Non standard, v8 only, used by tap
    captureStackTrace: fn,
    // Non standard, v8 only, used by tap, tamed to accessor
    stackTraceLimit: accessor,
    // Non standard, v8 only, used by several, tamed to accessor
    prepareStackTrace: accessor,
  },

  '%ErrorPrototype%': {
    // 19.5.3.1 Error.prototype.constructor
    constructor: '%SharedError%',
    // 19.5.3.2 Error.prototype.message
    message: 'string',
    // 19.5.3.3 Error.prototype.name
    name: 'string',
    // 19.5.3.4 Error.prototype.toString
    toString: fn,
    // proposed de-facto, assumed TODO
    // stack: accessor,
  },

  // 19.5.6.1.1 NativeError

  EvalError: NativeError('%EvalErrorPrototype%'),
  RangeError: NativeError('%RangeErrorPrototype%'),
  ReferenceError: NativeError('%ReferenceErrorPrototype%'),
  SyntaxError: NativeError('%SyntaxErrorPrototype%'),
  TypeError: NativeError('%TypeErrorPrototype%'),
  URIError: NativeError('%URIErrorPrototype%'),

  '%EvalErrorPrototype%': NativeErrorPrototype('EvalError'),
  '%RangeErrorPrototype%': NativeErrorPrototype('RangeError'),
  '%ReferenceErrorPrototype%': NativeErrorPrototype('ReferenceError'),
  '%SyntaxErrorPrototype%': NativeErrorPrototype('SyntaxError'),
  '%TypeErrorPrototype%': NativeErrorPrototype('TypeError'),
  '%URIErrorPrototype%': NativeErrorPrototype('URIError'),

  // *** 20 Numbers and Dates

  Number: {
    // 20.1.2 Properties of the Number Constructor
    '[[Proto]]': '%FunctionPrototype%',
    // 20.1.2.1 Number.EPSILON
    EPSILON: 'number',
    // 20.1.2.2 Number.isFinite
    isFinite: fn,
    // 20.1.2.3 Number.isInteger
    isInteger: fn,
    // 20.1.2.4 Number.isNaN
    isNaN: fn,
    // 20.1.2.5 Number.isSafeInteger
    isSafeInteger: fn,
    // 20.1.2.6 Number.MAX_SAFE_INTEGER
    MAX_SAFE_INTEGER: 'number',
    // 20.1.2.7 Number.MAX_VALUE
    MAX_VALUE: 'number',
    // 20.1.2.8 Number.MIN_SAFE_INTEGER
    MIN_SAFE_INTEGER: 'number',
    // 20.1.2.9 Number.MIN_VALUE
    MIN_VALUE: 'number',
    // 20.1.2.10 Number.NaN
    NaN: 'number',
    // 20.1.2.11 Number.NEGATIVE_INFINITY
    NEGATIVE_INFINITY: 'number',
    // 20.1.2.12 Number.parseFloat
    parseFloat: fn,
    // 20.1.2.13 Number.parseInt
    parseInt: fn,
    // 20.1.2.14 Number.POSITIVE_INFINITY
    POSITIVE_INFINITY: 'number',
    // 20.1.2.15 Number.prototype
    prototype: '%NumberPrototype%',
  },

  '%NumberPrototype%': {
    // 20.1.3 Properties of the Number Prototype Object

    // 20.1.3.1 Number.prototype.constructor
    constructor: 'Number',
    // 20.1.3.2 Number.prototype.toExponential
    toExponential: fn,
    // 20.1.3.3 Number.prototype.toFixed
    toFixed: fn,
    // 20.1.3.4 Number.prototype.toLocaleString
    toLocaleString: fn,
    // 20.1.3.5 Number.prototype.toPrecision
    toPrecision: fn,
    // 20.1.3.6 Number.prototype.toString
    toString: fn,
    // 20.1.3.7 Number.prototype.valueOf
    valueOf: fn,
  },

  BigInt: {
    // 20.2.2Properties of the BigInt Constructor
    '[[Proto]]': '%FunctionPrototype%',
    // 20.2.2.1 BigInt.asIntN
    asIntN: fn,
    // 20.2.2.2 BigInt.asUintN
    asUintN: fn,
    // 20.2.2.3 BigInt.prototype
    prototype: '%BigIntPrototype%',
  },

  '%BigIntPrototype%': {
    // 20.2.3.1 BigInt.prototype.constructor
    constructor: 'BigInt',
    // 20.2.3.2 BigInt.prototype.toLocaleString
    toLocaleString: fn,
    // 20.2.3.3 BigInt.prototype.toString
    toString: fn,
    // 20.2.3.4 BigInt.prototype.valueOf
    valueOf: fn,
    // 20.2.3.5 BigInt.prototype [ @@toStringTag ]
    '@@toStringTag': 'string',
  },

  '%InitialMath%': {
    ...SharedMath,
    // 20.3.2.27Math.random
    random: fn,
  },

  '%SharedMath%': SharedMath,

  '%InitialDate%': {
    // 20.4.3 Properties of the Date Constructor
    '[[Proto]]': '%FunctionPrototype%',
    // 20.4.3.1 Date.now
    now: fn,
    // 20.4.3.2 Date.parse
    parse: fn,
    // 20.4.3.3 Date.prototype
    prototype: '%DatePrototype%',
    // 20.4.3.4 Date.UTC
    UTC: fn,
  },

  '%SharedDate%': {
    // 20.4.3 Properties of the Date Constructor
    '[[Proto]]': '%FunctionPrototype%',
    // 20.4.3.1 Date.now
    now: fn,
    // 20.4.3.2 Date.parse
    parse: fn,
    // 20.4.3.3 Date.prototype
    prototype: '%DatePrototype%',
    // 20.4.3.4 Date.UTC
    UTC: fn,
  },

  '%DatePrototype%': {
    // 20.4.4.1 Date.prototype.constructor
    constructor: '%SharedDate%',
    // 20.4.4.2 Date.prototype.getDate
    getDate: fn,
    // 20.4.4.3 Date.prototype.getDay
    getDay: fn,
    // 20.4.4.4 Date.prototype.getFullYear
    getFullYear: fn,
    // 20.4.4.5 Date.prototype.getHours
    getHours: fn,
    // 20.4.4.6 Date.prototype.getMilliseconds
    getMilliseconds: fn,
    // 20.4.4.7 Date.prototype.getMinutes
    getMinutes: fn,
    // 20.4.4.8 Date.prototype.getMonth
    getMonth: fn,
    // 20.4.4.9 Date.prototype.getSeconds
    getSeconds: fn,
    // 20.4.4.10 Date.prototype.getTime
    getTime: fn,
    // 20.4.4.11 Date.prototype.getTimezoneOffset
    getTimezoneOffset: fn,
    // 20.4.4.12 Date.prototype.getUTCDate
    getUTCDate: fn,
    // 20.4.4.13 Date.prototype.getUTCDay
    getUTCDay: fn,
    // 20.4.4.14 Date.prototype.getUTCFullYear
    getUTCFullYear: fn,
    // 20.4.4.15 Date.prototype.getUTCHours
    getUTCHours: fn,
    // 20.4.4.16 Date.prototype.getUTCMilliseconds
    getUTCMilliseconds: fn,
    // 20.4.4.17 Date.prototype.getUTCMinutes
    getUTCMinutes: fn,
    // 20.4.4.18 Date.prototype.getUTCMonth
    getUTCMonth: fn,
    // 20.4.4.19 Date.prototype.getUTCSeconds
    getUTCSeconds: fn,
    // 20.4.4.20 Date.prototype.setDate
    setDate: fn,
    // 20.4.4.21 Date.prototype.setFullYear
    setFullYear: fn,
    // 20.4.4.22 Date.prototype.setHours
    setHours: fn,
    // 20.4.4.23 Date.prototype.setMilliseconds
    setMilliseconds: fn,
    // 20.4.4.24 Date.prototype.setMinutes
    setMinutes: fn,
    // 20.4.4.25 Date.prototype.setMonth
    setMonth: fn,
    // 20.4.4.26 Date.prototype.setSeconds
    setSeconds: fn,
    // 20.4.4.27 Date.prototype.setTime
    setTime: fn,
    // 20.4.4.28 Date.prototype.setUTCDate
    setUTCDate: fn,
    // 20.4.4.29 Date.prototype.setUTCFullYear
    setUTCFullYear: fn,
    // 20.4.4.30 Date.prototype.setUTCHours
    setUTCHours: fn,
    // 20.4.4.31 Date.prototype.setUTCMilliseconds
    setUTCMilliseconds: fn,
    // 20.4.4.32 Date.prototype.setUTCMinutes
    setUTCMinutes: fn,
    // 20.4.4.33 Date.prototype.setUTCMonth
    setUTCMonth: fn,
    // 20.4.4.34 Date.prototype.setUTCSeconds
    setUTCSeconds: fn,
    // 20.4.4.35 Date.prototype.toDateString
    toDateString: fn,
    // 20.4.4.36 Date.prototype.toISOString
    toISOString: fn,
    // 20.4.4.37 Date.prototype.toJSON
    toJSON: fn,
    // 20.4.4.38 Date.prototype.toLocaleDateString
    toLocaleDateString: fn,
    // 20.4.4.39 Date.prototype.toLocaleString
    toLocaleString: fn,
    // 20.4.4.40 Date.prototype.toLocaleTimeString
    toLocaleTimeString: fn,
    // 20.4.4.41 Date.prototype.toString
    toString: fn,
    // 20.4.4.42 Date.prototype.toTimeString
    toTimeString: fn,
    // 20.4.4.43 Date.prototype.toUTCString
    toUTCString: fn,
    // 20.4.4.44 Date.prototype.valueOf
    valueOf: fn,
    // 20.4.4.45 Date.prototype [ @@toPrimitive ]
    '@@toPrimitive': fn,

    // B.2.4 Additional Properties of the Date.prototype Object

    // B.2.4.1 Date.prototype.getYear
    getYear: fn,
    // B.2.4.2 Date.prototype.setYear
    setYear: fn,
    // B.2.4.3 Date.prototype.toGMTString
    toGMTString: fn,
  },

  // 21 Text Processing

  String: {
    // 21.1.2 Properties of the String Constructor
    '[[Proto]]': '%FunctionPrototype%',
    // 21.1.2.1 String.fromCharCode
    fromCharCode: fn,
    // 21.1.2.2 String.fromCodePoint
    fromCodePoint: fn,
    // 21.1.2.3 String.prototype
    prototype: '%StringPrototype%',
    // 21.1.2.4 String.raw
    raw: fn,
  },

  '%StringPrototype%': {
    // 21.1.3 Properties of the String Prototype Object
    length: 'number',
    // 21.1.3.1 String.prototype.charAt
    charAt: fn,
    // 21.1.3.2 String.prototype.charCodeAt
    charCodeAt: fn,
    // 21.1.3.3 String.prototype.codePointAt
    codePointAt: fn,
    // 21.1.3.4 String.prototype.concat
    concat: fn,
    // 21.1.3.5 String.prototype.constructor
    constructor: 'String',
    // 21.1.3.6 String.prototype.endsWith
    endsWith: fn,
    // 21.1.3.7 String.prototype.includes
    includes: fn,
    // 21.1.3.8 String.prototype.indexOf
    indexOf: fn,
    // 21.1.3.9 String.prototype.lastIndexOf
    lastIndexOf: fn,
    // 21.1.3.10 String.prototype.localeCompare
    localeCompare: fn,
    // 21.1.3.11 String.prototype.match
    match: fn,
    // 21.1.3.12 String.prototype.matchAll
    matchAll: fn,
    // 21.1.3.13 String.prototype.normalize
    normalize: fn,
    // 21.1.3.14 String.prototype.padEnd
    padEnd: fn,
    // 21.1.3.15 String.prototype.padStart
    padStart: fn,
    // 21.1.3.16 String.prototype.repeat
    repeat: fn,
    // 21.1.3.17 String.prototype.replace
    replace: fn,
    // 21.1.3.18 String.prototype.search
    search: fn,
    // 21.1.3.19 String.prototype.slice
    slice: fn,
    // 21.1.3.20 String.prototype.split
    split: fn,
    // 21.1.3.21 String.prototype.startsWith
    startsWith: fn,
    // 21.1.3.22 String.prototype.substring
    substring: fn,
    // 21.1.3.23 String.prototype.toLocaleLowerCase
    toLocaleLowerCase: fn,
    // 21.1.3.24 String.prototype.toLocaleUpperCase
    toLocaleUpperCase: fn,
    // 21.1.3.25 String.prototype.toLowerCase
    toLowerCase: fn,
    // 21.1.3.26 String.prototype.
    toString: fn,
    // 21.1.3.27 String.prototype.toUpperCase
    toUpperCase: fn,
    // 21.1.3.28 String.prototype.trim
    trim: fn,
    // 21.1.3.29 String.prototype.trimEnd
    trimEnd: fn,
    // 21.1.3.30 String.prototype.trimStart
    trimStart: fn,
    // 21.1.3.31 String.prototype.valueOf
    valueOf: fn,
    // 21.1.3.32 String.prototype [ @@iterator ]
    '@@iterator': fn,

    // B.2.3 Additional Properties of the String.prototype Object

    // B.2.3.1 String.prototype.substr
    substr: fn,
    // B.2.3.2 String.prototype.anchor
    anchor: fn,
    // B.2.3.3 String.prototype.big
    big: fn,
    // B.2.3.4 String.prototype.blink
    blink: fn,
    // B.2.3.5 String.prototype.bold
    bold: fn,
    // B.2.3.6 String.prototype.fixed
    fixed: fn,
    // B.2.3.7 String.prototype.fontcolor
    fontcolor: fn,
    // B.2.3.8 String.prototype.fontsize
    fontsize: fn,
    // B.2.3.9 String.prototype.italics
    italics: fn,
    // B.2.3.10 String.prototype.link
    link: fn,
    // B.2.3.11 String.prototype.small
    small: fn,
    // B.2.3.12 String.prototype.strike
    strike: fn,
    // B.2.3.13 String.prototype.sub
    sub: fn,
    // B.2.3.14 String.prototype.sup
    sup: fn,
    // B.2.3.15 String.prototype.trimLeft
    trimLeft: fn,
    // B.2.3.15 String.prototype.trimRight
    trimRight: fn,
  },

  '%StringIteratorPrototype%': {
    // 21.1.5.2 he %StringIteratorPrototype% Object
    '[[Proto]]': '%IteratorPrototype%',
    // 21.1.5.2.1 %StringIteratorPrototype%.next ( )
    next: fn,
    // 21.1.5.2.2 %StringIteratorPrototype% [ @@toStringTag ]
    '@@toStringTag': 'string',
  },

  '%InitialRegExp%': {
    // 21.2.4 Properties of the RegExp Constructor
    '[[Proto]]': '%FunctionPrototype%',
    // 21.2.4.1 RegExp.prototype
    prototype: '%RegExpPrototype%',
    // 21.2.4.2 get RegExp [ @@species ]
    '@@species': getter,

    // The https://github.com/tc39/proposal-regexp-legacy-features
    // are all optional, unsafe, and omitted
    input: false,
    $_: false,
    lastMatch: false,
    '$&': false,
    lastParen: false,
    '$+': false,
    leftContext: false,
    '$`': false,
    rightContext: false,
    "$'": false,
    $1: false,
    $2: false,
    $3: false,
    $4: false,
    $5: false,
    $6: false,
    $7: false,
    $8: false,
    $9: false,
  },

  '%SharedRegExp%': {
    // 21.2.4 Properties of the RegExp Constructor
    '[[Proto]]': '%FunctionPrototype%',
    // 21.2.4.1 RegExp.prototype
    prototype: '%RegExpPrototype%',
    // 21.2.4.2 get RegExp [ @@species ]
    '@@species': getter,
  },

  '%RegExpPrototype%': {
    // 21.2.5 Properties of the RegExp Prototype Object
    // 21.2.5.1 RegExp.prototype.constructor
    constructor: '%SharedRegExp%',
    // 21.2.5.2 RegExp.prototype.exec
    exec: fn,
    // 21.2.5.3 get RegExp.prototype.dotAll
    dotAll: getter,
    // 21.2.5.4 get RegExp.prototype.flags
    flags: getter,
    // 21.2.5.5 get RegExp.prototype.global
    global: getter,
    // 21.2.5.6 get RegExp.prototype.ignoreCase
    ignoreCase: getter,
    // 21.2.5.7 RegExp.prototype [ @@match ]
    '@@match': fn,
    // 21.2.5.8 RegExp.prototype [ @@matchAll ]
    '@@matchAll': fn,
    // 21.2.5.9 get RegExp.prototype.multiline
    multiline: getter,
    // 21.2.5.10 RegExp.prototype [ @@replace ]
    '@@replace': fn,
    // 21.2.5.11 RegExp.prototype [ @@search ]
    '@@search': fn,
    // 21.2.5.12 get RegExp.prototype.source
    source: getter,
    // 21.2.5.13 RegExp.prototype [ @@split ]
    '@@split': fn,
    // 21.2.5.14 get RegExp.prototype.sticky
    sticky: getter,
    // 21.2.5.15 RegExp.prototype.test
    test: fn,
    // 21.2.5.16 RegExp.prototype.toString
    toString: fn,
    // 21.2.5.17 get RegExp.prototype.unicode
    unicode: getter,

    // B.2.5 Additional Properties of the RegExp.prototype Object

    // B.2.5.1 RegExp.prototype.compile
    compile: false, // UNSAFE and suppressed.
  },

  '%RegExpStringIteratorPrototype%': {
    // 21.2.7.1 The %RegExpStringIteratorPrototype% Object
    '[[Proto]]': '%IteratorPrototype%',
    // 21.2.7.1.1 %RegExpStringIteratorPrototype%.next
    next: fn,
    // 21.2.7.1.2 %RegExpStringIteratorPrototype% [ @@toStringTag ]
    '@@toStringTag': 'string',
  },

  // 22 Indexed Collections

  Array: {
    // 22.1.2 Properties of the Array Constructor
    '[[Proto]]': '%FunctionPrototype%',
    // 22.1.2.1 Array.from
    from: fn,
    // 22.1.2.2 Array.isArray
    isArray: fn,
    // 22.1.2.3 Array.of
    of: fn,
    // 22.1.2.4 Array.prototype
    prototype: '%ArrayPrototype%',
    // 22.1.2.5 get Array [ @@species ]
    '@@species': getter,
  },

  '%ArrayPrototype%': {
    // 22.1.3 Properties of the Array Prototype Object
    length: 'number',
    // 22.1.3.1 Array.prototype.concat
    concat: fn,
    // 22.1.3.2 Array.prototype.constructor
    constructor: 'Array',
    // 22.1.3.3 Array.prototype.copyWithin
    copyWithin: fn,
    // 22.1.3.4 Array.prototype.entries
    entries: fn,
    // 22.1.3.5 Array.prototype.every
    every: fn,
    // 22.1.3.6 Array.prototype.fill
    fill: fn,
    // 22.1.3.7 Array.prototype.filter
    filter: fn,
    // 22.1.3.8 Array.prototype.find
    find: fn,
    // 22.1.3.9 Array.prototype.findIndex
    findIndex: fn,
    // 22.1.3.10 Array.prototype.flat
    flat: fn,
    // 22.1.3.11 Array.prototype.flatMap
    flatMap: fn,
    // 22.1.3.12 Array.prototype.forEach
    forEach: fn,
    // 22.1.3.13 Array.prototype.includes
    includes: fn,
    // 22.1.3.14 Array.prototype.indexOf
    indexOf: fn,
    // 22.1.3.15 Array.prototype.join
    join: fn,
    // 22.1.3.16 Array.prototype.keys
    keys: fn,
    // 22.1.3.17 Array.prototype.lastIndexOf
    lastIndexOf: fn,
    // 22.1.3.18 Array.prototype.map
    map: fn,
    // 22.1.3.19 Array.prototype.pop
    pop: fn,
    // 22.1.3.20 Array.prototype.push
    push: fn,
    // 22.1.3.21 Array.prototype.reduce
    reduce: fn,
    // 22.1.3.22 Array.prototype.reduceRight
    reduceRight: fn,
    // 22.1.3.23 Array.prototype.reverse
    reverse: fn,
    // 22.1.3.24 Array.prototype.shift
    shift: fn,
    // 22.1.3.25 Array.prototype.slice
    slice: fn,
    // 22.1.3.26 Array.prototype.some
    some: fn,
    // 22.1.3.27 Array.prototype.sort
    sort: fn,
    // 22.1.3.28 Array.prototype.splice
    splice: fn,
    // 22.1.3.29 Array.prototype.toLocaleString
    toLocaleString: fn,
    // 22.1.3.30 Array.prototype.toString
    toString: fn,
    // 22.1.3.31 Array.prototype.unshift
    unshift: fn,
    // 22.1.3.32 Array.prototype.values
    values: fn,
    // 22.1.3.33 Array.prototype [ @@iterator ]
    '@@iterator': fn,
    // 22.1.3.34 Array.prototype [ @@unscopables ]
    '@@unscopables': {
      '[[Proto]]': null,
      copyWithin: 'boolean',
      entries: 'boolean',
      fill: 'boolean',
      find: 'boolean',
      findIndex: 'boolean',
      flat: 'boolean',
      flatMap: 'boolean',
      includes: 'boolean',
      keys: 'boolean',
      values: 'boolean',
    },
  },

  '%ArrayIteratorPrototype%': {
    // 22.1.5.2 The %ArrayIteratorPrototype% Object
    '[[Proto]]': '%IteratorPrototype%',
    // 22.1.5.2.1 %ArrayIteratorPrototype%.next
    next: fn,
    // 22.1.5.2.2 %ArrayIteratorPrototype% [ @@toStringTag ]
    '@@toStringTag': 'string',
  },

  // *** 22.2 TypedArray Objects

  '%TypedArray%': {
    // 22.2.2 Properties of the %TypedArray% Intrinsic Object
    '[[Proto]]': '%FunctionPrototype%',
    // 22.2.2.1 %TypedArray%.from
    from: fn,
    // 22.2.2.2 %TypedArray%.of
    of: fn,
    // 22.2.2.3 %TypedArray%.prototype
    prototype: '%TypedArrayPrototype%',
    // 22.2.2.4 get %TypedArray% [ @@species ]
    '@@species': getter,
  },

  '%TypedArrayPrototype%': {
    // 22.2.3.1 get %TypedArray%.prototype.buffer
    buffer: getter,
    // 22.2.3.2 get %TypedArray%.prototype.byteLength
    byteLength: getter,
    // 22.2.3.3 get %TypedArray%.prototype.byteOffset
    byteOffset: getter,
    // 22.2.3.4 %TypedArray%.prototype.constructor
    constructor: '%TypedArray%',
    // 22.2.3.5 %TypedArray%.prototype.copyWithin
    copyWithin: fn,
    // 22.2.3.6 %TypedArray%.prototype.entries
    entries: fn,
    // 22.2.3.7 %TypedArray%.prototype.every
    every: fn,
    // 22.2.3.8 %TypedArray%.prototype.fill
    fill: fn,
    // 22.2.3.9 %TypedArray%.prototype.filter
    filter: fn,
    // 22.2.3.10 %TypedArray%.prototype.find
    find: fn,
    // 22.2.3.11 %TypedArray%.prototype.findIndex
    findIndex: fn,
    // 22.2.3.12 %TypedArray%.prototype.forEach
    forEach: fn,
    // 22.2.3.13 %TypedArray%.prototype.includes
    includes: fn,
    // 22.2.3.14 %TypedArray%.prototype.indexOf
    indexOf: fn,
    // 22.2.3.15 %TypedArray%.prototype.join
    join: fn,
    // 22.2.3.16 %TypedArray%.prototype.keys
    keys: fn,
    // 22.2.3.17 %TypedArray%.prototype.lastIndexOf
    lastIndexOf: fn,
    // 22.2.3.18 get %TypedArray%.prototype.length
    length: getter,
    // 22.2.3.19 %TypedArray%.prototype.map
    map: fn,
    // 22.2.3.20 %TypedArray%.prototype.reduce
    reduce: fn,
    // 22.2.3.21 %TypedArray%.prototype.reduceRight
    reduceRight: fn,
    // 22.2.3.22 %TypedArray%.prototype.reverse
    reverse: fn,
    // 22.2.3.23 %TypedArray%.prototype.set
    set: fn,
    // 22.2.3.24 %TypedArray%.prototype.slice
    slice: fn,
    // 22.2.3.25 %TypedArray%.prototype.some
    some: fn,
    // 22.2.3.26 %TypedArray%.prototype.sort
    sort: fn,
    // 22.2.3.27 %TypedArray%.prototype.subarray
    subarray: fn,
    // 22.2.3.28 %TypedArray%.prototype.toLocaleString
    toLocaleString: fn,
    // 22.2.3.29 %TypedArray%.prototype.toString
    toString: fn,
    // 22.2.3.30 %TypedArray%.prototype.values
    values: fn,
    // 22.2.3.31 %TypedArray%.prototype [ @@iterator ]
    '@@iterator': fn,
    // 22.2.3.32 get %TypedArray%.prototype [ @@toStringTag ]
    '@@toStringTag': getter,
  },

  // 22.2.4 The TypedArray Constructors

  BigInt64Array: TypedArray('%BigInt64ArrayPrototype%'),
  BigUint64Array: TypedArray('%BigUint64ArrayPrototype%'),
  Float32Array: TypedArray('%Float32ArrayPrototype%'),
  Float64Array: TypedArray('%Float64ArrayPrototype%'),
  Int16Array: TypedArray('%Int16ArrayPrototype%'),
  Int32Array: TypedArray('%Int32ArrayPrototype%'),
  Int8Array: TypedArray('%Int8ArrayPrototype%'),
  Uint16Array: TypedArray('%Uint16ArrayPrototype%'),
  Uint32Array: TypedArray('%Uint32ArrayPrototype%'),
  Uint8Array: TypedArray('%Uint8ArrayPrototype%'),
  Uint8ClampedArray: TypedArray('%Uint8ClampedArrayPrototype%'),

  '%BigInt64ArrayPrototype%': TypedArrayPrototype('BigInt64Array'),
  '%BigUint64ArrayPrototype%': TypedArrayPrototype('BigUint64Array'),
  '%Float32ArrayPrototype%': TypedArrayPrototype('Float32Array'),
  '%Float64ArrayPrototype%': TypedArrayPrototype('Float64Array'),
  '%Int16ArrayPrototype%': TypedArrayPrototype('Int16Array'),
  '%Int32ArrayPrototype%': TypedArrayPrototype('Int32Array'),
  '%Int8ArrayPrototype%': TypedArrayPrototype('Int8Array'),
  '%Uint16ArrayPrototype%': TypedArrayPrototype('Uint16Array'),
  '%Uint32ArrayPrototype%': TypedArrayPrototype('Uint32Array'),
  '%Uint8ArrayPrototype%': TypedArrayPrototype('Uint8Array'),
  '%Uint8ClampedArrayPrototype%': TypedArrayPrototype('Uint8ClampedArray'),

  // *** 23 Keyed Collections

  Map: {
    // 23.1.2 Properties of the Map Constructor
    '[[Proto]]': '%FunctionPrototype%',
    // 23.2.2.2 get Set [ @@species ]
    '@@species': getter,
    prototype: '%MapPrototype%',
  },

  '%MapPrototype%': {
    // 23.1.3.1 Map.prototype.clear
    clear: fn,
    // 23.1.3.2 Map.prototype.constructor
    constructor: 'Map',
    // 23.1.3.3 Map.prototype.delete
    delete: fn,
    // 23.1.3.4 Map.prototype.entries
    entries: fn,
    // 23.1.3.5 Map.prototype.forEach
    forEach: fn,
    // 23.1.3.6 Map.prototype.get
    get: fn,
    // 23.1.3.7 Map.prototype.has
    has: fn,
    // 23.1.3.8 Map.prototype.keys
    keys: fn,
    // 23.1.3.9 Map.prototype.set
    set: fn,
    // 23.1.3.10 get Map.prototype.size
    size: getter,
    // 23.1.3.11 Map.prototype.values
    values: fn,
    // 23.1.3.12Map.prototype [ @@iterator ]
    '@@iterator': fn,
    // 23.1.3.13Map.prototype [ @@toStringTag ]
    '@@toStringTag': 'string',
  },

  '%MapIteratorPrototype%': {
    // 23.1.5.2 The %MapIteratorPrototype% Object
    '[[Proto]]': '%IteratorPrototype%',
    // 23.1.5.2.1 %MapIteratorPrototype%.next
    next: fn,
    // 23.1.5.2.2 %MapIteratorPrototype% [ @@toStringTag ]
    '@@toStringTag': 'string',
  },

  Set: {
    // 23.2.2 Properties of the Set Constructor
    '[[Proto]]': '%FunctionPrototype%',
    // 23.2.2.1 Set.prototype
    prototype: '%SetPrototype%',
    // 23.2.2.2 get Set [ @@species ]
    '@@species': getter,
  },

  '%SetPrototype%': {
    // 23.2.3.1 Set.prototype.add
    add: fn,
    // 23.2.3.2 Set.prototype.clear
    clear: fn,
    // 23.2.3.3 Set.prototype.constructor
    constructor: 'Set',
    // 23.2.3.4 Set.prototype.delete
    delete: fn,
    // 23.2.3.5 Set.prototype.entries
    entries: fn,
    // 23.2.3.6Set.prototype.forEach
    forEach: fn,
    // 23.2.3.7 Set.prototype.has
    has: fn,
    // 23.2.3.8 Set.prototype.keys
    keys: fn,
    // 23.2.3.9 get Set.prototype.size
    size: getter,
    // 23.2.3.10 Set.prototype.values
    values: fn,
    // 3.2.3.11 Set.prototype [ @@iterator ]
    '@@iterator': fn,
    // 23.2.3.12 Set.prototype [ @@toStringTag ]
    '@@toStringTag': 'string',
  },

  '%SetIteratorPrototype%': {
    // 23.2.5.2 The %SetIteratorPrototype% Object
    '[[Proto]]': '%IteratorPrototype%',
    // 23.2.5.2.1 %SetIteratorPrototype%.next
    next: fn,
    // 23.2.5.2.2 %SetIteratorPrototype% [ @@toStringTag ]
    '@@toStringTag': 'string',
  },

  WeakMap: {
    // 23.3.2 Properties of the WeakMap Constructor
    '[[Proto]]': '%FunctionPrototype%',
    // 23.3.2.1 WeakMap.prototype
    prototype: '%WeakMapPrototype%',
  },

  '%WeakMapPrototype%': {
    // 23.3.3.1 WeakMap.prototype.constructor
    constructor: 'WeakMap',
    // 23.3.3.2 WeakMap.prototype.delete
    delete: fn,
    // 23.3.3.3 WeakMap.prototype.get
    get: fn,
    // 23.3.3.4 WeakMap.prototype.has
    has: fn,
    // 23.3.3.5 WeakMap.prototype.set
    set: fn,
    // 23.3.3.6 WeakMap.prototype [ @@toStringTag ]
    '@@toStringTag': 'string',
  },

  WeakSet: {
    // 23.4.2Properties of the WeakSet Constructor
    '[[Proto]]': '%FunctionPrototype%',
    // 23.4.2.1 WeakSet.prototype
    prototype: '%WeakSetPrototype%',
  },

  '%WeakSetPrototype%': {
    // 23.4.3.1 WeakSet.prototype.add
    add: fn,
    // 23.4.3.2 WeakSet.prototype.constructor
    constructor: 'WeakSet',
    // 23.4.3.3 WeakSet.prototype.delete
    delete: fn,
    // 23.4.3.4 WeakSet.prototype.has
    has: fn,
    // 23.4.3.5 WeakSet.prototype [ @@toStringTag ]
    '@@toStringTag': 'string',
  },

  // *** 24 Structured Data

  ArrayBuffer: {
    // 24.1.3 Properties of the ArrayBuffer Constructor
    '[[Proto]]': '%FunctionPrototype%',
    // 24.1.3.1 ArrayBuffer.isView
    isView: fn,
    // 24.1.3.2 ArrayBuffer.prototype
    prototype: '%ArrayBufferPrototype%',
    // 24.1.3.3 get ArrayBuffer [ @@species ]
    '@@species': getter,
  },

  '%ArrayBufferPrototype%': {
    // 24.1.4.1 get ArrayBuffer.prototype.byteLength
    byteLength: getter,
    // 24.1.4.2 ArrayBuffer.prototype.constructor
    constructor: 'ArrayBuffer',
    // 24.1.4.3 ArrayBuffer.prototype.slice
    slice: fn,
    // 24.1.4.4 ArrayBuffer.prototype [ @@toStringTag ]
    '@@toStringTag': 'string',
  },

  // 24.2 SharedArrayBuffer Objects
  SharedArrayBuffer: false, // UNSAFE and purposely suppressed.
  '%SharedArrayBufferPrototype%': false, // UNSAFE and purposely suppressed.

  DataView: {
    // 24.3.3 Properties of the DataView Constructor
    '[[Proto]]': '%FunctionPrototype%',
    // 24.3.3.1 DataView.prototype
    prototype: '%DataViewPrototype%',
  },

  '%DataViewPrototype%': {
    // 24.3.4.1 get DataView.prototype.buffer
    buffer: getter,
    // 24.3.4.2 get DataView.prototype.byteLength
    byteLength: getter,
    // 24.3.4.3 get DataView.prototype.byteOffset
    byteOffset: getter,
    // 24.3.4.4 DataView.prototype.constructor
    constructor: 'DataView',
    // 24.3.4.5 DataView.prototype.getBigInt64
    getBigInt64: fn,
    // 24.3.4.6 DataView.prototype.getBigUint64
    getBigUint64: fn,
    // 24.3.4.7 DataView.prototype.getFloat32
    getFloat32: fn,
    // 24.3.4.8 DataView.prototype.getFloat64
    getFloat64: fn,
    // 24.3.4.9 DataView.prototype.getInt8
    getInt8: fn,
    // 24.3.4.10 DataView.prototype.getInt16
    getInt16: fn,
    // 24.3.4.11 DataView.prototype.getInt32
    getInt32: fn,
    // 24.3.4.12 DataView.prototype.getUint8
    getUint8: fn,
    // 24.3.4.13 DataView.prototype.getUint16
    getUint16: fn,
    // 24.3.4.14 DataView.prototype.getUint32
    getUint32: fn,
    // 24.3.4.15 DataView.prototype.setBigInt64
    setBigInt64: fn,
    // 24.3.4.16 DataView.prototype.setBigUint64
    setBigUint64: fn,
    // 24.3.4.17 DataView.prototype.setFloat32
    setFloat32: fn,
    // 24.3.4.18 DataView.prototype.setFloat64
    setFloat64: fn,
    // 24.3.4.19 DataView.prototype.setInt8
    setInt8: fn,
    // 24.3.4.20 DataView.prototype.setInt16
    setInt16: fn,
    // 24.3.4.21 DataView.prototype.setInt32
    setInt32: fn,
    // 24.3.4.22 DataView.prototype.setUint8
    setUint8: fn,
    // 24.3.4.23 DataView.prototype.setUint16
    setUint16: fn,
    // 24.3.4.24 DataView.prototype.setUint32
    setUint32: fn,
    // 24.3.4.25 DataView.prototype [ @@toStringTag ]
    '@@toStringTag': 'string',
  },

  // 24.4 Atomics
  Atomics: false, // UNSAFE and suppressed.

  JSON: {
    // 24.5.1 JSON.parse
    parse: fn,
    // 24.5.2 JSON.stringify
    stringify: fn,
    // 24.5.3 JSON [ @@toStringTag ]
    '@@toStringTag': 'string',
  },

  // *** 25 Control Abstraction Objects

  '%IteratorPrototype%': {
    // 25.1.2 The %IteratorPrototype% Object
    // 25.1.2.1 %IteratorPrototype% [ @@iterator ]
    '@@iterator': fn,
  },

  '%AsyncIteratorPrototype%': {
    // 25.1.3 The %AsyncIteratorPrototype% Object
    // 25.1.3.1 %AsyncIteratorPrototype% [ @@asyncIterator ]
    '@@asyncIterator': fn,
  },

  '%InertGeneratorFunction%': {
    // 25.2.2 Properties of the GeneratorFunction Constructor
    '[[Proto]]': '%InertFunction%',
    // 25.2.2.2 GeneratorFunction.prototype
    prototype: '%Generator%',
  },

  '%Generator%': {
    // 25.2.3 Properties of the GeneratorFunction Prototype Object
    '[[Proto]]': '%FunctionPrototype%',
    // 25.2.3.1 GeneratorFunction.prototype.constructor
    constructor: '%InertGeneratorFunction%',
    // 25.2.3.2 GeneratorFunction.prototype.prototype
    prototype: '%GeneratorPrototype%',
    // 25.2.3.3 GeneratorFunction.prototype [ @@toStringTag ]
    '@@toStringTag': 'string',
  },

  '%InertAsyncGeneratorFunction%': {
    // 25.3.2 Properties of the AsyncGeneratorFunction Constructor
    '[[Proto]]': '%InertFunction%',
    // 25.3.2.2 AsyncGeneratorFunction.prototype
    prototype: '%AsyncGenerator%',
  },

  '%AsyncGenerator%': {
    // 25.3.3 Properties of the AsyncGeneratorFunction Prototype Object
    '[[Proto]]': '%FunctionPrototype%',
    // 25.3.3.1 AsyncGeneratorFunction.prototype.constructor
    constructor: '%InertAsyncGeneratorFunction%',
    // 25.3.3.2 AsyncGeneratorFunction.prototype.prototype
    prototype: '%AsyncGeneratorPrototype%',
    // 25.3.3.3 AsyncGeneratorFunction.prototype [ @@toStringTag ]
    '@@toStringTag': 'string',
  },

  '%GeneratorPrototype%': {
    // 25.4.1 Properties of the Generator Prototype Object
    '[[Proto]]': '%IteratorPrototype%',
    // 25.4.1.1 Generator.prototype.constructor
    constructor: '%Generator%',
    // 25.4.1.2 Generator.prototype.next
    next: fn,
    // 25.4.1.3 Generator.prototype.return
    return: fn,
    // 25.4.1.4 Generator.prototype.throw
    throw: fn,
    // 25.4.1.5 Generator.prototype [ @@toStringTag ]
    '@@toStringTag': 'string',
  },

  '%AsyncGeneratorPrototype%': {
    // 25.5.1 Properties of the AsyncGenerator Prototype Object
    '[[Proto]]': '%AsyncIteratorPrototype%',
    // 25.5.1.1 AsyncGenerator.prototype.constructor
    constructor: '%AsyncGenerator%',
    // 25.5.1.2 AsyncGenerator.prototype.next
    next: fn,
    // 25.5.1.3 AsyncGenerator.prototype.return
    return: fn,
    // 25.5.1.4 AsyncGenerator.prototype.throw
    throw: fn,
    // 25.5.1.5 AsyncGenerator.prototype [ @@toStringTag ]
    '@@toStringTag': 'string',
  },

  // TODO: To be replaced with Promise.delegate
  //
  // The HandledPromise global variable shimmed by `@agoric/eventual-send/shim`
  // implements an initial version of the eventual send specification at:
  // https://github.com/tc39/proposal-eventual-send
  //
  // We will likely change this to add a property to Promise called
  // Promise.delegate and put static methods on it, which will necessitate
  // another whitelist change to update to the current proposed standard.
  HandledPromise: {
    '[[Proto]]': 'Promise',
    applyFunction: fn,
    applyFunctionSendOnly: fn,
    applyMethod: fn,
    applyMethodSendOnly: fn,
    get: fn,
    getSendOnly: fn,
    prototype: '%PromisePrototype%',
    resolve: fn,
  },

  Promise: {
    // 25.6.4 Properties of the Promise Constructor
    '[[Proto]]': '%FunctionPrototype%',
    // 25.6.4.1 Promise.all
    all: fn,
    // 25.6.4.2 Promise.allSettled
    allSettled: fn,
    // 25.6.4.3Promise.prototype
    prototype: '%PromisePrototype%',
    // 25.6.4.4 Promise.race
    race: fn,
    // 25.6.4.5 Promise.reject
    reject: fn,
    // 25.6.4.6 Promise.resolve
    resolve: fn,
    // 25.6.4.7 get Promise [ @@species ]
    '@@species': getter,
  },

  '%PromisePrototype%': {
    // 25.6.5 Properties of the Promise Prototype Object
    // 25.6.5.1 Promise.prototype.catch
    catch: fn,
    // 25.6.5.2 Promise.prototype.constructor
    constructor: 'Promise',
    // 25.6.5.3 Promise.prototype.finally
    finally: fn,
    // 25.6.5.4 Promise.prototype.then
    then: fn,
    // 25.6.5.5 Promise.prototype [ @@toStringTag ]
    '@@toStringTag': 'string',
  },

  '%InertAsyncFunction%': {
    // 25.7.2 Properties of the AsyncFunction Constructor
    '[[Proto]]': '%InertFunction%',
    // 25.7.2.2 AsyncFunction.prototype
    prototype: '%AsyncFunctionPrototype%',
  },

  '%AsyncFunctionPrototype%': {
    // 25.7.3 Properties of the AsyncFunction Prototype Object
    '[[Proto]]': '%FunctionPrototype%',
    // 25.7.3.1 AsyncFunction.prototype.constructor
    constructor: '%InertAsyncFunction%',
    // 25.7.3.2 AsyncFunction.prototype [ @@toStringTag ]
    '@@toStringTag': 'string',
  },

  // 26 Reflection

  Reflect: {
    // 26.1 The Reflect Object
    // Not a function object.
    // 26.1.1 Reflect.apply
    apply: fn,
    // 26.1.2 Reflect.construct
    construct: fn,
    // 26.1.3 Reflect.defineProperty
    defineProperty: fn,
    // 26.1.4 Reflect.deleteProperty
    deleteProperty: fn,
    // 26.1.5 Reflect.get
    get: fn,
    // 26.1.6 Reflect.getOwnPropertyDescriptor
    getOwnPropertyDescriptor: fn,
    // 26.1.7 Reflect.getPrototypeOf
    getPrototypeOf: fn,
    // 26.1.8 Reflect.has
    has: fn,
    // 26.1.9 Reflect.isExtensible
    isExtensible: fn,
    // 26.1.10 Reflect.ownKeys
    ownKeys: fn,
    // 26.1.11 Reflect.preventExtensions
    preventExtensions: fn,
    // 26.1.12 Reflect.set
    set: fn,
    // 26.1.13 Reflect.setPrototypeOf
    setPrototypeOf: fn,
  },

  Proxy: {
    // 26.2.2 Properties of the Proxy Constructor
    '[[Proto]]': '%FunctionPrototype%',
    // 26.2.2.1 Proxy.revocable
    revocable: fn,
  },

  // Appendix B

  // B.2.1 Additional Properties of the Global Object

  // B.2.1.1 escape
  escape: fn,
  // B.2.1.2 unescape (
  unescape: fn,

  // ESNext

  '%UniqueCompartment%': {
    '[[Proto]]': '%FunctionPrototype%',
    prototype: '%CompartmentPrototype%',
    toString: fn,
  },

  '%InertCompartment%': {
    '[[Proto]]': '%FunctionPrototype%',
    prototype: '%CompartmentPrototype%',
    toString: fn,
  },

  '%CompartmentPrototype%': {
    constructor: '%InertCompartment%',
    evaluate: fn,
    globalThis: getter,
    name: getter,
    // Should this be proposed?
    toString: fn,
  },

  lockdown: fn,
  harden: fn,

  '%InitialGetStackString%': fn,
};

// Like defineProperty, but throws if it would modify an existing property.
// We use this to ensure that two conflicting attempts to define the same
// property throws, causing SES initialization to fail. Otherwise, a
// conflict between, for example, two of SES's internal whitelists might
// get masked as one overwrites the other. Accordingly, the thrown error
// complains of a "Conflicting definition".
function initProperty(obj, name, desc) {
  if (objectHasOwnProperty(obj, name)) {
    const preDesc = getOwnPropertyDescriptor(obj, name);
    if (
      !Object.is(preDesc.value, desc.value) ||
      preDesc.get !== desc.get ||
      preDesc.set !== desc.set ||
      preDesc.writable !== desc.writable ||
      preDesc.enumerable !== desc.enumerable ||
      preDesc.configurable !== desc.configurable
    ) {
      throw new Error(`Conflicting definitions of ${name}`);
    }
  }
  defineProperty(obj, name, desc);
}

// Like defineProperties, but throws if it would modify an existing property.
// This ensures that the intrinsics added to the intrinsics collector object
// graph do not overlap.
function initProperties(obj, descs) {
  for (const [name, desc] of entries(descs)) {
    initProperty(obj, name, desc);
  }
}

// sampleGlobals creates an intrinsics object, suitable for
// interinsicsCollector.addIntrinsics, from the named properties of a global
// object.
function sampleGlobals(globalObject, newPropertyNames) {
  const newIntrinsics = { __proto__: null };
  for (const [globalName, intrinsicName] of entries(newPropertyNames)) {
    if (objectHasOwnProperty(globalObject, globalName)) {
      newIntrinsics[intrinsicName] = globalObject[globalName];
    }
  }
  return newIntrinsics;
}

function makeIntrinsicsCollector() {
  const intrinsics = { __proto__: null };
  let pseudoNatives;

  const intrinsicsCollector = {
    addIntrinsics(newIntrinsics) {
      initProperties(intrinsics, getOwnPropertyDescriptors(newIntrinsics));
    },

    // For each intrinsic, if it has a `.prototype` property, use the
    // whitelist to find out the intrinsic name for that prototype and add it
    // to the intrinsics.
    completePrototypes() {
      for (const [name, intrinsic] of entries(intrinsics)) {
        if (intrinsic !== Object(intrinsic)) {
          // eslint-disable-next-line no-continue
          continue;
        }
        if (!objectHasOwnProperty(intrinsic, 'prototype')) {
          // eslint-disable-next-line no-continue
          continue;
        }
        const permit = whitelist[name];
        if (typeof permit !== 'object') {
          throw new Error(`Expected permit object at whitelist.${name}`);
        }
        const namePrototype = permit.prototype;
        if (!namePrototype) {
          throw new Error(`${name}.prototype property not whitelisted`);
        }
        if (
          typeof namePrototype !== 'string' ||
          !objectHasOwnProperty(whitelist, namePrototype)
        ) {
          throw new Error(`Unrecognized ${name}.prototype whitelist entry`);
        }
        const intrinsicPrototype = intrinsic.prototype;
        if (objectHasOwnProperty(intrinsics, namePrototype)) {
          if (intrinsics[namePrototype] !== intrinsicPrototype) {
            throw new Error(`Conflicting bindings of ${namePrototype}`);
          }
          // eslint-disable-next-line no-continue
          continue;
        }
        intrinsics[namePrototype] = intrinsicPrototype;
      }
    },
    finalIntrinsics() {
      freeze(intrinsics);
      pseudoNatives = new WeakSet(
        values(intrinsics).filter(obj => typeof obj === 'function'),
      );
      return intrinsics;
    },
    isPseudoNative(obj) {
      if (!pseudoNatives) {
        throw new Error(
          `isPseudoNative can only be called after finalIntrinsics`,
        );
      }
      return pseudoNatives.has(obj);
    },
  };

  intrinsicsCollector.addIntrinsics(constantProperties);
  intrinsicsCollector.addIntrinsics(
    sampleGlobals(globalThis, universalPropertyNames),
  );

  return intrinsicsCollector;
}

/**
 * getGlobalIntrinsics()
 * Doesn't tame, delete, or modify anything. Samples globalObject to create an
 * intrinsics record containing only the whitelisted global variables, listed
 * by the intrinsic names appropriate for new globals, i.e., the globals of
 * newly constructed compartments.
 *
 * WARNING:
 * If run before lockdown, the returned intrinsics record will carry the
 * *original* unsafe (feral, untamed) bindings of these global variables.
 */
function getGlobalIntrinsics(globalObject) {
  const intrinsicsCollector = makeIntrinsicsCollector();

  intrinsicsCollector.addIntrinsics(
    sampleGlobals(globalObject, sharedGlobalPropertyNames),
  );

  return intrinsicsCollector.finalIntrinsics();
}

// Adapted from SES/Caja - Copyright (C) 2011 Google Inc.
// Copyright (C) 2018 Agoric

// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// based upon:
// https://github.com/google/caja/blob/master/src/com/google/caja/ses/startSES.js
// https://github.com/google/caja/blob/master/src/com/google/caja/ses/repairES5.js
// then copied from proposal-frozen-realms deep-freeze.js
// then copied from SES/src/bundle/deepFreeze.js

const { freeze: freeze$1, getOwnPropertyDescriptors: getOwnPropertyDescriptors$1, getPrototypeOf: getPrototypeOf$1 } = Object;
const { ownKeys } = Reflect;

/**
 * Create a `harden` function.
 */
function makeHardener() {
  if (arguments.length >= 1) {
    // TODO Just a transitional test. Remove when safe to do so.
    throw new TypeError('makeHardener no longer takes any options');
  }

  // Objects that we won't freeze, either because we've frozen them already,
  // or they were one of the initial roots (terminals). These objects form
  // the "fringe" of the hardened object graph.
  const fringeSet = new WeakSet();

  const { harden } = {
    harden(root) {
      const toFreeze = new Set();
      const prototypes = new Map();
      const paths = new WeakMap();

      // If val is something we should be freezing but aren't yet,
      // add it to toFreeze.
      function enqueue(val, path) {
        if (Object(val) !== val) {
          // ignore primitives
          return;
        }
        const type = typeof val;
        if (type !== 'object' && type !== 'function') {
          // future proof: break until someone figures out what it should do
          throw new TypeError(`Unexpected typeof: ${type}`);
        }
        if (fringeSet.has(val) || toFreeze.has(val)) {
          // Ignore if this is an exit, or we've already visited it
          return;
        }
        // console.log(`adding ${val} to toFreeze`, val);
        toFreeze.add(val);
        paths.set(val, path);
      }

      function freezeAndTraverse(obj) {
        // Now freeze the object to ensure reactive
        // objects such as proxies won't add properties
        // during traversal, before they get frozen.

        // Object are verified before being enqueued,
        // therefore this is a valid candidate.
        // Throws if this fails (strict mode).
        freeze$1(obj);

        // we rely upon certain commitments of Object.freeze and proxies here

        // get stable/immutable outbound links before a Proxy has a chance to do
        // something sneaky.
        const proto = getPrototypeOf$1(obj);
        const descs = getOwnPropertyDescriptors$1(obj);
        const path = paths.get(obj) || 'unknown';

        // console.log(`adding ${proto} to prototypes under ${path}`);
        if (proto !== null && !prototypes.has(proto)) {
          prototypes.set(proto, path);
          paths.set(proto, `${path}.__proto__`);
        }

        ownKeys(descs).forEach(name => {
          const pathname = `${path}.${String(name)}`;
          // todo uncurried form
          // todo: getOwnPropertyDescriptors is guaranteed to return well-formed
          // descriptors, but they still inherit from Object.prototype. If
          // someone has poisoned Object.prototype to add 'value' or 'get'
          // properties, then a simple 'if ("value" in desc)' or 'desc.value'
          // test could be confused. We use hasOwnProperty to be sure about
          // whether 'value' is present or not, which tells us for sure that
          // this is a data property.
          const desc = descs[name];
          if ('value' in desc) {
            // todo uncurried form
            enqueue(desc.value, `${pathname}`);
          } else {
            enqueue(desc.get, `${pathname}(get)`);
            enqueue(desc.set, `${pathname}(set)`);
          }
        });
      }

      function dequeue() {
        // New values added before forEach() has finished will be visited.
        toFreeze.forEach(freezeAndTraverse); // todo curried forEach
      }

      function checkPrototypes() {
        prototypes.forEach((path, p) => {
          if (!(toFreeze.has(p) || fringeSet.has(p))) {
            // all reachable properties have already been frozen by this point
            let msg;
            try {
              msg = `prototype ${p} of ${path} is not already in the fringeSet`;
            } catch (e) {
              // `${(async _=>_).__proto__}` fails in most engines
              msg =
                'a prototype of something is not already in the fringeset (and .toString failed)';
              try {
                console.log(msg);
                console.log('the prototype:', p);
                console.log('of something:', path);
              } catch (_e) {
                // console.log might be missing in restrictive SES realms
              }
            }
            throw new TypeError(msg);
          }
        });
      }

      function commit() {
        // todo curried forEach
        // we capture the real WeakSet.prototype.add above, in case someone
        // changes it. The two-argument form of forEach passes the second
        // argument as the 'this' binding, so we add to the correct set.
        toFreeze.forEach(fringeSet.add, fringeSet);
      }

      enqueue(root);
      dequeue();
      // console.log("fringeSet", fringeSet);
      // console.log("prototype set:", prototypes);
      // console.log("toFreeze set:", toFreeze);
      checkPrototypes();
      commit();

      return root;
    },
  };

  return harden;
}

function assert(condition, errorMessage) {
  if (!condition) {
    throw new TypeError(errorMessage);
  }
}

// Copyright (C) 2011 Google Inc.

const { apply: apply$1, ownKeys: ownKeys$1 } = Reflect;
const uncurryThis$1 = fn => (thisArg, ...args) => apply$1(fn, thisArg, args);
const hasOwnProperty$1 = uncurryThis$1(Object.prototype.hasOwnProperty);

/**
 * asStringPropertyName()
 */
function asStringPropertyName(path, prop) {
  if (typeof prop === 'string') {
    return prop;
  }

  if (typeof prop === 'symbol') {
    return `@@${prop.toString().slice(14, -1)}`;
  }

  throw new TypeError(`Unexpected property name type ${path} ${prop}`);
}

/**
 * whitelistIntrinsics()
 * Removes all non-whitelisted properties found by recursively and
 * reflectively walking own property chains.
 */
function whitelistIntrinsics(intrinsics, nativeBrander) {
  // These primities are allowed allowed for permits.
  const primitives = ['undefined', 'boolean', 'number', 'string', 'symbol'];

  /**
   * whitelistPrototype()
   * Validate the object's [[prototype]] against a permit.
   */
  function whitelistPrototype(path, obj, protoName) {
    if (obj !== Object(obj)) {
      throw new TypeError(`Object expected: ${path}, ${obj}, ${protoName}`);
    }
    const proto = getPrototypeOf(obj);

    // Null prototype.
    if (proto === null && protoName === null) {
      return;
    }

    // Assert: protoName, if provided, is a string.
    if (protoName !== undefined && typeof protoName !== 'string') {
      throw new TypeError(`Malformed whitelist permit ${path}.__proto__`);
    }

    // If permit not specified, default to Object.prototype.
    if (proto === intrinsics[protoName || '%ObjectPrototype%']) {
      return;
    }

    // We can't clean [[prototype]], therefore abort.
    throw new Error(`Unexpected intrinsic ${path}.__proto__ at ${protoName}`);
  }

  /**
   * isWhitelistPropertyValue()
   * Whitelist a single property value against a permit.
   */
  function isWhitelistPropertyValue(path, value, prop, permit) {
    if (typeof permit === 'object') {
      // eslint-disable-next-line no-use-before-define
      whitelistProperties(path, value, permit);
      // The property is whitelisted.
      return true;
    }

    if (permit === false) {
      // A boolan 'false' permit specifies the removal of a property.
      // We require a more specific permit instead of allowing 'true'.
      return false;
    }

    if (typeof permit === 'string') {
      // A string permit can have one of two meanings:

      if (prop === 'prototype' || prop === 'constructor') {
        // For prototype and constructor value properties, the permit
        // is the name of an intrinsic.
        // Assumption: prototype and constructor cannot be primitives.
        // Assert: the permit is the name of an intrinsic.
        // Assert: the property value is equal to that intrinsic.

        if (hasOwnProperty$1(intrinsics, permit)) {
          if (value !== intrinsics[permit]) {
            throw new TypeError(`Does not match whitelist ${path}`);
          }
          return true;
        }
      } else {
        // For all other properties, the permit is the name of a primitive.
        // Assert: the permit is the name of a primitive.
        // Assert: the property value type is equal to that primitive.

        // eslint-disable-next-line no-lonely-if
        if (primitives.includes(permit)) {
          // eslint-disable-next-line valid-typeof
          if (typeof value !== permit) {
            throw new TypeError(
              `At ${path} expected ${permit} not ${typeof value}`,
            );
          }
          return true;
        }
      }
    }

    throw new TypeError(`Unexpected whitelist permit ${permit} at ${path}`);
  }

  /**
   * isWhitelistProperty()
   * Whitelist a single property against a permit.
   */
  function isWhitelistProperty(path, obj, prop, permit) {
    const desc = getOwnPropertyDescriptor(obj, prop);

    // Is this a value property?
    if (hasOwnProperty$1(desc, 'value')) {
      if (isAccessorPermit(permit)) {
        throw new TypeError(`Accessor expected at ${path}`);
      }
      return isWhitelistPropertyValue(path, desc.value, prop, permit);
    }
    if (!isAccessorPermit(permit)) {
      throw new TypeError(`Accessor not expected at ${path}`);
    }
    return (
      isWhitelistPropertyValue(`${path}<get>`, desc.get, prop, permit.get) &&
      isWhitelistPropertyValue(`${path}<set>`, desc.set, prop, permit.set)
    );
  }

  /**
   * getSubPermit()
   */
  function getSubPermit(obj, permit, prop) {
    const permitProp = prop === '__proto__' ? '--proto--' : prop;
    if (hasOwnProperty$1(permit, permitProp)) {
      return permit[permitProp];
    }

    if (typeof obj === 'function') {
      nativeBrander(obj);
      if (hasOwnProperty$1(FunctionInstance, permitProp)) {
        return FunctionInstance[permitProp];
      }
    }

    return undefined;
  }

  /**
   * whitelistProperties()
   * Whitelist all properties against a permit.
   */
  function whitelistProperties(path, obj, permit) {
    if (obj === undefined) {
      return;
    }

    const protoName = permit['[[Proto]]'];
    whitelistPrototype(path, obj, protoName);

    for (const prop of ownKeys$1(obj)) {
      const propString = asStringPropertyName(path, prop);
      const subPath = `${path}.${propString}`;
      const subPermit = getSubPermit(obj, permit, propString);

      if (subPermit) {
        // Property has a permit.
        if (isWhitelistProperty(subPath, obj, prop, subPermit)) {
          // Property is whitelisted.
          // eslint-disable-next-line no-continue
          continue;
        }
      }

      if (subPermit !== false) {
        // This call to `console.log` is intensional. It is not a vestige
        // of a debugging attempt. See the comment at top of file for an
        // explanation.
        console.log(`Removing ${subPath}`);
      }
      delete obj[prop];
    }
  }

  // Start path with 'intrinsics' to clarify that properties are not
  // removed from the global object by the whitelisting operation.
  whitelistProperties('intrinsics', intrinsics, whitelist);
}

// Adapted from SES/Caja - Copyright (C) 2011 Google Inc.

/**
 * Replace the legacy accessors of Object to comply with strict mode
 * and ES2016 semantics, we do this by redefining them while in 'use strict'.
 *
 * todo: list the issues resolved
 *
 * This function can be used in two ways: (1) invoked directly to fix the primal
 * realm's Object.prototype, and (2) converted to a string to be executed
 * inside each new RootRealm to fix their Object.prototypes. Evaluation requires
 * the function to have no dependencies, so don't import anything from
 * the outside.
 */

function repairLegacyAccessors() {
  try {
    // Verify that the method is not callable.
    // eslint-disable-next-line no-underscore-dangle
    (0, Object.prototype.__lookupGetter__)('x');
  } catch (ignore) {
    // Throws, no need to patch.
    return;
  }

  // On some platforms, the implementation of these functions act as
  // if they are in sloppy mode: if they're invoked badly, they will
  // expose the global object, so we need to repair these for
  // security. Thus it is our responsibility to fix this, and we need
  // to include repairAccessors. E.g. Chrome in 2016.

  function toObject(obj) {
    if (obj === undefined || obj === null) {
      throw new TypeError(`can't convert undefined or null to object`);
    }
    return Object(obj);
  }

  function asPropertyName(obj) {
    if (typeof obj === 'symbol') {
      return obj;
    }
    return `${obj}`;
  }

  function aFunction(obj, accessor) {
    if (typeof obj !== 'function') {
      throw TypeError(`invalid ${accessor} usage`);
    }
    return obj;
  }

  defineProperties(objectPrototype, {
    __defineGetter__: {
      value: function __defineGetter__(prop, func) {
        const O = toObject(this);
        defineProperty(O, prop, {
          get: aFunction(func, 'getter'),
          enumerable: true,
          configurable: true,
        });
      },
    },
    __defineSetter__: {
      value: function __defineSetter__(prop, func) {
        const O = toObject(this);
        defineProperty(O, prop, {
          set: aFunction(func, 'setter'),
          enumerable: true,
          configurable: true,
        });
      },
    },
    __lookupGetter__: {
      value: function __lookupGetter__(prop) {
        let O = toObject(this);
        prop = asPropertyName(prop);
        let desc;
        // eslint-disable-next-line no-cond-assign
        while (O && !(desc = getOwnPropertyDescriptor(O, prop))) {
          O = getPrototypeOf(O);
        }
        return desc && desc.get;
      },
    },
    __lookupSetter__: {
      value: function __lookupSetter__(prop) {
        let O = toObject(this);
        prop = asPropertyName(prop);
        let desc;
        // eslint-disable-next-line no-cond-assign
        while (O && !(desc = getOwnPropertyDescriptor(O, prop))) {
          O = getPrototypeOf(O);
        }
        return desc && desc.set;
      },
    },
  });
}

// This module replaces the original `Function` constructor, and the original
// `%GeneratorFunction%`, `%AsyncFunction%` and `%AsyncGeneratorFunction%`,
// with safe replacements that throw if invoked.
//
// These are all reachable via syntax, so it isn't sufficient to just
// replace global properties with safe versions. Our main goal is to prevent
// access to the `Function` constructor through these starting points.
//
// After modules block is done, the originals must no longer be reachable,
// unless a copy has been made, and functions can only be created by syntax
// (using eval) or by invoking a previously saved reference to the originals.
//
// Typically, this module will not be used directly, but via the
// [lockdown - shim] which handles all necessary repairs and taming in SES.
//
// Relation to ECMA specifications
//
// The taming of constructors really wants to be part of the standard, because
// new constructors may be added in the future, reachable from syntax, and this
// list must be updated to match.
//
// In addition, the standard needs to define four new intrinsics for the safe
// replacement functions. See [./whitelist intrinsics].
//
// Adapted from SES/Caja
// Copyright (C) 2011 Google Inc.
// https://github.com/google/caja/blob/master/src/com/google/caja/ses/startSES.js
// https://github.com/google/caja/blob/master/src/com/google/caja/ses/repairES5.js

/**
 * tameFunctionConstructors()
 * This block replaces the original Function constructor, and the original
 * %GeneratorFunction% %AsyncFunction% and %AsyncGeneratorFunction%, with
 * safe replacements that throw if invoked.
 */
function tameFunctionConstructors() {
  try {
    // Verify that the method is not callable.
    (0, Function.prototype.constructor)('return 1');
  } catch (ignore) {
    // Throws, no need to patch.
    return {};
  }

  const newIntrinsics = {};

  /**
   * The process to repair constructors:
   * 1. Create an instance of the function by evaluating syntax
   * 2. Obtain the prototype from the instance
   * 3. Create a substitute tamed constructor
   * 4. Replace the original constructor with the tamed constructor
   * 5. Replace tamed constructor prototype property with the original one
   * 6. Replace its [[Prototype]] slot with the tamed constructor of Function
   */
  function repairFunction(name, intrinsicName, declaration) {
    let FunctionInstance;
    try {
      // eslint-disable-next-line no-eval
      FunctionInstance = (0, eval)(declaration);
    } catch (e) {
      if (e instanceof SyntaxError) {
        // Prevent failure on platforms where async and/or generators
        // are not supported.
        return;
      }
      // Re-throw
      throw e;
    }
    const FunctionPrototype = getPrototypeOf(FunctionInstance);

    // Prevents the evaluation of source when calling constructor on the
    // prototype of functions.
    // eslint-disable-next-line func-names
    const InertConstructor = function() {
      throw new TypeError('Not available');
    };
    defineProperties(InertConstructor, {
      prototype: { value: FunctionPrototype },
      name: {
        value: name,
        writable: false,
        enumerable: false,
        configurable: true,
      },
    });

    defineProperties(FunctionPrototype, {
      constructor: { value: InertConstructor },
    });

    // Reconstructs the inheritance among the new tamed constructors
    // to mirror the original specified in normal JS.
    if (InertConstructor !== Function.prototype.constructor) {
      setPrototypeOf(InertConstructor, Function.prototype.constructor);
    }

    newIntrinsics[intrinsicName] = InertConstructor;
  }

  // Here, the order of operation is important: Function needs to be repaired
  // first since the other repaired constructors need to inherit from the
  // tamed Function function constructor.

  repairFunction('Function', '%InertFunction%', '(function(){})');
  repairFunction(
    'GeneratorFunction',
    '%InertGeneratorFunction%',
    '(function*(){})',
  );
  repairFunction(
    'AsyncFunction',
    '%InertAsyncFunction%',
    '(async function(){})',
  );
  repairFunction(
    'AsyncGeneratorFunction',
    '%InertAsyncGeneratorFunction%',
    '(async function*(){})',
  );

  return newIntrinsics;
}

function tameDateConstructor(dateTaming = 'safe') {
  if (dateTaming !== 'safe' && dateTaming !== 'unsafe') {
    throw new Error(`unrecognized dateTaming ${dateTaming}`);
  }
  const OriginalDate = Date;
  const DatePrototype = OriginalDate.prototype;

  // Use concise methods to obtain named functions without constructors.
  const tamedMethods = {
    now() {
      return NaN;
    },
  };

  // Tame the Date constructor.
  // Common behavior
  //   * new Date(x) coerces x into a number and then returns a Date
  //     for that number of millis since the epoch
  //   * new Date(NaN) returns a Date object which stringifies to
  //     'Invalid Date'
  //   * new Date(undefined) returns a Date object which stringifies to
  //     'Invalid Date'
  // OriginalDate (normal standard) behavior
  //   * Date(anything) gives a string with the current time
  //   * new Date() returns the current time, as a Date object
  // SharedDate behavior
  //   * Date(anything) returned 'Invalid Date'
  //   * new Date() returns a Date object which stringifies to
  //     'Invalid Date'
  const makeDateConstructor = ({ powers = 'none' } = {}) => {
    let ResultDate;
    if (powers === 'original') {
      ResultDate = function Date(...rest) {
        if (new.target === undefined) {
          return Reflect.apply(OriginalDate, undefined, rest);
        }
        return Reflect.construct(OriginalDate, rest, new.target);
      };
    } else {
      ResultDate = function Date(...rest) {
        if (new.target === undefined) {
          return 'Invalid Date';
        }
        if (rest.length === 0) {
          rest = [NaN];
        }
        return Reflect.construct(OriginalDate, rest, new.target);
      };
    }

    defineProperties(ResultDate, {
      length: { value: 7 },
      prototype: {
        value: DatePrototype,
        writable: false,
        enumerable: false,
        configurable: false,
      },
      parse: {
        value: Date.parse,
        writable: true,
        enumerable: false,
        configurable: true,
      },
      UTC: {
        value: Date.UTC,
        writable: true,
        enumerable: false,
        configurable: true,
      },
    });
    return ResultDate;
  };
  const InitialDate = makeDateConstructor({ powers: 'original' });
  const SharedDate = makeDateConstructor({ power: 'none' });

  defineProperties(InitialDate, {
    now: {
      value: Date.now,
      writable: true,
      enumerable: false,
      configurable: true,
    },
  });
  defineProperties(SharedDate, {
    now: {
      value: tamedMethods.now,
      writable: true,
      enumerable: false,
      configurable: true,
    },
  });

  defineProperties(DatePrototype, {
    constructor: { value: SharedDate },
  });

  return {
    '%InitialDate%': InitialDate,
    '%SharedDate%': SharedDate,
  };
}

// Whitelist names from https://v8.dev/docs/stack-trace-api
// Whitelisting only the names used by error-stack-shim/src/v8StackFrames
// callSiteToFrame to shim the error stack proposal.
const safeV8CallSiteMethodNames = [
  // suppress 'getThis' definitely
  'getTypeName',
  // suppress 'getFunction' definitely
  'getFunctionName',
  'getMethodName',
  'getFileName',
  'getLineNumber',
  'getColumnNumber',
  'getEvalOrigin',
  'isToplevel',
  'isEval',
  'isNative',
  'isConstructor',
  'isAsync',
  // suppress 'isPromiseAll' for now
  // suppress 'getPromiseIndex' for now

  // Additional names found by experiment, absent from
  // https://v8.dev/docs/stack-trace-api
  'getPosition',
  'getScriptNameOrSourceURL',

  'toString', // TODO replace to use only whitelisted info
];

// TODO this is a ridiculously expensive way to attenuate callsites.
// Before that matters, we should switch to a reasonable representation.
const safeV8CallSiteFacet = callSite => {
  const methodEntry = name => [name, () => callSite[name]()];
  const o = Object.fromEntries(safeV8CallSiteMethodNames.map(methodEntry));
  return Object.create(o, {});
};

const safeV8SST = sst => sst.map(safeV8CallSiteFacet);

const stackStringFromSST = (error, sst) =>
  [`${error}`, ...sst.map(callSite => `\n  at ${callSite}`)].join('');

function tameV8ErrorConstructor(
  OriginalError,
  InitialError,
  errorTaming,
) {
  // Mapping from error instance to the structured stack trace capturing the
  // stack for that instance.
  const ssts = new WeakMap();

  // Use concise methods to obtain named functions without constructors.
  const tamedMethods = {
    // The optional `optFn` argument is for cutting off the bottom of
    // the stack --- for capturing the stack only above the topmost
    // call to that function. Since this isn't the "real" captureStackTrace
    // but instead calls the real one, if no other cutoff is provided,
    // we cut this one off.
    captureStackTrace(error, optFn = tamedMethods.captureStackTrace) {
      if (typeof OriginalError.captureStackTrace === 'function') {
        // OriginalError.captureStackTrace is only on v8
        OriginalError.captureStackTrace(error, optFn);
        return;
      }
      Reflect.set(error, 'stack', '');
    },
    // Shim of proposed special power, to reside by default only
    // in the start compartment, for getting the stack traceback
    // string associated with an error.
    // See https://tc39.es/proposal-error-stacks/
    getStackString(error) {
      if (!ssts.has(error)) {
        // eslint-disable-next-line no-void
        void error.stack;
      }
      const sst = ssts.get(error);
      if (!sst) {
        return '';
      }
      return stackStringFromSST(error, sst);
    },
    prepareStackTrace(error, sst) {
      ssts.set(error, sst);
      if (errorTaming === 'unsafe') {
        return stackStringFromSST(error, sst);
      }
      return '';
    },
  };

  // A prepareFn is a prepareStackTrace function.
  // An sst is a `structuredStackTrace`, which is an array of
  // callsites.
  // A user prepareFn is a prepareFn defined by a client of this API,
  // and provided by assigning to `Error.prepareStackTrace`.
  // A user prepareFn should only receive an attenuated sst, which
  // is an array of attenuated callsites.
  // A system prepareFn is the prepareFn created by this module to
  // be installed on the real `Error` constructor, to receive
  // an original sst, i.e., an array of unattenuated callsites.
  // An input prepareFn is a function the user assigns to
  // `Error.prepareStackTrace`, which might be a user prepareFn or
  // a system prepareFn previously obtained by reading
  // `Error.prepareStackTrace`.

  const defaultPrepareFn = tamedMethods.prepareStackTrace;

  OriginalError.prepareStackTrace = defaultPrepareFn;

  // A weakset branding some functions as system prepareFns, all of which
  // must be defined by this module, since they can receive an
  // unattenuated sst.
  const systemPrepareFnSet = new WeakSet([defaultPrepareFn]);

  const systemPrepareFnFor = inputPrepareFn => {
    if (systemPrepareFnSet.has(inputPrepareFn)) {
      return inputPrepareFn;
    }
    // Use concise methods to obtain named functions without constructors.
    const systemMethods = {
      prepareStackTrace(error, sst) {
        ssts.set(error, sst);
        return inputPrepareFn(error, safeV8SST(sst));
      },
    };
    systemPrepareFnSet.add(systemMethods.prepareStackTrace);
    return systemMethods.prepareStackTrace;
  };

  defineProperties(InitialError, {
    captureStackTrace: {
      value: tamedMethods.captureStackTrace,
      writable: true,
      enumerable: false,
      configurable: true,
    },
    stackTraceLimit: {
      get() {
        if (typeof OriginalError.stackTraceLimit === 'number') {
          // OriginalError.stackTraceLimit is only on v8
          return OriginalError.stackTraceLimit;
        }
        return undefined;
      },
      // https://v8.dev/docs/stack-trace-api#compatibility advises that
      // programmers can "always" set `Error.stackTraceLimit` and
      // `Error.prepareStackTrace` even on non-v8 platforms. On non-v8
      // it will have no effect, but this advise only makes sense
      // if the assignment itself does not fail, which it would
      // if `Error` were naively frozen. Hence, we add setters that
      // accept but ignore the assignment on non-v8 platforms.
      set(newLimit) {
        if (typeof OriginalError.stackTraceLimit === 'number') {
          // OriginalError.stackTraceLimit is only on v8
          OriginalError.stackTraceLimit = newLimit;
          // We place the useless return on the next line to ensure
          // that anything we place after the if in the future only
          // happens if the then-case does not.
          // eslint-disable-next-line no-useless-return
          return;
        }
      },
      // WTF on v8 stackTraceLimit is enumerable
      enumerable: false,
      configurable: true,
    },
    prepareStackTrace: {
      get() {
        return OriginalError.prepareStackTrace;
      },
      set(inputPrepareStackTraceFn) {
        if (typeof inputPrepareStackTraceFn === 'function') {
          const systemPrepareFn = systemPrepareFnFor(inputPrepareStackTraceFn);
          OriginalError.prepareStackTrace = systemPrepareFn;
        } else {
          OriginalError.prepareStackTrace = defaultPrepareFn;
        }
      },
      enumerable: false,
      configurable: true,
    },
  });

  return tamedMethods.getStackString;
}

// Use concise methods to obtain named functions without constructors.
const tamedMethods = {
  getStackString(_error) {
    return '';
  },
};

function tameErrorConstructor(errorTaming = 'safe') {
  if (errorTaming !== 'safe' && errorTaming !== 'unsafe') {
    throw new Error(`unrecognized errorTaming ${errorTaming}`);
  }
  const OriginalError = Error;
  const ErrorPrototype = OriginalError.prototype;

  const platform =
    typeof OriginalError.captureStackTrace === 'function' ? 'v8' : 'unknown';

  const makeErrorConstructor = (_ = {}) => {
    const ResultError = function Error(...rest) {
      let error;
      if (new.target === undefined) {
        error = apply(OriginalError, this, rest);
      } else {
        error = construct(OriginalError, rest, new.target);
      }
      if (platform === 'v8') {
        OriginalError.captureStackTrace(error, ResultError);
      }
      return error;
    };
    defineProperties(ResultError, {
      length: { value: 1 },
      prototype: {
        value: ErrorPrototype,
        writable: false,
        enumerable: false,
        configurable: false,
      },
    });
    return ResultError;
  };
  const InitialError = makeErrorConstructor({ powers: 'original' });
  const SharedError = makeErrorConstructor({ powers: 'none' });
  defineProperties(ErrorPrototype, {
    constructor: { value: SharedError },
    /* TODO
    stack: {
      get() {
        return '';
      },
      set(_) {
        // ignore
      },
    },
    */
  });

  for (const NativeError of NativeErrors) {
    setPrototypeOf(NativeError, SharedError);
  }

  let initialGetStackString = tamedMethods.getStackString;
  if (platform === 'v8') {
    initialGetStackString = tameV8ErrorConstructor(
      OriginalError,
      InitialError,
      errorTaming,
    );
  }
  return {
    '%InitialGetStackString%': initialGetStackString,
    '%InitialError%': InitialError,
    '%SharedError%': SharedError,
  };
}

function tameMathObject(mathTaming = 'safe') {
  if (mathTaming !== 'safe' && mathTaming !== 'unsafe') {
    throw new Error(`unrecognized mathTaming ${mathTaming}`);
  }
  const originalMath = Math;
  const initialMath = originalMath; // to follow the naming pattern

  const { random: _, ...otherDescriptors } = getOwnPropertyDescriptors(
    originalMath,
  );

  const sharedMath = create(Object.prototype, otherDescriptors);

  return {
    '%InitialMath%': initialMath,
    '%SharedMath%': sharedMath,
  };
}

function tameRegExpConstructor(regExpTaming = 'safe') {
  if (regExpTaming !== 'safe' && regExpTaming !== 'unsafe') {
    throw new Error(`unrecognized regExpTaming ${regExpTaming}`);
  }
  const OriginalRegExp = RegExp;
  const RegExpPrototype = OriginalRegExp.prototype;

  const makeRegExpConstructor = (_ = {}) => {
    // RegExp has non-writable static properties we need to omit.
    const ResultRegExp = function RegExp(...rest) {
      if (new.target === undefined) {
        return OriginalRegExp(...rest);
      }
      return Reflect.construct(OriginalRegExp, rest, new.target);
    };

    defineProperties(ResultRegExp, {
      length: { value: 2 },
      prototype: {
        value: RegExpPrototype,
        writable: false,
        enumerable: false,
        configurable: false,
      },
      [Symbol.species]: getOwnPropertyDescriptor(
        OriginalRegExp,
        Symbol.species,
      ),
    });
    return ResultRegExp;
  };

  const InitialRegExp = makeRegExpConstructor();
  const SharedRegExp = makeRegExpConstructor();

  if (regExpTaming !== 'unsafe') {
    delete RegExpPrototype.compile;
  }
  defineProperties(RegExpPrototype, {
    constructor: { value: SharedRegExp },
  });

  return {
    '%InitialRegExp%': InitialRegExp,
    '%SharedRegExp%': SharedRegExp,
  };
}

/**
 * @fileoverview Exports {@code enablements}, a recursively defined
 * JSON record defining the optimum set of intrinsics properties
 * that need to be "repaired" before hardening is applied on
 * enviromments subject to the override mistake.
 *
 * @author JF Paradis
 */

/**
 * <p>Because "repairing" replaces data properties with accessors, every
 * time a repaired property is accessed, the associated getter is invoked,
 * which degrades the runtime performance of all code executing in the
 * repaired enviromment, compared to the non-repaired case. In order
 * to maintain performance, we only repair the properties of objects
 * for which hardening causes a breakage of their normal intended usage.
 *
 * There are three unwanted cases:
 * <ul>
 * <li>Overriding properties on objects typically used as records,
 *     namely {@code "Object"} and {@code "Array"}. In the case of arrays,
 *     the situation is unintentional, a given program might not be aware
 *     that non-numerical properties are stored on the underlying object
 *     instance, not on the array. When an object is typically used as a
 *     map, we repair all of its prototype properties.
 * <li>Overriding properties on objects that provide defaults on their
 *     prototype and that programs typically set using an assignment, such as
 *     {@code "Error.prototype.message"} and {@code "Function.prototype.name"}
 *     (both default to "").
 * <li>Setting-up a prototype chain, where a constructor is set to extend
 *     another one. This is typically set by assignment, for example
 *     {@code "Child.prototype.constructor = Child"}, instead of invoking
 *     Object.defineProperty();
 *
 * <p>Each JSON record enumerates the disposition of the properties on
 * some corresponding intrinsic object.
 *
 * <p>For each such record, the values associated with its property
 * names can be:
 * <ul>
 * <li>true, in which case this property is simply repaired. The
 *     value associated with that property is not traversed. For
 * 	   example, {@code "Function.prototype.name"} leads to true,
 *     meaning that the {@code "name"} property of {@code
 *     "Function.prototype"} should be repaired (which is needed
 *     when inheriting from @code{Function} and setting the subclass's
 *     {@code "prototype.name"} property). If the property is
 *     already an accessor property, it is not repaired (because
 *     accessors are not subject to the override mistake).
 * <li>"*", in which case this property is not repaired but the
 *     value associated with that property are traversed and repaired.
 * <li>Another record, in which case this property is not repaired
 *     and that next record represents the disposition of the object
 *     which is its value. For example,{@code "FunctionPrototype"}
 *     leads to another record explaining which properties {@code
 *     Function.prototype} need to be repaired.
 */

var enablements = {
  '%ObjectPrototype%': '*',

  '%ArrayPrototype%': '*',

  '%FunctionPrototype%': {
    constructor: true, // set by "regenerator-runtime"
    bind: true, // set by "underscore"
    apply: true, // set by "tape"
    name: true,
    toString: true,
  },

  '%ErrorPrototype%': {
    constructor: true, // set by "fast-json-patch"
    message: true,
    name: true, // set by "precond"
    toString: true, // set by "bluebird"
  },

  '%TypeErrorPrototype%': {
    constructor: true, // set by "readable-stream"
    message: true, // set by "tape"
    name: true, // set by "readable-stream"
  },

  '%SyntaxErrorPrototype%': {
    message: true, // to match TypeErrorPrototype.message
  },

  '%RangeErrorPrototype%': {
    message: true, // to match TypeErrorPrototype.message
  },

  '%URIErrorPrototype%': {
    message: true, // to match TypeErrorPrototype.message
  },

  '%EvalErrorPrototype%': {
    message: true, // to match TypeErrorPrototype.message
  },

  '%ReferenceErrorPrototype%': {
    message: true, // to match TypeErrorPrototype.message
  },

  '%PromisePrototype%': {
    constructor: true, // set by "core-js"
  },

  '%TypedArrayPrototype%': '*',

  '%Generator%': {
    constructor: true,
    name: true,
    toString: true,
  },

  '%IteratorPrototype%': '*',
};

// Adapted from SES/Caja

const { ownKeys: ownKeys$2 } = Reflect;

function isObject(obj) {
  return obj !== null && typeof obj === 'object';
}

/**
 * For a special set of properties (defined in the enablement plan), it ensures
 * that the effect of freezing does not suppress the ability to override
 * these properties on derived objects by simple assignment.
 *
 * Because of lack of sufficient foresight at the time, ES5 unfortunately
 * specified that a simple assignment to a non-existent property must fail if
 * it would override a non-writable data property of the same name. (In
 * retrospect, this was a mistake, but it is now too late and we must live
 * with the consequences.) As a result, simply freezing an object to make it
 * tamper proof has the unfortunate side effect of breaking previously correct
 * code that is considered to have followed JS best practices, if this
 * previous code used assignment to override.
 */

// TODO exmplain parameters
function enablePropertyOverrides(intrinsics) {
  const detachedProperties = {};

  function enable(path, obj, prop, desc) {
    if ('value' in desc && desc.configurable) {
      const { value } = desc;

      detachedProperties[path] = value;

      function getter() {
        return value;
      }

      function setter(newValue) {
        if (obj === this) {
          throw new TypeError(
            `Cannot assign to read only property '${prop}' of '${path}'`,
          );
        }
        if (hasOwnProperty.call(this, prop)) {
          this[prop] = newValue;
        } else {
          defineProperty(this, prop, {
            value: newValue,
            writable: true,
            enumerable: true,
            configurable: true,
          });
        }
      }

      defineProperty(obj, prop, {
        get: getter,
        set: setter,
        enumerable: desc.enumerable,
        configurable: desc.configurable,
      });
    }
  }

  function enableProperty(path, obj, prop) {
    const desc = getOwnPropertyDescriptor(obj, prop);
    if (!desc) {
      return;
    }
    enable(path, obj, prop, desc);
  }

  function enableAllProperties(path, obj) {
    const descs = getOwnPropertyDescriptors(obj);
    if (!descs) {
      return;
    }
    ownKeys$2(descs).forEach(prop => enable(path, obj, prop, descs[prop]));
  }

  function enableProperties(path, obj, plan) {
    for (const prop of getOwnPropertyNames(plan)) {
      const desc = getOwnPropertyDescriptor(obj, prop);
      if (!desc || desc.get || desc.set) {
        // No not a value property, nothing to do.
        // eslint-disable-next-line no-continue
        continue;
      }

      // Plan has no symbol keys and we use getOwnPropertyNames()
      // to avoid issues with stringification of property name.
      const subPath = `${path}.${prop}`;
      const subPlan = plan[prop];

      if (subPlan === true) {
        enableProperty(subPath, obj, prop);
      } else if (subPlan === '*') {
        enableAllProperties(subPath, desc.value);
      } else if (isObject(subPlan)) {
        enableProperties(subPath, desc.value, subPlan);
      } else {
        throw new TypeError(`Unexpected override enablement plan ${subPath}`);
      }
    }
  }

  // Do the repair.
  enableProperties('root', intrinsics, enablements);

  return detachedProperties;
}

const localePattern = /^(\w*[a-z])Locale([A-Z]\w*)$/;

// Use concise methods to obtain named functions without constructor
// behavior or `.prototype` property.
const tamedMethods$1 = {
  // See https://tc39.es/ecma262/#sec-string.prototype.localecompare
  localeCompare(that) {
    if (this === null || this === undefined) {
      throw new TypeError(
        `Cannot localeCompare with null or undefined "this" value`,
      );
    }
    const s = `${this}`;
    that = `${that}`;
    if (s < that) {
      return -1;
    }
    if (s > that) {
      return 1;
    }
    assert(s === that, `expected ${s} and ${that} to compare`);
    return 0;
  },
};

const nonLocaleCompare = tamedMethods$1.localeCompare;

function tameLocaleMethods(intrinsics, localeTaming = 'safe') {
  if (localeTaming !== 'safe' && localeTaming !== 'unsafe') {
    throw new Error(`unrecognized dateTaming ${localeTaming}`);
  }
  if (localeTaming === 'unsafe') {
    return;
  }

  defineProperty(String.prototype, 'localeCompare', {
    value: nonLocaleCompare,
  });

  for (const intrinsicName of getOwnPropertyNames(intrinsics)) {
    const intrinsic = intrinsics[intrinsicName];
    if (intrinsic === Object(intrinsic)) {
      for (const methodName of getOwnPropertyNames(intrinsic)) {
        const match = localePattern.exec(methodName);
        if (match) {
          assert(
            typeof intrinsic[methodName] === 'function',
            `expected ${methodName} to be a function`,
          );
          const nonLocaleMethodName = `${match[1]}${match[2]}`;
          const method = intrinsic[nonLocaleMethodName];
          assert(
            typeof method === 'function',
            `function ${nonLocaleMethodName} not found`,
          );
          defineProperty(intrinsic, methodName, { value: method });
        }
      }
    }
  }
}

const InertCompartment = function Compartment(
  _endowments = {},
  _modules = {},
  _options = {},
) {
  throw new TypeError('Not available');
};

/**
 * Object.getConstructorOf()
 * Helper function to improve readability, similar to Object.getPrototypeOf().
 */
function getConstructorOf(obj) {
  return getPrototypeOf(obj).constructor;
}

/**
 * getAnonymousIntrinsics()
 * Get the intrinsics not otherwise reachable by named own property
 * traversal from the global object.
 */
function getAnonymousIntrinsics() {
  const InertFunction = Function.prototype.constructor;

  const SymbolIterator = (typeof Symbol && Symbol.iterator) || '@@iterator';
  const SymbolMatchAll = (typeof Symbol && Symbol.matchAll) || '@@matchAll';

  // 9.2.4.1 %ThrowTypeError%

  // eslint-disable-next-line prefer-rest-params
  const ThrowTypeError = getOwnPropertyDescriptor(arguments, 'callee').get;

  // 21.1.5.2 The %StringIteratorPrototype% Object

  // eslint-disable-next-line no-new-wrappers
  const StringIteratorObject = new String()[SymbolIterator]();
  const StringIteratorPrototype = getPrototypeOf(StringIteratorObject);

  // 21.2.7.1 The %RegExpStringIteratorPrototype% Object

  const RegExpStringIterator = new RegExp()[SymbolMatchAll]();
  const RegExpStringIteratorPrototype = getPrototypeOf(RegExpStringIterator);

  // 22.1.5.2 The %ArrayIteratorPrototype% Object

  // eslint-disable-next-line no-array-constructor
  const ArrayIteratorObject = new Array()[SymbolIterator]();
  const ArrayIteratorPrototype = getPrototypeOf(ArrayIteratorObject);

  // 22.2.1 The %TypedArray% Intrinsic Object

  const TypedArray = getPrototypeOf(Float32Array);

  // 23.1.5.2 The %MapIteratorPrototype% Object

  const MapIteratorObject = new Map()[SymbolIterator]();
  const MapIteratorPrototype = getPrototypeOf(MapIteratorObject);

  // 23.2.5.2 The %SetIteratorPrototype% Object

  const SetIteratorObject = new Set()[SymbolIterator]();
  const SetIteratorPrototype = getPrototypeOf(SetIteratorObject);

  // 25.1.2 The %IteratorPrototype% Object

  const IteratorPrototype = getPrototypeOf(ArrayIteratorPrototype);

  // 25.2.1 The GeneratorFunction Constructor

  // eslint-disable-next-line no-empty-function
  function* GeneratorFunctionInstance() {}
  const GeneratorFunction = getConstructorOf(GeneratorFunctionInstance);

  // 25.2.3 Properties of the GeneratorFunction Prototype Object

  const Generator = GeneratorFunction.prototype;

  // 25.3.1 The AsyncGeneratorFunction Constructor

  // eslint-disable-next-line no-empty-function
  async function* AsyncGeneratorFunctionInstance() {}
  const AsyncGeneratorFunction = getConstructorOf(
    AsyncGeneratorFunctionInstance,
  );

  // 25.3.2.2 AsyncGeneratorFunction.prototype
  const AsyncGenerator = AsyncGeneratorFunction.prototype;
  // 25.5.1 Properties of the AsyncGenerator Prototype Object
  const AsyncGeneratorPrototype = AsyncGenerator.prototype;
  const AsyncIteratorPrototype = getPrototypeOf(AsyncGeneratorPrototype);

  // 25.7.1 The AsyncFunction Constructor

  // eslint-disable-next-line no-empty-function
  async function AsyncFunctionInstance() {}
  const AsyncFunction = getConstructorOf(AsyncFunctionInstance);

  const intrinsics = {
    '%InertFunction%': InertFunction,
    '%ArrayIteratorPrototype%': ArrayIteratorPrototype,
    '%InertAsyncFunction%': AsyncFunction,
    '%AsyncGenerator%': AsyncGenerator,
    '%InertAsyncGeneratorFunction%': AsyncGeneratorFunction,
    '%AsyncGeneratorPrototype%': AsyncGeneratorPrototype,
    '%AsyncIteratorPrototype%': AsyncIteratorPrototype,
    '%Generator%': Generator,
    '%InertGeneratorFunction%': GeneratorFunction,
    '%IteratorPrototype%': IteratorPrototype,
    '%MapIteratorPrototype%': MapIteratorPrototype,
    '%RegExpStringIteratorPrototype%': RegExpStringIteratorPrototype,
    '%SetIteratorPrototype%': SetIteratorPrototype,
    '%StringIteratorPrototype%': StringIteratorPrototype,
    '%ThrowTypeError%': ThrowTypeError,
    '%TypedArray%': TypedArray,
    '%InertCompartment%': InertCompartment,
  };

  return intrinsics;
}

/**
 * throwTantrum()
 * We'd like to abandon, but we can't, so just scream and break a lot of
 * stuff. However, since we aren't really aborting the process, be careful to
 * not throw an Error object which could be captured by child-Realm code and
 * used to access the (too-powerful) primal-realm Error object.
 */
function throwTantrum(message, err = undefined) {
  const msg = `please report internal shim error: ${message}`;

  // we want to log these 'should never happen' things.
  console.error(msg);
  if (err) {
    console.error(`${err}`);
    console.error(`${err.stack}`);
  }

  // eslint-disable-next-line no-debugger
  debugger;
  throw TypeError(msg);
}

/**
 * assert()
 */
function assert$1(condition, message) {
  if (!condition) {
    throwTantrum(message);
  }
}

/**
 * keywords
 * In JavaScript you cannot use these reserved words as variables.
 * See 11.6.1 Identifier Names
 */
const keywords = [
  // 11.6.2.1 Keywords
  'await',
  'break',
  'case',
  'catch',
  'class',
  'const',
  'continue',
  'debugger',
  'default',
  'delete',
  'do',
  'else',
  'export',
  'extends',
  'finally',
  'for',
  'function',
  'if',
  'import',
  'in',
  'instanceof',
  'new',
  'return',
  'super',
  'switch',
  'this',
  'throw',
  'try',
  'typeof',
  'var',
  'void',
  'while',
  'with',
  'yield',

  // Also reserved when parsing strict mode code
  'let',
  'static',

  // 11.6.2.2 Future Reserved Words
  'enum',

  // Also reserved when parsing strict mode code
  'implements',
  'package',
  'protected',
  'interface',
  'private',
  'public',

  // Reserved but not mentioned in specs
  'await',

  'null',
  'true',
  'false',

  'this',
  'arguments',
];

/**
 * identifierPattern
 * Simplified validation of indentifier names: may only contain alphanumeric
 * characters (or "$" or "_"), and may not start with a digit. This is safe
 * and does not reduces the compatibility of the shim. The motivation for
 * this limitation was to decrease the complexity of the implementation,
 * and to maintain a resonable level of performance.
 * Note: \w is equivalent [a-zA-Z_0-9]
 * See 11.6.1 Identifier Names
 */
const identifierPattern = new RegExp('^[a-zA-Z_$][\\w$]*$');

/**
 * isValidIdentifierName()
 * What variable names might it bring into scope? These include all
 * property names which can be variable names, including the names
 * of inherited properties. It excludes symbols and names which are
 * keywords. We drop symbols safely. Currently, this shim refuses
 * service if any of the names are keywords or keyword-like. This is
 * safe and only prevent performance optimization.
 */
function isValidIdentifierName(name) {
  // Ensure we have a valid identifier. We use regexpTest rather than
  // /../.test() to guard against the case where RegExp has been poisoned.
  return (
    name !== 'eval' &&
    !arrayIncludes(keywords, name) &&
    regexpTest(identifierPattern, name)
  );
}

/**
 * isImmutableDataProperty
 *
 */

function isImmutableDataProperty(obj, name) {
  const desc = getOwnPropertyDescriptor(obj, name);
  return (
    //
    // The getters will not have .writable, don't let the falsyness of
    // 'undefined' trick us: test with === false, not ! . However descriptors
    // inherit from the (potentially poisoned) global object, so we might see
    // extra properties which weren't really there. Accessor properties have
    // 'get/set/enumerable/configurable', while data properties have
    // 'value/writable/enumerable/configurable'.
    desc.configurable === false &&
    desc.writable === false &&
    //
    // Checks for data properties because they're the only ones we can
    // optimize (accessors are most likely non-constant). Descriptors can't
    // can't have accessors and value properties at the same time, therefore
    // this check is sufficient. Using explicit own property deal with the
    // case where Object.prototype has been poisoned.
    objectHasOwnProperty(desc, 'value')
  );
}

/**
 * getScopeConstants()
 * What variable names might it bring into scope? These include all
 * property names which can be variable names, including the names
 * of inherited properties. It excludes symbols and names which are
 * keywords. We drop symbols safely. Currently, this shim refuses
 * service if any of the names are keywords or keyword-like. This is
 * safe and only prevent performance optimization.
 */
function getScopeConstants(globalObject, localObject = {}) {
  // getOwnPropertyNames() does ignore Symbols so we don't need to
  // filter them out.
  const globalNames = getOwnPropertyNames(globalObject);
  const localNames = getOwnPropertyNames(localObject);

  // Collect all valid & immutable identifiers from the endowments.
  const localConstants = localNames.filter(
    name =>
      isValidIdentifierName(name) && isImmutableDataProperty(localObject, name),
  );

  // Collect all valid & immutable identifiers from the global that
  // are also not present in the endwoments (immutable or not).
  const globalConstants = globalNames.filter(
    name =>
      // Can't define a constant: it would prevent a
      // lookup on the endowments.
      !localNames.includes(name) &&
      isValidIdentifierName(name) &&
      isImmutableDataProperty(globalObject, name),
  );

  return [...globalConstants, ...localConstants];
}

// The original unsafe untamed eval function, which must not escape.
// Sample at module initialization time, which is before lockdown can
// repair it.  Use it only to build powerless abstractions.
// eslint-disable-next-line no-eval
const FERAL_EVAL = eval;

/**
 * alwaysThrowHandler
 * This is an object that throws if any propery is called. It's used as
 * a proxy handler which throws on any trap called.
 * It's made from a proxy with a get trap that throws. It's safe to
 * create one and share it between all scopeHandlers.
 */
const alwaysThrowHandler = new Proxy(immutableObject, {
  get(_shadow, prop) {
    throwTantrum(`unexpected scope handler trap called: ${String(prop)}`);
  },
});

/**
 * createScopeHandler()
 * ScopeHandler manages a Proxy which serves as the global scope for the
 * performEval operation (the Proxy is the argument of a 'with' binding).
 * As described in createSafeEvaluator(), it has several functions:
 * - allow the very first (and only the very first) use of 'eval' to map to
 *   the real (unsafe) eval function, so it acts as a 'direct eval' and can
 *   access its lexical scope (which maps to the 'with' binding, which the
 *   ScopeHandler also controls).
 * - ensure that all subsequent uses of 'eval' map to the safeEvaluator,
 *   which lives as the 'eval' property of the safeGlobal.
 * - route all other property lookups at the safeGlobal.
 * - hide the unsafeGlobal which lives on the scope chain above the 'with'.
 * - ensure the Proxy invariants despite some global properties being frozen.
 */
function createScopeHandler(
  globalObject,
  localObject = {},
  { sloppyGlobalsMode = false } = {},
) {
  return {
    // The scope handler throws if any trap other than get/set/has are run
    // (e.g. getOwnPropertyDescriptors, apply, getPrototypeOf).
    __proto__: alwaysThrowHandler,

    // This flag allow us to determine if the eval() call is an done by the
    // realm's code or if it is user-land invocation, so we can react differently.
    useUnsafeEvaluator: false,

    get(_shadow, prop) {
      if (typeof prop === 'symbol') {
        return undefined;
      }

      // Special treatment for eval. The very first lookup of 'eval' gets the
      // unsafe (real direct) eval, so it will get the lexical scope that uses
      // the 'with' context.
      if (prop === 'eval') {
        // test that it is true rather than merely truthy
        if (this.useUnsafeEvaluator === true) {
          // revoke before use
          this.useUnsafeEvaluator = false;
          return FERAL_EVAL;
        }
        // fall through
      }

      // Properties of the localObject.
      if (prop in localObject) {
        // Use reflect to defeat accessors that could be present on the
        // localObject object itself as `this`.
        // This is done out of an overabundance of caution, as the SES shim
        // only use the localObject carry globalLexicals and live binding
        // traps.
        // The globalLexicals are captured as a snapshot of what's passed to
        // the Compartment constructor, wherein all accessors and setters are
        // eliminated and the result frozen.
        // The live binding traps do use accessors, and none of those accessors
        // make use of their receiver.
        // Live binding traps provide no avenue for user code to observe the
        // receiver.
        return reflectGet(localObject, prop, globalObject);
      }

      // Properties of the global.
      return reflectGet(globalObject, prop);
    },

    set(_shadow, prop, value) {
      // Properties of the localObject.
      if (prop in localObject) {
        const desc = getOwnPropertyDescriptor(localObject, prop);
        if ('value' in desc) {
          // Work around a peculiar behavior in the specs, where
          // value properties are defined on the receiver.
          return reflectSet(localObject, prop, value);
        }
        // Ensure that the 'this' value on setters resolves
        // to the safeGlobal, not to the localObject object.
        return reflectSet(localObject, prop, value, globalObject);
      }

      // Properties of the global.
      return reflectSet(globalObject, prop, value);
    },

    // we need has() to return false for some names to prevent the lookup from
    // climbing the scope chain and eventually reaching the unsafeGlobal
    // object (globalThis), which is bad.

    // todo: we'd like to just have has() return true for everything, and then
    // use get() to raise a ReferenceError for anything not on the safe global.
    // But we want to be compatible with ReferenceError in the normal case and
    // the lack of ReferenceError in the 'typeof' case. Must either reliably
    // distinguish these two cases (the trap behavior might be different), or
    // we rely on a mandatory source-to-source transform to change 'typeof abc'
    // to XXX. We already need a mandatory parse to prevent the 'import',
    // since it's a special form instead of merely being a global variable/

    // note: if we make has() return true always, then we must implement a
    // set() trap to avoid subverting the protection of strict mode (it would
    // accept assignments to undefined globals, when it ought to throw
    // ReferenceError for such assignments)

    has(_shadow, prop) {
      // unsafeGlobal: hide all properties of the current global
      // at the expense of 'typeof' being wrong for those properties. For
      // example, in the browser, evaluating 'document = 3', will add
      // a property to globalObject instead of throwing a ReferenceError.
      if (
        sloppyGlobalsMode ||
        prop === 'eval' ||
        prop in localObject ||
        prop in globalObject ||
        prop in globalThis
      ) {
        return true;
      }

      return false;
    },

    // note: this is likely a bug of safari
    // https://bugs.webkit.org/show_bug.cgi?id=195534

    getPrototypeOf() {
      return null;
    },

    // Chip has seen this happen single stepping under the Chrome/v8 debugger.
    // TODO record how to reliably reproduce, and to test if this fix helps.
    // TODO report as bug to v8 or Chrome, and record issue link here.

    getOwnPropertyDescriptor(_target, prop) {
      // Coerce with `String` in case prop is a symbol.
      const quotedProp = JSON.stringify(String(prop));
      console.warn(
        `getOwnPropertyDescriptor trap on scopeHandler for ${quotedProp}`,
        new Error().stack,
      );
      return undefined;
    },
  };
}

// Find the first occurence of the given pattern and return
// the location as the approximate line number.

function getLineNumber(src, pattern) {
  const index = stringSearch(src, pattern);
  if (index < 0) {
    return -1;
  }
  return stringSplit(stringSlice(src, 0, index), '\n').length;
}

// https://www.ecma-international.org/ecma-262/9.0/index.html#sec-html-like-comments
// explains that JavaScript parsers may or may not recognize html
// comment tokens "<" immediately followed by "!--" and "--"
// immediately followed by ">" in non-module source text, and treat
// them as a kind of line comment. Since otherwise both of these can
// appear in normal JavaScript source code as a sequence of operators,
// we have the terrifying possibility of the same source code parsing
// one way on one correct JavaScript implementation, and another way
// on another.
//
// This shim takes the conservative strategy of just rejecting source
// text that contains these strings anywhere. Note that this very
// source file is written strangely to avoid mentioning these
// character strings explicitly.

// We do not write the regexp in a straightforward way, so that an
// apparennt html comment does not appear in this file. Thus, we avoid
// rejection by the overly eager rejectDangerousSources.

const htmlCommentPattern = new RegExp(`(?:${'<'}!--|--${'>'})`);

function rejectHtmlComments(src) {
  const linenum = getLineNumber(src, htmlCommentPattern);
  if (linenum < 0) {
    return src;
  }
  throw new SyntaxError(
    `possible html comment syntax rejected around line ${linenum}`,
  );
}

// The proposed dynamic import expression is the only syntax currently
// proposed, that can appear in non-module JavaScript code, that
// enables direct access to the outside world that cannot be
// surpressed or intercepted without parsing and rewriting. Instead,
// this shim conservatively rejects any source text that seems to
// contain such an expression. To do this safely without parsing, we
// must also reject some valid programs, i.e., those containing
// apparent import expressions in literal strings or comments.

// The current conservative rule looks for the identifier "import"
// followed by either an open paren or something that looks like the
// beginning of a comment. We assume that we do not need to worry
// about html comment syntax because that was already rejected by
// rejectHtmlComments.

// this \s *must* match all kinds of syntax-defined whitespace. If e.g.
// U+2028 (LINE SEPARATOR) or U+2029 (PARAGRAPH SEPARATOR) is treated as
// whitespace by the parser, but not matched by /\s/, then this would admit
// an attack like: import\u2028('power.js') . We're trying to distinguish
// something like that from something like importnotreally('power.js') which
// is perfectly safe.

const importPattern = new RegExp('\\bimport\\s*(?:\\(|/[/*])');

function rejectImportExpressions(src) {
  const linenum = getLineNumber(src, importPattern);
  if (linenum < 0) {
    return src;
  }
  throw new SyntaxError(
    `possible import expression rejected around line ${linenum}`,
  );
}

// The shim cannot correctly emulate a direct eval as explained at
// https://github.com/Agoric/realms-shim/issues/12
// Without rejecting apparent direct eval syntax, we would
// accidentally evaluate these with an emulation of indirect eval. To
// prevent future compatibility problems, in shifting from use of the
// shim to genuine platform support for the proposal, we should
// instead statically reject code that seems to contain a direct eval
// expression.
//
// As with the dynamic import expression, to avoid a full parse, we do
// this approximately with a regexp, that will also reject strings
// that appear safely in comments or strings. Unlike dynamic import,
// if we miss some, this only creates future compat problems, not
// security problems. Thus, we are only trying to catch innocent
// occurrences, not malicious one. In particular, `(eval)(...)` is
// direct eval syntax that would not be caught by the following regexp.

const someDirectEvalPattern = new RegExp('\\beval\\s*(?:\\(|/[/*])');

// Exported for unit tests.
function rejectSomeDirectEvalExpressions(src) {
  const linenum = getLineNumber(src, someDirectEvalPattern);
  if (linenum < 0) {
    return src;
  }
  throw new SyntaxError(
    `possible direct eval expression rejected around line ${linenum}`,
  );
}

function mandatoryTransforms(source) {
  source = rejectHtmlComments(source);
  source = rejectImportExpressions(source);
  source = rejectSomeDirectEvalExpressions(source);
  return source;
}

function applyTransforms(source, transforms) {
  for (const transform of transforms) {
    source = transform(source);
  }
  return source;
}

// The original unsafe untamed Function constructor, which must not escape.
// Sample at module initialization time, which is before lockdown can
// repair it. Use it only to build powerless abstractions.
const FERAL_FUNCTION = Function;

/**
 * buildOptimizer()
 * Given an array of indentifier, the optimizer return a `const` declaration
 * destructring `this`.
 */
function buildOptimizer(constants) {
  // No need to build an oprimizer when there are no constants.
  if (constants.length === 0) return '';
  // Use 'this' to avoid going through the scope proxy, which is unecessary
  // since the optimizer only needs references to the safe global.
  return `const {${arrayJoin(constants, ',')}} = this;`;
}

/**
 * makeEvaluateFactory()
 * The factory create 'evaluate' functions with the correct optimizer
 * inserted.
 */
function makeEvaluateFactory(constants = []) {
  const optimizer = buildOptimizer(constants);

  // Create a function in sloppy mode, so that we can use 'with'. It returns
  // a function in strict mode that evaluates the provided code using direct
  // eval, and thus in strict mode in the same scope. We must be very careful
  // to not create new names in this scope

  // 1: we use 'with' (around a Proxy) to catch all free variable names. The
  // `this` value holds the Proxy which safely wraps the safeGlobal
  // 2: 'optimizer' catches constant variable names for speed.
  // 3: The inner strict function is effectively passed two parameters:
  //    a) its arguments[0] is the source to be directly evaluated.
  //    b) its 'this' is the this binding seen by the code being
  //       directly evaluated (the globalObject).
  // 4: The outer sloppy function is passed one parameter, the scope proxy.
  //    as the `this` parameter.

  // Notes:
  // - everything in the 'optimizer' string is looked up in the proxy
  //   (including an 'arguments[0]', which points at the Proxy).
  // - keywords like 'function' which are reserved keywords, and cannot be
  //   used as a variables, so they is not part to the optimizer.
  // - when 'eval' is looked up in the proxy, and it's the first time it is
  //   looked up after useUnsafeEvaluator is turned on, the proxy returns the
  //   eval intrinsic, and flips useUnsafeEvaluator back to false. Any reference
  //   to 'eval' in that string will get the tamed evaluator.

  return FERAL_FUNCTION(`
    with (this) {
      ${optimizer}
      return function() {
        'use strict';
        return eval(arguments[0]);
      };
    }
  `);
}

// Portions adapted from V8 - Copyright 2016 the V8 project authors.

/**
 * performEval()
 * The low-level operation used by all evaluators:
 * eval(), Function(), Evalutator.prototype.evaluate().
 */
function performEval(
  source,
  globalObject,
  localObject = {},
  {
    localTransforms = [],
    globalTransforms = [],
    sloppyGlobalsMode = false,
  } = {},
) {
  // Execute the mandatory transforms last to ensure that any rewritten code
  // meets those mandatory requirements.
  source = applyTransforms(source, [
    ...localTransforms,
    ...globalTransforms,
    mandatoryTransforms,
  ]);

  const scopeHandler = createScopeHandler(globalObject, localObject, {
    sloppyGlobalsMode,
  });
  const scopeProxyRevocable = proxyRevocable(immutableObject, scopeHandler);
  // Ensure that "this" resolves to the scope proxy.

  const constants = getScopeConstants(globalObject, localObject);
  const evaluateFactory = makeEvaluateFactory(constants);
  const evaluate = apply(evaluateFactory, scopeProxyRevocable.proxy, []);

  scopeHandler.useUnsafeEvaluator = true;
  let err;
  try {
    // Ensure that "this" resolves to the safe global.
    return apply(evaluate, globalObject, [source]);
  } catch (e) {
    // stash the child-code error in hopes of debugging the internal failure
    err = e;
    throw e;
  } finally {
    if (scopeHandler.useUnsafeEvaluator === true) {
      // The proxy switches off useUnsafeEvaluator immediately after
      // the first access, but if that's not the case we abort.
      throwTantrum('handler did not revoke useUnsafeEvaluator', err);
      // If we were not able to abort, at least prevent further
      // variable resolution via the scopeHandler.
      scopeProxyRevocable.revoke();
    }
  }
}

/**
 * makeEvalFunction()
 * A safe version of the native eval function which relies on
 * the safety of performEval for confinement.
 */
const makeEvalFunction = (globalObject, options = {}) => {
  // We use the the concise method syntax to create an eval without a
  // [[Construct]] behavior (such that the invocation "new eval()" throws
  // TypeError: eval is not a constructor"), but which still accepts a
  // 'this' binding.
  const newEval = {
    eval(source) {
      if (typeof source !== 'string') {
        // As per the runtime semantic of PerformEval [ECMAScript 18.2.1.1]:
        // If Type(source) is not String, return source.
        // TODO Recent proposals from Mike Samuel may change this non-string
        // rule. Track.
        return source;
      }
      return performEval(source, globalObject, {}, options);
    },
  }.eval;

  return newEval;
};

// The original unsafe untamed Function constructor, which must not escape.
// Sample at module initialization time, which is before lockdown can
// repair it.  Use it only to build powerless abstractions.
const FERAL_FUNCTION$1 = Function;

/**
 * makeFunctionConstructor()
 * A safe version of the native Function which relies on
 * the safety of performEval for confinement.
 */
function makeFunctionConstructor(globaObject, options = {}) {
  // Define an unused parameter to ensure Function.length === 1
  // eslint-disable-next-line no-unused-vars
  const newFunction = function Function(body) {
    // Sanitize all parameters at the entry point.
    // eslint-disable-next-line prefer-rest-params
    const bodyText = `${arrayPop(arguments) || ''}`;
    // eslint-disable-next-line prefer-rest-params
    const parameters = `${arrayJoin(arguments, ',')}`;

    // Are parameters and bodyText valid code, or is someone
    // attempting an injection attack? This will throw a SyntaxError if:
    // - parameters doesn't parse as parameters
    // - bodyText doesn't parse as a function body
    // - either contain a call to super() or references a super property.
    // eslint-disable-next-line no-new
    new FERAL_FUNCTION$1(parameters, bodyText);

    // Safe to be combined. Defeat potential trailing comments.
    // TODO: since we create an anonymous function, the 'this' value
    // isn't bound to the global object as per specs, but set as undefined.
    const src = `(function anonymous(${parameters}\n) {\n${bodyText}\n})`;
    return performEval(src, globaObject, {}, options);
  };

  defineProperties(newFunction, {
    // Ensure that any function created in any evaluator in a realm is an
    // instance of Function in any evaluator of the same realm.
    prototype: {
      value: Function.prototype,
      writable: false,
      enumerable: false,
      configurable: false,
    },
  });

  // Assert identity of Function.__proto__ accross all compartments
  assert$1(
    getPrototypeOf(Function) === Function.prototype,
    'Function prototype is the same accross compartments',
  );
  assert$1(
    getPrototypeOf(newFunction) === Function.prototype,
    'Function constructor prototype is the same accross compartments',
  );

  return newFunction;
}

/**
 * initGlobalObject()
 * Create new global object using a process similar to ECMA specifications
 * (portions of SetRealmGlobalObject and SetDefaultGlobalBindings).
 * `newGlobalPropertyNames` should be either `initialGlobalPropertyNames` or
 * `sharedGlobalPropertyNames`.
 */
function initGlobalObject(
  globalObject,
  intrinsics,
  newGlobalPropertyNames,
  makeCompartmentConstructor,
  compartmentPrototype,
  { globalTransforms, nativeBrander },
) {
  for (const [name, constant] of entries(constantProperties)) {
    defineProperty(globalObject, name, {
      value: constant,
      writable: false,
      enumerable: false,
      configurable: false,
    });
  }

  for (const [name, intrinsicName] of entries(universalPropertyNames)) {
    if (objectHasOwnProperty(intrinsics, intrinsicName)) {
      defineProperty(globalObject, name, {
        value: intrinsics[intrinsicName],
        writable: true,
        enumerable: false,
        configurable: true,
      });
    }
  }

  for (const [name, intrinsicName] of entries(newGlobalPropertyNames)) {
    if (objectHasOwnProperty(intrinsics, intrinsicName)) {
      defineProperty(globalObject, name, {
        value: intrinsics[intrinsicName],
        writable: true,
        enumerable: false,
        configurable: true,
      });
    }
  }

  const perCompartmentGlobals = {
    globalThis: globalObject,
    eval: makeEvalFunction(globalObject, {
      globalTransforms,
    }),
    Function: makeFunctionConstructor(globalObject, {
      globalTransforms,
    }),
  };

  perCompartmentGlobals.Compartment = makeCompartmentConstructor(
    makeCompartmentConstructor,
    intrinsics,
    nativeBrander,
  );

  // TODO These should still be tamed according to the whitelist before
  // being made available.
  for (const [name, value] of entries(perCompartmentGlobals)) {
    defineProperty(globalObject, name, {
      value,
      writable: true,
      enumerable: false,
      configurable: true,
    });
    if (typeof value === 'function') {
      nativeBrander(value);
    }
  }
}

// Copyright (C) 2018 Agoric

let firstOptions;

// A successful lockdown call indicates that `harden` can be called and
// guarantee that the hardened object graph is frozen out to the fringe.
let lockedDown = false;

// Build a harden() with an empty fringe.
// Gate it on lockdown.
const lockdownHarden = makeHardener();

const harden = ref => {
  assert(lockedDown, `Cannot harden before lockdown`);
  return lockdownHarden(ref);
};

const alreadyHardenedIntrinsics = () => false;

function repairIntrinsics(
  makeCompartmentConstructor,
  compartmentPrototype,
  options = {},
) {
  // First time, absent options default to 'safe'.
  // Subsequent times, absent options default to first options.
  // Thus, all present options must agree with first options.
  // Reconstructing `option` here also ensures that it is a well
  // behaved record, with only own data properties.
  options = { ...firstOptions, ...options };
  const {
    dateTaming = 'safe',
    errorTaming = 'safe',
    mathTaming = 'safe',
    regExpTaming = 'safe',
    localeTaming = 'safe',

    ...extraOptions
  } = options;

  // Assert that only supported options were passed.
  // Use Reflect.ownKeys to reject symbol-named properties as well.
  const extraOptionsNames = Reflect.ownKeys(extraOptions);
  assert(
    extraOptionsNames.length === 0,
    `lockdown(): non supported option ${extraOptionsNames.join(', ')}`,
  );

  // Asserts for multiple invocation of lockdown().
  if (firstOptions) {
    for (const name of keys(firstOptions)) {
      assert(
        options[name] === firstOptions[name],
        `lockdown(): cannot re-invoke with different option ${name}`,
      );
    }
    return alreadyHardenedIntrinsics;
  }

  firstOptions = {
    dateTaming,
    errorTaming,
    mathTaming,
    regExpTaming,
    localeTaming,
  };

  /**
   * 1. TAME powers & gather intrinsics first.
   */
  const intrinsicsCollector = makeIntrinsicsCollector();

  intrinsicsCollector.addIntrinsics(tameFunctionConstructors());

  intrinsicsCollector.addIntrinsics(tameDateConstructor(dateTaming));
  intrinsicsCollector.addIntrinsics(tameErrorConstructor(errorTaming));
  intrinsicsCollector.addIntrinsics(tameMathObject(mathTaming));
  intrinsicsCollector.addIntrinsics(tameRegExpConstructor(regExpTaming));

  intrinsicsCollector.addIntrinsics(getAnonymousIntrinsics());

  intrinsicsCollector.completePrototypes();

  const intrinsics = intrinsicsCollector.finalIntrinsics();

  // Replace *Locale* methods with their non-locale equivalents
  tameLocaleMethods(intrinsics, localeTaming);

  // Replace Function.prototype.toString with one that recognizes
  // shimmed functions as honorary native functions.
  const nativeBrander = tameFunctionToString();

  /**
   * 2. WHITELIST to standardize the environment.
   */

  // Remove non-standard properties.
  // All remaining function encountered during whitelisting are
  // branded as honorary native functions.
  whitelistIntrinsics(intrinsics, nativeBrander);

  // Repair problems with legacy accessors if necessary.
  repairLegacyAccessors();

  // Initialize the powerful initial global, i.e., the global of the
  // start compartment, from the intrinsics.
  initGlobalObject(
    globalThis,
    intrinsics,
    initialGlobalPropertyNames,
    makeCompartmentConstructor,
    compartmentPrototype,
    {
      nativeBrander,
    },
  );

  /**
   * 3. HARDEN to share the intrinsics.
   */

  function hardenIntrinsics() {
    // Circumvent the override mistake.
    const detachedProperties = enablePropertyOverrides(intrinsics);

    // Finally register and optionally freeze all the intrinsics. This
    // must be the operation that modifies the intrinsics.
    lockdownHarden(intrinsics);
    lockdownHarden(detachedProperties);

    // Having completed lockdown without failing, the user may now
    // call `harden` and expect the object's transitively accessible properties
    // to be frozen out to the fringe.
    // Raise the `harden` gate.
    lockedDown = true;

    // Returning `true` indicates that this is a JS to SES transition.
    return true;
  }

  return hardenIntrinsics;
}

const makeLockdown = (
  makeCompartmentConstructor,
  compartmentPrototype,
) => {
  const lockdown = (options = {}) => {
    const maybeHardenIntrinsics = repairIntrinsics(
      makeCompartmentConstructor,
      compartmentPrototype,
      options,
    );
    return maybeHardenIntrinsics();
  };
  return lockdown;
};

// This module exports both Compartment and StaticModuleRecord because they

// privateFields captures the private state for each compartment.
const privateFields = new WeakMap();

const CompartmentPrototype = {
  constructor: InertCompartment,

  get globalThis() {
    return privateFields.get(this).globalObject;
  },

  get name() {
    return privateFields.get(this).name;
  },

  /**
   * @param {string} source is a JavaScript program grammar construction.
   * @param {{
   *   transforms: Array<Transform>,
   *   sloppyGlobalsMode: bool,
   * }} options.
   */
  evaluate(source, options = {}) {
    // Perform this check first to avoid unecessary sanitizing.
    // TODO Maybe relax string check and coerce instead:
    // https://github.com/tc39/proposal-dynamic-code-brand-checks
    if (typeof source !== 'string') {
      throw new TypeError('first argument of evaluate() must be a string');
    }

    // Extract options, and shallow-clone transforms.
    const {
      transforms = [],
      sloppyGlobalsMode = false,
      __moduleShimLexicals__ = undefined,
    } = options;
    const localTransforms = [...transforms];

    const {
      globalTransforms,
      globalObject,
      globalLexicals,
    } = privateFields.get(this);

    let localObject = globalLexicals;
    if (__moduleShimLexicals__ !== undefined) {
      localObject = create(null, getOwnPropertyDescriptors(globalLexicals));
      defineProperties(
        localObject,
        getOwnPropertyDescriptors(__moduleShimLexicals__),
      );
    }

    return performEval(source, globalObject, localObject, {
      globalTransforms,
      localTransforms,
      sloppyGlobalsMode,
    });
  },

  toString() {
    return '[object Compartment]';
  },
};

defineProperties(InertCompartment, {
  prototype: { value: CompartmentPrototype },
});

const makeCompartmentConstructor = (
  targetMakeCompartmentConstructor,
  intrinsics,
  nativeBrander,
) => {
  /**
   * Compartment()
   * Each Compartment constructor is a global. A host that wants to execute
   * code in a context bound to a new global creates a new compartment.
   */
  function Compartment(endowments = {}, _moduleMap = {}, options = {}) {
    if (new.target === undefined) {
      throw new TypeError(
        `Class constructor Compartment cannot be invoked without 'new'`,
      );
    }

    // Extract options, and shallow-clone transforms.
    const {
      name = '<unknown>',
      transforms = [],
      globalLexicals = {},
    } = options;
    const globalTransforms = [...transforms];

    const globalObject = {};
    initGlobalObject(
      globalObject,
      intrinsics,
      sharedGlobalPropertyNames,
      targetMakeCompartmentConstructor,
      this.constructor.prototype,
      {
        globalTransforms,
        nativeBrander,
      },
    );

    assign(globalObject, endowments);

    const invalidNames = getOwnPropertyNames(globalLexicals).filter(
      identifier => !isValidIdentifierName(identifier),
    );
    if (invalidNames.length) {
      throw new Error(
        `Cannot create compartment with invalid names for global lexicals: ${invalidNames.join(
          ', ',
        )}; these names would not be lexically mentionable`,
      );
    }

    privateFields.set(this, {
      name,
      globalTransforms,
      globalObject,
      // The caller continues to own the globalLexicals object they passed to
      // the compartment constructor, but the compartment only respects the
      // original values and they are constants in the scope of evaluated
      // programs and executed modules.
      // This shallow copy captures only the values of enumerable own
      // properties, erasing accessors.
      // The snapshot is frozen to ensure that the properties are immutable
      // when transferred-by-property-descriptor onto local scope objects.
      globalLexicals: freeze({ ...globalLexicals }),
    });
  }

  Compartment.prototype = CompartmentPrototype;

  return Compartment;
};

// Copyright (C) 2018 Agoric

// TODO wasteful to do it twice, once before lockdown and again during
// lockdown. The second is doubly indirect. We should at least flatten that.
const nativeBrander = tameFunctionToString();

const Compartment = makeCompartmentConstructor(
  makeCompartmentConstructor,
  getGlobalIntrinsics(globalThis),
  nativeBrander,
);

assign(globalThis, {
  harden,
  lockdown: makeLockdown(makeCompartmentConstructor, CompartmentPrototype),
  Compartment,
});
