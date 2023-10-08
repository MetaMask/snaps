// DO NOT EDIT! THIS FILE IS GENERATED FROM "runtime-template.js" BY RUNNING "builder-runtime.js"

/* eslint-disable no-unused-vars */
// eslint-disable-next-line no-extra-semi
;(function() {
  // this runtime template code is destined to wrap LavaMoat entirely,
  // therefore this is our way of capturing access to basic APIs LavaMoat
  // uses to still be accessible only to LavaMoat after scuttling occurs
  const {
    RegExp,
    Reflect,
    Proxy,
    Object,
    Error,
    Array,
    Set,
    Math,
    Date,
    console,
  } = globalThis

  const moduleRegistry = new Map()
  const lavamoatPolicy = { resources: {} }
  const debugMode = false
  const statsMode = false

  // initialize the kernel
  const reportStatsHook = statsMode ? (function makeInitStatsHook ({ onStatsReady }) {
  let statModuleStack = []
  return reportStatsHook

  function reportStatsHook (event, moduleId) {
    if (event === 'start') {
      // record start
      const startTime = Date.now()
      // console.log(`loaded module ${moduleId}`)
      const statRecord = {
        'name': moduleId,
        'value': null,
        'children': [],
        'startTime': startTime,
        'endTime': null,
      }
      // add as child to current
      if (statModuleStack.length > 0) {
        const currentStat = statModuleStack[statModuleStack.length - 1]
        currentStat.children.push(statRecord)
      }
      // set as current
      statModuleStack.push(statRecord)
    } else if (event === 'end') {
      const endTime = Date.now()
      const currentStat = statModuleStack[statModuleStack.length - 1]
      // sanity check, should only get an end for the current top of stack
      if (currentStat.name !== moduleId) {
        console.error(`stats hook misaligned "${currentStat.name}", "${moduleId}" ${statModuleStack.map(e => e.name).join()}`)
      }
      currentStat.endTime = endTime
      const startTime = currentStat.startTime
      const duration = endTime - startTime
      currentStat.value = duration
      // console.log(`loaded module ${moduleId} in ${duration}ms`)
      // check if totally done
      if (statModuleStack.length === 1) {
        currentStat.version = 1
        onStatsReady(currentStat)
      }
      statModuleStack.pop()
    }
  }

})({ onStatsReady }) : () => {}
  const createKernel = // LavaMoat Prelude
(function () {
  return createKernel

  function createKernel ({
    lavamoatConfig,
    loadModuleData,
    getRelativeModuleId,
    prepareModuleInitializerArgs,
    getExternalCompartment,
    globalThisRefs,
    runWithPrecompiledModules,
    reportStatsHook,
  }) {
    // debug options are hard-coded at build time
    const {
      debugMode,
    } = {"debugMode":false}
    // security options are hard-coded at build time
    const {
      scuttleGlobalThis,
    } = {}

    function getGlobalRef () {
      if (typeof globalThis !== 'undefined') {
        return globalThis
      }
      const globalRef = typeof self !== 'undefined' ? self : (typeof global !== 'undefined' ? global : undefined)
      if (typeof globalRef !== 'undefined') {
        console.error('LavaMoat - Deprecation Warning: global reference is expected as `globalThis`')
      }
    }

    const globalRef = getGlobalRef()

    if (!globalRef) {
      throw new Error('Lavamoat - globalThis not defined')
    }

    // polyfill globalThis
    if (globalRef.globalThis !== globalRef) {
      globalRef.globalThis = globalRef
    }
    if (globalRef.global !== globalRef) {
      globalRef.global = globalRef
    }

    // create the SES rootRealm
    // "templateRequire" calls are inlined in "generateKernel"
    // load-bearing semi-colon, do not remove
    // eslint-disable-next-line no-extra-semi
    ;// define ses
(function(){
  const global = globalRef
  const exports = {}
  const module = { exports }
  ;(function(){
// START of injected code from ses
'use strict';
(() => {
  const functors = [
// === functors[0] ===
(({   imports: $h‍_imports,   liveVar: $h‍_live,   onceVar: $h‍_once,   importMeta: $h‍____meta,  }) => {   $h‍_imports([]);   /* global globalThis */
/* eslint-disable no-restricted-globals */

/**
 * commons.js
 * Declare shorthand functions. Sharing these declarations across modules
 * improves on consistency and minification. Unused declarations are
 * dropped by the tree shaking process.
 *
 * We capture these, not just for brevity, but for security. If any code
 * modifies Object to change what 'assign' points to, the Compartment shim
 * would be corrupted.
 */

// We cannot use globalThis as the local name since it would capture the
// lexical name.
const universalThis=  globalThis;$h‍_once.universalThis(universalThis);


const        {
  Array,
  Date,
  FinalizationRegistry,
  Float32Array,
  JSON,
  Map,
  Math,
  Number,
  Object,
  Promise,
  Proxy,
  Reflect,
  RegExp: FERAL_REG_EXP,
  Set,
  String,
  Symbol,
  WeakMap,
  WeakSet}=
    globalThis;$h‍_once.Array(Array);$h‍_once.Date(Date);$h‍_once.FinalizationRegistry(FinalizationRegistry);$h‍_once.Float32Array(Float32Array);$h‍_once.JSON(JSON);$h‍_once.Map(Map);$h‍_once.Math(Math);$h‍_once.Number(Number);$h‍_once.Object(Object);$h‍_once.Promise(Promise);$h‍_once.Proxy(Proxy);$h‍_once.Reflect(Reflect);$h‍_once.FERAL_REG_EXP(FERAL_REG_EXP);$h‍_once.Set(Set);$h‍_once.String(String);$h‍_once.Symbol(Symbol);$h‍_once.WeakMap(WeakMap);$h‍_once.WeakSet(WeakSet);

const        {
  // The feral Error constructor is safe for internal use, but must not be
  // revealed to post-lockdown code in any compartment including the start
  // compartment since in V8 at least it bears stack inspection capabilities.
  Error: FERAL_ERROR,
  RangeError,
  ReferenceError,
  SyntaxError,
  TypeError}=
    globalThis;$h‍_once.FERAL_ERROR(FERAL_ERROR);$h‍_once.RangeError(RangeError);$h‍_once.ReferenceError(ReferenceError);$h‍_once.SyntaxError(SyntaxError);$h‍_once.TypeError(TypeError);

const        {
  assign,
  create,
  defineProperties,
  entries,
  freeze,
  getOwnPropertyDescriptor,
  getOwnPropertyDescriptors,
  getOwnPropertyNames,
  getPrototypeOf,
  is,
  isFrozen,
  isSealed,
  isExtensible,
  keys,
  prototype: objectPrototype,
  seal,
  preventExtensions,
  setPrototypeOf,
  values,
  fromEntries}=
    Object;$h‍_once.assign(assign);$h‍_once.create(create);$h‍_once.defineProperties(defineProperties);$h‍_once.entries(entries);$h‍_once.freeze(freeze);$h‍_once.getOwnPropertyDescriptor(getOwnPropertyDescriptor);$h‍_once.getOwnPropertyDescriptors(getOwnPropertyDescriptors);$h‍_once.getOwnPropertyNames(getOwnPropertyNames);$h‍_once.getPrototypeOf(getPrototypeOf);$h‍_once.is(is);$h‍_once.isFrozen(isFrozen);$h‍_once.isSealed(isSealed);$h‍_once.isExtensible(isExtensible);$h‍_once.keys(keys);$h‍_once.objectPrototype(objectPrototype);$h‍_once.seal(seal);$h‍_once.preventExtensions(preventExtensions);$h‍_once.setPrototypeOf(setPrototypeOf);$h‍_once.values(values);$h‍_once.fromEntries(fromEntries);

const        {
  species: speciesSymbol,
  toStringTag: toStringTagSymbol,
  iterator: iteratorSymbol,
  matchAll: matchAllSymbol,
  unscopables: unscopablesSymbol,
  keyFor: symbolKeyFor,
  for: symbolFor}=
    Symbol;$h‍_once.speciesSymbol(speciesSymbol);$h‍_once.toStringTagSymbol(toStringTagSymbol);$h‍_once.iteratorSymbol(iteratorSymbol);$h‍_once.matchAllSymbol(matchAllSymbol);$h‍_once.unscopablesSymbol(unscopablesSymbol);$h‍_once.symbolKeyFor(symbolKeyFor);$h‍_once.symbolFor(symbolFor);

const        { isInteger}=   Number;$h‍_once.isInteger(isInteger);

const        { stringify: stringifyJson}=   JSON;

// Needed only for the Safari bug workaround below
$h‍_once.stringifyJson(stringifyJson);const{defineProperty:originalDefineProperty}=Object;

const        defineProperty=  (object, prop, descriptor)=>  {
  // We used to do the following, until we had to reopen Safari bug
  // https://bugs.webkit.org/show_bug.cgi?id=222538#c17
  // Once this is fixed, we may restore it.
  // // Object.defineProperty is allowed to fail silently so we use
  // // Object.defineProperties instead.
  // return defineProperties(object, { [prop]: descriptor });

  // Instead, to workaround the Safari bug
  const result=  originalDefineProperty(object, prop, descriptor);
  if( result!==  object) {
    // See https://github.com/endojs/endo/blob/master/packages/ses/error-codes/SES_DEFINE_PROPERTY_FAILED_SILENTLY.md
    throw TypeError(
       `Please report that the original defineProperty silently failed to set ${stringifyJson(
        String(prop))
        }. (SES_DEFINE_PROPERTY_FAILED_SILENTLY)`);

   }
  return result;
 };$h‍_once.defineProperty(defineProperty);

const        {
  apply,
  construct,
  get: reflectGet,
  getOwnPropertyDescriptor: reflectGetOwnPropertyDescriptor,
  has: reflectHas,
  isExtensible: reflectIsExtensible,
  ownKeys,
  preventExtensions: reflectPreventExtensions,
  set: reflectSet}=
    Reflect;$h‍_once.apply(apply);$h‍_once.construct(construct);$h‍_once.reflectGet(reflectGet);$h‍_once.reflectGetOwnPropertyDescriptor(reflectGetOwnPropertyDescriptor);$h‍_once.reflectHas(reflectHas);$h‍_once.reflectIsExtensible(reflectIsExtensible);$h‍_once.ownKeys(ownKeys);$h‍_once.reflectPreventExtensions(reflectPreventExtensions);$h‍_once.reflectSet(reflectSet);

const        { isArray, prototype: arrayPrototype}=   Array;$h‍_once.isArray(isArray);$h‍_once.arrayPrototype(arrayPrototype);
const        { prototype: mapPrototype}=   Map;$h‍_once.mapPrototype(mapPrototype);
const        { revocable: proxyRevocable}=   Proxy;$h‍_once.proxyRevocable(proxyRevocable);
const        { prototype: regexpPrototype}=   RegExp;$h‍_once.regexpPrototype(regexpPrototype);
const        { prototype: setPrototype}=   Set;$h‍_once.setPrototype(setPrototype);
const        { prototype: stringPrototype}=   String;$h‍_once.stringPrototype(stringPrototype);
const        { prototype: weakmapPrototype}=   WeakMap;$h‍_once.weakmapPrototype(weakmapPrototype);
const        { prototype: weaksetPrototype}=   WeakSet;$h‍_once.weaksetPrototype(weaksetPrototype);
const        { prototype: functionPrototype}=   Function;$h‍_once.functionPrototype(functionPrototype);
const        { prototype: promisePrototype}=   Promise;$h‍_once.promisePrototype(promisePrototype);

const        typedArrayPrototype=  getPrototypeOf(Uint8Array.prototype);$h‍_once.typedArrayPrototype(typedArrayPrototype);

const { bind}=   functionPrototype;

/**
 * uncurryThis()
 * Equivalent of: fn => (thisArg, ...args) => apply(fn, thisArg, args)
 *
 * See those reference for a complete explanation:
 * http://wiki.ecmascript.org/doku.php?id=conventions:safe_meta_programming
 * which only lives at
 * http://web.archive.org/web/20160805225710/http://wiki.ecmascript.org/doku.php?id=conventions:safe_meta_programming
 *
 * @type {<F extends (this: any, ...args: any[]) => any>(fn: F) => ((thisArg: ThisParameterType<F>, ...args: Parameters<F>) => ReturnType<F>)}
 */
const        uncurryThis=  bind.bind(bind.call); // eslint-disable-line @endo/no-polymorphic-call
$h‍_once.uncurryThis(uncurryThis);
const        objectHasOwnProperty=  uncurryThis(objectPrototype.hasOwnProperty);
//
$h‍_once.objectHasOwnProperty(objectHasOwnProperty);const arrayFilter=uncurryThis(arrayPrototype.filter);$h‍_once.arrayFilter(arrayFilter);
const        arrayForEach=  uncurryThis(arrayPrototype.forEach);$h‍_once.arrayForEach(arrayForEach);
const        arrayIncludes=  uncurryThis(arrayPrototype.includes);$h‍_once.arrayIncludes(arrayIncludes);
const        arrayJoin=  uncurryThis(arrayPrototype.join);
/** @type {<T, U>(thisArg: readonly T[], callbackfn: (value: T, index: number, array: T[]) => U, cbThisArg?: any) => U[]} */$h‍_once.arrayJoin(arrayJoin);
const        arrayMap=  /** @type {any} */  uncurryThis(arrayPrototype.map);$h‍_once.arrayMap(arrayMap);
const        arrayPop=  uncurryThis(arrayPrototype.pop);
/** @type {<T>(thisArg: T[], ...items: T[]) => number} */$h‍_once.arrayPop(arrayPop);
const        arrayPush=  uncurryThis(arrayPrototype.push);$h‍_once.arrayPush(arrayPush);
const        arraySlice=  uncurryThis(arrayPrototype.slice);$h‍_once.arraySlice(arraySlice);
const        arraySome=  uncurryThis(arrayPrototype.some);$h‍_once.arraySome(arraySome);
const        arraySort=  uncurryThis(arrayPrototype.sort);$h‍_once.arraySort(arraySort);
const        iterateArray=  uncurryThis(arrayPrototype[iteratorSymbol]);
//
$h‍_once.iterateArray(iterateArray);const mapSet=uncurryThis(mapPrototype.set);$h‍_once.mapSet(mapSet);
const        mapGet=  uncurryThis(mapPrototype.get);$h‍_once.mapGet(mapGet);
const        mapHas=  uncurryThis(mapPrototype.has);$h‍_once.mapHas(mapHas);
const        mapDelete=  uncurryThis(mapPrototype.delete);$h‍_once.mapDelete(mapDelete);
const        mapEntries=  uncurryThis(mapPrototype.entries);$h‍_once.mapEntries(mapEntries);
const        iterateMap=  uncurryThis(mapPrototype[iteratorSymbol]);
//
$h‍_once.iterateMap(iterateMap);const setAdd=uncurryThis(setPrototype.add);$h‍_once.setAdd(setAdd);
const        setDelete=  uncurryThis(setPrototype.delete);$h‍_once.setDelete(setDelete);
const        setForEach=  uncurryThis(setPrototype.forEach);$h‍_once.setForEach(setForEach);
const        setHas=  uncurryThis(setPrototype.has);$h‍_once.setHas(setHas);
const        iterateSet=  uncurryThis(setPrototype[iteratorSymbol]);
//
$h‍_once.iterateSet(iterateSet);const regexpTest=uncurryThis(regexpPrototype.test);$h‍_once.regexpTest(regexpTest);
const        regexpExec=  uncurryThis(regexpPrototype.exec);$h‍_once.regexpExec(regexpExec);
const        matchAllRegExp=  uncurryThis(regexpPrototype[matchAllSymbol]);
//
$h‍_once.matchAllRegExp(matchAllRegExp);const stringEndsWith=uncurryThis(stringPrototype.endsWith);$h‍_once.stringEndsWith(stringEndsWith);
const        stringIncludes=  uncurryThis(stringPrototype.includes);$h‍_once.stringIncludes(stringIncludes);
const        stringIndexOf=  uncurryThis(stringPrototype.indexOf);$h‍_once.stringIndexOf(stringIndexOf);
const        stringMatch=  uncurryThis(stringPrototype.match);
/**
 * @type { &
 *   ((thisArg: string, searchValue: { [Symbol.replace](string: string, replaceValue: string): string; }, replaceValue: string) => string) &
 *   ((thisArg: string, searchValue: { [Symbol.replace](string: string, replacer: (substring: string, ...args: any[]) => string): string; }, replacer: (substring: string, ...args: any[]) => string) => string)
 * }
 */$h‍_once.stringMatch(stringMatch);
const        stringReplace=  /** @type {any} */
  uncurryThis(stringPrototype.replace);$h‍_once.stringReplace(stringReplace);

const        stringSearch=  uncurryThis(stringPrototype.search);$h‍_once.stringSearch(stringSearch);
const        stringSlice=  uncurryThis(stringPrototype.slice);
/** @type {(thisArg: string, splitter: string | RegExp | { [Symbol.split](string: string, limit?: number): string[]; }, limit?: number) => string[]} */$h‍_once.stringSlice(stringSlice);
const        stringSplit=  uncurryThis(stringPrototype.split);$h‍_once.stringSplit(stringSplit);
const        stringStartsWith=  uncurryThis(stringPrototype.startsWith);$h‍_once.stringStartsWith(stringStartsWith);
const        iterateString=  uncurryThis(stringPrototype[iteratorSymbol]);
//
$h‍_once.iterateString(iterateString);const weakmapDelete=uncurryThis(weakmapPrototype.delete);
/** @type {<K extends {}, V>(thisArg: WeakMap<K, V>, ...args: Parameters<WeakMap<K,V>['get']>) => ReturnType<WeakMap<K,V>['get']>} */$h‍_once.weakmapDelete(weakmapDelete);
const        weakmapGet=  uncurryThis(weakmapPrototype.get);$h‍_once.weakmapGet(weakmapGet);
const        weakmapHas=  uncurryThis(weakmapPrototype.has);$h‍_once.weakmapHas(weakmapHas);
const        weakmapSet=  uncurryThis(weakmapPrototype.set);
//
$h‍_once.weakmapSet(weakmapSet);const weaksetAdd=uncurryThis(weaksetPrototype.add);$h‍_once.weaksetAdd(weaksetAdd);
const        weaksetHas=  uncurryThis(weaksetPrototype.has);
//
$h‍_once.weaksetHas(weaksetHas);const functionToString=uncurryThis(functionPrototype.toString);
//
$h‍_once.functionToString(functionToString);const{all}=Promise;
const        promiseAll=  (promises)=>apply(all, Promise, [promises]);$h‍_once.promiseAll(promiseAll);
const        promiseCatch=  uncurryThis(promisePrototype.catch);
/** @type {<T, TResult1 = T, TResult2 = never>(thisArg: T, onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null) => Promise<TResult1 | TResult2>} */$h‍_once.promiseCatch(promiseCatch);
const        promiseThen=  /** @type {any} */
  uncurryThis(promisePrototype.then);

//
$h‍_once.promiseThen(promiseThen);const finalizationRegistryRegister=
  FinalizationRegistry&&  uncurryThis(FinalizationRegistry.prototype.register);$h‍_once.finalizationRegistryRegister(finalizationRegistryRegister);
const        finalizationRegistryUnregister=
  FinalizationRegistry&&
  uncurryThis(FinalizationRegistry.prototype.unregister);

/**
 * getConstructorOf()
 * Return the constructor from an instance.
 *
 * @param {Function} fn
 */$h‍_once.finalizationRegistryUnregister(finalizationRegistryUnregister);
const        getConstructorOf=  (fn)=>
  reflectGet(getPrototypeOf(fn), 'constructor');

/**
 * immutableObject
 * An immutable (frozen) empty object that is safe to share.
 */$h‍_once.getConstructorOf(getConstructorOf);
const        immutableObject=  freeze(create(null));

/**
 * isObject tests whether a value is an object.
 * Today, this is equivalent to:
 *
 *   const isObject = value => {
 *     if (value === null) return false;
 *     const type = typeof value;
 *     return type === 'object' || type === 'function';
 *   };
 *
 * But this is not safe in the face of possible evolution of the language, for
 * example new types or semantics of records and tuples.
 * We use this implementation despite the unnecessary allocation implied by
 * attempting to box a primitive.
 *
 * @param {any} value
 */$h‍_once.immutableObject(immutableObject);
const        isObject=  (value)=>Object(value)===  value;

/**
 * isError tests whether an object inherits from the intrinsic
 * `Error.prototype`.
 * We capture the original error constructor as FERAL_ERROR to provide a clear
 * signal for reviewers that we are handling an object with excess authority,
 * like stack trace inspection, that we are carefully hiding from client code.
 * Checking instanceof happens to be safe, but to avoid uttering FERAL_ERROR
 * for such a trivial case outside commons.js, we provide a utility function.
 *
 * @param {any} value
 */$h‍_once.isObject(isObject);
const        isError=  (value)=>value instanceof FERAL_ERROR;

// The original unsafe untamed eval function, which must not escape.
// Sample at module initialization time, which is before lockdown can
// repair it.  Use it only to build powerless abstractions.
// eslint-disable-next-line no-eval
$h‍_once.isError(isError);const FERAL_EVAL=eval;

// The original unsafe untamed Function constructor, which must not escape.
// Sample at module initialization time, which is before lockdown can
// repair it.  Use it only to build powerless abstractions.
$h‍_once.FERAL_EVAL(FERAL_EVAL);const FERAL_FUNCTION=Function;$h‍_once.FERAL_FUNCTION(FERAL_FUNCTION);

const        noEvalEvaluate=  ()=>  {
  // See https://github.com/endojs/endo/blob/master/packages/ses/error-codes/SES_NO_EVAL.md
  throw TypeError('Cannot eval with evalTaming set to "noEval" (SES_NO_EVAL)');
 };$h‍_once.noEvalEvaluate(noEvalEvaluate);
})
,
// === functors[1] ===
(({   imports: $h‍_imports,   liveVar: $h‍_live,   onceVar: $h‍_once,   importMeta: $h‍____meta,  }) => {   let TypeError;$h‍_imports([["./commons.js", [["TypeError", [$h‍_a => (TypeError = $h‍_a)]]]]]);   

/** getThis returns globalThis in sloppy mode or undefined in strict mode. */
function getThis() {
  return this;
 }

if( getThis()) {
  // See https://github.com/endojs/endo/blob/master/packages/ses/error-codes/SES_NO_SLOPPY.md
  throw TypeError( `SES failed to initialize, sloppy mode (SES_NO_SLOPPY)`);
 }
})
,
// === functors[2] ===
(({   imports: $h‍_imports,   liveVar: $h‍_live,   onceVar: $h‍_once,   importMeta: $h‍____meta,  }) => {   $h‍_imports([]);   // @ts-check

// `@endo/env-options` needs to be imported quite early, and so should
// avoid importing from ses or anything that depends on ses.

// /////////////////////////////////////////////////////////////////////////////
// Prelude of cheap good - enough imitations of things we'd use or
// do differently if we could depend on ses

const { freeze}=   Object;
const { apply}=   Reflect;

// Should be equivalent to the one in ses' commons.js even though it
// uses the other technique.
const uncurryThis=
  (fn)=>
  (receiver, ...args)=>
    apply(fn, receiver, args);
const arrayPush=  uncurryThis(Array.prototype.push);

const q=  JSON.stringify;

const Fail=  (literals, ...args)=>  {
  let msg=  literals[0];
  for( let i=  0; i<  args.length; i+=  1) {
    msg=   `${msg}${args[i]}${literals[i+ 1] }`;
   }
  throw Error(msg);
 };

// end prelude
// /////////////////////////////////////////////////////////////////////////////

/**
 * `makeEnvironmentCaptor` provides a mechanism for getting environment
 * variables, if they are needed, and a way to catalog the names of all
 * the environment variables that were captured.
 *
 * @param {object} aGlobal
 */
const        makeEnvironmentCaptor=  (aGlobal)=>{
  const capturedEnvironmentOptionNames=  [];

  /**
   * Gets an environment option by name and returns the option value or the
   * given default.
   *
   * @param {string} optionName
   * @param {string} defaultSetting
   * @returns {string}
   */
  const getEnvironmentOption=  (optionName, defaultSetting)=>  {
    // eslint-disable-next-line @endo/no-polymorphic-call
    typeof optionName===  'string'||
      Fail `Environment option name ${q(optionName)} must be a string.`;
    // eslint-disable-next-line @endo/no-polymorphic-call
    typeof defaultSetting===  'string'||
      Fail `Environment option default setting ${q(
        defaultSetting)
        } must be a string.`;

    /** @type {string} */
    let setting=  defaultSetting;
    const globalProcess=  aGlobal.process;
    if( globalProcess&&  typeof globalProcess===  'object') {
      const globalEnv=  globalProcess.env;
      if( globalEnv&&  typeof globalEnv===  'object') {
        if( optionName in globalEnv) {
          arrayPush(capturedEnvironmentOptionNames, optionName);
          const optionValue=  globalEnv[optionName];
          // eslint-disable-next-line @endo/no-polymorphic-call
          typeof optionValue===  'string'||
            Fail `Environment option named ${q(
              optionName)
              }, if present, must have a corresponding string value, got ${q(
              optionValue)
              }`;
          setting=  optionValue;
         }
       }
     }
    return setting;
   };
  freeze(getEnvironmentOption);

  const getCapturedEnvironmentOptionNames=  ()=>  {
    return freeze([...capturedEnvironmentOptionNames]);
   };
  freeze(getCapturedEnvironmentOptionNames);

  return freeze({ getEnvironmentOption, getCapturedEnvironmentOptionNames});
 };$h‍_once.makeEnvironmentCaptor(makeEnvironmentCaptor);
freeze(makeEnvironmentCaptor);
})
,
// === functors[3] ===
(({   imports: $h‍_imports,   liveVar: $h‍_live,   onceVar: $h‍_once,   importMeta: $h‍____meta,  }) => {   $h‍_imports([["./src/env-options.js", []]]);   
})
,
// === functors[4] ===
(({   imports: $h‍_imports,   liveVar: $h‍_live,   onceVar: $h‍_once,   importMeta: $h‍____meta,  }) => {   let Set,String,isArray,arrayJoin,arraySlice,arraySort,arrayMap,keys,fromEntries,freeze,is,isError,setAdd,setHas,stringIncludes,stringStartsWith,stringifyJson,toStringTagSymbol;$h‍_imports([["../commons.js", [["Set", [$h‍_a => (Set = $h‍_a)]],["String", [$h‍_a => (String = $h‍_a)]],["isArray", [$h‍_a => (isArray = $h‍_a)]],["arrayJoin", [$h‍_a => (arrayJoin = $h‍_a)]],["arraySlice", [$h‍_a => (arraySlice = $h‍_a)]],["arraySort", [$h‍_a => (arraySort = $h‍_a)]],["arrayMap", [$h‍_a => (arrayMap = $h‍_a)]],["keys", [$h‍_a => (keys = $h‍_a)]],["fromEntries", [$h‍_a => (fromEntries = $h‍_a)]],["freeze", [$h‍_a => (freeze = $h‍_a)]],["is", [$h‍_a => (is = $h‍_a)]],["isError", [$h‍_a => (isError = $h‍_a)]],["setAdd", [$h‍_a => (setAdd = $h‍_a)]],["setHas", [$h‍_a => (setHas = $h‍_a)]],["stringIncludes", [$h‍_a => (stringIncludes = $h‍_a)]],["stringStartsWith", [$h‍_a => (stringStartsWith = $h‍_a)]],["stringifyJson", [$h‍_a => (stringifyJson = $h‍_a)]],["toStringTagSymbol", [$h‍_a => (toStringTagSymbol = $h‍_a)]]]]]);   






















/**
 * Joins English terms with commas and an optional conjunction.
 *
 * @param {(string | StringablePayload)[]} terms
 * @param {"and" | "or"} conjunction
 */
const        enJoin=  (terms, conjunction)=>  {
  if( terms.length===  0) {
    return '(none)';
   }else if( terms.length===  1) {
    return terms[0];
   }else if( terms.length===  2) {
    const [first, second]=  terms;
    return  `${first} ${conjunction} ${second}`;
   }else {
    return  `${arrayJoin(arraySlice(terms,0, -1), ', ') }, ${conjunction} ${
      terms[terms.length-  1]
     }`;
   }
 };

/**
 * Prepend the correct indefinite article onto a noun, typically a typeof
 * result, e.g., "an object" vs. "a number"
 *
 * @param {string} str The noun to prepend
 * @returns {string} The noun prepended with a/an
 */$h‍_once.enJoin(enJoin);
const an=  (str)=>{
  str=   `${str}`;
  if( str.length>=  1&&  stringIncludes('aeiouAEIOU', str[0])) {
    return  `an ${str}`;
   }
  return  `a ${str}`;
 };$h‍_once.an(an);
freeze(an);


/**
 * Like `JSON.stringify` but does not blow up if given a cycle or a bigint.
 * This is not
 * intended to be a serialization to support any useful unserialization,
 * or any programmatic use of the resulting string. The string is intended
 * *only* for showing a human under benign conditions, in order to be
 * informative enough for some
 * logging purposes. As such, this `bestEffortStringify` has an
 * imprecise specification and may change over time.
 *
 * The current `bestEffortStringify` possibly emits too many "seen"
 * markings: Not only for cycles, but also for repeated subtrees by
 * object identity.
 *
 * As a best effort only for diagnostic interpretation by humans,
 * `bestEffortStringify` also turns various cases that normal
 * `JSON.stringify` skips or errors on, like `undefined` or bigints,
 * into strings that convey their meaning. To distinguish this from
 * strings in the input, these synthesized strings always begin and
 * end with square brackets. To distinguish those strings from an
 * input string with square brackets, and input string that starts
 * with an open square bracket `[` is itself placed in square brackets.
 *
 * @param {any} payload
 * @param {(string|number)=} spaces
 * @returns {string}
 */
const bestEffortStringify=  (payload, spaces=  undefined)=>  {
  const seenSet=  new Set();
  const replacer=  (_, val)=>  {
    switch( typeof val){
      case 'object': {
        if( val===  null) {
          return null;
         }
        if( setHas(seenSet, val)) {
          return '[Seen]';
         }
        setAdd(seenSet, val);
        if( isError(val)) {
          return  `[${val.name}: ${val.message}]`;
         }
        if( toStringTagSymbol in val) {
          // For the built-ins that have or inherit a `Symbol.toStringTag`-named
          // property, most of them inherit the default `toString` method,
          // which will print in a similar manner: `"[object Foo]"` vs
          // `"[Foo]"`. The exceptions are
          //    * `Symbol.prototype`, `BigInt.prototype`, `String.prototype`
          //      which don't matter to us since we handle primitives
          //      separately and we don't care about primitive wrapper objects.
          //    * TODO
          //      `Date.prototype`, `TypedArray.prototype`.
          //      Hmmm, we probably should make special cases for these. We're
          //      not using these yet, so it's not urgent. But others will run
          //      into these.
          //
          // Once #2018 is closed, the only objects in our code that have or
          // inherit a `Symbol.toStringTag`-named property are remotables
          // or their remote presences.
          // This printing will do a good job for these without
          // violating abstraction layering. This behavior makes sense
          // purely in terms of JavaScript concepts. That's some of the
          // motivation for choosing that representation of remotables
          // and their remote presences in the first place.
          return  `[${val[toStringTagSymbol]}]`;
         }
        if( isArray(val)) {
          return val;
         }
        const names=  keys(val);
        if( names.length<  2) {
          return val;
         }
        let sorted=  true;
        for( let i=  1; i<  names.length; i+=  1) {
          if( names[i-  1]>=  names[i]) {
            sorted=  false;
            break;
           }
         }
        if( sorted) {
          return val;
         }
        arraySort(names);
        const entries=  arrayMap(names, (name)=>[name, val[name]]);
        return fromEntries(entries);
       }
      case 'function': {
        return  `[Function ${val.name|| '<anon>' }]`;
       }
      case 'string': {
        if( stringStartsWith(val, '[')) {
          return  `[${val}]`;
         }
        return val;
       }
      case 'undefined':
      case 'symbol': {
        return  `[${String(val)}]`;
       }
      case 'bigint': {
        return  `[${val}n]`;
       }
      case 'number': {
        if( is(val, NaN)) {
          return '[NaN]';
         }else if( val===  Infinity) {
          return '[Infinity]';
         }else if( val===  -Infinity) {
          return '[-Infinity]';
         }
        return val;
       }
      default: {
        return val;
       }}

   };
  try {
    return stringifyJson(payload, replacer, spaces);
   }catch( _err) {
    // Don't do anything more fancy here if there is any
    // chance that might throw, unless you surround that
    // with another try-catch-recovery. For example,
    // the caught thing might be a proxy or other exotic
    // object rather than an error. The proxy might throw
    // whenever it is possible for it to.
    return '[Something that failed to stringify]';
   }
 };$h‍_once.bestEffortStringify(bestEffortStringify);
freeze(bestEffortStringify);
})
,
// === functors[5] ===
(({   imports: $h‍_imports,   liveVar: $h‍_live,   onceVar: $h‍_once,   importMeta: $h‍____meta,  }) => {   $h‍_imports([]);   // @ts-check

/**
 * @callback BaseAssert
 * The `assert` function itself.
 *
 * @param {*} flag The truthy/falsy value
 * @param {Details=} optDetails The details to throw
 * @param {ErrorConstructor=} ErrorConstructor An optional alternate error
 * constructor to use.
 * @returns {asserts flag}
 */

/**
 * @typedef {object} AssertMakeErrorOptions
 * @property {string=} errorName
 */

/**
 * @callback AssertMakeError
 *
 * The `assert.error` method, recording details for the console.
 *
 * The optional `optDetails` can be a string.
 * @param {Details=} optDetails The details of what was asserted
 * @param {ErrorConstructor=} ErrorConstructor An optional alternate error
 * constructor to use.
 * @param {AssertMakeErrorOptions=} options
 * @returns {Error}
 */

/**
 * @callback AssertFail
 *
 * The `assert.fail` method.
 *
 * Fail an assertion, recording full details to the console and
 * raising an exception with a message in which `details` substitution values
 * have been redacted.
 *
 * The optional `optDetails` can be a string for backwards compatibility
 * with the nodejs assertion library.
 * @param {Details=} optDetails The details of what was asserted
 * @param {ErrorConstructor=} ErrorConstructor An optional alternate error
 * constructor to use.
 * @returns {never}
 */

/**
 * @callback AssertEqual
 * The `assert.equal` method
 *
 * Assert that two values must be `Object.is`.
 * @param {*} actual The value we received
 * @param {*} expected What we wanted
 * @param {Details=} optDetails The details to throw
 * @param {ErrorConstructor=} ErrorConstructor An optional alternate error
 * constructor to use.
 * @returns {void}
 */

// Type all the overloads of the assertTypeof function.
// There may eventually be a better way to do this, but
// thems the breaks with Typescript 4.0.
/**
 * @callback AssertTypeofBigint
 * @param {any} specimen
 * @param {'bigint'} typename
 * @param {Details=} optDetails
 * @returns {asserts specimen is bigint}
 */

/**
 * @callback AssertTypeofBoolean
 * @param {any} specimen
 * @param {'boolean'} typename
 * @param {Details=} optDetails
 * @returns {asserts specimen is boolean}
 */

/**
 * @callback AssertTypeofFunction
 * @param {any} specimen
 * @param {'function'} typename
 * @param {Details=} optDetails
 * @returns {asserts specimen is Function}
 */

/**
 * @callback AssertTypeofNumber
 * @param {any} specimen
 * @param {'number'} typename
 * @param {Details=} optDetails
 * @returns {asserts specimen is number}
 */

/**
 * @callback AssertTypeofObject
 * @param {any} specimen
 * @param {'object'} typename
 * @param {Details=} optDetails
 * @returns {asserts specimen is Record<any, any> | null}
 */

/**
 * @callback AssertTypeofString
 * @param {any} specimen
 * @param {'string'} typename
 * @param {Details=} optDetails
 * @returns {asserts specimen is string}
 */

/**
 * @callback AssertTypeofSymbol
 * @param {any} specimen
 * @param {'symbol'} typename
 * @param {Details=} optDetails
 * @returns {asserts specimen is symbol}
 */

/**
 * @callback AssertTypeofUndefined
 * @param {any} specimen
 * @param {'undefined'} typename
 * @param {Details=} optDetails
 * @returns {asserts specimen is undefined}
 */

/**
 * The `assert.typeof` method
 *
 * @typedef {AssertTypeofBigint & AssertTypeofBoolean & AssertTypeofFunction & AssertTypeofNumber & AssertTypeofObject & AssertTypeofString & AssertTypeofSymbol & AssertTypeofUndefined} AssertTypeof
 */

/**
 * @callback AssertString
 * The `assert.string` method.
 *
 * `assert.string(v)` is equivalent to `assert.typeof(v, 'string')`. We
 * special case this one because it is the most frequently used.
 *
 * Assert an expected typeof result.
 * @param {any} specimen The value to get the typeof
 * @param {Details=} optDetails The details to throw
 * @returns {asserts specimen is string}
 */

/**
 * @callback AssertNote
 * The `assert.note` method.
 *
 * Annotate an error with details, potentially to be used by an
 * augmented console such as the causal console of `console.js`, to
 * provide extra information associated with logged errors.
 *
 * @param {Error} error
 * @param {Details} detailsNote
 * @returns {void}
 */

// /////////////////////////////////////////////////////////////////////////////

/**
 * @typedef {{}} DetailsToken
 * A call to the `details` template literal makes and returns a fresh details
 * token, which is a frozen empty object associated with the arguments of that
 * `details` template literal expression.
 */

/**
 * @typedef {string | DetailsToken} Details
 * Either a plain string, or made by the `details` template literal tag.
 */

/**
 * @typedef {object} StringablePayload
 * Holds the payload passed to quote so that its printed form is visible.
 * @property {() => string} toString How to print the payload
 */

/**
 * To "declassify" and quote a substitution value used in a
 * ``` details`...` ``` template literal, enclose that substitution expression
 * in a call to `quote`. This makes the value appear quoted
 * (as if with `JSON.stringify`) in the message of the thrown error. The
 * payload itself is still passed unquoted to the console as it would be
 * without `quote`.
 *
 * For example, the following will reveal the expected sky color, but not the
 * actual incorrect sky color, in the thrown error's message:
 * ```js
 * sky.color === expectedColor || Fail`${sky.color} should be ${quote(expectedColor)}`;
 * ```
 *
 * // TODO Update SES-shim to new convention, where `details` is
 * // renamed to `X` rather than `d`.
 * The normal convention is to locally rename `details` to `d` and `quote` to `q`
 * like `const { details: d, quote: q } = assert;`, so the above example would then be
 * ```js
 * sky.color === expectedColor || Fail`${sky.color} should be ${q(expectedColor)}`;
 * ```
 *
 * @callback AssertQuote
 * @param {*} payload What to declassify
 * @param {(string|number)=} spaces
 * @returns {StringablePayload} The declassified payload
 */

/**
 * @callback Raise
 *
 * To make an `assert` which terminates some larger unit of computation
 * like a transaction, vat, or process, call `makeAssert` with a `Raise`
 * callback, where that callback actually performs that larger termination.
 * If possible, the callback should also report its `reason` parameter as
 * the alleged reason for the termination.
 *
 * @param {Error} reason
 */

/**
 * @callback MakeAssert
 *
 * Makes and returns an `assert` function object that shares the bookkeeping
 * state defined by this module with other `assert` function objects made by
 * `makeAssert`. This state is per-module-instance and is exposed by the
 * `loggedErrorHandler` above. We refer to `assert` as a "function object"
 * because it can be called directly as a function, but also has methods that
 * can be called.
 *
 * If `optRaise` is provided, the returned `assert` function object will call
 * `optRaise(reason)` before throwing the error. This enables `optRaise` to
 * engage in even more violent termination behavior, like terminating the vat,
 * that prevents execution from reaching the following throw. However, if
 * `optRaise` returns normally, which would be unusual, the throw following
 * `optRaise(reason)` would still happen.
 *
 * @param {Raise=} optRaise
 * @param {boolean=} unredacted
 * @returns {Assert}
 */

/**
 * @typedef {(template: TemplateStringsArray | string[], ...args: any) => DetailsToken} DetailsTag
 *
 * Use the `details` function as a template literal tag to create
 * informative error messages. The assertion functions take such messages
 * as optional arguments:
 * ```js
 * assert(sky.isBlue(), details`${sky.color} should be "blue"`);
 * ```
 * // TODO Update SES-shim to new convention, where `details` is
 * // renamed to `X` rather than `d`.
 * or following the normal convention to locally rename `details` to `d`
 * and `quote` to `q` like `const { details: d, quote: q } = assert;`:
 * ```js
 * assert(sky.isBlue(), d`${sky.color} should be "blue"`);
 * ```
 * However, note that in most cases it is preferable to instead use the `Fail`
 * template literal tag (which has the same input signature as `details`
 * but automatically creates and throws an error):
 * ```js
 * sky.isBlue() || Fail`${sky.color} should be "blue"`;
 * ```
 *
 * The details template tag returns a `DetailsToken` object that can print
 * itself with the formatted message in two ways.
 * It will report full details to the console, but
 * mask embedded substitution values with their typeof information in the thrown error
 * to prevent revealing secrets up the exceptional path. In the example
 * above, the thrown error may reveal only that `sky.color` is a string,
 * whereas the same diagnostic printed to the console reveals that the
 * sky was green. This masking can be disabled for an individual substitution value
 * using `quote`.
 *
 * The `raw` property of an input template array is ignored, so a simple
 * array of strings may be provided directly.
 */

/**
 * @typedef {(template: TemplateStringsArray | string[], ...args: any) => never} FailTag
 *
 * Use the `Fail` function as a template literal tag to efficiently
 * create and throw a `details`-style error only when a condition is not satisfied.
 * ```js
 * condition || Fail`...complaint...`;
 * ```
 * This avoids the overhead of creating usually-unnecessary errors like
 * ```js
 * assert(condition, details`...complaint...`);
 * ```
 * while improving readability over alternatives like
 * ```js
 * condition || assert.fail(details`...complaint...`);
 * ```
 *
 * However, due to current weakness in TypeScript, static reasoning
 * is less powerful with the `||` patterns than with an `assert` call.
 * Until/unless https://github.com/microsoft/TypeScript/issues/51426 is fixed,
 * for `||`-style assertions where this loss of static reasoning is a problem,
 * instead express the assertion as
 * ```js
 *   if (!condition) {
 *     Fail`...complaint...`;
 *   }
 * ```
 * or, if needed,
 * ```js
 *   if (!condition) {
 *     // `throw` is noop since `Fail` throws, but it improves static analysis
 *     throw Fail`...complaint...`;
 *   }
 * ```
 */

/**
 * assert that expr is truthy, with an optional details to describe
 * the assertion. It is a tagged template literal like
 * ```js
 * assert(expr, details`....`);`
 * ```
 *
 * The literal portions of the template are assumed non-sensitive, as
 * are the `typeof` types of the substitution values. These are
 * assembled into the thrown error message. The actual contents of the
 * substitution values are assumed sensitive, to be revealed to
 * the console only. We assume only the virtual platform's owner can read
 * what is written to the console, where the owner is in a privileged
 * position over computation running on that platform.
 *
 * The optional `optDetails` can be a string for backwards compatibility
 * with the nodejs assertion library.
 *
 * @typedef { BaseAssert & {
 *   typeof: AssertTypeof,
 *   error: AssertMakeError,
 *   fail: AssertFail,
 *   equal: AssertEqual,
 *   string: AssertString,
 *   note: AssertNote,
 *   details: DetailsTag,
 *   Fail: FailTag,
 *   quote: AssertQuote,
 *   bare: AssertQuote,
 *   makeAssert: MakeAssert,
 * } } Assert
 */

// /////////////////////////////////////////////////////////////////////////////

/**
 * @typedef {object} VirtualConsole
 * @property {Console['debug']} debug
 * @property {Console['log']} log
 * @property {Console['info']} info
 * @property {Console['warn']} warn
 * @property {Console['error']} error
 *
 * @property {Console['trace']} trace
 * @property {Console['dirxml']} dirxml
 * @property {Console['group']} group
 * @property {Console['groupCollapsed']} groupCollapsed
 *
 * @property {Console['assert']} assert
 * @property {Console['timeLog']} timeLog
 *
 * @property {Console['clear']} clear
 * @property {Console['count']} count
 * @property {Console['countReset']} countReset
 * @property {Console['dir']} dir
 * @property {Console['groupEnd']} groupEnd
 *
 * @property {Console['table']} table
 * @property {Console['time']} time
 * @property {Console['timeEnd']} timeEnd
 * @property {Console['timeStamp']} timeStamp
 */

/* This is deliberately *not* JSDoc, it is a regular comment.
 *
 * TODO: We'd like to add the following properties to the above
 * VirtualConsole, but they currently cause conflicts where
 * some Typescript implementations don't have these properties
 * on the Console type.
 *
 * @property {Console['profile']} profile
 * @property {Console['profileEnd']} profileEnd
 */

/**
 * @typedef {'debug' | 'log' | 'info' | 'warn' | 'error'} LogSeverity
 */

/**
 * @typedef ConsoleFilter
 * @property {(severity: LogSeverity) => boolean} canLog
 */

/**
 * @callback FilterConsole
 * @param {VirtualConsole} baseConsole
 * @param {ConsoleFilter} filter
 * @param {string=} topic
 * @returns {VirtualConsole}
 */
})
,
// === functors[6] ===
(({   imports: $h‍_imports,   liveVar: $h‍_live,   onceVar: $h‍_once,   importMeta: $h‍____meta,  }) => {   $h‍_imports([]);   // @ts-check

/**
 * @typedef {readonly any[]} LogArgs
 *
 * This is an array suitable to be used as arguments of a console
 * level message *after* the format string argument. It is the result of
 * a `details` template string and consists of alternating literal strings
 * and substitution values, starting with a literal string. At least that
 * first literal string is always present.
 */

/**
 * @callback NoteCallback
 *
 * @param {Error} error
 * @param {LogArgs} noteLogArgs
 * @returns {void}
 */

/**
 * @callback GetStackString
 * @param {Error} error
 * @returns {string=}
 */

/**
 * @typedef {object} LoggedErrorHandler
 *
 * Used to parameterize `makeCausalConsole` to give it access to potentially
 * hidden information to augment the logging of errors.
 *
 * @property {GetStackString} getStackString
 * @property {(error: Error) => string} tagError
 * @property {() => void} resetErrorTagNum for debugging purposes only
 * @property {(error: Error) => (LogArgs | undefined)} getMessageLogArgs
 * @property {(error: Error) => (LogArgs | undefined)} takeMessageLogArgs
 * @property {(error: Error, callback?: NoteCallback) => LogArgs[] } takeNoteLogArgsArray
 */

// /////////////////////////////////////////////////////////////////////////////

/**
 * @typedef {readonly [string, ...any[]]} LogRecord
 */

/**
 * @typedef {object} LoggingConsoleKit
 * @property {VirtualConsole} loggingConsole
 * @property {() => readonly LogRecord[]} takeLog
 */

/**
 * @typedef {object} MakeLoggingConsoleKitOptions
 * @property {boolean=} shouldResetForDebugging
 */

/**
 * @callback MakeLoggingConsoleKit
 *
 * A logging console just accumulates the contents of all whitelisted calls,
 * making them available to callers of `takeLog()`. Calling `takeLog()`
 * consumes these, so later calls to `takeLog()` will only provide a log of
 * calls that have happened since then.
 *
 * @param {LoggedErrorHandler} loggedErrorHandler
 * @param {MakeLoggingConsoleKitOptions=} options
 * @returns {LoggingConsoleKit}
 */

/**
 * @typedef {{ NOTE: 'ERROR_NOTE:', MESSAGE: 'ERROR_MESSAGE:' }} ErrorInfo
 */

/**
 * @typedef {ErrorInfo[keyof ErrorInfo]} ErrorInfoKind
 */

/**
 * @callback MakeCausalConsole
 *
 * Makes a causal console wrapper of a `baseConsole`, where the causal console
 * calls methods of the `loggedErrorHandler` to customize how it handles logged
 * errors.
 *
 * @param {VirtualConsole} baseConsole
 * @param {LoggedErrorHandler} loggedErrorHandler
 * @returns {VirtualConsole}
 */
})
,
// === functors[7] ===
(({   imports: $h‍_imports,   liveVar: $h‍_live,   onceVar: $h‍_once,   importMeta: $h‍____meta,  }) => {   $h‍_imports([["./internal-types.js", []]]);   





const { freeze}=   Object;
const { isSafeInteger}=   Number;

/**
 * @template Data
 * @typedef {object} DoublyLinkedCell
 * A cell of a doubly-linked ring, i.e., a doubly-linked circular list.
 * DoublyLinkedCells are not frozen, and so should be closely encapsulated by
 * any abstraction that uses them.
 * @property {DoublyLinkedCell<Data>} next
 * @property {DoublyLinkedCell<Data>} prev
 * @property {Data} data
 */

/**
 * Makes a new self-linked cell. There are two reasons to do so:
 *    * To make the head sigil of a new initially-empty doubly-linked ring.
 *    * To make a non-sigil cell to be `spliceAfter`ed.
 *
 * @template Data
 * @param {Data} data
 * @returns {DoublyLinkedCell<Data>}
 */
const makeSelfCell=  (data)=>{
  /** @type {Partial<DoublyLinkedCell<Data>>} */
  const incompleteCell=  {
    next: undefined,
    prev: undefined,
    data};

  const selfCell=  /** @type {DoublyLinkedCell<Data>} */  incompleteCell;
  selfCell.next=  selfCell;
  selfCell.prev=  selfCell;
  // Not frozen!
  return selfCell;
 };

/**
 * Splices a self-linked non-sigil cell into a ring after `prev`.
 * `prev` could be the head sigil, or it could be some other non-sigil
 * cell within a ring.
 *
 * @template Data
 * @param {DoublyLinkedCell<Data>} prev
 * @param {DoublyLinkedCell<Data>} selfCell
 */
const spliceAfter=  (prev, selfCell)=>  {
  if( prev===  selfCell) {
    throw TypeError('Cannot splice a cell into itself');
   }
  if( selfCell.next!==  selfCell||  selfCell.prev!==  selfCell) {
    throw TypeError('Expected self-linked cell');
   }
  const cell=  selfCell;
  // rename variable cause it isn't self-linked after this point.

  const next=  prev.next;
  cell.prev=  prev;
  cell.next=  next;
  prev.next=  cell;
  next.prev=  cell;
  // Not frozen!
  return cell;
 };

/**
 * @template Data
 * @param {DoublyLinkedCell<Data>} cell
 * No-op if the cell is self-linked.
 */
const spliceOut=  (cell)=>{
  const { prev, next}=   cell;
  prev.next=  next;
  next.prev=  prev;
  cell.prev=  cell;
  cell.next=  cell;
 };

/**
 * The LRUCacheMap is used within the implementation of `assert` and so
 * at a layer below SES or harden. Thus, we give it a `WeakMap`-like interface
 * rather than a `WeakMapStore`-like interface. To work before `lockdown`,
 * the implementation must use `freeze` manually, but still exhaustively.
 *
 * It implements the WeakMap interface, and holds its keys weakly.  Cached
 * values are only held while the key is held by the user and the key/value
 * bookkeeping cell has not been pushed off the end of the cache by `budget`
 * number of more recently referenced cells.  If the key is dropped by the user,
 * the value will no longer be held by the cache, but the bookkeeping cell
 * itself will stay in memory.
 *
 * @template {{}} K
 * @template {unknown} V
 * @param {number} keysBudget
 * @returns {WeakMap<K,V>}
 */
const        makeLRUCacheMap=  (keysBudget)=>{
  if( !isSafeInteger(keysBudget)||  keysBudget<  0) {
    throw TypeError('keysBudget must be a safe non-negative integer number');
   }
  /** @typedef {DoublyLinkedCell<WeakMap<K, V> | undefined>} LRUCacheCell */
  /** @type {WeakMap<K, LRUCacheCell>} */
  const keyToCell=  new WeakMap();
  let size=  0; // `size` must remain <= `keysBudget`
  // As a sigil, `head` uniquely is not in the `keyToCell` map.
  /** @type {LRUCacheCell} */
  const head=  makeSelfCell(undefined);

  const touchCell=  (key)=>{
    const cell=  keyToCell.get(key);
    if( cell===  undefined||  cell.data===  undefined) {
      // Either the key was GCed, or the cell was condemned.
      return undefined;
     }
    // Becomes most recently used
    spliceOut(cell);
    spliceAfter(head, cell);
    return cell;
   };

  /**
   * @param {K} key
   */
  const has=  (key)=>touchCell(key)!==  undefined;
  freeze(has);

  /**
   * @param {K} key
   */
  // UNTIL https://github.com/endojs/endo/issues/1514
  // Prefer: const get = key => touchCell(key)?.data?.get(key);
  const get=  (key)=>{
    const cell=  touchCell(key);
    return cell&&  cell.data&&  cell.data.get(key);
   };
  freeze(get);

  /**
   * @param {K} key
   * @param {V} value
   */
  const set=  (key, value)=>  {
    if( keysBudget<  1) {
      // eslint-disable-next-line no-use-before-define
      return lruCacheMap; // Implements WeakMap.set
     }

    let cell=  touchCell(key);
    if( cell===  undefined) {
      cell=  makeSelfCell(undefined);
      spliceAfter(head, cell); // start most recently used
     }
    if( !cell.data) {
      // Either a fresh cell or a reused condemned cell.
      size+=  1;
      // Add its data.
      cell.data=  new WeakMap();
      // Advertise the cell for this key.
      keyToCell.set(key, cell);
      while( size>  keysBudget) {
        const condemned=  head.prev;
        spliceOut(condemned); // Drop least recently used
        condemned.data=  undefined;
        size-=  1;
       }
     }

    // Update the data.
    cell.data.set(key, value);

    // eslint-disable-next-line no-use-before-define
    return lruCacheMap; // Implements WeakMap.set
   };
  freeze(set);

  // "delete" is a keyword.
  /**
   * @param {K} key
   */
  const deleteIt=  (key)=>{
    const cell=  keyToCell.get(key);
    if( cell===  undefined) {
      return false;
     }
    spliceOut(cell);
    keyToCell.delete(key);
    if( cell.data===  undefined) {
      // Already condemned.
      return false;
     }

    cell.data=  undefined;
    size-=  1;
    return true;
   };
  freeze(deleteIt);

  const lruCacheMap=  freeze({
    has,
    get,
    set,
    delete: deleteIt,
    [Symbol.toStringTag]: 'LRUCacheMap'});

  return lruCacheMap;
 };$h‍_once.makeLRUCacheMap(makeLRUCacheMap);
freeze(makeLRUCacheMap);

const defaultLoggedErrorsBudget=  1000;
const defaultArgsPerErrorBudget=  100;

/**
 * @param {number} [errorsBudget]
 * @param {number} [argsPerErrorBudget]
 */
const        makeNoteLogArgsArrayKit=  (
  errorsBudget=  defaultLoggedErrorsBudget,
  argsPerErrorBudget=  defaultArgsPerErrorBudget)=>
     {
  if( !isSafeInteger(argsPerErrorBudget)||  argsPerErrorBudget<  1) {
    throw TypeError(
      'argsPerErrorBudget must be a safe positive integer number');

   }

  /**
   * @type {WeakMap<Error, LogArgs[]>}
   *
   * Maps from an error to an array of log args, where each log args is
   * remembered as an annotation on that error. This can be used, for example,
   * to keep track of additional causes of the error. The elements of any
   * log args may include errors which are associated with further annotations.
   * An augmented console, like the causal console of `console.js`, could
   * then retrieve the graph of such annotations.
   */
  const noteLogArgsArrayMap=  makeLRUCacheMap(errorsBudget);

  /**
   * @param {Error} error
   * @param {LogArgs} logArgs
   */
  const addLogArgs=  (error, logArgs)=>  {
    const logArgsArray=  noteLogArgsArrayMap.get(error);
    if( logArgsArray!==  undefined) {
      if( logArgsArray.length>=  argsPerErrorBudget) {
        logArgsArray.shift();
       }
      logArgsArray.push(logArgs);
     }else {
      noteLogArgsArrayMap.set(error, [logArgs]);
     }
   };
  freeze(addLogArgs);

  /**
   * @param {Error} error
   * @returns {LogArgs[] | undefined}
   */
  const takeLogArgsArray=  (error)=>{
    const result=  noteLogArgsArrayMap.get(error);
    noteLogArgsArrayMap.delete(error);
    return result;
   };
  freeze(takeLogArgsArray);

  return freeze({
    addLogArgs,
    takeLogArgsArray});

 };$h‍_once.makeNoteLogArgsArrayKit(makeNoteLogArgsArrayKit);
freeze(makeNoteLogArgsArrayKit);
})
,
// === functors[8] ===
(({   imports: $h‍_imports,   liveVar: $h‍_live,   onceVar: $h‍_once,   importMeta: $h‍____meta,  }) => {   let RangeError,TypeError,WeakMap,arrayJoin,arrayMap,arrayPop,arrayPush,assign,freeze,globalThis,is,isError,regexpTest,stringIndexOf,stringReplace,stringSlice,stringStartsWith,weakmapDelete,weakmapGet,weakmapHas,weakmapSet,an,bestEffortStringify,makeNoteLogArgsArrayKit;$h‍_imports([["../commons.js", [["RangeError", [$h‍_a => (RangeError = $h‍_a)]],["TypeError", [$h‍_a => (TypeError = $h‍_a)]],["WeakMap", [$h‍_a => (WeakMap = $h‍_a)]],["arrayJoin", [$h‍_a => (arrayJoin = $h‍_a)]],["arrayMap", [$h‍_a => (arrayMap = $h‍_a)]],["arrayPop", [$h‍_a => (arrayPop = $h‍_a)]],["arrayPush", [$h‍_a => (arrayPush = $h‍_a)]],["assign", [$h‍_a => (assign = $h‍_a)]],["freeze", [$h‍_a => (freeze = $h‍_a)]],["globalThis", [$h‍_a => (globalThis = $h‍_a)]],["is", [$h‍_a => (is = $h‍_a)]],["isError", [$h‍_a => (isError = $h‍_a)]],["regexpTest", [$h‍_a => (regexpTest = $h‍_a)]],["stringIndexOf", [$h‍_a => (stringIndexOf = $h‍_a)]],["stringReplace", [$h‍_a => (stringReplace = $h‍_a)]],["stringSlice", [$h‍_a => (stringSlice = $h‍_a)]],["stringStartsWith", [$h‍_a => (stringStartsWith = $h‍_a)]],["weakmapDelete", [$h‍_a => (weakmapDelete = $h‍_a)]],["weakmapGet", [$h‍_a => (weakmapGet = $h‍_a)]],["weakmapHas", [$h‍_a => (weakmapHas = $h‍_a)]],["weakmapSet", [$h‍_a => (weakmapSet = $h‍_a)]]]],["./stringify-utils.js", [["an", [$h‍_a => (an = $h‍_a)]],["bestEffortStringify", [$h‍_a => (bestEffortStringify = $h‍_a)]]]],["./types.js", []],["./internal-types.js", []],["./note-log-args.js", [["makeNoteLogArgsArrayKit", [$h‍_a => (makeNoteLogArgsArrayKit = $h‍_a)]]]]]);   








































// For our internal debugging purposes, uncomment
// const internalDebugConsole = console;

// /////////////////////////////////////////////////////////////////////////////

/** @type {WeakMap<StringablePayload, any>} */
const declassifiers=  new WeakMap();

/** @type {AssertQuote} */
const quote=  (payload, spaces=  undefined)=>  {
  const result=  freeze({
    toString: freeze(()=>  bestEffortStringify(payload, spaces))});

  weakmapSet(declassifiers, result, payload);
  return result;
 };
freeze(quote);

const canBeBare=  freeze(/^[\w:-]( ?[\w:-])*$/);

/**
 * Embed a string directly into error details without wrapping punctuation.
 * To avoid injection attacks that exploit quoting confusion, this must NEVER
 * be used with data that is possibly attacker-controlled.
 * As a further safeguard, we fall back to quoting any input that is not a
 * string of sufficiently word-like parts separated by isolated spaces (rather
 * than throwing an exception, which could hide the original problem for which
 * explanatory details are being constructed---i.e., ``` assert.details`...` ```
 * should never be the source of a new exception, nor should an attempt to
 * render its output, although we _could_ instead decide to handle the latter
 * by inline replacement similar to that of `bestEffortStringify` for producing
 * rendered messages like `(an object) was tagged "[Unsafe bare string]"`).
 *
 * @type {AssertQuote}
 */
const bare=  (payload, spaces=  undefined)=>  {
  if( typeof payload!==  'string'||  !regexpTest(canBeBare, payload)) {
    return quote(payload, spaces);
   }
  const result=  freeze({
    toString: freeze(()=>  payload)});

  weakmapSet(declassifiers, result, payload);
  return result;
 };
freeze(bare);

// /////////////////////////////////////////////////////////////////////////////

/**
 * @typedef {object} HiddenDetails
 *
 * Captures the arguments passed to the `details` template string tag.
 *
 * @property {TemplateStringsArray | string[]} template
 * @property {any[]} args
 */

/**
 * @type {WeakMap<DetailsToken, HiddenDetails>}
 *
 * Maps from a details token which a `details` template literal returned
 * to a record of the contents of that template literal expression.
 */
const hiddenDetailsMap=  new WeakMap();

/**
 * @param {HiddenDetails} hiddenDetails
 * @returns {string}
 */
const getMessageString=  ({ template, args})=>   {
  const parts=  [template[0]];
  for( let i=  0; i<  args.length; i+=  1) {
    const arg=  args[i];
    let argStr;
    if( weakmapHas(declassifiers, arg)) {
      argStr=   `${arg}`;
     }else if( isError(arg)) {
      argStr=   `(${an(arg.name)})`;
     }else {
      argStr=   `(${an(typeof arg)})`;
     }
    arrayPush(parts, argStr, template[i+  1]);
   }
  return arrayJoin(parts, '');
 };

/**
 * Give detailsTokens a toString behavior. To minimize the overhead of
 * creating new detailsTokens, we do this with an
 * inherited `this` sensitive `toString` method, even though we normally
 * avoid `this` sensitivity. To protect the method from inappropriate
 * `this` application, it does something interesting only for objects
 * registered in `redactedDetails`, which should be exactly the detailsTokens.
 *
 * The printing behavior must not reveal anything redacted, so we just use
 * the same `getMessageString` we use to construct the redacted message
 * string for a thrown assertion error.
 */
const DetailsTokenProto=  freeze({
  toString() {
    const hiddenDetails=  weakmapGet(hiddenDetailsMap, this);
    if( hiddenDetails===  undefined) {
      return '[Not a DetailsToken]';
     }
    return getMessageString(hiddenDetails);
   }});

freeze(DetailsTokenProto.toString);

/**
 * Normally this is the function exported as `assert.details` and often
 * spelled `d`. However, if the `{errorTaming: 'unsafe'}` option is given to
 * `lockdown`, then `unredactedDetails` is used instead.
 *
 * There are some unconditional uses of `redactedDetails` in this module. All
 * of them should be uses where the template literal has no redacted
 * substitution values. In those cases, the two are equivalent.
 *
 * @type {DetailsTag}
 */
const redactedDetails=  (template, ...args)=>  {
  // Keep in mind that the vast majority of calls to `details` creates
  // a details token that is never used, so this path must remain as fast as
  // possible. Hence we store what we've got with little processing, postponing
  // all the work to happen only if needed, for example, if an assertion fails.
  const detailsToken=  freeze({ __proto__: DetailsTokenProto});
  weakmapSet(hiddenDetailsMap, detailsToken, { template, args});
  return detailsToken;
 };
freeze(redactedDetails);

/**
 * `unredactedDetails` is like `details` except that it does not redact
 * anything. It acts like `details` would act if all substitution values
 * were wrapped with the `quote` function above (the function normally
 * spelled `q`). If the `{errorTaming: 'unsafe'}` option is given to
 * `lockdown`, then the lockdown-shim arranges for the global `assert` to be
 * one whose `details` property is `unredactedDetails`.
 * This setting optimizes the debugging and testing experience at the price
 * of safety. `unredactedDetails` also sacrifices the speed of `details`,
 * which is usually fine in debugging and testing.
 *
 * @type {DetailsTag}
 */
const unredactedDetails=  (template, ...args)=>  {
  args=  arrayMap(args, (arg)=>
    weakmapHas(declassifiers, arg)?  arg:  quote(arg));

  return redactedDetails(template, ...args);
 };$h‍_once.unredactedDetails(unredactedDetails);
freeze(unredactedDetails);


/**
 * @param {HiddenDetails} hiddenDetails
 * @returns {LogArgs}
 */
const getLogArgs=  ({ template, args})=>   {
  const logArgs=  [template[0]];
  for( let i=  0; i<  args.length; i+=  1) {
    let arg=  args[i];
    if( weakmapHas(declassifiers, arg)) {
      arg=  weakmapGet(declassifiers, arg);
     }
    // Remove the extra spaces (since console.error puts them
    // between each cause).
    const priorWithoutSpace=  stringReplace(arrayPop(logArgs)||  '', / $/, '');
    if( priorWithoutSpace!==  '') {
      arrayPush(logArgs, priorWithoutSpace);
     }
    const nextWithoutSpace=  stringReplace(template[i+  1], /^ /, '');
    arrayPush(logArgs, arg, nextWithoutSpace);
   }
  if( logArgs[logArgs.length-  1]===  '') {
    arrayPop(logArgs);
   }
  return logArgs;
 };

/**
 * @type {WeakMap<Error, LogArgs>}
 *
 * Maps from an error object to the log args that are a more informative
 * alternative message for that error. When logging the error, these
 * log args should be preferred to `error.message`.
 */
const hiddenMessageLogArgs=  new WeakMap();

// So each error tag will be unique.
let errorTagNum=  0;

/**
 * @type {WeakMap<Error, string>}
 */
const errorTags=  new WeakMap();

/**
 * @param {Error} err
 * @param {string=} optErrorName
 * @returns {string}
 */
const tagError=  (err, optErrorName=  err.name)=>  {
  let errorTag=  weakmapGet(errorTags, err);
  if( errorTag!==  undefined) {
    return errorTag;
   }
  errorTagNum+=  1;
  errorTag=   `${optErrorName}#${errorTagNum}`;
  weakmapSet(errorTags, err, errorTag);
  return errorTag;
 };

/**
 * @type {AssertMakeError}
 */
const makeError=  (
  optDetails=  redactedDetails `Assert failed`,
  ErrorConstructor=  globalThis.Error,
  { errorName=  undefined}=   {})=>
     {
  if( typeof optDetails===  'string') {
    // If it is a string, use it as the literal part of the template so
    // it doesn't get quoted.
    optDetails=  redactedDetails([optDetails]);
   }
  const hiddenDetails=  weakmapGet(hiddenDetailsMap, optDetails);
  if( hiddenDetails===  undefined) {
    throw TypeError( `unrecognized details ${quote(optDetails)}`);
   }
  const messageString=  getMessageString(hiddenDetails);
  const error=  new ErrorConstructor(messageString);
  weakmapSet(hiddenMessageLogArgs, error, getLogArgs(hiddenDetails));
  if( errorName!==  undefined) {
    tagError(error, errorName);
   }
  // The next line is a particularly fruitful place to put a breakpoint.
  return error;
 };
freeze(makeError);

// /////////////////////////////////////////////////////////////////////////////

const { addLogArgs, takeLogArgsArray}=   makeNoteLogArgsArrayKit();

/**
 * @type {WeakMap<Error, NoteCallback[]>}
 *
 * An augmented console will normally only take the hidden noteArgs array once,
 * when it logs the error being annotated. Once that happens, further
 * annotations of that error should go to the console immediately. We arrange
 * that by accepting a note-callback function from the console as an optional
 * part of that taking operation. Normally there will only be at most one
 * callback per error, but that depends on console behavior which we should not
 * assume. We make this an array of callbacks so multiple registrations
 * are independent.
 */
const hiddenNoteCallbackArrays=  new WeakMap();

/** @type {AssertNote} */
const note=  (error, detailsNote)=>  {
  if( typeof detailsNote===  'string') {
    // If it is a string, use it as the literal part of the template so
    // it doesn't get quoted.
    detailsNote=  redactedDetails([detailsNote]);
   }
  const hiddenDetails=  weakmapGet(hiddenDetailsMap, detailsNote);
  if( hiddenDetails===  undefined) {
    throw TypeError( `unrecognized details ${quote(detailsNote)}`);
   }
  const logArgs=  getLogArgs(hiddenDetails);
  const callbacks=  weakmapGet(hiddenNoteCallbackArrays, error);
  if( callbacks!==  undefined) {
    for( const callback of callbacks) {
      callback(error, logArgs);
     }
   }else {
    addLogArgs(error, logArgs);
   }
 };
freeze(note);

/**
 * The unprivileged form that just uses the de facto `error.stack` property.
 * The start compartment normally has a privileged `globalThis.getStackString`
 * which should be preferred if present.
 *
 * @param {Error} error
 * @returns {string}
 */
const defaultGetStackString=  (error)=>{
  if( !('stack'in  error)) {
    return '';
   }
  const stackString=   `${error.stack}`;
  const pos=  stringIndexOf(stackString, '\n');
  if( stringStartsWith(stackString, ' ')||  pos===  -1) {
    return stackString;
   }
  return stringSlice(stackString, pos+  1); // exclude the initial newline
 };

/** @type {LoggedErrorHandler} */
const loggedErrorHandler=  {
  getStackString: globalThis.getStackString||  defaultGetStackString,
  tagError: (error)=>tagError(error),
  resetErrorTagNum: ()=>  {
    errorTagNum=  0;
   },
  getMessageLogArgs: (error)=>weakmapGet(hiddenMessageLogArgs, error),
  takeMessageLogArgs: (error)=>{
    const result=  weakmapGet(hiddenMessageLogArgs, error);
    weakmapDelete(hiddenMessageLogArgs, error);
    return result;
   },
  takeNoteLogArgsArray: (error, callback)=>  {
    const result=  takeLogArgsArray(error);
    if( callback!==  undefined) {
      const callbacks=  weakmapGet(hiddenNoteCallbackArrays, error);
      if( callbacks) {
        arrayPush(callbacks, callback);
       }else {
        weakmapSet(hiddenNoteCallbackArrays, error, [callback]);
       }
     }
    return result||  [];
   }};$h‍_once.loggedErrorHandler(loggedErrorHandler);

freeze(loggedErrorHandler);


// /////////////////////////////////////////////////////////////////////////////

/**
 * @type {MakeAssert}
 */
const makeAssert=  (optRaise=  undefined, unredacted=  false)=>  {
  const details=  unredacted?  unredactedDetails:  redactedDetails;
  const assertFailedDetails=  details `Check failed`;

  /** @type {AssertFail} */
  const fail=  (
    optDetails=  assertFailedDetails,
    ErrorConstructor=  globalThis.Error)=>
       {
    const reason=  makeError(optDetails, ErrorConstructor);
    if( optRaise!==  undefined) {
      optRaise(reason);
     }
    throw reason;
   };
  freeze(fail);

  /** @type {FailTag} */
  const Fail=  (template, ...args)=>  fail(details(template, ...args));

  // Don't freeze or export `baseAssert` until we add methods.
  // TODO If I change this from a `function` function to an arrow
  // function, I seem to get type errors from TypeScript. Why?
  /** @type {BaseAssert} */
  function baseAssert(
    flag,
    optDetails=  undefined,
    ErrorConstructor=  undefined)
    {
    flag||  fail(optDetails, ErrorConstructor);
   }

  /** @type {AssertEqual} */
  const equal=  (
    actual,
    expected,
    optDetails=  undefined,
    ErrorConstructor=  undefined)=>
       {
    is(actual, expected)||
      fail(
        optDetails||  details `Expected ${actual} is same as ${expected}`,
        ErrorConstructor||  RangeError);

   };
  freeze(equal);

  /** @type {AssertTypeof} */
  const assertTypeof=  (specimen, typename, optDetails)=>  {
    // This will safely fall through if typename is not a string,
    // which is what we want.
    // eslint-disable-next-line valid-typeof
    if( typeof specimen===  typename) {
      return;
     }
    typeof typename===  'string'||  Fail `${quote(typename)} must be a string`;

    if( optDetails===  undefined) {
      // Embed the type phrase without quotes.
      const typeWithDeterminer=  an(typename);
      optDetails=  details `${specimen} must be ${bare(typeWithDeterminer)}`;
     }
    fail(optDetails, TypeError);
   };
  freeze(assertTypeof);

  /** @type {AssertString} */
  const assertString=  (specimen, optDetails=  undefined)=>
    assertTypeof(specimen, 'string', optDetails);

  // Note that "assert === baseAssert"
  /** @type {Assert} */
  const assert=  assign(baseAssert, {
    error: makeError,
    fail,
    equal,
    typeof: assertTypeof,
    string: assertString,
    note,
    details,
    Fail,
    quote,
    bare,
    makeAssert});

  return freeze(assert);
 };$h‍_once.makeAssert(makeAssert);
freeze(makeAssert);


/** @type {Assert} */
const assert=  makeAssert();$h‍_once.assert(assert);
})
,
// === functors[9] ===
(({   imports: $h‍_imports,   liveVar: $h‍_live,   onceVar: $h‍_once,   importMeta: $h‍____meta,  }) => {   let Set,String,TypeError,WeakMap,WeakSet,globalThis,apply,arrayForEach,defineProperty,freeze,getOwnPropertyDescriptor,getOwnPropertyDescriptors,getPrototypeOf,isInteger,isObject,objectHasOwnProperty,ownKeys,preventExtensions,setAdd,setForEach,setHas,toStringTagSymbol,typedArrayPrototype,weakmapGet,weakmapSet,weaksetAdd,weaksetHas,assert;$h‍_imports([["./commons.js", [["Set", [$h‍_a => (Set = $h‍_a)]],["String", [$h‍_a => (String = $h‍_a)]],["TypeError", [$h‍_a => (TypeError = $h‍_a)]],["WeakMap", [$h‍_a => (WeakMap = $h‍_a)]],["WeakSet", [$h‍_a => (WeakSet = $h‍_a)]],["globalThis", [$h‍_a => (globalThis = $h‍_a)]],["apply", [$h‍_a => (apply = $h‍_a)]],["arrayForEach", [$h‍_a => (arrayForEach = $h‍_a)]],["defineProperty", [$h‍_a => (defineProperty = $h‍_a)]],["freeze", [$h‍_a => (freeze = $h‍_a)]],["getOwnPropertyDescriptor", [$h‍_a => (getOwnPropertyDescriptor = $h‍_a)]],["getOwnPropertyDescriptors", [$h‍_a => (getOwnPropertyDescriptors = $h‍_a)]],["getPrototypeOf", [$h‍_a => (getPrototypeOf = $h‍_a)]],["isInteger", [$h‍_a => (isInteger = $h‍_a)]],["isObject", [$h‍_a => (isObject = $h‍_a)]],["objectHasOwnProperty", [$h‍_a => (objectHasOwnProperty = $h‍_a)]],["ownKeys", [$h‍_a => (ownKeys = $h‍_a)]],["preventExtensions", [$h‍_a => (preventExtensions = $h‍_a)]],["setAdd", [$h‍_a => (setAdd = $h‍_a)]],["setForEach", [$h‍_a => (setForEach = $h‍_a)]],["setHas", [$h‍_a => (setHas = $h‍_a)]],["toStringTagSymbol", [$h‍_a => (toStringTagSymbol = $h‍_a)]],["typedArrayPrototype", [$h‍_a => (typedArrayPrototype = $h‍_a)]],["weakmapGet", [$h‍_a => (weakmapGet = $h‍_a)]],["weakmapSet", [$h‍_a => (weakmapSet = $h‍_a)]],["weaksetAdd", [$h‍_a => (weaksetAdd = $h‍_a)]],["weaksetHas", [$h‍_a => (weaksetHas = $h‍_a)]]]],["./error/assert.js", [["assert", [$h‍_a => (assert = $h‍_a)]]]]]);   





















































/**
 * @typedef {import('../types.js').Harden} Harden
 */

// Obtain the string tag accessor of of TypedArray so we can indirectly use the
// TypedArray brand check it employs.
const typedArrayToStringTag=  getOwnPropertyDescriptor(
  typedArrayPrototype,
  toStringTagSymbol);

assert(typedArrayToStringTag);
const getTypedArrayToStringTag=  typedArrayToStringTag.get;
assert(getTypedArrayToStringTag);

// Exported for tests.
/**
 * Duplicates packages/marshal/src/helpers/passStyle-helpers.js to avoid a dependency.
 *
 * @param {unknown} object
 */
const        isTypedArray=  (object)=>{
  // The object must pass a brand check or toStringTag will return undefined.
  const tag=  apply(getTypedArrayToStringTag, object, []);
  return tag!==  undefined;
 };

/**
 * Tests if a property key is an integer-valued canonical numeric index.
 * https://tc39.es/ecma262/#sec-canonicalnumericindexstring
 *
 * @param {string | symbol} propertyKey
 */$h‍_once.isTypedArray(isTypedArray);
const isCanonicalIntegerIndexString=  (propertyKey)=>{
  const n=  +String(propertyKey);
  return isInteger(n)&&  String(n)===  propertyKey;
 };

/**
 * @template T
 * @param {ArrayLike<T>} array
 */
const freezeTypedArray=  (array)=>{
  preventExtensions(array);

  // Downgrade writable expandos to readonly, even if non-configurable.
  // We get each descriptor individually rather than using
  // getOwnPropertyDescriptors in order to fail safe when encountering
  // an obscure GraalJS issue where getOwnPropertyDescriptor returns
  // undefined for a property that does exist.
  arrayForEach(ownKeys(array), (/** @type {string | symbol} */ name)=>  {
    const desc=  getOwnPropertyDescriptor(array, name);
    assert(desc);
    // TypedArrays are integer-indexed exotic objects, which define special
    // treatment for property names in canonical numeric form:
    // integers in range are permanently writable and non-configurable.
    // https://tc39.es/ecma262/#sec-integer-indexed-exotic-objects
    //
    // This is analogous to the data of a hardened Map or Set,
    // so we carve out this exceptional behavior but make all other
    // properties non-configurable.
    if( !isCanonicalIntegerIndexString(name)) {
      defineProperty(array, name, {
        ...desc,
        writable: false,
        configurable: false});

     }
   });
 };

/**
 * Create a `harden` function.
 *
 * @returns {Harden}
 */
const        makeHardener=  ()=>  {
  // Use a native hardener if possible.
  if( typeof globalThis.harden===  'function') {
    const safeHarden=  globalThis.harden;
    return safeHarden;
   }

  const hardened=  new WeakSet();

  const { harden}=   {
    /**
     * @template T
     * @param {T} root
     * @returns {T}
     */
    harden(root) {
      const toFreeze=  new Set();
      const paths=  new WeakMap();

      // If val is something we should be freezing but aren't yet,
      // add it to toFreeze.
      /**
       * @param {any} val
       * @param {string} [path]
       */
      function enqueue(val, path=  undefined) {
        if( !isObject(val)) {
          // ignore primitives
          return;
         }
        const type=  typeof val;
        if( type!==  'object'&&  type!==  'function') {
          // future proof: break until someone figures out what it should do
          throw TypeError( `Unexpected typeof: ${type}`);
         }
        if( weaksetHas(hardened, val)||  setHas(toFreeze, val)) {
          // Ignore if this is an exit, or we've already visited it
          return;
         }
        // console.warn(`adding ${val} to toFreeze`, val);
        setAdd(toFreeze, val);
        weakmapSet(paths, val, path);
       }

      /**
       * @param {any} obj
       */
      function freezeAndTraverse(obj) {
        // Now freeze the object to ensure reactive
        // objects such as proxies won't add properties
        // during traversal, before they get frozen.

        // Object are verified before being enqueued,
        // therefore this is a valid candidate.
        // Throws if this fails (strict mode).
        // Also throws if the object is an ArrayBuffer or any TypedArray.
        if( isTypedArray(obj)) {
          freezeTypedArray(obj);
         }else {
          freeze(obj);
         }

        // we rely upon certain commitments of Object.freeze and proxies here

        // get stable/immutable outbound links before a Proxy has a chance to do
        // something sneaky.
        const path=  weakmapGet(paths, obj)||  'unknown';
        const descs=  getOwnPropertyDescriptors(obj);
        const proto=  getPrototypeOf(obj);
        enqueue(proto,  `${path}.__proto__`);

        arrayForEach(ownKeys(descs), (/** @type {string | symbol} */ name)=>  {
          const pathname=   `${path}.${String(name)}`;
          // The 'name' may be a symbol, and TypeScript doesn't like us to
          // index arbitrary symbols on objects, so we pretend they're just
          // strings.
          const desc=  descs[/** @type {string} */  name];
          // getOwnPropertyDescriptors is guaranteed to return well-formed
          // descriptors, but they still inherit from Object.prototype. If
          // someone has poisoned Object.prototype to add 'value' or 'get'
          // properties, then a simple 'if ("value" in desc)' or 'desc.value'
          // test could be confused. We use hasOwnProperty to be sure about
          // whether 'value' is present or not, which tells us for sure that
          // this is a data property.
          if( objectHasOwnProperty(desc, 'value')) {
            enqueue(desc.value,  `${pathname}`);
           }else {
            enqueue(desc.get,  `${pathname}(get)`);
            enqueue(desc.set,  `${pathname}(set)`);
           }
         });
       }

      function dequeue() {
        // New values added before forEach() has finished will be visited.
        setForEach(toFreeze, freezeAndTraverse);
       }

      /** @param {any} value */
      function markHardened(value) {
        weaksetAdd(hardened, value);
       }

      function commit() {
        setForEach(toFreeze, markHardened);
       }

      enqueue(root);
      dequeue();
      // console.warn("toFreeze set:", toFreeze);
      commit();

      return root;
     }};


  return harden;
 };$h‍_once.makeHardener(makeHardener);
})
,
// === functors[10] ===
(({   imports: $h‍_imports,   liveVar: $h‍_live,   onceVar: $h‍_once,   importMeta: $h‍____meta,  }) => {   $h‍_imports([]);   /* eslint-disable no-restricted-globals */
/**
 * @file Exports {@code whitelist}, a recursively defined
 * JSON record enumerating all intrinsics and their properties
 * according to ECMA specs.
 *
 * @author JF Paradis
 * @author Mark S. Miller
 */

/* eslint max-lines: 0 */

/**
 * constantProperties
 * non-configurable, non-writable data properties of all global objects.
 * Must be powerless.
 * Maps from property name to the actual value
 */
const        constantProperties=  {
  // *** Value Properties of the Global Object

  Infinity,
  NaN,
  undefined};


/**
 * universalPropertyNames
 * Properties of all global objects.
 * Must be powerless.
 * Maps from property name to the intrinsic name in the whitelist.
 */$h‍_once.constantProperties(constantProperties);
const        universalPropertyNames=  {
  // *** Function Properties of the Global Object

  isFinite: 'isFinite',
  isNaN: 'isNaN',
  parseFloat: 'parseFloat',
  parseInt: 'parseInt',

  decodeURI: 'decodeURI',
  decodeURIComponent: 'decodeURIComponent',
  encodeURI: 'encodeURI',
  encodeURIComponent: 'encodeURIComponent',

  // *** Constructor Properties of the Global Object

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
  SyntaxError: 'SyntaxError',
  TypeError: 'TypeError',
  Uint8Array: 'Uint8Array',
  Uint8ClampedArray: 'Uint8ClampedArray',
  Uint16Array: 'Uint16Array',
  Uint32Array: 'Uint32Array',
  URIError: 'URIError',
  WeakMap: 'WeakMap',
  WeakSet: 'WeakSet',
  // https://github.com/tc39/proposal-iterator-helpers
  Iterator: 'Iterator',
  // https://github.com/tc39/proposal-async-iterator-helpers
  AsyncIterator: 'AsyncIterator',

  // *** Other Properties of the Global Object

  JSON: 'JSON',
  Reflect: 'Reflect',

  // *** Annex B

  escape: 'escape',
  unescape: 'unescape',

  // ESNext

  lockdown: 'lockdown',
  harden: 'harden',
  HandledPromise: 'HandledPromise'  // TODO: Until Promise.delegate (see below).
};

/**
 * initialGlobalPropertyNames
 * Those found only on the initial global, i.e., the global of the
 * start compartment, as well as any compartments created before lockdown.
 * These may provide much of the power provided by the original.
 * Maps from property name to the intrinsic name in the whitelist.
 */$h‍_once.universalPropertyNames(universalPropertyNames);
const        initialGlobalPropertyNames=  {
  // *** Constructor Properties of the Global Object

  Date: '%InitialDate%',
  Error: '%InitialError%',
  RegExp: '%InitialRegExp%',

  // Omit `Symbol`, because we want the original to appear on the
  // start compartment without passing through the whitelist mechanism, since
  // we want to preserve all its properties, even if we never heard of them.
  // Symbol: '%InitialSymbol%',

  // *** Other Properties of the Global Object

  Math: '%InitialMath%',

  // ESNext

  // From Error-stack proposal
  // Only on initial global. No corresponding
  // powerless form for other globals.
  getStackString: '%InitialGetStackString%'

  // TODO https://github.com/Agoric/SES-shim/issues/551
  // Need initial WeakRef and FinalizationGroup in
  // start compartment only.
};

/**
 * sharedGlobalPropertyNames
 * Those found only on the globals of new compartments created after lockdown,
 * which must therefore be powerless.
 * Maps from property name to the intrinsic name in the whitelist.
 */$h‍_once.initialGlobalPropertyNames(initialGlobalPropertyNames);
const        sharedGlobalPropertyNames=  {
  // *** Constructor Properties of the Global Object

  Date: '%SharedDate%',
  Error: '%SharedError%',
  RegExp: '%SharedRegExp%',
  Symbol: '%SharedSymbol%',

  // *** Other Properties of the Global Object

  Math: '%SharedMath%'};


/**
 * uniqueGlobalPropertyNames
 * Those made separately for each global, including the initial global
 * of the start compartment.
 * Maps from property name to the intrinsic name in the whitelist
 * (which is currently always the same).
 */$h‍_once.sharedGlobalPropertyNames(sharedGlobalPropertyNames);
const        uniqueGlobalPropertyNames=  {
  // *** Value Properties of the Global Object

  globalThis: '%UniqueGlobalThis%',

  // *** Function Properties of the Global Object

  eval: '%UniqueEval%',

  // *** Constructor Properties of the Global Object

  Function: '%UniqueFunction%',

  // *** Other Properties of the Global Object

  // ESNext

  Compartment: '%UniqueCompartment%'
  // According to current agreements, eventually the Realm constructor too.
  // 'Realm',
};

// All the "subclasses" of Error. These are collectively represented in the
// ECMAScript spec by the meta variable NativeError.
// TODO Add AggregateError https://github.com/Agoric/SES-shim/issues/550
$h‍_once.uniqueGlobalPropertyNames(uniqueGlobalPropertyNames);const NativeErrors=[
  EvalError,
  RangeError,
  ReferenceError,
  SyntaxError,
  TypeError,
  URIError];


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
 * <li>Symbol properties are listed as follow:
 *     <li>Well-known symbols use the "@@name" form.
 *     <li>Registered symbols use the "RegisteredSymbol(key)" form.
 *     <li>Unique symbols use the "UniqueSymbol(description)" form.
 */

// Function Instances
$h‍_once.NativeErrors(NativeErrors);const FunctionInstance={
  '[[Proto]]': '%FunctionPrototype%',
  length: 'number',
  name: 'string'
  // Do not specify "prototype" here, since only Function instances that can
  // be used as a constructor have a prototype property. For constructors,
  // since prototype properties are instance-specific, we define it there.
};

// AsyncFunction Instances
$h‍_once.FunctionInstance(FunctionInstance);const AsyncFunctionInstance={
  // This property is not mentioned in ECMA 262, but is present in V8 and
  // necessary for lockdown to succeed.
  '[[Proto]]': '%AsyncFunctionPrototype%'};


// Aliases
$h‍_once.AsyncFunctionInstance(AsyncFunctionInstance);const fn=FunctionInstance;
const asyncFn=  AsyncFunctionInstance;

const getter=  {
  get: fn,
  set: 'undefined'};


// Possible but not encountered in the specs
// export const setter = {
//   get: 'undefined',
//   set: fn,
// };

const accessor=  {
  get: fn,
  set: fn};


const        isAccessorPermit=  (permit)=>{
  return permit===  getter||  permit===  accessor;
 };

// NativeError Object Structure
$h‍_once.isAccessorPermit(isAccessorPermit);function NativeError(prototype){
  return {
    // Properties of the NativeError Constructors
    '[[Proto]]': '%SharedError%',

    // NativeError.prototype
    prototype};

 }

function NativeErrorPrototype(constructor) {
  return {
    // Properties of the NativeError Prototype Objects
    '[[Proto]]': '%ErrorPrototype%',
    constructor,
    message: 'string',
    name: 'string',
    // Redundantly present only on v8. Safe to remove.
    toString: false,
    // Superfluously present in some versions of V8.
    // https://github.com/tc39/notes/blob/master/meetings/2021-10/oct-26.md#:~:text=However%2C%20Chrome%2093,and%20node%2016.11.
    cause: false};

 }

// The TypedArray Constructors
function TypedArray(prototype) {
  return {
    // Properties of the TypedArray Constructors
    '[[Proto]]': '%TypedArray%',
    BYTES_PER_ELEMENT: 'number',
    prototype};

 }

function TypedArrayPrototype(constructor) {
  return {
    // Properties of the TypedArray Prototype Objects
    '[[Proto]]': '%TypedArrayPrototype%',
    BYTES_PER_ELEMENT: 'number',
    constructor};

 }

// Without Math.random
const CommonMath=  {
  E: 'number',
  LN10: 'number',
  LN2: 'number',
  LOG10E: 'number',
  LOG2E: 'number',
  PI: 'number',
  SQRT1_2: 'number',
  SQRT2: 'number',
  '@@toStringTag': 'string',
  abs: fn,
  acos: fn,
  acosh: fn,
  asin: fn,
  asinh: fn,
  atan: fn,
  atanh: fn,
  atan2: fn,
  cbrt: fn,
  ceil: fn,
  clz32: fn,
  cos: fn,
  cosh: fn,
  exp: fn,
  expm1: fn,
  floor: fn,
  fround: fn,
  hypot: fn,
  imul: fn,
  log: fn,
  log1p: fn,
  log10: fn,
  log2: fn,
  max: fn,
  min: fn,
  pow: fn,
  round: fn,
  sign: fn,
  sin: fn,
  sinh: fn,
  sqrt: fn,
  tan: fn,
  tanh: fn,
  trunc: fn,
  // See https://github.com/Moddable-OpenSource/moddable/issues/523
  idiv: false,
  // See https://github.com/Moddable-OpenSource/moddable/issues/523
  idivmod: false,
  // See https://github.com/Moddable-OpenSource/moddable/issues/523
  imod: false,
  // See https://github.com/Moddable-OpenSource/moddable/issues/523
  imuldiv: false,
  // See https://github.com/Moddable-OpenSource/moddable/issues/523
  irem: false,
  // See https://github.com/Moddable-OpenSource/moddable/issues/523
  mod: false};


const        permitted=  {
  // ECMA https://tc39.es/ecma262

  // The intrinsics object has no prototype to avoid conflicts.
  '[[Proto]]': null,

  // %ThrowTypeError%
  '%ThrowTypeError%': fn,

  // *** The Global Object

  // *** Value Properties of the Global Object
  Infinity: 'number',
  NaN: 'number',
  undefined: 'undefined',

  // *** Function Properties of the Global Object

  // eval
  '%UniqueEval%': fn,
  isFinite: fn,
  isNaN: fn,
  parseFloat: fn,
  parseInt: fn,
  decodeURI: fn,
  decodeURIComponent: fn,
  encodeURI: fn,
  encodeURIComponent: fn,

  // *** Fundamental Objects

  Object: {
    // Properties of the Object Constructor
    '[[Proto]]': '%FunctionPrototype%',
    assign: fn,
    create: fn,
    defineProperties: fn,
    defineProperty: fn,
    entries: fn,
    freeze: fn,
    fromEntries: fn,
    getOwnPropertyDescriptor: fn,
    getOwnPropertyDescriptors: fn,
    getOwnPropertyNames: fn,
    getOwnPropertySymbols: fn,
    getPrototypeOf: fn,
    hasOwn: fn,
    is: fn,
    isExtensible: fn,
    isFrozen: fn,
    isSealed: fn,
    keys: fn,
    preventExtensions: fn,
    prototype: '%ObjectPrototype%',
    seal: fn,
    setPrototypeOf: fn,
    values: fn,
    // https://github.com/tc39/proposal-array-grouping
    groupBy: fn},


  '%ObjectPrototype%': {
    // Properties of the Object Prototype Object
    '[[Proto]]': null,
    constructor: 'Object',
    hasOwnProperty: fn,
    isPrototypeOf: fn,
    propertyIsEnumerable: fn,
    toLocaleString: fn,
    toString: fn,
    valueOf: fn,

    // Annex B: Additional Properties of the Object.prototype Object

    // See note in header about the difference between [[Proto]] and --proto--
    // special notations.
    '--proto--': accessor,
    __defineGetter__: fn,
    __defineSetter__: fn,
    __lookupGetter__: fn,
    __lookupSetter__: fn},


  '%UniqueFunction%': {
    // Properties of the Function Constructor
    '[[Proto]]': '%FunctionPrototype%',
    prototype: '%FunctionPrototype%'},


  '%InertFunction%': {
    '[[Proto]]': '%FunctionPrototype%',
    prototype: '%FunctionPrototype%'},


  '%FunctionPrototype%': {
    apply: fn,
    bind: fn,
    call: fn,
    constructor: '%InertFunction%',
    toString: fn,
    '@@hasInstance': fn,
    // proposed but not yet std. To be removed if there
    caller: false,
    // proposed but not yet std. To be removed if there
    arguments: false},


  Boolean: {
    // Properties of the Boolean Constructor
    '[[Proto]]': '%FunctionPrototype%',
    prototype: '%BooleanPrototype%'},


  '%BooleanPrototype%': {
    constructor: 'Boolean',
    toString: fn,
    valueOf: fn},


  '%SharedSymbol%': {
    // Properties of the Symbol Constructor
    '[[Proto]]': '%FunctionPrototype%',
    asyncDispose: 'symbol',
    asyncIterator: 'symbol',
    dispose: 'symbol',
    for: fn,
    hasInstance: 'symbol',
    isConcatSpreadable: 'symbol',
    iterator: 'symbol',
    keyFor: fn,
    match: 'symbol',
    matchAll: 'symbol',
    prototype: '%SymbolPrototype%',
    replace: 'symbol',
    search: 'symbol',
    species: 'symbol',
    split: 'symbol',
    toPrimitive: 'symbol',
    toStringTag: 'symbol',
    unscopables: 'symbol',
    // Seen at core-js https://github.com/zloirock/core-js#ecmascript-symbol
    useSimple: false,
    // Seen at core-js https://github.com/zloirock/core-js#ecmascript-symbol
    useSetter: false},


  '%SymbolPrototype%': {
    // Properties of the Symbol Prototype Object
    constructor: '%SharedSymbol%',
    description: getter,
    toString: fn,
    valueOf: fn,
    '@@toPrimitive': fn,
    '@@toStringTag': 'string'},


  '%InitialError%': {
    // Properties of the Error Constructor
    '[[Proto]]': '%FunctionPrototype%',
    prototype: '%ErrorPrototype%',
    // Non standard, v8 only, used by tap
    captureStackTrace: fn,
    // Non standard, v8 only, used by tap, tamed to accessor
    stackTraceLimit: accessor,
    // Non standard, v8 only, used by several, tamed to accessor
    prepareStackTrace: accessor},


  '%SharedError%': {
    // Properties of the Error Constructor
    '[[Proto]]': '%FunctionPrototype%',
    prototype: '%ErrorPrototype%',
    // Non standard, v8 only, used by tap
    captureStackTrace: fn,
    // Non standard, v8 only, used by tap, tamed to accessor
    stackTraceLimit: accessor,
    // Non standard, v8 only, used by several, tamed to accessor
    prepareStackTrace: accessor},


  '%ErrorPrototype%': {
    constructor: '%SharedError%',
    message: 'string',
    name: 'string',
    toString: fn,
    // proposed de-facto, assumed TODO
    // Seen on FF Nightly 88.0a1
    at: false,
    // Seen on FF and XS
    stack: accessor,
    // Superfluously present in some versions of V8.
    // https://github.com/tc39/notes/blob/master/meetings/2021-10/oct-26.md#:~:text=However%2C%20Chrome%2093,and%20node%2016.11.
    cause: false},


  // NativeError

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

  // *** Numbers and Dates

  Number: {
    // Properties of the Number Constructor
    '[[Proto]]': '%FunctionPrototype%',
    EPSILON: 'number',
    isFinite: fn,
    isInteger: fn,
    isNaN: fn,
    isSafeInteger: fn,
    MAX_SAFE_INTEGER: 'number',
    MAX_VALUE: 'number',
    MIN_SAFE_INTEGER: 'number',
    MIN_VALUE: 'number',
    NaN: 'number',
    NEGATIVE_INFINITY: 'number',
    parseFloat: fn,
    parseInt: fn,
    POSITIVE_INFINITY: 'number',
    prototype: '%NumberPrototype%'},


  '%NumberPrototype%': {
    // Properties of the Number Prototype Object
    constructor: 'Number',
    toExponential: fn,
    toFixed: fn,
    toLocaleString: fn,
    toPrecision: fn,
    toString: fn,
    valueOf: fn},


  BigInt: {
    // Properties of the BigInt Constructor
    '[[Proto]]': '%FunctionPrototype%',
    asIntN: fn,
    asUintN: fn,
    prototype: '%BigIntPrototype%',
    // See https://github.com/Moddable-OpenSource/moddable/issues/523
    bitLength: false,
    // See https://github.com/Moddable-OpenSource/moddable/issues/523
    fromArrayBuffer: false},


  '%BigIntPrototype%': {
    constructor: 'BigInt',
    toLocaleString: fn,
    toString: fn,
    valueOf: fn,
    '@@toStringTag': 'string'},


  '%InitialMath%': {
    ...CommonMath,
    // `%InitialMath%.random()` has the standard unsafe behavior
    random: fn},


  '%SharedMath%': {
    ...CommonMath,
    // `%SharedMath%.random()` is tamed to always throw
    random: fn},


  '%InitialDate%': {
    // Properties of the Date Constructor
    '[[Proto]]': '%FunctionPrototype%',
    now: fn,
    parse: fn,
    prototype: '%DatePrototype%',
    UTC: fn},


  '%SharedDate%': {
    // Properties of the Date Constructor
    '[[Proto]]': '%FunctionPrototype%',
    // `%SharedDate%.now()` is tamed to always throw
    now: fn,
    parse: fn,
    prototype: '%DatePrototype%',
    UTC: fn},


  '%DatePrototype%': {
    constructor: '%SharedDate%',
    getDate: fn,
    getDay: fn,
    getFullYear: fn,
    getHours: fn,
    getMilliseconds: fn,
    getMinutes: fn,
    getMonth: fn,
    getSeconds: fn,
    getTime: fn,
    getTimezoneOffset: fn,
    getUTCDate: fn,
    getUTCDay: fn,
    getUTCFullYear: fn,
    getUTCHours: fn,
    getUTCMilliseconds: fn,
    getUTCMinutes: fn,
    getUTCMonth: fn,
    getUTCSeconds: fn,
    setDate: fn,
    setFullYear: fn,
    setHours: fn,
    setMilliseconds: fn,
    setMinutes: fn,
    setMonth: fn,
    setSeconds: fn,
    setTime: fn,
    setUTCDate: fn,
    setUTCFullYear: fn,
    setUTCHours: fn,
    setUTCMilliseconds: fn,
    setUTCMinutes: fn,
    setUTCMonth: fn,
    setUTCSeconds: fn,
    toDateString: fn,
    toISOString: fn,
    toJSON: fn,
    toLocaleDateString: fn,
    toLocaleString: fn,
    toLocaleTimeString: fn,
    toString: fn,
    toTimeString: fn,
    toUTCString: fn,
    valueOf: fn,
    '@@toPrimitive': fn,

    // Annex B: Additional Properties of the Date.prototype Object
    getYear: fn,
    setYear: fn,
    toGMTString: fn},


  // Text Processing

  String: {
    // Properties of the String Constructor
    '[[Proto]]': '%FunctionPrototype%',
    fromCharCode: fn,
    fromCodePoint: fn,
    prototype: '%StringPrototype%',
    raw: fn,
    // See https://github.com/Moddable-OpenSource/moddable/issues/523
    fromArrayBuffer: false},


  '%StringPrototype%': {
    // Properties of the String Prototype Object
    length: 'number',
    at: fn,
    charAt: fn,
    charCodeAt: fn,
    codePointAt: fn,
    concat: fn,
    constructor: 'String',
    endsWith: fn,
    includes: fn,
    indexOf: fn,
    lastIndexOf: fn,
    localeCompare: fn,
    match: fn,
    matchAll: fn,
    normalize: fn,
    padEnd: fn,
    padStart: fn,
    repeat: fn,
    replace: fn,
    replaceAll: fn, // ES2021
    search: fn,
    slice: fn,
    split: fn,
    startsWith: fn,
    substring: fn,
    toLocaleLowerCase: fn,
    toLocaleUpperCase: fn,
    toLowerCase: fn,
    toString: fn,
    toUpperCase: fn,
    trim: fn,
    trimEnd: fn,
    trimStart: fn,
    valueOf: fn,
    '@@iterator': fn,

    // Annex B: Additional Properties of the String.prototype Object
    substr: fn,
    anchor: fn,
    big: fn,
    blink: fn,
    bold: fn,
    fixed: fn,
    fontcolor: fn,
    fontsize: fn,
    italics: fn,
    link: fn,
    small: fn,
    strike: fn,
    sub: fn,
    sup: fn,
    trimLeft: fn,
    trimRight: fn,
    // See https://github.com/Moddable-OpenSource/moddable/issues/523
    compare: false,
    // https://github.com/tc39/proposal-is-usv-string
    isWellFormed: fn,
    toWellFormed: fn,
    unicodeSets: fn},


  '%StringIteratorPrototype%': {
    '[[Proto]]': '%IteratorPrototype%',
    next: fn,
    '@@toStringTag': 'string'},


  '%InitialRegExp%': {
    // Properties of the RegExp Constructor
    '[[Proto]]': '%FunctionPrototype%',
    prototype: '%RegExpPrototype%',
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
    $9: false},


  '%SharedRegExp%': {
    // Properties of the RegExp Constructor
    '[[Proto]]': '%FunctionPrototype%',
    prototype: '%RegExpPrototype%',
    '@@species': getter},


  '%RegExpPrototype%': {
    // Properties of the RegExp Prototype Object
    constructor: '%SharedRegExp%',
    exec: fn,
    dotAll: getter,
    flags: getter,
    global: getter,
    hasIndices: getter,
    ignoreCase: getter,
    '@@match': fn,
    '@@matchAll': fn,
    multiline: getter,
    '@@replace': fn,
    '@@search': fn,
    source: getter,
    '@@split': fn,
    sticky: getter,
    test: fn,
    toString: fn,
    unicode: getter,
    unicodeSets: getter,

    // Annex B: Additional Properties of the RegExp.prototype Object
    compile: false  // UNSAFE and suppressed.
},

  '%RegExpStringIteratorPrototype%': {
    // The %RegExpStringIteratorPrototype% Object
    '[[Proto]]': '%IteratorPrototype%',
    next: fn,
    '@@toStringTag': 'string'},


  // Indexed Collections

  Array: {
    // Properties of the Array Constructor
    '[[Proto]]': '%FunctionPrototype%',
    from: fn,
    isArray: fn,
    of: fn,
    prototype: '%ArrayPrototype%',
    '@@species': getter,

    // Stage 3:
    // https://tc39.es/proposal-relative-indexing-method/
    at: fn,
    // https://tc39.es/proposal-array-from-async/
    fromAsync: fn},


  '%ArrayPrototype%': {
    // Properties of the Array Prototype Object
    at: fn,
    length: 'number',
    concat: fn,
    constructor: 'Array',
    copyWithin: fn,
    entries: fn,
    every: fn,
    fill: fn,
    filter: fn,
    find: fn,
    findIndex: fn,
    flat: fn,
    flatMap: fn,
    forEach: fn,
    includes: fn,
    indexOf: fn,
    join: fn,
    keys: fn,
    lastIndexOf: fn,
    map: fn,
    pop: fn,
    push: fn,
    reduce: fn,
    reduceRight: fn,
    reverse: fn,
    shift: fn,
    slice: fn,
    some: fn,
    sort: fn,
    splice: fn,
    toLocaleString: fn,
    toString: fn,
    unshift: fn,
    values: fn,
    '@@iterator': fn,
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
      // Failed tc39 proposal
      // Seen on FF Nightly 88.0a1
      at: 'boolean',
      // See https://github.com/tc39/proposal-array-find-from-last
      findLast: 'boolean',
      findLastIndex: 'boolean',
      // https://github.com/tc39/proposal-change-array-by-copy
      toReversed: 'boolean',
      toSorted: 'boolean',
      toSpliced: 'boolean',
      with: 'boolean',
      // https://github.com/tc39/proposal-array-grouping
      group: 'boolean',
      groupToMap: 'boolean',
      groupBy: 'boolean'},

    // See https://github.com/tc39/proposal-array-find-from-last
    findLast: fn,
    findLastIndex: fn,
    // https://github.com/tc39/proposal-change-array-by-copy
    toReversed: fn,
    toSorted: fn,
    toSpliced: fn,
    with: fn,
    // https://github.com/tc39/proposal-array-grouping
    group: fn, // Not in proposal? Where?
    groupToMap: fn, // Not in proposal? Where?
    groupBy: fn},


  '%ArrayIteratorPrototype%': {
    // The %ArrayIteratorPrototype% Object
    '[[Proto]]': '%IteratorPrototype%',
    next: fn,
    '@@toStringTag': 'string'},


  // *** TypedArray Objects

  '%TypedArray%': {
    // Properties of the %TypedArray% Intrinsic Object
    '[[Proto]]': '%FunctionPrototype%',
    from: fn,
    of: fn,
    prototype: '%TypedArrayPrototype%',
    '@@species': getter},


  '%TypedArrayPrototype%': {
    at: fn,
    buffer: getter,
    byteLength: getter,
    byteOffset: getter,
    constructor: '%TypedArray%',
    copyWithin: fn,
    entries: fn,
    every: fn,
    fill: fn,
    filter: fn,
    find: fn,
    findIndex: fn,
    forEach: fn,
    includes: fn,
    indexOf: fn,
    join: fn,
    keys: fn,
    lastIndexOf: fn,
    length: getter,
    map: fn,
    reduce: fn,
    reduceRight: fn,
    reverse: fn,
    set: fn,
    slice: fn,
    some: fn,
    sort: fn,
    subarray: fn,
    toLocaleString: fn,
    toString: fn,
    values: fn,
    '@@iterator': fn,
    '@@toStringTag': getter,
    // See https://github.com/tc39/proposal-array-find-from-last
    findLast: fn,
    findLastIndex: fn,
    // https://github.com/tc39/proposal-change-array-by-copy
    toReversed: fn,
    toSorted: fn,
    with: fn},


  // The TypedArray Constructors

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

  // *** Keyed Collections

  Map: {
    // Properties of the Map Constructor
    '[[Proto]]': '%FunctionPrototype%',
    '@@species': getter,
    prototype: '%MapPrototype%',
    // https://github.com/tc39/proposal-array-grouping
    groupBy: fn},


  '%MapPrototype%': {
    clear: fn,
    constructor: 'Map',
    delete: fn,
    entries: fn,
    forEach: fn,
    get: fn,
    has: fn,
    keys: fn,
    set: fn,
    size: getter,
    values: fn,
    '@@iterator': fn,
    '@@toStringTag': 'string'},


  '%MapIteratorPrototype%': {
    // The %MapIteratorPrototype% Object
    '[[Proto]]': '%IteratorPrototype%',
    next: fn,
    '@@toStringTag': 'string'},


  Set: {
    // Properties of the Set Constructor
    '[[Proto]]': '%FunctionPrototype%',
    prototype: '%SetPrototype%',
    '@@species': getter},


  '%SetPrototype%': {
    add: fn,
    clear: fn,
    constructor: 'Set',
    delete: fn,
    entries: fn,
    forEach: fn,
    has: fn,
    keys: fn,
    size: getter,
    values: fn,
    '@@iterator': fn,
    '@@toStringTag': 'string'},


  '%SetIteratorPrototype%': {
    // The %SetIteratorPrototype% Object
    '[[Proto]]': '%IteratorPrototype%',
    next: fn,
    '@@toStringTag': 'string'},


  WeakMap: {
    // Properties of the WeakMap Constructor
    '[[Proto]]': '%FunctionPrototype%',
    prototype: '%WeakMapPrototype%'},


  '%WeakMapPrototype%': {
    constructor: 'WeakMap',
    delete: fn,
    get: fn,
    has: fn,
    set: fn,
    '@@toStringTag': 'string'},


  WeakSet: {
    // Properties of the WeakSet Constructor
    '[[Proto]]': '%FunctionPrototype%',
    prototype: '%WeakSetPrototype%'},


  '%WeakSetPrototype%': {
    add: fn,
    constructor: 'WeakSet',
    delete: fn,
    has: fn,
    '@@toStringTag': 'string'},


  // *** Structured Data

  ArrayBuffer: {
    // Properties of the ArrayBuffer Constructor
    '[[Proto]]': '%FunctionPrototype%',
    isView: fn,
    prototype: '%ArrayBufferPrototype%',
    '@@species': getter,
    // See https://github.com/Moddable-OpenSource/moddable/issues/523
    fromString: false,
    // See https://github.com/Moddable-OpenSource/moddable/issues/523
    fromBigInt: false},


  '%ArrayBufferPrototype%': {
    byteLength: getter,
    constructor: 'ArrayBuffer',
    slice: fn,
    '@@toStringTag': 'string',
    // See https://github.com/Moddable-OpenSource/moddable/issues/523
    concat: false,
    // See https://github.com/tc39/proposal-resizablearraybuffer
    transfer: fn,
    resize: fn,
    resizable: getter,
    maxByteLength: getter,
    // https://github.com/tc39/proposal-arraybuffer-transfer
    transferToFixedLength: fn,
    detached: getter},


  // SharedArrayBuffer Objects
  SharedArrayBuffer: false, // UNSAFE and purposely suppressed.
  '%SharedArrayBufferPrototype%': false, // UNSAFE and purposely suppressed.

  DataView: {
    // Properties of the DataView Constructor
    '[[Proto]]': '%FunctionPrototype%',
    BYTES_PER_ELEMENT: 'number', // Non std but undeletable on Safari.
    prototype: '%DataViewPrototype%'},


  '%DataViewPrototype%': {
    buffer: getter,
    byteLength: getter,
    byteOffset: getter,
    constructor: 'DataView',
    getBigInt64: fn,
    getBigUint64: fn,
    getFloat32: fn,
    getFloat64: fn,
    getInt8: fn,
    getInt16: fn,
    getInt32: fn,
    getUint8: fn,
    getUint16: fn,
    getUint32: fn,
    setBigInt64: fn,
    setBigUint64: fn,
    setFloat32: fn,
    setFloat64: fn,
    setInt8: fn,
    setInt16: fn,
    setInt32: fn,
    setUint8: fn,
    setUint16: fn,
    setUint32: fn,
    '@@toStringTag': 'string'},


  // Atomics
  Atomics: false, // UNSAFE and suppressed.

  JSON: {
    parse: fn,
    stringify: fn,
    '@@toStringTag': 'string',
    // https://github.com/tc39/proposal-json-parse-with-source/
    rawJSON: fn,
    isRawJSON: fn},


  // *** Control Abstraction Objects

  // https://github.com/tc39/proposal-iterator-helpers
  Iterator: {
    // Properties of the Iterator Constructor
    '[[Proto]]': '%FunctionPrototype%',
    prototype: '%IteratorPrototype%',
    from: fn},


  '%IteratorPrototype%': {
    // The %IteratorPrototype% Object
    '@@iterator': fn,
    // https://github.com/tc39/proposal-iterator-helpers
    constructor: 'Iterator',
    map: fn,
    filter: fn,
    take: fn,
    drop: fn,
    flatMap: fn,
    reduce: fn,
    toArray: fn,
    forEach: fn,
    some: fn,
    every: fn,
    find: fn,
    '@@toStringTag': 'string',
    // https://github.com/tc39/proposal-async-iterator-helpers
    toAsync: fn},


  // https://github.com/tc39/proposal-iterator-helpers
  '%WrapForValidIteratorPrototype%': {
    '[[Proto]]': '%IteratorPrototype%',
    next: fn,
    return: fn},


  // https://github.com/tc39/proposal-iterator-helpers
  '%IteratorHelperPrototype%': {
    '[[Proto]]': '%IteratorPrototype%',
    next: fn,
    return: fn,
    '@@toStringTag': 'string'},


  // https://github.com/tc39/proposal-async-iterator-helpers
  AsyncIterator: {
    // Properties of the Iterator Constructor
    '[[Proto]]': '%FunctionPrototype%',
    prototype: '%AsyncIteratorPrototype%',
    from: fn},


  '%AsyncIteratorPrototype%': {
    // The %AsyncIteratorPrototype% Object
    '@@asyncIterator': fn,
    // https://github.com/tc39/proposal-async-iterator-helpers
    constructor: 'AsyncIterator',
    map: fn,
    filter: fn,
    take: fn,
    drop: fn,
    flatMap: fn,
    reduce: fn,
    toArray: fn,
    forEach: fn,
    some: fn,
    every: fn,
    find: fn,
    '@@toStringTag': 'string'},


  // https://github.com/tc39/proposal-async-iterator-helpers
  '%WrapForValidAsyncIteratorPrototype%': {
    '[[Proto]]': '%AsyncIteratorPrototype%',
    next: fn,
    return: fn},


  // https://github.com/tc39/proposal-async-iterator-helpers
  '%AsyncIteratorHelperPrototype%': {
    '[[Proto]]': '%AsyncIteratorPrototype%',
    next: fn,
    return: fn,
    '@@toStringTag': 'string'},


  '%InertGeneratorFunction%': {
    // Properties of the GeneratorFunction Constructor
    '[[Proto]]': '%InertFunction%',
    prototype: '%Generator%'},


  '%Generator%': {
    // Properties of the GeneratorFunction Prototype Object
    '[[Proto]]': '%FunctionPrototype%',
    constructor: '%InertGeneratorFunction%',
    prototype: '%GeneratorPrototype%',
    '@@toStringTag': 'string'},


  '%InertAsyncGeneratorFunction%': {
    // Properties of the AsyncGeneratorFunction Constructor
    '[[Proto]]': '%InertFunction%',
    prototype: '%AsyncGenerator%'},


  '%AsyncGenerator%': {
    // Properties of the AsyncGeneratorFunction Prototype Object
    '[[Proto]]': '%FunctionPrototype%',
    constructor: '%InertAsyncGeneratorFunction%',
    prototype: '%AsyncGeneratorPrototype%',
    // length prop added here for React Native jsc-android
    // https://github.com/endojs/endo/issues/660
    // https://github.com/react-native-community/jsc-android-buildscripts/issues/181
    length: 'number',
    '@@toStringTag': 'string'},


  '%GeneratorPrototype%': {
    // Properties of the Generator Prototype Object
    '[[Proto]]': '%IteratorPrototype%',
    constructor: '%Generator%',
    next: fn,
    return: fn,
    throw: fn,
    '@@toStringTag': 'string'},


  '%AsyncGeneratorPrototype%': {
    // Properties of the AsyncGenerator Prototype Object
    '[[Proto]]': '%AsyncIteratorPrototype%',
    constructor: '%AsyncGenerator%',
    next: fn,
    return: fn,
    throw: fn,
    '@@toStringTag': 'string'},


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
    resolve: fn},


  Promise: {
    // Properties of the Promise Constructor
    '[[Proto]]': '%FunctionPrototype%',
    all: fn,
    allSettled: fn,
    // To transition from `false` to `fn` once we also have `AggregateError`
    // TODO https://github.com/Agoric/SES-shim/issues/550
    any: false, // ES2021
    prototype: '%PromisePrototype%',
    race: fn,
    reject: fn,
    resolve: fn,
    '@@species': getter},


  '%PromisePrototype%': {
    // Properties of the Promise Prototype Object
    catch: fn,
    constructor: 'Promise',
    finally: fn,
    then: fn,
    '@@toStringTag': 'string',
    // Non-standard, used in node to prevent async_hooks from breaking
    'UniqueSymbol(async_id_symbol)': accessor,
    'UniqueSymbol(trigger_async_id_symbol)': accessor,
    'UniqueSymbol(destroyed)': accessor},


  '%InertAsyncFunction%': {
    // Properties of the AsyncFunction Constructor
    '[[Proto]]': '%InertFunction%',
    prototype: '%AsyncFunctionPrototype%'},


  '%AsyncFunctionPrototype%': {
    // Properties of the AsyncFunction Prototype Object
    '[[Proto]]': '%FunctionPrototype%',
    constructor: '%InertAsyncFunction%',
    // length prop added here for React Native jsc-android
    // https://github.com/endojs/endo/issues/660
    // https://github.com/react-native-community/jsc-android-buildscripts/issues/181
    length: 'number',
    '@@toStringTag': 'string'},


  // Reflection

  Reflect: {
    // The Reflect Object
    // Not a function object.
    apply: fn,
    construct: fn,
    defineProperty: fn,
    deleteProperty: fn,
    get: fn,
    getOwnPropertyDescriptor: fn,
    getPrototypeOf: fn,
    has: fn,
    isExtensible: fn,
    ownKeys: fn,
    preventExtensions: fn,
    set: fn,
    setPrototypeOf: fn,
    '@@toStringTag': 'string'},


  Proxy: {
    // Properties of the Proxy Constructor
    '[[Proto]]': '%FunctionPrototype%',
    revocable: fn},


  // Appendix B

  // Annex B: Additional Properties of the Global Object

  escape: fn,
  unescape: fn,

  // Proposed

  '%UniqueCompartment%': {
    '[[Proto]]': '%FunctionPrototype%',
    prototype: '%CompartmentPrototype%',
    toString: fn},


  '%InertCompartment%': {
    '[[Proto]]': '%FunctionPrototype%',
    prototype: '%CompartmentPrototype%',
    toString: fn},


  '%CompartmentPrototype%': {
    constructor: '%InertCompartment%',
    evaluate: fn,
    globalThis: getter,
    name: getter,
    // Should this be proposed?
    toString: fn,
    import: asyncFn,
    load: asyncFn,
    importNow: fn,
    module: fn},


  lockdown: fn,
  harden: { ...fn, isFake: 'boolean'},

  '%InitialGetStackString%': fn};$h‍_once.permitted(permitted);
})
,
// === functors[11] ===
(({   imports: $h‍_imports,   liveVar: $h‍_live,   onceVar: $h‍_once,   importMeta: $h‍____meta,  }) => {   let TypeError,WeakSet,arrayFilter,create,defineProperty,entries,freeze,getOwnPropertyDescriptor,getOwnPropertyDescriptors,globalThis,is,isObject,objectHasOwnProperty,values,weaksetHas,constantProperties,sharedGlobalPropertyNames,universalPropertyNames,permitted;$h‍_imports([["./commons.js", [["TypeError", [$h‍_a => (TypeError = $h‍_a)]],["WeakSet", [$h‍_a => (WeakSet = $h‍_a)]],["arrayFilter", [$h‍_a => (arrayFilter = $h‍_a)]],["create", [$h‍_a => (create = $h‍_a)]],["defineProperty", [$h‍_a => (defineProperty = $h‍_a)]],["entries", [$h‍_a => (entries = $h‍_a)]],["freeze", [$h‍_a => (freeze = $h‍_a)]],["getOwnPropertyDescriptor", [$h‍_a => (getOwnPropertyDescriptor = $h‍_a)]],["getOwnPropertyDescriptors", [$h‍_a => (getOwnPropertyDescriptors = $h‍_a)]],["globalThis", [$h‍_a => (globalThis = $h‍_a)]],["is", [$h‍_a => (is = $h‍_a)]],["isObject", [$h‍_a => (isObject = $h‍_a)]],["objectHasOwnProperty", [$h‍_a => (objectHasOwnProperty = $h‍_a)]],["values", [$h‍_a => (values = $h‍_a)]],["weaksetHas", [$h‍_a => (weaksetHas = $h‍_a)]]]],["./permits.js", [["constantProperties", [$h‍_a => (constantProperties = $h‍_a)]],["sharedGlobalPropertyNames", [$h‍_a => (sharedGlobalPropertyNames = $h‍_a)]],["universalPropertyNames", [$h‍_a => (universalPropertyNames = $h‍_a)]],["permitted", [$h‍_a => (permitted = $h‍_a)]]]]]);   
























const isFunction=  (obj)=>typeof obj===  'function';

// Like defineProperty, but throws if it would modify an existing property.
// We use this to ensure that two conflicting attempts to define the same
// property throws, causing SES initialization to fail. Otherwise, a
// conflict between, for example, two of SES's internal whitelists might
// get masked as one overwrites the other. Accordingly, the thrown error
// complains of a "Conflicting definition".
function initProperty(obj, name, desc) {
  if( objectHasOwnProperty(obj, name)) {
    const preDesc=  getOwnPropertyDescriptor(obj, name);
    if(
      !preDesc||
      !is(preDesc.value, desc.value)||
      preDesc.get!==  desc.get||
      preDesc.set!==  desc.set||
      preDesc.writable!==  desc.writable||
      preDesc.enumerable!==  desc.enumerable||
      preDesc.configurable!==  desc.configurable)
      {
      throw TypeError( `Conflicting definitions of ${name}`);
     }
   }
  defineProperty(obj, name, desc);
 }

// Like defineProperties, but throws if it would modify an existing property.
// This ensures that the intrinsics added to the intrinsics collector object
// graph do not overlap.
function initProperties(obj, descs) {
  for( const [name, desc]of  entries(descs)) {
    initProperty(obj, name, desc);
   }
 }

// sampleGlobals creates an intrinsics object, suitable for
// interinsicsCollector.addIntrinsics, from the named properties of a global
// object.
function sampleGlobals(globalObject, newPropertyNames) {
  const newIntrinsics=  { __proto__: null};
  for( const [globalName, intrinsicName]of  entries(newPropertyNames)) {
    if( objectHasOwnProperty(globalObject, globalName)) {
      newIntrinsics[intrinsicName]=  globalObject[globalName];
     }
   }
  return newIntrinsics;
 }

const        makeIntrinsicsCollector=  ()=>  {
  /** @type {Record<any, any>} */
  const intrinsics=  create(null);
  let pseudoNatives;

  const addIntrinsics=  (newIntrinsics)=>{
    initProperties(intrinsics, getOwnPropertyDescriptors(newIntrinsics));
   };
  freeze(addIntrinsics);

  // For each intrinsic, if it has a `.prototype` property, use the
  // whitelist to find out the intrinsic name for that prototype and add it
  // to the intrinsics.
  const completePrototypes=  ()=>  {
    for( const [name, intrinsic]of  entries(intrinsics)) {
      if( !isObject(intrinsic)) {
        // eslint-disable-next-line no-continue
        continue;
       }
      if( !objectHasOwnProperty(intrinsic, 'prototype')) {
        // eslint-disable-next-line no-continue
        continue;
       }
      const permit=  permitted[name];
      if( typeof permit!==  'object') {
        throw TypeError( `Expected permit object at whitelist.${name}`);
       }
      const namePrototype=  permit.prototype;
      if( !namePrototype) {
        throw TypeError( `${name}.prototype property not whitelisted`);
       }
      if(
        typeof namePrototype!==  'string'||
        !objectHasOwnProperty(permitted, namePrototype))
        {
        throw TypeError( `Unrecognized ${name}.prototype whitelist entry`);
       }
      const intrinsicPrototype=  intrinsic.prototype;
      if( objectHasOwnProperty(intrinsics, namePrototype)) {
        if( intrinsics[namePrototype]!==  intrinsicPrototype) {
          throw TypeError( `Conflicting bindings of ${namePrototype}`);
         }
        // eslint-disable-next-line no-continue
        continue;
       }
      intrinsics[namePrototype]=  intrinsicPrototype;
     }
   };
  freeze(completePrototypes);

  const finalIntrinsics=  ()=>  {
    freeze(intrinsics);
    pseudoNatives=  new WeakSet(arrayFilter(values(intrinsics), isFunction));
    return intrinsics;
   };
  freeze(finalIntrinsics);

  const isPseudoNative=  (obj)=>{
    if( !pseudoNatives) {
      throw TypeError(
        'isPseudoNative can only be called after finalIntrinsics');

     }
    return weaksetHas(pseudoNatives, obj);
   };
  freeze(isPseudoNative);

  const intrinsicsCollector=  {
    addIntrinsics,
    completePrototypes,
    finalIntrinsics,
    isPseudoNative};

  freeze(intrinsicsCollector);

  addIntrinsics(constantProperties);
  addIntrinsics(sampleGlobals(globalThis, universalPropertyNames));

  return intrinsicsCollector;
 };

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
 *
 * @param {object} globalObject
 */$h‍_once.makeIntrinsicsCollector(makeIntrinsicsCollector);
const        getGlobalIntrinsics=  (globalObject)=>{
  const { addIntrinsics, finalIntrinsics}=   makeIntrinsicsCollector();

  addIntrinsics(sampleGlobals(globalObject, sharedGlobalPropertyNames));

  return finalIntrinsics();
 };$h‍_once.getGlobalIntrinsics(getGlobalIntrinsics);
})
,
// === functors[12] ===
(({   imports: $h‍_imports,   liveVar: $h‍_live,   onceVar: $h‍_once,   importMeta: $h‍____meta,  }) => {   let permitted,FunctionInstance,isAccessorPermit,Map,String,Symbol,TypeError,arrayFilter,arrayIncludes,arrayMap,entries,getOwnPropertyDescriptor,getPrototypeOf,isObject,mapGet,objectHasOwnProperty,ownKeys,symbolKeyFor;$h‍_imports([["./permits.js", [["permitted", [$h‍_a => (permitted = $h‍_a)]],["FunctionInstance", [$h‍_a => (FunctionInstance = $h‍_a)]],["isAccessorPermit", [$h‍_a => (isAccessorPermit = $h‍_a)]]]],["./commons.js", [["Map", [$h‍_a => (Map = $h‍_a)]],["String", [$h‍_a => (String = $h‍_a)]],["Symbol", [$h‍_a => (Symbol = $h‍_a)]],["TypeError", [$h‍_a => (TypeError = $h‍_a)]],["arrayFilter", [$h‍_a => (arrayFilter = $h‍_a)]],["arrayIncludes", [$h‍_a => (arrayIncludes = $h‍_a)]],["arrayMap", [$h‍_a => (arrayMap = $h‍_a)]],["entries", [$h‍_a => (entries = $h‍_a)]],["getOwnPropertyDescriptor", [$h‍_a => (getOwnPropertyDescriptor = $h‍_a)]],["getPrototypeOf", [$h‍_a => (getPrototypeOf = $h‍_a)]],["isObject", [$h‍_a => (isObject = $h‍_a)]],["mapGet", [$h‍_a => (mapGet = $h‍_a)]],["objectHasOwnProperty", [$h‍_a => (objectHasOwnProperty = $h‍_a)]],["ownKeys", [$h‍_a => (ownKeys = $h‍_a)]],["symbolKeyFor", [$h‍_a => (symbolKeyFor = $h‍_a)]]]]]);   































































/**
 * whitelistIntrinsics()
 * Removes all non-allowed properties found by recursively and
 * reflectively walking own property chains.
 *
 * @param {object} intrinsics
 * @param {(object) => void} markVirtualizedNativeFunction
 */
function                whitelistIntrinsics(
  intrinsics,
  markVirtualizedNativeFunction)
  {
  // These primitives are allowed allowed for permits.
  const primitives=  ['undefined', 'boolean', 'number', 'string', 'symbol'];

  // These symbols are allowed as well-known symbols
  const wellKnownSymbolNames=  new Map(
    Symbol?
        arrayMap(
          arrayFilter(
            entries(permitted['%SharedSymbol%']),
            ([name, permit])=>
              permit===  'symbol'&&  typeof Symbol[name]===  'symbol'),

          ([name])=>  [Symbol[name],  `@@${name}`]):

        []);


  /**
   * asStringPropertyName()
   *
   * @param {string} path
   * @param {string | symbol} prop
   */
  function asStringPropertyName(path, prop) {
    if( typeof prop===  'string') {
      return prop;
     }

    const wellKnownSymbol=  mapGet(wellKnownSymbolNames, prop);

    if( typeof prop===  'symbol') {
      if( wellKnownSymbol) {
        return wellKnownSymbol;
       }else {
        const registeredKey=  symbolKeyFor(prop);
        if( registeredKey!==  undefined) {
          return  `RegisteredSymbol(${registeredKey})`;
         }else {
          return  `Unique${String(prop)}`;
         }
       }
     }

    throw TypeError( `Unexpected property name type ${path} ${prop}`);
   }

  /*
   * visitPrototype()
   * Validate the object's [[prototype]] against a permit.
   */
  function visitPrototype(path, obj, protoName) {
    if( !isObject(obj)) {
      throw TypeError( `Object expected: ${path}, ${obj}, ${protoName}`);
     }
    const proto=  getPrototypeOf(obj);

    // Null prototype.
    if( proto===  null&&  protoName===  null) {
      return;
     }

    // Assert: protoName, if provided, is a string.
    if( protoName!==  undefined&&  typeof protoName!==  'string') {
      throw TypeError( `Malformed whitelist permit ${path}.__proto__`);
     }

    // If permit not specified, default to Object.prototype.
    if( proto===  intrinsics[protoName||  '%ObjectPrototype%']) {
      return;
     }

    // We can't clean [[prototype]], therefore abort.
    throw TypeError( `Unexpected intrinsic ${path}.__proto__ at ${protoName}`);
   }

  /*
   * isAllowedPropertyValue()
   * Whitelist a single property value against a permit.
   */
  function isAllowedPropertyValue(path, value, prop, permit) {
    if( typeof permit===  'object') {
      // eslint-disable-next-line no-use-before-define
      visitProperties(path, value, permit);
      // The property is allowed.
      return true;
     }

    if( permit===  false) {
      // A boolan 'false' permit specifies the removal of a property.
      // We require a more specific permit instead of allowing 'true'.
      return false;
     }

    if( typeof permit===  'string') {
      // A string permit can have one of two meanings:

      if( prop===  'prototype'||  prop===  'constructor') {
        // For prototype and constructor value properties, the permit
        // is the name of an intrinsic.
        // Assumption: prototype and constructor cannot be primitives.
        // Assert: the permit is the name of an intrinsic.
        // Assert: the property value is equal to that intrinsic.

        if( objectHasOwnProperty(intrinsics, permit)) {
          if( value!==  intrinsics[permit]) {
            throw TypeError( `Does not match whitelist ${path}`);
           }
          return true;
         }
       }else {
        // For all other properties, the permit is the name of a primitive.
        // Assert: the permit is the name of a primitive.
        // Assert: the property value type is equal to that primitive.

        // eslint-disable-next-line no-lonely-if
        if( arrayIncludes(primitives, permit)) {
          // eslint-disable-next-line valid-typeof
          if( typeof value!==  permit) {
            throw TypeError(
               `At ${path} expected ${permit} not ${typeof value}`);

           }
          return true;
         }
       }
     }

    throw TypeError( `Unexpected whitelist permit ${permit} at ${path}`);
   }

  /*
   * isAllowedProperty()
   * Check whether a single property is allowed.
   */
  function isAllowedProperty(path, obj, prop, permit) {
    const desc=  getOwnPropertyDescriptor(obj, prop);
    if( !desc) {
      throw TypeError( `Property ${prop} not found at ${path}`);
     }

    // Is this a value property?
    if( objectHasOwnProperty(desc, 'value')) {
      if( isAccessorPermit(permit)) {
        throw TypeError( `Accessor expected at ${path}`);
       }
      return isAllowedPropertyValue(path, desc.value, prop, permit);
     }
    if( !isAccessorPermit(permit)) {
      throw TypeError( `Accessor not expected at ${path}`);
     }
    return(
      isAllowedPropertyValue( `${path}<get>`,desc.get, prop, permit.get)&&
      isAllowedPropertyValue( `${path}<set>`,desc.set, prop, permit.set));

   }

  /*
   * getSubPermit()
   */
  function getSubPermit(obj, permit, prop) {
    const permitProp=  prop===  '__proto__'?  '--proto--':  prop;
    if( objectHasOwnProperty(permit, permitProp)) {
      return permit[permitProp];
     }

    if( typeof obj===  'function') {
      if( objectHasOwnProperty(FunctionInstance, permitProp)) {
        return FunctionInstance[permitProp];
       }
     }

    return undefined;
   }

  /*
   * visitProperties()
   * Visit all properties for a permit.
   */
  function visitProperties(path, obj, permit) {
    if( obj===  undefined||  obj===  null) {
      return;
     }

    const protoName=  permit['[[Proto]]'];
    visitPrototype(path, obj, protoName);

    if( typeof obj===  'function') {
      markVirtualizedNativeFunction(obj);
     }

    for( const prop of ownKeys(obj)) {
      const propString=  asStringPropertyName(path, prop);
      const subPath=   `${path}.${propString}`;
      const subPermit=  getSubPermit(obj, permit, propString);

      if( !subPermit||  !isAllowedProperty(subPath, obj, prop, subPermit)) {
        // Either the object lacks a permit or the object doesn't match the
        // permit.
        // If the permit is specifically false, not merely undefined,
        // this is a property we expect to see because we know it exists in
        // some environments and we have expressly decided to exclude it.
        // Any other disallowed property is one we have not audited and we log
        // that we are removing it so we know to look into it, as happens when
        // the language evolves new features to existing intrinsics.
        if( subPermit!==  false) {
          // This call to `console.warn` is intentional. It is not a vestige of
          // a debugging attempt. See the comment at top of file for an
          // explanation.
          // eslint-disable-next-line @endo/no-polymorphic-call
          console.warn( `Removing ${subPath}`);
         }
        try {
          delete obj[prop];
         }catch( err) {
          if( prop in obj) {
            if( typeof obj===  'function'&&  prop===  'prototype') {
              obj.prototype=  undefined;
              if( obj.prototype===  undefined) {
                // eslint-disable-next-line @endo/no-polymorphic-call
                console.warn( `Tolerating undeletable ${subPath} === undefined`);
                // eslint-disable-next-line no-continue
                continue;
               }
             }
            // eslint-disable-next-line @endo/no-polymorphic-call
            console.error( `failed to delete ${subPath}`,err);
           }else {
            // eslint-disable-next-line @endo/no-polymorphic-call
            console.error( `deleting ${subPath} threw`,err);
           }
          throw err;
         }
       }
     }
   }

  // Start path with 'intrinsics' to clarify that properties are not
  // removed from the global object by the whitelisting operation.
  visitProperties('intrinsics', intrinsics, permitted);
 }$h‍_once.default(     whitelistIntrinsics);
})
,
// === functors[13] ===
(({   imports: $h‍_imports,   liveVar: $h‍_live,   onceVar: $h‍_once,   importMeta: $h‍____meta,  }) => {   let FERAL_FUNCTION,SyntaxError,TypeError,defineProperties,getPrototypeOf,setPrototypeOf,freeze;$h‍_imports([["./commons.js", [["FERAL_FUNCTION", [$h‍_a => (FERAL_FUNCTION = $h‍_a)]],["SyntaxError", [$h‍_a => (SyntaxError = $h‍_a)]],["TypeError", [$h‍_a => (TypeError = $h‍_a)]],["defineProperties", [$h‍_a => (defineProperties = $h‍_a)]],["getPrototypeOf", [$h‍_a => (getPrototypeOf = $h‍_a)]],["setPrototypeOf", [$h‍_a => (setPrototypeOf = $h‍_a)]],["freeze", [$h‍_a => (freeze = $h‍_a)]]]]]);   









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
// replacement functions. See [./permits-intrinsics.js].
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
function                tameFunctionConstructors() {
  try {
    // Verify that the method is not callable.
    // eslint-disable-next-line @endo/no-polymorphic-call
    FERAL_FUNCTION.prototype.constructor('return 1');
   }catch( ignore) {
    // Throws, no need to patch.
    return freeze({});
   }

  const newIntrinsics=  {};

  /*
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
      // eslint-disable-next-line no-eval, no-restricted-globals
      FunctionInstance=  (0, eval)(declaration);
     }catch( e) {
      if( e instanceof SyntaxError) {
        // Prevent failure on platforms where async and/or generators
        // are not supported.
        return;
       }
      // Re-throw
      throw e;
     }
    const FunctionPrototype=  getPrototypeOf(FunctionInstance);

    // Prevents the evaluation of source when calling constructor on the
    // prototype of functions.
    // eslint-disable-next-line func-names
    const InertConstructor=  function()  {
      throw TypeError(
        'Function.prototype.constructor is not a valid constructor.');

     };
    defineProperties(InertConstructor, {
      prototype: { value: FunctionPrototype},
      name: {
        value: name,
        writable: false,
        enumerable: false,
        configurable: true}});



    defineProperties(FunctionPrototype, {
      constructor: { value: InertConstructor}});


    // Reconstructs the inheritance among the new tamed constructors
    // to mirror the original specified in normal JS.
    if( InertConstructor!==  FERAL_FUNCTION.prototype.constructor) {
      setPrototypeOf(InertConstructor, FERAL_FUNCTION.prototype.constructor);
     }

    newIntrinsics[intrinsicName]=  InertConstructor;
   }

  // Here, the order of operation is important: Function needs to be repaired
  // first since the other repaired constructors need to inherit from the
  // tamed Function function constructor.

  repairFunction('Function', '%InertFunction%', '(function(){})');
  repairFunction(
    'GeneratorFunction',
    '%InertGeneratorFunction%',
    '(function*(){})');

  repairFunction(
    'AsyncFunction',
    '%InertAsyncFunction%',
    '(async function(){})');

  repairFunction(
    'AsyncGeneratorFunction',
    '%InertAsyncGeneratorFunction%',
    '(async function*(){})');


  return newIntrinsics;
 }$h‍_once.default(     tameFunctionConstructors);
})
,
// === functors[14] ===
(({   imports: $h‍_imports,   liveVar: $h‍_live,   onceVar: $h‍_once,   importMeta: $h‍____meta,  }) => {   let Date,TypeError,apply,construct,defineProperties;$h‍_imports([["./commons.js", [["Date", [$h‍_a => (Date = $h‍_a)]],["TypeError", [$h‍_a => (TypeError = $h‍_a)]],["apply", [$h‍_a => (apply = $h‍_a)]],["construct", [$h‍_a => (construct = $h‍_a)]],["defineProperties", [$h‍_a => (defineProperties = $h‍_a)]]]]]);   









function                tameDateConstructor(dateTaming=  'safe') {
  if( dateTaming!==  'safe'&&  dateTaming!==  'unsafe') {
    throw TypeError( `unrecognized dateTaming ${dateTaming}`);
   }
  const OriginalDate=  Date;
  const DatePrototype=  OriginalDate.prototype;

  // Use concise methods to obtain named functions without constructors.
  const tamedMethods=  {
    /**
     * `%SharedDate%.now()` throw a `TypeError` starting with "secure mode".
     * See https://github.com/endojs/endo/issues/910#issuecomment-1581855420
     */
    now() {
      throw TypeError('secure mode Calling %SharedDate%.now() throws');
     }};


  /**
   * Tame the Date constructor.
   * See https://github.com/endojs/endo/issues/910#issuecomment-1581855420
   *
   * Common behavior
   *   * `new Date(x)` coerces x into a number and then returns a Date
   *     for that number of millis since the epoch
   *   * `new Date(NaN)` returns a Date object which stringifies to
   *     'Invalid Date'
   *   * `new Date(undefined)` returns a Date object which stringifies to
   *     'Invalid Date'
   *
   * OriginalDate (normal standard) behavior preserved by
   * `%InitialDate%`.
   *   * `Date(anything)` gives a string with the current time
   *   * `new Date()` returns the current time, as a Date object
   *
   * `%SharedDate%` behavior
   *   * `Date(anything)` throws a TypeError starting with "secure mode"
   *   * `new Date()` throws a TypeError starting with "secure mode"
   *
   * @param {{powers?: string}} [opts]
   */
  const makeDateConstructor=  ({ powers=  'none'}=   {})=>  {
    let ResultDate;
    if( powers===  'original') {
      // eslint-disable-next-line no-shadow
      ResultDate=  function Date(...rest) {
        if( new.target===  undefined) {
          return apply(OriginalDate, undefined, rest);
         }
        return construct(OriginalDate, rest, new.target);
       };
     }else {
      // eslint-disable-next-line no-shadow
      ResultDate=  function Date(...rest) {
        if( new.target===  undefined) {
          throw TypeError(
            'secure mode Calling %SharedDate% constructor as a function throws');

         }
        if( rest.length===  0) {
          throw TypeError(
            'secure mode Calling new %SharedDate%() with no arguments throws');

         }
        return construct(OriginalDate, rest, new.target);
       };
     }

    defineProperties(ResultDate, {
      length: { value: 7},
      prototype: {
        value: DatePrototype,
        writable: false,
        enumerable: false,
        configurable: false},

      parse: {
        value: OriginalDate.parse,
        writable: true,
        enumerable: false,
        configurable: true},

      UTC: {
        value: OriginalDate.UTC,
        writable: true,
        enumerable: false,
        configurable: true}});


    return ResultDate;
   };
  const InitialDate=  makeDateConstructor({ powers: 'original'});
  const SharedDate=  makeDateConstructor({ powers: 'none'});

  defineProperties(InitialDate, {
    now: {
      value: OriginalDate.now,
      writable: true,
      enumerable: false,
      configurable: true}});


  defineProperties(SharedDate, {
    now: {
      value: tamedMethods.now,
      writable: true,
      enumerable: false,
      configurable: true}});



  defineProperties(DatePrototype, {
    constructor: { value: SharedDate}});


  return {
    '%InitialDate%': InitialDate,
    '%SharedDate%': SharedDate};

 }$h‍_once.default(     tameDateConstructor);
})
,
// === functors[15] ===
(({   imports: $h‍_imports,   liveVar: $h‍_live,   onceVar: $h‍_once,   importMeta: $h‍____meta,  }) => {   let Math,TypeError,create,getOwnPropertyDescriptors,objectPrototype;$h‍_imports([["./commons.js", [["Math", [$h‍_a => (Math = $h‍_a)]],["TypeError", [$h‍_a => (TypeError = $h‍_a)]],["create", [$h‍_a => (create = $h‍_a)]],["getOwnPropertyDescriptors", [$h‍_a => (getOwnPropertyDescriptors = $h‍_a)]],["objectPrototype", [$h‍_a => (objectPrototype = $h‍_a)]]]]]);   







function                tameMathObject(mathTaming=  'safe') {
  if( mathTaming!==  'safe'&&  mathTaming!==  'unsafe') {
    throw TypeError( `unrecognized mathTaming ${mathTaming}`);
   }
  const originalMath=  Math;
  const initialMath=  originalMath; // to follow the naming pattern

  const { random: _, ...otherDescriptors}=
    getOwnPropertyDescriptors(originalMath);

  // Use concise methods to obtain named functions without constructors.
  const tamedMethods=  {
    /**
     * `%SharedMath%.random()` throws a TypeError starting with "secure mode".
     * See https://github.com/endojs/endo/issues/910#issuecomment-1581855420
     */
    random() {
      throw TypeError('secure mode %SharedMath%.random() throws');
     }};


  const sharedMath=  create(objectPrototype, {
    ...otherDescriptors,
    random: {
      value: tamedMethods.random,
      writable: true,
      enumerable: false,
      configurable: true}});



  return {
    '%InitialMath%': initialMath,
    '%SharedMath%': sharedMath};

 }$h‍_once.default(     tameMathObject);
})
,
// === functors[16] ===
(({   imports: $h‍_imports,   liveVar: $h‍_live,   onceVar: $h‍_once,   importMeta: $h‍____meta,  }) => {   let FERAL_REG_EXP,TypeError,construct,defineProperties,getOwnPropertyDescriptor,speciesSymbol;$h‍_imports([["./commons.js", [["FERAL_REG_EXP", [$h‍_a => (FERAL_REG_EXP = $h‍_a)]],["TypeError", [$h‍_a => (TypeError = $h‍_a)]],["construct", [$h‍_a => (construct = $h‍_a)]],["defineProperties", [$h‍_a => (defineProperties = $h‍_a)]],["getOwnPropertyDescriptor", [$h‍_a => (getOwnPropertyDescriptor = $h‍_a)]],["speciesSymbol", [$h‍_a => (speciesSymbol = $h‍_a)]]]]]);   








function                tameRegExpConstructor(regExpTaming=  'safe') {
  if( regExpTaming!==  'safe'&&  regExpTaming!==  'unsafe') {
    throw TypeError( `unrecognized regExpTaming ${regExpTaming}`);
   }
  const RegExpPrototype=  FERAL_REG_EXP.prototype;

  const makeRegExpConstructor=  (_=  {})=>  {
    // RegExp has non-writable static properties we need to omit.
    /**
     * @param  {Parameters<typeof FERAL_REG_EXP>} rest
     */
    const ResultRegExp=  function RegExp(...rest) {
      if( new.target===  undefined) {
        return FERAL_REG_EXP(...rest);
       }
      return construct(FERAL_REG_EXP, rest, new.target);
     };

    const speciesDesc=  getOwnPropertyDescriptor(FERAL_REG_EXP, speciesSymbol);
    if( !speciesDesc) {
      throw TypeError('no RegExp[Symbol.species] descriptor');
     }

    defineProperties(ResultRegExp, {
      length: { value: 2},
      prototype: {
        value: RegExpPrototype,
        writable: false,
        enumerable: false,
        configurable: false},

      [speciesSymbol]: speciesDesc});

    return ResultRegExp;
   };

  const InitialRegExp=  makeRegExpConstructor();
  const SharedRegExp=  makeRegExpConstructor();

  if( regExpTaming!==  'unsafe') {
    // @ts-expect-error Deleted properties must be optional
    delete RegExpPrototype.compile;
   }
  defineProperties(RegExpPrototype, {
    constructor: { value: SharedRegExp}});


  return {
    '%InitialRegExp%': InitialRegExp,
    '%SharedRegExp%': SharedRegExp};

 }$h‍_once.default(     tameRegExpConstructor);
})
,
// === functors[17] ===
(({   imports: $h‍_imports,   liveVar: $h‍_live,   onceVar: $h‍_once,   importMeta: $h‍____meta,  }) => {   $h‍_imports([]);   /**
 * @file Exports {@code enablements}, a recursively defined
 * JSON record defining the optimum set of intrinsics properties
 * that need to be "repaired" before hardening is applied on
 * enviromments subject to the override mistake.
 *
 * @author JF Paradis
 * @author Mark S. Miller
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
 *     example, {@code "Function.prototype.name"} leads to true,
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

/**
 * Minimal enablements when all the code is modern and known not to
 * step into the override mistake, except for the following pervasive
 * cases.
 */
const        minEnablements=  {
  '%ObjectPrototype%': {
    toString: true},


  '%FunctionPrototype%': {
    toString: true  // set by "rollup"
},

  '%ErrorPrototype%': {
    name: true  // set by "precond", "ava", "node-fetch"
}};


/**
 * Moderate enablements are usually good enough for legacy compat.
 */$h‍_once.minEnablements(minEnablements);
const        moderateEnablements=  {
  '%ObjectPrototype%': {
    toString: true,
    valueOf: true},


  '%ArrayPrototype%': {
    toString: true,
    push: true  // set by "Google Analytics"
},

  // Function.prototype has no 'prototype' property to enable.
  // Function instances have their own 'name' and 'length' properties
  // which are configurable and non-writable. Thus, they are already
  // non-assignable anyway.
  '%FunctionPrototype%': {
    constructor: true, // set by "regenerator-runtime"
    bind: true, // set by "underscore", "express"
    toString: true  // set by "rollup"
},

  '%ErrorPrototype%': {
    constructor: true, // set by "fast-json-patch", "node-fetch"
    message: true,
    name: true, // set by "precond", "ava", "node-fetch", "node 14"
    toString: true  // set by "bluebird"
},

  '%TypeErrorPrototype%': {
    constructor: true, // set by "readable-stream"
    message: true, // set by "tape"
    name: true  // set by "readable-stream", "node 14"
},

  '%SyntaxErrorPrototype%': {
    message: true, // to match TypeErrorPrototype.message
    name: true  // set by "node 14"
},

  '%RangeErrorPrototype%': {
    message: true, // to match TypeErrorPrototype.message
    name: true  // set by "node 14"
},

  '%URIErrorPrototype%': {
    message: true, // to match TypeErrorPrototype.message
    name: true  // set by "node 14"
},

  '%EvalErrorPrototype%': {
    message: true, // to match TypeErrorPrototype.message
    name: true  // set by "node 14"
},

  '%ReferenceErrorPrototype%': {
    message: true, // to match TypeErrorPrototype.message
    name: true  // set by "node 14"
},

  '%PromisePrototype%': {
    constructor: true  // set by "core-js"
},

  '%TypedArrayPrototype%': '*', // set by https://github.com/feross/buffer

  '%Generator%': {
    constructor: true,
    name: true,
    toString: true},


  '%IteratorPrototype%': {
    toString: true}};



/**
 * The 'severe' enablement are needed because of issues tracked at
 * https://github.com/endojs/endo/issues/576
 *
 * They are like the `moderate` enablements except for the entries below.
 */$h‍_once.moderateEnablements(moderateEnablements);
const        severeEnablements=  {
  ...moderateEnablements,

  /**
   * Rollup (as used at least by vega) and webpack
   * (as used at least by regenerator) both turn exports into assignments
   * to a big `exports` object that inherits directly from
   * `Object.prototype`. Some of the exported names we've seen include
   * `hasOwnProperty`, `constructor`, and `toString`. But the strategy used
   * by rollup and webpack potentionally turns any exported name
   * into an assignment rejected by the override mistake. That's why
   * the `severe` enablements takes the extreme step of enabling
   * everything on `Object.prototype`.
   *
   * In addition, code doing inheritance manually will often override
   * the `constructor` property on the new prototype by assignment. We've
   * seen this several times.
   *
   * The cost of enabling all these is that they create a miserable debugging
   * experience specifically on Node.
   * https://github.com/Agoric/agoric-sdk/issues/2324
   * explains how it confused the Node console.
   *
   * (TODO Reexamine the vscode situation. I think it may have improved
   * since the following paragraph was written.)
   *
   * The vscode debugger's object inspector shows the own data properties of
   * an object, which is typically what you want, but also shows both getter
   * and setter for every accessor property whether inherited or own.
   * With the `'*'` setting here, all the properties inherited from
   * `Object.prototype` are accessors, creating an unusable display as seen
   * at As explained at
   * https://github.com/endojs/endo/blob/master/packages/ses/lockdown-options.md#overridetaming-options
   * Open the triangles at the bottom of that section.
   */
  '%ObjectPrototype%': '*',

  /**
   * The widely used Buffer defined at https://github.com/feross/buffer
   * on initialization, manually creates the equivalent of a subclass of
   * `TypedArray`, which it then initializes by assignment. These assignments
   * include enough of the `TypeArray` methods that here, the `severe`
   * enablements just enable them all.
   */
  '%TypedArrayPrototype%': '*',

  /**
   * Needed to work with Immer before https://github.com/immerjs/immer/pull/914
   * is accepted.
   */
  '%MapPrototype%': '*',

  /**
   * Needed to work with Immer before https://github.com/immerjs/immer/pull/914
   * is accepted.
   */
  '%SetPrototype%': '*'};$h‍_once.severeEnablements(severeEnablements);
})
,
// === functors[18] ===
(({   imports: $h‍_imports,   liveVar: $h‍_live,   onceVar: $h‍_once,   importMeta: $h‍____meta,  }) => {   let Set,String,TypeError,arrayForEach,defineProperty,getOwnPropertyDescriptor,getOwnPropertyDescriptors,getOwnPropertyNames,isObject,objectHasOwnProperty,ownKeys,setHas,minEnablements,moderateEnablements,severeEnablements;$h‍_imports([["./commons.js", [["Set", [$h‍_a => (Set = $h‍_a)]],["String", [$h‍_a => (String = $h‍_a)]],["TypeError", [$h‍_a => (TypeError = $h‍_a)]],["arrayForEach", [$h‍_a => (arrayForEach = $h‍_a)]],["defineProperty", [$h‍_a => (defineProperty = $h‍_a)]],["getOwnPropertyDescriptor", [$h‍_a => (getOwnPropertyDescriptor = $h‍_a)]],["getOwnPropertyDescriptors", [$h‍_a => (getOwnPropertyDescriptors = $h‍_a)]],["getOwnPropertyNames", [$h‍_a => (getOwnPropertyNames = $h‍_a)]],["isObject", [$h‍_a => (isObject = $h‍_a)]],["objectHasOwnProperty", [$h‍_a => (objectHasOwnProperty = $h‍_a)]],["ownKeys", [$h‍_a => (ownKeys = $h‍_a)]],["setHas", [$h‍_a => (setHas = $h‍_a)]]]],["./enablements.js", [["minEnablements", [$h‍_a => (minEnablements = $h‍_a)]],["moderateEnablements", [$h‍_a => (moderateEnablements = $h‍_a)]],["severeEnablements", [$h‍_a => (severeEnablements = $h‍_a)]]]]]);   

























/**
 * For a special set of properties defined in the `enablement` whitelist,
 * `enablePropertyOverrides` ensures that the effect of freezing does not
 * suppress the ability to override these properties on derived objects by
 * simple assignment.
 *
 * Because of lack of sufficient foresight at the time, ES5 unfortunately
 * specified that a simple assignment to a non-existent property must fail if
 * it would override an non-writable data property of the same name in the
 * shadow of the prototype chain. In retrospect, this was a mistake, the
 * so-called "override mistake". But it is now too late and we must live with
 * the consequences.
 *
 * As a result, simply freezing an object to make it tamper proof has the
 * unfortunate side effect of breaking previously correct code that is
 * considered to have followed JS best practices, if this previous code used
 * assignment to override.
 *
 * For the enabled properties, `enablePropertyOverrides` effectively shims what
 * the assignment behavior would have been in the absence of the override
 * mistake. However, the shim produces an imperfect emulation. It shims the
 * behavior by turning these data properties into accessor properties, where
 * the accessor's getter and setter provide the desired behavior. For
 * non-reflective operations, the illusion is perfect. However, reflective
 * operations like `getOwnPropertyDescriptor` see the descriptor of an accessor
 * property rather than the descriptor of a data property. At the time of this
 * writing, this is the best we know how to do.
 *
 * To the getter of the accessor we add a property named
 * `'originalValue'` whose value is, as it says, the value that the
 * data property had before being converted to an accessor property. We add
 * this extra property to the getter for two reason:
 *
 * The harden algorithm walks the own properties reflectively, i.e., with
 * `getOwnPropertyDescriptor` semantics, rather than `[[Get]]` semantics. When
 * it sees an accessor property, it does not invoke the getter. Rather, it
 * proceeds to walk both the getter and setter as part of its transitive
 * traversal. Without this extra property, `enablePropertyOverrides` would have
 * hidden the original data property value from `harden`, which would be bad.
 * Instead, by exposing that value in an own data property on the getter,
 * `harden` finds and walks it anyway.
 *
 * We enable a form of cooperative emulation, giving reflective code an
 * opportunity to cooperate in upholding the illusion. When such cooperative
 * reflective code sees an accessor property, where the accessor's getter
 * has an `originalValue` property, it knows that the getter is
 * alleging that it is the result of the `enablePropertyOverrides` conversion
 * pattern, so it can decide to cooperatively "pretend" that it sees a data
 * property with that value.
 *
 * @param {Record<string, any>} intrinsics
 * @param {'min' | 'moderate' | 'severe'} overrideTaming
 * @param {Iterable<string | symbol>} [overrideDebug]
 */
function                enablePropertyOverrides(
  intrinsics,
  overrideTaming,
  overrideDebug=  [])
  {
  const debugProperties=  new Set(overrideDebug);
  function enable(path, obj, prop, desc) {
    if( 'value'in  desc&&  desc.configurable) {
      const { value}=   desc;

      function getter() {
        return value;
       }
      defineProperty(getter, 'originalValue', {
        value,
        writable: false,
        enumerable: false,
        configurable: false});


      const isDebug=  setHas(debugProperties, prop);

      function setter(newValue) {
        if( obj===  this) {
          throw TypeError(
             `Cannot assign to read only property '${String(
              prop)
              }' of '${path}'`);

         }
        if( objectHasOwnProperty(this, prop)) {
          this[prop]=  newValue;
         }else {
          if( isDebug) {
            // eslint-disable-next-line @endo/no-polymorphic-call
            console.error(TypeError( `Override property ${prop}`));
           }
          defineProperty(this, prop, {
            value: newValue,
            writable: true,
            enumerable: true,
            configurable: true});

         }
       }

      defineProperty(obj, prop, {
        get: getter,
        set: setter,
        enumerable: desc.enumerable,
        configurable: desc.configurable});

     }
   }

  function enableProperty(path, obj, prop) {
    const desc=  getOwnPropertyDescriptor(obj, prop);
    if( !desc) {
      return;
     }
    enable(path, obj, prop, desc);
   }

  function enableAllProperties(path, obj) {
    const descs=  getOwnPropertyDescriptors(obj);
    if( !descs) {
      return;
     }
    // TypeScript does not allow symbols to be used as indexes because it
    // cannot recokon types of symbolized properties.
    // @ts-ignore
    arrayForEach(ownKeys(descs), (prop)=>enable(path, obj, prop, descs[prop]));
   }

  function enableProperties(path, obj, plan) {
    for( const prop of getOwnPropertyNames(plan)) {
      const desc=  getOwnPropertyDescriptor(obj, prop);
      if( !desc||  desc.get||  desc.set) {
        // No not a value property, nothing to do.
        // eslint-disable-next-line no-continue
        continue;
       }

      // Plan has no symbol keys and we use getOwnPropertyNames()
      // so `prop` cannot only be a string, not a symbol. We coerce it in place
      // with `String(..)` anyway just as good hygiene, since these paths are just
      // for diagnostic purposes.
      const subPath=   `${path}.${String(prop)}`;
      const subPlan=  plan[prop];

      if( subPlan===  true) {
        enableProperty(subPath, obj, prop);
       }else if( subPlan===  '*') {
        enableAllProperties(subPath, desc.value);
       }else if( isObject(subPlan)) {
        enableProperties(subPath, desc.value, subPlan);
       }else {
        throw TypeError( `Unexpected override enablement plan ${subPath}`);
       }
     }
   }

  let plan;
  switch( overrideTaming){
    case 'min': {
      plan=  minEnablements;
      break;
     }
    case 'moderate': {
      plan=  moderateEnablements;
      break;
     }
    case 'severe': {
      plan=  severeEnablements;
      break;
     }
    default: {
      throw TypeError( `unrecognized overrideTaming ${overrideTaming}`);
     }}


  // Do the repair.
  enableProperties('root', intrinsics, plan);
 }$h‍_once.default(     enablePropertyOverrides);
})
,
// === functors[19] ===
(({   imports: $h‍_imports,   liveVar: $h‍_live,   onceVar: $h‍_once,   importMeta: $h‍____meta,  }) => {   let Number,String,TypeError,defineProperty,getOwnPropertyNames,isObject,regexpExec,assert;$h‍_imports([["./commons.js", [["Number", [$h‍_a => (Number = $h‍_a)]],["String", [$h‍_a => (String = $h‍_a)]],["TypeError", [$h‍_a => (TypeError = $h‍_a)]],["defineProperty", [$h‍_a => (defineProperty = $h‍_a)]],["getOwnPropertyNames", [$h‍_a => (getOwnPropertyNames = $h‍_a)]],["isObject", [$h‍_a => (isObject = $h‍_a)]],["regexpExec", [$h‍_a => (regexpExec = $h‍_a)]]]],["./error/assert.js", [["assert", [$h‍_a => (assert = $h‍_a)]]]]]);   










const { Fail, quote: q}=   assert;

const localePattern=  /^(\w*[a-z])Locale([A-Z]\w*)$/;

// Use concise methods to obtain named functions without constructor
// behavior or `.prototype` property.
const tamedMethods=  {
  // See https://tc39.es/ecma262/#sec-string.prototype.localecompare
  localeCompare(arg) {
    if( this===  null||  this===  undefined) {
      throw TypeError(
        'Cannot localeCompare with null or undefined "this" value');

     }
    const s=   `${this}`;
    const that=   `${arg}`;
    if( s<  that) {
      return -1;
     }
    if( s>  that) {
      return 1;
     }
    s===  that||  Fail `expected ${q(s)} and ${q(that)} to compare`;
    return 0;
   },

  toString() {
    return  `${this}`;
   }};


const nonLocaleCompare=  tamedMethods.localeCompare;
const numberToString=  tamedMethods.toString;

function                tameLocaleMethods(intrinsics, localeTaming=  'safe') {
  if( localeTaming!==  'safe'&&  localeTaming!==  'unsafe') {
    throw TypeError( `unrecognized localeTaming ${localeTaming}`);
   }
  if( localeTaming===  'unsafe') {
    return;
   }

  defineProperty(String.prototype, 'localeCompare', {
    value: nonLocaleCompare});


  for( const intrinsicName of getOwnPropertyNames(intrinsics)) {
    const intrinsic=  intrinsics[intrinsicName];
    if( isObject(intrinsic)) {
      for( const methodName of getOwnPropertyNames(intrinsic)) {
        const match=  regexpExec(localePattern, methodName);
        if( match) {
          typeof intrinsic[methodName]===  'function'||
            Fail `expected ${q(methodName)} to be a function`;
          const nonLocaleMethodName=   `${match[1]}${match[2]}`;
          const method=  intrinsic[nonLocaleMethodName];
          typeof method===  'function'||
            Fail `function ${q(nonLocaleMethodName)} not found`;
          defineProperty(intrinsic, methodName, { value: method});
         }
       }
     }
   }

  // Numbers are special because toString accepts a radix instead of ignoring
  // all of the arguments that we would otherwise forward.
  defineProperty(Number.prototype, 'toLocaleString', {
    value: numberToString});

 }$h‍_once.default(     tameLocaleMethods);
})
,
// === functors[20] ===
(({   imports: $h‍_imports,   liveVar: $h‍_live,   onceVar: $h‍_once,   importMeta: $h‍____meta,  }) => {   $h‍_imports([]);   /**
 * makeEvalFunction()
 * A safe version of the native eval function which relies on
 * the safety of safeEvaluate for confinement.
 *
 * @param {Function} safeEvaluate
 */
const        makeEvalFunction=  (safeEvaluate)=>{
  // We use the the concise method syntax to create an eval without a
  // [[Construct]] behavior (such that the invocation "new eval()" throws
  // TypeError: eval is not a constructor"), but which still accepts a
  // 'this' binding.
  const newEval=  {
    eval(source) {
      if( typeof source!==  'string') {
        // As per the runtime semantic of PerformEval [ECMAScript 18.2.1.1]:
        // If Type(source) is not String, return source.
        // TODO Recent proposals from Mike Samuel may change this non-string
        // rule. Track.
        return source;
       }
      return safeEvaluate(source);
     }}.
    eval;

  return newEval;
 };$h‍_once.makeEvalFunction(makeEvalFunction);
})
,
// === functors[21] ===
(({   imports: $h‍_imports,   liveVar: $h‍_live,   onceVar: $h‍_once,   importMeta: $h‍____meta,  }) => {   let FERAL_FUNCTION,arrayJoin,arrayPop,defineProperties,getPrototypeOf,assert;$h‍_imports([["./commons.js", [["FERAL_FUNCTION", [$h‍_a => (FERAL_FUNCTION = $h‍_a)]],["arrayJoin", [$h‍_a => (arrayJoin = $h‍_a)]],["arrayPop", [$h‍_a => (arrayPop = $h‍_a)]],["defineProperties", [$h‍_a => (defineProperties = $h‍_a)]],["getPrototypeOf", [$h‍_a => (getPrototypeOf = $h‍_a)]]]],["./error/assert.js", [["assert", [$h‍_a => (assert = $h‍_a)]]]]]);   








const { Fail}=   assert;

/*
 * makeFunctionConstructor()
 * A safe version of the native Function which relies on
 * the safety of safeEvaluate for confinement.
 */
const        makeFunctionConstructor=  (safeEvaluate)=>{
  // Define an unused parameter to ensure Function.length === 1
  const newFunction=  function Function(_body) {
    // Sanitize all parameters at the entry point.
    // eslint-disable-next-line prefer-rest-params
    const bodyText=   `${arrayPop(arguments)|| '' }`;
    // eslint-disable-next-line prefer-rest-params
    const parameters=   `${arrayJoin(arguments,',') }`;

    // Are parameters and bodyText valid code, or is someone
    // attempting an injection attack? This will throw a SyntaxError if:
    // - parameters doesn't parse as parameters
    // - bodyText doesn't parse as a function body
    // - either contain a call to super() or references a super property.
    //
    // It seems that XS may still be vulnerable to the attack explained at
    // https://github.com/tc39/ecma262/pull/2374#issuecomment-813769710
    // where `new Function('/*', '*/ ) {')` would incorrectly validate.
    // Before we worried about this, we check the parameters and bodyText
    // together in one call
    // ```js
    // new FERAL_FUNCTION(parameters, bodyTest);
    // ```
    // However, this check is vulnerable to that bug. Aside from that case,
    // all engines do seem to validate the parameters, taken by themselves,
    // correctly. And all engines do seem to validate the bodyText, taken
    // by itself correctly. So with the following two checks, SES builds a
    // correct safe `Function` constructor by composing two calls to an
    // original unsafe `Function` constructor that may suffer from this bug
    // but is otherwise correctly validating.
    //
    // eslint-disable-next-line no-new
    new FERAL_FUNCTION(parameters, '');
    // eslint-disable-next-line no-new
    new FERAL_FUNCTION(bodyText);

    // Safe to be combined. Defeat potential trailing comments.
    // TODO: since we create an anonymous function, the 'this' value
    // isn't bound to the global object as per specs, but set as undefined.
    const src=   `(function anonymous(${parameters}\n) {\n${bodyText}\n})`;
    return safeEvaluate(src);
   };

  defineProperties(newFunction, {
    // Ensure that any function created in any evaluator in a realm is an
    // instance of Function in any evaluator of the same realm.
    prototype: {
      value: FERAL_FUNCTION.prototype,
      writable: false,
      enumerable: false,
      configurable: false}});



  // Assert identity of Function.__proto__ accross all compartments
  getPrototypeOf(FERAL_FUNCTION)===  FERAL_FUNCTION.prototype||
    Fail `Function prototype is the same accross compartments`;
  getPrototypeOf(newFunction)===  FERAL_FUNCTION.prototype||
    Fail `Function constructor prototype is the same accross compartments`;

  return newFunction;
 };$h‍_once.makeFunctionConstructor(makeFunctionConstructor);
})
,
// === functors[22] ===
(({   imports: $h‍_imports,   liveVar: $h‍_live,   onceVar: $h‍_once,   importMeta: $h‍____meta,  }) => {   let TypeError,assign,create,defineProperty,entries,freeze,objectHasOwnProperty,unscopablesSymbol,makeEvalFunction,makeFunctionConstructor,constantProperties,universalPropertyNames;$h‍_imports([["./commons.js", [["TypeError", [$h‍_a => (TypeError = $h‍_a)]],["assign", [$h‍_a => (assign = $h‍_a)]],["create", [$h‍_a => (create = $h‍_a)]],["defineProperty", [$h‍_a => (defineProperty = $h‍_a)]],["entries", [$h‍_a => (entries = $h‍_a)]],["freeze", [$h‍_a => (freeze = $h‍_a)]],["objectHasOwnProperty", [$h‍_a => (objectHasOwnProperty = $h‍_a)]],["unscopablesSymbol", [$h‍_a => (unscopablesSymbol = $h‍_a)]]]],["./make-eval-function.js", [["makeEvalFunction", [$h‍_a => (makeEvalFunction = $h‍_a)]]]],["./make-function-constructor.js", [["makeFunctionConstructor", [$h‍_a => (makeFunctionConstructor = $h‍_a)]]]],["./permits.js", [["constantProperties", [$h‍_a => (constantProperties = $h‍_a)]],["universalPropertyNames", [$h‍_a => (universalPropertyNames = $h‍_a)]]]]]);   













/**
 * The host's ordinary global object is not provided by a `with` block, so
 * assigning to Symbol.unscopables has no effect.
 * Since this shim uses `with` blocks to create a confined lexical scope for
 * guest programs, we cannot emulate the proper behavior.
 * With this shim, assigning Symbol.unscopables causes the given lexical
 * names to fall through to the terminal scope proxy.
 * But, we can install this setter to prevent a program from proceding on
 * this false assumption.
 *
 * @param {object} globalObject
 */
const        setGlobalObjectSymbolUnscopables=  (globalObject)=>{
  defineProperty(
    globalObject,
    unscopablesSymbol,
    freeze(
      assign(create(null), {
        set: freeze(()=>  {
          throw TypeError(
             `Cannot set Symbol.unscopables of a Compartment's globalThis`);

         }),
        enumerable: false,
        configurable: false})));



 };

/**
 * setGlobalObjectConstantProperties()
 * Initializes a new global object using a process similar to ECMA specifications
 * (SetDefaultGlobalBindings). This process is split between this function and
 * `setGlobalObjectMutableProperties`.
 *
 * @param {object} globalObject
 */$h‍_once.setGlobalObjectSymbolUnscopables(setGlobalObjectSymbolUnscopables);
const        setGlobalObjectConstantProperties=  (globalObject)=>{
  for( const [name, constant]of  entries(constantProperties)) {
    defineProperty(globalObject, name, {
      value: constant,
      writable: false,
      enumerable: false,
      configurable: false});

   }
 };

/**
 * setGlobalObjectMutableProperties()
 * Create new global object using a process similar to ECMA specifications
 * (portions of SetRealmGlobalObject and SetDefaultGlobalBindings).
 * `newGlobalPropertyNames` should be either `initialGlobalPropertyNames` or
 * `sharedGlobalPropertyNames`.
 *
 * @param {object} globalObject
 * @param {object} param1
 * @param {object} param1.intrinsics
 * @param {object} param1.newGlobalPropertyNames
 * @param {Function} param1.makeCompartmentConstructor
 * @param {(object) => void} param1.markVirtualizedNativeFunction
 */$h‍_once.setGlobalObjectConstantProperties(setGlobalObjectConstantProperties);
const        setGlobalObjectMutableProperties=  (
  globalObject,
  {
    intrinsics,
    newGlobalPropertyNames,
    makeCompartmentConstructor,
    markVirtualizedNativeFunction})=>

     {
  for( const [name, intrinsicName]of  entries(universalPropertyNames)) {
    if( objectHasOwnProperty(intrinsics, intrinsicName)) {
      defineProperty(globalObject, name, {
        value: intrinsics[intrinsicName],
        writable: true,
        enumerable: false,
        configurable: true});

     }
   }

  for( const [name, intrinsicName]of  entries(newGlobalPropertyNames)) {
    if( objectHasOwnProperty(intrinsics, intrinsicName)) {
      defineProperty(globalObject, name, {
        value: intrinsics[intrinsicName],
        writable: true,
        enumerable: false,
        configurable: true});

     }
   }

  const perCompartmentGlobals=  {
    globalThis: globalObject};


  perCompartmentGlobals.Compartment=  makeCompartmentConstructor(
    makeCompartmentConstructor,
    intrinsics,
    markVirtualizedNativeFunction);


  // TODO These should still be tamed according to the whitelist before
  // being made available.
  for( const [name, value]of  entries(perCompartmentGlobals)) {
    defineProperty(globalObject, name, {
      value,
      writable: true,
      enumerable: false,
      configurable: true});

    if( typeof value===  'function') {
      markVirtualizedNativeFunction(value);
     }
   }
 };

/**
 * setGlobalObjectEvaluators()
 * Set the eval and the Function evaluator on the global object with given evalTaming policy.
 *
 * @param {object} globalObject
 * @param {Function} evaluator
 * @param {(object) => void} markVirtualizedNativeFunction
 */$h‍_once.setGlobalObjectMutableProperties(setGlobalObjectMutableProperties);
const        setGlobalObjectEvaluators=  (
  globalObject,
  evaluator,
  markVirtualizedNativeFunction)=>
     {
  {
    const f=  makeEvalFunction(evaluator);
    markVirtualizedNativeFunction(f);
    defineProperty(globalObject, 'eval', {
      value: f,
      writable: true,
      enumerable: false,
      configurable: true});

   }
  {
    const f=  makeFunctionConstructor(evaluator);
    markVirtualizedNativeFunction(f);
    defineProperty(globalObject, 'Function', {
      value: f,
      writable: true,
      enumerable: false,
      configurable: true});

   }
 };$h‍_once.setGlobalObjectEvaluators(setGlobalObjectEvaluators);
})
,
// === functors[23] ===
(({   imports: $h‍_imports,   liveVar: $h‍_live,   onceVar: $h‍_once,   importMeta: $h‍____meta,  }) => {   let Proxy,String,TypeError,ReferenceError,create,freeze,getOwnPropertyDescriptors,globalThis,immutableObject,assert;$h‍_imports([["./commons.js", [["Proxy", [$h‍_a => (Proxy = $h‍_a)]],["String", [$h‍_a => (String = $h‍_a)]],["TypeError", [$h‍_a => (TypeError = $h‍_a)]],["ReferenceError", [$h‍_a => (ReferenceError = $h‍_a)]],["create", [$h‍_a => (create = $h‍_a)]],["freeze", [$h‍_a => (freeze = $h‍_a)]],["getOwnPropertyDescriptors", [$h‍_a => (getOwnPropertyDescriptors = $h‍_a)]],["globalThis", [$h‍_a => (globalThis = $h‍_a)]],["immutableObject", [$h‍_a => (immutableObject = $h‍_a)]]]],["./error/assert.js", [["assert", [$h‍_a => (assert = $h‍_a)]]]]]);   












const { Fail, quote: q}=   assert;

/**
 * alwaysThrowHandler
 * This is an object that throws if any property is called. It's used as
 * a proxy handler which throws on any trap called.
 * It's made from a proxy with a get trap that throws. It's safe to
 * create one and share it between all Proxy handlers.
 */
const        alwaysThrowHandler=  new Proxy(
  immutableObject,
  freeze({
    get(_shadow, prop) {
      Fail `Please report unexpected scope handler trap: ${q(String(prop))}`;
     }}));



/*
 * scopeProxyHandlerProperties
 * scopeTerminatorHandler manages a strictScopeTerminator Proxy which serves as
 * the final scope boundary that will always return "undefined" in order
 * to prevent access to "start compartment globals".
 */$h‍_once.alwaysThrowHandler(alwaysThrowHandler);
const scopeProxyHandlerProperties=  {
  get(_shadow, _prop) {
    return undefined;
   },

  set(_shadow, prop, _value) {
    // We should only hit this if the has() hook returned true matches the v8
    // ReferenceError message "Uncaught ReferenceError: xyz is not defined"
    throw ReferenceError( `${String(prop)} is not defined`);
   },

  has(_shadow, prop) {
    // we must at least return true for all properties on the realm globalThis
    return prop in globalThis;
   },

  // note: this is likely a bug of safari
  // https://bugs.webkit.org/show_bug.cgi?id=195534
  getPrototypeOf(_shadow) {
    return null;
   },

  // See https://github.com/endojs/endo/issues/1510
  // TODO: report as bug to v8 or Chrome, and record issue link here.
  getOwnPropertyDescriptor(_shadow, prop) {
    // Coerce with `String` in case prop is a symbol.
    const quotedProp=  q(String(prop));
    // eslint-disable-next-line @endo/no-polymorphic-call
    console.warn(
       `getOwnPropertyDescriptor trap on scopeTerminatorHandler for ${quotedProp}`,
      TypeError().stack);

    return undefined;
   },

  // See https://github.com/endojs/endo/issues/1490
  // TODO Report bug to JSC or Safari
  ownKeys(_shadow) {
    return [];
   }};


// The scope handler's prototype is a proxy that throws if any trap other
// than get/set/has are run (like getOwnPropertyDescriptors, apply,
// getPrototypeOf).
const        strictScopeTerminatorHandler=  freeze(
  create(
    alwaysThrowHandler,
    getOwnPropertyDescriptors(scopeProxyHandlerProperties)));$h‍_once.strictScopeTerminatorHandler(strictScopeTerminatorHandler);



const        strictScopeTerminator=  new Proxy(
  immutableObject,
  strictScopeTerminatorHandler);$h‍_once.strictScopeTerminator(strictScopeTerminator);
})
,
// === functors[24] ===
(({   imports: $h‍_imports,   liveVar: $h‍_live,   onceVar: $h‍_once,   importMeta: $h‍____meta,  }) => {   let Proxy,create,freeze,getOwnPropertyDescriptors,immutableObject,reflectSet,strictScopeTerminatorHandler,alwaysThrowHandler;$h‍_imports([["./commons.js", [["Proxy", [$h‍_a => (Proxy = $h‍_a)]],["create", [$h‍_a => (create = $h‍_a)]],["freeze", [$h‍_a => (freeze = $h‍_a)]],["getOwnPropertyDescriptors", [$h‍_a => (getOwnPropertyDescriptors = $h‍_a)]],["immutableObject", [$h‍_a => (immutableObject = $h‍_a)]],["reflectSet", [$h‍_a => (reflectSet = $h‍_a)]]]],["./strict-scope-terminator.js", [["strictScopeTerminatorHandler", [$h‍_a => (strictScopeTerminatorHandler = $h‍_a)]],["alwaysThrowHandler", [$h‍_a => (alwaysThrowHandler = $h‍_a)]]]]]);   












/*
 * createSloppyGlobalsScopeTerminator()
 * strictScopeTerminatorHandler manages a scopeTerminator Proxy which serves as
 * the final scope boundary that will always return "undefined" in order
 * to prevent access to "start compartment globals". When "sloppyGlobalsMode"
 * is true, the Proxy will perform sets on the "globalObject".
 */
const        createSloppyGlobalsScopeTerminator=  (globalObject)=>{
  const scopeProxyHandlerProperties=  {
    // inherit scopeTerminator behavior
    ...strictScopeTerminatorHandler,

    // Redirect set properties to the globalObject.
    set(_shadow, prop, value) {
      return reflectSet(globalObject, prop, value);
     },

    // Always claim to have a potential property in order to be the recipient of a set
    has(_shadow, _prop) {
      return true;
     }};


  // The scope handler's prototype is a proxy that throws if any trap other
  // than get/set/has are run (like getOwnPropertyDescriptors, apply,
  // getPrototypeOf).
  const sloppyGlobalsScopeTerminatorHandler=  freeze(
    create(
      alwaysThrowHandler,
      getOwnPropertyDescriptors(scopeProxyHandlerProperties)));



  const sloppyGlobalsScopeTerminator=  new Proxy(
    immutableObject,
    sloppyGlobalsScopeTerminatorHandler);


  return sloppyGlobalsScopeTerminator;
 };$h‍_once.createSloppyGlobalsScopeTerminator(createSloppyGlobalsScopeTerminator);
freeze(createSloppyGlobalsScopeTerminator);
})
,
// === functors[25] ===
(({   imports: $h‍_imports,   liveVar: $h‍_live,   onceVar: $h‍_once,   importMeta: $h‍____meta,  }) => {   let FERAL_EVAL,create,defineProperties,freeze,assert;$h‍_imports([["./commons.js", [["FERAL_EVAL", [$h‍_a => (FERAL_EVAL = $h‍_a)]],["create", [$h‍_a => (create = $h‍_a)]],["defineProperties", [$h‍_a => (defineProperties = $h‍_a)]],["freeze", [$h‍_a => (freeze = $h‍_a)]]]],["./error/assert.js", [["assert", [$h‍_a => (assert = $h‍_a)]]]]]);   



const { Fail}=   assert;

// We attempt to frustrate stack bumping attacks on the safe evaluator
// (`make-safe-evaluator.js`).
// A stack bumping attack forces an API call to throw a stack overflow
// `RangeError` at an inopportune time.
// The attacker arranges for the stack to be sufficiently deep that the API
// consumes exactly enough stack frames to throw an exception.
//
// For the safe evaluator, an exception thrown between adding and then deleting
// `eval` on `evalScope` could leak the real `eval` to an attacker's lexical
// scope.
// This would be sufficiently disastrous that we guard against it twice.
// First, we delete `eval` from `evalScope` immediately before rendering it to
// the guest program's lexical scope.
//
// If the attacker manages to arrange for `eval` to throw an exception after we
// call `allowNextEvalToBeUnsafe` but before the guest program accesses `eval`,
// it would be able to access `eval` once more in its own code.
// Although they could do no harm with a direct `eval`, they would be able to
// escape to the true global scope with an indirect `eval`.
//
//   prepareStack(depth, () => {
//     (eval)('');
//   });
//   const unsafeEval = (eval);
//   const safeEval = (eval);
//   const realGlobal = unsafeEval('globalThis');
//
// To protect against that case, we also delete `eval` from the `evalScope` in
// a `finally` block surrounding the call to the safe evaluator.
// The only way to reach this case is if `eval` remains on `evalScope` due to
// an attack, so we assume that attack would have have invalided our isolation
// and revoke all future access to the evaluator.
//
// To defeat a stack bumping attack, we must use fewer stack frames to recover
// in that `finally` block than we used in the `try` block.
// We have no reliable guarantees about how many stack frames a block of
// JavaScript will consume.
// Function inlining, tail-call optimization, variations in the size of a stack
// frame, and block scopes may affect the depth of the stack.
// The only number of acceptable stack frames to use in the finally block is
// zero.
// We only use property assignment and deletion in the safe evaluator's
// `finally` block.
// We use `delete evalScope.eval` to withhold the evaluator.
// We assign an envelope object over `evalScopeKit.revoked` to revoke the
// evaluator.
//
// This is why we supply a meaningfully named function for
// `allowNextEvalToBeUnsafe` but do not provide a corresponding
// `revokeAccessToUnsafeEval` or even simply `revoke`.
// These recovery routines are expressed inline in the safe evaluator.

const        makeEvalScopeKit=  ()=>  {
  const evalScope=  create(null);
  const oneTimeEvalProperties=  freeze({
    eval: {
      get() {
        delete evalScope.eval;
        return FERAL_EVAL;
       },
      enumerable: false,
      configurable: true}});



  const evalScopeKit=  {
    evalScope,
    allowNextEvalToBeUnsafe() {
      const { revoked}=   evalScopeKit;
      if( revoked!==  null) {
        Fail `a handler did not reset allowNextEvalToBeUnsafe ${revoked.err}`;
       }
      // Allow next reference to eval produce the unsafe FERAL_EVAL.
      // We avoid defineProperty because it consumes an extra stack frame taming
      // its return value.
      defineProperties(evalScope, oneTimeEvalProperties);
     },
    /** @type {null | { err: any }} */
    revoked: null};


  return evalScopeKit;
 };$h‍_once.makeEvalScopeKit(makeEvalScopeKit);
})
,
// === functors[26] ===
(({   imports: $h‍_imports,   liveVar: $h‍_live,   onceVar: $h‍_once,   importMeta: $h‍____meta,  }) => {   let FERAL_REG_EXP,regexpExec,stringSlice;$h‍_imports([["./commons.js", [["FERAL_REG_EXP", [$h‍_a => (FERAL_REG_EXP = $h‍_a)]],["regexpExec", [$h‍_a => (regexpExec = $h‍_a)]],["stringSlice", [$h‍_a => (stringSlice = $h‍_a)]]]]]);   

// Captures a key and value of the form #key=value or @key=value
const sourceMetaEntryRegExp=
  '\\s*[@#]\\s*([a-zA-Z][a-zA-Z0-9]*)\\s*=\\s*([^\\s\\*]*)';
// Captures either a one-line or multi-line comment containing
// one #key=value or @key=value.
// Produces two pairs of capture groups, but the initial two may be undefined.
// On account of the mechanics of regular expressions, scanning from the end
// does not allow us to capture every pair, so getSourceURL must capture and
// trim until there are no matching comments.
const sourceMetaEntriesRegExp=  new FERAL_REG_EXP(
   `(?:\\s*//${sourceMetaEntryRegExp}|/\\*${sourceMetaEntryRegExp}\\s*\\*/)\\s*$`);


/**
 * @param {string} src
 */
const        getSourceURL=  (src)=>{
  let sourceURL=  '<unknown>';

  // Our regular expression matches the last one or two comments with key value
  // pairs at the end of the source, avoiding a scan over the entire length of
  // the string, but at the expense of being able to capture all the (key,
  // value) pair meta comments at the end of the source, which may include
  // sourceMapURL in addition to sourceURL.
  // So, we sublimate the comments out of the source until no source or no
  // comments remain.
  while( src.length>  0) {
    const match=  regexpExec(sourceMetaEntriesRegExp, src);
    if( match===  null) {
      break;
     }
    src=  stringSlice(src, 0, src.length-  match[0].length);

    // We skip $0 since it contains the entire match.
    // The match contains four capture groups,
    // two (key, value) pairs, the first of which
    // may be undefined.
    // On the off-chance someone put two sourceURL comments in their code with
    // different commenting conventions, the latter has precedence.
    if( match[3]===  'sourceURL') {
      sourceURL=  match[4];
     }else if( match[1]===  'sourceURL') {
      sourceURL=  match[2];
     }
   }

  return sourceURL;
 };$h‍_once.getSourceURL(getSourceURL);
})
,
// === functors[27] ===
(({   imports: $h‍_imports,   liveVar: $h‍_live,   onceVar: $h‍_once,   importMeta: $h‍____meta,  }) => {   let FERAL_REG_EXP,SyntaxError,stringReplace,stringSearch,stringSlice,stringSplit,freeze,getSourceURL;$h‍_imports([["./commons.js", [["FERAL_REG_EXP", [$h‍_a => (FERAL_REG_EXP = $h‍_a)]],["SyntaxError", [$h‍_a => (SyntaxError = $h‍_a)]],["stringReplace", [$h‍_a => (stringReplace = $h‍_a)]],["stringSearch", [$h‍_a => (stringSearch = $h‍_a)]],["stringSlice", [$h‍_a => (stringSlice = $h‍_a)]],["stringSplit", [$h‍_a => (stringSplit = $h‍_a)]],["freeze", [$h‍_a => (freeze = $h‍_a)]]]],["./get-source-url.js", [["getSourceURL", [$h‍_a => (getSourceURL = $h‍_a)]]]]]);   












/**
 * Find the first occurence of the given pattern and return
 * the location as the approximate line number.
 *
 * @param {string} src
 * @param {RegExp} pattern
 * @returns {number}
 */
function getLineNumber(src, pattern) {
  const index=  stringSearch(src, pattern);
  if( index<  0) {
    return -1;
   }

  // The importPattern incidentally captures an initial \n in
  // an attempt to reject a . prefix, so we need to offset
  // the line number in that case.
  const adjustment=  src[index]===  '\n'?  1:  0;

  return stringSplit(stringSlice(src, 0, index), '\n').length+  adjustment;
 }

// /////////////////////////////////////////////////////////////////////////////

const htmlCommentPattern=  new FERAL_REG_EXP( `(?:${'<'}!--|--${'>'})`,'g');

/**
 * Conservatively reject the source text if it may contain text that some
 * JavaScript parsers may treat as an html-like comment. To reject without
 * parsing, `rejectHtmlComments` will also reject some other text as well.
 *
 * https://www.ecma-international.org/ecma-262/9.0/index.html#sec-html-like-comments
 * explains that JavaScript parsers may or may not recognize html
 * comment tokens "<" immediately followed by "!--" and "--"
 * immediately followed by ">" in non-module source text, and treat
 * them as a kind of line comment. Since otherwise both of these can
 * appear in normal JavaScript source code as a sequence of operators,
 * we have the terrifying possibility of the same source code parsing
 * one way on one correct JavaScript implementation, and another way
 * on another.
 *
 * This shim takes the conservative strategy of just rejecting source
 * text that contains these strings anywhere. Note that this very
 * source file is written strangely to avoid mentioning these
 * character strings explicitly.
 *
 * We do not write the regexp in a straightforward way, so that an
 * apparennt html comment does not appear in this file. Thus, we avoid
 * rejection by the overly eager rejectDangerousSources.
 *
 * @param {string} src
 * @returns {string}
 */
const        rejectHtmlComments=  (src)=>{
  const lineNumber=  getLineNumber(src, htmlCommentPattern);
  if( lineNumber<  0) {
    return src;
   }
  const name=  getSourceURL(src);
  // See https://github.com/endojs/endo/blob/master/packages/ses/error-codes/SES_HTML_COMMENT_REJECTED.md
  throw SyntaxError(
     `Possible HTML comment rejected at ${name}:${lineNumber}. (SES_HTML_COMMENT_REJECTED)`);

 };

/**
 * An optional transform to place ahead of `rejectHtmlComments` to evade *that*
 * rejection. However, it may change the meaning of the program.
 *
 * This evasion replaces each alleged html comment with the space-separated
 * JavaScript operator sequence that it may mean, assuming that it appears
 * outside of a comment or literal string, in source code where the JS
 * parser makes no special case for html comments (like module source code).
 * In that case, this evasion preserves the meaning of the program, though it
 * does change the souce column numbers on each effected line.
 *
 * If the html comment appeared in a literal (a string literal, regexp literal,
 * or a template literal), then this evasion will change the meaning of the
 * program by changing the text of that literal.
 *
 * If the html comment appeared in a JavaScript comment, then this evasion does
 * not change the meaning of the program because it only changes the contents of
 * those comments.
 *
 * @param {string} src
 * @returns {string}
 */$h‍_once.rejectHtmlComments(rejectHtmlComments);
const        evadeHtmlCommentTest=  (src)=>{
  const replaceFn=  (match)=> match[0]===  '<'?  '< ! --':  '-- >';
  return stringReplace(src, htmlCommentPattern, replaceFn);
 };

// /////////////////////////////////////////////////////////////////////////////
$h‍_once.evadeHtmlCommentTest(evadeHtmlCommentTest);
const importPattern=  new FERAL_REG_EXP(
  '(^|[^.]|\\.\\.\\.)\\bimport(\\s*(?:\\(|/[/*]))',
  'g');


/**
 * Conservatively reject the source text if it may contain a dynamic
 * import expression. To reject without parsing, `rejectImportExpressions` will
 * also reject some other text as well.
 *
 * The proposed dynamic import expression is the only syntax currently
 * proposed, that can appear in non-module JavaScript code, that
 * enables direct access to the outside world that cannot be
 * suppressed or intercepted without parsing and rewriting. Instead,
 * this shim conservatively rejects any source text that seems to
 * contain such an expression. To do this safely without parsing, we
 * must also reject some valid programs, i.e., those containing
 * apparent import expressions in literal strings or comments.
 *
 * The current conservative rule looks for the identifier "import"
 * followed by either an open paren or something that looks like the
 * beginning of a comment. We assume that we do not need to worry
 * about html comment syntax because that was already rejected by
 * rejectHtmlComments.
 *
 * this \s *must* match all kinds of syntax-defined whitespace. If e.g.
 * U+2028 (LINE SEPARATOR) or U+2029 (PARAGRAPH SEPARATOR) is treated as
 * whitespace by the parser, but not matched by /\s/, then this would admit
 * an attack like: import\u2028('power.js') . We're trying to distinguish
 * something like that from something like importnotreally('power.js') which
 * is perfectly safe.
 *
 * @param {string} src
 * @returns {string}
 */
const        rejectImportExpressions=  (src)=>{
  const lineNumber=  getLineNumber(src, importPattern);
  if( lineNumber<  0) {
    return src;
   }
  const name=  getSourceURL(src);
  // See https://github.com/endojs/endo/blob/master/packages/ses/error-codes/SES_IMPORT_REJECTED.md
  throw SyntaxError(
     `Possible import expression rejected at ${name}:${lineNumber}. (SES_IMPORT_REJECTED)`);

 };

/**
 * An optional transform to place ahead of `rejectImportExpressions` to evade
 * *that* rejection. However, it may change the meaning of the program.
 *
 * This evasion replaces each suspicious `import` identifier with `__import__`.
 * If the alleged import expression appears in a JavaScript comment, this
 * evasion will not change the meaning of the program. If it appears in a
 * literal (string literal, regexp literal, or a template literal), then this
 * evasion will change the contents of that literal. If it appears as code
 * where it would be parsed as an expression, then it might or might not change
 * the meaning of the program, depending on the binding, if any, of the lexical
 * variable `__import__`.
 *
 * @param {string} src
 * @returns {string}
 */$h‍_once.rejectImportExpressions(rejectImportExpressions);
const        evadeImportExpressionTest=  (src)=>{
  const replaceFn=  (_, p1, p2)=>   `${p1}__import__${p2}`;
  return stringReplace(src, importPattern, replaceFn);
 };

// /////////////////////////////////////////////////////////////////////////////
$h‍_once.evadeImportExpressionTest(evadeImportExpressionTest);
const someDirectEvalPattern=  new FERAL_REG_EXP(
  '(^|[^.])\\beval(\\s*\\()',
  'g');


/**
 * Heuristically reject some text that seems to contain a direct eval
 * expression, with both false positives and false negavives. To reject without
 * parsing, `rejectSomeDirectEvalExpressions` may will also reject some other
 * text as well. It may also accept source text that contains a direct eval
 * written oddly, such as `(eval)(src)`. This false negative is not a security
 * vulnerability. Rather it is a compat hazard because it will execute as
 * an indirect eval under the SES-shim but as a direct eval on platforms that
 * support SES directly (like XS).
 *
 * The shim cannot correctly emulate a direct eval as explained at
 * https://github.com/Agoric/realms-shim/issues/12
 * If we did not reject direct eval syntax, we would
 * accidentally evaluate these with an emulation of indirect eval. To
 * prevent future compatibility problems, in shifting from use of the
 * shim to genuine platform support for the proposal, we should
 * instead statically reject code that seems to contain a direct eval
 * expression.
 *
 * As with the dynamic import expression, to avoid a full parse, we do
 * this approximately with a regexp, that will also reject strings
 * that appear safely in comments or strings. Unlike dynamic import,
 * if we miss some, this only creates future compat problems, not
 * security problems. Thus, we are only trying to catch innocent
 * occurrences, not malicious one. In particular, `(eval)(...)` is
 * direct eval syntax that would not be caught by the following regexp.
 *
 * Exported for unit tests.
 *
 * @param {string} src
 * @returns {string}
 */
const        rejectSomeDirectEvalExpressions=  (src)=>{
  const lineNumber=  getLineNumber(src, someDirectEvalPattern);
  if( lineNumber<  0) {
    return src;
   }
  const name=  getSourceURL(src);
  // See https://github.com/endojs/endo/blob/master/packages/ses/error-codes/SES_EVAL_REJECTED.md
  throw SyntaxError(
     `Possible direct eval expression rejected at ${name}:${lineNumber}. (SES_EVAL_REJECTED)`);

 };

// /////////////////////////////////////////////////////////////////////////////

/**
 * A transform that bundles together the transforms that must unconditionally
 * happen last in order to ensure safe evaluation without parsing.
 *
 * @param {string} source
 * @returns {string}
 */$h‍_once.rejectSomeDirectEvalExpressions(rejectSomeDirectEvalExpressions);
const        mandatoryTransforms=  (source)=>{
  source=  rejectHtmlComments(source);
  source=  rejectImportExpressions(source);
  return source;
 };

/**
 * Starting with `source`, apply each transform to the result of the
 * previous one, returning the result of the last transformation.
 *
 * @param {string} source
 * @param {((str: string) => string)[]} transforms
 * @returns {string}
 */$h‍_once.mandatoryTransforms(mandatoryTransforms);
const        applyTransforms=  (source, transforms)=>  {
  for( const transform of transforms) {
    source=  transform(source);
   }
  return source;
 };

// export all as a frozen object
$h‍_once.applyTransforms(applyTransforms);const transforms=freeze({
  rejectHtmlComments: freeze(rejectHtmlComments),
  evadeHtmlCommentTest: freeze(evadeHtmlCommentTest),
  rejectImportExpressions: freeze(rejectImportExpressions),
  evadeImportExpressionTest: freeze(evadeImportExpressionTest),
  rejectSomeDirectEvalExpressions: freeze(rejectSomeDirectEvalExpressions),
  mandatoryTransforms: freeze(mandatoryTransforms),
  applyTransforms: freeze(applyTransforms)});$h‍_once.transforms(transforms);
})
,
// === functors[28] ===
(({   imports: $h‍_imports,   liveVar: $h‍_live,   onceVar: $h‍_once,   importMeta: $h‍____meta,  }) => {   let arrayFilter,arrayIncludes,getOwnPropertyDescriptor,getOwnPropertyNames,objectHasOwnProperty,regexpTest;$h‍_imports([["./commons.js", [["arrayFilter", [$h‍_a => (arrayFilter = $h‍_a)]],["arrayIncludes", [$h‍_a => (arrayIncludes = $h‍_a)]],["getOwnPropertyDescriptor", [$h‍_a => (getOwnPropertyDescriptor = $h‍_a)]],["getOwnPropertyNames", [$h‍_a => (getOwnPropertyNames = $h‍_a)]],["objectHasOwnProperty", [$h‍_a => (objectHasOwnProperty = $h‍_a)]],["regexpTest", [$h‍_a => (regexpTest = $h‍_a)]]]]]);   








/**
 * keywords
 * In JavaScript you cannot use these reserved words as variables.
 * See 11.6.1 Identifier Names
 */
const keywords=  [
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
  'arguments'];


/**
 * identifierPattern
 * Simplified validation of identifier names: may only contain alphanumeric
 * characters (or "$" or "_"), and may not start with a digit. This is safe
 * and does not reduces the compatibility of the shim. The motivation for
 * this limitation was to decrease the complexity of the implementation,
 * and to maintain a resonable level of performance.
 * Note: \w is equivalent [a-zA-Z_0-9]
 * See 11.6.1 Identifier Names
 */
const identifierPattern=  /^[a-zA-Z_$][\w$]*$/;

/**
 * isValidIdentifierName()
 * What variable names might it bring into scope? These include all
 * property names which can be variable names, including the names
 * of inherited properties. It excludes symbols and names which are
 * keywords. We drop symbols safely. Currently, this shim refuses
 * service if any of the names are keywords or keyword-like. This is
 * safe and only prevent performance optimization.
 *
 * @param {string} name
 */
const        isValidIdentifierName=  (name)=>{
  // Ensure we have a valid identifier. We use regexpTest rather than
  // /../.test() to guard against the case where RegExp has been poisoned.
  return(
    name!==  'eval'&&
    !arrayIncludes(keywords, name)&&
    regexpTest(identifierPattern, name));

 };

/*
 * isImmutableDataProperty
 */$h‍_once.isValidIdentifierName(isValidIdentifierName);

function isImmutableDataProperty(obj, name) {
  const desc=  getOwnPropertyDescriptor(obj, name);
  return(
    desc&&
    //
    // The getters will not have .writable, don't let the falsyness of
    // 'undefined' trick us: test with === false, not ! . However descriptors
    // inherit from the (potentially poisoned) global object, so we might see
    // extra properties which weren't really there. Accessor properties have
    // 'get/set/enumerable/configurable', while data properties have
    // 'value/writable/enumerable/configurable'.
    desc.configurable===  false&&
    desc.writable===  false&&
    //
    // Checks for data properties because they're the only ones we can
    // optimize (accessors are most likely non-constant). Descriptors can't
    // can't have accessors and value properties at the same time, therefore
    // this check is sufficient. Using explicit own property deal with the
    // case where Object.prototype has been poisoned.
    objectHasOwnProperty(desc, 'value'));

 }

/**
 * getScopeConstants()
 * What variable names might it bring into scope? These include all
 * property names which can be variable names, including the names
 * of inherited properties. It excludes symbols and names which are
 * keywords. We drop symbols safely. Currently, this shim refuses
 * service if any of the names are keywords or keyword-like. This is
 * safe and only prevent performance optimization.
 *
 * @param {object} globalObject
 * @param {object} moduleLexicals
 */
const        getScopeConstants=  (globalObject, moduleLexicals=  {})=>  {
  // getOwnPropertyNames() does ignore Symbols so we don't need to
  // filter them out.
  const globalObjectNames=  getOwnPropertyNames(globalObject);
  const moduleLexicalNames=  getOwnPropertyNames(moduleLexicals);

  // Collect all valid & immutable identifiers from the endowments.
  const moduleLexicalConstants=  arrayFilter(
    moduleLexicalNames,
    (name)=>
      isValidIdentifierName(name)&&
      isImmutableDataProperty(moduleLexicals, name));


  // Collect all valid & immutable identifiers from the global that
  // are also not present in the endowments (immutable or not).
  const globalObjectConstants=  arrayFilter(
    globalObjectNames,
    (name)=>
      // Can't define a constant: it would prevent a
      // lookup on the endowments.
      !arrayIncludes(moduleLexicalNames, name)&&
      isValidIdentifierName(name)&&
      isImmutableDataProperty(globalObject, name));


  return {
    globalObjectConstants,
    moduleLexicalConstants};

 };$h‍_once.getScopeConstants(getScopeConstants);
})
,
// === functors[29] ===
(({   imports: $h‍_imports,   liveVar: $h‍_live,   onceVar: $h‍_once,   importMeta: $h‍____meta,  }) => {   let FERAL_FUNCTION,arrayJoin,apply,getScopeConstants;$h‍_imports([["./commons.js", [["FERAL_FUNCTION", [$h‍_a => (FERAL_FUNCTION = $h‍_a)]],["arrayJoin", [$h‍_a => (arrayJoin = $h‍_a)]],["apply", [$h‍_a => (apply = $h‍_a)]]]],["./scope-constants.js", [["getScopeConstants", [$h‍_a => (getScopeConstants = $h‍_a)]]]]]);   




/**
 * buildOptimizer()
 * Given an array of identifiers, the optimizer returns a `const` declaration
 * destructuring `this.${name}`.
 *
 * @param {Array<string>} constants
 * @param {string} name
 */
function buildOptimizer(constants, name) {
  // No need to build an optimizer when there are no constants.
  if( constants.length===  0) return '';
  // Use 'this' to avoid going through the scope proxy, which is unnecessary
  // since the optimizer only needs references to the safe global.
  // Destructure the constants from the target scope object.
  return  `const {${arrayJoin(constants,',') }} = this.${name};`;
 }

/**
 * makeEvaluate()
 * Create an 'evaluate' function with the correct optimizer inserted.
 *
 * @param {object} context
 * @param {object} context.evalScope
 * @param {object} context.moduleLexicals
 * @param {object} context.globalObject
 * @param {object} context.scopeTerminator
 */
const        makeEvaluate=  (context)=>{
  const { globalObjectConstants, moduleLexicalConstants}=   getScopeConstants(
    context.globalObject,
    context.moduleLexicals);

  const globalObjectOptimizer=  buildOptimizer(
    globalObjectConstants,
    'globalObject');

  const moduleLexicalOptimizer=  buildOptimizer(
    moduleLexicalConstants,
    'moduleLexicals');


  // Create a function in sloppy mode, so that we can use 'with'. It returns
  // a function in strict mode that evaluates the provided code using direct
  // eval, and thus in strict mode in the same scope. We must be very careful
  // to not create new names in this scope

  // 1: we use multiple nested 'with' to catch all free variable names. The
  // `this` value of the outer sloppy function holds the different scope
  // layers, from inner to outer:
  //    a) `evalScope` which must release the `FERAL_EVAL` as 'eval' once for
  //       every invocation of the inner `evaluate` function in order to
  //       trigger direct eval. The direct eval semantics is what allows the
  //       evaluated code to lookup free variable names on the other scope
  //       objects and not in global scope.
  //    b) `moduleLexicals` which provide a way to introduce free variables
  //       that are not available on the globalObject.
  //    c) `globalObject` is the global scope object of the evaluator, aka the
  //       Compartment's `globalThis`.
  //    d) `scopeTerminator` is a proxy object which prevents free variable
  //       lookups to escape to the start compartment's global object.
  // 2: `optimizer`s catch constant variable names for speed.
  // 3: The inner strict `evaluate` function should be passed two parameters:
  //    a) its arguments[0] is the source to be directly evaluated.
  //    b) its 'this' is the this binding seen by the code being
  //       directly evaluated (the globalObject).

  // Notes:
  // - The `optimizer` strings only lookup values on the `globalObject` and
  //   `moduleLexicals` objects by construct. Keywords like 'function' are
  //   reserved and cannot be used as a variable, so they are excluded from the
  //   optimizer. Furthermore to prevent shadowing 'eval', while a valid
  //   identifier, that name is also explicitly excluded.
  // - when 'eval' is looked up in the `evalScope`, the powerful unsafe eval
  //   intrinsic is returned after automatically removing it from the
  //   `evalScope`. Any further reference to 'eval' in the evaluate string will
  //   get the tamed evaluator from the `globalObject`, if any.

  // TODO https://github.com/endojs/endo/issues/816
  // The optimizer currently runs under sloppy mode, and although we doubt that
  // there is any vulnerability introduced just by running the optimizer
  // sloppy, we are much more confident in the semantics of strict mode.
  // The `evaluate` function can be and is reused across multiple evaluations.
  // Since the optimizer should not be re-evaluated every time, it cannot be
  // inside the `evaluate` closure. While we could potentially nest an
  // intermediate layer of `() => {'use strict'; ${optimizers}; ...`, it
  // doesn't seem worth the overhead and complexity.
  const evaluateFactory=  FERAL_FUNCTION( `
    with (this.scopeTerminator) {
      with (this.globalObject) {
        with (this.moduleLexicals) {
          with (this.evalScope) {
            ${globalObjectOptimizer }
            ${moduleLexicalOptimizer }
            return function() {
              'use strict';
              return eval(arguments[0]);
            };
          }
        }
      }
    }
  `);

  return apply(evaluateFactory, context, []);
 };$h‍_once.makeEvaluate(makeEvaluate);
})
,
// === functors[30] ===
(({   imports: $h‍_imports,   liveVar: $h‍_live,   onceVar: $h‍_once,   importMeta: $h‍____meta,  }) => {   let apply,freeze,strictScopeTerminator,createSloppyGlobalsScopeTerminator,makeEvalScopeKit,applyTransforms,mandatoryTransforms,makeEvaluate,assert;$h‍_imports([["./commons.js", [["apply", [$h‍_a => (apply = $h‍_a)]],["freeze", [$h‍_a => (freeze = $h‍_a)]]]],["./strict-scope-terminator.js", [["strictScopeTerminator", [$h‍_a => (strictScopeTerminator = $h‍_a)]]]],["./sloppy-globals-scope-terminator.js", [["createSloppyGlobalsScopeTerminator", [$h‍_a => (createSloppyGlobalsScopeTerminator = $h‍_a)]]]],["./eval-scope.js", [["makeEvalScopeKit", [$h‍_a => (makeEvalScopeKit = $h‍_a)]]]],["./transforms.js", [["applyTransforms", [$h‍_a => (applyTransforms = $h‍_a)]],["mandatoryTransforms", [$h‍_a => (mandatoryTransforms = $h‍_a)]]]],["./make-evaluate.js", [["makeEvaluate", [$h‍_a => (makeEvaluate = $h‍_a)]]]],["./error/assert.js", [["assert", [$h‍_a => (assert = $h‍_a)]]]]]);   










const { Fail}=   assert;

/**
 * makeSafeEvaluator()
 * Build the low-level operation used by all evaluators:
 * eval(), Function(), Compartment.prototype.evaluate().
 *
 * @param {object} options
 * @param {object} options.globalObject
 * @param {object} [options.moduleLexicals]
 * @param {Array<import('./lockdown.js').Transform>} [options.globalTransforms]
 * @param {boolean} [options.sloppyGlobalsMode]
 */
const        makeSafeEvaluator=  ({
  globalObject,
  moduleLexicals=  {},
  globalTransforms=  [],
  sloppyGlobalsMode=  false})=>
      {
  const scopeTerminator=  sloppyGlobalsMode?
      createSloppyGlobalsScopeTerminator(globalObject):
      strictScopeTerminator;
  const evalScopeKit=  makeEvalScopeKit();
  const { evalScope}=   evalScopeKit;

  const evaluateContext=  freeze({
    evalScope,
    moduleLexicals,
    globalObject,
    scopeTerminator});


  // Defer creating the actual evaluator to first use.
  // Creating a compartment should be possible in no-eval environments
  // It also allows more global constants to be captured by the optimizer
  let evaluate;
  const provideEvaluate=  ()=>  {
    if( !evaluate) {
      evaluate=  makeEvaluate(evaluateContext);
     }
   };

  /**
   * @param {string} source
   * @param {object} [options]
   * @param {Array<import('./lockdown.js').Transform>} [options.localTransforms]
   */
  const safeEvaluate=  (source, options)=>  {
    const { localTransforms=  []}=   options||  {};
    provideEvaluate();

    // Execute the mandatory transforms last to ensure that any rewritten code
    // meets those mandatory requirements.
    source=  applyTransforms(source, [
      ...localTransforms,
      ...globalTransforms,
      mandatoryTransforms]);


    let err;
    try {
      // Allow next reference to eval produce the unsafe FERAL_EVAL.
      // eslint-disable-next-line @endo/no-polymorphic-call
      evalScopeKit.allowNextEvalToBeUnsafe();

      // Ensure that "this" resolves to the safe global.
      return apply(evaluate, globalObject, [source]);
     }catch( e) {
      // stash the child-code error in hopes of debugging the internal failure
      err=  e;
      throw e;
     }finally {
      const unsafeEvalWasStillExposed=( 'eval'in  evalScope);
      delete evalScope.eval;
      if( unsafeEvalWasStillExposed) {
        // Barring a defect in the SES shim, the evalScope should allow the
        // powerful, unsafe  `eval` to be used by `evaluate` exactly once, as the
        // very first name that it attempts to access from the lexical scope.
        // A defect in the SES shim could throw an exception after we set
        // `evalScope.eval` and before `evaluate` calls `eval` internally.
        // If we get here, SES is very broken.
        // This condition is one where this vat is now hopelessly confused, and
        // the vat as a whole should be aborted.
        // No further code should run.
        // All immediately reachable state should be abandoned.
        // However, that is not yet possible, so we at least prevent further
        // variable resolution via the scopeHandler, and throw an error with
        // diagnostic info including the thrown error if any from evaluating the
        // source code.
        evalScopeKit.revoked=  { err};
        // TODO A GOOD PLACE TO PANIC(), i.e., kill the vat incarnation.
        // See https://github.com/Agoric/SES-shim/issues/490
        Fail `handler did not reset allowNextEvalToBeUnsafe ${err}`;
       }
     }
   };

  return { safeEvaluate};
 };$h‍_once.makeSafeEvaluator(makeSafeEvaluator);
})
,
// === functors[31] ===
(({   imports: $h‍_imports,   liveVar: $h‍_live,   onceVar: $h‍_once,   importMeta: $h‍____meta,  }) => {   let WeakSet,defineProperty,freeze,functionPrototype,functionToString,stringEndsWith,weaksetAdd,weaksetHas;$h‍_imports([["./commons.js", [["WeakSet", [$h‍_a => (WeakSet = $h‍_a)]],["defineProperty", [$h‍_a => (defineProperty = $h‍_a)]],["freeze", [$h‍_a => (freeze = $h‍_a)]],["functionPrototype", [$h‍_a => (functionPrototype = $h‍_a)]],["functionToString", [$h‍_a => (functionToString = $h‍_a)]],["stringEndsWith", [$h‍_a => (stringEndsWith = $h‍_a)]],["weaksetAdd", [$h‍_a => (weaksetAdd = $h‍_a)]],["weaksetHas", [$h‍_a => (weaksetHas = $h‍_a)]]]]]);   










const nativeSuffix=  ') { [native code] }';

// Note: Top level mutable state. Does not make anything worse, since the
// patching of `Function.prototype.toString` is also globally stateful. We
// use this top level state so that multiple calls to `tameFunctionToString` are
// idempotent, rather than creating redundant indirections.
let markVirtualizedNativeFunction;

/**
 * Replace `Function.prototype.toString` with one that recognizes
 * shimmed functions as honorary native functions.
 */
const        tameFunctionToString=  ()=>  {
  if( markVirtualizedNativeFunction===  undefined) {
    const virtualizedNativeFunctions=  new WeakSet();

    const tamingMethods=  {
      toString() {
        const str=  functionToString(this);
        if(
          stringEndsWith(str, nativeSuffix)||
          !weaksetHas(virtualizedNativeFunctions, this))
          {
          return str;
         }
        return  `function ${this.name}() { [native code] }`;
       }};


    defineProperty(functionPrototype, 'toString', {
      value: tamingMethods.toString});


    markVirtualizedNativeFunction=  freeze((func)=>
      weaksetAdd(virtualizedNativeFunctions, func));

   }
  return markVirtualizedNativeFunction;
 };$h‍_once.tameFunctionToString(tameFunctionToString);
})
,
// === functors[32] ===
(({   imports: $h‍_imports,   liveVar: $h‍_live,   onceVar: $h‍_once,   importMeta: $h‍____meta,  }) => {   let TypeError,globalThis,getOwnPropertyDescriptor,defineProperty;$h‍_imports([["./commons.js", [["TypeError", [$h‍_a => (TypeError = $h‍_a)]],["globalThis", [$h‍_a => (globalThis = $h‍_a)]],["getOwnPropertyDescriptor", [$h‍_a => (getOwnPropertyDescriptor = $h‍_a)]],["defineProperty", [$h‍_a => (defineProperty = $h‍_a)]]]]]);Object.defineProperty(tameDomains, 'name', {value: "tameDomains"});$h‍_once.tameDomains(tameDomains);   








function        tameDomains(domainTaming=  'safe') {
  if( domainTaming!==  'safe'&&  domainTaming!==  'unsafe') {
    throw TypeError( `unrecognized domainTaming ${domainTaming}`);
   }

  if( domainTaming===  'unsafe') {
    return;
   }

  // Protect against the hazard presented by Node.js domains.
  if( typeof globalThis.process===  'object'&&  globalThis.process!==  null) {
    // Check whether domains were initialized.
    const domainDescriptor=  getOwnPropertyDescriptor(
      globalThis.process,
      'domain');

    if( domainDescriptor!==  undefined&&  domainDescriptor.get!==  undefined) {
      // The domain descriptor on Node.js initially has value: null, which
      // becomes a get, set pair after domains initialize.
      // See https://github.com/endojs/endo/blob/master/packages/ses/error-codes/SES_NO_DOMAINS.md
      throw TypeError(
         `SES failed to lockdown, Node.js domains have been initialized (SES_NO_DOMAINS)`);

     }
    // Prevent domains from initializing.
    // This is clunky because the exception thrown from the domains package does
    // not direct the user's gaze toward a knowledge base about the problem.
    // The domain module merely throws an exception when it attempts to define
    // the domain property of the process global during its initialization.
    // We have no better recourse because Node.js uses defineProperty too.
    defineProperty(globalThis.process, 'domain', {
      value: null,
      configurable: false,
      writable: false,
      enumerable: false});

   }
 }
})
,
// === functors[33] ===
(({   imports: $h‍_imports,   liveVar: $h‍_live,   onceVar: $h‍_once,   importMeta: $h‍____meta,  }) => {   let WeakSet,arrayFilter,arrayMap,arrayPush,defineProperty,freeze,fromEntries,isError,stringEndsWith,weaksetAdd,weaksetHas;$h‍_imports([["../commons.js", [["WeakSet", [$h‍_a => (WeakSet = $h‍_a)]],["arrayFilter", [$h‍_a => (arrayFilter = $h‍_a)]],["arrayMap", [$h‍_a => (arrayMap = $h‍_a)]],["arrayPush", [$h‍_a => (arrayPush = $h‍_a)]],["defineProperty", [$h‍_a => (defineProperty = $h‍_a)]],["freeze", [$h‍_a => (freeze = $h‍_a)]],["fromEntries", [$h‍_a => (fromEntries = $h‍_a)]],["isError", [$h‍_a => (isError = $h‍_a)]],["stringEndsWith", [$h‍_a => (stringEndsWith = $h‍_a)]],["weaksetAdd", [$h‍_a => (weaksetAdd = $h‍_a)]],["weaksetHas", [$h‍_a => (weaksetHas = $h‍_a)]]]],["./types.js", []],["./internal-types.js", []]]);   






















// For our internal debugging purposes, uncomment
// const internalDebugConsole = console;

// The whitelists of console methods, from:
// Whatwg "living standard" https://console.spec.whatwg.org/
// Node https://nodejs.org/dist/latest-v14.x/docs/api/console.html
// MDN https://developer.mozilla.org/en-US/docs/Web/API/Console_API
// TypeScript https://openstapps.gitlab.io/projectmanagement/interfaces/_node_modules__types_node_globals_d_.console.html
// Chrome https://developers.google.com/web/tools/chrome-devtools/console/api

// All console level methods have parameters (fmt?, ...args)
// where the argument sequence `fmt?, ...args` formats args according to
// fmt if fmt is a format string. Otherwise, it just renders them all as values
// separated by spaces.
// https://console.spec.whatwg.org/#formatter
// https://nodejs.org/docs/latest/api/util.html#util_util_format_format_args

// For the causal console, all occurrences of `fmt, ...args` or `...args` by
// itself must check for the presence of an error to ask the
// `loggedErrorHandler` to handle.
// In theory we should do a deep inspection to detect for example an array
// containing an error. We currently do not detect these and may never.

/** @typedef {keyof VirtualConsole | 'profile' | 'profileEnd'} ConsoleProps */

/** @type {readonly [ConsoleProps, LogSeverity | undefined][]} */
const consoleLevelMethods=  freeze([
  ['debug', 'debug'], // (fmt?, ...args) verbose level on Chrome
  ['log', 'log'], // (fmt?, ...args) info level on Chrome
  ['info', 'info'], // (fmt?, ...args)
  ['warn', 'warn'], // (fmt?, ...args)
  ['error', 'error'], // (fmt?, ...args)

  ['trace', 'log'], // (fmt?, ...args)
  ['dirxml', 'log'], // (fmt?, ...args)
  ['group', 'log'], // (fmt?, ...args)
  ['groupCollapsed', 'log']  // (fmt?, ...args)
]);

/** @type {readonly [ConsoleProps, LogSeverity | undefined][]} */
const consoleOtherMethods=  freeze([
  ['assert', 'error'], // (value, fmt?, ...args)
  ['timeLog', 'log'], // (label?, ...args) no fmt string

  // Insensitive to whether any argument is an error. All arguments can pass
  // thru to baseConsole as is.
  ['clear', undefined], // ()
  ['count', 'info'], // (label?)
  ['countReset', undefined], // (label?)
  ['dir', 'log'], // (item, options?)
  ['groupEnd', 'log'], // ()
  // In theory tabular data may be or contain an error. However, we currently
  // do not detect these and may never.
  ['table', 'log'], // (tabularData, properties?)
  ['time', 'info'], // (label?)
  ['timeEnd', 'info'], // (label?)

  // Node Inspector only, MDN, and TypeScript, but not whatwg
  ['profile', undefined], // (label?)
  ['profileEnd', undefined], // (label?)
  ['timeStamp', undefined]  // (label?)
]);

/** @type {readonly [ConsoleProps, LogSeverity | undefined][]} */
const        consoleWhitelist=  freeze([
  ...consoleLevelMethods,
  ...consoleOtherMethods]);


/**
 * consoleOmittedProperties is currently unused. I record and maintain it here
 * with the intention that it be treated like the `false` entries in the main
 * SES whitelist: that seeing these on the original console is expected, but
 * seeing anything else that's outside the whitelist is surprising and should
 * provide a diagnostic.
 *
 * const consoleOmittedProperties = freeze([
 *   'memory', // Chrome
 *   'exception', // FF, MDN
 *   '_ignoreErrors', // Node
 *   '_stderr', // Node
 *   '_stderrErrorHandler', // Node
 *   '_stdout', // Node
 *   '_stdoutErrorHandler', // Node
 *   '_times', // Node
 *   'context', // Chrome, Node
 *   'record', // Safari
 *   'recordEnd', // Safari
 *
 *   'screenshot', // Safari
 *   // Symbols
 *   '@@toStringTag', // Chrome: "Object", Safari: "Console"
 *   // A variety of other symbols also seen on Node
 * ]);
 */

// /////////////////////////////////////////////////////////////////////////////

/** @type {MakeLoggingConsoleKit} */$h‍_once.consoleWhitelist(consoleWhitelist);
const makeLoggingConsoleKit=  (
  loggedErrorHandler,
  { shouldResetForDebugging=  false}=   {})=>
     {
  if( shouldResetForDebugging) {
    // eslint-disable-next-line @endo/no-polymorphic-call
    loggedErrorHandler.resetErrorTagNum();
   }

  // Not frozen!
  let logArray=  [];

  const loggingConsole=  fromEntries(
    arrayMap(consoleWhitelist, ([name, _])=>  {
      // Use an arrow function so that it doesn't come with its own name in
      // its printed form. Instead, we're hoping that tooling uses only
      // the `.name` property set below.
      /**
       * @param {...any} args
       */
      const method=  (...args)=>  {
        arrayPush(logArray, [name, ...args]);
       };
      defineProperty(method, 'name', { value: name});
      return [name, freeze(method)];
     }));

  freeze(loggingConsole);

  const takeLog=  ()=>  {
    const result=  freeze(logArray);
    logArray=  [];
    return result;
   };
  freeze(takeLog);

  const typedLoggingConsole=  /** @type {VirtualConsole} */  loggingConsole;

  return freeze({ loggingConsole: typedLoggingConsole, takeLog});
 };$h‍_once.makeLoggingConsoleKit(makeLoggingConsoleKit);
freeze(makeLoggingConsoleKit);


// /////////////////////////////////////////////////////////////////////////////

/** @type {ErrorInfo} */
const ErrorInfo=  {
  NOTE: 'ERROR_NOTE:',
  MESSAGE: 'ERROR_MESSAGE:'};

freeze(ErrorInfo);

/** @type {MakeCausalConsole} */
const makeCausalConsole=  (baseConsole, loggedErrorHandler)=>  {
  const { getStackString, tagError, takeMessageLogArgs, takeNoteLogArgsArray}=
    loggedErrorHandler;

  /**
   * @param {ReadonlyArray<any>} logArgs
   * @param {Array<any>} subErrorsSink
   * @returns {any}
   */
  const extractErrorArgs=  (logArgs, subErrorsSink)=>  {
    const argTags=  arrayMap(logArgs, (arg)=>{
      if( isError(arg)) {
        arrayPush(subErrorsSink, arg);
        return  `(${tagError(arg)})`;
       }
      return arg;
     });
    return argTags;
   };

  /**
   * @param {LogSeverity} severity
   * @param {Error} error
   * @param {ErrorInfoKind} kind
   * @param {readonly any[]} logArgs
   * @param {Array<Error>} subErrorsSink
   */
  const logErrorInfo=  (severity, error, kind, logArgs, subErrorsSink)=>  {
    const errorTag=  tagError(error);
    const errorName=
      kind===  ErrorInfo.MESSAGE?   `${errorTag}:`:  `${errorTag} ${kind}`;
    const argTags=  extractErrorArgs(logArgs, subErrorsSink);
    // eslint-disable-next-line @endo/no-polymorphic-call
    baseConsole[severity](errorName, ...argTags);
   };

  /**
   * Logs the `subErrors` within a group name mentioning `optTag`.
   *
   * @param {LogSeverity} severity
   * @param {Error[]} subErrors
   * @param {string | undefined} optTag
   * @returns {void}
   */
  const logSubErrors=  (severity, subErrors, optTag=  undefined)=>  {
    if( subErrors.length===  0) {
      return;
     }
    if( subErrors.length===  1&&  optTag===  undefined) {
      // eslint-disable-next-line no-use-before-define
      logError(severity, subErrors[0]);
      return;
     }
    let label;
    if( subErrors.length===  1) {
      label=   `Nested error`;
     }else {
      label=   `Nested ${subErrors.length} errors`;
     }
    if( optTag!==  undefined) {
      label=   `${label} under ${optTag}`;
     }
    // eslint-disable-next-line @endo/no-polymorphic-call
    baseConsole.group(label);
    try {
      for( const subError of subErrors) {
        // eslint-disable-next-line no-use-before-define
        logError(severity, subError);
       }
     }finally {
      // eslint-disable-next-line @endo/no-polymorphic-call
      baseConsole.groupEnd();
     }
   };

  const errorsLogged=  new WeakSet();

  /** @type {(severity: LogSeverity) => NoteCallback} */
  const makeNoteCallback=  (severity)=>(error, noteLogArgs)=>  {
    const subErrors=  [];
    // Annotation arrived after the error has already been logged,
    // so just log the annotation immediately, rather than remembering it.
    logErrorInfo(severity, error, ErrorInfo.NOTE, noteLogArgs, subErrors);
    logSubErrors(severity, subErrors, tagError(error));
   };

  /**
   * @param {LogSeverity} severity
   * @param {Error} error
   */
  const logError=  (severity, error)=>  {
    if( weaksetHas(errorsLogged, error)) {
      return;
     }
    const errorTag=  tagError(error);
    weaksetAdd(errorsLogged, error);
    const subErrors=  [];
    const messageLogArgs=  takeMessageLogArgs(error);
    const noteLogArgsArray=  takeNoteLogArgsArray(
      error,
      makeNoteCallback(severity));

    // Show the error's most informative error message
    if( messageLogArgs===  undefined) {
      // If there is no message log args, then just show the message that
      // the error itself carries.
      // eslint-disable-next-line @endo/no-polymorphic-call
      baseConsole[severity]( `${errorTag}:`,error.message);
     }else {
      // If there is one, we take it to be strictly more informative than the
      // message string carried by the error, so show it *instead*.
      logErrorInfo(
        severity,
        error,
        ErrorInfo.MESSAGE,
        messageLogArgs,
        subErrors);

     }
    // After the message but before any other annotations, show the stack.
    let stackString=  getStackString(error);
    if(
      typeof stackString===  'string'&&
      stackString.length>=  1&&
      !stringEndsWith(stackString, '\n'))
      {
      stackString+=  '\n';
     }
    // eslint-disable-next-line @endo/no-polymorphic-call
    baseConsole[severity](stackString);
    // Show the other annotations on error
    for( const noteLogArgs of noteLogArgsArray) {
      logErrorInfo(severity, error, ErrorInfo.NOTE, noteLogArgs, subErrors);
     }
    // explain all the errors seen in the messages already emitted.
    logSubErrors(severity, subErrors, errorTag);
   };

  const levelMethods=  arrayMap(consoleLevelMethods, ([level, _])=>  {
    /**
     * @param {...any} logArgs
     */
    const levelMethod=  (...logArgs)=>  {
      const subErrors=  [];
      const argTags=  extractErrorArgs(logArgs, subErrors);
      // eslint-disable-next-line @endo/no-polymorphic-call
      baseConsole[level](...argTags);
      // @ts-expect-error ConsoleProp vs LogSeverity mismatch
      logSubErrors(level, subErrors);
     };
    defineProperty(levelMethod, 'name', { value: level});
    return [level, freeze(levelMethod)];
   });
  const otherMethodNames=  arrayFilter(
    consoleOtherMethods,
    ([name, _])=>  name in baseConsole);

  const otherMethods=  arrayMap(otherMethodNames, ([name, _])=>  {
    /**
     * @param {...any} args
     */
    const otherMethod=  (...args)=>  {
      // @ts-ignore
      // eslint-disable-next-line @endo/no-polymorphic-call
      baseConsole[name](...args);
      return undefined;
     };
    defineProperty(otherMethod, 'name', { value: name});
    return [name, freeze(otherMethod)];
   });

  const causalConsole=  fromEntries([...levelMethods, ...otherMethods]);
  return (/** @type {VirtualConsole} */ freeze(causalConsole));
 };$h‍_once.makeCausalConsole(makeCausalConsole);
freeze(makeCausalConsole);


// /////////////////////////////////////////////////////////////////////////////

/** @type {FilterConsole} */
const filterConsole=  (baseConsole, filter, _topic=  undefined)=>  {
  // TODO do something with optional topic string
  const whitelist=  arrayFilter(
    consoleWhitelist,
    ([name, _])=>  name in baseConsole);

  const methods=  arrayMap(whitelist, ([name, severity])=>  {
    /**
     * @param {...any} args
     */
    const method=  (...args)=>  {
      // eslint-disable-next-line @endo/no-polymorphic-call
      if( severity===  undefined||  filter.canLog(severity)) {
        // @ts-ignore
        // eslint-disable-next-line @endo/no-polymorphic-call
        baseConsole[name](...args);
       }
     };
    return [name, freeze(method)];
   });
  const filteringConsole=  fromEntries(methods);
  return (/** @type {VirtualConsole} */ freeze(filteringConsole));
 };$h‍_once.filterConsole(filterConsole);
freeze(filterConsole);
})
,
// === functors[34] ===
(({   imports: $h‍_imports,   liveVar: $h‍_live,   onceVar: $h‍_once,   importMeta: $h‍____meta,  }) => {   let FinalizationRegistry,Map,mapGet,mapDelete,WeakMap,mapSet,finalizationRegistryRegister,weakmapSet,weakmapGet,mapEntries,mapHas;$h‍_imports([["../commons.js", [["FinalizationRegistry", [$h‍_a => (FinalizationRegistry = $h‍_a)]],["Map", [$h‍_a => (Map = $h‍_a)]],["mapGet", [$h‍_a => (mapGet = $h‍_a)]],["mapDelete", [$h‍_a => (mapDelete = $h‍_a)]],["WeakMap", [$h‍_a => (WeakMap = $h‍_a)]],["mapSet", [$h‍_a => (mapSet = $h‍_a)]],["finalizationRegistryRegister", [$h‍_a => (finalizationRegistryRegister = $h‍_a)]],["weakmapSet", [$h‍_a => (weakmapSet = $h‍_a)]],["weakmapGet", [$h‍_a => (weakmapGet = $h‍_a)]],["mapEntries", [$h‍_a => (mapEntries = $h‍_a)]],["mapHas", [$h‍_a => (mapHas = $h‍_a)]]]]]);   














/**
 * Create rejection-tracking machinery compatible with Node.js and browsers.
 *
 * Note that modern browsers *prevent* access to the 'unhandledrejection' and
 * 'rejectionhandled' events needed:
 * - in cross-origin mode, like when served from file://
 * - in the browser console (interactively typed-in code)
 * - in the debugger
 *
 * Then, they just look like: `Uncaught (in promise) Error: ...` and don't
 * implement the machinery.
 *
 * The solution is to serve your web page from an http:// or https:// web server
 * and execute actual code.
 *
 * @param {(reason: unknown) => void} reportReason report the reason for an
 * unhandled rejection.
 */
const        makeRejectionHandlers=  (reportReason)=>{
  if( FinalizationRegistry===  undefined) {
    return undefined;
   }

  /** @typedef {number} ReasonId */
  let lastReasonId=  0;

  /** @type {Map<ReasonId, unknown>} */
  const idToReason=  new Map();

  /** @type {(() => void) | undefined} */
  let cancelChecking;

  const removeReasonId=  (reasonId)=>{
    mapDelete(idToReason, reasonId);
    if( cancelChecking&&  idToReason.size===  0) {
      // No more unhandled rejections to check, just cancel the check.
      cancelChecking();
      cancelChecking=  undefined;
     }
   };

  /** @type {WeakMap<Promise, ReasonId>} */
  const promiseToReasonId=  new WeakMap();

  /**
   * Clean up and report the reason for a GCed unhandled rejection.
   *
   * @param {ReasonId} heldReasonId
   */
  const finalizeDroppedPromise=  (heldReasonId)=>{
    if( mapHas(idToReason, heldReasonId)) {
      const reason=  mapGet(idToReason, heldReasonId);
      removeReasonId(heldReasonId);
      reportReason(reason);
     }
   };

  /** @type {FinalizationRegistry<ReasonId>} */
  const promiseToReason=  new FinalizationRegistry(finalizeDroppedPromise);

  /**
   * Track a rejected promise and its corresponding reason if there is no
   * rejection handler synchronously attached.
   *
   * @param {unknown} reason
   * @param {Promise} pr
   */
  const unhandledRejectionHandler=  (reason, pr)=>  {
    lastReasonId+=  1;
    const reasonId=  lastReasonId;

    // Update bookkeeping.
    mapSet(idToReason, reasonId, reason);
    weakmapSet(promiseToReasonId, pr, reasonId);
    finalizationRegistryRegister(promiseToReason, pr, reasonId, pr);
   };

  /**
   * Deal with the addition of a handler to a previously rejected promise.
   *
   * Just remove it from our list.  Let the FinalizationRegistry or
   * processTermination report any GCed unhandled rejected promises.
   *
   * @param {Promise} pr
   */
  const rejectionHandledHandler=  (pr)=>{
    const reasonId=  weakmapGet(promiseToReasonId, pr);
    removeReasonId(reasonId);
   };

  /**
   * Report all the unhandled rejections, now that we are abruptly terminating
   * the agent cluster.
   */
  const processTerminationHandler=  ()=>  {
    for( const [reasonId, reason]of  mapEntries(idToReason)) {
      removeReasonId(reasonId);
      reportReason(reason);
     }
   };

  return {
    rejectionHandledHandler,
    unhandledRejectionHandler,
    processTerminationHandler};

 };$h‍_once.makeRejectionHandlers(makeRejectionHandlers);
})
,
// === functors[35] ===
(({   imports: $h‍_imports,   liveVar: $h‍_live,   onceVar: $h‍_once,   importMeta: $h‍____meta,  }) => {   let TypeError,globalThis,defaultHandler,makeCausalConsole,makeRejectionHandlers;$h‍_imports([["../commons.js", [["TypeError", [$h‍_a => (TypeError = $h‍_a)]],["globalThis", [$h‍_a => (globalThis = $h‍_a)]]]],["./assert.js", [["loggedErrorHandler", [$h‍_a => (defaultHandler = $h‍_a)]]]],["./console.js", [["makeCausalConsole", [$h‍_a => (makeCausalConsole = $h‍_a)]]]],["./unhandled-rejection.js", [["makeRejectionHandlers", [$h‍_a => (makeRejectionHandlers = $h‍_a)]]]],["./types.js", []],["./internal-types.js", []]]);   








// eslint-disable-next-line no-restricted-globals
const originalConsole=  console;

/**
 * Wrap console unless suppressed.
 * At the moment, the console is considered a host power in the start
 * compartment, and not a primordial. Hence it is absent from the whilelist
 * and bypasses the intrinsicsCollector.
 *
 * @param {"safe" | "unsafe"} consoleTaming
 * @param {"platform" | "exit" | "abort" | "report" | "none"} [errorTrapping]
 * @param {"report" | "none"} [unhandledRejectionTrapping]
 * @param {GetStackString=} optGetStackString
 */
const        tameConsole=  (
  consoleTaming=  'safe',
  errorTrapping=  'platform',
  unhandledRejectionTrapping=  'report',
  optGetStackString=  undefined)=>
     {
  if( consoleTaming!==  'safe'&&  consoleTaming!==  'unsafe') {
    throw TypeError( `unrecognized consoleTaming ${consoleTaming}`);
   }

  let loggedErrorHandler;
  if( optGetStackString===  undefined) {
    loggedErrorHandler=  defaultHandler;
   }else {
    loggedErrorHandler=  {
      ...defaultHandler,
      getStackString: optGetStackString};

   }
  const ourConsole=
    consoleTaming===  'unsafe'?
        originalConsole:
        makeCausalConsole(originalConsole, loggedErrorHandler);

  // Attach platform-specific error traps such that any error that gets thrown
  // at top-of-turn (the bottom of stack) will get logged by our causal
  // console, revealing the diagnostic information associated with the error,
  // including the stack from when the error was created.

  // In the following Node.js and web browser cases, `process` and `window` are
  // spelled as `globalThis` properties to avoid the overweaning gaze of
  // Parcel, which dutifully installs an unnecessary `process` shim if we ever
  // utter that. That unnecessary shim forces the whole bundle into sloppy mode,
  // which in turn breaks SES's strict mode invariant.

  // Disable the polymorphic check for the rest of this file.  It's too noisy
  // when dealing with platform APIs.
  /* eslint-disable @endo/no-polymorphic-call */

  // Node.js
  if( errorTrapping!==  'none'&&  globalThis.process!==  undefined) {
    globalThis.process.on('uncaughtException', (error)=>{
      // causalConsole is born frozen so not vulnerable to method tampering.
      ourConsole.error(error);
      if( errorTrapping===  'platform'||  errorTrapping===  'exit') {
        globalThis.process.exit(globalThis.process.exitCode||  -1);
       }else if( errorTrapping===  'abort') {
        globalThis.process.abort();
       }
     });
   }

  if(
    unhandledRejectionTrapping!==  'none'&&
    globalThis.process!==  undefined)
    {
    const handleRejection=  (reason)=>{
      // 'platform' and 'report' just log the reason.
      ourConsole.error('SES_UNHANDLED_REJECTION:', reason);
     };
    // Maybe track unhandled promise rejections.
    const h=  makeRejectionHandlers(handleRejection);
    if( h) {
      // Rejection handlers are supported.
      globalThis.process.on('unhandledRejection', h.unhandledRejectionHandler);
      globalThis.process.on('rejectionHandled', h.rejectionHandledHandler);
      globalThis.process.on('exit', h.processTerminationHandler);
     }
   }

  // Browser
  if(
    errorTrapping!==  'none'&&
    globalThis.window!==  undefined&&
    globalThis.window.addEventListener!==  undefined)
    {
    globalThis.window.addEventListener('error', (event)=>{
      event.preventDefault();
      // 'platform' and 'report' just log the reason.
      ourConsole.error(event.error);
      if( errorTrapping===  'exit'||  errorTrapping===  'abort') {
        globalThis.window.location.href=   `about:blank`;
       }
     });
   }

  if(
    unhandledRejectionTrapping!==  'none'&&
    globalThis.window!==  undefined&&
    globalThis.window.addEventListener!==  undefined)
    {
    const handleRejection=  (reason)=>{
      ourConsole.error('SES_UNHANDLED_REJECTION:', reason);
     };

    const h=  makeRejectionHandlers(handleRejection);
    if( h) {
      // Rejection handlers are supported.
      globalThis.window.addEventListener('unhandledrejection', (event)=>{
        event.preventDefault();
        h.unhandledRejectionHandler(event.reason, event.promise);
       });

      globalThis.window.addEventListener('rejectionhandled', (event)=>{
        event.preventDefault();
        h.rejectionHandledHandler(event.promise);
       });

      globalThis.window.addEventListener('beforeunload', (_event)=>{
        h.processTerminationHandler();
       });
     }
   }
  /* eslint-enable @endo/no-polymorphic-call */

  return { console: ourConsole};
 };$h‍_once.tameConsole(tameConsole);
})
,
// === functors[36] ===
(({   imports: $h‍_imports,   liveVar: $h‍_live,   onceVar: $h‍_once,   importMeta: $h‍____meta,  }) => {   let WeakMap,WeakSet,apply,arrayFilter,arrayJoin,arrayMap,arraySlice,create,defineProperties,fromEntries,reflectSet,regexpExec,regexpTest,weakmapGet,weakmapSet,weaksetAdd,weaksetHas;$h‍_imports([["../commons.js", [["WeakMap", [$h‍_a => (WeakMap = $h‍_a)]],["WeakSet", [$h‍_a => (WeakSet = $h‍_a)]],["apply", [$h‍_a => (apply = $h‍_a)]],["arrayFilter", [$h‍_a => (arrayFilter = $h‍_a)]],["arrayJoin", [$h‍_a => (arrayJoin = $h‍_a)]],["arrayMap", [$h‍_a => (arrayMap = $h‍_a)]],["arraySlice", [$h‍_a => (arraySlice = $h‍_a)]],["create", [$h‍_a => (create = $h‍_a)]],["defineProperties", [$h‍_a => (defineProperties = $h‍_a)]],["fromEntries", [$h‍_a => (fromEntries = $h‍_a)]],["reflectSet", [$h‍_a => (reflectSet = $h‍_a)]],["regexpExec", [$h‍_a => (regexpExec = $h‍_a)]],["regexpTest", [$h‍_a => (regexpTest = $h‍_a)]],["weakmapGet", [$h‍_a => (weakmapGet = $h‍_a)]],["weakmapSet", [$h‍_a => (weakmapSet = $h‍_a)]],["weaksetAdd", [$h‍_a => (weaksetAdd = $h‍_a)]],["weaksetHas", [$h‍_a => (weaksetHas = $h‍_a)]]]]]);   



















// Whitelist names from https://v8.dev/docs/stack-trace-api
// Whitelisting only the names used by error-stack-shim/src/v8StackFrames
// callSiteToFrame to shim the error stack proposal.
const safeV8CallSiteMethodNames=  [
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

  'toString'  // TODO replace to use only whitelisted info
];

// TODO this is a ridiculously expensive way to attenuate callsites.
// Before that matters, we should switch to a reasonable representation.
const safeV8CallSiteFacet=  (callSite)=>{
  const methodEntry=  (name)=>{
    const method=  callSite[name];
    return [name, ()=>  apply(method, callSite, [])];
   };
  const o=  fromEntries(arrayMap(safeV8CallSiteMethodNames, methodEntry));
  return create(o, {});
 };

const safeV8SST=  (sst)=>arrayMap(sst, safeV8CallSiteFacet);

// If it has `/node_modules/` anywhere in it, on Node it is likely
// to be a dependent package of the current package, and so to
// be an infrastructure frame to be dropped from concise stack traces.
const FILENAME_NODE_DEPENDENTS_CENSOR=  /\/node_modules\//;

// If it begins with `internal/` or `node:internal` then it is likely
// part of the node infrustructre itself, to be dropped from concise
// stack traces.
const FILENAME_NODE_INTERNALS_CENSOR=  /^(?:node:)?internal\//;

// Frames within the `assert.js` package should be dropped from
// concise stack traces, as these are just steps towards creating the
// error object in question.
const FILENAME_ASSERT_CENSOR=  /\/packages\/ses\/src\/error\/assert.js$/;

// Frames within the `eventual-send` shim should be dropped so that concise
// deep stacks omit the internals of the eventual-sending mechanism causing
// asynchronous messages to be sent.
// Note that the eventual-send package will move from agoric-sdk to
// Endo, so this rule will be of general interest.
const FILENAME_EVENTUAL_SEND_CENSOR=  /\/packages\/eventual-send\/src\//;

// Any stack frame whose `fileName` matches any of these censor patterns
// will be omitted from concise stacks.
// TODO Enable users to configure FILENAME_CENSORS via `lockdown` options.
const FILENAME_CENSORS=  [
  FILENAME_NODE_DEPENDENTS_CENSOR,
  FILENAME_NODE_INTERNALS_CENSOR,
  FILENAME_ASSERT_CENSOR,
  FILENAME_EVENTUAL_SEND_CENSOR];


// Should a stack frame with this as its fileName be included in a concise
// stack trace?
// Exported only so it can be unit tested.
// TODO Move so that it applies not just to v8.
const        filterFileName=  (fileName)=>{
  if( !fileName) {
    // Stack frames with no fileName should appear in concise stack traces.
    return true;
   }
  for( const filter of FILENAME_CENSORS) {
    if( regexpTest(filter, fileName)) {
      return false;
     }
   }
  return true;
 };

// The ad-hoc rule of the current pattern is that any likely-file-path or
// likely url-path prefix, ending in a `/.../` should get dropped.
// Anything to the left of the likely path text is kept.
// Everything to the right of `/.../` is kept. Thus
// `'Object.bar (/vat-v1/.../eventual-send/test/test-deep-send.js:13:21)'`
// simplifies to
// `'Object.bar (eventual-send/test/test-deep-send.js:13:21)'`.
//
// See thread starting at
// https://github.com/Agoric/agoric-sdk/issues/2326#issuecomment-773020389
$h‍_once.filterFileName(filterFileName);const CALLSITE_ELLIPSES_PATTERN=/^((?:.*[( ])?)[:/\w_-]*\/\.\.\.\/(.+)$/;

// The ad-hoc rule of the current pattern is that any likely-file-path or
// likely url-path prefix, ending in a `/` and prior to `package/` should get
// dropped.
// Anything to the left of the likely path prefix text is kept. `package/` and
// everything to its right is kept. Thus
// `'Object.bar (/Users/markmiller/src/ongithub/agoric/agoric-sdk/packages/eventual-send/test/test-deep-send.js:13:21)'`
// simplifies to
// `'Object.bar (packages/eventual-send/test/test-deep-send.js:13:21)'`.
// Note that `/packages/` is a convention for monorepos encouraged by
// lerna.
const CALLSITE_PACKAGES_PATTERN=  /^((?:.*[( ])?)[:/\w_-]*\/(packages\/.+)$/;

// The use of these callSite patterns below assumes that any match will bind
// capture groups containing the parts of the original string we want
// to keep. The parts outside those capture groups will be dropped from concise
// stacks.
// TODO Enable users to configure CALLSITE_PATTERNS via `lockdown` options.
const CALLSITE_PATTERNS=  [
  CALLSITE_ELLIPSES_PATTERN,
  CALLSITE_PACKAGES_PATTERN];


// For a stack frame that should be included in a concise stack trace, if
// `callSiteString` is the original stringified stack frame, return the
// possibly-shorter stringified stack frame that should be shown instead.
// Exported only so it can be unit tested.
// TODO Move so that it applies not just to v8.
const        shortenCallSiteString=  (callSiteString)=>{
  for( const filter of CALLSITE_PATTERNS) {
    const match=  regexpExec(filter, callSiteString);
    if( match) {
      return arrayJoin(arraySlice(match, 1), '');
     }
   }
  return callSiteString;
 };$h‍_once.shortenCallSiteString(shortenCallSiteString);

const        tameV8ErrorConstructor=  (
  OriginalError,
  InitialError,
  errorTaming,
  stackFiltering)=>
     {
  // TODO: Proper CallSite types
  /** @typedef {{}} CallSite */

  const originalCaptureStackTrace=  OriginalError.captureStackTrace;

  // const callSiteFilter = _callSite => true;
  const callSiteFilter=  (callSite)=>{
    if( stackFiltering===  'verbose') {
      return true;
     }
    // eslint-disable-next-line @endo/no-polymorphic-call
    return filterFileName(callSite.getFileName());
   };

  const callSiteStringifier=  (callSite)=>{
    let callSiteString=   `${callSite}`;
    if( stackFiltering===  'concise') {
      callSiteString=  shortenCallSiteString(callSiteString);
     }
    return  `\n  at ${callSiteString}`;
   };

  const stackStringFromSST=  (_error, sst)=>
    arrayJoin(
      arrayMap(arrayFilter(sst, callSiteFilter), callSiteStringifier),
      '');


  /**
   * @typedef {object} StructuredStackInfo
   * @property {CallSite[]} callSites
   * @property {undefined} [stackString]
   */

  /**
   * @typedef {object} ParsedStackInfo
   * @property {undefined} [callSites]
   * @property {string} stackString
   */

  // Mapping from error instance to the stack for that instance.
  // The stack info is either the structured stack trace
  // or the generated tamed stack string
  /** @type {WeakMap<Error, ParsedStackInfo | StructuredStackInfo>} */
  const stackInfos=  new WeakMap();

  // Use concise methods to obtain named functions without constructors.
  const tamedMethods=  {
    // The optional `optFn` argument is for cutting off the bottom of
    // the stack --- for capturing the stack only above the topmost
    // call to that function. Since this isn't the "real" captureStackTrace
    // but instead calls the real one, if no other cutoff is provided,
    // we cut this one off.
    captureStackTrace(error, optFn=  tamedMethods.captureStackTrace) {
      if( typeof originalCaptureStackTrace===  'function') {
        // OriginalError.captureStackTrace is only on v8
        apply(originalCaptureStackTrace, OriginalError, [error, optFn]);
        return;
       }
      reflectSet(error, 'stack', '');
     },
    // Shim of proposed special power, to reside by default only
    // in the start compartment, for getting the stack traceback
    // string associated with an error.
    // See https://tc39.es/proposal-error-stacks/
    getStackString(error) {
      let stackInfo=  weakmapGet(stackInfos, error);

      if( stackInfo===  undefined) {
        // The following will call `prepareStackTrace()` synchronously
        // which will populate stackInfos
        // eslint-disable-next-line no-void
        void error.stack;
        stackInfo=  weakmapGet(stackInfos, error);
        if( !stackInfo) {
          stackInfo=  { stackString: ''};
          weakmapSet(stackInfos, error, stackInfo);
         }
       }

      // prepareStackTrace() may generate the stackString
      // if errorTaming === 'unsafe'

      if( stackInfo.stackString!==  undefined) {
        return stackInfo.stackString;
       }

      const stackString=  stackStringFromSST(error, stackInfo.callSites);
      weakmapSet(stackInfos, error, { stackString});

      return stackString;
     },
    prepareStackTrace(error, sst) {
      if( errorTaming===  'unsafe') {
        const stackString=  stackStringFromSST(error, sst);
        weakmapSet(stackInfos, error, { stackString});
        return  `${error}${stackString}`;
       }else {
        weakmapSet(stackInfos, error, { callSites: sst});
        return '';
       }
     }};


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

  const defaultPrepareFn=  tamedMethods.prepareStackTrace;

  OriginalError.prepareStackTrace=  defaultPrepareFn;

  // A weakset branding some functions as system prepareFns, all of which
  // must be defined by this module, since they can receive an
  // unattenuated sst.
  const systemPrepareFnSet=  new WeakSet([defaultPrepareFn]);

  const systemPrepareFnFor=  (inputPrepareFn)=>{
    if( weaksetHas(systemPrepareFnSet, inputPrepareFn)) {
      return inputPrepareFn;
     }
    // Use concise methods to obtain named functions without constructors.
    const systemMethods=  {
      prepareStackTrace(error, sst) {
        weakmapSet(stackInfos, error, { callSites: sst});
        return inputPrepareFn(error, safeV8SST(sst));
       }};

    weaksetAdd(systemPrepareFnSet, systemMethods.prepareStackTrace);
    return systemMethods.prepareStackTrace;
   };

  // Note `stackTraceLimit` accessor already defined by
  // tame-error-constructor.js
  defineProperties(InitialError, {
    captureStackTrace: {
      value: tamedMethods.captureStackTrace,
      writable: true,
      enumerable: false,
      configurable: true},

    prepareStackTrace: {
      get() {
        return OriginalError.prepareStackTrace;
       },
      set(inputPrepareStackTraceFn) {
        if( typeof inputPrepareStackTraceFn===  'function') {
          const systemPrepareFn=  systemPrepareFnFor(inputPrepareStackTraceFn);
          OriginalError.prepareStackTrace=  systemPrepareFn;
         }else {
          OriginalError.prepareStackTrace=  defaultPrepareFn;
         }
       },
      enumerable: false,
      configurable: true}});



  return tamedMethods.getStackString;
 };$h‍_once.tameV8ErrorConstructor(tameV8ErrorConstructor);
})
,
// === functors[37] ===
(({   imports: $h‍_imports,   liveVar: $h‍_live,   onceVar: $h‍_once,   importMeta: $h‍____meta,  }) => {   let FERAL_ERROR,TypeError,apply,construct,defineProperties,setPrototypeOf,getOwnPropertyDescriptor,defineProperty,NativeErrors,tameV8ErrorConstructor;$h‍_imports([["../commons.js", [["FERAL_ERROR", [$h‍_a => (FERAL_ERROR = $h‍_a)]],["TypeError", [$h‍_a => (TypeError = $h‍_a)]],["apply", [$h‍_a => (apply = $h‍_a)]],["construct", [$h‍_a => (construct = $h‍_a)]],["defineProperties", [$h‍_a => (defineProperties = $h‍_a)]],["setPrototypeOf", [$h‍_a => (setPrototypeOf = $h‍_a)]],["getOwnPropertyDescriptor", [$h‍_a => (getOwnPropertyDescriptor = $h‍_a)]],["defineProperty", [$h‍_a => (defineProperty = $h‍_a)]]]],["../permits.js", [["NativeErrors", [$h‍_a => (NativeErrors = $h‍_a)]]]],["./tame-v8-error-constructor.js", [["tameV8ErrorConstructor", [$h‍_a => (tameV8ErrorConstructor = $h‍_a)]]]]]);   












// Present on at least FF and XS. Proposed by Error-proposal. The original
// is dangerous, so tameErrorConstructor replaces it with a safe one.
// We grab the original here before it gets replaced.
const stackDesc=  getOwnPropertyDescriptor(FERAL_ERROR.prototype, 'stack');
const stackGetter=  stackDesc&&  stackDesc.get;

// Use concise methods to obtain named functions without constructors.
const tamedMethods=  {
  getStackString(error) {
    if( typeof stackGetter===  'function') {
      return apply(stackGetter, error, []);
     }else if( 'stack'in  error) {
      // The fallback is to just use the de facto `error.stack` if present
      return  `${error.stack}`;
     }
    return '';
   }};


function                tameErrorConstructor(
  errorTaming=  'safe',
  stackFiltering=  'concise')
  {
  if( errorTaming!==  'safe'&&  errorTaming!==  'unsafe') {
    throw TypeError( `unrecognized errorTaming ${errorTaming}`);
   }
  if( stackFiltering!==  'concise'&&  stackFiltering!==  'verbose') {
    throw TypeError( `unrecognized stackFiltering ${stackFiltering}`);
   }
  const ErrorPrototype=  FERAL_ERROR.prototype;

  const platform=
    typeof FERAL_ERROR.captureStackTrace===  'function'?  'v8':  'unknown';
  const { captureStackTrace: originalCaptureStackTrace}=   FERAL_ERROR;

  const makeErrorConstructor=  (_=  {})=>  {
    // eslint-disable-next-line no-shadow
    const ResultError=  function Error(...rest) {
      let error;
      if( new.target===  undefined) {
        error=  apply(FERAL_ERROR, this, rest);
       }else {
        error=  construct(FERAL_ERROR, rest, new.target);
       }
      if( platform===  'v8') {
        // TODO Likely expensive!
        apply(originalCaptureStackTrace, FERAL_ERROR, [error, ResultError]);
       }
      return error;
     };
    defineProperties(ResultError, {
      length: { value: 1},
      prototype: {
        value: ErrorPrototype,
        writable: false,
        enumerable: false,
        configurable: false}});


    return ResultError;
   };
  const InitialError=  makeErrorConstructor({ powers: 'original'});
  const SharedError=  makeErrorConstructor({ powers: 'none'});
  defineProperties(ErrorPrototype, {
    constructor: { value: SharedError}});


  for( const NativeError of NativeErrors) {
    setPrototypeOf(NativeError, SharedError);
   }

  // https://v8.dev/docs/stack-trace-api#compatibility advises that
  // programmers can "always" set `Error.stackTraceLimit`
  // even on non-v8 platforms. On non-v8
  // it will have no effect, but this advice only makes sense
  // if the assignment itself does not fail, which it would
  // if `Error` were naively frozen. Hence, we add setters that
  // accept but ignore the assignment on non-v8 platforms.
  defineProperties(InitialError, {
    stackTraceLimit: {
      get() {
        if( typeof FERAL_ERROR.stackTraceLimit===  'number') {
          // FERAL_ERROR.stackTraceLimit is only on v8
          return FERAL_ERROR.stackTraceLimit;
         }
        return undefined;
       },
      set(newLimit) {
        if( typeof newLimit!==  'number') {
          // silently do nothing. This behavior doesn't precisely
          // emulate v8 edge-case behavior. But given the purpose
          // of this emulation, having edge cases err towards
          // harmless seems the safer option.
          return;
         }
        if( typeof FERAL_ERROR.stackTraceLimit===  'number') {
          // FERAL_ERROR.stackTraceLimit is only on v8
          FERAL_ERROR.stackTraceLimit=  newLimit;
          // We place the useless return on the next line to ensure
          // that anything we place after the if in the future only
          // happens if the then-case does not.
          // eslint-disable-next-line no-useless-return
          return;
         }
       },
      // WTF on v8 stackTraceLimit is enumerable
      enumerable: false,
      configurable: true}});



  // The default SharedError much be completely powerless even on v8,
  // so the lenient `stackTraceLimit` accessor does nothing on all
  // platforms.
  defineProperties(SharedError, {
    stackTraceLimit: {
      get() {
        return undefined;
       },
      set(_newLimit) {
        // do nothing
       },
      enumerable: false,
      configurable: true}});



  if( platform===  'v8') {
    // `SharedError.prepareStackTrace`, if it exists, must also be
    // powerless. However, from what we've heard, depd expects to be able to
    // assign to it without the assignment throwing. It is normally a function
    // that returns a stack string to be magically added to error objects.
    // However, as long as we're adding a lenient standin, we may as well
    // accommodate any who expect to get a function they can call and get
    // a string back. This prepareStackTrace is a do-nothing function that
    // always returns the empty string.
    defineProperties(SharedError, {
      prepareStackTrace: {
        get() {
          return ()=>  '';
         },
        set(_prepareFn) {
          // do nothing
         },
        enumerable: false,
        configurable: true},

      captureStackTrace: {
        value: (errorish, _constructorOpt)=>  {
          defineProperty(errorish, 'stack', {
            value: ''});

         },
        writable: false,
        enumerable: false,
        configurable: true}});


   }

  let initialGetStackString=  tamedMethods.getStackString;
  if( platform===  'v8') {
    initialGetStackString=  tameV8ErrorConstructor(
      FERAL_ERROR,
      InitialError,
      errorTaming,
      stackFiltering);

   }else if( errorTaming===  'unsafe') {
    // v8 has too much magic around their 'stack' own property for it to
    // coexist cleanly with this accessor. So only install it on non-v8

    // Error.prototype.stack property as proposed at
    // https://tc39.es/proposal-error-stacks/
    // with the fix proposed at
    // https://github.com/tc39/proposal-error-stacks/issues/46
    // On others, this still protects from the override mistake,
    // essentially like enable-property-overrides.js would
    // once this accessor property itself is frozen, as will happen
    // later during lockdown.
    //
    // However, there is here a change from the intent in the current
    // state of the proposal. If experience tells us whether this change
    // is a good idea, we should modify the proposal accordingly. There is
    // much code in the world that assumes `error.stack` is a string. So
    // where the proposal accommodates secure operation by making the
    // property optional, we instead accommodate secure operation by
    // having the secure form always return only the stable part, the
    // stringified error instance, and omitting all the frame information
    // rather than omitting the property.
    defineProperties(ErrorPrototype, {
      stack: {
        get() {
          return initialGetStackString(this);
         },
        set(newValue) {
          defineProperties(this, {
            stack: {
              value: newValue,
              writable: true,
              enumerable: true,
              configurable: true}});


         }}});


   }else {
    // v8 has too much magic around their 'stack' own property for it to
    // coexist cleanly with this accessor. So only install it on non-v8
    defineProperties(ErrorPrototype, {
      stack: {
        get() {
          // https://github.com/tc39/proposal-error-stacks/issues/46
          // allows this to not add an unpleasant newline. Otherwise
          // we should fix this.
          return  `${this}`;
         },
        set(newValue) {
          defineProperties(this, {
            stack: {
              value: newValue,
              writable: true,
              enumerable: true,
              configurable: true}});


         }}});


   }

  return {
    '%InitialGetStackString%': initialGetStackString,
    '%InitialError%': InitialError,
    '%SharedError%': SharedError};

 }$h‍_once.default(     tameErrorConstructor);
})
,
// === functors[38] ===
(({   imports: $h‍_imports,   liveVar: $h‍_live,   onceVar: $h‍_once,   importMeta: $h‍____meta,  }) => {   let ReferenceError,TypeError,Map,Set,arrayJoin,arrayMap,arrayPush,create,freeze,mapGet,mapHas,mapSet,setAdd,promiseCatch,promiseThen,values,weakmapGet,assert;$h‍_imports([["./commons.js", [["ReferenceError", [$h‍_a => (ReferenceError = $h‍_a)]],["TypeError", [$h‍_a => (TypeError = $h‍_a)]],["Map", [$h‍_a => (Map = $h‍_a)]],["Set", [$h‍_a => (Set = $h‍_a)]],["arrayJoin", [$h‍_a => (arrayJoin = $h‍_a)]],["arrayMap", [$h‍_a => (arrayMap = $h‍_a)]],["arrayPush", [$h‍_a => (arrayPush = $h‍_a)]],["create", [$h‍_a => (create = $h‍_a)]],["freeze", [$h‍_a => (freeze = $h‍_a)]],["mapGet", [$h‍_a => (mapGet = $h‍_a)]],["mapHas", [$h‍_a => (mapHas = $h‍_a)]],["mapSet", [$h‍_a => (mapSet = $h‍_a)]],["setAdd", [$h‍_a => (setAdd = $h‍_a)]],["promiseCatch", [$h‍_a => (promiseCatch = $h‍_a)]],["promiseThen", [$h‍_a => (promiseThen = $h‍_a)]],["values", [$h‍_a => (values = $h‍_a)]],["weakmapGet", [$h‍_a => (weakmapGet = $h‍_a)]]]],["./error/assert.js", [["assert", [$h‍_a => (assert = $h‍_a)]]]]]);   




























const { Fail, details: d, quote: q}=   assert;

const noop=  ()=>  { };

// `makeAlias` constructs compartment specifier tuples for the `aliases`
// private field of compartments.
// These aliases allow a compartment to alias an internal module specifier to a
// module specifier in an external compartment, and also to create internal
// aliases.
// Both are facilitated by the moduleMap Compartment constructor option.
const        makeAlias=  (compartment, specifier)=>
  freeze({
    compartment,
    specifier});


// `resolveAll` pre-computes resolutions of all imports within the compartment
// in which a module was loaded.
$h‍_once.makeAlias(makeAlias);const resolveAll=(imports,resolveHook,fullReferrerSpecifier)=>{
  const resolvedImports=  create(null);
  for( const importSpecifier of imports) {
    const fullSpecifier=  resolveHook(importSpecifier, fullReferrerSpecifier);
    resolvedImports[importSpecifier]=  fullSpecifier;
   }
  return freeze(resolvedImports);
 };

const loadRecord=  (
  compartmentPrivateFields,
  moduleAliases,
  compartment,
  moduleSpecifier,
  staticModuleRecord,
  pendingJobs,
  moduleLoads,
  errors,
  importMeta)=>
     {
  const { resolveHook, moduleRecords}=   weakmapGet(
    compartmentPrivateFields,
    compartment);


  // resolve all imports relative to this referrer module.
  const resolvedImports=  resolveAll(
    staticModuleRecord.imports,
    resolveHook,
    moduleSpecifier);

  const moduleRecord=  freeze({
    compartment,
    staticModuleRecord,
    moduleSpecifier,
    resolvedImports,
    importMeta});


  // Enqueue jobs to load this module's shallow dependencies.
  for( const fullSpecifier of values(resolvedImports)) {
    // Behold: recursion.
    // eslint-disable-next-line no-use-before-define
    const dependencyLoaded=  memoizedLoadWithErrorAnnotation(
      compartmentPrivateFields,
      moduleAliases,
      compartment,
      fullSpecifier,
      pendingJobs,
      moduleLoads,
      errors);

    setAdd(
      pendingJobs,
      promiseThen(dependencyLoaded, noop, (error)=>{
        arrayPush(errors, error);
       }));

   }

  // Memoize.
  mapSet(moduleRecords, moduleSpecifier, moduleRecord);
  return moduleRecord;
 };

const loadWithoutErrorAnnotation=  async(
  compartmentPrivateFields,
  moduleAliases,
  compartment,
  moduleSpecifier,
  pendingJobs,
  moduleLoads,
  errors)=>
     {
  const { importHook, moduleMap, moduleMapHook, moduleRecords}=   weakmapGet(
    compartmentPrivateFields,
    compartment);


  // Follow moduleMap, or moduleMapHook if present.
  let aliasNamespace=  moduleMap[moduleSpecifier];
  if( aliasNamespace===  undefined&&  moduleMapHook!==  undefined) {
    aliasNamespace=  moduleMapHook(moduleSpecifier);
   }
  if( typeof aliasNamespace===  'string') {
    // eslint-disable-next-line @endo/no-polymorphic-call
    assert.fail(
      d `Cannot map module ${q(moduleSpecifier)} to ${q(
        aliasNamespace)
        } in parent compartment, not yet implemented`,
      TypeError);

   }else if( aliasNamespace!==  undefined) {
    const alias=  weakmapGet(moduleAliases, aliasNamespace);
    if( alias===  undefined) {
      // eslint-disable-next-line @endo/no-polymorphic-call
      assert.fail(
        d `Cannot map module ${q(
          moduleSpecifier)
          } because the value is not a module exports namespace, or is from another realm`,
        ReferenceError);

     }
    // Behold: recursion.
    // eslint-disable-next-line no-use-before-define
    const aliasRecord=  await memoizedLoadWithErrorAnnotation(
      compartmentPrivateFields,
      moduleAliases,
      alias.compartment,
      alias.specifier,
      pendingJobs,
      moduleLoads,
      errors);

    mapSet(moduleRecords, moduleSpecifier, aliasRecord);
    return aliasRecord;
   }

  if( mapHas(moduleRecords, moduleSpecifier)) {
    return mapGet(moduleRecords, moduleSpecifier);
   }

  const staticModuleRecord=  await importHook(moduleSpecifier);

  if( staticModuleRecord===  null||  typeof staticModuleRecord!==  'object') {
    Fail `importHook must return a promise for an object, for module ${q(
      moduleSpecifier)
      } in compartment ${q(compartment.name)}`;
   }

  // check if record is a RedirectStaticModuleInterface
  if( staticModuleRecord.specifier!==  undefined) {
    // check if this redirect with an explicit record
    if( staticModuleRecord.record!==  undefined) {
      // ensure expected record shape
      if( staticModuleRecord.compartment!==  undefined) {
        throw TypeError(
          'Cannot redirect to an explicit record with a specified compartment');

       }
      const {
        compartment: aliasCompartment=  compartment,
        specifier: aliasSpecifier=  moduleSpecifier,
        record: aliasModuleRecord,
        importMeta}=
          staticModuleRecord;

      const aliasRecord=  loadRecord(
        compartmentPrivateFields,
        moduleAliases,
        aliasCompartment,
        aliasSpecifier,
        aliasModuleRecord,
        pendingJobs,
        moduleLoads,
        errors,
        importMeta);

      mapSet(moduleRecords, moduleSpecifier, aliasRecord);
      return aliasRecord;
     }

    // check if this redirect with an explicit compartment
    if( staticModuleRecord.compartment!==  undefined) {
      // ensure expected record shape
      if( staticModuleRecord.importMeta!==  undefined) {
        throw TypeError(
          'Cannot redirect to an implicit record with a specified importMeta');

       }
      // Behold: recursion.
      // eslint-disable-next-line no-use-before-define
      const aliasRecord=  await memoizedLoadWithErrorAnnotation(
        compartmentPrivateFields,
        moduleAliases,
        staticModuleRecord.compartment,
        staticModuleRecord.specifier,
        pendingJobs,
        moduleLoads,
        errors);

      mapSet(moduleRecords, moduleSpecifier, aliasRecord);
      return aliasRecord;
     }

    throw TypeError('Unnexpected RedirectStaticModuleInterface record shape');
   }

  return loadRecord(
    compartmentPrivateFields,
    moduleAliases,
    compartment,
    moduleSpecifier,
    staticModuleRecord,
    pendingJobs,
    moduleLoads,
    errors);

 };

const memoizedLoadWithErrorAnnotation=  async(
  compartmentPrivateFields,
  moduleAliases,
  compartment,
  moduleSpecifier,
  pendingJobs,
  moduleLoads,
  errors)=>
     {
  const { name: compartmentName}=   weakmapGet(
    compartmentPrivateFields,
    compartment);


  // Prevent data-lock from recursion into branches visited in dependent loads.
  let compartmentLoading=  mapGet(moduleLoads, compartment);
  if( compartmentLoading===  undefined) {
    compartmentLoading=  new Map();
    mapSet(moduleLoads, compartment, compartmentLoading);
   }
  let moduleLoading=  mapGet(compartmentLoading, moduleSpecifier);
  if( moduleLoading!==  undefined) {
    return moduleLoading;
   }

  moduleLoading=  promiseCatch(
    loadWithoutErrorAnnotation(
      compartmentPrivateFields,
      moduleAliases,
      compartment,
      moduleSpecifier,
      pendingJobs,
      moduleLoads,
      errors),

    (error)=>{
      // eslint-disable-next-line @endo/no-polymorphic-call
      assert.note(
        error,
        d `${error.message}, loading ${q(moduleSpecifier)} in compartment ${q(
          compartmentName)
          }`);

      throw error;
     });


  mapSet(compartmentLoading, moduleSpecifier, moduleLoading);

  return moduleLoading;
 };

/*
 * `load` asynchronously gathers the `StaticModuleRecord`s for a module and its
 * transitive dependencies.
 * The module records refer to each other by a reference to the dependency's
 * compartment and the specifier of the module within its own compartment.
 * This graph is then ready to be synchronously linked and executed.
 */
const        load=  async(
  compartmentPrivateFields,
  moduleAliases,
  compartment,
  moduleSpecifier)=>
     {
  const { name: compartmentName}=   weakmapGet(
    compartmentPrivateFields,
    compartment);


  /** @type {Set<Promise<undefined>>} */
  const pendingJobs=  new Set();
  /** @type {Map<object, Map<string, Promise<Record<any, any>>>>} */
  const moduleLoads=  new Map();
  /** @type {Array<Error>} */
  const errors=  [];

  const dependencyLoaded=  memoizedLoadWithErrorAnnotation(
    compartmentPrivateFields,
    moduleAliases,
    compartment,
    moduleSpecifier,
    pendingJobs,
    moduleLoads,
    errors);

  setAdd(
    pendingJobs,
    promiseThen(dependencyLoaded, noop, (error)=>{
      arrayPush(errors, error);
     }));


  // Drain pending jobs queue.
  // Each job is a promise for undefined, regardless of success or failure.
  // Before we add a job to the queue, we catch any error and push it into the
  // `errors` accumulator.
  for( const job of pendingJobs) {
    // eslint-disable-next-line no-await-in-loop
    await job;
   }

  // Throw an aggregate error if there were any errors.
  if( errors.length>  0) {
    throw TypeError(
       `Failed to load module ${q(moduleSpecifier)} in package ${q(
        compartmentName)
        } (${errors.length} underlying failures: ${arrayJoin(
        arrayMap(errors, (error)=>error.message),
        ', ')
        }`);

   }
 };$h‍_once.load(load);
})
,
// === functors[39] ===
(({   imports: $h‍_imports,   liveVar: $h‍_live,   onceVar: $h‍_once,   importMeta: $h‍____meta,  }) => {   let makeAlias,Proxy,TypeError,create,freeze,mapGet,mapHas,mapSet,ownKeys,reflectGet,reflectGetOwnPropertyDescriptor,reflectHas,reflectIsExtensible,reflectPreventExtensions,weakmapSet,assert;$h‍_imports([["./module-load.js", [["makeAlias", [$h‍_a => (makeAlias = $h‍_a)]]]],["./commons.js", [["Proxy", [$h‍_a => (Proxy = $h‍_a)]],["TypeError", [$h‍_a => (TypeError = $h‍_a)]],["create", [$h‍_a => (create = $h‍_a)]],["freeze", [$h‍_a => (freeze = $h‍_a)]],["mapGet", [$h‍_a => (mapGet = $h‍_a)]],["mapHas", [$h‍_a => (mapHas = $h‍_a)]],["mapSet", [$h‍_a => (mapSet = $h‍_a)]],["ownKeys", [$h‍_a => (ownKeys = $h‍_a)]],["reflectGet", [$h‍_a => (reflectGet = $h‍_a)]],["reflectGetOwnPropertyDescriptor", [$h‍_a => (reflectGetOwnPropertyDescriptor = $h‍_a)]],["reflectHas", [$h‍_a => (reflectHas = $h‍_a)]],["reflectIsExtensible", [$h‍_a => (reflectIsExtensible = $h‍_a)]],["reflectPreventExtensions", [$h‍_a => (reflectPreventExtensions = $h‍_a)]],["weakmapSet", [$h‍_a => (weakmapSet = $h‍_a)]]]],["./error/assert.js", [["assert", [$h‍_a => (assert = $h‍_a)]]]]]);   






























const { quote: q}=   assert;

// `deferExports` creates a module's exports proxy, proxied exports, and
// activator.
// A `Compartment` can create a module for any module specifier, regardless of
// whether it is loadable or executable, and use that object as a token that
// can be fed into another compartment's module map.
// Only after the specified module has been analyzed is it possible for the
// module namespace proxy to behave properly, so it throws exceptions until
// after the compartment has begun executing the module.
// The module instance must freeze the proxied exports and activate the exports
// proxy before executing the module.
//
// The module exports proxy's behavior differs from the ECMAScript 262
// specification for "module namespace exotic objects" only in that according
// to the specification value property descriptors have a non-writable "value"
// and this implementation models all properties with accessors.
//
// https://tc39.es/ecma262/#sec-module-namespace-exotic-objects
//
const        deferExports=  ()=>  {
  let active=  false;
  const proxiedExports=  create(null);
  return freeze({
    activate() {
      active=  true;
     },
    proxiedExports,
    exportsProxy: new Proxy(proxiedExports, {
      get(_target, name, receiver) {
        if( !active) {
          throw TypeError(
             `Cannot get property ${q(
              name)
              } of module exports namespace, the module has not yet begun to execute`);

         }
        return reflectGet(proxiedExports, name, receiver);
       },
      set(_target, name, _value) {
        throw TypeError(
           `Cannot set property ${q(name)} of module exports namespace`);

       },
      has(_target, name) {
        if( !active) {
          throw TypeError(
             `Cannot check property ${q(
              name)
              }, the module has not yet begun to execute`);

         }
        return reflectHas(proxiedExports, name);
       },
      deleteProperty(_target, name) {
        throw TypeError(
           `Cannot delete property ${q(name)}s of module exports namespace`);

       },
      ownKeys(_target) {
        if( !active) {
          throw TypeError(
            'Cannot enumerate keys, the module has not yet begun to execute');

         }
        return ownKeys(proxiedExports);
       },
      getOwnPropertyDescriptor(_target, name) {
        if( !active) {
          throw TypeError(
             `Cannot get own property descriptor ${q(
              name)
              }, the module has not yet begun to execute`);

         }
        return reflectGetOwnPropertyDescriptor(proxiedExports, name);
       },
      preventExtensions(_target) {
        if( !active) {
          throw TypeError(
            'Cannot prevent extensions of module exports namespace, the module has not yet begun to execute');

         }
        return reflectPreventExtensions(proxiedExports);
       },
      isExtensible() {
        if( !active) {
          throw TypeError(
            'Cannot check extensibility of module exports namespace, the module has not yet begun to execute');

         }
        return reflectIsExtensible(proxiedExports);
       },
      getPrototypeOf(_target) {
        return null;
       },
      setPrototypeOf(_target, _proto) {
        throw TypeError('Cannot set prototype of module exports namespace');
       },
      defineProperty(_target, name, _descriptor) {
        throw TypeError(
           `Cannot define property ${q(name)} of module exports namespace`);

       },
      apply(_target, _thisArg, _args) {
        throw TypeError(
          'Cannot call module exports namespace, it is not a function');

       },
      construct(_target, _args) {
        throw TypeError(
          'Cannot construct module exports namespace, it is not a constructor');

       }})});


 };

// `getDeferredExports` memoizes the creation of a deferred module exports
// namespace proxy for any abritrary full specifier in a compartment.
// It also records the compartment and specifier affiliated with that module
// exports namespace proxy so it can be used as an alias into another
// compartment when threaded through a compartment's `moduleMap` argument.
$h‍_once.deferExports(deferExports);const getDeferredExports=(
  compartment,
  compartmentPrivateFields,
  moduleAliases,
  specifier)=>
     {
  const { deferredExports}=   compartmentPrivateFields;
  if( !mapHas(deferredExports, specifier)) {
    const deferred=  deferExports();
    weakmapSet(
      moduleAliases,
      deferred.exportsProxy,
      makeAlias(compartment, specifier));

    mapSet(deferredExports, specifier, deferred);
   }
  return mapGet(deferredExports, specifier);
 };$h‍_once.getDeferredExports(getDeferredExports);
})
,
// === functors[40] ===
(({   imports: $h‍_imports,   liveVar: $h‍_live,   onceVar: $h‍_once,   importMeta: $h‍____meta,  }) => {   let TypeError,arrayPush,create,getOwnPropertyDescriptors,evadeHtmlCommentTest,evadeImportExpressionTest,rejectSomeDirectEvalExpressions,makeSafeEvaluator;$h‍_imports([["./commons.js", [["TypeError", [$h‍_a => (TypeError = $h‍_a)]],["arrayPush", [$h‍_a => (arrayPush = $h‍_a)]],["create", [$h‍_a => (create = $h‍_a)]],["getOwnPropertyDescriptors", [$h‍_a => (getOwnPropertyDescriptors = $h‍_a)]]]],["./transforms.js", [["evadeHtmlCommentTest", [$h‍_a => (evadeHtmlCommentTest = $h‍_a)]],["evadeImportExpressionTest", [$h‍_a => (evadeImportExpressionTest = $h‍_a)]],["rejectSomeDirectEvalExpressions", [$h‍_a => (rejectSomeDirectEvalExpressions = $h‍_a)]]]],["./make-safe-evaluator.js", [["makeSafeEvaluator", [$h‍_a => (makeSafeEvaluator = $h‍_a)]]]]]);   













const        provideCompartmentEvaluator=  (compartmentFields, options)=>  {
  const { sloppyGlobalsMode=  false, __moduleShimLexicals__=  undefined}=
    options;

  let safeEvaluate;

  if( __moduleShimLexicals__===  undefined&&  !sloppyGlobalsMode) {
    ({ safeEvaluate}=   compartmentFields);
   }else {
    // The scope proxy or global lexicals are different from the
    // shared evaluator so we need to build a new one

    let { globalTransforms}=   compartmentFields;
    const { globalObject}=   compartmentFields;

    let moduleLexicals;
    if( __moduleShimLexicals__!==  undefined) {
      // When using `evaluate` for ESM modules, as should only occur from the
      // module-shim's module-instance.js, we do not reveal the SES-shim's
      // module-to-program translation, as this is not standardizable behavior.
      // However, the `localTransforms` will come from the `__shimTransforms__`
      // Compartment option in this case, which is a non-standardizable escape
      // hatch so programs designed specifically for the SES-shim
      // implementation may opt-in to use the same transforms for `evaluate`
      // and `import`, at the expense of being tightly coupled to SES-shim.
      globalTransforms=  undefined;

      moduleLexicals=  create(
        null,
        getOwnPropertyDescriptors(__moduleShimLexicals__));

     }

    ({ safeEvaluate}=   makeSafeEvaluator({
      globalObject,
      moduleLexicals,
      globalTransforms,
      sloppyGlobalsMode}));

   }

  return { safeEvaluate};
 };$h‍_once.provideCompartmentEvaluator(provideCompartmentEvaluator);

const        compartmentEvaluate=  (compartmentFields, source, options)=>  {
  // Perform this check first to avoid unnecessary sanitizing.
  // TODO Maybe relax string check and coerce instead:
  // https://github.com/tc39/proposal-dynamic-code-brand-checks
  if( typeof source!==  'string') {
    throw TypeError('first argument of evaluate() must be a string');
   }

  // Extract options, and shallow-clone transforms.
  const {
    transforms=  [],
    __evadeHtmlCommentTest__=  false,
    __evadeImportExpressionTest__=  false,
    __rejectSomeDirectEvalExpressions__=  true  // Note default on
}=    options;
  const localTransforms=  [...transforms];
  if( __evadeHtmlCommentTest__===  true) {
    arrayPush(localTransforms, evadeHtmlCommentTest);
   }
  if( __evadeImportExpressionTest__===  true) {
    arrayPush(localTransforms, evadeImportExpressionTest);
   }
  if( __rejectSomeDirectEvalExpressions__===  true) {
    arrayPush(localTransforms, rejectSomeDirectEvalExpressions);
   }

  const { safeEvaluate}=   provideCompartmentEvaluator(
    compartmentFields,
    options);


  return safeEvaluate(source, {
    localTransforms});

 };$h‍_once.compartmentEvaluate(compartmentEvaluate);
})
,
// === functors[41] ===
(({   imports: $h‍_imports,   liveVar: $h‍_live,   onceVar: $h‍_once,   importMeta: $h‍____meta,  }) => {   let assert,getDeferredExports,ReferenceError,SyntaxError,TypeError,arrayForEach,arrayIncludes,arrayPush,arraySome,arraySort,create,defineProperty,entries,freeze,isArray,keys,mapGet,weakmapGet,reflectHas,assign,compartmentEvaluate;$h‍_imports([["./error/assert.js", [["assert", [$h‍_a => (assert = $h‍_a)]]]],["./module-proxy.js", [["getDeferredExports", [$h‍_a => (getDeferredExports = $h‍_a)]]]],["./commons.js", [["ReferenceError", [$h‍_a => (ReferenceError = $h‍_a)]],["SyntaxError", [$h‍_a => (SyntaxError = $h‍_a)]],["TypeError", [$h‍_a => (TypeError = $h‍_a)]],["arrayForEach", [$h‍_a => (arrayForEach = $h‍_a)]],["arrayIncludes", [$h‍_a => (arrayIncludes = $h‍_a)]],["arrayPush", [$h‍_a => (arrayPush = $h‍_a)]],["arraySome", [$h‍_a => (arraySome = $h‍_a)]],["arraySort", [$h‍_a => (arraySort = $h‍_a)]],["create", [$h‍_a => (create = $h‍_a)]],["defineProperty", [$h‍_a => (defineProperty = $h‍_a)]],["entries", [$h‍_a => (entries = $h‍_a)]],["freeze", [$h‍_a => (freeze = $h‍_a)]],["isArray", [$h‍_a => (isArray = $h‍_a)]],["keys", [$h‍_a => (keys = $h‍_a)]],["mapGet", [$h‍_a => (mapGet = $h‍_a)]],["weakmapGet", [$h‍_a => (weakmapGet = $h‍_a)]],["reflectHas", [$h‍_a => (reflectHas = $h‍_a)]],["assign", [$h‍_a => (assign = $h‍_a)]]]],["./compartment-evaluate.js", [["compartmentEvaluate", [$h‍_a => (compartmentEvaluate = $h‍_a)]]]]]);   























const { quote: q}=   assert;

const        makeThirdPartyModuleInstance=  (
  compartmentPrivateFields,
  staticModuleRecord,
  compartment,
  moduleAliases,
  moduleSpecifier,
  resolvedImports)=>
     {
  const { exportsProxy, proxiedExports, activate}=   getDeferredExports(
    compartment,
    weakmapGet(compartmentPrivateFields, compartment),
    moduleAliases,
    moduleSpecifier);


  const notifiers=  create(null);

  if( staticModuleRecord.exports) {
    if(
      !isArray(staticModuleRecord.exports)||
      arraySome(staticModuleRecord.exports, (name)=>typeof name!==  'string'))
      {
      throw TypeError(
         `SES third-party static module record "exports" property must be an array of strings for module ${moduleSpecifier}`);

     }
    arrayForEach(staticModuleRecord.exports, (name)=>{
      let value=  proxiedExports[name];
      const updaters=  [];

      const get=  ()=>  value;

      const set=  (newValue)=>{
        value=  newValue;
        for( const updater of updaters) {
          updater(newValue);
         }
       };

      defineProperty(proxiedExports, name, {
        get,
        set,
        enumerable: true,
        configurable: false});


      notifiers[name]=  (update)=>{
        arrayPush(updaters, update);
        update(value);
       };
     });
    // This is enough to support import * from cjs - the '*' field doesn't need to be in exports nor proxiedExports because import will only ever access it via notifiers
    notifiers['*']=  (update)=>{
      update(proxiedExports);
     };
   }

  const localState=  {
    activated: false};

  return freeze({
    notifiers,
    exportsProxy,
    execute() {
      if( reflectHas(localState, 'errorFromExecute')) {
        throw localState.errorFromExecute;
       }
      if( !localState.activated) {
        activate();
        localState.activated=  true;
        try {
          // eslint-disable-next-line @endo/no-polymorphic-call
          staticModuleRecord.execute(
            proxiedExports,
            compartment,
            resolvedImports);

         }catch( err) {
          localState.errorFromExecute=  err;
          throw err;
         }
       }
     }});

 };

// `makeModuleInstance` takes a module's compartment record, the live import
// namespace, and a global object; and produces a module instance.
// The module instance carries the proxied module exports namespace (the
// "exports"), notifiers to update the module's internal import namespace, and
// an idempotent execute function.
// The module exports namespace is a proxy to the proxied exports namespace
// that the execution of the module instance populates.
$h‍_once.makeThirdPartyModuleInstance(makeThirdPartyModuleInstance);const makeModuleInstance=(
  privateFields,
  moduleAliases,
  moduleRecord,
  importedInstances)=>
     {
  const {
    compartment,
    moduleSpecifier,
    staticModuleRecord,
    importMeta: moduleRecordMeta}=
      moduleRecord;
  const {
    reexports: exportAlls=  [],
    __syncModuleProgram__: functorSource,
    __fixedExportMap__: fixedExportMap=  {},
    __liveExportMap__: liveExportMap=  {},
    __reexportMap__: reexportMap=  {},
    __needsImportMeta__: needsImportMeta=  false,
    __syncModuleFunctor__}=
      staticModuleRecord;

  const compartmentFields=  weakmapGet(privateFields, compartment);

  const { __shimTransforms__, importMetaHook}=   compartmentFields;

  const { exportsProxy, proxiedExports, activate}=   getDeferredExports(
    compartment,
    compartmentFields,
    moduleAliases,
    moduleSpecifier);


  // {_exportName_: getter} module exports namespace
  // object (eventually proxied).
  const exportsProps=  create(null);

  // {_localName_: accessor} proxy traps for moduleLexicals and live bindings.
  // The moduleLexicals object is frozen and the corresponding properties of
  // moduleLexicals must be immutable, so we copy the descriptors.
  const moduleLexicals=  create(null);

  // {_localName_: init(initValue) -> initValue} used by the
  // rewritten code to initialize exported fixed bindings.
  const onceVar=  create(null);

  // {_localName_: update(newValue)} used by the rewritten code to
  // both initialize and update live bindings.
  const liveVar=  create(null);

  const importMeta=  create(null);
  if( moduleRecordMeta) {
    assign(importMeta, moduleRecordMeta);
   }
  if( needsImportMeta&&  importMetaHook) {
    importMetaHook(moduleSpecifier, importMeta);
   }

  // {_localName_: [{get, set, notify}]} used to merge all the export updaters.
  const localGetNotify=  create(null);

  // {[importName: string]: notify(update(newValue))} Used by code that imports
  // one of this module's exports, so that their update function will
  // be notified when this binding is initialized or updated.
  const notifiers=  create(null);

  arrayForEach(entries(fixedExportMap), ([fixedExportName, [localName]])=>  {
    let fixedGetNotify=  localGetNotify[localName];
    if( !fixedGetNotify) {
      // fixed binding state
      let value;
      let tdz=  true;
      /** @type {null | Array<(value: any) => void>} */
      let optUpdaters=  [];

      // tdz sensitive getter
      const get=  ()=>  {
        if( tdz) {
          throw ReferenceError( `binding ${q(localName)} not yet initialized`);
         }
        return value;
       };

      // leave tdz once
      const init=  freeze((initValue)=>{
        // init with initValue of a declared const binding, and return
        // it.
        if( !tdz) {
          throw TypeError(
             `Internal: binding ${q(localName)} already initialized`);

         }
        value=  initValue;
        const updaters=  optUpdaters;
        optUpdaters=  null;
        tdz=  false;
        for( const updater of updaters||  []) {
          updater(initValue);
         }
        return initValue;
       });

      // If still tdz, register update for notification later.
      // Otherwise, update now.
      const notify=  (updater)=>{
        if( updater===  init) {
          // Prevent recursion.
          return;
         }
        if( tdz) {
          arrayPush(optUpdaters||  [], updater);
         }else {
          updater(value);
         }
       };

      // Need these for additional exports of the local variable.
      fixedGetNotify=  {
        get,
        notify};

      localGetNotify[localName]=  fixedGetNotify;
      onceVar[localName]=  init;
     }

    exportsProps[fixedExportName]=  {
      get: fixedGetNotify.get,
      set: undefined,
      enumerable: true,
      configurable: false};


    notifiers[fixedExportName]=  fixedGetNotify.notify;
   });

  arrayForEach(
    entries(liveExportMap),
    ([liveExportName, [localName, setProxyTrap]])=>  {
      let liveGetNotify=  localGetNotify[localName];
      if( !liveGetNotify) {
        // live binding state
        let value;
        let tdz=  true;
        const updaters=  [];

        // tdz sensitive getter
        const get=  ()=>  {
          if( tdz) {
            throw ReferenceError(
               `binding ${q(liveExportName)} not yet initialized`);

           }
          return value;
         };

        // This must be usable locally for the translation of initializing
        // a declared local live binding variable.
        //
        // For reexported variable, this is also an update function to
        // register for notification with the downstream import, which we
        // must assume to be live. Thus, it can be called independent of
        // tdz but always leaves tdz. Such reexporting creates a tree of
        // bindings. This lets the tree be hooked up even if the imported
        // module instance isn't initialized yet, as may happen in cycles.
        const update=  freeze((newValue)=>{
          value=  newValue;
          tdz=  false;
          for( const updater of updaters) {
            updater(newValue);
           }
         });

        // tdz sensitive setter
        const set=  (newValue)=>{
          if( tdz) {
            throw ReferenceError( `binding ${q(localName)} not yet initialized`);
           }
          value=  newValue;
          for( const updater of updaters) {
            updater(newValue);
           }
         };

        // Always register the updater function.
        // If not in tdz, also update now.
        const notify=  (updater)=>{
          if( updater===  update) {
            // Prevent recursion.
            return;
           }
          arrayPush(updaters, updater);
          if( !tdz) {
            updater(value);
           }
         };

        liveGetNotify=  {
          get,
          notify};


        localGetNotify[localName]=  liveGetNotify;
        if( setProxyTrap) {
          defineProperty(moduleLexicals, localName, {
            get,
            set,
            enumerable: true,
            configurable: false});

         }
        liveVar[localName]=  update;
       }

      exportsProps[liveExportName]=  {
        get: liveGetNotify.get,
        set: undefined,
        enumerable: true,
        configurable: false};


      notifiers[liveExportName]=  liveGetNotify.notify;
     });


  const notifyStar=  (update)=>{
    update(proxiedExports);
   };
  notifiers['*']=  notifyStar;

  // Per the calling convention for the moduleFunctor generated from
  // an ESM, the `imports` function gets called once up front
  // to populate or arrange the population of imports and reexports.
  // The generated code produces an `updateRecord`: the means for
  // the linker to update the imports and exports of the module.
  // The updateRecord must conform to moduleAnalysis.imports
  // updateRecord = Map<specifier, importUpdaters>
  // importUpdaters = Map<importName, [update(newValue)*]>
  function imports(updateRecord) {
    // By the time imports is called, the importedInstances should already be
    // initialized with module instances that satisfy
    // imports.
    // importedInstances = Map[_specifier_, { notifiers, module, execute }]
    // notifiers = { [importName: string]: notify(update(newValue))}

    // export * cannot export default.
    const candidateAll=  create(null);
    candidateAll.default=  false;
    for( const [specifier, importUpdaters]of  updateRecord) {
      const instance=  mapGet(importedInstances, specifier);
      // The module instance object is an internal literal, does not bind this,
      // and never revealed outside the SES shim.
      // There are two instantiation sites for instances and they are both in
      // this module.
      // eslint-disable-next-line @endo/no-polymorphic-call
      instance.execute(); // bottom up cycle tolerant
      const { notifiers: importNotifiers}=   instance;
      for( const [importName, updaters]of  importUpdaters) {
        const importNotify=  importNotifiers[importName];
        if( !importNotify) {
          throw SyntaxError(
             `The requested module '${specifier}' does not provide an export named '${importName}'`);

         }
        for( const updater of updaters) {
          importNotify(updater);
         }
       }
      if( arrayIncludes(exportAlls, specifier)) {
        // Make all these imports candidates.
        // Note names don't change in reexporting all
        for( const [importAndExportName, importNotify]of  entries(
          importNotifiers))
           {
          if( candidateAll[importAndExportName]===  undefined) {
            candidateAll[importAndExportName]=  importNotify;
           }else {
            // Already a candidate: remove ambiguity.
            candidateAll[importAndExportName]=  false;
           }
         }
       }
      if( reexportMap[specifier]) {
        // Make named reexports candidates too.
        for( const [localName, exportedName]of  reexportMap[specifier]) {
          candidateAll[exportedName]=  importNotifiers[localName];
         }
       }
     }

    for( const [exportName, notify]of  entries(candidateAll)) {
      if( !notifiers[exportName]&&  notify!==  false) {
        notifiers[exportName]=  notify;

        // exported live binding state
        let value;
        const update=  (newValue)=> value=  newValue;
        notify(update);
        exportsProps[exportName]=  {
          get() {
            return value;
           },
          set: undefined,
          enumerable: true,
          configurable: false};

       }
     }

    // Sort the module exports namespace as per spec.
    // The module exports namespace will be wrapped in a module namespace
    // exports proxy which will serve as a "module exports namespace exotic
    // object".
    // Sorting properties is not generally reliable because some properties may
    // be symbols, and symbols do not have an inherent relative order, but
    // since all properties of the exports namespace must be keyed by a string
    // and the string must correspond to a valid identifier, sorting these
    // properties works for this specific case.
    arrayForEach(arraySort(keys(exportsProps)), (k)=>
      defineProperty(proxiedExports, k, exportsProps[k]));


    freeze(proxiedExports);
    activate();
   }

  let optFunctor;
  if( __syncModuleFunctor__!==  undefined) {
    optFunctor=  __syncModuleFunctor__;
   }else {
    optFunctor=  compartmentEvaluate(compartmentFields, functorSource, {
      globalObject: compartment.globalThis,
      transforms: __shimTransforms__,
      __moduleShimLexicals__: moduleLexicals});

   }
  let didThrow=  false;
  let thrownError;
  function execute() {
    if( optFunctor) {
      // uninitialized
      const functor=  optFunctor;
      optFunctor=  null;
      // initializing - call with `this` of `undefined`.
      try {
        functor(
          freeze({
            imports: freeze(imports),
            onceVar: freeze(onceVar),
            liveVar: freeze(liveVar),
            importMeta}));


       }catch( e) {
        didThrow=  true;
        thrownError=  e;
       }
      // initialized
     }
    if( didThrow) {
      throw thrownError;
     }
   }

  return freeze({
    notifiers,
    exportsProxy,
    execute});

 };$h‍_once.makeModuleInstance(makeModuleInstance);
})
,
// === functors[42] ===
(({   imports: $h‍_imports,   liveVar: $h‍_live,   onceVar: $h‍_once,   importMeta: $h‍____meta,  }) => {   let assert,makeModuleInstance,makeThirdPartyModuleInstance,Map,ReferenceError,TypeError,entries,isArray,isObject,mapGet,mapHas,mapSet,weakmapGet;$h‍_imports([["./error/assert.js", [["assert", [$h‍_a => (assert = $h‍_a)]]]],["./module-instance.js", [["makeModuleInstance", [$h‍_a => (makeModuleInstance = $h‍_a)]],["makeThirdPartyModuleInstance", [$h‍_a => (makeThirdPartyModuleInstance = $h‍_a)]]]],["./commons.js", [["Map", [$h‍_a => (Map = $h‍_a)]],["ReferenceError", [$h‍_a => (ReferenceError = $h‍_a)]],["TypeError", [$h‍_a => (TypeError = $h‍_a)]],["entries", [$h‍_a => (entries = $h‍_a)]],["isArray", [$h‍_a => (isArray = $h‍_a)]],["isObject", [$h‍_a => (isObject = $h‍_a)]],["mapGet", [$h‍_a => (mapGet = $h‍_a)]],["mapHas", [$h‍_a => (mapHas = $h‍_a)]],["mapSet", [$h‍_a => (mapSet = $h‍_a)]],["weakmapGet", [$h‍_a => (weakmapGet = $h‍_a)]]]]]);   



























const { Fail, quote: q}=   assert;

// `link` creates `ModuleInstances` and `ModuleNamespaces` for a module and its
// transitive dependencies and connects their imports and exports.
// After linking, the resulting working set is ready to be executed.
// The linker only concerns itself with module namespaces that are objects with
// property descriptors for their exports, which the Compartment proxies with
// the actual `ModuleNamespace`.
const        link=  (
  compartmentPrivateFields,
  moduleAliases,
  compartment,
  moduleSpecifier)=>
     {
  const { name: compartmentName, moduleRecords}=   weakmapGet(
    compartmentPrivateFields,
    compartment);


  const moduleRecord=  mapGet(moduleRecords, moduleSpecifier);
  if( moduleRecord===  undefined) {
    throw ReferenceError(
       `Missing link to module ${q(moduleSpecifier)} from compartment ${q(
        compartmentName)
        }`);

   }

  // Mutual recursion so there's no confusion about which
  // compartment is in context: the module record may be in another
  // compartment, denoted by moduleRecord.compartment.
  // eslint-disable-next-line no-use-before-define
  return instantiate(compartmentPrivateFields, moduleAliases, moduleRecord);
 };$h‍_once.link(link);

function isPrecompiled(staticModuleRecord) {
  return typeof staticModuleRecord.__syncModuleProgram__===  'string';
 }

function validatePrecompiledStaticModuleRecord(
  staticModuleRecord,
  moduleSpecifier)
  {
  const { __fixedExportMap__, __liveExportMap__}=   staticModuleRecord;
  isObject(__fixedExportMap__)||
    Fail `Property '__fixedExportMap__' of a precompiled module record must be an object, got ${q(
      __fixedExportMap__)
      }, for module ${q(moduleSpecifier)}`;
  isObject(__liveExportMap__)||
    Fail `Property '__liveExportMap__' of a precompiled module record must be an object, got ${q(
      __liveExportMap__)
      }, for module ${q(moduleSpecifier)}`;
 }

function isThirdParty(staticModuleRecord) {
  return typeof staticModuleRecord.execute===  'function';
 }

function validateThirdPartyStaticModuleRecord(
  staticModuleRecord,
  moduleSpecifier)
  {
  const { exports}=   staticModuleRecord;
  isArray(exports)||
    Fail `Property 'exports' of a third-party static module record must be an array, got ${q(
      exports)
      }, for module ${q(moduleSpecifier)}`;
 }

function validateStaticModuleRecord(staticModuleRecord, moduleSpecifier) {
  isObject(staticModuleRecord)||
    Fail `Static module records must be of type object, got ${q(
      staticModuleRecord)
      }, for module ${q(moduleSpecifier)}`;
  const { imports, exports, reexports=  []}=   staticModuleRecord;
  isArray(imports)||
    Fail `Property 'imports' of a static module record must be an array, got ${q(
      imports)
      }, for module ${q(moduleSpecifier)}`;
  isArray(exports)||
    Fail `Property 'exports' of a precompiled module record must be an array, got ${q(
      exports)
      }, for module ${q(moduleSpecifier)}`;
  isArray(reexports)||
    Fail `Property 'reexports' of a precompiled module record must be an array if present, got ${q(
      reexports)
      }, for module ${q(moduleSpecifier)}`;
 }

const        instantiate=  (
  compartmentPrivateFields,
  moduleAliases,
  moduleRecord)=>
     {
  const { compartment, moduleSpecifier, resolvedImports, staticModuleRecord}=
    moduleRecord;
  const { instances}=   weakmapGet(compartmentPrivateFields, compartment);

  // Memoize.
  if( mapHas(instances, moduleSpecifier)) {
    return mapGet(instances, moduleSpecifier);
   }

  validateStaticModuleRecord(staticModuleRecord, moduleSpecifier);

  const importedInstances=  new Map();
  let moduleInstance;
  if( isPrecompiled(staticModuleRecord)) {
    validatePrecompiledStaticModuleRecord(staticModuleRecord, moduleSpecifier);
    moduleInstance=  makeModuleInstance(
      compartmentPrivateFields,
      moduleAliases,
      moduleRecord,
      importedInstances);

   }else if( isThirdParty(staticModuleRecord)) {
    validateThirdPartyStaticModuleRecord(staticModuleRecord, moduleSpecifier);
    moduleInstance=  makeThirdPartyModuleInstance(
      compartmentPrivateFields,
      staticModuleRecord,
      compartment,
      moduleAliases,
      moduleSpecifier,
      resolvedImports);

   }else {
    throw TypeError(
       `importHook must return a static module record, got ${q(
        staticModuleRecord)
        }`);

   }

  // Memoize.
  mapSet(instances, moduleSpecifier, moduleInstance);

  // Link dependency modules.
  for( const [importSpecifier, resolvedSpecifier]of  entries(resolvedImports)) {
    const importedInstance=  link(
      compartmentPrivateFields,
      moduleAliases,
      compartment,
      resolvedSpecifier);

    mapSet(importedInstances, importSpecifier, importedInstance);
   }

  return moduleInstance;
 };$h‍_once.instantiate(instantiate);
})
,
// === functors[43] ===
(({   imports: $h‍_imports,   liveVar: $h‍_live,   onceVar: $h‍_once,   importMeta: $h‍____meta,  }) => {   let Map,ReferenceError,TypeError,WeakMap,assign,defineProperties,entries,promiseThen,weakmapGet,weakmapSet,setGlobalObjectSymbolUnscopables,setGlobalObjectConstantProperties,setGlobalObjectMutableProperties,setGlobalObjectEvaluators,sharedGlobalPropertyNames,load,link,getDeferredExports,assert,compartmentEvaluate,makeSafeEvaluator;$h‍_imports([["./commons.js", [["Map", [$h‍_a => (Map = $h‍_a)]],["ReferenceError", [$h‍_a => (ReferenceError = $h‍_a)]],["TypeError", [$h‍_a => (TypeError = $h‍_a)]],["WeakMap", [$h‍_a => (WeakMap = $h‍_a)]],["assign", [$h‍_a => (assign = $h‍_a)]],["defineProperties", [$h‍_a => (defineProperties = $h‍_a)]],["entries", [$h‍_a => (entries = $h‍_a)]],["promiseThen", [$h‍_a => (promiseThen = $h‍_a)]],["weakmapGet", [$h‍_a => (weakmapGet = $h‍_a)]],["weakmapSet", [$h‍_a => (weakmapSet = $h‍_a)]]]],["./global-object.js", [["setGlobalObjectSymbolUnscopables", [$h‍_a => (setGlobalObjectSymbolUnscopables = $h‍_a)]],["setGlobalObjectConstantProperties", [$h‍_a => (setGlobalObjectConstantProperties = $h‍_a)]],["setGlobalObjectMutableProperties", [$h‍_a => (setGlobalObjectMutableProperties = $h‍_a)]],["setGlobalObjectEvaluators", [$h‍_a => (setGlobalObjectEvaluators = $h‍_a)]]]],["./permits.js", [["sharedGlobalPropertyNames", [$h‍_a => (sharedGlobalPropertyNames = $h‍_a)]]]],["./module-load.js", [["load", [$h‍_a => (load = $h‍_a)]]]],["./module-link.js", [["link", [$h‍_a => (link = $h‍_a)]]]],["./module-proxy.js", [["getDeferredExports", [$h‍_a => (getDeferredExports = $h‍_a)]]]],["./error/assert.js", [["assert", [$h‍_a => (assert = $h‍_a)]]]],["./compartment-evaluate.js", [["compartmentEvaluate", [$h‍_a => (compartmentEvaluate = $h‍_a)]]]],["./make-safe-evaluator.js", [["makeSafeEvaluator", [$h‍_a => (makeSafeEvaluator = $h‍_a)]]]]]);   





























const { quote: q}=   assert;

// moduleAliases associates every public module exports namespace with its
// corresponding compartment and specifier so they can be used to link modules
// across compartments.
// The mechanism to thread an alias is to use the compartment.module function
// to obtain the exports namespace of a foreign module and pass it into another
// compartment's moduleMap constructor option.
const moduleAliases=  new WeakMap();

// privateFields captures the private state for each compartment.
const privateFields=  new WeakMap();

// Compartments do not need an importHook or resolveHook to be useful
// as a vessel for evaluating programs.
// However, any method that operates the module system will throw an exception
// if these hooks are not available.
const assertModuleHooks=  (compartment)=>{
  const { importHook, resolveHook}=   weakmapGet(privateFields, compartment);
  if( typeof importHook!==  'function'||  typeof resolveHook!==  'function') {
    throw TypeError(
      'Compartment must be constructed with an importHook and a resolveHook for it to be able to load modules');

   }
 };

const        InertCompartment=  function Compartment(
  _endowments=  {},
  _modules=  {},
  _options=  {})
  {
  throw TypeError(
    'Compartment.prototype.constructor is not a valid constructor.');

 };

/**
 * @param {Compartment} compartment
 * @param {string} specifier
 */$h‍_once.InertCompartment(InertCompartment);
const compartmentImportNow=  (compartment, specifier)=>  {
  const { execute, exportsProxy}=   link(
    privateFields,
    moduleAliases,
    compartment,
    specifier);

  execute();
  return exportsProxy;
 };

const        CompartmentPrototype=  {
  constructor: InertCompartment,

  get globalThis() {
    return weakmapGet(privateFields, this).globalObject;
   },

  get name() {
    return weakmapGet(privateFields, this).name;
   },

  /**
   * @param {string} source is a JavaScript program grammar construction.
   * @param {object} [options]
   * @param {Array<import('./lockdown-shim').Transform>} [options.transforms]
   * @param {boolean} [options.sloppyGlobalsMode]
   * @param {object} [options.__moduleShimLexicals__]
   * @param {boolean} [options.__evadeHtmlCommentTest__]
   * @param {boolean} [options.__evadeImportExpressionTest__]
   * @param {boolean} [options.__rejectSomeDirectEvalExpressions__]
   */
  evaluate(source, options=  {}) {
    const compartmentFields=  weakmapGet(privateFields, this);
    return compartmentEvaluate(compartmentFields, source, options);
   },

  toString() {
    return '[object Compartment]';
   },

  module(specifier) {
    if( typeof specifier!==  'string') {
      throw TypeError('first argument of module() must be a string');
     }

    assertModuleHooks(this);

    const { exportsProxy}=   getDeferredExports(
      this,
      weakmapGet(privateFields, this),
      moduleAliases,
      specifier);


    return exportsProxy;
   },

        async import(specifier){
    if( typeof specifier!==  'string') {
      throw TypeError('first argument of import() must be a string');
     }

    assertModuleHooks(this);

    return promiseThen(
      load(privateFields, moduleAliases, this, specifier),
      ()=>  {
        // The namespace box is a contentious design and likely to be a breaking
        // change in an appropriately numbered future version.
        const namespace=  compartmentImportNow(
          /** @type {Compartment} */  this,
          specifier);

        return { namespace};
       });

   },

        async load(specifier){
    if( typeof specifier!==  'string') {
      throw TypeError('first argument of load() must be a string');
     }

    assertModuleHooks(this);

    return load(privateFields, moduleAliases, this, specifier);
   },

  importNow(specifier) {
    if( typeof specifier!==  'string') {
      throw TypeError('first argument of importNow() must be a string');
     }

    assertModuleHooks(this);

    return compartmentImportNow(/** @type {Compartment} */  this,  specifier);
   }};$h‍_once.CompartmentPrototype(CompartmentPrototype);


defineProperties(InertCompartment, {
  prototype: { value: CompartmentPrototype}});


/**
 * @callback MakeCompartmentConstructor
 * @param {MakeCompartmentConstructor} targetMakeCompartmentConstructor
 * @param {Record<string, any>} intrinsics
 * @param {(object: object) => void} markVirtualizedNativeFunction
 * @returns {Compartment['constructor']}
 */

/** @type {MakeCompartmentConstructor} */
const        makeCompartmentConstructor=  (
  targetMakeCompartmentConstructor,
  intrinsics,
  markVirtualizedNativeFunction)=>
     {
  function Compartment(endowments=  {}, moduleMap=  {}, options=  {}) {
    if( new.target===  undefined) {
      throw TypeError(
        "Class constructor Compartment cannot be invoked without 'new'");

     }

    // Extract options, and shallow-clone transforms.
    const {
      name=  '<unknown>',
      transforms=  [],
      __shimTransforms__=  [],
      resolveHook,
      importHook,
      moduleMapHook,
      importMetaHook}=
        options;
    const globalTransforms=  [...transforms, ...__shimTransforms__];

    // Map<FullSpecifier, ModuleCompartmentRecord>
    const moduleRecords=  new Map();
    // Map<FullSpecifier, ModuleInstance>
    const instances=  new Map();
    // Map<FullSpecifier, {ExportsProxy, ProxiedExports, activate()}>
    const deferredExports=  new Map();

    // Validate given moduleMap.
    // The module map gets translated on-demand in module-load.js and the
    // moduleMap can be invalid in ways that cannot be detected in the
    // constructor, but these checks allow us to throw early for a better
    // developer experience.
    for( const [specifier, aliasNamespace]of  entries(moduleMap||  {})) {
      if( typeof aliasNamespace===  'string') {
        // TODO implement parent module record retrieval.
        throw TypeError(
           `Cannot map module ${q(specifier)} to ${q(
            aliasNamespace)
            } in parent compartment`);

       }else if( weakmapGet(moduleAliases, aliasNamespace)===  undefined) {
        // TODO create and link a synthetic module instance from the given
        // namespace object.
        throw ReferenceError(
           `Cannot map module ${q(
            specifier)
            } because it has no known compartment in this realm`);

       }
     }

    const globalObject=  {};

    setGlobalObjectSymbolUnscopables(globalObject);

    // We must initialize all constant properties first because
    // `makeSafeEvaluator` may use them to create optimized bindings
    // in the evaluator.
    // TODO: consider merging into a single initialization if internal
    // evaluator is no longer eagerly created
    setGlobalObjectConstantProperties(globalObject);

    const { safeEvaluate}=   makeSafeEvaluator({
      globalObject,
      globalTransforms,
      sloppyGlobalsMode: false});


    setGlobalObjectMutableProperties(globalObject, {
      intrinsics,
      newGlobalPropertyNames: sharedGlobalPropertyNames,
      makeCompartmentConstructor: targetMakeCompartmentConstructor,
      markVirtualizedNativeFunction});


    // TODO: maybe add evalTaming to the Compartment constructor 3rd options?
    setGlobalObjectEvaluators(
      globalObject,
      safeEvaluate,
      markVirtualizedNativeFunction);


    assign(globalObject, endowments);

    weakmapSet(privateFields, this, {
      name:  `${name}`,
      globalTransforms,
      globalObject,
      safeEvaluate,
      resolveHook,
      importHook,
      moduleMap,
      moduleMapHook,
      importMetaHook,
      moduleRecords,
      __shimTransforms__,
      deferredExports,
      instances});

   }

  Compartment.prototype=  CompartmentPrototype;

  return Compartment;
 };$h‍_once.makeCompartmentConstructor(makeCompartmentConstructor);
})
,
// === functors[44] ===
(({   imports: $h‍_imports,   liveVar: $h‍_live,   onceVar: $h‍_once,   importMeta: $h‍____meta,  }) => {   let FERAL_FUNCTION,Float32Array,Map,Set,String,getOwnPropertyDescriptor,getPrototypeOf,iterateArray,iterateMap,iterateSet,iterateString,matchAllRegExp,matchAllSymbol,regexpPrototype,globalThis,InertCompartment;$h‍_imports([["./commons.js", [["FERAL_FUNCTION", [$h‍_a => (FERAL_FUNCTION = $h‍_a)]],["Float32Array", [$h‍_a => (Float32Array = $h‍_a)]],["Map", [$h‍_a => (Map = $h‍_a)]],["Set", [$h‍_a => (Set = $h‍_a)]],["String", [$h‍_a => (String = $h‍_a)]],["getOwnPropertyDescriptor", [$h‍_a => (getOwnPropertyDescriptor = $h‍_a)]],["getPrototypeOf", [$h‍_a => (getPrototypeOf = $h‍_a)]],["iterateArray", [$h‍_a => (iterateArray = $h‍_a)]],["iterateMap", [$h‍_a => (iterateMap = $h‍_a)]],["iterateSet", [$h‍_a => (iterateSet = $h‍_a)]],["iterateString", [$h‍_a => (iterateString = $h‍_a)]],["matchAllRegExp", [$h‍_a => (matchAllRegExp = $h‍_a)]],["matchAllSymbol", [$h‍_a => (matchAllSymbol = $h‍_a)]],["regexpPrototype", [$h‍_a => (regexpPrototype = $h‍_a)]],["globalThis", [$h‍_a => (globalThis = $h‍_a)]]]],["./compartment.js", [["InertCompartment", [$h‍_a => (InertCompartment = $h‍_a)]]]]]);   


















/**
 * Object.getConstructorOf()
 * Helper function to improve readability, similar to Object.getPrototypeOf().
 *
 * @param {object} obj
 */
function getConstructorOf(obj) {
  return getPrototypeOf(obj).constructor;
 }

// getAnonymousIntrinsics uses a utility function to construct an arguments
// object, since it cannot have one of its own and also be a const export.
function makeArguments() {
  // eslint-disable-next-line prefer-rest-params
  return arguments;
 }

/**
 * getAnonymousIntrinsics()
 * Get the intrinsics not otherwise reachable by named own property
 * traversal from the global object.
 *
 * @returns {object}
 */
const        getAnonymousIntrinsics=  ()=>  {
  const InertFunction=  FERAL_FUNCTION.prototype.constructor;

  // 9.2.4.1 %ThrowTypeError%

  const argsCalleeDesc=  getOwnPropertyDescriptor(makeArguments(), 'callee');
  const ThrowTypeError=  argsCalleeDesc&&  argsCalleeDesc.get;

  // 21.1.5.2 The %StringIteratorPrototype% Object

  // eslint-disable-next-line no-new-wrappers
  const StringIteratorObject=  iterateString(new String());
  const StringIteratorPrototype=  getPrototypeOf(StringIteratorObject);

  // 21.2.7.1 The %RegExpStringIteratorPrototype% Object
  const RegExpStringIterator=
    regexpPrototype[matchAllSymbol]&&  matchAllRegExp(/./);
  const RegExpStringIteratorPrototype=
    RegExpStringIterator&&  getPrototypeOf(RegExpStringIterator);

  // 22.1.5.2 The %ArrayIteratorPrototype% Object

  // eslint-disable-next-line no-array-constructor
  const ArrayIteratorObject=  iterateArray([]);
  const ArrayIteratorPrototype=  getPrototypeOf(ArrayIteratorObject);

  // 22.2.1 The %TypedArray% Intrinsic Object

  const TypedArray=  getPrototypeOf(Float32Array);

  // 23.1.5.2 The %MapIteratorPrototype% Object

  const MapIteratorObject=  iterateMap(new Map());
  const MapIteratorPrototype=  getPrototypeOf(MapIteratorObject);

  // 23.2.5.2 The %SetIteratorPrototype% Object

  const SetIteratorObject=  iterateSet(new Set());
  const SetIteratorPrototype=  getPrototypeOf(SetIteratorObject);

  // 25.1.2 The %IteratorPrototype% Object

  const IteratorPrototype=  getPrototypeOf(ArrayIteratorPrototype);

  // 25.2.1 The GeneratorFunction Constructor

  // eslint-disable-next-line no-empty-function
  function* GeneratorFunctionInstance() { }
  const GeneratorFunction=  getConstructorOf(GeneratorFunctionInstance);

  // 25.2.3 Properties of the GeneratorFunction Prototype Object

  const Generator=  GeneratorFunction.prototype;

  // 25.3.1 The AsyncGeneratorFunction Constructor

  // eslint-disable-next-line no-empty-function
  async function* AsyncGeneratorFunctionInstance() { }
  const AsyncGeneratorFunction=  getConstructorOf(
    AsyncGeneratorFunctionInstance);


  // 25.3.2.2 AsyncGeneratorFunction.prototype
  const AsyncGenerator=  AsyncGeneratorFunction.prototype;
  // 25.5.1 Properties of the AsyncGenerator Prototype Object
  const AsyncGeneratorPrototype=  AsyncGenerator.prototype;
  const AsyncIteratorPrototype=  getPrototypeOf(AsyncGeneratorPrototype);

  // 25.7.1 The AsyncFunction Constructor

  // eslint-disable-next-line no-empty-function
  async function AsyncFunctionInstance() { }
  const AsyncFunction=  getConstructorOf(AsyncFunctionInstance);

  const intrinsics=  {
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
    '%InertCompartment%': InertCompartment};


  if( globalThis.Iterator) {
    intrinsics['%IteratorHelperPrototype%']=  getPrototypeOf(
      // eslint-disable-next-line @endo/no-polymorphic-call
      globalThis.Iterator.from([]).take(0));

    intrinsics['%WrapForValidIteratorPrototype%']=  getPrototypeOf(
      // eslint-disable-next-line @endo/no-polymorphic-call
      globalThis.Iterator.from({ next() { }}));

   }

  if( globalThis.AsyncIterator) {
    intrinsics['%AsyncIteratorHelperPrototype%']=  getPrototypeOf(
      // eslint-disable-next-line @endo/no-polymorphic-call
      globalThis.AsyncIterator.from([]).take(0));

    intrinsics['%WrapForValidAsyncIteratorPrototype%']=  getPrototypeOf(
      // eslint-disable-next-line @endo/no-polymorphic-call
      globalThis.AsyncIterator.from({ next() { }}));

   }

  return intrinsics;
 };$h‍_once.getAnonymousIntrinsics(getAnonymousIntrinsics);
})
,
// === functors[45] ===
(({   imports: $h‍_imports,   liveVar: $h‍_live,   onceVar: $h‍_once,   importMeta: $h‍____meta,  }) => {   let TypeError,freeze;$h‍_imports([["./commons.js", [["TypeError", [$h‍_a => (TypeError = $h‍_a)]],["freeze", [$h‍_a => (freeze = $h‍_a)]]]]]);   


const        tameHarden=  (safeHarden, hardenTaming)=>  {
  if( hardenTaming!==  'safe'&&  hardenTaming!==  'unsafe') {
    throw TypeError( `unrecognized fakeHardenOption ${hardenTaming}`);
   }

  if( hardenTaming===  'safe') {
    return safeHarden;
   }

  // In on the joke
  Object.isExtensible=  ()=>  false;
  Object.isFrozen=  ()=>  true;
  Object.isSealed=  ()=>  true;
  Reflect.isExtensible=  ()=>  false;

  if( safeHarden.isFake) {
    // The "safe" hardener is already a fake hardener.
    // Just use it.
    return safeHarden;
   }

  const fakeHarden=  (arg)=>arg;
  fakeHarden.isFake=  true;
  return freeze(fakeHarden);
 };$h‍_once.tameHarden(tameHarden);
freeze(tameHarden);
})
,
// === functors[46] ===
(({   imports: $h‍_imports,   liveVar: $h‍_live,   onceVar: $h‍_once,   importMeta: $h‍____meta,  }) => {   let Symbol,entries,fromEntries,getOwnPropertyDescriptors,defineProperties,arrayMap;$h‍_imports([["./commons.js", [["Symbol", [$h‍_a => (Symbol = $h‍_a)]],["entries", [$h‍_a => (entries = $h‍_a)]],["fromEntries", [$h‍_a => (fromEntries = $h‍_a)]],["getOwnPropertyDescriptors", [$h‍_a => (getOwnPropertyDescriptors = $h‍_a)]],["defineProperties", [$h‍_a => (defineProperties = $h‍_a)]],["arrayMap", [$h‍_a => (arrayMap = $h‍_a)]]]]]);   








/**
 * This taming provides a tamed alternative to the original `Symbol` constructor
 * that starts off identical, except that all its properties are "temporarily"
 * configurable. The original `Symbol` constructor remains unmodified on
 * the start compartment's global. The tamed alternative is used as the shared
 * `Symbol` constructor on constructed compartments.
 *
 * Starting these properties as configurable assumes two succeeding phases of
 * processing: A whitelisting phase, that
 * removes all properties not on the whitelist (which requires them to be
 * configurable) and a global hardening step that freezes all primordials,
 * returning these properties to their expected non-configurable status.
 *
 * The ses shim is constructed to eventually enable vetted shims to run between
 * repair and global hardening. However, such vetted shims would normally
 * run in the start compartment, which continues to use the original unmodified
 * `Symbol`, so they should not normally be affected by the temporary
 * configurability of these properties.
 *
 * Note that the spec refers to the global `Symbol` function as the
 * ["Symbol Constructor"](https://tc39.es/ecma262/multipage/fundamental-objects.html#sec-symbol-constructor)
 * even though it has a call behavior (can be called as a function) and does not
 * not have a construct behavior (cannot be called with `new`). Accordingly,
 * to tame it, we must replace it with a function without a construct
 * behavior.
 */
const        tameSymbolConstructor=  ()=>  {
  const OriginalSymbol=  Symbol;
  const SymbolPrototype=  OriginalSymbol.prototype;

  const SharedSymbol=  {
    Symbol(description) {
      return OriginalSymbol(description);
     }}.
    Symbol;

  defineProperties(SymbolPrototype, {
    constructor: {
      value: SharedSymbol
      // leave other `constructor` attributes as is
}});


  const originalDescsEntries=  entries(
    getOwnPropertyDescriptors(OriginalSymbol));

  const descs=  fromEntries(
    arrayMap(originalDescsEntries, ([name, desc])=>  [
      name,
      { ...desc, configurable: true}]));


  defineProperties(SharedSymbol, descs);

  return { '%SharedSymbol%': SharedSymbol};
 };$h‍_once.tameSymbolConstructor(tameSymbolConstructor);
})
,
// === functors[47] ===
(({   imports: $h‍_imports,   liveVar: $h‍_live,   onceVar: $h‍_once,   importMeta: $h‍____meta,  }) => {   let makeEnvironmentCaptor,FERAL_FUNCTION,FERAL_EVAL,TypeError,arrayFilter,globalThis,is,ownKeys,stringSplit,noEvalEvaluate,makeHardener,makeIntrinsicsCollector,whitelistIntrinsics,tameFunctionConstructors,tameDateConstructor,tameMathObject,tameRegExpConstructor,enablePropertyOverrides,tameLocaleMethods,setGlobalObjectConstantProperties,setGlobalObjectMutableProperties,setGlobalObjectEvaluators,makeSafeEvaluator,initialGlobalPropertyNames,tameFunctionToString,tameDomains,tameConsole,tameErrorConstructor,assert,makeAssert,getAnonymousIntrinsics,makeCompartmentConstructor,tameHarden,tameSymbolConstructor;$h‍_imports([["@endo/env-options", [["makeEnvironmentCaptor", [$h‍_a => (makeEnvironmentCaptor = $h‍_a)]]]],["./commons.js", [["FERAL_FUNCTION", [$h‍_a => (FERAL_FUNCTION = $h‍_a)]],["FERAL_EVAL", [$h‍_a => (FERAL_EVAL = $h‍_a)]],["TypeError", [$h‍_a => (TypeError = $h‍_a)]],["arrayFilter", [$h‍_a => (arrayFilter = $h‍_a)]],["globalThis", [$h‍_a => (globalThis = $h‍_a)]],["is", [$h‍_a => (is = $h‍_a)]],["ownKeys", [$h‍_a => (ownKeys = $h‍_a)]],["stringSplit", [$h‍_a => (stringSplit = $h‍_a)]],["noEvalEvaluate", [$h‍_a => (noEvalEvaluate = $h‍_a)]]]],["./make-hardener.js", [["makeHardener", [$h‍_a => (makeHardener = $h‍_a)]]]],["./intrinsics.js", [["makeIntrinsicsCollector", [$h‍_a => (makeIntrinsicsCollector = $h‍_a)]]]],["./permits-intrinsics.js", [["default", [$h‍_a => (whitelistIntrinsics = $h‍_a)]]]],["./tame-function-constructors.js", [["default", [$h‍_a => (tameFunctionConstructors = $h‍_a)]]]],["./tame-date-constructor.js", [["default", [$h‍_a => (tameDateConstructor = $h‍_a)]]]],["./tame-math-object.js", [["default", [$h‍_a => (tameMathObject = $h‍_a)]]]],["./tame-regexp-constructor.js", [["default", [$h‍_a => (tameRegExpConstructor = $h‍_a)]]]],["./enable-property-overrides.js", [["default", [$h‍_a => (enablePropertyOverrides = $h‍_a)]]]],["./tame-locale-methods.js", [["default", [$h‍_a => (tameLocaleMethods = $h‍_a)]]]],["./global-object.js", [["setGlobalObjectConstantProperties", [$h‍_a => (setGlobalObjectConstantProperties = $h‍_a)]],["setGlobalObjectMutableProperties", [$h‍_a => (setGlobalObjectMutableProperties = $h‍_a)]],["setGlobalObjectEvaluators", [$h‍_a => (setGlobalObjectEvaluators = $h‍_a)]]]],["./make-safe-evaluator.js", [["makeSafeEvaluator", [$h‍_a => (makeSafeEvaluator = $h‍_a)]]]],["./permits.js", [["initialGlobalPropertyNames", [$h‍_a => (initialGlobalPropertyNames = $h‍_a)]]]],["./tame-function-tostring.js", [["tameFunctionToString", [$h‍_a => (tameFunctionToString = $h‍_a)]]]],["./tame-domains.js", [["tameDomains", [$h‍_a => (tameDomains = $h‍_a)]]]],["./error/tame-console.js", [["tameConsole", [$h‍_a => (tameConsole = $h‍_a)]]]],["./error/tame-error-constructor.js", [["default", [$h‍_a => (tameErrorConstructor = $h‍_a)]]]],["./error/assert.js", [["assert", [$h‍_a => (assert = $h‍_a)]],["makeAssert", [$h‍_a => (makeAssert = $h‍_a)]]]],["./get-anonymous-intrinsics.js", [["getAnonymousIntrinsics", [$h‍_a => (getAnonymousIntrinsics = $h‍_a)]]]],["./compartment.js", [["makeCompartmentConstructor", [$h‍_a => (makeCompartmentConstructor = $h‍_a)]]]],["./tame-harden.js", [["tameHarden", [$h‍_a => (tameHarden = $h‍_a)]]]],["./tame-symbol-constructor.js", [["tameSymbolConstructor", [$h‍_a => (tameSymbolConstructor = $h‍_a)]]]]]);   






















































/** @typedef {import('../types.js').LockdownOptions} LockdownOptions */

const { Fail, details: d, quote: q}=   assert;

/** @type {Error=} */
let priorRepairIntrinsics;

/** @type {Error=} */
let priorHardenIntrinsics;

// Build a harden() with an empty fringe.
// Gate it on lockdown.
/**
 * @template T
 * @param {T} ref
 * @returns {T}
 */
const safeHarden=  makeHardener();

/**
 * @callback Transform
 * @param {string} source
 * @returns {string}
 */

/**
 * @callback CompartmentConstructor
 * @param {object} endowments
 * @param {object} moduleMap
 * @param {object} [options]
 * @param {Array<Transform>} [options.transforms]
 * @param {Array<Transform>} [options.__shimTransforms__]
 */

// TODO https://github.com/endojs/endo/issues/814
// Lockdown currently allows multiple calls provided that the specified options
// of every call agree.  With experience, we have observed that lockdown should
// only ever need to be called once and that simplifying lockdown will improve
// the quality of audits.

const assertDirectEvalAvailable=  ()=>  {
  let allowed=  false;
  try {
    allowed=  FERAL_FUNCTION(
      'eval',
      'SES_changed',
       `\
        eval("SES_changed = true");
        return SES_changed;
      `)(
      FERAL_EVAL, false);
    // If we get here and SES_changed stayed false, that means the eval was sloppy
    // and indirect, which generally creates a new global.
    // We are going to throw an exception for failing to initialize SES, but
    // good neighbors clean up.
    if( !allowed) {
      delete globalThis.SES_changed;
     }
   }catch( _error) {
    // We reach here if eval is outright forbidden by a Content Security Policy.
    // We allow this for SES usage that delegates the responsibility to isolate
    // guest code to production code generation.
    allowed=  true;
   }
  if( !allowed) {
    // See https://github.com/endojs/endo/blob/master/packages/ses/error-codes/SES_DIRECT_EVAL.md
    throw TypeError(
       `SES cannot initialize unless 'eval' is the original intrinsic 'eval', suitable for direct-eval (dynamically scoped eval) (SES_DIRECT_EVAL)`);

   }
 };

/**
 * @param {LockdownOptions} [options]
 */
const        repairIntrinsics=  (options=  {})=>  {
  // First time, absent options default to 'safe'.
  // Subsequent times, absent options default to first options.
  // Thus, all present options must agree with first options.
  // Reconstructing `option` here also ensures that it is a well
  // behaved record, with only own data properties.
  //
  // The `overrideTaming` is not a safety issue. Rather it is a tradeoff
  // between code compatibility, which is better with the `'moderate'`
  // setting, and tool compatibility, which is better with the `'min'`
  // setting. See
  // https://github.com/Agoric/SES-shim/blob/master/packages/ses/README.md#enabling-override-by-assignment)
  // for an explanation of when to use which.
  //
  // The `stackFiltering` is not a safety issue. Rather it is a tradeoff
  // between relevance and completeness of the stack frames shown on the
  // console. Setting`stackFiltering` to `'verbose'` applies no filters, providing
  // the raw stack frames that can be quite versbose. Setting
  // `stackFrameFiltering` to`'concise'` limits the display to the stack frame
  // information most likely to be relevant, eliminating distracting frames
  // such as those from the infrastructure. However, the bug you're trying to
  // track down might be in the infrastrure, in which case the `'verbose'` setting
  // is useful. See
  // [`stackFiltering` options](https://github.com/Agoric/SES-shim/blob/master/packages/ses/lockdown-options.md#stackfiltering-options)
  // for an explanation.

  const { getEnvironmentOption: getenv}=   makeEnvironmentCaptor(globalThis);

  const {
    errorTaming=  getenv('LOCKDOWN_ERROR_TAMING', 'safe'),
    errorTrapping=  getenv('LOCKDOWN_ERROR_TRAPPING', 'platform'),
    unhandledRejectionTrapping=  getenv(
      'LOCKDOWN_UNHANDLED_REJECTION_TRAPPING',
      'report'),

    regExpTaming=  getenv('LOCKDOWN_REGEXP_TAMING', 'safe'),
    localeTaming=  getenv('LOCKDOWN_LOCALE_TAMING', 'safe'),
    consoleTaming=  getenv('LOCKDOWN_CONSOLE_TAMING', 'safe'),
    overrideTaming=  getenv('LOCKDOWN_OVERRIDE_TAMING', 'moderate'),
    stackFiltering=  getenv('LOCKDOWN_STACK_FILTERING', 'concise'),
    domainTaming=  getenv('LOCKDOWN_DOMAIN_TAMING', 'safe'),
    evalTaming=  getenv('LOCKDOWN_EVAL_TAMING', 'safeEval'),
    overrideDebug=  arrayFilter(
      stringSplit(getenv('LOCKDOWN_OVERRIDE_DEBUG', ''), ','),
      /** @param {string} debugName */
      (debugName)=>debugName!==  ''),

    __hardenTaming__=  getenv('LOCKDOWN_HARDEN_TAMING', 'safe'),
    dateTaming=  'safe', // deprecated
    mathTaming=  'safe', // deprecated
    ...extraOptions}=
      options;

  evalTaming===  'unsafeEval'||
    evalTaming===  'safeEval'||
    evalTaming===  'noEval'||
    Fail `lockdown(): non supported option evalTaming: ${q(evalTaming)}`;

  // Assert that only supported options were passed.
  // Use Reflect.ownKeys to reject symbol-named properties as well.
  const extraOptionsNames=  ownKeys(extraOptions);
  extraOptionsNames.length===  0||
    Fail `lockdown(): non supported option ${q(extraOptionsNames)}`;

  priorRepairIntrinsics===  undefined||
    // eslint-disable-next-line @endo/no-polymorphic-call
    assert.fail(
      d `Already locked down at ${priorRepairIntrinsics} (SES_ALREADY_LOCKED_DOWN)`,
      TypeError);

  // See https://github.com/endojs/endo/blob/master/packages/ses/error-codes/SES_ALREADY_LOCKED_DOWN.md
  priorRepairIntrinsics=  TypeError('Prior lockdown (SES_ALREADY_LOCKED_DOWN)');
  // Tease V8 to generate the stack string and release the closures the stack
  // trace retained:
  priorRepairIntrinsics.stack;

  assertDirectEvalAvailable();

  /**
   * Because of packagers and bundlers, etc, multiple invocations of lockdown
   * might happen in separate instantiations of the source of this module.
   * In that case, each one sees its own `firstOptions` variable, so the test
   * above will not detect that lockdown has already happened. We
   * unreliably test some telltale signs that lockdown has run, to avoid
   * trying to lock down a locked down environment. Although the test is
   * unreliable, this is consistent with the SES threat model. SES provides
   * security only if it runs first in a given realm, or if everything that
   * runs before it is SES-aware and cooperative. Neither SES nor anything
   * can protect itself from corrupting code that runs first. For these
   * purposes, code that turns a realm into something that passes these
   * tests without actually locking down counts as corrupting code.
   *
   * The specifics of what this tests for may change over time, but it
   * should be consistent with any setting of the lockdown options.
   */
  const seemsToBeLockedDown=  ()=>  {
    return(
      globalThis.Function.prototype.constructor!==  globalThis.Function&&
      // @ts-ignore harden is absent on globalThis type def.
      typeof globalThis.harden===  'function'&&
      // @ts-ignore lockdown is absent on globalThis type def.
      typeof globalThis.lockdown===  'function'&&
      globalThis.Date.prototype.constructor!==  globalThis.Date&&
      typeof globalThis.Date.now===  'function'&&
      // @ts-ignore does not recognize that Date constructor is a special
      // Function.
      // eslint-disable-next-line @endo/no-polymorphic-call
      is(globalThis.Date.prototype.constructor.now(), NaN));

   };

  if( seemsToBeLockedDown()) {
    // See https://github.com/endojs/endo/blob/master/packages/ses/error-codes/SES_MULTIPLE_INSTANCES.md
    throw TypeError(
       `Already locked down but not by this SES instance (SES_MULTIPLE_INSTANCES)`);

   }

  /**
   * 1. TAME powers & gather intrinsics first.
   */

  tameDomains(domainTaming);

  // Replace Function.prototype.toString with one that recognizes
  // shimmed functions as honorary native functions.
  const markVirtualizedNativeFunction=  tameFunctionToString();

  const { addIntrinsics, completePrototypes, finalIntrinsics}=
    makeIntrinsicsCollector();

  const tamedHarden=  tameHarden(safeHarden, __hardenTaming__);
  addIntrinsics({ harden: tamedHarden});

  addIntrinsics(tameFunctionConstructors());

  addIntrinsics(tameDateConstructor(dateTaming));
  addIntrinsics(tameErrorConstructor(errorTaming, stackFiltering));
  addIntrinsics(tameMathObject(mathTaming));
  addIntrinsics(tameRegExpConstructor(regExpTaming));
  addIntrinsics(tameSymbolConstructor());

  addIntrinsics(getAnonymousIntrinsics());

  completePrototypes();

  const intrinsics=  finalIntrinsics();

  /**
   * Wrap console unless suppressed.
   * At the moment, the console is considered a host power in the start
   * compartment, and not a primordial. Hence it is absent from the whilelist
   * and bypasses the intrinsicsCollector.
   *
   * @type {((error: any) => string | undefined) | undefined}
   */
  let optGetStackString;
  if( errorTaming!==  'unsafe') {
    optGetStackString=  intrinsics['%InitialGetStackString%'];
   }
  const consoleRecord=  tameConsole(
    consoleTaming,
    errorTrapping,
    unhandledRejectionTrapping,
    optGetStackString);

  globalThis.console=  /** @type {Console} */  consoleRecord.console;

  // @ts-ignore assert is absent on globalThis type def.
  if( errorTaming===  'unsafe'&&  globalThis.assert===  assert) {
    // If errorTaming is 'unsafe' we replace the global assert with
    // one whose `details` template literal tag does not redact
    // unmarked substitution values. IOW, it blabs information that
    // was supposed to be secret from callers, as an aid to debugging
    // at a further cost in safety.
    // @ts-ignore assert is absent on globalThis type def.
    globalThis.assert=  makeAssert(undefined, true);
   }

  // Replace *Locale* methods with their non-locale equivalents
  tameLocaleMethods(intrinsics, localeTaming);

  /**
   * 2. WHITELIST to standardize the environment.
   */

  // Remove non-standard properties.
  // All remaining function encountered during whitelisting are
  // branded as honorary native functions.
  whitelistIntrinsics(intrinsics, markVirtualizedNativeFunction);

  // Initialize the powerful initial global, i.e., the global of the
  // start compartment, from the intrinsics.

  setGlobalObjectConstantProperties(globalThis);

  setGlobalObjectMutableProperties(globalThis, {
    intrinsics,
    newGlobalPropertyNames: initialGlobalPropertyNames,
    makeCompartmentConstructor,
    markVirtualizedNativeFunction});


  if( evalTaming===  'noEval') {
    setGlobalObjectEvaluators(
      globalThis,
      noEvalEvaluate,
      markVirtualizedNativeFunction);

   }else if( evalTaming===  'safeEval') {
    const { safeEvaluate}=   makeSafeEvaluator({ globalObject: globalThis});
    setGlobalObjectEvaluators(
      globalThis,
      safeEvaluate,
      markVirtualizedNativeFunction);

   }else if( evalTaming===  'unsafeEval') {
    // Leave eval function and Function constructor of the initial compartment in-tact.
    // Other compartments will not have access to these evaluators unless a guest program
    // escapes containment.
   }

  /**
   * 3. HARDEN to share the intrinsics.
   *
   * We define hardenIntrinsics here so that options are in scope, but return
   * it to the caller because we intend to eventually allow vetted shims to run
   * between repairs and the hardening of intrinsics and so we can benchmark
   * repair separately from hardening.
   */

  const hardenIntrinsics=  ()=>  {
    priorHardenIntrinsics===  undefined||
      // eslint-disable-next-line @endo/no-polymorphic-call
      assert.fail(
        d `Already locked down at ${priorHardenIntrinsics} (SES_ALREADY_LOCKED_DOWN)`,
        TypeError);

    // See https://github.com/endojs/endo/blob/master/packages/ses/error-codes/SES_ALREADY_LOCKED_DOWN.md
    priorHardenIntrinsics=  TypeError(
      'Prior lockdown (SES_ALREADY_LOCKED_DOWN)');

    // Tease V8 to generate the stack string and release the closures the stack
    // trace retained:
    priorHardenIntrinsics.stack;

    // Circumvent the override mistake.
    // TODO consider moving this to the end of the repair phase, and
    // therefore before vetted shims rather than afterwards. It is not
    // clear yet which is better.
    // @ts-ignore enablePropertyOverrides does its own input validation
    enablePropertyOverrides(intrinsics, overrideTaming, overrideDebug);

    // Finally register and optionally freeze all the intrinsics. This
    // must be the operation that modifies the intrinsics.
    tamedHarden(intrinsics);

    return tamedHarden;
   };

  return hardenIntrinsics;
 };$h‍_once.repairIntrinsics(repairIntrinsics);
})
,
// === functors[48] ===
(({   imports: $h‍_imports,   liveVar: $h‍_live,   onceVar: $h‍_once,   importMeta: $h‍____meta,  }) => {   let globalThis,repairIntrinsics;$h‍_imports([["./assert-sloppy-mode.js", []],["./commons.js", [["globalThis", [$h‍_a => (globalThis = $h‍_a)]]]],["./lockdown.js", [["repairIntrinsics", [$h‍_a => (repairIntrinsics = $h‍_a)]]]]]);   








/**
 * @param {import('./lockdown.js').LockdownOptions} options
 */
globalThis.lockdown=  (options)=>{
  const hardenIntrinsics=  repairIntrinsics(options);
  globalThis.harden=  hardenIntrinsics();
 };

/**
 * @param {import('./lockdown.js').LockdownOptions} options
 */
globalThis.repairIntrinsics=  (options)=>{
  const hardenIntrinsics=  repairIntrinsics(options);
  // Reveal hardenIntrinsics after repairs.
  globalThis.hardenIntrinsics=  ()=>  {
    // Reveal harden after hardenIntrinsics.
    // Harden is dangerous before hardenIntrinsics because hardening just
    // about anything will inadvertently render intrinsics irreparable.
    // Also, for modules that must work both before or after lockdown (code
    // that is portable between JS and SES), the existence of harden in global
    // scope signals whether such code should attempt to use harden in the
    // defense of its own API.
    // @ts-ignore harden not yet recognized on globalThis.
    globalThis.harden=  hardenIntrinsics();
   };
 };
})
,
// === functors[49] ===
(({   imports: $h‍_imports,   liveVar: $h‍_live,   onceVar: $h‍_once,   importMeta: $h‍____meta,  }) => {   let globalThis,makeCompartmentConstructor,tameFunctionToString,getGlobalIntrinsics;$h‍_imports([["./commons.js", [["globalThis", [$h‍_a => (globalThis = $h‍_a)]]]],["./compartment.js", [["makeCompartmentConstructor", [$h‍_a => (makeCompartmentConstructor = $h‍_a)]]]],["./tame-function-tostring.js", [["tameFunctionToString", [$h‍_a => (tameFunctionToString = $h‍_a)]]]],["./intrinsics.js", [["getGlobalIntrinsics", [$h‍_a => (getGlobalIntrinsics = $h‍_a)]]]]]);   






const markVirtualizedNativeFunction=  tameFunctionToString();

// @ts-ignore Compartment is definitely on globalThis.
globalThis.Compartment=  makeCompartmentConstructor(
  makeCompartmentConstructor,
  getGlobalIntrinsics(globalThis),
  markVirtualizedNativeFunction);
})
,
// === functors[50] ===
(({   imports: $h‍_imports,   liveVar: $h‍_live,   onceVar: $h‍_once,   importMeta: $h‍____meta,  }) => {   let globalThis,assert;$h‍_imports([["./commons.js", [["globalThis", [$h‍_a => (globalThis = $h‍_a)]]]],["./error/assert.js", [["assert", [$h‍_a => (assert = $h‍_a)]]]]]);   


globalThis.assert=  assert;
})
,
// === functors[51] ===
(({   imports: $h‍_imports,   liveVar: $h‍_live,   onceVar: $h‍_once,   importMeta: $h‍____meta,  }) => {   $h‍_imports([["./src/lockdown-shim.js", []],["./src/compartment-shim.js", []],["./src/assert-shim.js", []]]);   
})
,
]; // functors end

  const cell = (name, value = undefined) => {
    const observers = [];
    return Object.freeze({
      get: Object.freeze(() => {
        return value;
      }),
      set: Object.freeze((newValue) => {
        value = newValue;
        for (const observe of observers) {
          observe(value);
        }
      }),
      observe: Object.freeze((observe) => {
        observers.push(observe);
        observe(value);
      }),
      enumerable: true,
    });
  };

  const cells = [
    {
      globalThis: cell("globalThis"),
      Array: cell("Array"),
      Date: cell("Date"),
      FinalizationRegistry: cell("FinalizationRegistry"),
      Float32Array: cell("Float32Array"),
      JSON: cell("JSON"),
      Map: cell("Map"),
      Math: cell("Math"),
      Number: cell("Number"),
      Object: cell("Object"),
      Promise: cell("Promise"),
      Proxy: cell("Proxy"),
      Reflect: cell("Reflect"),
      FERAL_REG_EXP: cell("FERAL_REG_EXP"),
      Set: cell("Set"),
      String: cell("String"),
      Symbol: cell("Symbol"),
      WeakMap: cell("WeakMap"),
      WeakSet: cell("WeakSet"),
      FERAL_ERROR: cell("FERAL_ERROR"),
      RangeError: cell("RangeError"),
      ReferenceError: cell("ReferenceError"),
      SyntaxError: cell("SyntaxError"),
      TypeError: cell("TypeError"),
      assign: cell("assign"),
      create: cell("create"),
      defineProperties: cell("defineProperties"),
      entries: cell("entries"),
      freeze: cell("freeze"),
      getOwnPropertyDescriptor: cell("getOwnPropertyDescriptor"),
      getOwnPropertyDescriptors: cell("getOwnPropertyDescriptors"),
      getOwnPropertyNames: cell("getOwnPropertyNames"),
      getPrototypeOf: cell("getPrototypeOf"),
      is: cell("is"),
      isFrozen: cell("isFrozen"),
      isSealed: cell("isSealed"),
      isExtensible: cell("isExtensible"),
      keys: cell("keys"),
      objectPrototype: cell("objectPrototype"),
      seal: cell("seal"),
      preventExtensions: cell("preventExtensions"),
      setPrototypeOf: cell("setPrototypeOf"),
      values: cell("values"),
      fromEntries: cell("fromEntries"),
      speciesSymbol: cell("speciesSymbol"),
      toStringTagSymbol: cell("toStringTagSymbol"),
      iteratorSymbol: cell("iteratorSymbol"),
      matchAllSymbol: cell("matchAllSymbol"),
      unscopablesSymbol: cell("unscopablesSymbol"),
      symbolKeyFor: cell("symbolKeyFor"),
      symbolFor: cell("symbolFor"),
      isInteger: cell("isInteger"),
      stringifyJson: cell("stringifyJson"),
      defineProperty: cell("defineProperty"),
      apply: cell("apply"),
      construct: cell("construct"),
      reflectGet: cell("reflectGet"),
      reflectGetOwnPropertyDescriptor: cell("reflectGetOwnPropertyDescriptor"),
      reflectHas: cell("reflectHas"),
      reflectIsExtensible: cell("reflectIsExtensible"),
      ownKeys: cell("ownKeys"),
      reflectPreventExtensions: cell("reflectPreventExtensions"),
      reflectSet: cell("reflectSet"),
      isArray: cell("isArray"),
      arrayPrototype: cell("arrayPrototype"),
      mapPrototype: cell("mapPrototype"),
      proxyRevocable: cell("proxyRevocable"),
      regexpPrototype: cell("regexpPrototype"),
      setPrototype: cell("setPrototype"),
      stringPrototype: cell("stringPrototype"),
      weakmapPrototype: cell("weakmapPrototype"),
      weaksetPrototype: cell("weaksetPrototype"),
      functionPrototype: cell("functionPrototype"),
      promisePrototype: cell("promisePrototype"),
      typedArrayPrototype: cell("typedArrayPrototype"),
      uncurryThis: cell("uncurryThis"),
      objectHasOwnProperty: cell("objectHasOwnProperty"),
      arrayFilter: cell("arrayFilter"),
      arrayForEach: cell("arrayForEach"),
      arrayIncludes: cell("arrayIncludes"),
      arrayJoin: cell("arrayJoin"),
      arrayMap: cell("arrayMap"),
      arrayPop: cell("arrayPop"),
      arrayPush: cell("arrayPush"),
      arraySlice: cell("arraySlice"),
      arraySome: cell("arraySome"),
      arraySort: cell("arraySort"),
      iterateArray: cell("iterateArray"),
      mapSet: cell("mapSet"),
      mapGet: cell("mapGet"),
      mapHas: cell("mapHas"),
      mapDelete: cell("mapDelete"),
      mapEntries: cell("mapEntries"),
      iterateMap: cell("iterateMap"),
      setAdd: cell("setAdd"),
      setDelete: cell("setDelete"),
      setForEach: cell("setForEach"),
      setHas: cell("setHas"),
      iterateSet: cell("iterateSet"),
      regexpTest: cell("regexpTest"),
      regexpExec: cell("regexpExec"),
      matchAllRegExp: cell("matchAllRegExp"),
      stringEndsWith: cell("stringEndsWith"),
      stringIncludes: cell("stringIncludes"),
      stringIndexOf: cell("stringIndexOf"),
      stringMatch: cell("stringMatch"),
      stringReplace: cell("stringReplace"),
      stringSearch: cell("stringSearch"),
      stringSlice: cell("stringSlice"),
      stringSplit: cell("stringSplit"),
      stringStartsWith: cell("stringStartsWith"),
      iterateString: cell("iterateString"),
      weakmapDelete: cell("weakmapDelete"),
      weakmapGet: cell("weakmapGet"),
      weakmapHas: cell("weakmapHas"),
      weakmapSet: cell("weakmapSet"),
      weaksetAdd: cell("weaksetAdd"),
      weaksetHas: cell("weaksetHas"),
      functionToString: cell("functionToString"),
      promiseAll: cell("promiseAll"),
      promiseCatch: cell("promiseCatch"),
      promiseThen: cell("promiseThen"),
      finalizationRegistryRegister: cell("finalizationRegistryRegister"),
      finalizationRegistryUnregister: cell("finalizationRegistryUnregister"),
      getConstructorOf: cell("getConstructorOf"),
      immutableObject: cell("immutableObject"),
      isObject: cell("isObject"),
      isError: cell("isError"),
      FERAL_EVAL: cell("FERAL_EVAL"),
      FERAL_FUNCTION: cell("FERAL_FUNCTION"),
      noEvalEvaluate: cell("noEvalEvaluate"),
    },
    {
    },
    {
      makeEnvironmentCaptor: cell("makeEnvironmentCaptor"),
    },
    {
    },
    {
      an: cell("an"),
      bestEffortStringify: cell("bestEffortStringify"),
      enJoin: cell("enJoin"),
    },
    {
    },
    {
    },
    {
      makeLRUCacheMap: cell("makeLRUCacheMap"),
      makeNoteLogArgsArrayKit: cell("makeNoteLogArgsArrayKit"),
    },
    {
      unredactedDetails: cell("unredactedDetails"),
      loggedErrorHandler: cell("loggedErrorHandler"),
      makeAssert: cell("makeAssert"),
      assert: cell("assert"),
    },
    {
      isTypedArray: cell("isTypedArray"),
      makeHardener: cell("makeHardener"),
    },
    {
      constantProperties: cell("constantProperties"),
      universalPropertyNames: cell("universalPropertyNames"),
      initialGlobalPropertyNames: cell("initialGlobalPropertyNames"),
      sharedGlobalPropertyNames: cell("sharedGlobalPropertyNames"),
      uniqueGlobalPropertyNames: cell("uniqueGlobalPropertyNames"),
      NativeErrors: cell("NativeErrors"),
      FunctionInstance: cell("FunctionInstance"),
      AsyncFunctionInstance: cell("AsyncFunctionInstance"),
      isAccessorPermit: cell("isAccessorPermit"),
      permitted: cell("permitted"),
    },
    {
      makeIntrinsicsCollector: cell("makeIntrinsicsCollector"),
      getGlobalIntrinsics: cell("getGlobalIntrinsics"),
    },
    {
      default: cell("default"),
    },
    {
      default: cell("default"),
    },
    {
      default: cell("default"),
    },
    {
      default: cell("default"),
    },
    {
      default: cell("default"),
    },
    {
      minEnablements: cell("minEnablements"),
      moderateEnablements: cell("moderateEnablements"),
      severeEnablements: cell("severeEnablements"),
    },
    {
      default: cell("default"),
    },
    {
      default: cell("default"),
    },
    {
      makeEvalFunction: cell("makeEvalFunction"),
    },
    {
      makeFunctionConstructor: cell("makeFunctionConstructor"),
    },
    {
      setGlobalObjectSymbolUnscopables: cell("setGlobalObjectSymbolUnscopables"),
      setGlobalObjectConstantProperties: cell("setGlobalObjectConstantProperties"),
      setGlobalObjectMutableProperties: cell("setGlobalObjectMutableProperties"),
      setGlobalObjectEvaluators: cell("setGlobalObjectEvaluators"),
    },
    {
      alwaysThrowHandler: cell("alwaysThrowHandler"),
      strictScopeTerminatorHandler: cell("strictScopeTerminatorHandler"),
      strictScopeTerminator: cell("strictScopeTerminator"),
    },
    {
      createSloppyGlobalsScopeTerminator: cell("createSloppyGlobalsScopeTerminator"),
    },
    {
      makeEvalScopeKit: cell("makeEvalScopeKit"),
    },
    {
      getSourceURL: cell("getSourceURL"),
    },
    {
      rejectHtmlComments: cell("rejectHtmlComments"),
      evadeHtmlCommentTest: cell("evadeHtmlCommentTest"),
      rejectImportExpressions: cell("rejectImportExpressions"),
      evadeImportExpressionTest: cell("evadeImportExpressionTest"),
      rejectSomeDirectEvalExpressions: cell("rejectSomeDirectEvalExpressions"),
      mandatoryTransforms: cell("mandatoryTransforms"),
      applyTransforms: cell("applyTransforms"),
      transforms: cell("transforms"),
    },
    {
      isValidIdentifierName: cell("isValidIdentifierName"),
      getScopeConstants: cell("getScopeConstants"),
    },
    {
      makeEvaluate: cell("makeEvaluate"),
    },
    {
      makeSafeEvaluator: cell("makeSafeEvaluator"),
    },
    {
      tameFunctionToString: cell("tameFunctionToString"),
    },
    {
      tameDomains: cell("tameDomains"),
    },
    {
      makeLoggingConsoleKit: cell("makeLoggingConsoleKit"),
      makeCausalConsole: cell("makeCausalConsole"),
      filterConsole: cell("filterConsole"),
      consoleWhitelist: cell("consoleWhitelist"),
    },
    {
      makeRejectionHandlers: cell("makeRejectionHandlers"),
    },
    {
      tameConsole: cell("tameConsole"),
    },
    {
      filterFileName: cell("filterFileName"),
      shortenCallSiteString: cell("shortenCallSiteString"),
      tameV8ErrorConstructor: cell("tameV8ErrorConstructor"),
    },
    {
      default: cell("default"),
    },
    {
      makeAlias: cell("makeAlias"),
      load: cell("load"),
    },
    {
      deferExports: cell("deferExports"),
      getDeferredExports: cell("getDeferredExports"),
    },
    {
      provideCompartmentEvaluator: cell("provideCompartmentEvaluator"),
      compartmentEvaluate: cell("compartmentEvaluate"),
    },
    {
      makeThirdPartyModuleInstance: cell("makeThirdPartyModuleInstance"),
      makeModuleInstance: cell("makeModuleInstance"),
    },
    {
      link: cell("link"),
      instantiate: cell("instantiate"),
    },
    {
      InertCompartment: cell("InertCompartment"),
      CompartmentPrototype: cell("CompartmentPrototype"),
      makeCompartmentConstructor: cell("makeCompartmentConstructor"),
    },
    {
      getAnonymousIntrinsics: cell("getAnonymousIntrinsics"),
    },
    {
      tameHarden: cell("tameHarden"),
    },
    {
      tameSymbolConstructor: cell("tameSymbolConstructor"),
    },
    {
      repairIntrinsics: cell("repairIntrinsics"),
    },
    {
    },
    {
    },
    {
    },
    {
    },
  ];

  Object.defineProperties(cells[3], Object.getOwnPropertyDescriptors(cells[2]));

  const namespaces = cells.map(cells => Object.freeze(Object.create(null, cells)));

  for (let index = 0; index < namespaces.length; index += 1) {
    cells[index]['*'] = cell('*', namespaces[index]);
  }

function observeImports(map, importName, importIndex) {
  for (const [name, observers] of map.get(importName)) {
    const cell = cells[importIndex][name];
    if (cell === undefined) {
      throw new ReferenceError(`Cannot import name ${name}`);
    }
    for (const observer of observers) {
      cell.observe(observer);
    }
  }
}


  functors[0]({
    imports(entries) {
      const map = new Map(entries);
    },
    liveVar: {
    },
    onceVar: {
      universalThis: cells[0].globalThis.set,
      Array: cells[0].Array.set,
      Date: cells[0].Date.set,
      FinalizationRegistry: cells[0].FinalizationRegistry.set,
      Float32Array: cells[0].Float32Array.set,
      JSON: cells[0].JSON.set,
      Map: cells[0].Map.set,
      Math: cells[0].Math.set,
      Number: cells[0].Number.set,
      Object: cells[0].Object.set,
      Promise: cells[0].Promise.set,
      Proxy: cells[0].Proxy.set,
      Reflect: cells[0].Reflect.set,
      FERAL_REG_EXP: cells[0].FERAL_REG_EXP.set,
      Set: cells[0].Set.set,
      String: cells[0].String.set,
      Symbol: cells[0].Symbol.set,
      WeakMap: cells[0].WeakMap.set,
      WeakSet: cells[0].WeakSet.set,
      FERAL_ERROR: cells[0].FERAL_ERROR.set,
      RangeError: cells[0].RangeError.set,
      ReferenceError: cells[0].ReferenceError.set,
      SyntaxError: cells[0].SyntaxError.set,
      TypeError: cells[0].TypeError.set,
      assign: cells[0].assign.set,
      create: cells[0].create.set,
      defineProperties: cells[0].defineProperties.set,
      entries: cells[0].entries.set,
      freeze: cells[0].freeze.set,
      getOwnPropertyDescriptor: cells[0].getOwnPropertyDescriptor.set,
      getOwnPropertyDescriptors: cells[0].getOwnPropertyDescriptors.set,
      getOwnPropertyNames: cells[0].getOwnPropertyNames.set,
      getPrototypeOf: cells[0].getPrototypeOf.set,
      is: cells[0].is.set,
      isFrozen: cells[0].isFrozen.set,
      isSealed: cells[0].isSealed.set,
      isExtensible: cells[0].isExtensible.set,
      keys: cells[0].keys.set,
      objectPrototype: cells[0].objectPrototype.set,
      seal: cells[0].seal.set,
      preventExtensions: cells[0].preventExtensions.set,
      setPrototypeOf: cells[0].setPrototypeOf.set,
      values: cells[0].values.set,
      fromEntries: cells[0].fromEntries.set,
      speciesSymbol: cells[0].speciesSymbol.set,
      toStringTagSymbol: cells[0].toStringTagSymbol.set,
      iteratorSymbol: cells[0].iteratorSymbol.set,
      matchAllSymbol: cells[0].matchAllSymbol.set,
      unscopablesSymbol: cells[0].unscopablesSymbol.set,
      symbolKeyFor: cells[0].symbolKeyFor.set,
      symbolFor: cells[0].symbolFor.set,
      isInteger: cells[0].isInteger.set,
      stringifyJson: cells[0].stringifyJson.set,
      defineProperty: cells[0].defineProperty.set,
      apply: cells[0].apply.set,
      construct: cells[0].construct.set,
      reflectGet: cells[0].reflectGet.set,
      reflectGetOwnPropertyDescriptor: cells[0].reflectGetOwnPropertyDescriptor.set,
      reflectHas: cells[0].reflectHas.set,
      reflectIsExtensible: cells[0].reflectIsExtensible.set,
      ownKeys: cells[0].ownKeys.set,
      reflectPreventExtensions: cells[0].reflectPreventExtensions.set,
      reflectSet: cells[0].reflectSet.set,
      isArray: cells[0].isArray.set,
      arrayPrototype: cells[0].arrayPrototype.set,
      mapPrototype: cells[0].mapPrototype.set,
      proxyRevocable: cells[0].proxyRevocable.set,
      regexpPrototype: cells[0].regexpPrototype.set,
      setPrototype: cells[0].setPrototype.set,
      stringPrototype: cells[0].stringPrototype.set,
      weakmapPrototype: cells[0].weakmapPrototype.set,
      weaksetPrototype: cells[0].weaksetPrototype.set,
      functionPrototype: cells[0].functionPrototype.set,
      promisePrototype: cells[0].promisePrototype.set,
      typedArrayPrototype: cells[0].typedArrayPrototype.set,
      uncurryThis: cells[0].uncurryThis.set,
      objectHasOwnProperty: cells[0].objectHasOwnProperty.set,
      arrayFilter: cells[0].arrayFilter.set,
      arrayForEach: cells[0].arrayForEach.set,
      arrayIncludes: cells[0].arrayIncludes.set,
      arrayJoin: cells[0].arrayJoin.set,
      arrayMap: cells[0].arrayMap.set,
      arrayPop: cells[0].arrayPop.set,
      arrayPush: cells[0].arrayPush.set,
      arraySlice: cells[0].arraySlice.set,
      arraySome: cells[0].arraySome.set,
      arraySort: cells[0].arraySort.set,
      iterateArray: cells[0].iterateArray.set,
      mapSet: cells[0].mapSet.set,
      mapGet: cells[0].mapGet.set,
      mapHas: cells[0].mapHas.set,
      mapDelete: cells[0].mapDelete.set,
      mapEntries: cells[0].mapEntries.set,
      iterateMap: cells[0].iterateMap.set,
      setAdd: cells[0].setAdd.set,
      setDelete: cells[0].setDelete.set,
      setForEach: cells[0].setForEach.set,
      setHas: cells[0].setHas.set,
      iterateSet: cells[0].iterateSet.set,
      regexpTest: cells[0].regexpTest.set,
      regexpExec: cells[0].regexpExec.set,
      matchAllRegExp: cells[0].matchAllRegExp.set,
      stringEndsWith: cells[0].stringEndsWith.set,
      stringIncludes: cells[0].stringIncludes.set,
      stringIndexOf: cells[0].stringIndexOf.set,
      stringMatch: cells[0].stringMatch.set,
      stringReplace: cells[0].stringReplace.set,
      stringSearch: cells[0].stringSearch.set,
      stringSlice: cells[0].stringSlice.set,
      stringSplit: cells[0].stringSplit.set,
      stringStartsWith: cells[0].stringStartsWith.set,
      iterateString: cells[0].iterateString.set,
      weakmapDelete: cells[0].weakmapDelete.set,
      weakmapGet: cells[0].weakmapGet.set,
      weakmapHas: cells[0].weakmapHas.set,
      weakmapSet: cells[0].weakmapSet.set,
      weaksetAdd: cells[0].weaksetAdd.set,
      weaksetHas: cells[0].weaksetHas.set,
      functionToString: cells[0].functionToString.set,
      promiseAll: cells[0].promiseAll.set,
      promiseCatch: cells[0].promiseCatch.set,
      promiseThen: cells[0].promiseThen.set,
      finalizationRegistryRegister: cells[0].finalizationRegistryRegister.set,
      finalizationRegistryUnregister: cells[0].finalizationRegistryUnregister.set,
      getConstructorOf: cells[0].getConstructorOf.set,
      immutableObject: cells[0].immutableObject.set,
      isObject: cells[0].isObject.set,
      isError: cells[0].isError.set,
      FERAL_EVAL: cells[0].FERAL_EVAL.set,
      FERAL_FUNCTION: cells[0].FERAL_FUNCTION.set,
      noEvalEvaluate: cells[0].noEvalEvaluate.set,
    },
    importMeta: {},
  });
  functors[1]({
    imports(entries) {
      const map = new Map(entries);
      observeImports(map, "./commons.js", 0);
    },
    liveVar: {
    },
    onceVar: {
    },
    importMeta: {},
  });
  functors[2]({
    imports(entries) {
      const map = new Map(entries);
    },
    liveVar: {
    },
    onceVar: {
      makeEnvironmentCaptor: cells[2].makeEnvironmentCaptor.set,
    },
    importMeta: {},
  });
  functors[3]({
    imports(entries) {
      const map = new Map(entries);
      observeImports(map, "./src/env-options.js", 2);
    },
    liveVar: {
    },
    onceVar: {
    },
    importMeta: {},
  });
  functors[4]({
    imports(entries) {
      const map = new Map(entries);
      observeImports(map, "../commons.js", 0);
    },
    liveVar: {
    },
    onceVar: {
      an: cells[4].an.set,
      bestEffortStringify: cells[4].bestEffortStringify.set,
      enJoin: cells[4].enJoin.set,
    },
    importMeta: {},
  });
  functors[5]({
    imports(entries) {
      const map = new Map(entries);
    },
    liveVar: {
    },
    onceVar: {
    },
    importMeta: {},
  });
  functors[6]({
    imports(entries) {
      const map = new Map(entries);
    },
    liveVar: {
    },
    onceVar: {
    },
    importMeta: {},
  });
  functors[7]({
    imports(entries) {
      const map = new Map(entries);
      observeImports(map, "./internal-types.js", 6);
    },
    liveVar: {
    },
    onceVar: {
      makeLRUCacheMap: cells[7].makeLRUCacheMap.set,
      makeNoteLogArgsArrayKit: cells[7].makeNoteLogArgsArrayKit.set,
    },
    importMeta: {},
  });
  functors[8]({
    imports(entries) {
      const map = new Map(entries);
      observeImports(map, "../commons.js", 0);
      observeImports(map, "./stringify-utils.js", 4);
      observeImports(map, "./types.js", 5);
      observeImports(map, "./internal-types.js", 6);
      observeImports(map, "./note-log-args.js", 7);
    },
    liveVar: {
    },
    onceVar: {
      unredactedDetails: cells[8].unredactedDetails.set,
      loggedErrorHandler: cells[8].loggedErrorHandler.set,
      makeAssert: cells[8].makeAssert.set,
      assert: cells[8].assert.set,
    },
    importMeta: {},
  });
  functors[9]({
    imports(entries) {
      const map = new Map(entries);
      observeImports(map, "./commons.js", 0);
      observeImports(map, "./error/assert.js", 8);
    },
    liveVar: {
    },
    onceVar: {
      isTypedArray: cells[9].isTypedArray.set,
      makeHardener: cells[9].makeHardener.set,
    },
    importMeta: {},
  });
  functors[10]({
    imports(entries) {
      const map = new Map(entries);
    },
    liveVar: {
    },
    onceVar: {
      constantProperties: cells[10].constantProperties.set,
      universalPropertyNames: cells[10].universalPropertyNames.set,
      initialGlobalPropertyNames: cells[10].initialGlobalPropertyNames.set,
      sharedGlobalPropertyNames: cells[10].sharedGlobalPropertyNames.set,
      uniqueGlobalPropertyNames: cells[10].uniqueGlobalPropertyNames.set,
      NativeErrors: cells[10].NativeErrors.set,
      FunctionInstance: cells[10].FunctionInstance.set,
      AsyncFunctionInstance: cells[10].AsyncFunctionInstance.set,
      isAccessorPermit: cells[10].isAccessorPermit.set,
      permitted: cells[10].permitted.set,
    },
    importMeta: {},
  });
  functors[11]({
    imports(entries) {
      const map = new Map(entries);
      observeImports(map, "./commons.js", 0);
      observeImports(map, "./permits.js", 10);
    },
    liveVar: {
    },
    onceVar: {
      makeIntrinsicsCollector: cells[11].makeIntrinsicsCollector.set,
      getGlobalIntrinsics: cells[11].getGlobalIntrinsics.set,
    },
    importMeta: {},
  });
  functors[12]({
    imports(entries) {
      const map = new Map(entries);
      observeImports(map, "./permits.js", 10);
      observeImports(map, "./commons.js", 0);
    },
    liveVar: {
    },
    onceVar: {
      default: cells[12].default.set,
    },
    importMeta: {},
  });
  functors[13]({
    imports(entries) {
      const map = new Map(entries);
      observeImports(map, "./commons.js", 0);
    },
    liveVar: {
    },
    onceVar: {
      default: cells[13].default.set,
    },
    importMeta: {},
  });
  functors[14]({
    imports(entries) {
      const map = new Map(entries);
      observeImports(map, "./commons.js", 0);
    },
    liveVar: {
    },
    onceVar: {
      default: cells[14].default.set,
    },
    importMeta: {},
  });
  functors[15]({
    imports(entries) {
      const map = new Map(entries);
      observeImports(map, "./commons.js", 0);
    },
    liveVar: {
    },
    onceVar: {
      default: cells[15].default.set,
    },
    importMeta: {},
  });
  functors[16]({
    imports(entries) {
      const map = new Map(entries);
      observeImports(map, "./commons.js", 0);
    },
    liveVar: {
    },
    onceVar: {
      default: cells[16].default.set,
    },
    importMeta: {},
  });
  functors[17]({
    imports(entries) {
      const map = new Map(entries);
    },
    liveVar: {
    },
    onceVar: {
      minEnablements: cells[17].minEnablements.set,
      moderateEnablements: cells[17].moderateEnablements.set,
      severeEnablements: cells[17].severeEnablements.set,
    },
    importMeta: {},
  });
  functors[18]({
    imports(entries) {
      const map = new Map(entries);
      observeImports(map, "./commons.js", 0);
      observeImports(map, "./enablements.js", 17);
    },
    liveVar: {
    },
    onceVar: {
      default: cells[18].default.set,
    },
    importMeta: {},
  });
  functors[19]({
    imports(entries) {
      const map = new Map(entries);
      observeImports(map, "./commons.js", 0);
      observeImports(map, "./error/assert.js", 8);
    },
    liveVar: {
    },
    onceVar: {
      default: cells[19].default.set,
    },
    importMeta: {},
  });
  functors[20]({
    imports(entries) {
      const map = new Map(entries);
    },
    liveVar: {
    },
    onceVar: {
      makeEvalFunction: cells[20].makeEvalFunction.set,
    },
    importMeta: {},
  });
  functors[21]({
    imports(entries) {
      const map = new Map(entries);
      observeImports(map, "./commons.js", 0);
      observeImports(map, "./error/assert.js", 8);
    },
    liveVar: {
    },
    onceVar: {
      makeFunctionConstructor: cells[21].makeFunctionConstructor.set,
    },
    importMeta: {},
  });
  functors[22]({
    imports(entries) {
      const map = new Map(entries);
      observeImports(map, "./commons.js", 0);
      observeImports(map, "./make-eval-function.js", 20);
      observeImports(map, "./make-function-constructor.js", 21);
      observeImports(map, "./permits.js", 10);
    },
    liveVar: {
    },
    onceVar: {
      setGlobalObjectSymbolUnscopables: cells[22].setGlobalObjectSymbolUnscopables.set,
      setGlobalObjectConstantProperties: cells[22].setGlobalObjectConstantProperties.set,
      setGlobalObjectMutableProperties: cells[22].setGlobalObjectMutableProperties.set,
      setGlobalObjectEvaluators: cells[22].setGlobalObjectEvaluators.set,
    },
    importMeta: {},
  });
  functors[23]({
    imports(entries) {
      const map = new Map(entries);
      observeImports(map, "./commons.js", 0);
      observeImports(map, "./error/assert.js", 8);
    },
    liveVar: {
    },
    onceVar: {
      alwaysThrowHandler: cells[23].alwaysThrowHandler.set,
      strictScopeTerminatorHandler: cells[23].strictScopeTerminatorHandler.set,
      strictScopeTerminator: cells[23].strictScopeTerminator.set,
    },
    importMeta: {},
  });
  functors[24]({
    imports(entries) {
      const map = new Map(entries);
      observeImports(map, "./commons.js", 0);
      observeImports(map, "./strict-scope-terminator.js", 23);
    },
    liveVar: {
    },
    onceVar: {
      createSloppyGlobalsScopeTerminator: cells[24].createSloppyGlobalsScopeTerminator.set,
    },
    importMeta: {},
  });
  functors[25]({
    imports(entries) {
      const map = new Map(entries);
      observeImports(map, "./commons.js", 0);
      observeImports(map, "./error/assert.js", 8);
    },
    liveVar: {
    },
    onceVar: {
      makeEvalScopeKit: cells[25].makeEvalScopeKit.set,
    },
    importMeta: {},
  });
  functors[26]({
    imports(entries) {
      const map = new Map(entries);
      observeImports(map, "./commons.js", 0);
    },
    liveVar: {
    },
    onceVar: {
      getSourceURL: cells[26].getSourceURL.set,
    },
    importMeta: {},
  });
  functors[27]({
    imports(entries) {
      const map = new Map(entries);
      observeImports(map, "./commons.js", 0);
      observeImports(map, "./get-source-url.js", 26);
    },
    liveVar: {
    },
    onceVar: {
      rejectHtmlComments: cells[27].rejectHtmlComments.set,
      evadeHtmlCommentTest: cells[27].evadeHtmlCommentTest.set,
      rejectImportExpressions: cells[27].rejectImportExpressions.set,
      evadeImportExpressionTest: cells[27].evadeImportExpressionTest.set,
      rejectSomeDirectEvalExpressions: cells[27].rejectSomeDirectEvalExpressions.set,
      mandatoryTransforms: cells[27].mandatoryTransforms.set,
      applyTransforms: cells[27].applyTransforms.set,
      transforms: cells[27].transforms.set,
    },
    importMeta: {},
  });
  functors[28]({
    imports(entries) {
      const map = new Map(entries);
      observeImports(map, "./commons.js", 0);
    },
    liveVar: {
    },
    onceVar: {
      isValidIdentifierName: cells[28].isValidIdentifierName.set,
      getScopeConstants: cells[28].getScopeConstants.set,
    },
    importMeta: {},
  });
  functors[29]({
    imports(entries) {
      const map = new Map(entries);
      observeImports(map, "./commons.js", 0);
      observeImports(map, "./scope-constants.js", 28);
    },
    liveVar: {
    },
    onceVar: {
      makeEvaluate: cells[29].makeEvaluate.set,
    },
    importMeta: {},
  });
  functors[30]({
    imports(entries) {
      const map = new Map(entries);
      observeImports(map, "./commons.js", 0);
      observeImports(map, "./strict-scope-terminator.js", 23);
      observeImports(map, "./sloppy-globals-scope-terminator.js", 24);
      observeImports(map, "./eval-scope.js", 25);
      observeImports(map, "./transforms.js", 27);
      observeImports(map, "./make-evaluate.js", 29);
      observeImports(map, "./error/assert.js", 8);
    },
    liveVar: {
    },
    onceVar: {
      makeSafeEvaluator: cells[30].makeSafeEvaluator.set,
    },
    importMeta: {},
  });
  functors[31]({
    imports(entries) {
      const map = new Map(entries);
      observeImports(map, "./commons.js", 0);
    },
    liveVar: {
    },
    onceVar: {
      tameFunctionToString: cells[31].tameFunctionToString.set,
    },
    importMeta: {},
  });
  functors[32]({
    imports(entries) {
      const map = new Map(entries);
      observeImports(map, "./commons.js", 0);
    },
    liveVar: {
    },
    onceVar: {
      tameDomains: cells[32].tameDomains.set,
    },
    importMeta: {},
  });
  functors[33]({
    imports(entries) {
      const map = new Map(entries);
      observeImports(map, "../commons.js", 0);
      observeImports(map, "./types.js", 5);
      observeImports(map, "./internal-types.js", 6);
    },
    liveVar: {
    },
    onceVar: {
      makeLoggingConsoleKit: cells[33].makeLoggingConsoleKit.set,
      makeCausalConsole: cells[33].makeCausalConsole.set,
      filterConsole: cells[33].filterConsole.set,
      consoleWhitelist: cells[33].consoleWhitelist.set,
    },
    importMeta: {},
  });
  functors[34]({
    imports(entries) {
      const map = new Map(entries);
      observeImports(map, "../commons.js", 0);
    },
    liveVar: {
    },
    onceVar: {
      makeRejectionHandlers: cells[34].makeRejectionHandlers.set,
    },
    importMeta: {},
  });
  functors[35]({
    imports(entries) {
      const map = new Map(entries);
      observeImports(map, "../commons.js", 0);
      observeImports(map, "./assert.js", 8);
      observeImports(map, "./console.js", 33);
      observeImports(map, "./unhandled-rejection.js", 34);
      observeImports(map, "./types.js", 5);
      observeImports(map, "./internal-types.js", 6);
    },
    liveVar: {
    },
    onceVar: {
      tameConsole: cells[35].tameConsole.set,
    },
    importMeta: {},
  });
  functors[36]({
    imports(entries) {
      const map = new Map(entries);
      observeImports(map, "../commons.js", 0);
    },
    liveVar: {
    },
    onceVar: {
      filterFileName: cells[36].filterFileName.set,
      shortenCallSiteString: cells[36].shortenCallSiteString.set,
      tameV8ErrorConstructor: cells[36].tameV8ErrorConstructor.set,
    },
    importMeta: {},
  });
  functors[37]({
    imports(entries) {
      const map = new Map(entries);
      observeImports(map, "../commons.js", 0);
      observeImports(map, "../permits.js", 10);
      observeImports(map, "./tame-v8-error-constructor.js", 36);
    },
    liveVar: {
    },
    onceVar: {
      default: cells[37].default.set,
    },
    importMeta: {},
  });
  functors[38]({
    imports(entries) {
      const map = new Map(entries);
      observeImports(map, "./commons.js", 0);
      observeImports(map, "./error/assert.js", 8);
    },
    liveVar: {
    },
    onceVar: {
      makeAlias: cells[38].makeAlias.set,
      load: cells[38].load.set,
    },
    importMeta: {},
  });
  functors[39]({
    imports(entries) {
      const map = new Map(entries);
      observeImports(map, "./module-load.js", 38);
      observeImports(map, "./commons.js", 0);
      observeImports(map, "./error/assert.js", 8);
    },
    liveVar: {
    },
    onceVar: {
      deferExports: cells[39].deferExports.set,
      getDeferredExports: cells[39].getDeferredExports.set,
    },
    importMeta: {},
  });
  functors[40]({
    imports(entries) {
      const map = new Map(entries);
      observeImports(map, "./commons.js", 0);
      observeImports(map, "./transforms.js", 27);
      observeImports(map, "./make-safe-evaluator.js", 30);
    },
    liveVar: {
    },
    onceVar: {
      provideCompartmentEvaluator: cells[40].provideCompartmentEvaluator.set,
      compartmentEvaluate: cells[40].compartmentEvaluate.set,
    },
    importMeta: {},
  });
  functors[41]({
    imports(entries) {
      const map = new Map(entries);
      observeImports(map, "./error/assert.js", 8);
      observeImports(map, "./module-proxy.js", 39);
      observeImports(map, "./commons.js", 0);
      observeImports(map, "./compartment-evaluate.js", 40);
    },
    liveVar: {
    },
    onceVar: {
      makeThirdPartyModuleInstance: cells[41].makeThirdPartyModuleInstance.set,
      makeModuleInstance: cells[41].makeModuleInstance.set,
    },
    importMeta: {},
  });
  functors[42]({
    imports(entries) {
      const map = new Map(entries);
      observeImports(map, "./error/assert.js", 8);
      observeImports(map, "./module-instance.js", 41);
      observeImports(map, "./commons.js", 0);
    },
    liveVar: {
    },
    onceVar: {
      link: cells[42].link.set,
      instantiate: cells[42].instantiate.set,
    },
    importMeta: {},
  });
  functors[43]({
    imports(entries) {
      const map = new Map(entries);
      observeImports(map, "./commons.js", 0);
      observeImports(map, "./global-object.js", 22);
      observeImports(map, "./permits.js", 10);
      observeImports(map, "./module-load.js", 38);
      observeImports(map, "./module-link.js", 42);
      observeImports(map, "./module-proxy.js", 39);
      observeImports(map, "./error/assert.js", 8);
      observeImports(map, "./compartment-evaluate.js", 40);
      observeImports(map, "./make-safe-evaluator.js", 30);
    },
    liveVar: {
    },
    onceVar: {
      InertCompartment: cells[43].InertCompartment.set,
      CompartmentPrototype: cells[43].CompartmentPrototype.set,
      makeCompartmentConstructor: cells[43].makeCompartmentConstructor.set,
    },
    importMeta: {},
  });
  functors[44]({
    imports(entries) {
      const map = new Map(entries);
      observeImports(map, "./commons.js", 0);
      observeImports(map, "./compartment.js", 43);
    },
    liveVar: {
    },
    onceVar: {
      getAnonymousIntrinsics: cells[44].getAnonymousIntrinsics.set,
    },
    importMeta: {},
  });
  functors[45]({
    imports(entries) {
      const map = new Map(entries);
      observeImports(map, "./commons.js", 0);
    },
    liveVar: {
    },
    onceVar: {
      tameHarden: cells[45].tameHarden.set,
    },
    importMeta: {},
  });
  functors[46]({
    imports(entries) {
      const map = new Map(entries);
      observeImports(map, "./commons.js", 0);
    },
    liveVar: {
    },
    onceVar: {
      tameSymbolConstructor: cells[46].tameSymbolConstructor.set,
    },
    importMeta: {},
  });
  functors[47]({
    imports(entries) {
      const map = new Map(entries);
      observeImports(map, "@endo/env-options", 3);
      observeImports(map, "./commons.js", 0);
      observeImports(map, "./make-hardener.js", 9);
      observeImports(map, "./intrinsics.js", 11);
      observeImports(map, "./permits-intrinsics.js", 12);
      observeImports(map, "./tame-function-constructors.js", 13);
      observeImports(map, "./tame-date-constructor.js", 14);
      observeImports(map, "./tame-math-object.js", 15);
      observeImports(map, "./tame-regexp-constructor.js", 16);
      observeImports(map, "./enable-property-overrides.js", 18);
      observeImports(map, "./tame-locale-methods.js", 19);
      observeImports(map, "./global-object.js", 22);
      observeImports(map, "./make-safe-evaluator.js", 30);
      observeImports(map, "./permits.js", 10);
      observeImports(map, "./tame-function-tostring.js", 31);
      observeImports(map, "./tame-domains.js", 32);
      observeImports(map, "./error/tame-console.js", 35);
      observeImports(map, "./error/tame-error-constructor.js", 37);
      observeImports(map, "./error/assert.js", 8);
      observeImports(map, "./get-anonymous-intrinsics.js", 44);
      observeImports(map, "./compartment.js", 43);
      observeImports(map, "./tame-harden.js", 45);
      observeImports(map, "./tame-symbol-constructor.js", 46);
    },
    liveVar: {
    },
    onceVar: {
      repairIntrinsics: cells[47].repairIntrinsics.set,
    },
    importMeta: {},
  });
  functors[48]({
    imports(entries) {
      const map = new Map(entries);
      observeImports(map, "./assert-sloppy-mode.js", 1);
      observeImports(map, "./commons.js", 0);
      observeImports(map, "./lockdown.js", 47);
    },
    liveVar: {
    },
    onceVar: {
    },
    importMeta: {},
  });
  functors[49]({
    imports(entries) {
      const map = new Map(entries);
      observeImports(map, "./commons.js", 0);
      observeImports(map, "./compartment.js", 43);
      observeImports(map, "./tame-function-tostring.js", 31);
      observeImports(map, "./intrinsics.js", 11);
    },
    liveVar: {
    },
    onceVar: {
    },
    importMeta: {},
  });
  functors[50]({
    imports(entries) {
      const map = new Map(entries);
      observeImports(map, "./commons.js", 0);
      observeImports(map, "./error/assert.js", 8);
    },
    liveVar: {
    },
    onceVar: {
    },
    importMeta: {},
  });
  functors[51]({
    imports(entries) {
      const map = new Map(entries);
      observeImports(map, "./src/lockdown-shim.js", 48);
      observeImports(map, "./src/compartment-shim.js", 49);
      observeImports(map, "./src/assert-shim.js", 50);
    },
    liveVar: {
    },
    onceVar: {
    },
    importMeta: {},
  });

  return cells[cells.length - 1]['*'].get();
})();

// END of injected code from ses
  })()
  return module.exports
})()

    const lockdownOptions = {
      // gives a semi-high resolution timer
      dateTaming: 'unsafe',
      // this is introduces non-determinism, but is otherwise safe
      mathTaming: 'unsafe',
      // lets code observe call stack, but easier debuggability
      errorTaming: 'unsafe',
      // shows the full call stack
      stackFiltering: 'verbose',
      // prevent issues when dealing with the "override mistake"
      overrideTaming: 'severe',
    }

    lockdown(lockdownOptions)

    // initialize the kernel
    const createKernelCore = (function () {
  'use strict'
  return createKernelCore

  function createKernelCore ({
    // the platform api global
    globalRef,
    // package policy object
    lavamoatConfig,
    // kernel configuration
    loadModuleData,
    getRelativeModuleId,
    prepareModuleInitializerArgs,
    getExternalCompartment,
    globalThisRefs,
    // security options
    scuttleGlobalThis,
    debugMode,
    runWithPrecompiledModules,
    reportStatsHook,
  }) {
    // prepare the LavaMoat kernel-core factory
    // factory is defined within a Compartment
    // unless "runWithPrecompiledModules" is enabled
    let makeKernelCore
    if (runWithPrecompiledModules) {
      makeKernelCore = unsafeMakeKernelCore
    } else {
      // endowments:
      // - console is included for convenience
      // - Math is for untamed Math.random
      // - Date is for untamed Date.now
      const kernelCompartment = new Compartment({ console, Math, Date })
      makeKernelCore = kernelCompartment.evaluate(`(${unsafeMakeKernelCore})\n//# sourceURL=LavaMoat/core/kernel`)
    }
    const lavamoatKernel = makeKernelCore({
      globalRef,
      lavamoatConfig,
      loadModuleData,
      getRelativeModuleId,
      prepareModuleInitializerArgs,
      getExternalCompartment,
      globalThisRefs,
      scuttleGlobalThis,
      debugMode,
      runWithPrecompiledModules,
      reportStatsHook,
    })

    return lavamoatKernel
  }

  // this is serialized and run in a SES Compartment when "runWithPrecompiledModules" is false
  // mostly just exists to expose variables to internalRequire and loadBundle
  function unsafeMakeKernelCore ({
    globalRef,
    lavamoatConfig,
    loadModuleData,
    getRelativeModuleId,
    prepareModuleInitializerArgs,
    getExternalCompartment,
    globalThisRefs = ['globalThis'],
    scuttleGlobalThis = {},
    debugMode = false,
    runWithPrecompiledModules = false,
    reportStatsHook = () => {},
  }) {
    // "templateRequire" calls are inlined in "generateKernel"
    const { getEndowmentsForConfig, makeMinimalViewOfRef, applyEndowmentPropDescTransforms, copyWrappedGlobals, createFunctionWrapper } = // define endowmentsToolkit
(function(){
  const global = globalRef
  const exports = {}
  const module = { exports }
  ;(function(){
// START of injected code from endowmentsToolkit
// the contents of this file will be copied into the prelude template
// this module has been written so that it required directly or copied and added to the template with a small wrapper
module.exports = endowmentsToolkit

// utilities for generating the endowments object based on a globalRef and a packagePolicy

// The packagePolicy uses a period-deliminated path notation to pull out deep values from objects
// These utilities help create an object populated with only the deep properties specified in the packagePolicy

function endowmentsToolkit({ createFunctionWrapper = defaultCreateFunctionWrapper } = {}) {
  return {
    getEndowmentsForConfig,
    makeMinimalViewOfRef,
    copyValueAtPath,
    applyGetSetPropDescTransforms,
    applyEndowmentPropDescTransforms,
    copyWrappedGlobals,
    createFunctionWrapper,
  }

  /**
   * @function getEndowmentsForConfig Creates an object populated with only the deep properties specified in the packagePolicy
   * @param {object} sourceRef - Object from which to copy properties
   * @param {object} packagePolicy - LavaMoat policy item representing a package
   * @param {object} unwrapTo - For getters and setters, when the this-value is unwrapFrom, is replaced as unwrapTo
   * @param {object} unwrapFrom - For getters and setters, the this-value to replace (default: targetRef)
   * @return {object} - The targetRef
   *
   */
  function getEndowmentsForConfig(sourceRef, packagePolicy, unwrapTo, unwrapFrom) {
    if (!packagePolicy.globals) {
      return {}
    }
    // validate read access from packagePolicy
    const whitelistedReads = []
    const explicitlyBanned = []
    Object.entries(packagePolicy.globals).forEach(([path, packagePolicyValue]) => {
      const pathParts = path.split('.')
      // disallow dunder proto in path
      const pathContainsDunderProto = pathParts.some(pathPart => pathPart === '__proto__')
      if (pathContainsDunderProto) {
        throw new Error(`Lavamoat - "__proto__" disallowed when creating minimal view. saw "${path}"`)
      }
      // false means no access. It's necessary so that overrides can also be used to tighten the policy
      if (packagePolicyValue === false) {
        explicitlyBanned.push(path)
        return
      }
      // write access handled elsewhere
      if (packagePolicyValue === 'write') {
        return
      }
      if (packagePolicyValue !== true) {
        throw new Error(`LavaMoat - unrecognizable policy value (${typeof packagePolicyValue}) for path "${path}"`)
      }
      whitelistedReads.push(path)
    })
    return makeMinimalViewOfRef(sourceRef, whitelistedReads, unwrapTo, unwrapFrom, explicitlyBanned)
  }

  function makeMinimalViewOfRef(sourceRef, paths, unwrapTo, unwrapFrom, explicitlyBanned = []) {
    const targetRef = {}
    paths.forEach(path => {
      copyValueAtPath('', path.split('.'), explicitlyBanned, sourceRef, targetRef, unwrapTo, unwrapFrom)
    })
    return targetRef
  }

  function extendPath(visited, next) {
    if (!visited || visited.length === 0) {
      return next
    }
    return `${visited}.${next}`
  }

  function copyValueAtPath(visitedPath, pathParts, explicitlyBanned, sourceRef, targetRef, unwrapTo = sourceRef, unwrapFrom = targetRef) {
    if (pathParts.length === 0) {
      throw new Error('unable to copy, must have pathParts, was empty')
    }
    const [nextPart, ...remainingParts] = pathParts
    const currentPath = extendPath(visitedPath, nextPart)
    // get the property from any depth in the property chain
    const { prop: sourcePropDesc } = getPropertyDescriptorDeep(sourceRef, nextPart)

    // if source missing the value to copy, just skip it
    if (!sourcePropDesc) {
      return
    }

    // if target already has a value, it must be extensible
    const targetPropDesc = Reflect.getOwnPropertyDescriptor(targetRef, nextPart)
    if (targetPropDesc) {
      // dont attempt to extend a getter or trigger a setter
      if (!('value' in targetPropDesc)) {
        throw new Error(`unable to copy on to targetRef, targetRef has a getter at "${nextPart}"`)
      }
      // value must be extensible (cant write properties onto it)
      const targetValue = targetPropDesc.value
      const valueType = typeof targetValue
      if (valueType !== 'object' && valueType !== 'function') {
        throw new Error(`unable to copy on to targetRef, targetRef value is not an obj or func "${nextPart}"`)
      }
    }

    // if this is not the last path in the assignment, walk into the containing reference
    if (remainingParts.length > 0) {
      const { sourceValue, sourceWritable } = getSourceValue()
      const nextSourceRef = sourceValue
      let nextTargetRef
      // check if value exists on target and does not need selective treatment
      if (targetPropDesc && !explicitlyBanned.includes(currentPath)) {
        // a value already exists, we should walk into it
        nextTargetRef = targetPropDesc.value
      } else {
        // its not populated so lets write to it
        // put an object to serve as a container
        const containerRef = {}
        const newPropDesc = {
          value: containerRef,
          writable: sourceWritable,
          enumerable: sourcePropDesc.enumerable,
          configurable: sourcePropDesc.configurable,
        }
        Reflect.defineProperty(targetRef, nextPart, newPropDesc)
        // the newly created container will be the next target
        nextTargetRef = containerRef
      }
      copyValueAtPath(currentPath, remainingParts, explicitlyBanned, nextSourceRef, nextTargetRef)
      return
    }

    // If conflicting rules exist, opt for the negative one. This should never happen
    if (explicitlyBanned.includes(currentPath)) {
      console.warn(`LavaMoat - conflicting rules exist for "${currentPath}"`)
      return
    }

    // this is the last part of the path, the value we're trying to actually copy
    // if has getter/setter - apply this-value unwrapping
    if (!('value' in sourcePropDesc)) {
      // wrapper setter/getter with correct receiver
      const wrapperPropDesc = applyGetSetPropDescTransforms(sourcePropDesc, unwrapFrom, unwrapTo)
      Reflect.defineProperty(targetRef, nextPart, wrapperPropDesc)
      return
    }

    // need to determine the value type in order to copy it with
    // this-value unwrapping support
    const { sourceValue, sourceWritable } = getSourceValue()

    // not a function - copy as is
    if (typeof sourceValue !== 'function') {
      Reflect.defineProperty(targetRef, nextPart, sourcePropDesc)
      return
    }
    // otherwise add workaround for functions to swap back to the sourceal "this" reference
    const unwrapTest = thisValue => thisValue === unwrapFrom
    const newValue = createFunctionWrapper(sourceValue, unwrapTest, unwrapTo)
    const newPropDesc = {
      value: newValue,
      writable: sourceWritable,
      enumerable: sourcePropDesc.enumerable,
      configurable: sourcePropDesc.configurable,
    }
    Reflect.defineProperty(targetRef, nextPart, newPropDesc)

    function getSourceValue() {
      // determine the source value, this coerces getters to values
      // im deeply sorry, respecting getters was complicated and
      // my brain is not very good
      let sourceValue, sourceWritable
      if ('value' in sourcePropDesc) {
        sourceValue = sourcePropDesc.value
        sourceWritable = sourcePropDesc.writable
      } else if ('get' in sourcePropDesc) {
        sourceValue = sourcePropDesc.get.call(unwrapTo)
        sourceWritable = 'set' in sourcePropDesc
      } else {
        throw new Error('getEndowmentsForConfig - property descriptor missing a getter')
      }
      return { sourceValue, sourceWritable }
    }
  }

  function applyEndowmentPropDescTransforms(propDesc, unwrapFromCompartmentGlobalThis, unwrapToGlobalThis) {
    let newPropDesc = propDesc
    newPropDesc = applyFunctionPropDescTransform(newPropDesc, unwrapFromCompartmentGlobalThis, unwrapToGlobalThis)
    newPropDesc = applyGetSetPropDescTransforms(newPropDesc, unwrapFromCompartmentGlobalThis, unwrapToGlobalThis)
    return newPropDesc
  }

  function applyGetSetPropDescTransforms(sourcePropDesc, unwrapFromGlobalThis, unwrapToGlobalThis) {
    const wrappedPropDesc = { ...sourcePropDesc }
    if (sourcePropDesc.get) {
      wrappedPropDesc.get = function () {
        const receiver = this
        // replace the "receiver" value if it points to fake parent
        const receiverRef = receiver === unwrapFromGlobalThis ? unwrapToGlobalThis : receiver
        // sometimes getters replace themselves with static properties, as seen wih the FireFox runtime
        const result = Reflect.apply(sourcePropDesc.get, receiverRef, [])
        if (typeof result === 'function') {
          // functions must be wrapped to ensure a good this-value.
          // lockdown causes some propDescs to go to value -> getter,
          // eg "Function.prototype.bind". we need to wrap getter results
          // as well in order to ensure they have their this-value wrapped correctly
          // if this ends up being problematic we can maybe take advantage of lockdown's
          // "getter.originalValue" property being available
          return createFunctionWrapper(result, (thisValue) => thisValue === unwrapFromGlobalThis, unwrapToGlobalThis)
        } else {
          return result
        }
      }
    }
    if (sourcePropDesc.set) {
      wrappedPropDesc.set = function (value) {
        // replace the "receiver" value if it points to fake parent
        const receiver = this
        const receiverRef = receiver === unwrapFromGlobalThis ? unwrapToGlobalThis : receiver
        return Reflect.apply(sourcePropDesc.set, receiverRef, [value])
      }
    }
    return wrappedPropDesc
  }

  function applyFunctionPropDescTransform(propDesc, unwrapFromCompartmentGlobalThis, unwrapToGlobalThis) {
    if (!('value' in propDesc && typeof propDesc.value === 'function')) {
      return propDesc
    }
    const unwrapTest = (thisValue) => {
      // unwrap function calls this-value to unwrapToGlobalThis when:
      // this value is globalThis ex. globalThis.abc()
      // scope proxy leak workaround ex. abc()
      return thisValue === unwrapFromCompartmentGlobalThis
    }
    const newFn = createFunctionWrapper(propDesc.value, unwrapTest, unwrapToGlobalThis)
    return { ...propDesc, value: newFn }
  }


  function getPropertyDescriptorDeep(target, key) {
    let receiver = target
    // eslint-disable-next-line no-constant-condition
    while (true) {
      // abort if this is the end of the prototype chain.
      if (!receiver) {
        return { prop: null, receiver: null }
      }
      // support lookup on objects and primitives
      const typeofReceiver = typeof receiver
      if (typeofReceiver === 'object' || typeofReceiver === 'function') {
        const prop = Reflect.getOwnPropertyDescriptor(receiver, key)
        if (prop) {
          return { receiver, prop }
        }
        // try next in the prototype chain
        receiver = Reflect.getPrototypeOf(receiver)
      } else {
        // prototype lookup for primitives
        // eslint-disable-next-line no-proto
        receiver = receiver.__proto__
      }
    }
  }

  function copyWrappedGlobals(globalRef, target, globalThisRefs = ['globalThis']) {
    // find the relevant endowment sources
    const globalProtoChain = getPrototypeChain(globalRef)
    // the index for the common prototypal ancestor, Object.prototype
    // this should always be the last index, but we check just in case
    const commonPrototypeIndex = globalProtoChain.findIndex(globalProtoChainEntry => globalProtoChainEntry === Object.prototype)
    if (commonPrototypeIndex === -1) {
      // TODO: fix this error message
      throw new Error('Lavamoat - unable to find common prototype between Compartment and globalRef')
    }
    // we will copy endowments from all entries in the prototype chain, excluding Object.prototype
    const endowmentSources = globalProtoChain.slice(0, commonPrototypeIndex)

    // call all getters, in case of behavior change (such as with FireFox lazy getters)
    // call on contents of endowmentsSources directly instead of in new array instances. If there is a lazy getter it only changes the original prop desc.
    endowmentSources.forEach(source => {
      const descriptors = Object.getOwnPropertyDescriptors(source)
      Object.values(descriptors).forEach(desc => {
        if ('get' in desc) {
          try {
            // calling getters can potentially throw (e.g. localStorage inside a sandboxed iframe)
            Reflect.apply(desc.get, globalRef, [])
          } catch { }
        }
      })
    })

    const endowmentSourceDescriptors = endowmentSources.map(globalProtoChainEntry => Object.getOwnPropertyDescriptors(globalProtoChainEntry))
    // flatten propDesc collections with precedence for globalThis-end of the prototype chain
    const endowmentDescriptorsFlat = Object.assign(Object.create(null), ...endowmentSourceDescriptors.reverse())
    // expose all own properties of globalRef, including non-enumerable
    Object.entries(endowmentDescriptorsFlat)
      // ignore properties already defined on compartment global
      .filter(([key]) => !(key in target))
      // ignore circular globalThis refs
      .filter(([key]) => !(globalThisRefs.includes(key)))
      // define property on compartment global
      .forEach(([key, desc]) => {
        // unwrap functions, setters/getters & apply scope proxy workaround
        const wrappedPropDesc = applyEndowmentPropDescTransforms(desc, target, globalRef)
        Reflect.defineProperty(target, key, wrappedPropDesc)
      })
    // global circular references otherwise added by prepareCompartmentGlobalFromConfig
    // Add all circular refs to root package compartment globalThis
    for (const ref of globalThisRefs) {
      if (ref in target) {
        continue
      }
      target[ref] = target
    }
    return target
  }

  // util for getting the prototype chain as an array
  // includes the provided value in the result
  function getPrototypeChain(value) {
    const protoChain = []
    let current = value
    while (current && (typeof current === 'object' || typeof current === 'function')) {
      protoChain.push(current)
      current = Reflect.getPrototypeOf(current)
    }
    return protoChain
  }
}

function defaultCreateFunctionWrapper(sourceValue, unwrapTest, unwrapTo) {
  const newValue = function (...args) {
    if (new.target) {
      // handle constructor calls
      return Reflect.construct(sourceValue, args, new.target)
    } else {
      // handle function calls
      // unwrap to target value if this value is the source package compartment's globalThis
      const thisRef = unwrapTest(this) ? unwrapTo : this
      return Reflect.apply(sourceValue, thisRef, args)
    }
  }
  Object.defineProperties(newValue, Object.getOwnPropertyDescriptors(sourceValue))
  return newValue
}

// END of injected code from endowmentsToolkit
  })()
  return module.exports
})()()
    const { prepareCompartmentGlobalFromConfig } = // define makePrepareRealmGlobalFromConfig
(function(){
  const global = globalRef
  const exports = {}
  const module = { exports }
  ;(function(){
// START of injected code from makePrepareRealmGlobalFromConfig
// the contents of this file will be copied into the prelude template
// this module has been written so that it required directly or copied and added to the template with a small wrapper
module.exports = makePrepareRealmGlobalFromConfig

// utilities for exposing configuring the exposed endowments on the container global

// The config uses a period-deliminated path notation to pull out deep values from objects
// These utilities help modify the container global to expose the allowed globals from the globalStore OR the platform global

function makePrepareRealmGlobalFromConfig ({ createFunctionWrapper }) {
  return {
    prepareCompartmentGlobalFromConfig,
    getTopLevelReadAccessFromPackageConfig,
    getTopLevelWriteAccessFromPackageConfig,
  }

  function getTopLevelReadAccessFromPackageConfig (globalsConfig) {
    const result = Object.entries(globalsConfig)
      .filter(([key, value]) => value === 'read' || value === true || (value === 'write' && key.split('.').length > 1))
      .map(([key]) => key.split('.')[0])
    // return unique array
    return Array.from(new Set(result))
  }

  function getTopLevelWriteAccessFromPackageConfig (globalsConfig) {
    const result = Object.entries(globalsConfig)
      .filter(([key, value]) => value === 'write' && key.split('.').length === 1)
      .map(([key]) => key)
    return result
  }

  function prepareCompartmentGlobalFromConfig (packageCompartment, globalsConfig, endowments, globalStore, globalThisRefs) {
    const packageCompartmentGlobal = packageCompartment.globalThis
    // lookup top level read + write access keys
    const topLevelWriteAccessKeys = getTopLevelWriteAccessFromPackageConfig(globalsConfig)
    const topLevelReadAccessKeys = getTopLevelReadAccessFromPackageConfig(globalsConfig)

    // NOTE: getters for read should only ever be needed on props marked for 'write' (unless we want to allow sloppy behavior from the root compartment modifying everything...)
    // Making a pass over the entire policy and collecting the names of writable items would limit the number of getters created here to the minimum.
    // the change should not be introduced here though as we don't want to change the existing behavior of lavamoat-browserify
    // If you're looking at this for the purpose of moving the code to the new core toolkit for endowments building, there's likely a copy of this functionality already

    // define accessors

    // allow read access via globalStore or packageCompartmentGlobal
    topLevelReadAccessKeys.forEach(key => {
      Object.defineProperty(packageCompartmentGlobal, key, {
        get () {
          if (globalStore.has(key)) {
            return globalStore.get(key)
          } else {
            return Reflect.get(endowments, key, this)
          }
        },
        set () {
          // TODO: there should be a config to throw vs silently ignore
          console.warn(`LavaMoat: ignoring write attempt to read-access global "${key}"`)
        },
      })
    })

    // allow write access to globalStore
    // read access via globalStore or packageCompartmentGlobal
    topLevelWriteAccessKeys.forEach(key => {
      Object.defineProperty(packageCompartmentGlobal, key, {
        get () {
          if (globalStore.has(key)) {
            return globalStore.get(key)
          } else {
            return endowments[key]
          }
        },
        set (value) {
          globalStore.set(key, value)
        },
        enumerable: true,
        configurable: true,
      })
    })

    // set circular globalRefs
    globalThisRefs.forEach(key => {
      // if globalRef is actually an endowment, ignore
      if (topLevelReadAccessKeys.includes(key)) {
        return
      }
      if (topLevelWriteAccessKeys.includes(key)) {
        return
      }
      // set circular ref to global
      packageCompartmentGlobal[key] = packageCompartmentGlobal
    })

    // bind Function constructor this value to globalThis
    // legacy globalThis shim
    const origFunction = packageCompartmentGlobal.Function
    const newFunction = function (...args) {
      const fn = origFunction(...args)
      const unwrapTest = thisValue => thisValue === undefined
      return createFunctionWrapper(fn, unwrapTest, packageCompartmentGlobal)
    }
    Object.defineProperties(newFunction, Object.getOwnPropertyDescriptors(origFunction))
    packageCompartmentGlobal.Function = newFunction
  }
}

// END of injected code from makePrepareRealmGlobalFromConfig
  })()
  return module.exports
})()({ createFunctionWrapper })
    const { strictScopeTerminator } = // define strict-scope-terminator
(function(){
  const global = globalRef
  const exports = {}
  const module = { exports }
  ;(function(){
// START of injected code from strict-scope-terminator
// import {
//   Proxy,
//   String,
//   TypeError,
//   ReferenceError,
//   create,
//   freeze,
//   getOwnPropertyDescriptors,
//   globalThis,
//   immutableObject,
// } from './commons.js';
const { freeze, create, getOwnPropertyDescriptors } = Object
const immutableObject = freeze(create(null))

// import { assert } from './error/assert.js';
const assert = {
  fail: (msg) => {
    throw new Error(msg)
  },
}

// const { details: d, quote: q } = assert;
const d = (strings, args) => strings.join() + args.join()
const q = (arg) => arg

/**
 * alwaysThrowHandler
 * This is an object that throws if any property is called. It's used as
 * a proxy handler which throws on any trap called.
 * It's made from a proxy with a get trap that throws. It's safe to
 * create one and share it between all Proxy handlers.
 */
const alwaysThrowHandler = new Proxy(
  immutableObject,
  freeze({
    get(_shadow, prop) {
      assert.fail(
        d`Please report unexpected scope handler trap: ${q(String(prop))}`,
      )
    },
  }),
)

/**
 * scopeTerminatorHandler manages a strictScopeTerminator Proxy which serves as
 * the final scope boundary that will always return "undefined" in order
 * to prevent access to "start compartment globals".
 * @type {ProxyHandler}
 */
const scopeProxyHandlerProperties = {
  get(_shadow, _prop) {
    return undefined
  },

  set(_shadow, prop, _value) {
    // We should only hit this if the has() hook returned true matches the v8
    // ReferenceError message "Uncaught ReferenceError: xyz is not defined"
    throw new ReferenceError(`${String(prop)} is not defined`)
  },

  has(_shadow, prop) {
    // we must at least return true for all properties on the realm globalThis
    return prop in globalThis
  },

  // note: this is likely a bug of safari
  // https://bugs.webkit.org/show_bug.cgi?id=195534
  getPrototypeOf() {
    return null
  },

  // Chip has seen this happen single stepping under the Chrome/v8 debugger.
  // TODO record how to reliably reproduce, and to test if this fix helps.
  // TODO report as bug to v8 or Chrome, and record issue link here.
  getOwnPropertyDescriptor(_target, prop) {
    // Coerce with `String` in case prop is a symbol.
    const quotedProp = q(String(prop))
    console.warn(
      `getOwnPropertyDescriptor trap on scopeTerminatorHandler for ${quotedProp}`,
      new TypeError().stack,
    )
    return undefined
  },
}

// The scope handler's prototype is a proxy that throws if any trap other
// than get/set/has are run (like getOwnPropertyDescriptors, apply,
// getPrototypeOf).
const strictScopeTerminatorHandler = freeze(
  create(
    alwaysThrowHandler,
    getOwnPropertyDescriptors(scopeProxyHandlerProperties),
  ),
)

const strictScopeTerminator = new Proxy(
  immutableObject,
  strictScopeTerminatorHandler,
)

module.exports = {
  alwaysThrowHandler,
  strictScopeTerminatorHandler,
  strictScopeTerminator,
}

// END of injected code from strict-scope-terminator
  })()
  return module.exports
})()

    const scuttleOpts = generateScuttleOpts(scuttleGlobalThis)
    const moduleCache = new Map()
    const packageCompartmentCache = new Map()
    const globalStore = new Map()

    const rootPackageName = '$root$'
    const rootPackageCompartment = createRootPackageCompartment(globalRef)

    // scuttle globalThis right after we used it to create the root package compartment
    if (scuttleOpts.enabled) {
      if (!Array.isArray(scuttleOpts.exceptions)) {
        throw new Error(`LavaMoat - scuttleGlobalThis.exceptions must be an array, got "${typeof scuttleOpts.exceptions}"`)
      }
      scuttleOpts.scuttlerFunc(globalRef, realm => performScuttleGlobalThis(realm, scuttleOpts.exceptions))
    }

    const kernel = {
      internalRequire,
    }
    if (debugMode) {
      kernel._getPolicyForPackage = getPolicyForPackage
      kernel._getCompartmentForPackage = getCompartmentForPackage
    }
    Object.freeze(kernel)
    return kernel

    // generate final scuttling options (1) by taking default
    // options into consideration, (2) turning RE strings into
    // actual REs and (3) without mutating original opts object
    function generateScuttleOpts(originalOpts) {
      const defaultOpts = {
        enabled: true,
        exceptions: [],
        scuttlerName: '',
      }
      const opts = Object.assign({},
        originalOpts === true ? { ... defaultOpts } : { ...originalOpts },
        { scuttlerFunc: (globalRef, scuttle) => scuttle(globalRef) },
        { exceptions: (originalOpts.exceptions || defaultOpts.exceptions).map(e => toRE(e)) },
      )
      if (opts.scuttlerName) {
        if (!globalRef[opts.scuttlerName]) {
          throw new Error(
            `LavaMoat - 'scuttlerName' function "${opts.scuttlerName}" expected on globalRef.` +
            'To learn more visit https://github.com/LavaMoat/LavaMoat/pull/462.',
          )
        }
        opts.scuttlerFunc = globalRef[opts.scuttlerName]
      }
      return opts

      function toRE(except) {
        // turn scuttleGlobalThis.exceptions regexes strings to actual regexes
        if (!except.startsWith('/')) {
          return except
        }
        const parts = except.split('/')
        const pattern = parts.slice(1, -1).join('/')
        const flags = parts[parts.length - 1]
        return new RegExp(pattern, flags)
      }
    }

    function performScuttleGlobalThis (globalRef, extraPropsToAvoid = new Array()) {
      const props = new Array()
      getPrototypeChain(globalRef)
        .forEach(proto =>
          props.push(...Object.getOwnPropertyNames(proto)))

      // support LM,SES exported APIs and polyfills
      const avoidForLavaMoatCompatibility = ['Compartment', 'Error', 'globalThis']
      const propsToAvoid = new Set([...avoidForLavaMoatCompatibility, ...extraPropsToAvoid])

      const obj = Object.create(null)
      for (const prop of props) {
        // eslint-disable-next-line no-inner-declarations
        function set() {
          console.warn(
            `LavaMoat - property "${prop}" of globalThis cannot be set under scuttling mode. ` +
            'To learn more visit https://github.com/LavaMoat/LavaMoat/pull/360.',
          )
        }
        // eslint-disable-next-line no-inner-declarations
        function get() {
          throw new Error(
            `LavaMoat - property "${prop}" of globalThis is inaccessible under scuttling mode. ` +
            'To learn more visit https://github.com/LavaMoat/LavaMoat/pull/360.',
          )
        }
        if (shouldAvoidProp(propsToAvoid, prop)) {
          continue
        }
        let desc = Object.getOwnPropertyDescriptor(globalRef, prop)
        if (desc?.configurable === true) {
          desc = { configurable: false, set, get }
        } else if (desc?.writable === true) {
          const p = new Proxy(obj, { getPrototypeOf: get, get, set } )
          desc = { configurable: false, writable: false, value: p }
        } else {
          continue
        }
        Object.defineProperty(globalRef, prop, desc)
      }
    }

    // this function instantiaties a module from a moduleId.
    // 1. loads the module metadata and policy
    // 2. prepares the execution environment
    // 3. instantiates the module, recursively instantiating dependencies
    // 4. returns the module exports
    function internalRequire (moduleId) {
      // use cached module.exports if module is already instantiated
      if (moduleCache.has(moduleId)) {
        const moduleExports = moduleCache.get(moduleId).exports
        return moduleExports
      }

      reportStatsHook('start', moduleId)

      try {
        // load and validate module metadata
        // if module metadata is missing, throw an error
        const moduleData = loadModuleData(moduleId)
        if (!moduleData) {
          const err = new Error('Cannot find module \'' + moduleId + '\'')
          err.code = 'MODULE_NOT_FOUND'
          throw err
        }
        if (moduleData.id === undefined) {
          throw new Error('LavaMoat - moduleId is not defined correctly.')
        }

        // parse and validate module data
        const { package: packageName, source: moduleSource } = moduleData
        if (!packageName) {
          throw new Error(`LavaMoat - missing packageName for module "${moduleId}"`)
        }
        const packagePolicy = getPolicyForPackage(lavamoatConfig, packageName)

        // create the moduleObj and initializer
        const { moduleInitializer, moduleObj } = prepareModuleInitializer(moduleData, packagePolicy)

        // cache moduleObj here
        // this is important to inf loops when hitting cycles in the dep graph
        // must cache before running the moduleInitializer
        moduleCache.set(moduleId, moduleObj)

        // validate moduleInitializer
        if (typeof moduleInitializer !== 'function') {
          throw new Error(`LavaMoat - moduleInitializer is not defined correctly. got "${typeof moduleInitializer}"\n${moduleSource}`)
        }

        // initialize the module with the correct context
        const initializerArgs = prepareModuleInitializerArgs(requireRelativeWithContext, moduleObj, moduleData)
        moduleInitializer.apply(moduleObj.exports, initializerArgs)
        const moduleExports = moduleObj.exports
        return moduleExports

        // this is passed to the module initializer
        // it adds the context of the parent module
        // this could be replaced via "Function.prototype.bind" if its more performant
        // eslint-disable-next-line no-inner-declarations
        function requireRelativeWithContext (requestedName) {
          const parentModuleExports = moduleObj.exports
          const parentModuleData = moduleData
          const parentPackagePolicy = packagePolicy
          const parentModuleId = moduleId
          return requireRelative({ requestedName, parentModuleExports, parentModuleData, parentPackagePolicy, parentModuleId })
        }
      } finally {
        reportStatsHook('end', moduleId)
      }
    }

    // this resolves a module given a requestedName (eg relative path to parent) and a parentModule context
    // the exports are processed via "protectExportsRequireTime" per the module's configuration
    function requireRelative ({ requestedName, parentModuleExports, parentModuleData, parentPackagePolicy, parentModuleId }) {
      const parentModulePackageName = parentModuleData.package
      const parentPackagesWhitelist = parentPackagePolicy.packages
      const parentBuiltinsWhitelist = Object.entries(parentPackagePolicy.builtin)
        .filter(([, allowed]) => allowed === true)
        // eslint-disable-next-line no-unused-vars
        .map(([packagePath, allowed]) => packagePath.split('.')[0])

      // resolve the moduleId from the requestedName
      const moduleId = getRelativeModuleId(parentModuleId, requestedName)

      // browserify goop:
      // recursive requires dont hit cache so it inf loops, so we shortcircuit
      // this only seems to happen with a few browserify builtins (nodejs builtin module polyfills)
      // we could likely allow any requestedName since it can only refer to itself
      if (moduleId === parentModuleId) {
        if (['timers', 'buffer'].includes(requestedName) === false) {
          throw new Error(`LavaMoat - recursive require detected: "${requestedName}"`)
        }
        return parentModuleExports
      }

      // load module
      let moduleExports = internalRequire(moduleId)

      // look up config for module
      const moduleData = loadModuleData(moduleId)
      const packageName = moduleData.package

      // disallow requiring packages that are not in the parent's whitelist
      const isSamePackage = packageName === parentModulePackageName
      const parentIsEntryModule = parentModulePackageName === rootPackageName
      let isInParentWhitelist = false
      if (moduleData.type === 'builtin') {
        isInParentWhitelist = parentBuiltinsWhitelist.includes(packageName)
      } else {
        isInParentWhitelist = (parentPackagesWhitelist[packageName] === true)
      }

      // validate that the import is allowed
      if (!parentIsEntryModule && !isSamePackage && !isInParentWhitelist) {
        let typeText = ' '
        if (moduleData.type === 'builtin') {
          typeText = ' node builtin '
        }
        throw new Error(`LavaMoat - required${typeText}package not in allowlist: package "${parentModulePackageName}" requested "${packageName}" as "${requestedName}"`)
      }

      // create minimal selection if its a builtin and the whole path is not selected for
      if (!parentIsEntryModule && moduleData.type === 'builtin' && !parentPackagePolicy.builtin[moduleId]) {
        const builtinPaths = (
          Object.entries(parentPackagePolicy.builtin)
          // grab all allowed builtin paths that match this package
            .filter(([packagePath, allowed]) => allowed === true && moduleId === packagePath.split('.')[0])
          // only include the paths after the packageName
            // eslint-disable-next-line no-unused-vars
            .map(([packagePath, allowed]) => packagePath.split('.').slice(1).join('.'))
            .sort()
        )
        moduleExports = makeMinimalViewOfRef(moduleExports, builtinPaths)
      }

      return moduleExports
    }

    function prepareModuleInitializer (moduleData, packagePolicy) {
      const { moduleInitializer, precompiledInitializer, package: packageName, id: moduleId, source: moduleSource } = moduleData

      // moduleInitializer may be set by loadModuleData (e.g. builtin + native modules)
      if (moduleInitializer) {
        // if an external moduleInitializer is set, ensure it is allowed
        if (moduleData.type === 'native') {
          // ensure package is allowed to have native modules
          if (packagePolicy.native !== true) {
            throw new Error(`LavaMoat - "native" module type not permitted for package "${packageName}", module "${moduleId}"`)
          }
        } else if (moduleData.type !== 'builtin') {
          // builtin module types dont have policy configurations
          // but the packages that can import them are constrained elsewhere
          // here we just ensure that the module type is the only other type with a external moduleInitializer
          throw new Error(`LavaMoat - invalid external moduleInitializer for module type "${moduleData.type}" in package "${packageName}", module "${moduleId}"`)
        }
        // moduleObj must be from the same Realm as the moduleInitializer (eg dart2js runtime requirement)
        // here we are assuming the provided moduleInitializer is from the same Realm as this kernel
        const moduleObj = { exports: {} }
        return { moduleInitializer, moduleObj }
      }

      // setup initializer from moduleSource and compartment.
      // execute in package compartment with globalThis populated per package policy
      const packageCompartment = getCompartmentForPackage(packageName, packagePolicy)

      try {
        let moduleObj
        let moduleInitializer
        if (runWithPrecompiledModules) {
          if (!precompiledInitializer) {
            throw new Error(`LavaMoat - precompiledInitializer missing for "${moduleId}" from package "${packageName}"`)
          }
          // moduleObj must be from the same Realm as the moduleInitializer (eg dart2js runtime requirement)
          // here we are assuming the provided moduleInitializer is from the same Realm as this kernel
          moduleObj = { exports: {} }
          const evalKit = {
            globalThis: packageCompartment.globalThis,
            scopeTerminator: strictScopeTerminator,
          }
          // this invokes the with-proxy wrapper
          const moduleInitializerFactory = precompiledInitializer.call(evalKit)
          // this ensures strict mode
          moduleInitializer = moduleInitializerFactory()
        } else {
          if (typeof moduleSource !== 'string') {
            throw new Error(`LavaMoat - moduleSource not a string for "${moduleId}" from package "${packageName}"`)
          }
          const sourceURL = moduleData.file || `modules/${moduleId}`
          if (sourceURL.includes('\n')) {
            throw new Error(`LavaMoat - Newlines not allowed in filenames: ${JSON.stringify(sourceURL)}`)
          }
          // moduleObj must be from the same Realm as the moduleInitializer (eg dart2js runtime requirement)
          moduleObj = packageCompartment.evaluate('({ exports: {} })')
          // TODO: move all source mutations elsewhere
          moduleInitializer = packageCompartment.evaluate(`${moduleSource}\n//# sourceURL=${sourceURL}`)
        }
        return { moduleInitializer, moduleObj }
      } catch (err) {
        console.warn(`LavaMoat - Error evaluating module "${moduleId}" from package "${packageName}" \n${err.stack}`)
        throw err
      }
    }

    function createRootPackageCompartment (globalRef) {
      if (packageCompartmentCache.has(rootPackageName)) {
        throw new Error('LavaMoat - createRootPackageCompartment called more than once')
      }
      // prepare the root package's SES Compartment
      // endowments:
      // - Math is for untamed Math.random
      // - Date is for untamed Date.now
      const rootPackageCompartment = new Compartment({ Math, Date })

      copyWrappedGlobals(globalRef, rootPackageCompartment.globalThis, globalThisRefs)
      // save the compartment for use by other modules in the package
      packageCompartmentCache.set(rootPackageName, rootPackageCompartment)

      return rootPackageCompartment
    }

    function getCompartmentForPackage (packageName, packagePolicy) {
      // compartment may have already been created
      let packageCompartment = packageCompartmentCache.get(packageName)
      if (packageCompartment) {
        return packageCompartment
      }

      // prepare Compartment
      if (getExternalCompartment && packagePolicy.env) {
        // external compartment can be provided by the platform (eg lavamoat-node)
        packageCompartment = getExternalCompartment(packageName, packagePolicy)
      } else {
        // prepare the module's SES Compartment
        // endowments:
        // - Math is for untamed Math.random
        // - Date is for untamed Date.now
        packageCompartment = new Compartment({ Math, Date })
      }
      // prepare endowments
      let endowments
      try {
        endowments = getEndowmentsForConfig(
          // source reference
          rootPackageCompartment.globalThis,
          // policy
          packagePolicy,
          // unwrap to
          globalRef,
          // unwrap from
          packageCompartment.globalThis,
        )
      } catch (err) {
        const errMsg = `Lavamoat - failed to prepare endowments for package "${packageName}":\n${err.stack}`
        throw new Error(errMsg)
      }

      // transform functions, getters & setters on prop descs. Solves SES scope proxy bug
      // WARNING: this part should be unnecessary since SES refactor into multiple nested with statements
      Object.entries(Object.getOwnPropertyDescriptors(endowments))
        // ignore non-configurable properties because we are modifying endowments in place
        .filter(([, propDesc]) => propDesc.configurable)
        .forEach(([key, propDesc]) => {
          const wrappedPropDesc = applyEndowmentPropDescTransforms(propDesc, packageCompartment.globalThis, rootPackageCompartment.globalThis)
          Reflect.defineProperty(endowments, key, wrappedPropDesc)
        })

      // sets up read/write access as configured
      const globalsConfig = packagePolicy.globals
      prepareCompartmentGlobalFromConfig(packageCompartment, globalsConfig, endowments, globalStore, globalThisRefs)

      // save the compartment for use by other modules in the package
      packageCompartmentCache.set(packageName, packageCompartment)

      return packageCompartment
    }

    // this gets the lavaMoat config for a module by packageName
    // if there were global defaults (e.g. everything gets "console") they could be applied here
    function getPolicyForPackage (config, packageName) {
      const packageConfig = (config.resources || {})[packageName] || {}
      packageConfig.globals = packageConfig.globals || {}
      packageConfig.packages = packageConfig.packages || {}
      packageConfig.builtin = packageConfig.builtin || {}
      return packageConfig
    }

    // util for getting the prototype chain as an array
    // includes the provided value in the result
    function getPrototypeChain (value) {
      const protoChain = []
      let current = value
      while (current && (typeof current === 'object' || typeof current === 'function')) {
        protoChain.push(current)
        current = Reflect.getPrototypeOf(current)
      }
      return protoChain
    }

    function shouldAvoidProp(propsToAvoid, prop) {
      for (const avoid of propsToAvoid) {
        if (avoid instanceof RegExp && avoid.test(prop)) {
          return true
        }
        if (propsToAvoid.has(prop)) {
          return true
        }
      }
      return false
    }
  }
})()

    const kernel = createKernelCore({
      lavamoatConfig,
      loadModuleData,
      getRelativeModuleId,
      prepareModuleInitializerArgs,
      getExternalCompartment,
      globalRef,
      globalThisRefs,
      scuttleGlobalThis,
      debugMode,
      runWithPrecompiledModules,
      reportStatsHook,
    })
    return kernel
  }
})()

  const kernel = createKernel({
    runWithPrecompiledModules: true,
    lavamoatConfig: lavamoatPolicy,
    loadModuleData,
    getRelativeModuleId,
    prepareModuleInitializerArgs,
    globalThisRefs: ['window', 'self', 'global', 'globalThis'],
    debugMode,
    reportStatsHook,
  })
  const { internalRequire } = kernel

  // create a lavamoat pulic API for loading modules over multiple files
  const LavaPack = Object.freeze({
    loadPolicy: Object.freeze(loadPolicy),
    loadBundle: Object.freeze(loadBundle),
    runModule: Object.freeze(runModule),
  })
  // in debug mode, expose the kernel on the LavaPack API
  if (debugMode) {
    LavaPack._kernel = kernel
  }

  Object.defineProperty(globalThis, 'LavaPack', {value: LavaPack})
  return


  function loadModuleData (moduleId) {
    if (typeof window === 'undefined' && typeof require === 'function' && require('node:module').isBuiltin(moduleId)) {
      return {
        type: 'builtin',
        package: moduleId,
        id: moduleId,
        // Using unprotected require
        moduleInitializer: (_, module) => {
          module.exports = require(moduleId);
        },
      }
    }
    if (!moduleRegistry.has(moduleId)) {
      throw new Error(`no module registered for "${moduleId}" (${typeof moduleId})`)
    }
    return moduleRegistry.get(moduleId)
  }

  function getRelativeModuleId (parentModuleId, requestedName) {
    const parentModuleData = loadModuleData(parentModuleId)
    if (!(requestedName in parentModuleData.deps)) {
      console.warn(`missing dep: ${parentModuleData.package} requested ${requestedName}`)
    }
    return parentModuleData.deps[requestedName] || requestedName
  }

  function prepareModuleInitializerArgs (requireRelativeWithContext, moduleObj, moduleData) {
    const require = requireRelativeWithContext
    const module = moduleObj
    const exports = moduleObj.exports
    // bify direct module instantiation disabled ("arguments[4]")
    return [require, module, exports, null, null]
  }

  // it is called by the policy loader or modules collection
  function loadPolicy (bundlePolicy) {
    // verify + load config
    Object.entries(bundlePolicy.resources || {}).forEach(([packageName, packageConfig]) => {
      if (packageName in lavamoatPolicy) {
        throw new Error(`LavaMoat - loadBundle encountered redundant config definition for package "${packageName}"`)
      }
      lavamoatPolicy.resources[packageName] = packageConfig
    })
  }

  // it is called by the modules collection
  function loadBundle (newModules, entryPoints, bundlePolicy) {
    // verify + load config
    if (bundlePolicy) {
      loadPolicy(bundlePolicy)
    }
    // verify + load in each module
    for (const [moduleId, moduleDeps, initFn, { package: packageName, type }] of newModules) {
      // verify that module is new
      if (moduleRegistry.has(moduleId)) {
        throw new Error(`LavaMoat - loadBundle encountered redundant module definition for id "${moduleId}"`)
      }
      // add the module
      moduleRegistry.set(moduleId, {
        type: type || 'js',
        id: moduleId,
        deps: moduleDeps,
        // source: `(${initFn})`,
        precompiledInitializer: initFn,
        package: packageName,
      })
    }
    // run each of entryPoints
    const entryExports = Array.prototype.map.call(entryPoints, (entryId) => {
      return runModule(entryId)
    })
    // webpack compat: return the first module's exports
    return entryExports[0]
  }

  function runModule (moduleId) {
    if (!moduleRegistry.has(moduleId)) {
      throw new Error(`no module registered for "${moduleId}" (${typeof moduleId})`)
    }
    return internalRequire(moduleId)
  }

  // called by reportStatsHook
  function onStatsReady (moduleGraphStatsObj) {
    const graphId = Date.now()
    console.warn(`completed module graph init "${graphId}" in ${moduleGraphStatsObj.value}ms ("${moduleGraphStatsObj.name}")`)
    console.warn('logging module init stats object:')
    console.warn(JSON.stringify(moduleGraphStatsObj, null, 2))
  }

})()

LavaPack.loadBundle([[1,{"./Substream":2,"end-of-stream":91,once:127,"readable-stream":13},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){var n=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(r,"__esModule",{value:!0}),r.ObjectMultiplex=void 0;const s=e("readable-stream"),i=n(e("end-of-stream")),o=n(e("once")),a=e("./Substream"),u=Symbol("IGNORE_SUBSTREAM");class c extends s.Duplex{constructor(e={}){super(Object.assign(Object.assign({},e),{objectMode:!0})),this._substreams={}}createStream(e){if(this.destroyed)throw new Error(`ObjectMultiplex - parent stream for name "${e}" already destroyed`);if(this._readableState.ended||this._writableState.ended)throw new Error(`ObjectMultiplex - parent stream for name "${e}" already ended`);if(!e)throw new Error("ObjectMultiplex - name must not be empty");if(this._substreams[e])throw new Error(`ObjectMultiplex - Substream for name "${e}" already exists`);const t=new a.Substream({parent:this,name:e});return this._substreams[e]=t,function(e,t){const r=o.default(t);i.default(e,{readable:!1},r),i.default(e,{writable:!1},r)}(this,(e=>t.destroy(e||undefined))),t}ignoreStream(e){if(!e)throw new Error("ObjectMultiplex - name must not be empty");if(this._substreams[e])throw new Error(`ObjectMultiplex - Substream for name "${e}" already exists`);this._substreams[e]=u}_read(){return undefined}_write(e,t,r){const{name:n,data:s}=e;if(!n)return console.warn(`ObjectMultiplex - malformed chunk without name "${e}"`),r();const i=this._substreams[n];return i?(i!==u&&i.push(s),r()):(console.warn(`ObjectMultiplex - orphaned data for stream "${n}"`),r())}}r.ObjectMultiplex=c}}},{package:"@metamask/object-multiplex",file:"../../node_modules/@metamask/object-multiplex/dist/ObjectMultiplex.js"}],[2,{"readable-stream":13},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){Object.defineProperty(r,"__esModule",{value:!0}),r.Substream=void 0;const n=e("readable-stream");class s extends n.Duplex{constructor({parent:e,name:t}){super({objectMode:!0}),this._parent=e,this._name=t}_read(){return undefined}_write(e,t,r){this._parent.push({name:this._name,data:e}),r()}}r.Substream=s}}},{package:"@metamask/object-multiplex",file:"../../node_modules/@metamask/object-multiplex/dist/Substream.js"}],[3,{"./ObjectMultiplex":1},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){const n=e("./ObjectMultiplex");t.exports=n.ObjectMultiplex}}},{package:"@metamask/object-multiplex",file:"../../node_modules/@metamask/object-multiplex/dist/index.js"}],[4,{},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){var n={}.toString;t.exports=Array.isArray||function(e){return"[object Array]"==n.call(e)}}}},{package:"@metamask/object-multiplex>readable-stream>isarray",file:"../../node_modules/@metamask/object-multiplex/node_modules/isarray/index.js"}],[5,{"./_stream_readable":7,"./_stream_writable":9,"core-util-is":84,inherits:101,"process-nextick-args":128},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){var n=e("process-nextick-args"),s=Object.keys||function(e){var t=[];for(var r in e)t.push(r);return t};t.exports=d;var i=Object.create(e("core-util-is"));i.inherits=e("inherits");var o=e("./_stream_readable"),a=e("./_stream_writable");i.inherits(d,o);for(var u=s(a.prototype),c=0;c<u.length;c++){var l=u[c];d.prototype[l]||(d.prototype[l]=a.prototype[l])}function d(e){if(!(this instanceof d))return new d(e);o.call(this,e),a.call(this,e),e&&!1===e.readable&&(this.readable=!1),e&&!1===e.writable&&(this.writable=!1),this.allowHalfOpen=!0,e&&!1===e.allowHalfOpen&&(this.allowHalfOpen=!1),this.once("end",f)}function f(){this.allowHalfOpen||this._writableState.ended||n.nextTick(h,this)}function h(e){e.end()}Object.defineProperty(d.prototype,"writableHighWaterMark",{enumerable:!1,get:function(){return this._writableState.highWaterMark}}),Object.defineProperty(d.prototype,"destroyed",{get:function(){return this._readableState!==undefined&&this._writableState!==undefined&&(this._readableState.destroyed&&this._writableState.destroyed)},set:function(e){this._readableState!==undefined&&this._writableState!==undefined&&(this._readableState.destroyed=e,this._writableState.destroyed=e)}}),d.prototype._destroy=function(e,t){this.push(null),this.end(),n.nextTick(t,e)}}}},{package:"@metamask/object-multiplex>readable-stream",file:"../../node_modules/@metamask/object-multiplex/node_modules/readable-stream/lib/_stream_duplex.js"}],[6,{"./_stream_transform":8,"core-util-is":84,inherits:101},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){t.exports=i;var n=e("./_stream_transform"),s=Object.create(e("core-util-is"));function i(e){if(!(this instanceof i))return new i(e);n.call(this,e)}s.inherits=e("inherits"),s.inherits(i,n),i.prototype._transform=function(e,t,r){r(null,e)}}}},{package:"@metamask/object-multiplex>readable-stream",file:"../../node_modules/@metamask/object-multiplex/node_modules/readable-stream/lib/_stream_passthrough.js"}],[7,{"./_stream_duplex":5,"./internal/streams/BufferList":10,"./internal/streams/destroy":11,"./internal/streams/stream":12,"core-util-is":84,events:"events",inherits:101,isarray:4,"process-nextick-args":128,"safe-buffer":14,"string_decoder/":15,util:"util"},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){var n=e("process-nextick-args");t.exports=w;var s,i=e("isarray");w.ReadableState=b;e("events").EventEmitter;var o=function(e,t){return e.listeners(t).length},a=e("./internal/streams/stream"),u=e("safe-buffer").Buffer,c=global.Uint8Array||function(){};var l=Object.create(e("core-util-is"));l.inherits=e("inherits");var d=e("util"),f=void 0;f=d&&d.debuglog?d.debuglog("stream"):function(){};var h,p=e("./internal/streams/BufferList"),m=e("./internal/streams/destroy");l.inherits(w,a);var g=["error","close","destroy","pause","resume"];function b(t,r){t=t||{};var n=r instanceof(s=s||e("./_stream_duplex"));this.objectMode=!!t.objectMode,n&&(this.objectMode=this.objectMode||!!t.readableObjectMode);var i=t.highWaterMark,o=t.readableHighWaterMark,a=this.objectMode?16:16384;this.highWaterMark=i||0===i?i:n&&(o||0===o)?o:a,this.highWaterMark=Math.floor(this.highWaterMark),this.buffer=new p,this.length=0,this.pipes=null,this.pipesCount=0,this.flowing=null,this.ended=!1,this.endEmitted=!1,this.reading=!1,this.sync=!0,this.needReadable=!1,this.emittedReadable=!1,this.readableListening=!1,this.resumeScheduled=!1,this.destroyed=!1,this.defaultEncoding=t.defaultEncoding||"utf8",this.awaitDrain=0,this.readingMore=!1,this.decoder=null,this.encoding=null,t.encoding&&(h||(h=e("string_decoder/").StringDecoder),this.decoder=new h(t.encoding),this.encoding=t.encoding)}function w(t){if(s=s||e("./_stream_duplex"),!(this instanceof w))return new w(t);this._readableState=new b(t,this),this.readable=!0,t&&("function"==typeof t.read&&(this._read=t.read),"function"==typeof t.destroy&&(this._destroy=t.destroy)),a.call(this)}function y(e,t,r,n,s){var i,o=e._readableState;null===t?(o.reading=!1,function(e,t){if(t.ended)return;if(t.decoder){var r=t.decoder.end();r&&r.length&&(t.buffer.push(r),t.length+=t.objectMode?1:r.length)}t.ended=!0,E(e)}(e,o)):(s||(i=function(e,t){var r;n=t,u.isBuffer(n)||n instanceof c||"string"==typeof t||t===undefined||e.objectMode||(r=new TypeError("Invalid non-string/buffer chunk"));var n;return r}(o,t)),i?e.emit("error",i):o.objectMode||t&&t.length>0?("string"==typeof t||o.objectMode||Object.getPrototypeOf(t)===u.prototype||(t=function(e){return u.from(e)}(t)),n?o.endEmitted?e.emit("error",new Error("stream.unshift() after end event")):v(e,o,t,!0):o.ended?e.emit("error",new Error("stream.push() after EOF")):(o.reading=!1,o.decoder&&!r?(t=o.decoder.write(t),o.objectMode||0!==t.length?v(e,o,t,!1):T(e,o)):v(e,o,t,!1))):n||(o.reading=!1));return function(e){return!e.ended&&(e.needReadable||e.length<e.highWaterMark||0===e.length)}(o)}function v(e,t,r,n){t.flowing&&0===t.length&&!t.sync?(e.emit("data",r),e.read(0)):(t.length+=t.objectMode?1:r.length,n?t.buffer.unshift(r):t.buffer.push(r),t.needReadable&&E(e)),T(e,t)}Object.defineProperty(w.prototype,"destroyed",{get:function(){return this._readableState!==undefined&&this._readableState.destroyed},set:function(e){this._readableState&&(this._readableState.destroyed=e)}}),w.prototype.destroy=m.destroy,w.prototype._undestroy=m.undestroy,w.prototype._destroy=function(e,t){this.push(null),t(e)},w.prototype.push=function(e,t){var r,n=this._readableState;return n.objectMode?r=!0:"string"==typeof e&&((t=t||n.defaultEncoding)!==n.encoding&&(e=u.from(e,t),t=""),r=!0),y(this,e,t,!1,r)},w.prototype.unshift=function(e){return y(this,e,null,!0,!1)},w.prototype.isPaused=function(){return!1===this._readableState.flowing},w.prototype.setEncoding=function(t){return h||(h=e("string_decoder/").StringDecoder),this._readableState.decoder=new h(t),this._readableState.encoding=t,this};var _=8388608;function S(e,t){return e<=0||0===t.length&&t.ended?0:t.objectMode?1:e!=e?t.flowing&&t.length?t.buffer.head.data.length:t.length:(e>t.highWaterMark&&(t.highWaterMark=function(e){return e>=_?e=_:(e--,e|=e>>>1,e|=e>>>2,e|=e>>>4,e|=e>>>8,e|=e>>>16,e++),e}(e)),e<=t.length?e:t.ended?t.length:(t.needReadable=!0,0))}function E(e){var t=e._readableState;t.needReadable=!1,t.emittedReadable||(f("emitReadable",t.flowing),t.emittedReadable=!0,t.sync?n.nextTick(k,e):k(e))}function k(e){f("emit readable"),e.emit("readable"),M(e)}function T(e,t){t.readingMore||(t.readingMore=!0,n.nextTick(j,e,t))}function j(e,t){for(var r=t.length;!t.reading&&!t.flowing&&!t.ended&&t.length<t.highWaterMark&&(f("maybeReadMore read 0"),e.read(0),r!==t.length);)r=t.length;t.readingMore=!1}function R(e){f("readable nexttick read 0"),e.read(0)}function x(e,t){t.reading||(f("resume read 0"),e.read(0)),t.resumeScheduled=!1,t.awaitDrain=0,e.emit("resume"),M(e),t.flowing&&!t.reading&&e.read(0)}function M(e){var t=e._readableState;for(f("flow",t.flowing);t.flowing&&null!==e.read(););}function O(e,t){return 0===t.length?null:(t.objectMode?r=t.buffer.shift():!e||e>=t.length?(r=t.decoder?t.buffer.join(""):1===t.buffer.length?t.buffer.head.data:t.buffer.concat(t.length),t.buffer.clear()):r=function(e,t,r){var n;e<t.head.data.length?(n=t.head.data.slice(0,e),t.head.data=t.head.data.slice(e)):n=e===t.head.data.length?t.shift():r?function(e,t){var r=t.head,n=1,s=r.data;e-=s.length;for(;r=r.next;){var i=r.data,o=e>i.length?i.length:e;if(o===i.length?s+=i:s+=i.slice(0,e),0===(e-=o)){o===i.length?(++n,r.next?t.head=r.next:t.head=t.tail=null):(t.head=r,r.data=i.slice(o));break}++n}return t.length-=n,s}(e,t):function(e,t){var r=u.allocUnsafe(e),n=t.head,s=1;n.data.copy(r),e-=n.data.length;for(;n=n.next;){var i=n.data,o=e>i.length?i.length:e;if(i.copy(r,r.length-e,0,o),0===(e-=o)){o===i.length?(++s,n.next?t.head=n.next:t.head=t.tail=null):(t.head=n,n.data=i.slice(o));break}++s}return t.length-=s,r}(e,t);return n}(e,t.buffer,t.decoder),r);var r}function P(e){var t=e._readableState;if(t.length>0)throw new Error('"endReadable()" called on non-empty stream');t.endEmitted||(t.ended=!0,n.nextTick(C,t,e))}function C(e,t){e.endEmitted||0!==e.length||(e.endEmitted=!0,t.readable=!1,t.emit("end"))}function I(e,t){for(var r=0,n=e.length;r<n;r++)if(e[r]===t)return r;return-1}w.prototype.read=function(e){f("read",e),e=parseInt(e,10);var t=this._readableState,r=e;if(0!==e&&(t.emittedReadable=!1),0===e&&t.needReadable&&(t.length>=t.highWaterMark||t.ended))return f("read: emitReadable",t.length,t.ended),0===t.length&&t.ended?P(this):E(this),null;if(0===(e=S(e,t))&&t.ended)return 0===t.length&&P(this),null;var n,s=t.needReadable;return f("need readable",s),(0===t.length||t.length-e<t.highWaterMark)&&f("length less than watermark",s=!0),t.ended||t.reading?f("reading or ended",s=!1):s&&(f("do read"),t.reading=!0,t.sync=!0,0===t.length&&(t.needReadable=!0),this._read(t.highWaterMark),t.sync=!1,t.reading||(e=S(r,t))),null===(n=e>0?O(e,t):null)?(t.needReadable=!0,e=0):t.length-=e,0===t.length&&(t.ended||(t.needReadable=!0),r!==e&&t.ended&&P(this)),null!==n&&this.emit("data",n),n},w.prototype._read=function(e){this.emit("error",new Error("_read() is not implemented"))},w.prototype.pipe=function(e,t){var r=this,s=this._readableState;switch(s.pipesCount){case 0:s.pipes=e;break;case 1:s.pipes=[s.pipes,e];break;default:s.pipes.push(e)}s.pipesCount+=1,f("pipe count=%d opts=%j",s.pipesCount,t);var a=(!t||!1!==t.end)&&e!==process.stdout&&e!==process.stderr?c:w;function u(t,n){f("onunpipe"),t===r&&n&&!1===n.hasUnpiped&&(n.hasUnpiped=!0,f("cleanup"),e.removeListener("close",g),e.removeListener("finish",b),e.removeListener("drain",l),e.removeListener("error",m),e.removeListener("unpipe",u),r.removeListener("end",c),r.removeListener("end",w),r.removeListener("data",p),d=!0,!s.awaitDrain||e._writableState&&!e._writableState.needDrain||l())}function c(){f("onend"),e.end()}s.endEmitted?n.nextTick(a):r.once("end",a),e.on("unpipe",u);var l=function(e){return function(){var t=e._readableState;f("pipeOnDrain",t.awaitDrain),t.awaitDrain&&t.awaitDrain--,0===t.awaitDrain&&o(e,"data")&&(t.flowing=!0,M(e))}}(r);e.on("drain",l);var d=!1;var h=!1;function p(t){f("ondata"),h=!1,!1!==e.write(t)||h||((1===s.pipesCount&&s.pipes===e||s.pipesCount>1&&-1!==I(s.pipes,e))&&!d&&(f("false write response, pause",r._readableState.awaitDrain),r._readableState.awaitDrain++,h=!0),r.pause())}function m(t){f("onerror",t),w(),e.removeListener("error",m),0===o(e,"error")&&e.emit("error",t)}function g(){e.removeListener("finish",b),w()}function b(){f("onfinish"),e.removeListener("close",g),w()}function w(){f("unpipe"),r.unpipe(e)}return r.on("data",p),function(e,t,r){if("function"==typeof e.prependListener)return e.prependListener(t,r);e._events&&e._events[t]?i(e._events[t])?e._events[t].unshift(r):e._events[t]=[r,e._events[t]]:e.on(t,r)}(e,"error",m),e.once("close",g),e.once("finish",b),e.emit("pipe",r),s.flowing||(f("pipe resume"),r.resume()),e},w.prototype.unpipe=function(e){var t=this._readableState,r={hasUnpiped:!1};if(0===t.pipesCount)return this;if(1===t.pipesCount)return e&&e!==t.pipes||(e||(e=t.pipes),t.pipes=null,t.pipesCount=0,t.flowing=!1,e&&e.emit("unpipe",this,r)),this;if(!e){var n=t.pipes,s=t.pipesCount;t.pipes=null,t.pipesCount=0,t.flowing=!1;for(var i=0;i<s;i++)n[i].emit("unpipe",this,r);return this}var o=I(t.pipes,e);return-1===o||(t.pipes.splice(o,1),t.pipesCount-=1,1===t.pipesCount&&(t.pipes=t.pipes[0]),e.emit("unpipe",this,r)),this},w.prototype.on=function(e,t){var r=a.prototype.on.call(this,e,t);if("data"===e)!1!==this._readableState.flowing&&this.resume();else if("readable"===e){var s=this._readableState;s.endEmitted||s.readableListening||(s.readableListening=s.needReadable=!0,s.emittedReadable=!1,s.reading?s.length&&E(this):n.nextTick(R,this))}return r},w.prototype.addListener=w.prototype.on,w.prototype.resume=function(){var e=this._readableState;return e.flowing||(f("resume"),e.flowing=!0,function(e,t){t.resumeScheduled||(t.resumeScheduled=!0,n.nextTick(x,e,t))}(this,e)),this},w.prototype.pause=function(){return f("call pause flowing=%j",this._readableState.flowing),!1!==this._readableState.flowing&&(f("pause"),this._readableState.flowing=!1,this.emit("pause")),this},w.prototype.wrap=function(e){var t=this,r=this._readableState,n=!1;for(var s in e.on("end",(function(){if(f("wrapped end"),r.decoder&&!r.ended){var e=r.decoder.end();e&&e.length&&t.push(e)}t.push(null)})),e.on("data",(function(s){(f("wrapped data"),r.decoder&&(s=r.decoder.write(s)),!r.objectMode||null!==s&&s!==undefined)&&((r.objectMode||s&&s.length)&&(t.push(s)||(n=!0,e.pause())))})),e)this[s]===undefined&&"function"==typeof e[s]&&(this[s]=function(t){return function(){return e[t].apply(e,arguments)}}(s));for(var i=0;i<g.length;i++)e.on(g[i],this.emit.bind(this,g[i]));return this._read=function(t){f("wrapped _read",t),n&&(n=!1,e.resume())},this},Object.defineProperty(w.prototype,"readableHighWaterMark",{enumerable:!1,get:function(){return this._readableState.highWaterMark}}),w._fromList=O}}},{package:"@metamask/object-multiplex>readable-stream",file:"../../node_modules/@metamask/object-multiplex/node_modules/readable-stream/lib/_stream_readable.js"}],[8,{"./_stream_duplex":5,"core-util-is":84,inherits:101},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){t.exports=o;var n=e("./_stream_duplex"),s=Object.create(e("core-util-is"));function i(e,t){var r=this._transformState;r.transforming=!1;var n=r.writecb;if(!n)return this.emit("error",new Error("write callback called multiple times"));r.writechunk=null,r.writecb=null,null!=t&&this.push(t),n(e);var s=this._readableState;s.reading=!1,(s.needReadable||s.length<s.highWaterMark)&&this._read(s.highWaterMark)}function o(e){if(!(this instanceof o))return new o(e);n.call(this,e),this._transformState={afterTransform:i.bind(this),needTransform:!1,transforming:!1,writecb:null,writechunk:null,writeencoding:null},this._readableState.needReadable=!0,this._readableState.sync=!1,e&&("function"==typeof e.transform&&(this._transform=e.transform),"function"==typeof e.flush&&(this._flush=e.flush)),this.on("prefinish",a)}function a(){var e=this;"function"==typeof this._flush?this._flush((function(t,r){u(e,t,r)})):u(this,null,null)}function u(e,t,r){if(t)return e.emit("error",t);if(null!=r&&e.push(r),e._writableState.length)throw new Error("Calling transform done when ws.length != 0");if(e._transformState.transforming)throw new Error("Calling transform done when still transforming");return e.push(null)}s.inherits=e("inherits"),s.inherits(o,n),o.prototype.push=function(e,t){return this._transformState.needTransform=!1,n.prototype.push.call(this,e,t)},o.prototype._transform=function(e,t,r){throw new Error("_transform() is not implemented")},o.prototype._write=function(e,t,r){var n=this._transformState;if(n.writecb=r,n.writechunk=e,n.writeencoding=t,!n.transforming){var s=this._readableState;(n.needTransform||s.needReadable||s.length<s.highWaterMark)&&this._read(s.highWaterMark)}},o.prototype._read=function(e){var t=this._transformState;null!==t.writechunk&&t.writecb&&!t.transforming?(t.transforming=!0,this._transform(t.writechunk,t.writeencoding,t.afterTransform)):t.needTransform=!0},o.prototype._destroy=function(e,t){var r=this;n.prototype._destroy.call(this,e,(function(e){t(e),r.emit("close")}))}}}},{package:"@metamask/object-multiplex>readable-stream",file:"../../node_modules/@metamask/object-multiplex/node_modules/readable-stream/lib/_stream_transform.js"}],[9,{"./_stream_duplex":5,"./internal/streams/destroy":11,"./internal/streams/stream":12,"core-util-is":84,inherits:101,"process-nextick-args":128,"safe-buffer":14,timers:"timers","util-deprecate":194},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){(function(r){(function(){var n=e("process-nextick-args");function s(e){var t=this;this.next=null,this.entry=null,this.finish=function(){!function(e,t,r){var n=e.entry;e.entry=null;for(;n;){var s=n.callback;t.pendingcb--,s(r),n=n.next}t.corkedRequestsFree?t.corkedRequestsFree.next=e:t.corkedRequestsFree=e}(t,e)}}t.exports=g;var i,o=!process.browser&&["v0.10","v0.9."].indexOf(process.version.slice(0,5))>-1?r:n.nextTick;g.WritableState=m;var a=Object.create(e("core-util-is"));a.inherits=e("inherits");var u={deprecate:e("util-deprecate")},c=e("./internal/streams/stream"),l=e("safe-buffer").Buffer,d=global.Uint8Array||function(){};var f,h=e("./internal/streams/destroy");function p(){}function m(t,r){i=i||e("./_stream_duplex"),t=t||{};var a=r instanceof i;this.objectMode=!!t.objectMode,a&&(this.objectMode=this.objectMode||!!t.writableObjectMode);var u=t.highWaterMark,c=t.writableHighWaterMark,l=this.objectMode?16:16384;this.highWaterMark=u||0===u?u:a&&(c||0===c)?c:l,this.highWaterMark=Math.floor(this.highWaterMark),this.finalCalled=!1,this.needDrain=!1,this.ending=!1,this.ended=!1,this.finished=!1,this.destroyed=!1;var d=!1===t.decodeStrings;this.decodeStrings=!d,this.defaultEncoding=t.defaultEncoding||"utf8",this.length=0,this.writing=!1,this.corked=0,this.sync=!0,this.bufferProcessing=!1,this.onwrite=function(e){!function(e,t){var r=e._writableState,s=r.sync,i=r.writecb;if(function(e){e.writing=!1,e.writecb=null,e.length-=e.writelen,e.writelen=0}(r),t)!function(e,t,r,s,i){--t.pendingcb,r?(n.nextTick(i,s),n.nextTick(S,e,t),e._writableState.errorEmitted=!0,e.emit("error",s)):(i(s),e._writableState.errorEmitted=!0,e.emit("error",s),S(e,t))}(e,r,s,t,i);else{var a=v(r);a||r.corked||r.bufferProcessing||!r.bufferedRequest||y(e,r),s?o(w,e,r,a,i):w(e,r,a,i)}}(r,e)},this.writecb=null,this.writelen=0,this.bufferedRequest=null,this.lastBufferedRequest=null,this.pendingcb=0,this.prefinished=!1,this.errorEmitted=!1,this.bufferedRequestCount=0,this.corkedRequestsFree=new s(this)}function g(t){if(i=i||e("./_stream_duplex"),!(f.call(g,this)||this instanceof i))return new g(t);this._writableState=new m(t,this),this.writable=!0,t&&("function"==typeof t.write&&(this._write=t.write),"function"==typeof t.writev&&(this._writev=t.writev),"function"==typeof t.destroy&&(this._destroy=t.destroy),"function"==typeof t.final&&(this._final=t.final)),c.call(this)}function b(e,t,r,n,s,i,o){t.writelen=n,t.writecb=o,t.writing=!0,t.sync=!0,r?e._writev(s,t.onwrite):e._write(s,i,t.onwrite),t.sync=!1}function w(e,t,r,n){r||function(e,t){0===t.length&&t.needDrain&&(t.needDrain=!1,e.emit("drain"))}(e,t),t.pendingcb--,n(),S(e,t)}function y(e,t){t.bufferProcessing=!0;var r=t.bufferedRequest;if(e._writev&&r&&r.next){var n=t.bufferedRequestCount,i=new Array(n),o=t.corkedRequestsFree;o.entry=r;for(var a=0,u=!0;r;)i[a]=r,r.isBuf||(u=!1),r=r.next,a+=1;i.allBuffers=u,b(e,t,!0,t.length,i,"",o.finish),t.pendingcb++,t.lastBufferedRequest=null,o.next?(t.corkedRequestsFree=o.next,o.next=null):t.corkedRequestsFree=new s(t),t.bufferedRequestCount=0}else{for(;r;){var c=r.chunk,l=r.encoding,d=r.callback;if(b(e,t,!1,t.objectMode?1:c.length,c,l,d),r=r.next,t.bufferedRequestCount--,t.writing)break}null===r&&(t.lastBufferedRequest=null)}t.bufferedRequest=r,t.bufferProcessing=!1}function v(e){return e.ending&&0===e.length&&null===e.bufferedRequest&&!e.finished&&!e.writing}function _(e,t){e._final((function(r){t.pendingcb--,r&&e.emit("error",r),t.prefinished=!0,e.emit("prefinish"),S(e,t)}))}function S(e,t){var r=v(t);return r&&(!function(e,t){t.prefinished||t.finalCalled||("function"==typeof e._final?(t.pendingcb++,t.finalCalled=!0,n.nextTick(_,e,t)):(t.prefinished=!0,e.emit("prefinish")))}(e,t),0===t.pendingcb&&(t.finished=!0,e.emit("finish"))),r}a.inherits(g,c),m.prototype.getBuffer=function(){for(var e=this.bufferedRequest,t=[];e;)t.push(e),e=e.next;return t},function(){try{Object.defineProperty(m.prototype,"buffer",{get:u.deprecate((function(){return this.getBuffer()}),"_writableState.buffer is deprecated. Use _writableState.getBuffer "+"instead.","DEP0003")})}catch(e){}}(),"function"==typeof Symbol&&Symbol.hasInstance&&"function"==typeof Function.prototype[Symbol.hasInstance]?(f=Function.prototype[Symbol.hasInstance],Object.defineProperty(g,Symbol.hasInstance,{value:function(e){return!!f.call(this,e)||this===g&&(e&&e._writableState instanceof m)}})):f=function(e){return e instanceof this},g.prototype.pipe=function(){this.emit("error",new Error("Cannot pipe, not readable"))},g.prototype.write=function(e,t,r){var s,i=this._writableState,o=!1,a=!i.objectMode&&(s=e,l.isBuffer(s)||s instanceof d);return a&&!l.isBuffer(e)&&(e=function(e){return l.from(e)}(e)),"function"==typeof t&&(r=t,t=null),a?t="buffer":t||(t=i.defaultEncoding),"function"!=typeof r&&(r=p),i.ended?function(e,t){var r=new Error("write after end");e.emit("error",r),n.nextTick(t,r)}(this,r):(a||function(e,t,r,s){var i=!0,o=!1;return null===r?o=new TypeError("May not write null values to stream"):"string"==typeof r||r===undefined||t.objectMode||(o=new TypeError("Invalid non-string/buffer chunk")),o&&(e.emit("error",o),n.nextTick(s,o),i=!1),i}(this,i,e,r))&&(i.pendingcb++,o=function(e,t,r,n,s,i){if(!r){var o=function(e,t,r){e.objectMode||!1===e.decodeStrings||"string"!=typeof t||(t=l.from(t,r));return t}(t,n,s);n!==o&&(r=!0,s="buffer",n=o)}var a=t.objectMode?1:n.length;t.length+=a;var u=t.length<t.highWaterMark;u||(t.needDrain=!0);if(t.writing||t.corked){var c=t.lastBufferedRequest;t.lastBufferedRequest={chunk:n,encoding:s,isBuf:r,callback:i,next:null},c?c.next=t.lastBufferedRequest:t.bufferedRequest=t.lastBufferedRequest,t.bufferedRequestCount+=1}else b(e,t,!1,a,n,s,i);return u}(this,i,a,e,t,r)),o},g.prototype.cork=function(){this._writableState.corked++},g.prototype.uncork=function(){var e=this._writableState;e.corked&&(e.corked--,e.writing||e.corked||e.finished||e.bufferProcessing||!e.bufferedRequest||y(this,e))},g.prototype.setDefaultEncoding=function(e){if("string"==typeof e&&(e=e.toLowerCase()),!(["hex","utf8","utf-8","ascii","binary","base64","ucs2","ucs-2","utf16le","utf-16le","raw"].indexOf((e+"").toLowerCase())>-1))throw new TypeError("Unknown encoding: "+e);return this._writableState.defaultEncoding=e,this},Object.defineProperty(g.prototype,"writableHighWaterMark",{enumerable:!1,get:function(){return this._writableState.highWaterMark}}),g.prototype._write=function(e,t,r){r(new Error("_write() is not implemented"))},g.prototype._writev=null,g.prototype.end=function(e,t,r){var s=this._writableState;"function"==typeof e?(r=e,e=null,t=null):"function"==typeof t&&(r=t,t=null),null!==e&&e!==undefined&&this.write(e,t),s.corked&&(s.corked=1,this.uncork()),s.ending||s.finished||function(e,t,r){t.ending=!0,S(e,t),r&&(t.finished?n.nextTick(r):e.once("finish",r));t.ended=!0,e.writable=!1}(this,s,r)},Object.defineProperty(g.prototype,"destroyed",{get:function(){return this._writableState!==undefined&&this._writableState.destroyed},set:function(e){this._writableState&&(this._writableState.destroyed=e)}}),g.prototype.destroy=h.destroy,g.prototype._undestroy=h.undestroy,g.prototype._destroy=function(e,t){this.end(),t(e)}}).call(this)}).call(this,e("timers").setImmediate)}}},{package:"@metamask/object-multiplex>readable-stream",file:"../../node_modules/@metamask/object-multiplex/node_modules/readable-stream/lib/_stream_writable.js"}],[10,{"safe-buffer":14,util:"util"},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){var n=e("safe-buffer").Buffer,s=e("util");t.exports=function(){function e(){!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,e),this.head=null,this.tail=null,this.length=0}return e.prototype.push=function(e){var t={data:e,next:null};this.length>0?this.tail.next=t:this.head=t,this.tail=t,++this.length},e.prototype.unshift=function(e){var t={data:e,next:this.head};0===this.length&&(this.tail=t),this.head=t,++this.length},e.prototype.shift=function(){if(0!==this.length){var e=this.head.data;return 1===this.length?this.head=this.tail=null:this.head=this.head.next,--this.length,e}},e.prototype.clear=function(){this.head=this.tail=null,this.length=0},e.prototype.join=function(e){if(0===this.length)return"";for(var t=this.head,r=""+t.data;t=t.next;)r+=e+t.data;return r},e.prototype.concat=function(e){if(0===this.length)return n.alloc(0);if(1===this.length)return this.head.data;for(var t,r,s,i=n.allocUnsafe(e>>>0),o=this.head,a=0;o;)t=o.data,r=i,s=a,t.copy(r,s),a+=o.data.length,o=o.next;return i},e}(),s&&s.inspect&&s.inspect.custom&&(t.exports.prototype[s.inspect.custom]=function(){var e=s.inspect({length:this.length});return this.constructor.name+" "+e})}}},{package:"@metamask/object-multiplex>readable-stream",file:"../../node_modules/@metamask/object-multiplex/node_modules/readable-stream/lib/internal/streams/BufferList.js"}],[11,{"process-nextick-args":128},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){var n=e("process-nextick-args");function s(e,t){e.emit("error",t)}t.exports={destroy:function(e,t){var r=this,i=this._readableState&&this._readableState.destroyed,o=this._writableState&&this._writableState.destroyed;return i||o?(t?t(e):!e||this._writableState&&this._writableState.errorEmitted||n.nextTick(s,this,e),this):(this._readableState&&(this._readableState.destroyed=!0),this._writableState&&(this._writableState.destroyed=!0),this._destroy(e||null,(function(e){!t&&e?(n.nextTick(s,r,e),r._writableState&&(r._writableState.errorEmitted=!0)):t&&t(e)})),this)},undestroy:function(){this._readableState&&(this._readableState.destroyed=!1,this._readableState.reading=!1,this._readableState.ended=!1,this._readableState.endEmitted=!1),this._writableState&&(this._writableState.destroyed=!1,this._writableState.ended=!1,this._writableState.ending=!1,this._writableState.finished=!1,this._writableState.errorEmitted=!1)}}}}},{package:"@metamask/object-multiplex>readable-stream",file:"../../node_modules/@metamask/object-multiplex/node_modules/readable-stream/lib/internal/streams/destroy.js"}],[12,{stream:"stream"},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){t.exports=e("stream")}}},{package:"@metamask/object-multiplex>readable-stream",file:"../../node_modules/@metamask/object-multiplex/node_modules/readable-stream/lib/internal/streams/stream.js"}],[13,{"./lib/_stream_duplex.js":5,"./lib/_stream_passthrough.js":6,"./lib/_stream_readable.js":7,"./lib/_stream_transform.js":8,"./lib/_stream_writable.js":9,stream:"stream"},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){var n=e("stream");"disable"===process.env.READABLE_STREAM&&n?(t.exports=n,(r=t.exports=n.Readable).Readable=n.Readable,r.Writable=n.Writable,r.Duplex=n.Duplex,r.Transform=n.Transform,r.PassThrough=n.PassThrough,r.Stream=n):((r=t.exports=e("./lib/_stream_readable.js")).Stream=n||r,r.Readable=r,r.Writable=e("./lib/_stream_writable.js"),r.Duplex=e("./lib/_stream_duplex.js"),r.Transform=e("./lib/_stream_transform.js"),r.PassThrough=e("./lib/_stream_passthrough.js"))}}},{package:"@metamask/object-multiplex>readable-stream",file:"../../node_modules/@metamask/object-multiplex/node_modules/readable-stream/readable.js"}],[14,{buffer:"buffer"},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){var n=e("buffer"),s=n.Buffer;function i(e,t){for(var r in e)t[r]=e[r]}function o(e,t,r){return s(e,t,r)}s.from&&s.alloc&&s.allocUnsafe&&s.allocUnsafeSlow?t.exports=n:(i(n,r),r.Buffer=o),i(s,o),o.from=function(e,t,r){if("number"==typeof e)throw new TypeError("Argument must not be a number");return s(e,t,r)},o.alloc=function(e,t,r){if("number"!=typeof e)throw new TypeError("Argument must be a number");var n=s(e);return t!==undefined?"string"==typeof r?n.fill(t,r):n.fill(t):n.fill(0),n},o.allocUnsafe=function(e){if("number"!=typeof e)throw new TypeError("Argument must be a number");return s(e)},o.allocUnsafeSlow=function(e){if("number"!=typeof e)throw new TypeError("Argument must be a number");return n.SlowBuffer(e)}}}},{package:"@metamask/object-multiplex>readable-stream>safe-buffer",file:"../../node_modules/@metamask/object-multiplex/node_modules/safe-buffer/index.js"}],[15,{"safe-buffer":14},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){var n=e("safe-buffer").Buffer,s=n.isEncoding||function(e){switch((e=""+e)&&e.toLowerCase()){case"hex":case"utf8":case"utf-8":case"ascii":case"binary":case"base64":case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":case"raw":return!0;default:return!1}};function i(e){var t;switch(this.encoding=function(e){var t=function(e){if(!e)return"utf8";for(var t;;)switch(e){case"utf8":case"utf-8":return"utf8";case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return"utf16le";case"latin1":case"binary":return"latin1";case"base64":case"ascii":case"hex":return e;default:if(t)return;e=(""+e).toLowerCase(),t=!0}}(e);if("string"!=typeof t&&(n.isEncoding===s||!s(e)))throw new Error("Unknown encoding: "+e);return t||e}(e),this.encoding){case"utf16le":this.text=u,this.end=c,t=4;break;case"utf8":this.fillLast=a,t=4;break;case"base64":this.text=l,this.end=d,t=3;break;default:return this.write=f,void(this.end=h)}this.lastNeed=0,this.lastTotal=0,this.lastChar=n.allocUnsafe(t)}function o(e){return e<=127?0:e>>5==6?2:e>>4==14?3:e>>3==30?4:e>>6==2?-1:-2}function a(e){var t=this.lastTotal-this.lastNeed,r=function(e,t,r){if(128!=(192&t[0]))return e.lastNeed=0,"�";if(e.lastNeed>1&&t.length>1){if(128!=(192&t[1]))return e.lastNeed=1,"�";if(e.lastNeed>2&&t.length>2&&128!=(192&t[2]))return e.lastNeed=2,"�"}}(this,e);return r!==undefined?r:this.lastNeed<=e.length?(e.copy(this.lastChar,t,0,this.lastNeed),this.lastChar.toString(this.encoding,0,this.lastTotal)):(e.copy(this.lastChar,t,0,e.length),void(this.lastNeed-=e.length))}function u(e,t){if((e.length-t)%2==0){var r=e.toString("utf16le",t);if(r){var n=r.charCodeAt(r.length-1);if(n>=55296&&n<=56319)return this.lastNeed=2,this.lastTotal=4,this.lastChar[0]=e[e.length-2],this.lastChar[1]=e[e.length-1],r.slice(0,-1)}return r}return this.lastNeed=1,this.lastTotal=2,this.lastChar[0]=e[e.length-1],e.toString("utf16le",t,e.length-1)}function c(e){var t=e&&e.length?this.write(e):"";if(this.lastNeed){var r=this.lastTotal-this.lastNeed;return t+this.lastChar.toString("utf16le",0,r)}return t}function l(e,t){var r=(e.length-t)%3;return 0===r?e.toString("base64",t):(this.lastNeed=3-r,this.lastTotal=3,1===r?this.lastChar[0]=e[e.length-1]:(this.lastChar[0]=e[e.length-2],this.lastChar[1]=e[e.length-1]),e.toString("base64",t,e.length-r))}function d(e){var t=e&&e.length?this.write(e):"";return this.lastNeed?t+this.lastChar.toString("base64",0,3-this.lastNeed):t}function f(e){return e.toString(this.encoding)}function h(e){return e&&e.length?this.write(e):""}r.StringDecoder=i,i.prototype.write=function(e){if(0===e.length)return"";var t,r;if(this.lastNeed){if((t=this.fillLast(e))===undefined)return"";r=this.lastNeed,this.lastNeed=0}else r=0;return r<e.length?t?t+this.text(e,r):this.text(e,r):t||""},i.prototype.end=function(e){var t=e&&e.length?this.write(e):"";return this.lastNeed?t+"�":t},i.prototype.text=function(e,t){var r=function(e,t,r){var n=t.length-1;if(n<r)return 0;var s=o(t[n]);if(s>=0)return s>0&&(e.lastNeed=s-1),s;if(--n<r||-2===s)return 0;if(s=o(t[n]),s>=0)return s>0&&(e.lastNeed=s-2),s;if(--n<r||-2===s)return 0;if(s=o(t[n]),s>=0)return s>0&&(2===s?s=0:e.lastNeed=s-3),s;return 0}(this,e,t);if(!this.lastNeed)return e.toString("utf8",t);this.lastTotal=r;var n=e.length-(r-this.lastNeed);return e.copy(this.lastChar,0,n),e.toString("utf8",t,n)},i.prototype.fillLast=function(e){if(this.lastNeed<=e.length)return e.copy(this.lastChar,this.lastTotal-this.lastNeed,0,this.lastNeed),this.lastChar.toString(this.encoding,0,this.lastTotal);e.copy(this.lastChar,this.lastTotal-this.lastNeed,0,e.length),this.lastNeed-=e.length}}}},{package:"@metamask/object-multiplex>readable-stream>string_decoder",file:"../../node_modules/@metamask/object-multiplex/node_modules/string_decoder/lib/string_decoder.js"}],[16,{"readable-stream":144},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){Object.defineProperty(r,"__esModule",{value:!0}),r.BasePostMessageStream=void 0;const n=e("readable-stream"),s=()=>undefined,i="SYN",o="ACK";class a extends n.Duplex{constructor(){super({objectMode:!0}),this._init=!1,this._haveSyn=!1,this._log=()=>null}_handshake(){this._write(i,null,s),this.cork()}_onData(e){if(this._init)try{this.push(e),this._log(e,!1)}catch(e){this.emit("error",e)}else e===i?(this._haveSyn=!0,this._write(o,null,s)):e===o&&(this._init=!0,this._haveSyn||this._write(o,null,s),this.uncork())}_read(){return undefined}_write(e,t,r){e!==o&&e!==i&&this._log(e,!0),this._postMessage(e),r()}_setLogger(e){this._log=e}}r.BasePostMessageStream=a}}},{package:"@metamask/post-message-stream",file:"../../node_modules/@metamask/post-message-stream/dist/BasePostMessageStream.js"}],[17,{"../BasePostMessageStream":16,"../utils":25},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){Object.defineProperty(r,"__esModule",{value:!0}),r.WebWorkerParentPostMessageStream=void 0;const n=e("../BasePostMessageStream"),s=e("../utils");class i extends n.BasePostMessageStream{constructor({worker:e}){super(),this._target=s.DEDICATED_WORKER_NAME,this._worker=e,this._worker.onmessage=this._onMessage.bind(this),this._handshake()}_postMessage(e){this._worker.postMessage({target:this._target,data:e})}_onMessage(e){const t=e.data;(0,s.isValidStreamMessage)(t)&&this._onData(t.data)}_destroy(){this._worker.onmessage=null,this._worker=null}}r.WebWorkerParentPostMessageStream=i}}},{package:"@metamask/post-message-stream",file:"../../node_modules/@metamask/post-message-stream/dist/WebWorker/WebWorkerParentPostMessageStream.js"}],[18,{"../BasePostMessageStream":16,"../utils":25},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){Object.defineProperty(r,"__esModule",{value:!0}),r.WebWorkerPostMessageStream=void 0;const n=e("../BasePostMessageStream"),s=e("../utils");class i extends n.BasePostMessageStream{constructor(){if("undefined"==typeof self||"undefined"==typeof WorkerGlobalScope)throw new Error("WorkerGlobalScope not found. This class should only be instantiated in a WebWorker.");super(),this._name=s.DEDICATED_WORKER_NAME,self.addEventListener("message",this._onMessage.bind(this)),this._handshake()}_postMessage(e){self.postMessage({data:e})}_onMessage(e){const t=e.data;(0,s.isValidStreamMessage)(t)&&t.target===this._name&&this._onData(t.data)}_destroy(){return undefined}}r.WebWorkerPostMessageStream=i}}},{package:"@metamask/post-message-stream",file:"../../node_modules/@metamask/post-message-stream/dist/WebWorker/WebWorkerPostMessageStream.js"}],[19,{"./BasePostMessageStream":16,"./WebWorker/WebWorkerParentPostMessageStream":17,"./WebWorker/WebWorkerPostMessageStream":18,"./node-process/ProcessMessageStream":20,"./node-process/ProcessParentMessageStream":21,"./node-thread/ThreadMessageStream":22,"./node-thread/ThreadParentMessageStream":23,"./runtime/BrowserRuntimePostMessageStream":24,"./window/WindowPostMessageStream":26},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){var n=this&&this.__createBinding||(Object.create?function(e,t,r,n){n===undefined&&(n=r),Object.defineProperty(e,n,{enumerable:!0,get:function(){return t[r]}})}:function(e,t,r,n){n===undefined&&(n=r),e[n]=t[r]}),s=this&&this.__exportStar||function(e,t){for(var r in e)"default"===r||Object.prototype.hasOwnProperty.call(t,r)||n(t,e,r)};Object.defineProperty(r,"__esModule",{value:!0}),s(e("./window/WindowPostMessageStream"),r),s(e("./WebWorker/WebWorkerPostMessageStream"),r),s(e("./WebWorker/WebWorkerParentPostMessageStream"),r),s(e("./node-process/ProcessParentMessageStream"),r),s(e("./node-process/ProcessMessageStream"),r),s(e("./node-thread/ThreadParentMessageStream"),r),s(e("./node-thread/ThreadMessageStream"),r),s(e("./runtime/BrowserRuntimePostMessageStream"),r),s(e("./BasePostMessageStream"),r)}}},{package:"@metamask/post-message-stream",file:"../../node_modules/@metamask/post-message-stream/dist/index.js"}],[20,{"../BasePostMessageStream":16,"../utils":25},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){Object.defineProperty(r,"__esModule",{value:!0}),r.ProcessMessageStream=void 0;const n=e("../BasePostMessageStream"),s=e("../utils");class i extends n.BasePostMessageStream{constructor(){if(super(),"function"!=typeof globalThis.process.send)throw new Error("Parent IPC channel not found. This class should only be instantiated in a Node.js child process.");this._onMessage=this._onMessage.bind(this),globalThis.process.on("message",this._onMessage),this._handshake()}_postMessage(e){globalThis.process.send({data:e})}_onMessage(e){(0,s.isValidStreamMessage)(e)&&this._onData(e.data)}_destroy(){globalThis.process.removeListener("message",this._onMessage)}}r.ProcessMessageStream=i}}},{package:"@metamask/post-message-stream",file:"../../node_modules/@metamask/post-message-stream/dist/node-process/ProcessMessageStream.js"}],[21,{"../BasePostMessageStream":16,"../utils":25},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){Object.defineProperty(r,"__esModule",{value:!0}),r.ProcessParentMessageStream=void 0;const n=e("../BasePostMessageStream"),s=e("../utils");class i extends n.BasePostMessageStream{constructor({process:e}){super(),this._process=e,this._onMessage=this._onMessage.bind(this),this._process.on("message",this._onMessage),this._handshake()}_postMessage(e){this._process.send({data:e})}_onMessage(e){(0,s.isValidStreamMessage)(e)&&this._onData(e.data)}_destroy(){this._process.removeListener("message",this._onMessage)}}r.ProcessParentMessageStream=i}}},{package:"@metamask/post-message-stream",file:"../../node_modules/@metamask/post-message-stream/dist/node-process/ProcessParentMessageStream.js"}],[22,{"../BasePostMessageStream":16,"../utils":25,worker_threads:"worker_threads"},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){var n,s=this&&this.__classPrivateFieldSet||function(e,t,r,n,s){if("m"===n)throw new TypeError("Private method is not writable");if("a"===n&&!s)throw new TypeError("Private accessor was defined without a setter");if("function"==typeof t?e!==t||!s:!t.has(e))throw new TypeError("Cannot write private member to an object whose class did not declare it");return"a"===n?s.call(e,r):s?s.value=r:t.set(e,r),r},i=this&&this.__classPrivateFieldGet||function(e,t,r,n){if("a"===r&&!n)throw new TypeError("Private accessor was defined without a getter");if("function"==typeof t?e!==t||!n:!t.has(e))throw new TypeError("Cannot read private member from an object whose class did not declare it");return"m"===r?n:"a"===r?n.call(e):n?n.value:t.get(e)};Object.defineProperty(r,"__esModule",{value:!0}),r.ThreadMessageStream=void 0;const o=e("worker_threads"),a=e("../BasePostMessageStream"),u=e("../utils");class c extends a.BasePostMessageStream{constructor(){if(super(),n.set(this,void 0),!o.parentPort)throw new Error("Parent port not found. This class should only be instantiated in a Node.js worker thread.");s(this,n,o.parentPort,"f"),this._onMessage=this._onMessage.bind(this),i(this,n,"f").on("message",this._onMessage),this._handshake()}_postMessage(e){i(this,n,"f").postMessage({data:e})}_onMessage(e){(0,u.isValidStreamMessage)(e)&&this._onData(e.data)}_destroy(){i(this,n,"f").removeListener("message",this._onMessage)}}r.ThreadMessageStream=c,n=new WeakMap}}},{package:"@metamask/post-message-stream",file:"../../node_modules/@metamask/post-message-stream/dist/node-thread/ThreadMessageStream.js"}],[23,{"../BasePostMessageStream":16,"../utils":25},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){Object.defineProperty(r,"__esModule",{value:!0}),r.ThreadParentMessageStream=void 0;const n=e("../BasePostMessageStream"),s=e("../utils");class i extends n.BasePostMessageStream{constructor({thread:e}){super(),this._thread=e,this._onMessage=this._onMessage.bind(this),this._thread.on("message",this._onMessage),this._handshake()}_postMessage(e){this._thread.postMessage({data:e})}_onMessage(e){(0,s.isValidStreamMessage)(e)&&this._onData(e.data)}_destroy(){this._thread.removeListener("message",this._onMessage)}}r.ThreadParentMessageStream=i}}},{package:"@metamask/post-message-stream",file:"../../node_modules/@metamask/post-message-stream/dist/node-thread/ThreadParentMessageStream.js"}],[24,{"../BasePostMessageStream":16,"../utils":25},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){var n,s,i=this&&this.__classPrivateFieldSet||function(e,t,r,n,s){if("m"===n)throw new TypeError("Private method is not writable");if("a"===n&&!s)throw new TypeError("Private accessor was defined without a setter");if("function"==typeof t?e!==t||!s:!t.has(e))throw new TypeError("Cannot write private member to an object whose class did not declare it");return"a"===n?s.call(e,r):s?s.value=r:t.set(e,r),r},o=this&&this.__classPrivateFieldGet||function(e,t,r,n){if("a"===r&&!n)throw new TypeError("Private accessor was defined without a getter");if("function"==typeof t?e!==t||!n:!t.has(e))throw new TypeError("Cannot read private member from an object whose class did not declare it");return"m"===r?n:"a"===r?n.call(e):n?n.value:t.get(e)};Object.defineProperty(r,"__esModule",{value:!0}),r.BrowserRuntimePostMessageStream=void 0;const a=e("../BasePostMessageStream"),u=e("../utils");class c extends a.BasePostMessageStream{constructor({name:e,target:t}){super(),n.set(this,void 0),s.set(this,void 0),i(this,n,e,"f"),i(this,s,t,"f"),this._onMessage=this._onMessage.bind(this),this._getRuntime().onMessage.addListener(this._onMessage),this._handshake()}_postMessage(e){this._getRuntime().sendMessage({target:o(this,s,"f"),data:e})}_onMessage(e){(0,u.isValidStreamMessage)(e)&&e.target===o(this,n,"f")&&this._onData(e.data)}_getRuntime(){var e,t;if("chrome"in globalThis&&"function"==typeof(null===(e=null===chrome||void 0===chrome?void 0:chrome.runtime)||void 0===e?void 0:e.sendMessage))return chrome.runtime;if("browser"in globalThis&&"function"==typeof(null===(t=null===browser||void 0===browser?void 0:browser.runtime)||void 0===t?void 0:t.sendMessage))return browser.runtime;throw new Error("browser.runtime.sendMessage is not a function. This class should only be instantiated in a web extension.")}_destroy(){this._getRuntime().onMessage.removeListener(this._onMessage)}}r.BrowserRuntimePostMessageStream=c,n=new WeakMap,s=new WeakMap}}},{package:"@metamask/post-message-stream",file:"../../node_modules/@metamask/post-message-stream/dist/runtime/BrowserRuntimePostMessageStream.js"}],[25,{"@metamask/utils":35},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){Object.defineProperty(r,"__esModule",{value:!0}),r.isValidStreamMessage=r.DEDICATED_WORKER_NAME=void 0;const n=e("@metamask/utils");r.DEDICATED_WORKER_NAME="dedicatedWorker",r.isValidStreamMessage=function(e){return(0,n.isObject)(e)&&Boolean(e.data)&&("number"==typeof e.data||"object"==typeof e.data||"string"==typeof e.data)}}}},{package:"@metamask/post-message-stream",file:"../../node_modules/@metamask/post-message-stream/dist/utils.js"}],[26,{"../BasePostMessageStream":16,"../utils":25,"@metamask/utils":35},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){var n,s;Object.defineProperty(r,"__esModule",{value:!0}),r.WindowPostMessageStream=void 0;const i=e("@metamask/utils"),o=e("../BasePostMessageStream"),a=e("../utils"),u=null===(n=Object.getOwnPropertyDescriptor(MessageEvent.prototype,"source"))||void 0===n?void 0:n.get;(0,i.assert)(u,"MessageEvent.prototype.source getter is not defined.");const c=null===(s=Object.getOwnPropertyDescriptor(MessageEvent.prototype,"origin"))||void 0===s?void 0:s.get;(0,i.assert)(c,"MessageEvent.prototype.origin getter is not defined.");class l extends o.BasePostMessageStream{constructor({name:e,target:t,targetOrigin:r=location.origin,targetWindow:n=window}){if(super(),"undefined"==typeof window||"function"!=typeof window.postMessage)throw new Error("window.postMessage is not a function. This class should only be instantiated in a Window.");this._name=e,this._target=t,this._targetOrigin=r,this._targetWindow=n,this._onMessage=this._onMessage.bind(this),window.addEventListener("message",this._onMessage,!1),this._handshake()}_postMessage(e){this._targetWindow.postMessage({target:this._target,data:e},this._targetOrigin)}_onMessage(e){const t=e.data;"*"!==this._targetOrigin&&c.call(e)!==this._targetOrigin||u.call(e)!==this._targetWindow||!(0,a.isValidStreamMessage)(t)||t.target!==this._name||this._onData(t.data)}_destroy(){window.removeEventListener("message",this._onMessage,!1)}}r.WindowPostMessageStream=l}}},{package:"@metamask/post-message-stream",file:"../../node_modules/@metamask/post-message-stream/dist/window/WindowPostMessageStream.js"}],[27,{superstruct:192},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){Object.defineProperty(r,"__esModule",{value:!0}),r.assertExhaustive=r.assertStruct=r.assert=r.AssertionError=void 0;const n=e("superstruct");function s(e,t){return r=e,Boolean("string"==typeof(null===(s=null===(n=null==r?void 0:r.prototype)||void 0===n?void 0:n.constructor)||void 0===s?void 0:s.name))?new e({message:t}):e({message:t});var r,n,s}class i extends Error{constructor(e){super(e.message),this.code="ERR_ASSERTION"}}r.AssertionError=i,r.assert=function(e,t="Assertion failed.",r=i){if(!e){if(t instanceof Error)throw t;throw s(r,t)}},r.assertStruct=function(e,t,r="Assertion failed",o=i){try{(0,n.assert)(e,t)}catch(e){throw s(o,`${r}: ${function(e){const t=function(e){return"object"==typeof e&&null!==e&&"message"in e}(e)?e.message:String(e);return t.endsWith(".")?t.slice(0,-1):t}(e)}.`)}},r.assertExhaustive=function(e){throw new Error("Invalid branch reached. Should be detected during compilation.")}}}},{package:"@metamask/post-message-stream>@metamask/utils",file:"../../node_modules/@metamask/post-message-stream/node_modules/@metamask/utils/dist/assert.js"}],[28,{"./assert":27,superstruct:192},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){Object.defineProperty(r,"__esModule",{value:!0}),r.base64=void 0;const n=e("superstruct"),s=e("./assert");r.base64=(e,t={})=>{var r,i;const o=null!==(r=t.paddingRequired)&&void 0!==r&&r,a=null!==(i=t.characterSet)&&void 0!==i?i:"base64";let u,c;return"base64"===a?u=String.raw`[A-Za-z0-9+\/]`:((0,s.assert)("base64url"===a),u=String.raw`[-_A-Za-z0-9]`),c=o?new RegExp(`^(?:${u}{4})*(?:${u}{3}=|${u}{2}==)?$`,"u"):new RegExp(`^(?:${u}{4})*(?:${u}{2,3}|${u}{3}=|${u}{2}==)?$`,"u"),(0,n.pattern)(e,c)}}}},{package:"@metamask/post-message-stream>@metamask/utils",file:"../../node_modules/@metamask/post-message-stream/node_modules/@metamask/utils/dist/base64.js"}],[29,{"./assert":27,"./hex":34,buffer:"buffer"},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){(function(t){(function(){Object.defineProperty(r,"__esModule",{value:!0}),r.createDataView=r.concatBytes=r.valueToBytes=r.stringToBytes=r.numberToBytes=r.signedBigIntToBytes=r.bigIntToBytes=r.hexToBytes=r.bytesToString=r.bytesToNumber=r.bytesToSignedBigInt=r.bytesToBigInt=r.bytesToHex=r.assertIsBytes=r.isBytes=void 0;const n=e("./assert"),s=e("./hex"),i=48,o=58,a=87;const u=function(){const e=[];return()=>{if(0===e.length)for(let t=0;t<256;t++)e.push(t.toString(16).padStart(2,"0"));return e}}();function c(e){return e instanceof Uint8Array}function l(e){(0,n.assert)(c(e),"Value must be a Uint8Array.")}function d(e){if(l(e),0===e.length)return"0x";const t=u(),r=new Array(e.length);for(let n=0;n<e.length;n++)r[n]=t[e[n]];return(0,s.add0x)(r.join(""))}function f(e){l(e);const t=d(e);return BigInt(t)}function h(e){var t;if("0x"===(null===(t=null==e?void 0:e.toLowerCase)||void 0===t?void 0:t.call(e)))return new Uint8Array;(0,s.assertIsHexString)(e);const r=(0,s.remove0x)(e).toLowerCase(),n=r.length%2==0?r:`0${r}`,u=new Uint8Array(n.length/2);for(let e=0;e<u.length;e++){const t=n.charCodeAt(2*e),r=n.charCodeAt(2*e+1),s=t-(t<o?i:a),c=r-(r<o?i:a);u[e]=16*s+c}return u}function p(e){(0,n.assert)("bigint"==typeof e,"Value must be a bigint."),(0,n.assert)(e>=BigInt(0),"Value must be a non-negative bigint.");return h(e.toString(16))}function m(e){(0,n.assert)("number"==typeof e,"Value must be a number."),(0,n.assert)(e>=0,"Value must be a non-negative number."),(0,n.assert)(Number.isSafeInteger(e),"Value is not a safe integer. Use `bigIntToBytes` instead.");return h(e.toString(16))}function g(e){return(0,n.assert)("string"==typeof e,"Value must be a string."),(new TextEncoder).encode(e)}function b(e){if("bigint"==typeof e)return p(e);if("number"==typeof e)return m(e);if("string"==typeof e)return e.startsWith("0x")?h(e):g(e);if(c(e))return e;throw new TypeError(`Unsupported value type: "${typeof e}".`)}r.isBytes=c,r.assertIsBytes=l,r.bytesToHex=d,r.bytesToBigInt=f,r.bytesToSignedBigInt=function(e){l(e);let t=BigInt(0);for(const r of e)t=(t<<BigInt(8))+BigInt(r);return BigInt.asIntN(8*e.length,t)},r.bytesToNumber=function(e){l(e);const t=f(e);return(0,n.assert)(t<=BigInt(Number.MAX_SAFE_INTEGER),"Number is not a safe integer. Use `bytesToBigInt` instead."),Number(t)},r.bytesToString=function(e){return l(e),(new TextDecoder).decode(e)},r.hexToBytes=h,r.bigIntToBytes=p,r.signedBigIntToBytes=function(e,t){(0,n.assert)("bigint"==typeof e,"Value must be a bigint."),(0,n.assert)("number"==typeof t,"Byte length must be a number."),(0,n.assert)(t>0,"Byte length must be greater than 0."),(0,n.assert)(function(e,t){(0,n.assert)(t>0);const r=e>>BigInt(31);return!((~e&r)+(e&~r)>>BigInt(8*t-1))}(e,t),"Byte length is too small to represent the given value.");let r=e;const s=new Uint8Array(t);for(let e=0;e<s.length;e++)s[e]=Number(BigInt.asUintN(8,r)),r>>=BigInt(8);return s.reverse()},r.numberToBytes=m,r.stringToBytes=g,r.valueToBytes=b,r.concatBytes=function(e){const t=new Array(e.length);let r=0;for(let n=0;n<e.length;n++){const s=b(e[n]);t[n]=s,r+=s.length}const n=new Uint8Array(r);for(let e=0,r=0;e<t.length;e++)n.set(t[e],r),r+=t[e].length;return n},r.createDataView=function(e){if(void 0!==t&&e instanceof t){const t=e.buffer.slice(e.byteOffset,e.byteOffset+e.byteLength);return new DataView(t)}return new DataView(e.buffer,e.byteOffset,e.byteLength)}}).call(this)}).call(this,e("buffer").Buffer)}}},{package:"@metamask/post-message-stream>@metamask/utils",file:"../../node_modules/@metamask/post-message-stream/node_modules/@metamask/utils/dist/bytes.js"}],[30,{"./base64":28,superstruct:192},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){Object.defineProperty(r,"__esModule",{value:!0}),r.ChecksumStruct=void 0;const n=e("superstruct"),s=e("./base64");r.ChecksumStruct=(0,n.size)((0,s.base64)((0,n.string)(),{paddingRequired:!0}),44,44)}}},{package:"@metamask/post-message-stream>@metamask/utils",file:"../../node_modules/@metamask/post-message-stream/node_modules/@metamask/utils/dist/checksum.js"}],[31,{"./assert":27,"./bytes":29,"./hex":34,superstruct:192},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){Object.defineProperty(r,"__esModule",{value:!0}),r.createHex=r.createBytes=r.createBigInt=r.createNumber=void 0;const n=e("superstruct"),s=e("./assert"),i=e("./bytes"),o=e("./hex"),a=(0,n.union)([(0,n.number)(),(0,n.bigint)(),(0,n.string)(),o.StrictHexStruct]),u=(0,n.coerce)((0,n.number)(),a,Number),c=(0,n.coerce)((0,n.bigint)(),a,BigInt),l=((0,n.union)([o.StrictHexStruct,(0,n.instance)(Uint8Array)]),(0,n.coerce)((0,n.instance)(Uint8Array),(0,n.union)([o.StrictHexStruct]),i.hexToBytes)),d=(0,n.coerce)(o.StrictHexStruct,(0,n.instance)(Uint8Array),i.bytesToHex);r.createNumber=function(e){try{const t=(0,n.create)(e,u);return(0,s.assert)(Number.isFinite(t),`Expected a number-like value, got "${e}".`),t}catch(t){if(t instanceof n.StructError)throw new Error(`Expected a number-like value, got "${e}".`);throw t}},r.createBigInt=function(e){try{return(0,n.create)(e,c)}catch(e){if(e instanceof n.StructError)throw new Error(`Expected a number-like value, got "${String(e.value)}".`);throw e}},r.createBytes=function(e){if("string"==typeof e&&"0x"===e.toLowerCase())return new Uint8Array;try{return(0,n.create)(e,l)}catch(e){if(e instanceof n.StructError)throw new Error(`Expected a bytes-like value, got "${String(e.value)}".`);throw e}},r.createHex=function(e){if(e instanceof Uint8Array&&0===e.length||"string"==typeof e&&"0x"===e.toLowerCase())return"0x";try{return(0,n.create)(e,d)}catch(e){if(e instanceof n.StructError)throw new Error(`Expected a bytes-like value, got "${String(e.value)}".`);throw e}}}}},{package:"@metamask/post-message-stream>@metamask/utils",file:"../../node_modules/@metamask/post-message-stream/node_modules/@metamask/utils/dist/coercers.js"}],[32,{},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){var n,s,i=this&&this.__classPrivateFieldSet||function(e,t,r,n,s){if("m"===n)throw new TypeError("Private method is not writable");if("a"===n&&!s)throw new TypeError("Private accessor was defined without a setter");if("function"==typeof t?e!==t||!s:!t.has(e))throw new TypeError("Cannot write private member to an object whose class did not declare it");return"a"===n?s.call(e,r):s?s.value=r:t.set(e,r),r},o=this&&this.__classPrivateFieldGet||function(e,t,r,n){if("a"===r&&!n)throw new TypeError("Private accessor was defined without a getter");if("function"==typeof t?e!==t||!n:!t.has(e))throw new TypeError("Cannot read private member from an object whose class did not declare it");return"m"===r?n:"a"===r?n.call(e):n?n.value:t.get(e)};Object.defineProperty(r,"__esModule",{value:!0}),r.FrozenSet=r.FrozenMap=void 0;class a{constructor(e){n.set(this,void 0),i(this,n,new Map(e),"f"),Object.freeze(this)}get size(){return o(this,n,"f").size}[(n=new WeakMap,Symbol.iterator)](){return o(this,n,"f")[Symbol.iterator]()}entries(){return o(this,n,"f").entries()}forEach(e,t){return o(this,n,"f").forEach(((r,n,s)=>e.call(t,r,n,this)))}get(e){return o(this,n,"f").get(e)}has(e){return o(this,n,"f").has(e)}keys(){return o(this,n,"f").keys()}values(){return o(this,n,"f").values()}toString(){return`FrozenMap(${this.size}) {${this.size>0?` ${[...this.entries()].map((([e,t])=>`${String(e)} => ${String(t)}`)).join(", ")} `:""}}`}}r.FrozenMap=a;class u{constructor(e){s.set(this,void 0),i(this,s,new Set(e),"f"),Object.freeze(this)}get size(){return o(this,s,"f").size}[(s=new WeakMap,Symbol.iterator)](){return o(this,s,"f")[Symbol.iterator]()}entries(){return o(this,s,"f").entries()}forEach(e,t){return o(this,s,"f").forEach(((r,n,s)=>e.call(t,r,n,this)))}has(e){return o(this,s,"f").has(e)}keys(){return o(this,s,"f").keys()}values(){return o(this,s,"f").values()}toString(){return`FrozenSet(${this.size}) {${this.size>0?` ${[...this.values()].map((e=>String(e))).join(", ")} `:""}}`}}r.FrozenSet=u,Object.freeze(a),Object.freeze(a.prototype),Object.freeze(u),Object.freeze(u.prototype)}}},{package:"@metamask/post-message-stream>@metamask/utils",file:"../../node_modules/@metamask/post-message-stream/node_modules/@metamask/utils/dist/collections.js"}],[33,{},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){Object.defineProperty(r,"__esModule",{value:!0})}}},{package:"@metamask/post-message-stream>@metamask/utils",file:"../../node_modules/@metamask/post-message-stream/node_modules/@metamask/utils/dist/encryption-types.js"}],[34,{"./assert":27,superstruct:192},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){Object.defineProperty(r,"__esModule",{value:!0}),r.remove0x=r.add0x=r.assertIsStrictHexString=r.assertIsHexString=r.isStrictHexString=r.isHexString=r.StrictHexStruct=r.HexStruct=void 0;const n=e("superstruct"),s=e("./assert");function i(e){return(0,n.is)(e,r.HexStruct)}function o(e){return(0,n.is)(e,r.StrictHexStruct)}r.HexStruct=(0,n.pattern)((0,n.string)(),/^(?:0x)?[0-9a-f]+$/iu),r.StrictHexStruct=(0,n.pattern)((0,n.string)(),/^0x[0-9a-f]+$/iu),r.isHexString=i,r.isStrictHexString=o,r.assertIsHexString=function(e){(0,s.assert)(i(e),"Value must be a hexadecimal string.")},r.assertIsStrictHexString=function(e){(0,s.assert)(o(e),'Value must be a hexadecimal string, starting with "0x".')},r.add0x=function(e){return e.startsWith("0x")?e:e.startsWith("0X")?`0x${e.substring(2)}`:`0x${e}`},r.remove0x=function(e){return e.startsWith("0x")||e.startsWith("0X")?e.substring(2):e}}}},{package:"@metamask/post-message-stream>@metamask/utils",file:"../../node_modules/@metamask/post-message-stream/node_modules/@metamask/utils/dist/hex.js"}],[35,{"./assert":27,"./base64":28,"./bytes":29,"./checksum":30,"./coercers":31,"./collections":32,"./encryption-types":33,"./hex":34,"./json":36,"./keyring":37,"./logging":38,"./misc":39,"./number":40,"./opaque":41,"./time":42,"./transaction-types":43,"./versions":44},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){var n=this&&this.__createBinding||(Object.create?function(e,t,r,n){n===undefined&&(n=r);var s=Object.getOwnPropertyDescriptor(t,r);s&&!("get"in s?!t.__esModule:s.writable||s.configurable)||(s={enumerable:!0,get:function(){return t[r]}}),Object.defineProperty(e,n,s)}:function(e,t,r,n){n===undefined&&(n=r),e[n]=t[r]}),s=this&&this.__exportStar||function(e,t){for(var r in e)"default"===r||Object.prototype.hasOwnProperty.call(t,r)||n(t,e,r)};Object.defineProperty(r,"__esModule",{value:!0}),s(e("./assert"),r),s(e("./base64"),r),s(e("./bytes"),r),s(e("./checksum"),r),s(e("./coercers"),r),s(e("./collections"),r),s(e("./encryption-types"),r),s(e("./hex"),r),s(e("./json"),r),s(e("./keyring"),r),s(e("./logging"),r),s(e("./misc"),r),s(e("./number"),r),s(e("./opaque"),r),s(e("./time"),r),s(e("./transaction-types"),r),s(e("./versions"),r)}}},{package:"@metamask/post-message-stream>@metamask/utils",file:"../../node_modules/@metamask/post-message-stream/node_modules/@metamask/utils/dist/index.js"}],[36,{"./assert":27,superstruct:192},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){Object.defineProperty(r,"__esModule",{value:!0}),r.getJsonRpcIdValidator=r.assertIsJsonRpcError=r.isJsonRpcError=r.assertIsJsonRpcFailure=r.isJsonRpcFailure=r.assertIsJsonRpcSuccess=r.isJsonRpcSuccess=r.assertIsJsonRpcResponse=r.isJsonRpcResponse=r.assertIsPendingJsonRpcResponse=r.isPendingJsonRpcResponse=r.JsonRpcResponseStruct=r.JsonRpcFailureStruct=r.JsonRpcSuccessStruct=r.PendingJsonRpcResponseStruct=r.assertIsJsonRpcRequest=r.isJsonRpcRequest=r.assertIsJsonRpcNotification=r.isJsonRpcNotification=r.JsonRpcNotificationStruct=r.JsonRpcRequestStruct=r.JsonRpcParamsStruct=r.JsonRpcErrorStruct=r.JsonRpcIdStruct=r.JsonRpcVersionStruct=r.jsonrpc2=r.getJsonSize=r.isValidJson=r.JsonStruct=r.UnsafeJsonStruct=void 0;const n=e("superstruct"),s=e("./assert");r.UnsafeJsonStruct=(0,n.union)([(0,n.literal)(null),(0,n.boolean)(),(0,n.define)("finite number",(e=>(0,n.is)(e,(0,n.number)())&&Number.isFinite(e))),(0,n.string)(),(0,n.array)((0,n.lazy)((()=>r.UnsafeJsonStruct))),(0,n.record)((0,n.string)(),(0,n.lazy)((()=>r.UnsafeJsonStruct)))]),r.JsonStruct=(0,n.define)("Json",((e,t)=>{function n(e,r){const n=[...r.validator(e,t)];return!(n.length>0)||n}try{const t=n(e,r.UnsafeJsonStruct);return!0!==t?t:n(JSON.parse(JSON.stringify(e)),r.UnsafeJsonStruct)}catch(e){return e instanceof RangeError&&"Circular reference detected"}})),r.isValidJson=function(e){return(0,n.is)(e,r.JsonStruct)},r.getJsonSize=function(e){(0,s.assertStruct)(e,r.JsonStruct,"Invalid JSON value");const t=JSON.stringify(e);return(new TextEncoder).encode(t).byteLength},r.jsonrpc2="2.0",r.JsonRpcVersionStruct=(0,n.literal)(r.jsonrpc2),r.JsonRpcIdStruct=(0,n.nullable)((0,n.union)([(0,n.number)(),(0,n.string)()])),r.JsonRpcErrorStruct=(0,n.object)({code:(0,n.integer)(),message:(0,n.string)(),data:(0,n.optional)(r.JsonStruct),stack:(0,n.optional)((0,n.string)())}),r.JsonRpcParamsStruct=(0,n.optional)((0,n.union)([(0,n.record)((0,n.string)(),r.JsonStruct),(0,n.array)(r.JsonStruct)])),r.JsonRpcRequestStruct=(0,n.object)({id:r.JsonRpcIdStruct,jsonrpc:r.JsonRpcVersionStruct,method:(0,n.string)(),params:r.JsonRpcParamsStruct}),r.JsonRpcNotificationStruct=(0,n.omit)(r.JsonRpcRequestStruct,["id"]),r.isJsonRpcNotification=function(e){return(0,n.is)(e,r.JsonRpcNotificationStruct)},r.assertIsJsonRpcNotification=function(e,t){(0,s.assertStruct)(e,r.JsonRpcNotificationStruct,"Invalid JSON-RPC notification",t)},r.isJsonRpcRequest=function(e){return(0,n.is)(e,r.JsonRpcRequestStruct)},r.assertIsJsonRpcRequest=function(e,t){(0,s.assertStruct)(e,r.JsonRpcRequestStruct,"Invalid JSON-RPC request",t)},r.PendingJsonRpcResponseStruct=(0,n.object)({id:r.JsonRpcIdStruct,jsonrpc:r.JsonRpcVersionStruct,result:(0,n.optional)((0,n.unknown)()),error:(0,n.optional)(r.JsonRpcErrorStruct)}),r.JsonRpcSuccessStruct=(0,n.object)({id:r.JsonRpcIdStruct,jsonrpc:r.JsonRpcVersionStruct,result:r.JsonStruct}),r.JsonRpcFailureStruct=(0,n.object)({id:r.JsonRpcIdStruct,jsonrpc:r.JsonRpcVersionStruct,error:r.JsonRpcErrorStruct}),r.JsonRpcResponseStruct=(0,n.union)([r.JsonRpcSuccessStruct,r.JsonRpcFailureStruct]),r.isPendingJsonRpcResponse=function(e){return(0,n.is)(e,r.PendingJsonRpcResponseStruct)},r.assertIsPendingJsonRpcResponse=function(e,t){(0,s.assertStruct)(e,r.PendingJsonRpcResponseStruct,"Invalid pending JSON-RPC response",t)},r.isJsonRpcResponse=function(e){return(0,n.is)(e,r.JsonRpcResponseStruct)},r.assertIsJsonRpcResponse=function(e,t){(0,s.assertStruct)(e,r.JsonRpcResponseStruct,"Invalid JSON-RPC response",t)},r.isJsonRpcSuccess=function(e){return(0,n.is)(e,r.JsonRpcSuccessStruct)},r.assertIsJsonRpcSuccess=function(e,t){(0,s.assertStruct)(e,r.JsonRpcSuccessStruct,"Invalid JSON-RPC success response",t)},r.isJsonRpcFailure=function(e){return(0,n.is)(e,r.JsonRpcFailureStruct)},r.assertIsJsonRpcFailure=function(e,t){(0,s.assertStruct)(e,r.JsonRpcFailureStruct,"Invalid JSON-RPC failure response",t)},r.isJsonRpcError=function(e){return(0,n.is)(e,r.JsonRpcErrorStruct)},r.assertIsJsonRpcError=function(e,t){(0,s.assertStruct)(e,r.JsonRpcErrorStruct,"Invalid JSON-RPC error",t)},r.getJsonRpcIdValidator=function(e){const{permitEmptyString:t,permitFractions:r,permitNull:n}=Object.assign({permitEmptyString:!0,permitFractions:!1,permitNull:!0},e);return e=>Boolean("number"==typeof e&&(r||Number.isInteger(e))||"string"==typeof e&&(t||e.length>0)||n&&null===e)}}}},{package:"@metamask/post-message-stream>@metamask/utils",file:"../../node_modules/@metamask/post-message-stream/node_modules/@metamask/utils/dist/json.js"}],[37,{},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){Object.defineProperty(r,"__esModule",{value:!0})}}},{package:"@metamask/post-message-stream>@metamask/utils",file:"../../node_modules/@metamask/post-message-stream/node_modules/@metamask/utils/dist/keyring.js"}],[38,{debug:88},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){var n=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(r,"__esModule",{value:!0}),r.createModuleLogger=r.createProjectLogger=void 0;const s=(0,n(e("debug")).default)("metamask");r.createProjectLogger=function(e){return s.extend(e)},r.createModuleLogger=function(e,t){return e.extend(t)}}}},{package:"@metamask/post-message-stream>@metamask/utils",file:"../../node_modules/@metamask/post-message-stream/node_modules/@metamask/utils/dist/logging.js"}],[39,{},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){Object.defineProperty(r,"__esModule",{value:!0}),r.calculateNumberSize=r.calculateStringSize=r.isASCII=r.isPlainObject=r.ESCAPE_CHARACTERS_REGEXP=r.JsonSize=r.hasProperty=r.isObject=r.isNullOrUndefined=r.isNonEmptyArray=void 0,r.isNonEmptyArray=function(e){return Array.isArray(e)&&e.length>0},r.isNullOrUndefined=function(e){return null===e||e===undefined},r.isObject=function(e){return Boolean(e)&&"object"==typeof e&&!Array.isArray(e)};function n(e){return e.charCodeAt(0)<=127}r.hasProperty=(e,t)=>Object.hasOwnProperty.call(e,t),function(e){e[e.Null=4]="Null",e[e.Comma=1]="Comma",e[e.Wrapper=1]="Wrapper",e[e.True=4]="True",e[e.False=5]="False",e[e.Quote=1]="Quote",e[e.Colon=1]="Colon",e[e.Date=24]="Date"}(r.JsonSize||(r.JsonSize={})),r.ESCAPE_CHARACTERS_REGEXP=/"|\\|\n|\r|\t/gu,r.isPlainObject=function(e){if("object"!=typeof e||null===e)return!1;try{let t=e;for(;null!==Object.getPrototypeOf(t);)t=Object.getPrototypeOf(t);return Object.getPrototypeOf(e)===t}catch(e){return!1}},r.isASCII=n,r.calculateStringSize=function(e){var t;return e.split("").reduce(((e,t)=>n(t)?e+1:e+2),0)+(null!==(t=e.match(r.ESCAPE_CHARACTERS_REGEXP))&&void 0!==t?t:[]).length},r.calculateNumberSize=function(e){return e.toString().length}}}},{package:"@metamask/post-message-stream>@metamask/utils",file:"../../node_modules/@metamask/post-message-stream/node_modules/@metamask/utils/dist/misc.js"}],[40,{"./assert":27,"./hex":34},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){Object.defineProperty(r,"__esModule",{value:!0}),r.hexToBigInt=r.hexToNumber=r.bigIntToHex=r.numberToHex=void 0;const n=e("./assert"),s=e("./hex");r.numberToHex=e=>((0,n.assert)("number"==typeof e,"Value must be a number."),(0,n.assert)(e>=0,"Value must be a non-negative number."),(0,n.assert)(Number.isSafeInteger(e),"Value is not a safe integer. Use `bigIntToHex` instead."),(0,s.add0x)(e.toString(16)));r.bigIntToHex=e=>((0,n.assert)("bigint"==typeof e,"Value must be a bigint."),(0,n.assert)(e>=0,"Value must be a non-negative bigint."),(0,s.add0x)(e.toString(16)));r.hexToNumber=e=>{(0,s.assertIsHexString)(e);const t=parseInt(e,16);return(0,n.assert)(Number.isSafeInteger(t),"Value is not a safe integer. Use `hexToBigInt` instead."),t};r.hexToBigInt=e=>((0,s.assertIsHexString)(e),BigInt((0,s.add0x)(e)))}}},{package:"@metamask/post-message-stream>@metamask/utils",file:"../../node_modules/@metamask/post-message-stream/node_modules/@metamask/utils/dist/number.js"}],[41,{},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){Object.defineProperty(r,"__esModule",{value:!0})}}},{package:"@metamask/post-message-stream>@metamask/utils",file:"../../node_modules/@metamask/post-message-stream/node_modules/@metamask/utils/dist/opaque.js"}],[42,{},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){Object.defineProperty(r,"__esModule",{value:!0}),r.timeSince=r.inMilliseconds=r.Duration=void 0,function(e){e[e.Millisecond=1]="Millisecond",e[e.Second=1e3]="Second",e[e.Minute=6e4]="Minute",e[e.Hour=36e5]="Hour",e[e.Day=864e5]="Day",e[e.Week=6048e5]="Week",e[e.Year=31536e6]="Year"}(r.Duration||(r.Duration={}));const n=(e,t)=>{if(!(e=>Number.isInteger(e)&&e>=0)(e))throw new Error(`"${t}" must be a non-negative integer. Received: "${e}".`)};r.inMilliseconds=function(e,t){return n(e,"count"),e*t},r.timeSince=function(e){return n(e,"timestamp"),Date.now()-e}}}},{package:"@metamask/post-message-stream>@metamask/utils",file:"../../node_modules/@metamask/post-message-stream/node_modules/@metamask/utils/dist/time.js"}],[43,{},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){Object.defineProperty(r,"__esModule",{value:!0})}}},{package:"@metamask/post-message-stream>@metamask/utils",file:"../../node_modules/@metamask/post-message-stream/node_modules/@metamask/utils/dist/transaction-types.js"}],[44,{"./assert":27,semver:173,superstruct:192},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){Object.defineProperty(r,"__esModule",{value:!0}),r.satisfiesVersionRange=r.gtRange=r.gtVersion=r.assertIsSemVerRange=r.assertIsSemVerVersion=r.isValidSemVerRange=r.isValidSemVerVersion=r.VersionRangeStruct=r.VersionStruct=void 0;const n=e("semver"),s=e("superstruct"),i=e("./assert");r.VersionStruct=(0,s.refine)((0,s.string)(),"Version",(e=>null!==(0,n.valid)(e)||`Expected SemVer version, got "${e}"`)),r.VersionRangeStruct=(0,s.refine)((0,s.string)(),"Version range",(e=>null!==(0,n.validRange)(e)||`Expected SemVer range, got "${e}"`)),r.isValidSemVerVersion=function(e){return(0,s.is)(e,r.VersionStruct)},r.isValidSemVerRange=function(e){return(0,s.is)(e,r.VersionRangeStruct)},r.assertIsSemVerVersion=function(e){(0,i.assertStruct)(e,r.VersionStruct)},r.assertIsSemVerRange=function(e){(0,i.assertStruct)(e,r.VersionRangeStruct)},r.gtVersion=function(e,t){return(0,n.gt)(e,t)},r.gtRange=function(e,t){return(0,n.gtr)(e,t)},r.satisfiesVersionRange=function(e,t){return(0,n.satisfies)(e,t,{includePrerelease:!0})}}}},{package:"@metamask/post-message-stream>@metamask/utils",file:"../../node_modules/@metamask/post-message-stream/node_modules/@metamask/utils/dist/versions.js"}],[45,{"./messages":53,"./utils":57,"@metamask/safe-event-emitter":58,"eth-rpc-errors":95,"fast-deep-equal":98,"json-rpc-engine":110},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){var n=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(r,"__esModule",{value:!0}),r.BaseProvider=void 0;const s=n(e("@metamask/safe-event-emitter")),i=e("eth-rpc-errors"),o=n(e("fast-deep-equal")),a=e("json-rpc-engine"),u=n(e("./messages")),c=e("./utils");class l extends s.default{constructor({logger:e=console,maxEventListeners:t=100,rpcMiddleware:r=[]}={}){super(),this._log=e,this.setMaxListeners(t),this._state={...l._defaultState},this.selectedAddress=null,this.chainId=null,this._handleAccountsChanged=this._handleAccountsChanged.bind(this),this._handleConnect=this._handleConnect.bind(this),this._handleChainChanged=this._handleChainChanged.bind(this),this._handleDisconnect=this._handleDisconnect.bind(this),this._handleUnlockStateChanged=this._handleUnlockStateChanged.bind(this),this._rpcRequest=this._rpcRequest.bind(this),this.request=this.request.bind(this);const n=new a.JsonRpcEngine;r.forEach((e=>n.push(e))),this._rpcEngine=n}isConnected(){return this._state.isConnected}async request(e){if(!e||"object"!=typeof e||Array.isArray(e))throw i.ethErrors.rpc.invalidRequest({message:u.default.errors.invalidRequestArgs(),data:e});const{method:t,params:r}=e;if("string"!=typeof t||0===t.length)throw i.ethErrors.rpc.invalidRequest({message:u.default.errors.invalidRequestMethod(),data:e});if(r!==undefined&&!Array.isArray(r)&&("object"!=typeof r||null===r))throw i.ethErrors.rpc.invalidRequest({message:u.default.errors.invalidRequestParams(),data:e});return new Promise(((e,n)=>{this._rpcRequest({method:t,params:r},(0,c.getRpcPromiseCallback)(e,n))}))}_initializeState(e){if(this._state.initialized)throw new Error("Provider already initialized.");if(e){const{accounts:t,chainId:r,isUnlocked:n,networkVersion:s}=e;this._handleConnect(r),this._handleChainChanged({chainId:r,networkVersion:s}),this._handleUnlockStateChanged({accounts:t,isUnlocked:n}),this._handleAccountsChanged(t)}this._state.initialized=!0,this.emit("_initialized")}_rpcRequest(e,t){let r=t;return Array.isArray(e)||(e.jsonrpc||(e.jsonrpc="2.0"),"eth_accounts"!==e.method&&"eth_requestAccounts"!==e.method||(r=(r,n)=>{this._handleAccountsChanged(n.result??[],"eth_accounts"===e.method),t(r,n)})),this._rpcEngine.handle(e,r)}_handleConnect(e){this._state.isConnected||(this._state.isConnected=!0,this.emit("connect",{chainId:e}),this._log.debug(u.default.info.connected(e)))}_handleDisconnect(e,t){if(this._state.isConnected||!this._state.isPermanentlyDisconnected&&!e){let r;this._state.isConnected=!1,e?(r=new i.EthereumRpcError(1013,t??u.default.errors.disconnected()),this._log.debug(r)):(r=new i.EthereumRpcError(1011,t??u.default.errors.permanentlyDisconnected()),this._log.error(r),this.chainId=null,this._state.accounts=null,this.selectedAddress=null,this._state.isUnlocked=!1,this._state.isPermanentlyDisconnected=!0),this.emit("disconnect",r)}}_handleChainChanged({chainId:e}={}){(0,c.isValidChainId)(e)?(this._handleConnect(e),e!==this.chainId&&(this.chainId=e,this._state.initialized&&this.emit("chainChanged",this.chainId))):this._log.error(u.default.errors.invalidNetworkParams(),{chainId:e})}_handleAccountsChanged(e,t=!1){let r=e;Array.isArray(e)||(this._log.error("MetaMask: Received invalid accounts parameter. Please report this bug.",e),r=[]);for(const t of e)if("string"!=typeof t){this._log.error("MetaMask: Received non-string account. Please report this bug.",e),r=[];break}if(!(0,o.default)(this._state.accounts,r)&&(t&&null!==this._state.accounts&&this._log.error("MetaMask: 'eth_accounts' unexpectedly updated accounts. Please report this bug.",r),this._state.accounts=r,this.selectedAddress!==r[0]&&(this.selectedAddress=r[0]||null),this._state.initialized)){const e=[...r];this.emit("accountsChanged",e)}}_handleUnlockStateChanged({accounts:e,isUnlocked:t}={}){"boolean"==typeof t?t!==this._state.isUnlocked&&(this._state.isUnlocked=t,this._handleAccountsChanged(e??[])):this._log.error("MetaMask: Received invalid isUnlocked parameter. Please report this bug.")}}r.BaseProvider=l,l._defaultState={accounts:null,isConnected:!1,isUnlocked:!1,initialized:!1,isPermanentlyDisconnected:!1}}}},{package:"@metamask/providers",file:"../../node_modules/@metamask/providers/dist/BaseProvider.js"}],[46,{"./StreamProvider":47,"./messages":53,"./siteMetadata":56,"./utils":57,"eth-rpc-errors":95},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){var n=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(r,"__esModule",{value:!0}),r.MetaMaskInpageProvider=r.MetaMaskInpageProviderStreamName=void 0;const s=e("eth-rpc-errors"),i=n(e("./messages")),o=e("./siteMetadata"),a=e("./StreamProvider"),u=e("./utils");r.MetaMaskInpageProviderStreamName="metamask-provider";class c extends a.AbstractStreamProvider{constructor(e,{jsonRpcStreamName:t=r.MetaMaskInpageProviderStreamName,logger:n=console,maxEventListeners:s=100,shouldSendMetadata:i}={}){if(super(e,{jsonRpcStreamName:t,logger:n,maxEventListeners:s,rpcMiddleware:(0,u.getDefaultExternalMiddleware)(n)}),this._sentWarnings={enable:!1,experimentalMethods:!1,send:!1,events:{close:!1,data:!1,networkChanged:!1,notification:!1}},this._initializeStateAsync(),this.networkVersion=null,this.isMetaMask=!0,this._sendSync=this._sendSync.bind(this),this.enable=this.enable.bind(this),this.send=this.send.bind(this),this.sendAsync=this.sendAsync.bind(this),this._warnOfDeprecation=this._warnOfDeprecation.bind(this),this._metamask=this._getExperimentalApi(),this._jsonRpcConnection.events.on("notification",(e=>{const{method:t}=e;u.EMITTED_NOTIFICATIONS.includes(t)&&(this.emit("data",e),this.emit("notification",e.params.result))})),i)if("complete"===document.readyState)(0,o.sendSiteMetadata)(this._rpcEngine,this._log);else{const e=()=>{(0,o.sendSiteMetadata)(this._rpcEngine,this._log),window.removeEventListener("DOMContentLoaded",e)};window.addEventListener("DOMContentLoaded",e)}}sendAsync(e,t){this._rpcRequest(e,t)}addListener(e,t){return this._warnOfDeprecation(e),super.addListener(e,t)}on(e,t){return this._warnOfDeprecation(e),super.on(e,t)}once(e,t){return this._warnOfDeprecation(e),super.once(e,t)}prependListener(e,t){return this._warnOfDeprecation(e),super.prependListener(e,t)}prependOnceListener(e,t){return this._warnOfDeprecation(e),super.prependOnceListener(e,t)}_handleDisconnect(e,t){super._handleDisconnect(e,t),this.networkVersion&&!e&&(this.networkVersion=null)}_warnOfDeprecation(e){!1===this._sentWarnings?.events[e]&&(this._log.warn(i.default.warnings.events[e]),this._sentWarnings.events[e]=!0)}async enable(){return this._sentWarnings.enable||(this._log.warn(i.default.warnings.enableDeprecation),this._sentWarnings.enable=!0),new Promise(((e,t)=>{try{this._rpcRequest({method:"eth_requestAccounts",params:[]},(0,u.getRpcPromiseCallback)(e,t))}catch(e){t(e)}}))}send(e,t){return this._sentWarnings.send||(this._log.warn(i.default.warnings.sendDeprecation),this._sentWarnings.send=!0),"string"!=typeof e||t&&!Array.isArray(t)?e&&"object"==typeof e&&"function"==typeof t?this._rpcRequest(e,t):this._sendSync(e):new Promise(((r,n)=>{try{this._rpcRequest({method:e,params:t},(0,u.getRpcPromiseCallback)(r,n,!1))}catch(e){n(e)}}))}_sendSync(e){let t;switch(e.method){case"eth_accounts":t=this.selectedAddress?[this.selectedAddress]:[];break;case"eth_coinbase":t=this.selectedAddress??null;break;case"eth_uninstallFilter":this._rpcRequest(e,u.NOOP),t=!0;break;case"net_version":t=this.networkVersion??null;break;default:throw new Error(i.default.errors.unsupportedSync(e.method))}return{id:e.id,jsonrpc:e.jsonrpc,result:t}}_getExperimentalApi(){return new Proxy({isUnlocked:async()=>(this._state.initialized||await new Promise((e=>{this.on("_initialized",(()=>e()))})),this._state.isUnlocked),requestBatch:async e=>{if(!Array.isArray(e))throw s.ethErrors.rpc.invalidRequest({message:"Batch requests must be made with an array of request objects.",data:e});return new Promise(((t,r)=>{this._rpcRequest(e,(0,u.getRpcPromiseCallback)(t,r))}))}},{get:(e,t,...r)=>(this._sentWarnings.experimentalMethods||(this._log.warn(i.default.warnings.experimentalMethods),this._sentWarnings.experimentalMethods=!0),Reflect.get(e,t,...r))})}_handleChainChanged({chainId:e,networkVersion:t}={}){super._handleChainChanged({chainId:e,networkVersion:t}),this._state.isConnected&&t!==this.networkVersion&&(this.networkVersion=t,this._state.initialized&&this.emit("networkChanged",this.networkVersion))}}r.MetaMaskInpageProvider=c}}},{package:"@metamask/providers",file:"../../node_modules/@metamask/providers/dist/MetaMaskInpageProvider.js"}],[47,{"./BaseProvider":45,"./messages":53,"./utils":57,"@metamask/object-multiplex":3,"is-stream":104,"json-rpc-middleware-stream":114,pump:129},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){var n=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(r,"__esModule",{value:!0}),r.StreamProvider=r.AbstractStreamProvider=void 0;const s=n(e("@metamask/object-multiplex")),i=e("is-stream"),o=e("json-rpc-middleware-stream"),a=n(e("pump")),u=e("./BaseProvider"),c=n(e("./messages")),l=e("./utils");class d extends u.BaseProvider{constructor(e,{jsonRpcStreamName:t,logger:r=console,maxEventListeners:n=100,rpcMiddleware:u=[]}){if(super({logger:r,maxEventListeners:n,rpcMiddleware:u}),!(0,i.duplex)(e))throw new Error(c.default.errors.invalidDuplexStream());this._handleStreamDisconnect=this._handleStreamDisconnect.bind(this);const d=new s.default;(0,a.default)(e,d,e,this._handleStreamDisconnect.bind(this,"MetaMask")),this._jsonRpcConnection=(0,o.createStreamMiddleware)({retryOnMessage:"METAMASK_EXTENSION_CONNECT_CAN_RETRY"}),(0,a.default)(this._jsonRpcConnection.stream,d.createStream(t),this._jsonRpcConnection.stream,this._handleStreamDisconnect.bind(this,"MetaMask RpcProvider")),this._rpcEngine.push(this._jsonRpcConnection.middleware),this._jsonRpcConnection.events.on("notification",(t=>{const{method:r,params:n}=t;"metamask_accountsChanged"===r?this._handleAccountsChanged(n):"metamask_unlockStateChanged"===r?this._handleUnlockStateChanged(n):"metamask_chainChanged"===r?this._handleChainChanged(n):l.EMITTED_NOTIFICATIONS.includes(r)?this.emit("message",{type:r,data:n}):"METAMASK_STREAM_FAILURE"===r&&e.destroy(new Error(c.default.errors.permanentlyDisconnected()))}))}async _initializeStateAsync(){let e;try{e=await this.request({method:"metamask_getProviderState"})}catch(e){this._log.error("MetaMask: Failed to get initial state. Please report this bug.",e)}this._initializeState(e)}_handleStreamDisconnect(e,t){let r=`MetaMask: Lost connection to "${e}".`;t?.stack&&(r+=`\n${t.stack}`),this._log.warn(r),this.listenerCount("error")>0&&this.emit("error",r),this._handleDisconnect(!1,t?t.message:undefined)}_handleChainChanged({chainId:e,networkVersion:t}={}){(0,l.isValidChainId)(e)&&(0,l.isValidNetworkVersion)(t)?"loading"===t?this._handleDisconnect(!0):super._handleChainChanged({chainId:e}):this._log.error(c.default.errors.invalidNetworkParams(),{chainId:e,networkVersion:t})}}r.AbstractStreamProvider=d;r.StreamProvider=class extends d{async initialize(){return this._initializeStateAsync()}}}}},{package:"@metamask/providers",file:"../../node_modules/@metamask/providers/dist/StreamProvider.js"}],[48,{},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){Object.defineProperty(r,"__esModule",{value:!0}),r.ERC20=r.ERC1155=r.ERC721=void 0,r.ERC721="ERC721",r.ERC1155="ERC1155",r.ERC20="ERC20"}}},{package:"@metamask/providers",file:"../../node_modules/@metamask/providers/dist/constants.js"}],[49,{"../MetaMaskInpageProvider":46,"../StreamProvider":47,"../utils":57,"./external-extension-config.json":50,"detect-browser":90,"extension-port-stream":97},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){var n=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(r,"__esModule",{value:!0}),r.createExternalExtensionProvider=void 0;const s=e("detect-browser"),i=n(e("extension-port-stream")),o=n(e("./external-extension-config.json")),a=e("../MetaMaskInpageProvider"),u=e("../StreamProvider"),c=e("../utils"),l=(0,s.detect)();r.createExternalExtensionProvider=function(e="stable"){let t;try{const r=function(e){return("firefox"===l?.name?o.default.firefoxIds:o.default.chromeIds)[e]??e}(e),n=chrome.runtime.connect(r),s=new i.default(n);t=new u.StreamProvider(s,{jsonRpcStreamName:a.MetaMaskInpageProviderStreamName,logger:console,rpcMiddleware:(0,c.getDefaultExternalMiddleware)(console)}),t.initialize()}catch(e){throw console.dir("MetaMask connect error.",e),e}return t}}}},{package:"@metamask/providers",file:"../../node_modules/@metamask/providers/dist/extension-provider/createExternalExtensionProvider.js"}],[50,{},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){t.exports={chromeIds:{stable:"nkbihfbeogaeaoehlefnkodbefgpgknn",beta:"pbbkamfgmaedccnfkmjcofcecjhfgldn",flask:"ljfoeinjpaedjfecbmggjgodbgkmjkjk"},firefoxIds:{stable:"webextension@metamask.io",beta:"webextension-beta@metamask.io",flask:"webextension-flask@metamask.io"}}}}},{package:"@metamask/providers",file:"../../node_modules/@metamask/providers/dist/extension-provider/external-extension-config.json"}],[51,{"./BaseProvider":45,"./MetaMaskInpageProvider":46,"./StreamProvider":47,"./extension-provider/createExternalExtensionProvider":49,"./initializeInpageProvider":52,"./shimWeb3":55},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){Object.defineProperty(r,"__esModule",{value:!0}),r.StreamProvider=r.shimWeb3=r.setGlobalProvider=r.MetaMaskInpageProvider=r.MetaMaskInpageProviderStreamName=r.initializeProvider=r.createExternalExtensionProvider=r.BaseProvider=void 0;const n=e("./BaseProvider");Object.defineProperty(r,"BaseProvider",{enumerable:!0,get:function(){return n.BaseProvider}});const s=e("./extension-provider/createExternalExtensionProvider");Object.defineProperty(r,"createExternalExtensionProvider",{enumerable:!0,get:function(){return s.createExternalExtensionProvider}});const i=e("./initializeInpageProvider");Object.defineProperty(r,"initializeProvider",{enumerable:!0,get:function(){return i.initializeProvider}}),Object.defineProperty(r,"setGlobalProvider",{enumerable:!0,get:function(){return i.setGlobalProvider}});const o=e("./MetaMaskInpageProvider");Object.defineProperty(r,"MetaMaskInpageProvider",{enumerable:!0,get:function(){return o.MetaMaskInpageProvider}}),Object.defineProperty(r,"MetaMaskInpageProviderStreamName",{enumerable:!0,get:function(){return o.MetaMaskInpageProviderStreamName}});const a=e("./shimWeb3");Object.defineProperty(r,"shimWeb3",{enumerable:!0,get:function(){return a.shimWeb3}});const u=e("./StreamProvider");Object.defineProperty(r,"StreamProvider",{enumerable:!0,get:function(){return u.StreamProvider}})}}},{package:"@metamask/providers",file:"../../node_modules/@metamask/providers/dist/index.js"}],[52,{"./MetaMaskInpageProvider":46,"./shimWeb3":55},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){Object.defineProperty(r,"__esModule",{value:!0}),r.setGlobalProvider=r.initializeProvider=void 0;const n=e("./MetaMaskInpageProvider"),s=e("./shimWeb3");function i(e){window.ethereum=e,window.dispatchEvent(new Event("ethereum#initialized"))}r.initializeProvider=function({connectionStream:e,jsonRpcStreamName:t,logger:r=console,maxEventListeners:o=100,shouldSendMetadata:a=!0,shouldSetOnWindow:u=!0,shouldShimWeb3:c=!1}){const l=new n.MetaMaskInpageProvider(e,{jsonRpcStreamName:t,logger:r,maxEventListeners:o,shouldSendMetadata:a}),d=new Proxy(l,{deleteProperty:()=>!0});return u&&i(d),c&&(0,s.shimWeb3)(d,r),d},r.setGlobalProvider=i}}},{package:"@metamask/providers",file:"../../node_modules/@metamask/providers/dist/initializeInpageProvider.js"}],[53,{},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){Object.defineProperty(r,"__esModule",{value:!0});const n={errors:{disconnected:()=>"MetaMask: Disconnected from chain. Attempting to connect.",permanentlyDisconnected:()=>"MetaMask: Disconnected from MetaMask background. Page reload required.",sendSiteMetadata:()=>"MetaMask: Failed to send site metadata. This is an internal error, please report this bug.",unsupportedSync:e=>`MetaMask: The MetaMask Ethereum provider does not support synchronous methods like ${e} without a callback parameter.`,invalidDuplexStream:()=>"Must provide a Node.js-style duplex stream.",invalidNetworkParams:()=>"MetaMask: Received invalid network parameters. Please report this bug.",invalidRequestArgs:()=>"Expected a single, non-array, object argument.",invalidRequestMethod:()=>"'args.method' must be a non-empty string.",invalidRequestParams:()=>"'args.params' must be an object or array if provided.",invalidLoggerObject:()=>"'args.logger' must be an object if provided.",invalidLoggerMethod:e=>`'args.logger' must include required method '${e}'.`},info:{connected:e=>`MetaMask: Connected to chain with ID "${e}".`},warnings:{enableDeprecation:"MetaMask: 'ethereum.enable()' is deprecated and may be removed in the future. Please use the 'eth_requestAccounts' RPC method instead.\nFor more information, see: https://eips.ethereum.org/EIPS/eip-1102",sendDeprecation:"MetaMask: 'ethereum.send(...)' is deprecated and may be removed in the future. Please use 'ethereum.sendAsync(...)' or 'ethereum.request(...)' instead.\nFor more information, see: https://eips.ethereum.org/EIPS/eip-1193",events:{close:"MetaMask: The event 'close' is deprecated and may be removed in the future. Please use 'disconnect' instead.\nFor more information, see: https://eips.ethereum.org/EIPS/eip-1193#disconnect",data:"MetaMask: The event 'data' is deprecated and will be removed in the future. Use 'message' instead.\nFor more information, see: https://eips.ethereum.org/EIPS/eip-1193#message",networkChanged:"MetaMask: The event 'networkChanged' is deprecated and may be removed in the future. Use 'chainChanged' instead.\nFor more information, see: https://eips.ethereum.org/EIPS/eip-1193#chainchanged",notification:"MetaMask: The event 'notification' is deprecated and may be removed in the future. Use 'message' instead.\nFor more information, see: https://eips.ethereum.org/EIPS/eip-1193#message"},rpc:{ethDecryptDeprecation:"MetaMask: The RPC method 'eth_decrypt' is deprecated and may be removed in the future.\nFor more information, see: https://medium.com/metamask/metamask-api-method-deprecation-2b0564a84686",ethGetEncryptionPublicKeyDeprecation:"MetaMask: The RPC method 'eth_getEncryptionPublicKey' is deprecated and may be removed in the future.\nFor more information, see: https://medium.com/metamask/metamask-api-method-deprecation-2b0564a84686",walletWatchAssetNFTExperimental:"MetaMask: The RPC method 'wallet_watchAsset' is experimental for ERC721/ERC1155 assets and may change in the future.\nFor more information, see: https://github.com/MetaMask/metamask-improvement-proposals/blob/main/MIPs/mip-1.md and https://github.com/MetaMask/metamask-improvement-proposals/blob/main/PROCESS-GUIDE.md#proposal-lifecycle"},experimentalMethods:"MetaMask: 'ethereum._metamask' exposes non-standard, experimental methods. They may be removed or changed without warning."}};r.default=n}}},{package:"@metamask/providers",file:"../../node_modules/@metamask/providers/dist/messages.js"}],[54,{"../constants":48,"../messages":53},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){var n=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(r,"__esModule",{value:!0}),r.createRpcWarningMiddleware=void 0;const s=e("../constants"),i=n(e("../messages"));r.createRpcWarningMiddleware=function(e){const t={ethDecryptDeprecation:!1,ethGetEncryptionPublicKeyDeprecation:!1,walletWatchAssetNFTExperimental:!1};return(r,n,o)=>{t.ethDecryptDeprecation||"eth_decrypt"!==r.method?t.ethGetEncryptionPublicKeyDeprecation||"eth_getEncryptionPublicKey"!==r.method?!t.walletWatchAssetNFTExperimental&&"wallet_watchAsset"===r.method&&[s.ERC721,s.ERC1155].includes(r.params?.type||"")&&(e.warn(i.default.warnings.rpc.walletWatchAssetNFTExperimental),t.walletWatchAssetNFTExperimental=!0):(e.warn(i.default.warnings.rpc.ethGetEncryptionPublicKeyDeprecation),t.ethGetEncryptionPublicKeyDeprecation=!0):(e.warn(i.default.warnings.rpc.ethDecryptDeprecation),t.ethDecryptDeprecation=!0),o()}}}}},{package:"@metamask/providers",file:"../../node_modules/@metamask/providers/dist/middleware/createRpcWarningMiddleware.js"}],[55,{},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){Object.defineProperty(r,"__esModule",{value:!0}),r.shimWeb3=void 0,r.shimWeb3=function(e,t=console){let r=!1,n=!1;if(!window.web3){const s="__isMetaMaskShim__";let i={currentProvider:e};Object.defineProperty(i,s,{value:!0,enumerable:!0,configurable:!1,writable:!1}),i=new Proxy(i,{get:(i,o,...a)=>("currentProvider"!==o||r?"currentProvider"===o||o===s||n||(n=!0,t.error("MetaMask no longer injects web3. For details, see: https://docs.metamask.io/guide/provider-migration.html#replacing-window-web3"),e.request({method:"metamask_logWeb3ShimUsage"}).catch((e=>{t.debug("MetaMask: Failed to log web3 shim usage.",e)}))):(r=!0,t.warn("You are accessing the MetaMask window.web3.currentProvider shim. This property is deprecated; use window.ethereum instead. For details, see: https://docs.metamask.io/guide/provider-migration.html#replacing-window-web3")),Reflect.get(i,o,...a)),set:(...e)=>(t.warn("You are accessing the MetaMask window.web3 shim. This object is deprecated; use window.ethereum instead. For details, see: https://docs.metamask.io/guide/provider-migration.html#replacing-window-web3"),Reflect.set(...e))}),Object.defineProperty(window,"web3",{value:i,enumerable:!1,configurable:!0,writable:!0})}}}}},{package:"@metamask/providers",file:"../../node_modules/@metamask/providers/dist/shimWeb3.js"}],[56,{"./messages":53,"./utils":57},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){var n=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(r,"__esModule",{value:!0}),r.sendSiteMetadata=void 0;const s=n(e("./messages")),i=e("./utils");function o(e){const{document:t}=e,r=t.querySelector('head > meta[property="og:site_name"]');if(r)return r.content;const n=t.querySelector('head > meta[name="title"]');return n?n.content:t.title&&t.title.length>0?t.title:window.location.hostname}async function a(e){const{document:t}=e,r=t.querySelectorAll('head > link[rel~="icon"]');for(const e of Array.from(r))if(e&&await u(e.href))return e.href;return null}async function u(e){return new Promise(((t,r)=>{try{const r=document.createElement("img");r.onload=()=>t(!0),r.onerror=()=>t(!1),r.src=e}catch(e){r(e)}}))}r.sendSiteMetadata=async function(e,t){try{const t=await async function(){return{name:o(window),icon:await a(window)}}();e.handle({jsonrpc:"2.0",id:1,method:"metamask_sendDomainMetadata",params:t},i.NOOP)}catch(e){t.error({message:s.default.errors.sendSiteMetadata(),originalError:e})}}}}},{package:"@metamask/providers",file:"../../node_modules/@metamask/providers/dist/siteMetadata.js"}],[57,{"./middleware/createRpcWarningMiddleware":54,"eth-rpc-errors":95,"json-rpc-engine":110},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){Object.defineProperty(r,"__esModule",{value:!0}),r.NOOP=r.isValidNetworkVersion=r.isValidChainId=r.getRpcPromiseCallback=r.getDefaultExternalMiddleware=r.EMITTED_NOTIFICATIONS=void 0;const n=e("eth-rpc-errors"),s=e("json-rpc-engine"),i=e("./middleware/createRpcWarningMiddleware");r.EMITTED_NOTIFICATIONS=Object.freeze(["eth_subscription"]);r.getDefaultExternalMiddleware=(e=console)=>{return[(0,s.createIdRemapMiddleware)(),(t=e,(e,r,s)=>{"string"==typeof e.method&&e.method||(r.error=n.ethErrors.rpc.invalidRequest({message:"The request 'method' must be a non-empty string.",data:e})),s((e=>{const{error:n}=r;return n?(t.error(`MetaMask - RPC Error: ${n.message}`,n),e()):e()}))}),(0,i.createRpcWarningMiddleware)(e)];var t};r.getRpcPromiseCallback=(e,t,r=!0)=>(n,s)=>{n||s.error?t(n||s.error):!r||Array.isArray(s)?e(s):e(s.result)};r.isValidChainId=e=>Boolean(e)&&"string"==typeof e&&e.startsWith("0x");r.isValidNetworkVersion=e=>Boolean(e)&&"string"==typeof e;r.NOOP=()=>undefined}}},{package:"@metamask/providers",file:"../../node_modules/@metamask/providers/dist/utils.js"}],[58,{events:"events"},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){Object.defineProperty(r,"__esModule",{value:!0});const n=e("events");function s(e,t,r){try{Reflect.apply(e,t,r)}catch(e){setTimeout((()=>{throw e}))}}class i extends n.EventEmitter{emit(e,...t){let r="error"===e;const n=this._events;if(n!==undefined)r=r&&n.error===undefined;else if(!r)return!1;if(r){let e;if(t.length>0&&([e]=t),e instanceof Error)throw e;const r=new Error("Unhandled error."+(e?` (${e.message})`:""));throw r.context=e,r}const i=n[e];if(i===undefined)return!1;if("function"==typeof i)s(i,this,t);else{const e=i.length,r=function(e){const t=e.length,r=new Array(t);for(let n=0;n<t;n+=1)r[n]=e[n];return r}(i);for(let n=0;n<e;n+=1)s(r[n],this,t)}return!0}}r.default=i}}},{package:"@metamask/providers>@metamask/safe-event-emitter",file:"../../node_modules/@metamask/providers/node_modules/@metamask/safe-event-emitter/index.js"}],[59,{events:"events"},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){Object.defineProperty(r,"__esModule",{value:!0});const n=e("events");function s(e,t,r){try{Reflect.apply(e,t,r)}catch(e){setTimeout((()=>{throw e}))}}class i extends n.EventEmitter{emit(e,...t){let r="error"===e;const n=this._events;if(n!==undefined)r=r&&n.error===undefined;else if(!r)return!1;if(r){let e;if(t.length>0&&([e]=t),e instanceof Error)throw e;const r=new Error("Unhandled error."+(e?` (${e.message})`:""));throw r.context=e,r}const i=n[e];if(i===undefined)return!1;if("function"==typeof i)s(i,this,t);else{const e=i.length,r=function(e){const t=e.length,r=new Array(t);for(let n=0;n<t;n+=1)r[n]=e[n];return r}(i);for(let n=0;n<e;n+=1)s(r[n],this,t)}return!0}}r.default=i}}},{package:"json-rpc-engine>@metamask/safe-event-emitter",file:"../../node_modules/@metamask/safe-event-emitter/index.js"}],[60,{superstruct:192},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){Object.defineProperty(r,"__esModule",{value:!0}),function(e,t){for(var r in t)Object.defineProperty(e,r,{enumerable:!0,get:t[r]})}(r,{AssertionError:function(){return i},assert:function(){return o},assertStruct:function(){return a},assertExhaustive:function(){return u}});const n=e("superstruct");function s(e,t){return r=e,Boolean("string"==typeof r?.prototype?.constructor?.name)?new e({message:t}):e({message:t});var r}class i extends Error{constructor(e){var t,r,n;super(e.message),n="ERR_ASSERTION",(r="code")in(t=this)?Object.defineProperty(t,r,{value:n,enumerable:!0,configurable:!0,writable:!0}):t[r]=n}}function o(e,t="Assertion failed.",r=i){if(!e){if(t instanceof Error)throw t;throw s(r,t)}}function a(e,t,r="Assertion failed",o=i){try{(0,n.assert)(e,t)}catch(e){throw s(o,`${r}: ${function(e){const t=function(e){return"object"==typeof e&&null!==e&&"message"in e}(e)?e.message:String(e);return t.endsWith(".")?t.slice(0,-1):t}(e)}.`)}}function u(e){throw new Error("Invalid branch reached. Should be detected during compilation.")}}}},{package:"@metamask/utils",file:"../../node_modules/@metamask/utils/dist/cjs/assert.js"}],[61,{"./assert":60,superstruct:192},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){Object.defineProperty(r,"__esModule",{value:!0}),Object.defineProperty(r,"base64",{enumerable:!0,get:function(){return i}});const n=e("superstruct"),s=e("./assert"),i=(e,t={})=>{const r=t.paddingRequired??!1,i=t.characterSet??"base64";let o,a;return"base64"===i?o=String.raw`[A-Za-z0-9+\/]`:((0,s.assert)("base64url"===i),o=String.raw`[-_A-Za-z0-9]`),a=r?new RegExp(`^(?:${o}{4})*(?:${o}{3}=|${o}{2}==)?$`,"u"):new RegExp(`^(?:${o}{4})*(?:${o}{2,3}|${o}{3}=|${o}{2}==)?$`,"u"),(0,n.pattern)(e,a)}}}},{package:"@metamask/utils",file:"../../node_modules/@metamask/utils/dist/cjs/base64.js"}],[62,{"./assert":60,"./hex":68,buffer:"buffer"},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){(function(t){(function(){Object.defineProperty(r,"__esModule",{value:!0}),function(e,t){for(var r in t)Object.defineProperty(e,r,{enumerable:!0,get:t[r]})}(r,{isBytes:function(){return c},assertIsBytes:function(){return l},bytesToHex:function(){return d},bytesToBigInt:function(){return f},bytesToSignedBigInt:function(){return h},bytesToNumber:function(){return p},bytesToString:function(){return m},hexToBytes:function(){return g},bigIntToBytes:function(){return b},signedBigIntToBytes:function(){return w},numberToBytes:function(){return y},stringToBytes:function(){return v},valueToBytes:function(){return _},concatBytes:function(){return S},createDataView:function(){return E}});const n=e("./assert"),s=e("./hex"),i=48,o=58,a=87;const u=function(){const e=[];return()=>{if(0===e.length)for(let t=0;t<256;t++)e.push(t.toString(16).padStart(2,"0"));return e}}();function c(e){return e instanceof Uint8Array}function l(e){(0,n.assert)(c(e),"Value must be a Uint8Array.")}function d(e){if(l(e),0===e.length)return"0x";const t=u(),r=new Array(e.length);for(let n=0;n<e.length;n++)r[n]=t[e[n]];return(0,s.add0x)(r.join(""))}function f(e){l(e);const t=d(e);return BigInt(t)}function h(e){l(e);let t=BigInt(0);for(const r of e)t=(t<<BigInt(8))+BigInt(r);return BigInt.asIntN(8*e.length,t)}function p(e){l(e);const t=f(e);return(0,n.assert)(t<=BigInt(Number.MAX_SAFE_INTEGER),"Number is not a safe integer. Use `bytesToBigInt` instead."),Number(t)}function m(e){return l(e),(new TextDecoder).decode(e)}function g(e){if("0x"===e?.toLowerCase?.())return new Uint8Array;(0,s.assertIsHexString)(e);const t=(0,s.remove0x)(e).toLowerCase(),r=t.length%2==0?t:`0${t}`,n=new Uint8Array(r.length/2);for(let e=0;e<n.length;e++){const t=r.charCodeAt(2*e),s=r.charCodeAt(2*e+1),u=t-(t<o?i:a),c=s-(s<o?i:a);n[e]=16*u+c}return n}function b(e){(0,n.assert)("bigint"==typeof e,"Value must be a bigint."),(0,n.assert)(e>=BigInt(0),"Value must be a non-negative bigint.");return g(e.toString(16))}function w(e,t){(0,n.assert)("bigint"==typeof e,"Value must be a bigint."),(0,n.assert)("number"==typeof t,"Byte length must be a number."),(0,n.assert)(t>0,"Byte length must be greater than 0."),(0,n.assert)(function(e,t){(0,n.assert)(t>0);const r=e>>BigInt(31);return!((~e&r)+(e&~r)>>BigInt(8*t-1))}(e,t),"Byte length is too small to represent the given value.");let r=e;const s=new Uint8Array(t);for(let e=0;e<s.length;e++)s[e]=Number(BigInt.asUintN(8,r)),r>>=BigInt(8);return s.reverse()}function y(e){(0,n.assert)("number"==typeof e,"Value must be a number."),(0,n.assert)(e>=0,"Value must be a non-negative number."),(0,n.assert)(Number.isSafeInteger(e),"Value is not a safe integer. Use `bigIntToBytes` instead.");return g(e.toString(16))}function v(e){return(0,n.assert)("string"==typeof e,"Value must be a string."),(new TextEncoder).encode(e)}function _(e){if("bigint"==typeof e)return b(e);if("number"==typeof e)return y(e);if("string"==typeof e)return e.startsWith("0x")?g(e):v(e);if(c(e))return e;throw new TypeError(`Unsupported value type: "${typeof e}".`)}function S(e){const t=new Array(e.length);let r=0;for(let n=0;n<e.length;n++){const s=_(e[n]);t[n]=s,r+=s.length}const n=new Uint8Array(r);for(let e=0,r=0;e<t.length;e++)n.set(t[e],r),r+=t[e].length;return n}function E(e){if(void 0!==t&&e instanceof t){const t=e.buffer.slice(e.byteOffset,e.byteOffset+e.byteLength);return new DataView(t)}return new DataView(e.buffer,e.byteOffset,e.byteLength)}}).call(this)}).call(this,e("buffer").Buffer)}}},{package:"@metamask/utils",file:"../../node_modules/@metamask/utils/dist/cjs/bytes.js"}],[63,{superstruct:192},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){Object.defineProperty(r,"__esModule",{value:!0}),function(e,t){for(var r in t)Object.defineProperty(e,r,{enumerable:!0,get:t[r]})}(r,{CAIP_CHAIN_ID_REGEX:function(){return s},CAIP_NAMESPACE_REGEX:function(){return i},CAIP_REFERENCE_REGEX:function(){return o},CAIP_ACCOUNT_ID_REGEX:function(){return a},CAIP_ACCOUNT_ADDRESS_REGEX:function(){return u},CaipChainIdStruct:function(){return c},CaipNamespaceStruct:function(){return l},CaipReferenceStruct:function(){return d},CaipAccountIdStruct:function(){return f},CaipAccountAddressStruct:function(){return h},isCaipChainId:function(){return p},isCaipNamespace:function(){return m},isCaipReference:function(){return g},isCaipAccountId:function(){return b},isCaipAccountAddress:function(){return w},parseCaipChainId:function(){return y},parseCaipAccountId:function(){return v}});const n=e("superstruct"),s=RegExp("^(?<namespace>[-a-z0-9]{3,8}):(?<reference>[-_a-zA-Z0-9]{1,32})$","u"),i=/^[-a-z0-9]{3,8}$/u,o=/^[-_a-zA-Z0-9]{1,32}$/u,a=RegExp("^(?<chainId>(?<namespace>[-a-z0-9]{3,8}):(?<reference>[-_a-zA-Z0-9]{1,32})):(?<accountAddress>[-.%a-zA-Z0-9]{1,128})$","u"),u=/^[-.%a-zA-Z0-9]{1,128}$/u,c=(0,n.pattern)((0,n.string)(),s),l=(0,n.pattern)((0,n.string)(),i),d=(0,n.pattern)((0,n.string)(),o),f=(0,n.pattern)((0,n.string)(),a),h=(0,n.pattern)((0,n.string)(),u);function p(e){return(0,n.is)(e,c)}function m(e){return(0,n.is)(e,l)}function g(e){return(0,n.is)(e,d)}function b(e){return(0,n.is)(e,f)}function w(e){return(0,n.is)(e,h)}function y(e){const t=s.exec(e);if(!t?.groups)throw new Error("Invalid CAIP chain ID.");return{namespace:t.groups.namespace,reference:t.groups.reference}}function v(e){const t=a.exec(e);if(!t?.groups)throw new Error("Invalid CAIP account ID.");return{address:t.groups.accountAddress,chainId:t.groups.chainId,chain:{namespace:t.groups.namespace,reference:t.groups.reference}}}}}},{package:"@metamask/utils",file:"../../node_modules/@metamask/utils/dist/cjs/caip-types.js"}],[64,{"./base64":61,superstruct:192},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){Object.defineProperty(r,"__esModule",{value:!0}),Object.defineProperty(r,"ChecksumStruct",{enumerable:!0,get:function(){return i}});const n=e("superstruct"),s=e("./base64"),i=(0,n.size)((0,s.base64)((0,n.string)(),{paddingRequired:!0}),44,44)}}},{package:"@metamask/utils",file:"../../node_modules/@metamask/utils/dist/cjs/checksum.js"}],[65,{"./assert":60,"./bytes":62,"./hex":68,superstruct:192},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){Object.defineProperty(r,"__esModule",{value:!0}),function(e,t){for(var r in t)Object.defineProperty(e,r,{enumerable:!0,get:t[r]})}(r,{createNumber:function(){return f},createBigInt:function(){return h},createBytes:function(){return p},createHex:function(){return m}});const n=e("superstruct"),s=e("./assert"),i=e("./bytes"),o=e("./hex"),a=(0,n.union)([(0,n.number)(),(0,n.bigint)(),(0,n.string)(),o.StrictHexStruct]),u=(0,n.coerce)((0,n.number)(),a,Number),c=(0,n.coerce)((0,n.bigint)(),a,BigInt),l=((0,n.union)([o.StrictHexStruct,(0,n.instance)(Uint8Array)]),(0,n.coerce)((0,n.instance)(Uint8Array),(0,n.union)([o.StrictHexStruct]),i.hexToBytes)),d=(0,n.coerce)(o.StrictHexStruct,(0,n.instance)(Uint8Array),i.bytesToHex);function f(e){try{const t=(0,n.create)(e,u);return(0,s.assert)(Number.isFinite(t),`Expected a number-like value, got "${e}".`),t}catch(t){if(t instanceof n.StructError)throw new Error(`Expected a number-like value, got "${e}".`);throw t}}function h(e){try{return(0,n.create)(e,c)}catch(e){if(e instanceof n.StructError)throw new Error(`Expected a number-like value, got "${String(e.value)}".`);throw e}}function p(e){if("string"==typeof e&&"0x"===e.toLowerCase())return new Uint8Array;try{return(0,n.create)(e,l)}catch(e){if(e instanceof n.StructError)throw new Error(`Expected a bytes-like value, got "${String(e.value)}".`);throw e}}function m(e){if(e instanceof Uint8Array&&0===e.length||"string"==typeof e&&"0x"===e.toLowerCase())return"0x";try{return(0,n.create)(e,d)}catch(e){if(e instanceof n.StructError)throw new Error(`Expected a bytes-like value, got "${String(e.value)}".`);throw e}}}}},{package:"@metamask/utils",file:"../../node_modules/@metamask/utils/dist/cjs/coercers.js"}],[66,{},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){function n(e,t,r){if(!t.has(e))throw new TypeError("attempted to "+r+" private field on non-instance");return t.get(e)}function s(e,t){return function(e,t){return t.get?t.get.call(e):t.value}(e,n(e,t,"get"))}function i(e,t,r){!function(e,t){if(t.has(e))throw new TypeError("Cannot initialize the same private elements twice on an object")}(e,t),t.set(e,r)}function o(e,t,r){return function(e,t,r){if(t.set)t.set.call(e,r);else{if(!t.writable)throw new TypeError("attempted to set read only private field");t.value=r}}(e,n(e,t,"set"),r),r}Object.defineProperty(r,"__esModule",{value:!0}),function(e,t){for(var r in t)Object.defineProperty(e,r,{enumerable:!0,get:t[r]})}(r,{FrozenMap:function(){return c},FrozenSet:function(){return f}});var a=new WeakMap;let u=Symbol.iterator;class c{get size(){return s(this,a).size}[u](){return s(this,a)[Symbol.iterator]()}entries(){return s(this,a).entries()}forEach(e,t){return s(this,a).forEach(((r,n,s)=>e.call(t,r,n,this)))}get(e){return s(this,a).get(e)}has(e){return s(this,a).has(e)}keys(){return s(this,a).keys()}values(){return s(this,a).values()}toString(){return`FrozenMap(${this.size}) {${this.size>0?` ${[...this.entries()].map((([e,t])=>`${String(e)} => ${String(t)}`)).join(", ")} `:""}}`}constructor(e){i(this,a,{writable:!0,value:void 0}),o(this,a,new Map(e)),Object.freeze(this)}}var l=new WeakMap;let d=Symbol.iterator;class f{get size(){return s(this,l).size}[d](){return s(this,l)[Symbol.iterator]()}entries(){return s(this,l).entries()}forEach(e,t){return s(this,l).forEach(((r,n,s)=>e.call(t,r,n,this)))}has(e){return s(this,l).has(e)}keys(){return s(this,l).keys()}values(){return s(this,l).values()}toString(){return`FrozenSet(${this.size}) {${this.size>0?` ${[...this.values()].map((e=>String(e))).join(", ")} `:""}}`}constructor(e){i(this,l,{writable:!0,value:void 0}),o(this,l,new Set(e)),Object.freeze(this)}}Object.freeze(c),Object.freeze(c.prototype),Object.freeze(f),Object.freeze(f.prototype)}}},{package:"@metamask/utils",file:"../../node_modules/@metamask/utils/dist/cjs/collections.js"}],[67,{},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){Object.defineProperty(r,"__esModule",{value:!0})}}},{package:"@metamask/utils",file:"../../node_modules/@metamask/utils/dist/cjs/encryption-types.js"}],[68,{"./assert":60,"./bytes":62,"@noble/hashes/sha3":82,superstruct:192},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){Object.defineProperty(r,"__esModule",{value:!0}),function(e,t){for(var r in t)Object.defineProperty(e,r,{enumerable:!0,get:t[r]})}(r,{HexStruct:function(){return a},StrictHexStruct:function(){return u},HexAddressStruct:function(){return c},HexChecksumAddressStruct:function(){return l},isHexString:function(){return d},isStrictHexString:function(){return f},assertIsHexString:function(){return h},assertIsStrictHexString:function(){return p},isValidHexAddress:function(){return m},getChecksumAddress:function(){return g},isValidChecksumAddress:function(){return b},add0x:function(){return w},remove0x:function(){return y}});const n=e("@noble/hashes/sha3"),s=e("superstruct"),i=e("./assert"),o=e("./bytes"),a=(0,s.pattern)((0,s.string)(),/^(?:0x)?[0-9a-f]+$/iu),u=(0,s.pattern)((0,s.string)(),/^0x[0-9a-f]+$/iu),c=(0,s.pattern)((0,s.string)(),/^0x[0-9a-f]{40}$/u),l=(0,s.pattern)((0,s.string)(),/^0x[0-9a-fA-F]{40}$/u);function d(e){return(0,s.is)(e,a)}function f(e){return(0,s.is)(e,u)}function h(e){(0,i.assert)(d(e),"Value must be a hexadecimal string.")}function p(e){(0,i.assert)(f(e),'Value must be a hexadecimal string, starting with "0x".')}function m(e){return(0,s.is)(e,c)||b(e)}function g(e){(0,i.assert)((0,s.is)(e,l),"Invalid hex address.");const t=y(e.toLowerCase()),r=y((0,o.bytesToHex)((0,n.keccak_256)(t)));return`0x${t.split("").map(((e,t)=>{const n=r[t];return(0,i.assert)((0,s.is)(n,(0,s.string)()),"Hash shorter than address."),parseInt(n,16)>7?e.toUpperCase():e})).join("")}`}function b(e){return!!(0,s.is)(e,l)&&g(e)===e}function w(e){return e.startsWith("0x")?e:e.startsWith("0X")?`0x${e.substring(2)}`:`0x${e}`}function y(e){return e.startsWith("0x")||e.startsWith("0X")?e.substring(2):e}}}},{package:"@metamask/utils",file:"../../node_modules/@metamask/utils/dist/cjs/hex.js"}],[69,{"./assert":60,"./base64":61,"./bytes":62,"./caip-types":63,"./checksum":64,"./coercers":65,"./collections":66,"./encryption-types":67,"./hex":68,"./json":70,"./keyring":71,"./logging":72,"./misc":73,"./number":74,"./opaque":75,"./time":76,"./transaction-types":77,"./versions":78},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){function n(e,t){return Object.keys(e).forEach((function(r){"default"===r||Object.prototype.hasOwnProperty.call(t,r)||Object.defineProperty(t,r,{enumerable:!0,get:function(){return e[r]}})})),e}Object.defineProperty(r,"__esModule",{value:!0}),n(e("./assert"),r),n(e("./base64"),r),n(e("./bytes"),r),n(e("./caip-types"),r),n(e("./checksum"),r),n(e("./coercers"),r),n(e("./collections"),r),n(e("./encryption-types"),r),n(e("./hex"),r),n(e("./json"),r),n(e("./keyring"),r),n(e("./logging"),r),n(e("./misc"),r),n(e("./number"),r),n(e("./opaque"),r),n(e("./time"),r),n(e("./transaction-types"),r),n(e("./versions"),r)}}},{package:"@metamask/utils",file:"../../node_modules/@metamask/utils/dist/cjs/index.js"}],[70,{"./assert":60,superstruct:192},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){Object.defineProperty(r,"__esModule",{value:!0}),function(e,t){for(var r in t)Object.defineProperty(e,r,{enumerable:!0,get:t[r]})}(r,{UnsafeJsonStruct:function(){return i},JsonStruct:function(){return o},isValidJson:function(){return a},getSafeJson:function(){return u},getJsonSize:function(){return c},jsonrpc2:function(){return l},JsonRpcVersionStruct:function(){return d},JsonRpcIdStruct:function(){return f},JsonRpcErrorStruct:function(){return h},JsonRpcParamsStruct:function(){return p},JsonRpcRequestStruct:function(){return m},JsonRpcNotificationStruct:function(){return g},isJsonRpcNotification:function(){return b},assertIsJsonRpcNotification:function(){return w},isJsonRpcRequest:function(){return y},assertIsJsonRpcRequest:function(){return v},PendingJsonRpcResponseStruct:function(){return _},JsonRpcSuccessStruct:function(){return S},JsonRpcFailureStruct:function(){return E},JsonRpcResponseStruct:function(){return k},isPendingJsonRpcResponse:function(){return T},assertIsPendingJsonRpcResponse:function(){return j},isJsonRpcResponse:function(){return R},assertIsJsonRpcResponse:function(){return x},isJsonRpcSuccess:function(){return M},assertIsJsonRpcSuccess:function(){return O},isJsonRpcFailure:function(){return P},assertIsJsonRpcFailure:function(){return C},isJsonRpcError:function(){return I},assertIsJsonRpcError:function(){return A},getJsonRpcIdValidator:function(){return N}});const n=e("superstruct"),s=e("./assert"),i=(0,n.union)([(0,n.literal)(null),(0,n.boolean)(),(0,n.define)("finite number",(e=>(0,n.is)(e,(0,n.number)())&&Number.isFinite(e))),(0,n.string)(),(0,n.array)((0,n.lazy)((()=>i))),(0,n.record)((0,n.string)(),(0,n.lazy)((()=>i)))]),o=(0,n.coerce)(i,(0,n.any)(),(e=>((0,s.assertStruct)(e,i),JSON.parse(JSON.stringify(e,((e,t)=>"__proto__"===e||"constructor"===e?undefined:t))))));function a(e){try{return u(e),!0}catch{return!1}}function u(e){return(0,n.create)(e,o)}function c(e){(0,s.assertStruct)(e,o,"Invalid JSON value");const t=JSON.stringify(e);return(new TextEncoder).encode(t).byteLength}const l="2.0",d=(0,n.literal)(l),f=(0,n.nullable)((0,n.union)([(0,n.number)(),(0,n.string)()])),h=(0,n.object)({code:(0,n.integer)(),message:(0,n.string)(),data:(0,n.optional)(o),stack:(0,n.optional)((0,n.string)())}),p=(0,n.union)([(0,n.record)((0,n.string)(),o),(0,n.array)(o)]),m=(0,n.object)({id:f,jsonrpc:d,method:(0,n.string)(),params:(0,n.optional)(p)}),g=(0,n.object)({jsonrpc:d,method:(0,n.string)(),params:(0,n.optional)(p)});function b(e){return(0,n.is)(e,g)}function w(e,t){(0,s.assertStruct)(e,g,"Invalid JSON-RPC notification",t)}function y(e){return(0,n.is)(e,m)}function v(e,t){(0,s.assertStruct)(e,m,"Invalid JSON-RPC request",t)}const _=(0,n.object)({id:f,jsonrpc:d,result:(0,n.optional)((0,n.unknown)()),error:(0,n.optional)(h)}),S=(0,n.object)({id:f,jsonrpc:d,result:o}),E=(0,n.object)({id:f,jsonrpc:d,error:h}),k=(0,n.union)([S,E]);function T(e){return(0,n.is)(e,_)}function j(e,t){(0,s.assertStruct)(e,_,"Invalid pending JSON-RPC response",t)}function R(e){return(0,n.is)(e,k)}function x(e,t){(0,s.assertStruct)(e,k,"Invalid JSON-RPC response",t)}function M(e){return(0,n.is)(e,S)}function O(e,t){(0,s.assertStruct)(e,S,"Invalid JSON-RPC success response",t)}function P(e){return(0,n.is)(e,E)}function C(e,t){(0,s.assertStruct)(e,E,"Invalid JSON-RPC failure response",t)}function I(e){return(0,n.is)(e,h)}function A(e,t){(0,s.assertStruct)(e,h,"Invalid JSON-RPC error",t)}function N(e){const{permitEmptyString:t,permitFractions:r,permitNull:n}={permitEmptyString:!0,permitFractions:!1,permitNull:!0,...e};return e=>Boolean("number"==typeof e&&(r||Number.isInteger(e))||"string"==typeof e&&(t||e.length>0)||n&&null===e)}}}},{package:"@metamask/utils",file:"../../node_modules/@metamask/utils/dist/cjs/json.js"}],[71,{},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){Object.defineProperty(r,"__esModule",{value:!0})}}},{package:"@metamask/utils",file:"../../node_modules/@metamask/utils/dist/cjs/keyring.js"}],[72,{debug:88},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){Object.defineProperty(r,"__esModule",{value:!0}),function(e,t){for(var r in t)Object.defineProperty(e,r,{enumerable:!0,get:t[r]})}(r,{createProjectLogger:function(){return i},createModuleLogger:function(){return o}});function n(e){return e&&e.__esModule?e:{default:e}}const s=(0,n(e("debug")).default)("metamask");function i(e){return s.extend(e)}function o(e,t){return e.extend(t)}}}},{package:"@metamask/utils",file:"../../node_modules/@metamask/utils/dist/cjs/logging.js"}],[73,{},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){function n(e){return Array.isArray(e)&&e.length>0}function s(e){return null===e||e===undefined}function i(e){return Boolean(e)&&"object"==typeof e&&!Array.isArray(e)}Object.defineProperty(r,"__esModule",{value:!0}),function(e,t){for(var r in t)Object.defineProperty(e,r,{enumerable:!0,get:t[r]})}(r,{JsonSize:function(){return u},isNonEmptyArray:function(){return n},isNullOrUndefined:function(){return s},isObject:function(){return i},hasProperty:function(){return o},getKnownPropertyNames:function(){return a},ESCAPE_CHARACTERS_REGEXP:function(){return c},isPlainObject:function(){return l},isASCII:function(){return d},calculateStringSize:function(){return f},calculateNumberSize:function(){return h}});const o=(e,t)=>Object.hasOwnProperty.call(e,t);function a(e){return Object.getOwnPropertyNames(e)}var u;!function(e){e[e.Null=4]="Null",e[e.Comma=1]="Comma",e[e.Wrapper=1]="Wrapper",e[e.True=4]="True",e[e.False=5]="False",e[e.Quote=1]="Quote",e[e.Colon=1]="Colon",e[e.Date=24]="Date"}(u||(u={}));const c=/"|\\|\n|\r|\t/gu;function l(e){if("object"!=typeof e||null===e)return!1;try{let t=e;for(;null!==Object.getPrototypeOf(t);)t=Object.getPrototypeOf(t);return Object.getPrototypeOf(e)===t}catch(e){return!1}}function d(e){return e.charCodeAt(0)<=127}function f(e){return e.split("").reduce(((e,t)=>d(t)?e+1:e+2),0)+(e.match(c)??[]).length}function h(e){return e.toString().length}}}},{package:"@metamask/utils",file:"../../node_modules/@metamask/utils/dist/cjs/misc.js"}],[74,{"./assert":60,"./hex":68},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){Object.defineProperty(r,"__esModule",{value:!0}),function(e,t){for(var r in t)Object.defineProperty(e,r,{enumerable:!0,get:t[r]})}(r,{numberToHex:function(){return i},bigIntToHex:function(){return o},hexToNumber:function(){return a},hexToBigInt:function(){return u}});const n=e("./assert"),s=e("./hex"),i=e=>((0,n.assert)("number"==typeof e,"Value must be a number."),(0,n.assert)(e>=0,"Value must be a non-negative number."),(0,n.assert)(Number.isSafeInteger(e),"Value is not a safe integer. Use `bigIntToHex` instead."),(0,s.add0x)(e.toString(16))),o=e=>((0,n.assert)("bigint"==typeof e,"Value must be a bigint."),(0,n.assert)(e>=0,"Value must be a non-negative bigint."),(0,s.add0x)(e.toString(16))),a=e=>{(0,s.assertIsHexString)(e);const t=parseInt(e,16);return(0,n.assert)(Number.isSafeInteger(t),"Value is not a safe integer. Use `hexToBigInt` instead."),t},u=e=>((0,s.assertIsHexString)(e),BigInt((0,s.add0x)(e)))}}},{package:"@metamask/utils",file:"../../node_modules/@metamask/utils/dist/cjs/number.js"}],[75,{},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){Object.defineProperty(r,"__esModule",{value:!0})}}},{package:"@metamask/utils",file:"../../node_modules/@metamask/utils/dist/cjs/opaque.js"}],[76,{},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){var n;Object.defineProperty(r,"__esModule",{value:!0}),function(e,t){for(var r in t)Object.defineProperty(e,r,{enumerable:!0,get:t[r]})}(r,{Duration:function(){return n},inMilliseconds:function(){return i},timeSince:function(){return o}}),function(e){e[e.Millisecond=1]="Millisecond",e[e.Second=1e3]="Second",e[e.Minute=6e4]="Minute",e[e.Hour=36e5]="Hour",e[e.Day=864e5]="Day",e[e.Week=6048e5]="Week",e[e.Year=31536e6]="Year"}(n||(n={}));const s=(e,t)=>{if(!(e=>Number.isInteger(e)&&e>=0)(e))throw new Error(`"${t}" must be a non-negative integer. Received: "${e}".`)};function i(e,t){return s(e,"count"),e*t}function o(e){return s(e,"timestamp"),Date.now()-e}}}},{package:"@metamask/utils",file:"../../node_modules/@metamask/utils/dist/cjs/time.js"}],[77,{},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){Object.defineProperty(r,"__esModule",{value:!0})}}},{package:"@metamask/utils",file:"../../node_modules/@metamask/utils/dist/cjs/transaction-types.js"}],[78,{"./assert":60,semver:173,superstruct:192},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){Object.defineProperty(r,"__esModule",{value:!0}),function(e,t){for(var r in t)Object.defineProperty(e,r,{enumerable:!0,get:t[r]})}(r,{VersionStruct:function(){return o},VersionRangeStruct:function(){return a},isValidSemVerVersion:function(){return u},isValidSemVerRange:function(){return c},assertIsSemVerVersion:function(){return l},assertIsSemVerRange:function(){return d},gtVersion:function(){return f},gtRange:function(){return h},satisfiesVersionRange:function(){return p}});const n=e("semver"),s=e("superstruct"),i=e("./assert"),o=(0,s.refine)((0,s.string)(),"Version",(e=>null!==(0,n.valid)(e)||`Expected SemVer version, got "${e}"`)),a=(0,s.refine)((0,s.string)(),"Version range",(e=>null!==(0,n.validRange)(e)||`Expected SemVer range, got "${e}"`));function u(e){return(0,s.is)(e,o)}function c(e){return(0,s.is)(e,a)}function l(e){(0,i.assertStruct)(e,o)}function d(e){(0,i.assertStruct)(e,a)}function f(e,t){return(0,n.gt)(e,t)}function h(e,t){return(0,n.gtr)(e,t)}function p(e,t){return(0,n.satisfies)(e,t,{includePrerelease:!0})}}}},{package:"@metamask/utils",file:"../../node_modules/@metamask/utils/dist/cjs/versions.js"}],[79,{},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){function n(e){if(!Number.isSafeInteger(e)||e<0)throw new Error(`Wrong positive integer: ${e}`)}function s(e){if("boolean"!=typeof e)throw new Error(`Expected boolean, not ${e}`)}function i(e,...t){if(!(e instanceof Uint8Array))throw new Error("Expected Uint8Array");if(t.length>0&&!t.includes(e.length))throw new Error(`Expected Uint8Array of length ${t}, not of length=${e.length}`)}function o(e){if("function"!=typeof e||"function"!=typeof e.create)throw new Error("Hash should be wrapped by utils.wrapConstructor");n(e.outputLen),n(e.blockLen)}function a(e,t=!0){if(e.destroyed)throw new Error("Hash instance has been destroyed");if(t&&e.finished)throw new Error("Hash#digest() has already been called")}function u(e,t){i(e);const r=t.outputLen;if(e.length<r)throw new Error(`digestInto() expects output buffer of length at least ${r}`)}Object.defineProperty(r,"__esModule",{value:!0}),r.output=r.exists=r.hash=r.bytes=r.bool=r.number=void 0,r.number=n,r.bool=s,r.bytes=i,r.hash=o,r.exists=a,r.output=u;const c={number:n,bool:s,bytes:i,hash:o,exists:a,output:u};r.default=c}}},{package:"@metamask/utils>@noble/hashes",file:"../../node_modules/@noble/hashes/_assert.js"}],[80,{},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){Object.defineProperty(r,"__esModule",{value:!0}),r.add5L=r.add5H=r.add4H=r.add4L=r.add3H=r.add3L=r.add=r.rotlBL=r.rotlBH=r.rotlSL=r.rotlSH=r.rotr32L=r.rotr32H=r.rotrBL=r.rotrBH=r.rotrSL=r.rotrSH=r.shrSL=r.shrSH=r.toBig=r.split=r.fromBig=void 0;const n=BigInt(2**32-1),s=BigInt(32);function i(e,t=!1){return t?{h:Number(e&n),l:Number(e>>s&n)}:{h:0|Number(e>>s&n),l:0|Number(e&n)}}function o(e,t=!1){let r=new Uint32Array(e.length),n=new Uint32Array(e.length);for(let s=0;s<e.length;s++){const{h:o,l:a}=i(e[s],t);[r[s],n[s]]=[o,a]}return[r,n]}r.fromBig=i,r.split=o;const a=(e,t)=>BigInt(e>>>0)<<s|BigInt(t>>>0);r.toBig=a;const u=(e,t,r)=>e>>>r;r.shrSH=u;const c=(e,t,r)=>e<<32-r|t>>>r;r.shrSL=c;const l=(e,t,r)=>e>>>r|t<<32-r;r.rotrSH=l;const d=(e,t,r)=>e<<32-r|t>>>r;r.rotrSL=d;const f=(e,t,r)=>e<<64-r|t>>>r-32;r.rotrBH=f;const h=(e,t,r)=>e>>>r-32|t<<64-r;r.rotrBL=h;const p=(e,t)=>t;r.rotr32H=p;const m=(e,t)=>e;r.rotr32L=m;const g=(e,t,r)=>e<<r|t>>>32-r;r.rotlSH=g;const b=(e,t,r)=>t<<r|e>>>32-r;r.rotlSL=b;const w=(e,t,r)=>t<<r-32|e>>>64-r;r.rotlBH=w;const y=(e,t,r)=>e<<r-32|t>>>64-r;function v(e,t,r,n){const s=(t>>>0)+(n>>>0);return{h:e+r+(s/2**32|0)|0,l:0|s}}r.rotlBL=y,r.add=v;const _=(e,t,r)=>(e>>>0)+(t>>>0)+(r>>>0);r.add3L=_;const S=(e,t,r,n)=>t+r+n+(e/2**32|0)|0;r.add3H=S;const E=(e,t,r,n)=>(e>>>0)+(t>>>0)+(r>>>0)+(n>>>0);r.add4L=E;const k=(e,t,r,n,s)=>t+r+n+s+(e/2**32|0)|0;r.add4H=k;const T=(e,t,r,n,s)=>(e>>>0)+(t>>>0)+(r>>>0)+(n>>>0)+(s>>>0);r.add5L=T;const j=(e,t,r,n,s,i)=>t+r+n+s+i+(e/2**32|0)|0;r.add5H=j;const R={fromBig:i,split:o,toBig:a,shrSH:u,shrSL:c,rotrSH:l,rotrSL:d,rotrBH:f,rotrBL:h,rotr32H:p,rotr32L:m,rotlSH:g,rotlSL:b,rotlBH:w,rotlBL:y,add:v,add3L:_,add3H:S,add4L:E,add4H:k,add5H:j,add5L:T};r.default=R}}},{package:"@metamask/utils>@noble/hashes",file:"../../node_modules/@noble/hashes/_u64.js"}],[81,{},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){Object.defineProperty(r,"__esModule",{value:!0}),r.crypto=void 0,r.crypto="object"==typeof globalThis&&"crypto"in globalThis?globalThis.crypto:undefined}}},{package:"@metamask/utils>@noble/hashes",file:"../../node_modules/@noble/hashes/crypto.js"}],[82,{"./_assert.js":79,"./_u64.js":80,"./utils.js":83},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){Object.defineProperty(r,"__esModule",{value:!0}),r.shake256=r.shake128=r.keccak_512=r.keccak_384=r.keccak_256=r.keccak_224=r.sha3_512=r.sha3_384=r.sha3_256=r.sha3_224=r.Keccak=r.keccakP=void 0;const n=e("./_assert.js"),s=e("./_u64.js"),i=e("./utils.js"),[o,a,u]=[[],[],[]],c=BigInt(0),l=BigInt(1),d=BigInt(2),f=BigInt(7),h=BigInt(256),p=BigInt(113);for(let e=0,t=l,r=1,n=0;e<24;e++){[r,n]=[n,(2*r+3*n)%5],o.push(2*(5*n+r)),a.push((e+1)*(e+2)/2%64);let s=c;for(let e=0;e<7;e++)t=(t<<l^(t>>f)*p)%h,t&d&&(s^=l<<(l<<BigInt(e))-l);u.push(s)}const[m,g]=(0,s.split)(u,!0),b=(e,t,r)=>r>32?(0,s.rotlBH)(e,t,r):(0,s.rotlSH)(e,t,r),w=(e,t,r)=>r>32?(0,s.rotlBL)(e,t,r):(0,s.rotlSL)(e,t,r);function y(e,t=24){const r=new Uint32Array(10);for(let n=24-t;n<24;n++){for(let t=0;t<10;t++)r[t]=e[t]^e[t+10]^e[t+20]^e[t+30]^e[t+40];for(let t=0;t<10;t+=2){const n=(t+8)%10,s=(t+2)%10,i=r[s],o=r[s+1],a=b(i,o,1)^r[n],u=w(i,o,1)^r[n+1];for(let r=0;r<50;r+=10)e[t+r]^=a,e[t+r+1]^=u}let t=e[2],s=e[3];for(let r=0;r<24;r++){const n=a[r],i=b(t,s,n),u=w(t,s,n),c=o[r];t=e[c],s=e[c+1],e[c]=i,e[c+1]=u}for(let t=0;t<50;t+=10){for(let n=0;n<10;n++)r[n]=e[t+n];for(let n=0;n<10;n++)e[t+n]^=~r[(n+2)%10]&r[(n+4)%10]}e[0]^=m[n],e[1]^=g[n]}r.fill(0)}r.keccakP=y;class v extends i.Hash{constructor(e,t,r,s=!1,o=24){if(super(),this.blockLen=e,this.suffix=t,this.outputLen=r,this.enableXOF=s,this.rounds=o,this.pos=0,this.posOut=0,this.finished=!1,this.destroyed=!1,(0,n.number)(r),0>=this.blockLen||this.blockLen>=200)throw new Error("Sha3 supports only keccak-f1600 function");this.state=new Uint8Array(200),this.state32=(0,i.u32)(this.state)}keccak(){y(this.state32,this.rounds),this.posOut=0,this.pos=0}update(e){(0,n.exists)(this);const{blockLen:t,state:r}=this,s=(e=(0,i.toBytes)(e)).length;for(let n=0;n<s;){const i=Math.min(t-this.pos,s-n);for(let t=0;t<i;t++)r[this.pos++]^=e[n++];this.pos===t&&this.keccak()}return this}finish(){if(this.finished)return;this.finished=!0;const{state:e,suffix:t,pos:r,blockLen:n}=this;e[r]^=t,0!=(128&t)&&r===n-1&&this.keccak(),e[n-1]^=128,this.keccak()}writeInto(e){(0,n.exists)(this,!1),(0,n.bytes)(e),this.finish();const t=this.state,{blockLen:r}=this;for(let n=0,s=e.length;n<s;){this.posOut>=r&&this.keccak();const i=Math.min(r-this.posOut,s-n);e.set(t.subarray(this.posOut,this.posOut+i),n),this.posOut+=i,n+=i}return e}xofInto(e){if(!this.enableXOF)throw new Error("XOF is not possible for this instance");return this.writeInto(e)}xof(e){return(0,n.number)(e),this.xofInto(new Uint8Array(e))}digestInto(e){if((0,n.output)(e,this),this.finished)throw new Error("digest() was already called");return this.writeInto(e),this.destroy(),e}digest(){return this.digestInto(new Uint8Array(this.outputLen))}destroy(){this.destroyed=!0,this.state.fill(0)}_cloneInto(e){const{blockLen:t,suffix:r,outputLen:n,rounds:s,enableXOF:i}=this;return e||(e=new v(t,r,n,i,s)),e.state32.set(this.state32),e.pos=this.pos,e.posOut=this.posOut,e.finished=this.finished,e.rounds=s,e.suffix=r,e.outputLen=n,e.enableXOF=i,e.destroyed=this.destroyed,e}}r.Keccak=v;const _=(e,t,r)=>(0,i.wrapConstructor)((()=>new v(t,e,r)));r.sha3_224=_(6,144,28),r.sha3_256=_(6,136,32),r.sha3_384=_(6,104,48),r.sha3_512=_(6,72,64),r.keccak_224=_(1,144,28),r.keccak_256=_(1,136,32),r.keccak_384=_(1,104,48),r.keccak_512=_(1,72,64);const S=(e,t,r)=>(0,i.wrapXOFConstructorWithOpts)(((n={})=>new v(t,e,n.dkLen===undefined?r:n.dkLen,!0)));r.shake128=S(31,168,16),r.shake256=S(31,136,32)}}},{package:"@metamask/utils>@noble/hashes",file:"../../node_modules/@noble/hashes/sha3.js"}],[83,{"@noble/hashes/crypto":81},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){
/*! noble-hashes - MIT License (c) 2022 Paul Miller (paulmillr.com) */
Object.defineProperty(r,"__esModule",{value:!0}),r.randomBytes=r.wrapXOFConstructorWithOpts=r.wrapConstructorWithOpts=r.wrapConstructor=r.checkOpts=r.Hash=r.concatBytes=r.toBytes=r.utf8ToBytes=r.asyncLoop=r.nextTick=r.hexToBytes=r.bytesToHex=r.isLE=r.rotr=r.createView=r.u32=r.u8=void 0;const n=e("@noble/hashes/crypto"),s=e=>e instanceof Uint8Array;r.u8=e=>new Uint8Array(e.buffer,e.byteOffset,e.byteLength);r.u32=e=>new Uint32Array(e.buffer,e.byteOffset,Math.floor(e.byteLength/4));r.createView=e=>new DataView(e.buffer,e.byteOffset,e.byteLength);if(r.rotr=(e,t)=>e<<32-t|e>>>t,r.isLE=68===new Uint8Array(new Uint32Array([287454020]).buffer)[0],!r.isLE)throw new Error("Non little-endian hardware is not supported");const i=Array.from({length:256},((e,t)=>t.toString(16).padStart(2,"0")));r.bytesToHex=function(e){if(!s(e))throw new Error("Uint8Array expected");let t="";for(let r=0;r<e.length;r++)t+=i[e[r]];return t},r.hexToBytes=function(e){if("string"!=typeof e)throw new Error("hex string expected, got "+typeof e);const t=e.length;if(t%2)throw new Error("padded hex string expected, got unpadded hex of length "+t);const r=new Uint8Array(t/2);for(let t=0;t<r.length;t++){const n=2*t,s=e.slice(n,n+2),i=Number.parseInt(s,16);if(Number.isNaN(i)||i<0)throw new Error("Invalid byte sequence");r[t]=i}return r};function o(e){if("string"!=typeof e)throw new Error("utf8ToBytes expected string, got "+typeof e);return new Uint8Array((new TextEncoder).encode(e))}function a(e){if("string"==typeof e&&(e=o(e)),!s(e))throw new Error("expected Uint8Array, got "+typeof e);return e}r.nextTick=async()=>{},r.asyncLoop=async function(e,t,n){let s=Date.now();for(let i=0;i<e;i++){n(i);const e=Date.now()-s;e>=0&&e<t||(await(0,r.nextTick)(),s+=e)}},r.utf8ToBytes=o,r.toBytes=a,r.concatBytes=function(...e){const t=new Uint8Array(e.reduce(((e,t)=>e+t.length),0));let r=0;return e.forEach((e=>{if(!s(e))throw new Error("Uint8Array expected");t.set(e,r),r+=e.length})),t};r.Hash=class{clone(){return this._cloneInto()}};const u={}.toString;r.checkOpts=function(e,t){if(t!==undefined&&"[object Object]"!==u.call(t))throw new Error("Options should be object or undefined");return Object.assign(e,t)},r.wrapConstructor=function(e){const t=t=>e().update(a(t)).digest(),r=e();return t.outputLen=r.outputLen,t.blockLen=r.blockLen,t.create=()=>e(),t},r.wrapConstructorWithOpts=function(e){const t=(t,r)=>e(r).update(a(t)).digest(),r=e({});return t.outputLen=r.outputLen,t.blockLen=r.blockLen,t.create=t=>e(t),t},r.wrapXOFConstructorWithOpts=function(e){const t=(t,r)=>e(r).update(a(t)).digest(),r=e({});return t.outputLen=r.outputLen,t.blockLen=r.blockLen,t.create=t=>e(t),t},r.randomBytes=function(e=32){if(n.crypto&&"function"==typeof n.crypto.getRandomValues)return n.crypto.getRandomValues(new Uint8Array(e));throw new Error("crypto.getRandomValues must be defined")}}}},{package:"@metamask/utils>@noble/hashes",file:"../../node_modules/@noble/hashes/utils.js"}],[84,{"../../is-buffer/index.js":103},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){(function(e){(function(){function t(e){return Object.prototype.toString.call(e)}r.isArray=function(e){return Array.isArray?Array.isArray(e):"[object Array]"===t(e)},r.isBoolean=function(e){return"boolean"==typeof e},r.isNull=function(e){return null===e},r.isNullOrUndefined=function(e){return null==e},r.isNumber=function(e){return"number"==typeof e},r.isString=function(e){return"string"==typeof e},r.isSymbol=function(e){return"symbol"==typeof e},r.isUndefined=function(e){return void 0===e},r.isRegExp=function(e){return"[object RegExp]"===t(e)},r.isObject=function(e){return"object"==typeof e&&null!==e},r.isDate=function(e){return"[object Date]"===t(e)},r.isError=function(e){return"[object Error]"===t(e)||e instanceof Error},r.isFunction=function(e){return"function"==typeof e},r.isPrimitive=function(e){return null===e||"boolean"==typeof e||"number"==typeof e||"string"==typeof e||"symbol"==typeof e||void 0===e},r.isBuffer=e.isBuffer}).call(this)}).call(this,{isBuffer:e("../../is-buffer/index.js")})}}},{package:"browserify>readable-stream>core-util-is",file:"../../node_modules/core-util-is/lib/util.js"}],[85,{},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){var n=1e3,s=60*n,i=60*s,o=24*i,a=7*o,u=365.25*o;function c(e,t,r,n){var s=t>=1.5*r;return Math.round(e/r)+" "+n+(s?"s":"")}t.exports=function(e,t){t=t||{};var r=typeof e;if("string"===r&&e.length>0)return function(e){if((e=String(e)).length>100)return;var t=/^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(e);if(!t)return;var r=parseFloat(t[1]);switch((t[2]||"ms").toLowerCase()){case"years":case"year":case"yrs":case"yr":case"y":return r*u;case"weeks":case"week":case"w":return r*a;case"days":case"day":case"d":return r*o;case"hours":case"hour":case"hrs":case"hr":case"h":return r*i;case"minutes":case"minute":case"mins":case"min":case"m":return r*s;case"seconds":case"second":case"secs":case"sec":case"s":return r*n;case"milliseconds":case"millisecond":case"msecs":case"msec":case"ms":return r;default:return undefined}}(e);if("number"===r&&isFinite(e))return t.long?function(e){var t=Math.abs(e);if(t>=o)return c(e,t,o,"day");if(t>=i)return c(e,t,i,"hour");if(t>=s)return c(e,t,s,"minute");if(t>=n)return c(e,t,n,"second");return e+" ms"}(e):function(e){var t=Math.abs(e);if(t>=o)return Math.round(e/o)+"d";if(t>=i)return Math.round(e/i)+"h";if(t>=s)return Math.round(e/s)+"m";if(t>=n)return Math.round(e/n)+"s";return e+"ms"}(e);throw new Error("val is not a non-empty string or a valid number. val="+JSON.stringify(e))}}}},{package:"eslint>debug>ms",file:"../../node_modules/debug/node_modules/ms/index.js"}],[86,{"./common":87},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){r.formatArgs=function(e){if(e[0]=(this.useColors?"%c":"")+this.namespace+(this.useColors?" %c":" ")+e[0]+(this.useColors?"%c ":" ")+"+"+t.exports.humanize(this.diff),!this.useColors)return;const r="color: "+this.color;e.splice(1,0,r,"color: inherit");let n=0,s=0;e[0].replace(/%[a-zA-Z%]/g,(e=>{"%%"!==e&&(n++,"%c"===e&&(s=n))})),e.splice(s,0,r)},r.save=function(e){try{e?r.storage.setItem("debug",e):r.storage.removeItem("debug")}catch(e){}},r.load=function(){let e;try{e=r.storage.getItem("debug")}catch(e){}!e&&"undefined"!=typeof process&&"env"in process&&(e=process.env.DEBUG);return e},r.useColors=function(){if("undefined"!=typeof window&&window.process&&("renderer"===window.process.type||window.process.__nwjs))return!0;if("undefined"!=typeof navigator&&navigator.userAgent&&navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/))return!1;return"undefined"!=typeof document&&document.documentElement&&document.documentElement.style&&document.documentElement.style.WebkitAppearance||"undefined"!=typeof window&&window.console&&(window.console.firebug||window.console.exception&&window.console.table)||"undefined"!=typeof navigator&&navigator.userAgent&&navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/)&&parseInt(RegExp.$1,10)>=31||"undefined"!=typeof navigator&&navigator.userAgent&&navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/)},r.storage=function(){try{return localStorage}catch(e){}}(),r.destroy=(()=>{let e=!1;return()=>{e||(e=!0,console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`."))}})(),r.colors=["#0000CC","#0000FF","#0033CC","#0033FF","#0066CC","#0066FF","#0099CC","#0099FF","#00CC00","#00CC33","#00CC66","#00CC99","#00CCCC","#00CCFF","#3300CC","#3300FF","#3333CC","#3333FF","#3366CC","#3366FF","#3399CC","#3399FF","#33CC00","#33CC33","#33CC66","#33CC99","#33CCCC","#33CCFF","#6600CC","#6600FF","#6633CC","#6633FF","#66CC00","#66CC33","#9900CC","#9900FF","#9933CC","#9933FF","#99CC00","#99CC33","#CC0000","#CC0033","#CC0066","#CC0099","#CC00CC","#CC00FF","#CC3300","#CC3333","#CC3366","#CC3399","#CC33CC","#CC33FF","#CC6600","#CC6633","#CC9900","#CC9933","#CCCC00","#CCCC33","#FF0000","#FF0033","#FF0066","#FF0099","#FF00CC","#FF00FF","#FF3300","#FF3333","#FF3366","#FF3399","#FF33CC","#FF33FF","#FF6600","#FF6633","#FF9900","#FF9933","#FFCC00","#FFCC33"],r.log=console.debug||console.log||(()=>{}),t.exports=e("./common")(r);const{formatters:n}=t.exports;n.j=function(e){try{return JSON.stringify(e)}catch(e){return"[UnexpectedJSONParseError]: "+e.message}}}}},{package:"eslint>debug",file:"../../node_modules/debug/src/browser.js"}],[87,{ms:85},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){t.exports=function(t){function r(e){let t,s,i,o=null;function a(...e){if(!a.enabled)return;const n=a,s=Number(new Date),i=s-(t||s);n.diff=i,n.prev=t,n.curr=s,t=s,e[0]=r.coerce(e[0]),"string"!=typeof e[0]&&e.unshift("%O");let o=0;e[0]=e[0].replace(/%([a-zA-Z%])/g,((t,s)=>{if("%%"===t)return"%";o++;const i=r.formatters[s];if("function"==typeof i){const r=e[o];t=i.call(n,r),e.splice(o,1),o--}return t})),r.formatArgs.call(n,e);(n.log||r.log).apply(n,e)}return a.namespace=e,a.useColors=r.useColors(),a.color=r.selectColor(e),a.extend=n,a.destroy=r.destroy,Object.defineProperty(a,"enabled",{enumerable:!0,configurable:!1,get:()=>null!==o?o:(s!==r.namespaces&&(s=r.namespaces,i=r.enabled(e)),i),set:e=>{o=e}}),"function"==typeof r.init&&r.init(a),a}function n(e,t){const n=r(this.namespace+(void 0===t?":":t)+e);return n.log=this.log,n}function s(e){return e.toString().substring(2,e.toString().length-2).replace(/\.\*\?$/,"*")}return r.debug=r,r.default=r,r.coerce=function(e){if(e instanceof Error)return e.stack||e.message;return e},r.disable=function(){const e=[...r.names.map(s),...r.skips.map(s).map((e=>"-"+e))].join(",");return r.enable(""),e},r.enable=function(e){let t;r.save(e),r.namespaces=e,r.names=[],r.skips=[];const n=("string"==typeof e?e:"").split(/[\s,]+/),s=n.length;for(t=0;t<s;t++)n[t]&&("-"===(e=n[t].replace(/\*/g,".*?"))[0]?r.skips.push(new RegExp("^"+e.slice(1)+"$")):r.names.push(new RegExp("^"+e+"$")))},r.enabled=function(e){if("*"===e[e.length-1])return!0;let t,n;for(t=0,n=r.skips.length;t<n;t++)if(r.skips[t].test(e))return!1;for(t=0,n=r.names.length;t<n;t++)if(r.names[t].test(e))return!0;return!1},r.humanize=e("ms"),r.destroy=function(){console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.")},Object.keys(t).forEach((e=>{r[e]=t[e]})),r.names=[],r.skips=[],r.formatters={},r.selectColor=function(e){let t=0;for(let r=0;r<e.length;r++)t=(t<<5)-t+e.charCodeAt(r),t|=0;return r.colors[Math.abs(t)%r.colors.length]},r.enable(r.load()),r}}}},{package:"eslint>debug",file:"../../node_modules/debug/src/common.js"}],[88,{"./browser.js":86,"./node.js":89},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){"undefined"==typeof process||"renderer"===process.type||!0===process.browser||process.__nwjs?t.exports=e("./browser.js"):t.exports=e("./node.js")}}},{package:"eslint>debug",file:"../../node_modules/debug/src/index.js"}],[89,{"./common":87,"supports-color":193,tty:"tty",util:"util"},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){const n=e("tty"),s=e("util");r.init=function(e){e.inspectOpts={};const t=Object.keys(r.inspectOpts);for(let n=0;n<t.length;n++)e.inspectOpts[t[n]]=r.inspectOpts[t[n]]},r.log=function(...e){return process.stderr.write(s.format(...e)+"\n")},r.formatArgs=function(e){const{namespace:n,useColors:s}=this;if(s){const r=this.color,s="[3"+(r<8?r:"8;5;"+r),i=`  ${s};1m${n} [0m`;e[0]=i+e[0].split("\n").join("\n"+i),e.push(s+"m+"+t.exports.humanize(this.diff)+"[0m")}else e[0]=function(){if(r.inspectOpts.hideDate)return"";return(new Date).toISOString()+" "}()+n+" "+e[0]},r.save=function(e){e?process.env.DEBUG=e:delete process.env.DEBUG},r.load=function(){return process.env.DEBUG},r.useColors=function(){return"colors"in r.inspectOpts?Boolean(r.inspectOpts.colors):n.isatty(process.stderr.fd)},r.destroy=s.deprecate((()=>{}),"Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`."),r.colors=[6,2,3,4,5,1];try{const t=e("supports-color");t&&(t.stderr||t).level>=2&&(r.colors=[20,21,26,27,32,33,38,39,40,41,42,43,44,45,56,57,62,63,68,69,74,75,76,77,78,79,80,81,92,93,98,99,112,113,128,129,134,135,148,149,160,161,162,163,164,165,166,167,168,169,170,171,172,173,178,179,184,185,196,197,198,199,200,201,202,203,204,205,206,207,208,209,214,215,220,221])}catch(e){}r.inspectOpts=Object.keys(process.env).filter((e=>/^debug_/i.test(e))).reduce(((e,t)=>{const r=t.substring(6).toLowerCase().replace(/_([a-z])/g,((e,t)=>t.toUpperCase()));let n=process.env[t];return n=!!/^(yes|on|true|enabled)$/i.test(n)||!/^(no|off|false|disabled)$/i.test(n)&&("null"===n?null:Number(n)),e[r]=n,e}),{}),t.exports=e("./common")(r);const{formatters:i}=t.exports;i.o=function(e){return this.inspectOpts.colors=this.useColors,s.inspect(e,this.inspectOpts).split("\n").map((e=>e.trim())).join(" ")},i.O=function(e){return this.inspectOpts.colors=this.useColors,s.inspect(e,this.inspectOpts)}}}},{package:"eslint>debug",file:"../../node_modules/debug/src/node.js"}],[90,{},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){var n=this&&this.__spreadArray||function(e,t,r){if(r||2===arguments.length)for(var n,s=0,i=t.length;s<i;s++)!n&&s in t||(n||(n=Array.prototype.slice.call(t,0,s)),n[s]=t[s]);return e.concat(n||Array.prototype.slice.call(t))};Object.defineProperty(r,"__esModule",{value:!0}),r.getNodeVersion=r.detectOS=r.parseUserAgent=r.browserName=r.detect=r.ReactNativeInfo=r.BotInfo=r.SearchBotDeviceInfo=r.NodeInfo=r.BrowserInfo=void 0;var s=function(e,t,r){this.name=e,this.version=t,this.os=r,this.type="browser"};r.BrowserInfo=s;var i=function(e){this.version=e,this.type="node",this.name="node",this.os=process.platform};r.NodeInfo=i;var o=function(e,t,r,n){this.name=e,this.version=t,this.os=r,this.bot=n,this.type="bot-device"};r.SearchBotDeviceInfo=o;var a=function(){this.type="bot",this.bot=!0,this.name="bot",this.version=null,this.os=null};r.BotInfo=a;var u=function(){this.type="react-native",this.name="react-native",this.version=null,this.os=null};r.ReactNativeInfo=u;var c=/(nuhk|curl|Googlebot|Yammybot|Openbot|Slurp|MSNBot|Ask\ Jeeves\/Teoma|ia_archiver)/,l=3,d=[["aol",/AOLShield\/([0-9\._]+)/],["edge",/Edge\/([0-9\._]+)/],["edge-ios",/EdgiOS\/([0-9\._]+)/],["yandexbrowser",/YaBrowser\/([0-9\._]+)/],["kakaotalk",/KAKAOTALK\s([0-9\.]+)/],["samsung",/SamsungBrowser\/([0-9\.]+)/],["silk",/\bSilk\/([0-9._-]+)\b/],["miui",/MiuiBrowser\/([0-9\.]+)$/],["beaker",/BeakerBrowser\/([0-9\.]+)/],["edge-chromium",/EdgA?\/([0-9\.]+)/],["chromium-webview",/(?!Chrom.*OPR)wv\).*Chrom(?:e|ium)\/([0-9\.]+)(:?\s|$)/],["chrome",/(?!Chrom.*OPR)Chrom(?:e|ium)\/([0-9\.]+)(:?\s|$)/],["phantomjs",/PhantomJS\/([0-9\.]+)(:?\s|$)/],["crios",/CriOS\/([0-9\.]+)(:?\s|$)/],["firefox",/Firefox\/([0-9\.]+)(?:\s|$)/],["fxios",/FxiOS\/([0-9\.]+)/],["opera-mini",/Opera Mini.*Version\/([0-9\.]+)/],["opera",/Opera\/([0-9\.]+)(?:\s|$)/],["opera",/OPR\/([0-9\.]+)(:?\s|$)/],["pie",/^Microsoft Pocket Internet Explorer\/(\d+\.\d+)$/],["pie",/^Mozilla\/\d\.\d+\s\(compatible;\s(?:MSP?IE|MSInternet Explorer) (\d+\.\d+);.*Windows CE.*\)$/],["netfront",/^Mozilla\/\d\.\d+.*NetFront\/(\d.\d)/],["ie",/Trident\/7\.0.*rv\:([0-9\.]+).*\).*Gecko$/],["ie",/MSIE\s([0-9\.]+);.*Trident\/[4-7].0/],["ie",/MSIE\s(7\.0)/],["bb10",/BB10;\sTouch.*Version\/([0-9\.]+)/],["android",/Android\s([0-9\.]+)/],["ios",/Version\/([0-9\._]+).*Mobile.*Safari.*/],["safari",/Version\/([0-9\._]+).*Safari/],["facebook",/FB[AS]V\/([0-9\.]+)/],["instagram",/Instagram\s([0-9\.]+)/],["ios-webview",/AppleWebKit\/([0-9\.]+).*Mobile/],["ios-webview",/AppleWebKit\/([0-9\.]+).*Gecko\)$/],["curl",/^curl\/([0-9\.]+)$/],["searchbot",/alexa|bot|crawl(er|ing)|facebookexternalhit|feedburner|google web preview|nagios|postrank|pingdom|slurp|spider|yahoo!|yandex/]],f=[["iOS",/iP(hone|od|ad)/],["Android OS",/Android/],["BlackBerry OS",/BlackBerry|BB10/],["Windows Mobile",/IEMobile/],["Amazon OS",/Kindle/],["Windows 3.11",/Win16/],["Windows 95",/(Windows 95)|(Win95)|(Windows_95)/],["Windows 98",/(Windows 98)|(Win98)/],["Windows 2000",/(Windows NT 5.0)|(Windows 2000)/],["Windows XP",/(Windows NT 5.1)|(Windows XP)/],["Windows Server 2003",/(Windows NT 5.2)/],["Windows Vista",/(Windows NT 6.0)/],["Windows 7",/(Windows NT 6.1)/],["Windows 8",/(Windows NT 6.2)/],["Windows 8.1",/(Windows NT 6.3)/],["Windows 10",/(Windows NT 10.0)/],["Windows ME",/Windows ME/],["Windows CE",/Windows CE|WinCE|Microsoft Pocket Internet Explorer/],["Open BSD",/OpenBSD/],["Sun OS",/SunOS/],["Chrome OS",/CrOS/],["Linux",/(Linux)|(X11)/],["Mac OS",/(Mac_PowerPC)|(Macintosh)/],["QNX",/QNX/],["BeOS",/BeOS/],["OS/2",/OS\/2/]];function h(e){return""!==e&&d.reduce((function(t,r){var n=r[0],s=r[1];if(t)return t;var i=s.exec(e);return!!i&&[n,i]}),!1)}function p(e){var t=h(e);if(!t)return null;var r=t[0],i=t[1];if("searchbot"===r)return new a;var u=i[1]&&i[1].split(".").join("_").split("_").slice(0,3);u?u.length<l&&(u=n(n([],u,!0),function(e){for(var t=[],r=0;r<e;r++)t.push("0");return t}(l-u.length),!0)):u=[];var d=u.join("."),f=m(e),p=c.exec(e);return p&&p[1]?new o(r,d,f,p[1]):new s(r,d,f)}function m(e){for(var t=0,r=f.length;t<r;t++){var n=f[t],s=n[0];if(n[1].exec(e))return s}return null}function g(){return"undefined"!=typeof process&&process.version?new i(process.version.slice(1)):null}r.detect=function(e){return e?p(e):"undefined"==typeof document&&"undefined"!=typeof navigator&&"ReactNative"===navigator.product?new u:"undefined"!=typeof navigator?p(navigator.userAgent):g()},r.browserName=function(e){var t=h(e);return t?t[0]:null},r.parseUserAgent=p,r.detectOS=m,r.getNodeVersion=g}}},{package:"@metamask/providers>detect-browser",file:"../../node_modules/detect-browser/index.js"}],[91,{once:127},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){var n=e("once"),s=function(){},i=function(e,t,r){if("function"==typeof t)return i(e,null,t);t||(t={}),r=n(r||s);var o=e._writableState,a=e._readableState,u=t.readable||!1!==t.readable&&e.readable,c=t.writable||!1!==t.writable&&e.writable,l=!1,d=function(){e.writable||f()},f=function(){c=!1,u||r.call(e)},h=function(){u=!1,c||r.call(e)},p=function(t){r.call(e,t?new Error("exited with error code: "+t):null)},m=function(t){r.call(e,t)},g=function(){process.nextTick(b)},b=function(){if(!l)return(!u||a&&a.ended&&!a.destroyed)&&(!c||o&&o.ended&&!o.destroyed)?void 0:r.call(e,new Error("premature close"))},w=function(){e.req.on("finish",f)};return!function(e){return e.setHeader&&"function"==typeof e.abort}(e)?c&&!o&&(e.on("end",d),e.on("close",d)):(e.on("complete",f),e.on("abort",g),e.req?w():e.on("request",w)),function(e){return e.stdio&&Array.isArray(e.stdio)&&3===e.stdio.length}(e)&&e.on("exit",p),e.on("end",h),e.on("finish",f),!1!==t.error&&e.on("error",m),e.on("close",g),function(){l=!0,e.removeListener("complete",f),e.removeListener("abort",g),e.removeListener("request",w),e.req&&e.req.removeListener("finish",f),e.removeListener("end",d),e.removeListener("close",d),e.removeListener("finish",f),e.removeListener("exit",p),e.removeListener("end",h),e.removeListener("error",m),e.removeListener("close",g)}};t.exports=i}}},{package:"@metamask/object-multiplex>end-of-stream",file:"../../node_modules/end-of-stream/index.js"}],[92,{"fast-safe-stringify":99},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){Object.defineProperty(r,"__esModule",{value:!0}),r.EthereumProviderError=r.EthereumRpcError=void 0;const n=e("fast-safe-stringify");class s extends Error{constructor(e,t,r){if(!Number.isInteger(e))throw new Error('"code" must be an integer.');if(!t||"string"!=typeof t)throw new Error('"message" must be a nonempty string.');super(t),this.code=e,r!==undefined&&(this.data=r)}serialize(){const e={code:this.code,message:this.message};return this.data!==undefined&&(e.data=this.data),this.stack&&(e.stack=this.stack),e}toString(){return n.default(this.serialize(),i,2)}}r.EthereumRpcError=s;function i(e,t){return"[Circular]"===t?undefined:t}r.EthereumProviderError=class extends s{constructor(e,t,r){if(!function(e){return Number.isInteger(e)&&e>=1e3&&e<=4999}(e))throw new Error('"code" must be an integer such that: 1000 <= code <= 4999');super(e,t,r)}}}}},{package:"eth-rpc-errors",file:"../../node_modules/eth-rpc-errors/dist/classes.js"}],[93,{},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){Object.defineProperty(r,"__esModule",{value:!0}),r.errorValues=r.errorCodes=void 0,r.errorCodes={rpc:{invalidInput:-32e3,resourceNotFound:-32001,resourceUnavailable:-32002,transactionRejected:-32003,methodNotSupported:-32004,limitExceeded:-32005,parse:-32700,invalidRequest:-32600,methodNotFound:-32601,invalidParams:-32602,internal:-32603},provider:{userRejectedRequest:4001,unauthorized:4100,unsupportedMethod:4200,disconnected:4900,chainDisconnected:4901}},r.errorValues={"-32700":{standard:"JSON RPC 2.0",message:"Invalid JSON was received by the server. An error occurred on the server while parsing the JSON text."},"-32600":{standard:"JSON RPC 2.0",message:"The JSON sent is not a valid Request object."},"-32601":{standard:"JSON RPC 2.0",message:"The method does not exist / is not available."},"-32602":{standard:"JSON RPC 2.0",message:"Invalid method parameter(s)."},"-32603":{standard:"JSON RPC 2.0",message:"Internal JSON-RPC error."},"-32000":{standard:"EIP-1474",message:"Invalid input."},"-32001":{standard:"EIP-1474",message:"Resource not found."},"-32002":{standard:"EIP-1474",message:"Resource unavailable."},"-32003":{standard:"EIP-1474",message:"Transaction rejected."},"-32004":{standard:"EIP-1474",message:"Method not supported."},"-32005":{standard:"EIP-1474",message:"Request limit exceeded."},4001:{standard:"EIP-1193",message:"User rejected the request."},4100:{standard:"EIP-1193",message:"The requested account and/or method has not been authorized by the user."},4200:{standard:"EIP-1193",message:"The requested method is not supported by this Ethereum provider."},4900:{standard:"EIP-1193",message:"The provider is disconnected from all chains."},4901:{standard:"EIP-1193",message:"The provider is disconnected from the specified chain."}}}}},{package:"eth-rpc-errors",file:"../../node_modules/eth-rpc-errors/dist/error-constants.js"}],[94,{"./classes":92,"./error-constants":93,"./utils":96},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){Object.defineProperty(r,"__esModule",{value:!0}),r.ethErrors=void 0;const n=e("./classes"),s=e("./utils"),i=e("./error-constants");function o(e,t){const[r,i]=u(t);return new n.EthereumRpcError(e,r||s.getMessageFromCode(e),i)}function a(e,t){const[r,i]=u(t);return new n.EthereumProviderError(e,r||s.getMessageFromCode(e),i)}function u(e){if(e){if("string"==typeof e)return[e];if("object"==typeof e&&!Array.isArray(e)){const{message:t,data:r}=e;if(t&&"string"!=typeof t)throw new Error("Must specify string message.");return[t||undefined,r]}}return[]}r.ethErrors={rpc:{parse:e=>o(i.errorCodes.rpc.parse,e),invalidRequest:e=>o(i.errorCodes.rpc.invalidRequest,e),invalidParams:e=>o(i.errorCodes.rpc.invalidParams,e),methodNotFound:e=>o(i.errorCodes.rpc.methodNotFound,e),internal:e=>o(i.errorCodes.rpc.internal,e),server:e=>{if(!e||"object"!=typeof e||Array.isArray(e))throw new Error("Ethereum RPC Server errors must provide single object argument.");const{code:t}=e;if(!Number.isInteger(t)||t>-32005||t<-32099)throw new Error('"code" must be an integer such that: -32099 <= code <= -32005');return o(t,e)},invalidInput:e=>o(i.errorCodes.rpc.invalidInput,e),resourceNotFound:e=>o(i.errorCodes.rpc.resourceNotFound,e),resourceUnavailable:e=>o(i.errorCodes.rpc.resourceUnavailable,e),transactionRejected:e=>o(i.errorCodes.rpc.transactionRejected,e),methodNotSupported:e=>o(i.errorCodes.rpc.methodNotSupported,e),limitExceeded:e=>o(i.errorCodes.rpc.limitExceeded,e)},provider:{userRejectedRequest:e=>a(i.errorCodes.provider.userRejectedRequest,e),unauthorized:e=>a(i.errorCodes.provider.unauthorized,e),unsupportedMethod:e=>a(i.errorCodes.provider.unsupportedMethod,e),disconnected:e=>a(i.errorCodes.provider.disconnected,e),chainDisconnected:e=>a(i.errorCodes.provider.chainDisconnected,e),custom:e=>{if(!e||"object"!=typeof e||Array.isArray(e))throw new Error("Ethereum Provider custom errors must provide single object argument.");const{code:t,message:r,data:s}=e;if(!r||"string"!=typeof r)throw new Error('"message" must be a nonempty string');return new n.EthereumProviderError(t,r,s)}}}}}},{package:"eth-rpc-errors",file:"../../node_modules/eth-rpc-errors/dist/errors.js"}],[95,{"./classes":92,"./error-constants":93,"./errors":94,"./utils":96},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){Object.defineProperty(r,"__esModule",{value:!0}),r.getMessageFromCode=r.serializeError=r.EthereumProviderError=r.EthereumRpcError=r.ethErrors=r.errorCodes=void 0;const n=e("./classes");Object.defineProperty(r,"EthereumRpcError",{enumerable:!0,get:function(){return n.EthereumRpcError}}),Object.defineProperty(r,"EthereumProviderError",{enumerable:!0,get:function(){return n.EthereumProviderError}});const s=e("./utils");Object.defineProperty(r,"serializeError",{enumerable:!0,get:function(){return s.serializeError}}),Object.defineProperty(r,"getMessageFromCode",{enumerable:!0,get:function(){return s.getMessageFromCode}});const i=e("./errors");Object.defineProperty(r,"ethErrors",{enumerable:!0,get:function(){return i.ethErrors}});const o=e("./error-constants");Object.defineProperty(r,"errorCodes",{enumerable:!0,get:function(){return o.errorCodes}})}}},{package:"eth-rpc-errors",file:"../../node_modules/eth-rpc-errors/dist/index.js"}],[96,{"./classes":92,"./error-constants":93},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){Object.defineProperty(r,"__esModule",{value:!0}),r.serializeError=r.isValidCode=r.getMessageFromCode=r.JSON_RPC_SERVER_ERROR_MESSAGE=void 0;const n=e("./error-constants"),s=e("./classes"),i=n.errorCodes.rpc.internal,o="Unspecified error message. This is a bug, please report it.",a={code:i,message:u(i)};function u(e,t=o){if(Number.isInteger(e)){const t=e.toString();if(f(n.errorValues,t))return n.errorValues[t].message;if(l(e))return r.JSON_RPC_SERVER_ERROR_MESSAGE}return t}function c(e){if(!Number.isInteger(e))return!1;const t=e.toString();return!!n.errorValues[t]||!!l(e)}function l(e){return e>=-32099&&e<=-32e3}function d(e){return e&&"object"==typeof e&&!Array.isArray(e)?Object.assign({},e):e}function f(e,t){return Object.prototype.hasOwnProperty.call(e,t)}r.JSON_RPC_SERVER_ERROR_MESSAGE="Unspecified server error.",r.getMessageFromCode=u,r.isValidCode=c,r.serializeError=function(e,{fallbackError:t=a,shouldIncludeStack:r=!1}={}){var n,i;if(!t||!Number.isInteger(t.code)||"string"!=typeof t.message)throw new Error("Must provide fallback error with integer number code and string message.");if(e instanceof s.EthereumRpcError)return e.serialize();const o={};if(e&&"object"==typeof e&&!Array.isArray(e)&&f(e,"code")&&c(e.code)){const t=e;o.code=t.code,t.message&&"string"==typeof t.message?(o.message=t.message,f(t,"data")&&(o.data=t.data)):(o.message=u(o.code),o.data={originalError:d(e)})}else{o.code=t.code;const r=null===(n=e)||void 0===n?void 0:n.message;o.message=r&&"string"==typeof r?r:t.message,o.data={originalError:d(e)}}const l=null===(i=e)||void 0===i?void 0:i.stack;return r&&e&&l&&"string"==typeof l&&(o.stack=l),o}}}},{package:"eth-rpc-errors",file:"../../node_modules/eth-rpc-errors/dist/utils.js"}],[97,{buffer:"buffer",stream:"stream"},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){(function(r){(function(){const n=e("stream");t.exports=class extends n.Duplex{constructor(e){super({objectMode:!0}),this._port=e,this._port.onMessage.addListener((e=>this._onMessage(e))),this._port.onDisconnect.addListener((()=>this._onDisconnect()))}_onMessage(e){if(r.isBuffer(e)){const t=r.from(e);this.push(t)}else this.push(e)}_onDisconnect(){this.destroy()}_read(){return undefined}_write(e,t,n){try{if(r.isBuffer(e)){const t=e.toJSON();t._isBuffer=!0,this._port.postMessage(t)}else this._port.postMessage(e)}catch(e){return n(new Error("PortDuplexStream - disconnected"))}return n()}}}).call(this)}).call(this,e("buffer").Buffer)}}},{package:"@metamask/providers>extension-port-stream",file:"../../node_modules/extension-port-stream/dist/index.js"}],[98,{},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){t.exports=function e(t,r){if(t===r)return!0;if(t&&r&&"object"==typeof t&&"object"==typeof r){if(t.constructor!==r.constructor)return!1;var n,s,i;if(Array.isArray(t)){if((n=t.length)!=r.length)return!1;for(s=n;0!=s--;)if(!e(t[s],r[s]))return!1;return!0}if(t.constructor===RegExp)return t.source===r.source&&t.flags===r.flags;if(t.valueOf!==Object.prototype.valueOf)return t.valueOf()===r.valueOf();if(t.toString!==Object.prototype.toString)return t.toString()===r.toString();if((n=(i=Object.keys(t)).length)!==Object.keys(r).length)return!1;for(s=n;0!=s--;)if(!Object.prototype.hasOwnProperty.call(r,i[s]))return!1;for(s=n;0!=s--;){var o=i[s];if(!e(t[o],r[o]))return!1}return!0}return t!=t&&r!=r}}}},{package:"eslint>fast-deep-equal",file:"../../node_modules/fast-deep-equal/index.js"}],[99,{},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){t.exports=u,u.default=u,u.stable=f,u.stableStringify=f;var n="[...]",s="[Circular]",i=[],o=[];function a(){return{depthLimit:Number.MAX_SAFE_INTEGER,edgesLimit:Number.MAX_SAFE_INTEGER}}function u(e,t,r,n){var s;void 0===n&&(n=a()),l(e,"",0,[],undefined,0,n);try{s=0===o.length?JSON.stringify(e,t,r):JSON.stringify(e,p(t),r)}catch(e){return JSON.stringify("[unable to serialize, circular reference is too complex to analyze]")}finally{for(;0!==i.length;){var u=i.pop();4===u.length?Object.defineProperty(u[0],u[1],u[3]):u[0][u[1]]=u[2]}}return s}function c(e,t,r,n){var s=Object.getOwnPropertyDescriptor(n,r);s.get!==undefined?s.configurable?(Object.defineProperty(n,r,{value:e}),i.push([n,r,t,s])):o.push([t,r,e]):(n[r]=e,i.push([n,r,t]))}function l(e,t,r,i,o,a,u){var d;if(a+=1,"object"==typeof e&&null!==e){for(d=0;d<i.length;d++)if(i[d]===e)return void c(s,e,t,o);if(void 0!==u.depthLimit&&a>u.depthLimit)return void c(n,e,t,o);if(void 0!==u.edgesLimit&&r+1>u.edgesLimit)return void c(n,e,t,o);if(i.push(e),Array.isArray(e))for(d=0;d<e.length;d++)l(e[d],d,d,i,e,a,u);else{var f=Object.keys(e);for(d=0;d<f.length;d++){var h=f[d];l(e[h],h,d,i,e,a,u)}}i.pop()}}function d(e,t){return e<t?-1:e>t?1:0}function f(e,t,r,n){void 0===n&&(n=a());var s,u=h(e,"",0,[],undefined,0,n)||e;try{s=0===o.length?JSON.stringify(u,t,r):JSON.stringify(u,p(t),r)}catch(e){return JSON.stringify("[unable to serialize, circular reference is too complex to analyze]")}finally{for(;0!==i.length;){var c=i.pop();4===c.length?Object.defineProperty(c[0],c[1],c[3]):c[0][c[1]]=c[2]}}return s}function h(e,t,r,o,a,u,l){var f;if(u+=1,"object"==typeof e&&null!==e){for(f=0;f<o.length;f++)if(o[f]===e)return void c(s,e,t,a);try{if("function"==typeof e.toJSON)return}catch(e){return}if(void 0!==l.depthLimit&&u>l.depthLimit)return void c(n,e,t,a);if(void 0!==l.edgesLimit&&r+1>l.edgesLimit)return void c(n,e,t,a);if(o.push(e),Array.isArray(e))for(f=0;f<e.length;f++)h(e[f],f,f,o,e,u,l);else{var p={},m=Object.keys(e).sort(d);for(f=0;f<m.length;f++){var g=m[f];h(e[g],g,f,o,e,u,l),p[g]=e[g]}if(void 0===a)return p;i.push([a,t,e]),a[t]=p}o.pop()}}function p(e){return e=void 0!==e?e:function(e,t){return t},function(t,r){if(o.length>0)for(var n=0;n<o.length;n++){var s=o[n];if(s[1]===t&&s[0]===r){r=s[2],o.splice(n,1);break}}return e.call(this,t,r)}}}}},{package:"eth-rpc-errors>fast-safe-stringify",file:"../../node_modules/fast-safe-stringify/index.js"}],[100,{},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){t.exports=(e,t=process.argv)=>{const r=e.startsWith("-")?"":1===e.length?"-":"--",n=t.indexOf(r+e),s=t.indexOf("--");return-1!==n&&(-1===s||n<s)}}}},{package:"istanbul-lib-report>supports-color>has-flag",file:"../../node_modules/has-flag/index.js"}],[101,{"./inherits_browser.js":102,util:"util"},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){try{var n=e("util");if("function"!=typeof n.inherits)throw"";t.exports=n.inherits}catch(r){t.exports=e("./inherits_browser.js")}}}},{package:"browserify>inherits",file:"../../node_modules/inherits/inherits.js"}],[102,{},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){"function"==typeof Object.create?t.exports=function(e,t){t&&(e.super_=t,e.prototype=Object.create(t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}))}:t.exports=function(e,t){if(t){e.super_=t;var r=function(){};r.prototype=t.prototype,e.prototype=new r,e.prototype.constructor=e}}}}},{package:"browserify>inherits",file:"../../node_modules/inherits/inherits_browser.js"}],[103,{},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){function n(e){return!!e.constructor&&"function"==typeof e.constructor.isBuffer&&e.constructor.isBuffer(e)}
/*!
 * Determine if an object is a Buffer
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */
t.exports=function(e){return null!=e&&(n(e)||function(e){return"function"==typeof e.readFloatLE&&"function"==typeof e.slice&&n(e.slice(0,0))}(e)||!!e._isBuffer)}}}},{package:"browserify>insert-module-globals>is-buffer",file:"../../node_modules/is-buffer/index.js"}],[104,{},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){const n=e=>null!==e&&"object"==typeof e&&"function"==typeof e.pipe;n.writable=e=>n(e)&&!1!==e.writable&&"function"==typeof e._write&&"object"==typeof e._writableState,n.readable=e=>n(e)&&!1!==e.readable&&"function"==typeof e._read&&"object"==typeof e._readableState,n.duplex=e=>n.writable(e)&&n.readable(e),n.transform=e=>n.duplex(e)&&"function"==typeof e._transform&&"object"==typeof e._transformState,t.exports=n}}},{package:"@metamask/providers>is-stream",file:"../../node_modules/is-stream/index.js"}],[105,{"@metamask/safe-event-emitter":59,"eth-rpc-errors":95},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){var n=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(r,"__esModule",{value:!0}),r.JsonRpcEngine=void 0;const s=n(e("@metamask/safe-event-emitter")),i=e("eth-rpc-errors");class o extends s.default{constructor(){super(),this._middleware=[]}push(e){this._middleware.push(e)}handle(e,t){if(t&&"function"!=typeof t)throw new Error('"callback" must be a function if provided.');return Array.isArray(e)?t?this._handleBatch(e,t):this._handleBatch(e):t?this._handle(e,t):this._promiseHandle(e)}asMiddleware(){return async(e,t,r,n)=>{try{const[s,i,a]=await o._runAllMiddleware(e,t,this._middleware);return i?(await o._runReturnHandlers(a),n(s)):r((async e=>{try{await o._runReturnHandlers(a)}catch(t){return e(t)}return e()}))}catch(e){return n(e)}}}async _handleBatch(e,t){try{const r=await Promise.all(e.map(this._promiseHandle.bind(this)));return t?t(null,r):r}catch(e){if(t)return t(e);throw e}}_promiseHandle(e){return new Promise((t=>{this._handle(e,((e,r)=>{t(r)}))}))}async _handle(e,t){if(!e||Array.isArray(e)||"object"!=typeof e){const r=new i.EthereumRpcError(i.errorCodes.rpc.invalidRequest,"Requests must be plain objects. Received: "+typeof e,{request:e});return t(r,{id:undefined,jsonrpc:"2.0",error:r})}if("string"!=typeof e.method){const r=new i.EthereumRpcError(i.errorCodes.rpc.invalidRequest,"Must specify a string method. Received: "+typeof e.method,{request:e});return t(r,{id:e.id,jsonrpc:"2.0",error:r})}const r=Object.assign({},e),n={id:r.id,jsonrpc:r.jsonrpc};let s=null;try{await this._processRequest(r,n)}catch(e){s=e}return s&&(delete n.result,n.error||(n.error=i.serializeError(s))),t(s,n)}async _processRequest(e,t){const[r,n,s]=await o._runAllMiddleware(e,t,this._middleware);if(o._checkForCompletion(e,t,n),await o._runReturnHandlers(s),r)throw r}static async _runAllMiddleware(e,t,r){const n=[];let s=null,i=!1;for(const a of r)if([s,i]=await o._runMiddleware(e,t,a,n),i)break;return[s,i,n.reverse()]}static _runMiddleware(e,t,r,n){return new Promise((s=>{const o=e=>{const r=e||t.error;r&&(t.error=i.serializeError(r)),s([r,!0])},u=r=>{t.error?o(t.error):(r&&("function"!=typeof r&&o(new i.EthereumRpcError(i.errorCodes.rpc.internal,`JsonRpcEngine: "next" return handlers must be functions. Received "${typeof r}" for request:\n${a(e)}`,{request:e})),n.push(r)),s([null,!1]))};try{r(e,t,u,o)}catch(e){o(e)}}))}static async _runReturnHandlers(e){for(const t of e)await new Promise(((e,r)=>{t((t=>t?r(t):e()))}))}static _checkForCompletion(e,t,r){if(!("result"in t)&&!("error"in t))throw new i.EthereumRpcError(i.errorCodes.rpc.internal,`JsonRpcEngine: Response has no error or result for request:\n${a(e)}`,{request:e});if(!r)throw new i.EthereumRpcError(i.errorCodes.rpc.internal,`JsonRpcEngine: Nothing ended request:\n${a(e)}`,{request:e})}}function a(e){return JSON.stringify(e,null,2)}r.JsonRpcEngine=o}}},{package:"json-rpc-engine",file:"../../node_modules/json-rpc-engine/dist/JsonRpcEngine.js"}],[106,{},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){Object.defineProperty(r,"__esModule",{value:!0}),r.createAsyncMiddleware=void 0,r.createAsyncMiddleware=function(e){return async(t,r,n,s)=>{let i;const o=new Promise((e=>{i=e}));let a=null,u=!1;const c=async()=>{u=!0,n((e=>{a=e,i()})),await o};try{await e(t,r,c),u?(await o,a(null)):s(null)}catch(e){a?a(e):s(e)}}}}}},{package:"json-rpc-engine",file:"../../node_modules/json-rpc-engine/dist/createAsyncMiddleware.js"}],[107,{},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){Object.defineProperty(r,"__esModule",{value:!0}),r.createScaffoldMiddleware=void 0,r.createScaffoldMiddleware=function(e){return(t,r,n,s)=>{const i=e[t.method];return i===undefined?n():"function"==typeof i?i(t,r,n,s):(r.result=i,s())}}}}},{package:"json-rpc-engine",file:"../../node_modules/json-rpc-engine/dist/createScaffoldMiddleware.js"}],[108,{},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){Object.defineProperty(r,"__esModule",{value:!0}),r.getUniqueId=void 0;const n=4294967295;let s=Math.floor(Math.random()*n);r.getUniqueId=function(){return s=(s+1)%n,s}}}},{package:"json-rpc-engine",file:"../../node_modules/json-rpc-engine/dist/getUniqueId.js"}],[109,{"./getUniqueId":108},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){Object.defineProperty(r,"__esModule",{value:!0}),r.createIdRemapMiddleware=void 0;const n=e("./getUniqueId");r.createIdRemapMiddleware=function(){return(e,t,r,s)=>{const i=e.id,o=n.getUniqueId();e.id=o,t.id=o,r((r=>{e.id=i,t.id=i,r()}))}}}}},{package:"json-rpc-engine",file:"../../node_modules/json-rpc-engine/dist/idRemapMiddleware.js"}],[110,{"./JsonRpcEngine":105,"./createAsyncMiddleware":106,"./createScaffoldMiddleware":107,"./getUniqueId":108,"./idRemapMiddleware":109,"./mergeMiddleware":111},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){var n=this&&this.__createBinding||(Object.create?function(e,t,r,n){n===undefined&&(n=r),Object.defineProperty(e,n,{enumerable:!0,get:function(){return t[r]}})}:function(e,t,r,n){n===undefined&&(n=r),e[n]=t[r]}),s=this&&this.__exportStar||function(e,t){for(var r in e)"default"===r||Object.prototype.hasOwnProperty.call(t,r)||n(t,e,r)};Object.defineProperty(r,"__esModule",{value:!0}),s(e("./idRemapMiddleware"),r),s(e("./createAsyncMiddleware"),r),s(e("./createScaffoldMiddleware"),r),s(e("./getUniqueId"),r),s(e("./JsonRpcEngine"),r),s(e("./mergeMiddleware"),r)}}},{package:"json-rpc-engine",file:"../../node_modules/json-rpc-engine/dist/index.js"}],[111,{"./JsonRpcEngine":105},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){Object.defineProperty(r,"__esModule",{value:!0}),r.mergeMiddleware=void 0;const n=e("./JsonRpcEngine");r.mergeMiddleware=function(e){const t=new n.JsonRpcEngine;return e.forEach((e=>t.push(e))),t.asMiddleware()}}}},{package:"json-rpc-engine",file:"../../node_modules/json-rpc-engine/dist/mergeMiddleware.js"}],[112,{"readable-stream":124},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){Object.defineProperty(r,"__esModule",{value:!0});const n=e("readable-stream");r.default=function(e){if(!e||!e.engine)throw new Error("Missing engine parameter!");const{engine:t}=e,r=new n.Duplex({objectMode:!0,read:()=>undefined,write:function(e,n,s){t.handle(e,((e,t)=>{r.push(t)})),s()}});return t.on&&t.on("notification",(e=>{r.push(e)})),r}}}},{package:"@metamask/providers>json-rpc-middleware-stream",file:"../../node_modules/json-rpc-middleware-stream/dist/createEngineStream.js"}],[113,{"@metamask/safe-event-emitter":59,"readable-stream":124},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){var n=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(r,"__esModule",{value:!0});const s=n(e("@metamask/safe-event-emitter")),i=e("readable-stream");r.default=function(e={}){const t={},r=new i.Duplex({objectMode:!0,read:()=>undefined,write:function(r,s,i){let a=null;try{!r.id?function(r){(null==e?void 0:e.retryOnMessage)&&r.method===e.retryOnMessage&&Object.values(t).forEach((({req:e,retryCount:r=0})=>{if(e.id){if(r>=3)throw new Error(`StreamMiddleware - Retry limit exceeded for request id "${e.id}"`);t[e.id].retryCount=r+1,o(e)}}));n.emit("notification",r)}(r):function(e){const r=t[e.id];if(!r)return void console.warn(`StreamMiddleware - Unknown response id "${e.id}"`);delete t[e.id],Object.assign(r.res,e),setTimeout(r.end)}(r)}catch(e){a=e}i(a)}}),n=new s.default;return{events:n,middleware:(e,r,n,s)=>{o(e),t[e.id]={req:e,res:r,next:n,end:s}},stream:r};function o(e){r.push(e)}}}}},{package:"@metamask/providers>json-rpc-middleware-stream",file:"../../node_modules/json-rpc-middleware-stream/dist/createStreamMiddleware.js"}],[114,{"./createEngineStream":112,"./createStreamMiddleware":113},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){var n=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(r,"__esModule",{value:!0}),r.createStreamMiddleware=r.createEngineStream=void 0;const s=n(e("./createEngineStream"));r.createEngineStream=s.default;const i=n(e("./createStreamMiddleware"));r.createStreamMiddleware=i.default}}},{package:"@metamask/providers>json-rpc-middleware-stream",file:"../../node_modules/json-rpc-middleware-stream/dist/index.js"}],[115,{},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){var n={}.toString;t.exports=Array.isArray||function(e){return"[object Array]"==n.call(e)}}}},{package:"@metamask/providers>json-rpc-middleware-stream>readable-stream>isarray",file:"../../node_modules/json-rpc-middleware-stream/node_modules/isarray/index.js"}],[116,{"./_stream_readable":118,"./_stream_writable":120,"core-util-is":84,inherits:101,"process-nextick-args":128},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){var n=e("process-nextick-args"),s=Object.keys||function(e){var t=[];for(var r in e)t.push(r);return t};t.exports=d;var i=Object.create(e("core-util-is"));i.inherits=e("inherits");var o=e("./_stream_readable"),a=e("./_stream_writable");i.inherits(d,o);for(var u=s(a.prototype),c=0;c<u.length;c++){var l=u[c];d.prototype[l]||(d.prototype[l]=a.prototype[l])}function d(e){if(!(this instanceof d))return new d(e);o.call(this,e),a.call(this,e),e&&!1===e.readable&&(this.readable=!1),e&&!1===e.writable&&(this.writable=!1),this.allowHalfOpen=!0,e&&!1===e.allowHalfOpen&&(this.allowHalfOpen=!1),this.once("end",f)}function f(){this.allowHalfOpen||this._writableState.ended||n.nextTick(h,this)}function h(e){e.end()}Object.defineProperty(d.prototype,"writableHighWaterMark",{enumerable:!1,get:function(){return this._writableState.highWaterMark}}),Object.defineProperty(d.prototype,"destroyed",{get:function(){return this._readableState!==undefined&&this._writableState!==undefined&&(this._readableState.destroyed&&this._writableState.destroyed)},set:function(e){this._readableState!==undefined&&this._writableState!==undefined&&(this._readableState.destroyed=e,this._writableState.destroyed=e)}}),d.prototype._destroy=function(e,t){this.push(null),this.end(),n.nextTick(t,e)}}}},{package:"@metamask/providers>json-rpc-middleware-stream>readable-stream",file:"../../node_modules/json-rpc-middleware-stream/node_modules/readable-stream/lib/_stream_duplex.js"}],[117,{"./_stream_transform":119,"core-util-is":84,inherits:101},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){t.exports=i;var n=e("./_stream_transform"),s=Object.create(e("core-util-is"));function i(e){if(!(this instanceof i))return new i(e);n.call(this,e)}s.inherits=e("inherits"),s.inherits(i,n),i.prototype._transform=function(e,t,r){r(null,e)}}}},{package:"@metamask/providers>json-rpc-middleware-stream>readable-stream",file:"../../node_modules/json-rpc-middleware-stream/node_modules/readable-stream/lib/_stream_passthrough.js"}],[118,{"./_stream_duplex":116,"./internal/streams/BufferList":121,"./internal/streams/destroy":122,"./internal/streams/stream":123,"core-util-is":84,events:"events",inherits:101,isarray:115,"process-nextick-args":128,"safe-buffer":125,"string_decoder/":126,util:"util"},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){var n=e("process-nextick-args");t.exports=w;var s,i=e("isarray");w.ReadableState=b;e("events").EventEmitter;var o=function(e,t){return e.listeners(t).length},a=e("./internal/streams/stream"),u=e("safe-buffer").Buffer,c=global.Uint8Array||function(){};var l=Object.create(e("core-util-is"));l.inherits=e("inherits");var d=e("util"),f=void 0;f=d&&d.debuglog?d.debuglog("stream"):function(){};var h,p=e("./internal/streams/BufferList"),m=e("./internal/streams/destroy");l.inherits(w,a);var g=["error","close","destroy","pause","resume"];function b(t,r){t=t||{};var n=r instanceof(s=s||e("./_stream_duplex"));this.objectMode=!!t.objectMode,n&&(this.objectMode=this.objectMode||!!t.readableObjectMode);var i=t.highWaterMark,o=t.readableHighWaterMark,a=this.objectMode?16:16384;this.highWaterMark=i||0===i?i:n&&(o||0===o)?o:a,this.highWaterMark=Math.floor(this.highWaterMark),this.buffer=new p,this.length=0,this.pipes=null,this.pipesCount=0,this.flowing=null,this.ended=!1,this.endEmitted=!1,this.reading=!1,this.sync=!0,this.needReadable=!1,this.emittedReadable=!1,this.readableListening=!1,this.resumeScheduled=!1,this.destroyed=!1,this.defaultEncoding=t.defaultEncoding||"utf8",this.awaitDrain=0,this.readingMore=!1,this.decoder=null,this.encoding=null,t.encoding&&(h||(h=e("string_decoder/").StringDecoder),this.decoder=new h(t.encoding),this.encoding=t.encoding)}function w(t){if(s=s||e("./_stream_duplex"),!(this instanceof w))return new w(t);this._readableState=new b(t,this),this.readable=!0,t&&("function"==typeof t.read&&(this._read=t.read),"function"==typeof t.destroy&&(this._destroy=t.destroy)),a.call(this)}function y(e,t,r,n,s){var i,o=e._readableState;null===t?(o.reading=!1,function(e,t){if(t.ended)return;if(t.decoder){var r=t.decoder.end();r&&r.length&&(t.buffer.push(r),t.length+=t.objectMode?1:r.length)}t.ended=!0,E(e)}(e,o)):(s||(i=function(e,t){var r;n=t,u.isBuffer(n)||n instanceof c||"string"==typeof t||t===undefined||e.objectMode||(r=new TypeError("Invalid non-string/buffer chunk"));var n;return r}(o,t)),i?e.emit("error",i):o.objectMode||t&&t.length>0?("string"==typeof t||o.objectMode||Object.getPrototypeOf(t)===u.prototype||(t=function(e){return u.from(e)}(t)),n?o.endEmitted?e.emit("error",new Error("stream.unshift() after end event")):v(e,o,t,!0):o.ended?e.emit("error",new Error("stream.push() after EOF")):(o.reading=!1,o.decoder&&!r?(t=o.decoder.write(t),o.objectMode||0!==t.length?v(e,o,t,!1):T(e,o)):v(e,o,t,!1))):n||(o.reading=!1));return function(e){return!e.ended&&(e.needReadable||e.length<e.highWaterMark||0===e.length)}(o)}function v(e,t,r,n){t.flowing&&0===t.length&&!t.sync?(e.emit("data",r),e.read(0)):(t.length+=t.objectMode?1:r.length,n?t.buffer.unshift(r):t.buffer.push(r),t.needReadable&&E(e)),T(e,t)}Object.defineProperty(w.prototype,"destroyed",{get:function(){return this._readableState!==undefined&&this._readableState.destroyed},set:function(e){this._readableState&&(this._readableState.destroyed=e)}}),w.prototype.destroy=m.destroy,w.prototype._undestroy=m.undestroy,w.prototype._destroy=function(e,t){this.push(null),t(e)},w.prototype.push=function(e,t){var r,n=this._readableState;return n.objectMode?r=!0:"string"==typeof e&&((t=t||n.defaultEncoding)!==n.encoding&&(e=u.from(e,t),t=""),r=!0),y(this,e,t,!1,r)},w.prototype.unshift=function(e){return y(this,e,null,!0,!1)},w.prototype.isPaused=function(){return!1===this._readableState.flowing},w.prototype.setEncoding=function(t){return h||(h=e("string_decoder/").StringDecoder),this._readableState.decoder=new h(t),this._readableState.encoding=t,this};var _=8388608;function S(e,t){return e<=0||0===t.length&&t.ended?0:t.objectMode?1:e!=e?t.flowing&&t.length?t.buffer.head.data.length:t.length:(e>t.highWaterMark&&(t.highWaterMark=function(e){return e>=_?e=_:(e--,e|=e>>>1,e|=e>>>2,e|=e>>>4,e|=e>>>8,e|=e>>>16,e++),e}(e)),e<=t.length?e:t.ended?t.length:(t.needReadable=!0,0))}function E(e){var t=e._readableState;t.needReadable=!1,t.emittedReadable||(f("emitReadable",t.flowing),t.emittedReadable=!0,t.sync?n.nextTick(k,e):k(e))}function k(e){f("emit readable"),e.emit("readable"),M(e)}function T(e,t){t.readingMore||(t.readingMore=!0,n.nextTick(j,e,t))}function j(e,t){for(var r=t.length;!t.reading&&!t.flowing&&!t.ended&&t.length<t.highWaterMark&&(f("maybeReadMore read 0"),e.read(0),r!==t.length);)r=t.length;t.readingMore=!1}function R(e){f("readable nexttick read 0"),e.read(0)}function x(e,t){t.reading||(f("resume read 0"),e.read(0)),t.resumeScheduled=!1,t.awaitDrain=0,e.emit("resume"),M(e),t.flowing&&!t.reading&&e.read(0)}function M(e){var t=e._readableState;for(f("flow",t.flowing);t.flowing&&null!==e.read(););}function O(e,t){return 0===t.length?null:(t.objectMode?r=t.buffer.shift():!e||e>=t.length?(r=t.decoder?t.buffer.join(""):1===t.buffer.length?t.buffer.head.data:t.buffer.concat(t.length),t.buffer.clear()):r=function(e,t,r){var n;e<t.head.data.length?(n=t.head.data.slice(0,e),t.head.data=t.head.data.slice(e)):n=e===t.head.data.length?t.shift():r?function(e,t){var r=t.head,n=1,s=r.data;e-=s.length;for(;r=r.next;){var i=r.data,o=e>i.length?i.length:e;if(o===i.length?s+=i:s+=i.slice(0,e),0===(e-=o)){o===i.length?(++n,r.next?t.head=r.next:t.head=t.tail=null):(t.head=r,r.data=i.slice(o));break}++n}return t.length-=n,s}(e,t):function(e,t){var r=u.allocUnsafe(e),n=t.head,s=1;n.data.copy(r),e-=n.data.length;for(;n=n.next;){var i=n.data,o=e>i.length?i.length:e;if(i.copy(r,r.length-e,0,o),0===(e-=o)){o===i.length?(++s,n.next?t.head=n.next:t.head=t.tail=null):(t.head=n,n.data=i.slice(o));break}++s}return t.length-=s,r}(e,t);return n}(e,t.buffer,t.decoder),r);var r}function P(e){var t=e._readableState;if(t.length>0)throw new Error('"endReadable()" called on non-empty stream');t.endEmitted||(t.ended=!0,n.nextTick(C,t,e))}function C(e,t){e.endEmitted||0!==e.length||(e.endEmitted=!0,t.readable=!1,t.emit("end"))}function I(e,t){for(var r=0,n=e.length;r<n;r++)if(e[r]===t)return r;return-1}w.prototype.read=function(e){f("read",e),e=parseInt(e,10);var t=this._readableState,r=e;if(0!==e&&(t.emittedReadable=!1),0===e&&t.needReadable&&(t.length>=t.highWaterMark||t.ended))return f("read: emitReadable",t.length,t.ended),0===t.length&&t.ended?P(this):E(this),null;if(0===(e=S(e,t))&&t.ended)return 0===t.length&&P(this),null;var n,s=t.needReadable;return f("need readable",s),(0===t.length||t.length-e<t.highWaterMark)&&f("length less than watermark",s=!0),t.ended||t.reading?f("reading or ended",s=!1):s&&(f("do read"),t.reading=!0,t.sync=!0,0===t.length&&(t.needReadable=!0),this._read(t.highWaterMark),t.sync=!1,t.reading||(e=S(r,t))),null===(n=e>0?O(e,t):null)?(t.needReadable=!0,e=0):t.length-=e,0===t.length&&(t.ended||(t.needReadable=!0),r!==e&&t.ended&&P(this)),null!==n&&this.emit("data",n),n},w.prototype._read=function(e){this.emit("error",new Error("_read() is not implemented"))},w.prototype.pipe=function(e,t){var r=this,s=this._readableState;switch(s.pipesCount){case 0:s.pipes=e;break;case 1:s.pipes=[s.pipes,e];break;default:s.pipes.push(e)}s.pipesCount+=1,f("pipe count=%d opts=%j",s.pipesCount,t);var a=(!t||!1!==t.end)&&e!==process.stdout&&e!==process.stderr?c:w;function u(t,n){f("onunpipe"),t===r&&n&&!1===n.hasUnpiped&&(n.hasUnpiped=!0,f("cleanup"),e.removeListener("close",g),e.removeListener("finish",b),e.removeListener("drain",l),e.removeListener("error",m),e.removeListener("unpipe",u),r.removeListener("end",c),r.removeListener("end",w),r.removeListener("data",p),d=!0,!s.awaitDrain||e._writableState&&!e._writableState.needDrain||l())}function c(){f("onend"),e.end()}s.endEmitted?n.nextTick(a):r.once("end",a),e.on("unpipe",u);var l=function(e){return function(){var t=e._readableState;f("pipeOnDrain",t.awaitDrain),t.awaitDrain&&t.awaitDrain--,0===t.awaitDrain&&o(e,"data")&&(t.flowing=!0,M(e))}}(r);e.on("drain",l);var d=!1;var h=!1;function p(t){f("ondata"),h=!1,!1!==e.write(t)||h||((1===s.pipesCount&&s.pipes===e||s.pipesCount>1&&-1!==I(s.pipes,e))&&!d&&(f("false write response, pause",r._readableState.awaitDrain),r._readableState.awaitDrain++,h=!0),r.pause())}function m(t){f("onerror",t),w(),e.removeListener("error",m),0===o(e,"error")&&e.emit("error",t)}function g(){e.removeListener("finish",b),w()}function b(){f("onfinish"),e.removeListener("close",g),w()}function w(){f("unpipe"),r.unpipe(e)}return r.on("data",p),function(e,t,r){if("function"==typeof e.prependListener)return e.prependListener(t,r);e._events&&e._events[t]?i(e._events[t])?e._events[t].unshift(r):e._events[t]=[r,e._events[t]]:e.on(t,r)}(e,"error",m),e.once("close",g),e.once("finish",b),e.emit("pipe",r),s.flowing||(f("pipe resume"),r.resume()),e},w.prototype.unpipe=function(e){var t=this._readableState,r={hasUnpiped:!1};if(0===t.pipesCount)return this;if(1===t.pipesCount)return e&&e!==t.pipes||(e||(e=t.pipes),t.pipes=null,t.pipesCount=0,t.flowing=!1,e&&e.emit("unpipe",this,r)),this;if(!e){var n=t.pipes,s=t.pipesCount;t.pipes=null,t.pipesCount=0,t.flowing=!1;for(var i=0;i<s;i++)n[i].emit("unpipe",this,r);return this}var o=I(t.pipes,e);return-1===o||(t.pipes.splice(o,1),t.pipesCount-=1,1===t.pipesCount&&(t.pipes=t.pipes[0]),e.emit("unpipe",this,r)),this},w.prototype.on=function(e,t){var r=a.prototype.on.call(this,e,t);if("data"===e)!1!==this._readableState.flowing&&this.resume();else if("readable"===e){var s=this._readableState;s.endEmitted||s.readableListening||(s.readableListening=s.needReadable=!0,s.emittedReadable=!1,s.reading?s.length&&E(this):n.nextTick(R,this))}return r},w.prototype.addListener=w.prototype.on,w.prototype.resume=function(){var e=this._readableState;return e.flowing||(f("resume"),e.flowing=!0,function(e,t){t.resumeScheduled||(t.resumeScheduled=!0,n.nextTick(x,e,t))}(this,e)),this},w.prototype.pause=function(){return f("call pause flowing=%j",this._readableState.flowing),!1!==this._readableState.flowing&&(f("pause"),this._readableState.flowing=!1,this.emit("pause")),this},w.prototype.wrap=function(e){var t=this,r=this._readableState,n=!1;for(var s in e.on("end",(function(){if(f("wrapped end"),r.decoder&&!r.ended){var e=r.decoder.end();e&&e.length&&t.push(e)}t.push(null)})),e.on("data",(function(s){(f("wrapped data"),r.decoder&&(s=r.decoder.write(s)),!r.objectMode||null!==s&&s!==undefined)&&((r.objectMode||s&&s.length)&&(t.push(s)||(n=!0,e.pause())))})),e)this[s]===undefined&&"function"==typeof e[s]&&(this[s]=function(t){return function(){return e[t].apply(e,arguments)}}(s));for(var i=0;i<g.length;i++)e.on(g[i],this.emit.bind(this,g[i]));return this._read=function(t){f("wrapped _read",t),n&&(n=!1,e.resume())},this},Object.defineProperty(w.prototype,"readableHighWaterMark",{enumerable:!1,get:function(){return this._readableState.highWaterMark}}),w._fromList=O}}},{package:"@metamask/providers>json-rpc-middleware-stream>readable-stream",file:"../../node_modules/json-rpc-middleware-stream/node_modules/readable-stream/lib/_stream_readable.js"}],[119,{"./_stream_duplex":116,"core-util-is":84,inherits:101},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){t.exports=o;var n=e("./_stream_duplex"),s=Object.create(e("core-util-is"));function i(e,t){var r=this._transformState;r.transforming=!1;var n=r.writecb;if(!n)return this.emit("error",new Error("write callback called multiple times"));r.writechunk=null,r.writecb=null,null!=t&&this.push(t),n(e);var s=this._readableState;s.reading=!1,(s.needReadable||s.length<s.highWaterMark)&&this._read(s.highWaterMark)}function o(e){if(!(this instanceof o))return new o(e);n.call(this,e),this._transformState={afterTransform:i.bind(this),needTransform:!1,transforming:!1,writecb:null,writechunk:null,writeencoding:null},this._readableState.needReadable=!0,this._readableState.sync=!1,e&&("function"==typeof e.transform&&(this._transform=e.transform),"function"==typeof e.flush&&(this._flush=e.flush)),this.on("prefinish",a)}function a(){var e=this;"function"==typeof this._flush?this._flush((function(t,r){u(e,t,r)})):u(this,null,null)}function u(e,t,r){if(t)return e.emit("error",t);if(null!=r&&e.push(r),e._writableState.length)throw new Error("Calling transform done when ws.length != 0");if(e._transformState.transforming)throw new Error("Calling transform done when still transforming");return e.push(null)}s.inherits=e("inherits"),s.inherits(o,n),o.prototype.push=function(e,t){return this._transformState.needTransform=!1,n.prototype.push.call(this,e,t)},o.prototype._transform=function(e,t,r){throw new Error("_transform() is not implemented")},o.prototype._write=function(e,t,r){var n=this._transformState;if(n.writecb=r,n.writechunk=e,n.writeencoding=t,!n.transforming){var s=this._readableState;(n.needTransform||s.needReadable||s.length<s.highWaterMark)&&this._read(s.highWaterMark)}},o.prototype._read=function(e){var t=this._transformState;null!==t.writechunk&&t.writecb&&!t.transforming?(t.transforming=!0,this._transform(t.writechunk,t.writeencoding,t.afterTransform)):t.needTransform=!0},o.prototype._destroy=function(e,t){var r=this;n.prototype._destroy.call(this,e,(function(e){t(e),r.emit("close")}))}}}},{package:"@metamask/providers>json-rpc-middleware-stream>readable-stream",file:"../../node_modules/json-rpc-middleware-stream/node_modules/readable-stream/lib/_stream_transform.js"}],[120,{"./_stream_duplex":116,"./internal/streams/destroy":122,"./internal/streams/stream":123,"core-util-is":84,inherits:101,"process-nextick-args":128,"safe-buffer":125,timers:"timers","util-deprecate":194},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){(function(r){(function(){var n=e("process-nextick-args");function s(e){var t=this;this.next=null,this.entry=null,this.finish=function(){!function(e,t,r){var n=e.entry;e.entry=null;for(;n;){var s=n.callback;t.pendingcb--,s(r),n=n.next}t.corkedRequestsFree?t.corkedRequestsFree.next=e:t.corkedRequestsFree=e}(t,e)}}t.exports=g;var i,o=!process.browser&&["v0.10","v0.9."].indexOf(process.version.slice(0,5))>-1?r:n.nextTick;g.WritableState=m;var a=Object.create(e("core-util-is"));a.inherits=e("inherits");var u={deprecate:e("util-deprecate")},c=e("./internal/streams/stream"),l=e("safe-buffer").Buffer,d=global.Uint8Array||function(){};var f,h=e("./internal/streams/destroy");function p(){}function m(t,r){i=i||e("./_stream_duplex"),t=t||{};var a=r instanceof i;this.objectMode=!!t.objectMode,a&&(this.objectMode=this.objectMode||!!t.writableObjectMode);var u=t.highWaterMark,c=t.writableHighWaterMark,l=this.objectMode?16:16384;this.highWaterMark=u||0===u?u:a&&(c||0===c)?c:l,this.highWaterMark=Math.floor(this.highWaterMark),this.finalCalled=!1,this.needDrain=!1,this.ending=!1,this.ended=!1,this.finished=!1,this.destroyed=!1;var d=!1===t.decodeStrings;this.decodeStrings=!d,this.defaultEncoding=t.defaultEncoding||"utf8",this.length=0,this.writing=!1,this.corked=0,this.sync=!0,this.bufferProcessing=!1,this.onwrite=function(e){!function(e,t){var r=e._writableState,s=r.sync,i=r.writecb;if(function(e){e.writing=!1,e.writecb=null,e.length-=e.writelen,e.writelen=0}(r),t)!function(e,t,r,s,i){--t.pendingcb,r?(n.nextTick(i,s),n.nextTick(S,e,t),e._writableState.errorEmitted=!0,e.emit("error",s)):(i(s),e._writableState.errorEmitted=!0,e.emit("error",s),S(e,t))}(e,r,s,t,i);else{var a=v(r);a||r.corked||r.bufferProcessing||!r.bufferedRequest||y(e,r),s?o(w,e,r,a,i):w(e,r,a,i)}}(r,e)},this.writecb=null,this.writelen=0,this.bufferedRequest=null,this.lastBufferedRequest=null,this.pendingcb=0,this.prefinished=!1,this.errorEmitted=!1,this.bufferedRequestCount=0,this.corkedRequestsFree=new s(this)}function g(t){if(i=i||e("./_stream_duplex"),!(f.call(g,this)||this instanceof i))return new g(t);this._writableState=new m(t,this),this.writable=!0,t&&("function"==typeof t.write&&(this._write=t.write),"function"==typeof t.writev&&(this._writev=t.writev),"function"==typeof t.destroy&&(this._destroy=t.destroy),"function"==typeof t.final&&(this._final=t.final)),c.call(this)}function b(e,t,r,n,s,i,o){t.writelen=n,t.writecb=o,t.writing=!0,t.sync=!0,r?e._writev(s,t.onwrite):e._write(s,i,t.onwrite),t.sync=!1}function w(e,t,r,n){r||function(e,t){0===t.length&&t.needDrain&&(t.needDrain=!1,e.emit("drain"))}(e,t),t.pendingcb--,n(),S(e,t)}function y(e,t){t.bufferProcessing=!0;var r=t.bufferedRequest;if(e._writev&&r&&r.next){var n=t.bufferedRequestCount,i=new Array(n),o=t.corkedRequestsFree;o.entry=r;for(var a=0,u=!0;r;)i[a]=r,r.isBuf||(u=!1),r=r.next,a+=1;i.allBuffers=u,b(e,t,!0,t.length,i,"",o.finish),t.pendingcb++,t.lastBufferedRequest=null,o.next?(t.corkedRequestsFree=o.next,o.next=null):t.corkedRequestsFree=new s(t),t.bufferedRequestCount=0}else{for(;r;){var c=r.chunk,l=r.encoding,d=r.callback;if(b(e,t,!1,t.objectMode?1:c.length,c,l,d),r=r.next,t.bufferedRequestCount--,t.writing)break}null===r&&(t.lastBufferedRequest=null)}t.bufferedRequest=r,t.bufferProcessing=!1}function v(e){return e.ending&&0===e.length&&null===e.bufferedRequest&&!e.finished&&!e.writing}function _(e,t){e._final((function(r){t.pendingcb--,r&&e.emit("error",r),t.prefinished=!0,e.emit("prefinish"),S(e,t)}))}function S(e,t){var r=v(t);return r&&(!function(e,t){t.prefinished||t.finalCalled||("function"==typeof e._final?(t.pendingcb++,t.finalCalled=!0,n.nextTick(_,e,t)):(t.prefinished=!0,e.emit("prefinish")))}(e,t),0===t.pendingcb&&(t.finished=!0,e.emit("finish"))),r}a.inherits(g,c),m.prototype.getBuffer=function(){for(var e=this.bufferedRequest,t=[];e;)t.push(e),e=e.next;return t},function(){try{Object.defineProperty(m.prototype,"buffer",{get:u.deprecate((function(){return this.getBuffer()}),"_writableState.buffer is deprecated. Use _writableState.getBuffer "+"instead.","DEP0003")})}catch(e){}}(),"function"==typeof Symbol&&Symbol.hasInstance&&"function"==typeof Function.prototype[Symbol.hasInstance]?(f=Function.prototype[Symbol.hasInstance],Object.defineProperty(g,Symbol.hasInstance,{value:function(e){return!!f.call(this,e)||this===g&&(e&&e._writableState instanceof m)}})):f=function(e){return e instanceof this},g.prototype.pipe=function(){this.emit("error",new Error("Cannot pipe, not readable"))},g.prototype.write=function(e,t,r){var s,i=this._writableState,o=!1,a=!i.objectMode&&(s=e,l.isBuffer(s)||s instanceof d);return a&&!l.isBuffer(e)&&(e=function(e){return l.from(e)}(e)),"function"==typeof t&&(r=t,t=null),a?t="buffer":t||(t=i.defaultEncoding),"function"!=typeof r&&(r=p),i.ended?function(e,t){var r=new Error("write after end");e.emit("error",r),n.nextTick(t,r)}(this,r):(a||function(e,t,r,s){var i=!0,o=!1;return null===r?o=new TypeError("May not write null values to stream"):"string"==typeof r||r===undefined||t.objectMode||(o=new TypeError("Invalid non-string/buffer chunk")),o&&(e.emit("error",o),n.nextTick(s,o),i=!1),i}(this,i,e,r))&&(i.pendingcb++,o=function(e,t,r,n,s,i){if(!r){var o=function(e,t,r){e.objectMode||!1===e.decodeStrings||"string"!=typeof t||(t=l.from(t,r));return t}(t,n,s);n!==o&&(r=!0,s="buffer",n=o)}var a=t.objectMode?1:n.length;t.length+=a;var u=t.length<t.highWaterMark;u||(t.needDrain=!0);if(t.writing||t.corked){var c=t.lastBufferedRequest;t.lastBufferedRequest={chunk:n,encoding:s,isBuf:r,callback:i,next:null},c?c.next=t.lastBufferedRequest:t.bufferedRequest=t.lastBufferedRequest,t.bufferedRequestCount+=1}else b(e,t,!1,a,n,s,i);return u}(this,i,a,e,t,r)),o},g.prototype.cork=function(){this._writableState.corked++},g.prototype.uncork=function(){var e=this._writableState;e.corked&&(e.corked--,e.writing||e.corked||e.finished||e.bufferProcessing||!e.bufferedRequest||y(this,e))},g.prototype.setDefaultEncoding=function(e){if("string"==typeof e&&(e=e.toLowerCase()),!(["hex","utf8","utf-8","ascii","binary","base64","ucs2","ucs-2","utf16le","utf-16le","raw"].indexOf((e+"").toLowerCase())>-1))throw new TypeError("Unknown encoding: "+e);return this._writableState.defaultEncoding=e,this},Object.defineProperty(g.prototype,"writableHighWaterMark",{enumerable:!1,get:function(){return this._writableState.highWaterMark}}),g.prototype._write=function(e,t,r){r(new Error("_write() is not implemented"))},g.prototype._writev=null,g.prototype.end=function(e,t,r){var s=this._writableState;"function"==typeof e?(r=e,e=null,t=null):"function"==typeof t&&(r=t,t=null),null!==e&&e!==undefined&&this.write(e,t),s.corked&&(s.corked=1,this.uncork()),s.ending||s.finished||function(e,t,r){t.ending=!0,S(e,t),r&&(t.finished?n.nextTick(r):e.once("finish",r));t.ended=!0,e.writable=!1}(this,s,r)},Object.defineProperty(g.prototype,"destroyed",{get:function(){return this._writableState!==undefined&&this._writableState.destroyed},set:function(e){this._writableState&&(this._writableState.destroyed=e)}}),g.prototype.destroy=h.destroy,g.prototype._undestroy=h.undestroy,g.prototype._destroy=function(e,t){this.end(),t(e)}}).call(this)}).call(this,e("timers").setImmediate)}}},{package:"@metamask/providers>json-rpc-middleware-stream>readable-stream",file:"../../node_modules/json-rpc-middleware-stream/node_modules/readable-stream/lib/_stream_writable.js"}],[121,{"safe-buffer":125,util:"util"},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){var n=e("safe-buffer").Buffer,s=e("util");t.exports=function(){function e(){!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,e),this.head=null,this.tail=null,this.length=0}return e.prototype.push=function(e){var t={data:e,next:null};this.length>0?this.tail.next=t:this.head=t,this.tail=t,++this.length},e.prototype.unshift=function(e){var t={data:e,next:this.head};0===this.length&&(this.tail=t),this.head=t,++this.length},e.prototype.shift=function(){if(0!==this.length){var e=this.head.data;return 1===this.length?this.head=this.tail=null:this.head=this.head.next,--this.length,e}},e.prototype.clear=function(){this.head=this.tail=null,this.length=0},e.prototype.join=function(e){if(0===this.length)return"";for(var t=this.head,r=""+t.data;t=t.next;)r+=e+t.data;return r},e.prototype.concat=function(e){if(0===this.length)return n.alloc(0);if(1===this.length)return this.head.data;for(var t,r,s,i=n.allocUnsafe(e>>>0),o=this.head,a=0;o;)t=o.data,r=i,s=a,t.copy(r,s),a+=o.data.length,o=o.next;return i},e}(),s&&s.inspect&&s.inspect.custom&&(t.exports.prototype[s.inspect.custom]=function(){var e=s.inspect({length:this.length});return this.constructor.name+" "+e})}}},{package:"@metamask/providers>json-rpc-middleware-stream>readable-stream",file:"../../node_modules/json-rpc-middleware-stream/node_modules/readable-stream/lib/internal/streams/BufferList.js"}],[122,{"process-nextick-args":128},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){var n=e("process-nextick-args");function s(e,t){e.emit("error",t)}t.exports={destroy:function(e,t){var r=this,i=this._readableState&&this._readableState.destroyed,o=this._writableState&&this._writableState.destroyed;return i||o?(t?t(e):!e||this._writableState&&this._writableState.errorEmitted||n.nextTick(s,this,e),this):(this._readableState&&(this._readableState.destroyed=!0),this._writableState&&(this._writableState.destroyed=!0),this._destroy(e||null,(function(e){!t&&e?(n.nextTick(s,r,e),r._writableState&&(r._writableState.errorEmitted=!0)):t&&t(e)})),this)},undestroy:function(){this._readableState&&(this._readableState.destroyed=!1,this._readableState.reading=!1,this._readableState.ended=!1,this._readableState.endEmitted=!1),this._writableState&&(this._writableState.destroyed=!1,this._writableState.ended=!1,this._writableState.ending=!1,this._writableState.finished=!1,this._writableState.errorEmitted=!1)}}}}},{package:"@metamask/providers>json-rpc-middleware-stream>readable-stream",file:"../../node_modules/json-rpc-middleware-stream/node_modules/readable-stream/lib/internal/streams/destroy.js"}],[123,{stream:"stream"},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){t.exports=e("stream")}}},{package:"@metamask/providers>json-rpc-middleware-stream>readable-stream",file:"../../node_modules/json-rpc-middleware-stream/node_modules/readable-stream/lib/internal/streams/stream.js"}],[124,{"./lib/_stream_duplex.js":116,"./lib/_stream_passthrough.js":117,"./lib/_stream_readable.js":118,"./lib/_stream_transform.js":119,"./lib/_stream_writable.js":120,stream:"stream"},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){var n=e("stream");"disable"===process.env.READABLE_STREAM&&n?(t.exports=n,(r=t.exports=n.Readable).Readable=n.Readable,r.Writable=n.Writable,r.Duplex=n.Duplex,r.Transform=n.Transform,r.PassThrough=n.PassThrough,r.Stream=n):((r=t.exports=e("./lib/_stream_readable.js")).Stream=n||r,r.Readable=r,r.Writable=e("./lib/_stream_writable.js"),r.Duplex=e("./lib/_stream_duplex.js"),r.Transform=e("./lib/_stream_transform.js"),r.PassThrough=e("./lib/_stream_passthrough.js"))}}},{package:"@metamask/providers>json-rpc-middleware-stream>readable-stream",file:"../../node_modules/json-rpc-middleware-stream/node_modules/readable-stream/readable.js"}],[125,{buffer:"buffer"},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){var n=e("buffer"),s=n.Buffer;function i(e,t){for(var r in e)t[r]=e[r]}function o(e,t,r){return s(e,t,r)}s.from&&s.alloc&&s.allocUnsafe&&s.allocUnsafeSlow?t.exports=n:(i(n,r),r.Buffer=o),i(s,o),o.from=function(e,t,r){if("number"==typeof e)throw new TypeError("Argument must not be a number");return s(e,t,r)},o.alloc=function(e,t,r){if("number"!=typeof e)throw new TypeError("Argument must be a number");var n=s(e);return t!==undefined?"string"==typeof r?n.fill(t,r):n.fill(t):n.fill(0),n},o.allocUnsafe=function(e){if("number"!=typeof e)throw new TypeError("Argument must be a number");return s(e)},o.allocUnsafeSlow=function(e){if("number"!=typeof e)throw new TypeError("Argument must be a number");return n.SlowBuffer(e)}}}},{package:"@metamask/providers>json-rpc-middleware-stream>readable-stream>safe-buffer",file:"../../node_modules/json-rpc-middleware-stream/node_modules/safe-buffer/index.js"}],[126,{"safe-buffer":125},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){var n=e("safe-buffer").Buffer,s=n.isEncoding||function(e){switch((e=""+e)&&e.toLowerCase()){case"hex":case"utf8":case"utf-8":case"ascii":case"binary":case"base64":case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":case"raw":return!0;default:return!1}};function i(e){var t;switch(this.encoding=function(e){var t=function(e){if(!e)return"utf8";for(var t;;)switch(e){case"utf8":case"utf-8":return"utf8";case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return"utf16le";case"latin1":case"binary":return"latin1";case"base64":case"ascii":case"hex":return e;default:if(t)return;e=(""+e).toLowerCase(),t=!0}}(e);if("string"!=typeof t&&(n.isEncoding===s||!s(e)))throw new Error("Unknown encoding: "+e);return t||e}(e),this.encoding){case"utf16le":this.text=u,this.end=c,t=4;break;case"utf8":this.fillLast=a,t=4;break;case"base64":this.text=l,this.end=d,t=3;break;default:return this.write=f,void(this.end=h)}this.lastNeed=0,this.lastTotal=0,this.lastChar=n.allocUnsafe(t)}function o(e){return e<=127?0:e>>5==6?2:e>>4==14?3:e>>3==30?4:e>>6==2?-1:-2}function a(e){var t=this.lastTotal-this.lastNeed,r=function(e,t,r){if(128!=(192&t[0]))return e.lastNeed=0,"�";if(e.lastNeed>1&&t.length>1){if(128!=(192&t[1]))return e.lastNeed=1,"�";if(e.lastNeed>2&&t.length>2&&128!=(192&t[2]))return e.lastNeed=2,"�"}}(this,e);return r!==undefined?r:this.lastNeed<=e.length?(e.copy(this.lastChar,t,0,this.lastNeed),this.lastChar.toString(this.encoding,0,this.lastTotal)):(e.copy(this.lastChar,t,0,e.length),void(this.lastNeed-=e.length))}function u(e,t){if((e.length-t)%2==0){var r=e.toString("utf16le",t);if(r){var n=r.charCodeAt(r.length-1);if(n>=55296&&n<=56319)return this.lastNeed=2,this.lastTotal=4,this.lastChar[0]=e[e.length-2],this.lastChar[1]=e[e.length-1],r.slice(0,-1)}return r}return this.lastNeed=1,this.lastTotal=2,this.lastChar[0]=e[e.length-1],e.toString("utf16le",t,e.length-1)}function c(e){var t=e&&e.length?this.write(e):"";if(this.lastNeed){var r=this.lastTotal-this.lastNeed;return t+this.lastChar.toString("utf16le",0,r)}return t}function l(e,t){var r=(e.length-t)%3;return 0===r?e.toString("base64",t):(this.lastNeed=3-r,this.lastTotal=3,1===r?this.lastChar[0]=e[e.length-1]:(this.lastChar[0]=e[e.length-2],this.lastChar[1]=e[e.length-1]),e.toString("base64",t,e.length-r))}function d(e){var t=e&&e.length?this.write(e):"";return this.lastNeed?t+this.lastChar.toString("base64",0,3-this.lastNeed):t}function f(e){return e.toString(this.encoding)}function h(e){return e&&e.length?this.write(e):""}r.StringDecoder=i,i.prototype.write=function(e){if(0===e.length)return"";var t,r;if(this.lastNeed){if((t=this.fillLast(e))===undefined)return"";r=this.lastNeed,this.lastNeed=0}else r=0;return r<e.length?t?t+this.text(e,r):this.text(e,r):t||""},i.prototype.end=function(e){var t=e&&e.length?this.write(e):"";return this.lastNeed?t+"�":t},i.prototype.text=function(e,t){var r=function(e,t,r){var n=t.length-1;if(n<r)return 0;var s=o(t[n]);if(s>=0)return s>0&&(e.lastNeed=s-1),s;if(--n<r||-2===s)return 0;if(s=o(t[n]),s>=0)return s>0&&(e.lastNeed=s-2),s;if(--n<r||-2===s)return 0;if(s=o(t[n]),s>=0)return s>0&&(2===s?s=0:e.lastNeed=s-3),s;return 0}(this,e,t);if(!this.lastNeed)return e.toString("utf8",t);this.lastTotal=r;var n=e.length-(r-this.lastNeed);return e.copy(this.lastChar,0,n),e.toString("utf8",t,n)},i.prototype.fillLast=function(e){if(this.lastNeed<=e.length)return e.copy(this.lastChar,this.lastTotal-this.lastNeed,0,this.lastNeed),this.lastChar.toString(this.encoding,0,this.lastTotal);e.copy(this.lastChar,this.lastTotal-this.lastNeed,0,e.length),this.lastNeed-=e.length}}}},{package:"@metamask/providers>json-rpc-middleware-stream>readable-stream>string_decoder",file:"../../node_modules/json-rpc-middleware-stream/node_modules/string_decoder/lib/string_decoder.js"}],[127,{wrappy:195},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){var n=e("wrappy");function s(e){var t=function(){return t.called?t.value:(t.called=!0,t.value=e.apply(this,arguments))};return t.called=!1,t}function i(e){var t=function(){if(t.called)throw new Error(t.onceError);return t.called=!0,t.value=e.apply(this,arguments)},r=e.name||"Function wrapped with `once`";return t.onceError=r+" shouldn't be called more than once",t.called=!1,t}t.exports=n(s),t.exports.strict=n(i),s.proto=s((function(){Object.defineProperty(Function.prototype,"once",{value:function(){return s(this)},configurable:!0}),Object.defineProperty(Function.prototype,"onceStrict",{value:function(){return i(this)},configurable:!0})}))}}},{package:"@metamask/object-multiplex>once",file:"../../node_modules/once/once.js"}],[128,{},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){"undefined"==typeof process||!process.version||0===process.version.indexOf("v0.")||0===process.version.indexOf("v1.")&&0!==process.version.indexOf("v1.8.")?t.exports={nextTick:function(e,t,r,n){if("function"!=typeof e)throw new TypeError('"callback" argument must be a function');var s,i,o=arguments.length;switch(o){case 0:case 1:return process.nextTick(e);case 2:return process.nextTick((function(){e.call(null,t)}));case 3:return process.nextTick((function(){e.call(null,t,r)}));case 4:return process.nextTick((function(){e.call(null,t,r,n)}));default:for(s=new Array(o-1),i=0;i<s.length;)s[i++]=arguments[i];return process.nextTick((function(){e.apply(null,s)}))}}}:t.exports=process}}},{package:"browserify>readable-stream>process-nextick-args",file:"../../node_modules/process-nextick-args/index.js"}],[129,{"end-of-stream":91,fs:"fs",once:127},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){var n=e("once"),s=e("end-of-stream"),i=e("fs"),o=function(){},a=/^v?\.0/.test(process.version),u=function(e){return"function"==typeof e},c=function(e,t,r,c){c=n(c);var l=!1;e.on("close",(function(){l=!0})),s(e,{readable:t,writable:r},(function(e){if(e)return c(e);l=!0,c()}));var d=!1;return function(t){if(!l&&!d)return d=!0,function(e){return!!a&&!!i&&(e instanceof(i.ReadStream||o)||e instanceof(i.WriteStream||o))&&u(e.close)}(e)?e.close(o):function(e){return e.setHeader&&u(e.abort)}(e)?e.abort():u(e.destroy)?e.destroy():void c(t||new Error("stream was destroyed"))}},l=function(e){e()},d=function(e,t){return e.pipe(t)};t.exports=function(){var e,t=Array.prototype.slice.call(arguments),r=u(t[t.length-1]||o)&&t.pop()||o;if(Array.isArray(t[0])&&(t=t[0]),t.length<2)throw new Error("pump requires two streams per minimum");var n=t.map((function(s,i){var o=i<t.length-1;return c(s,o,i>0,(function(t){e||(e=t),t&&n.forEach(l),o||(n.forEach(l),r(e))}))}));return t.reduce(d)}}}},{package:"@metamask/providers>pump",file:"../../node_modules/pump/index.js"}],[130,{},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){const n={};function s(e,t,r){r||(r=Error);class s extends r{constructor(e,r,n){super(function(e,r,n){return"string"==typeof t?t:t(e,r,n)}(e,r,n))}}s.prototype.name=r.name,s.prototype.code=e,n[e]=s}function i(e,t){if(Array.isArray(e)){const r=e.length;return e=e.map((e=>String(e))),r>2?`one of ${t} ${e.slice(0,r-1).join(", ")}, or `+e[r-1]:2===r?`one of ${t} ${e[0]} or ${e[1]}`:`of ${t} ${e[0]}`}return`of ${t} ${String(e)}`}s("ERR_INVALID_OPT_VALUE",(function(e,t){return'The value "'+t+'" is invalid for option "'+e+'"'}),TypeError),s("ERR_INVALID_ARG_TYPE",(function(e,t,r){let n;var s,o;let a;if("string"==typeof t&&(s="not ",t.substr(!o||o<0?0:+o,s.length)===s)?(n="must not be",t=t.replace(/^not /,"")):n="must be",function(e,t,r){return(r===undefined||r>e.length)&&(r=e.length),e.substring(r-t.length,r)===t}(e," argument"))a=`The ${e} ${n} ${i(t,"type")}`;else{const r=function(e,t,r){return"number"!=typeof r&&(r=0),!(r+t.length>e.length)&&-1!==e.indexOf(t,r)}(e,".")?"property":"argument";a=`The "${e}" ${r} ${n} ${i(t,"type")}`}return a+=". Received type "+typeof r,a}),TypeError),s("ERR_STREAM_PUSH_AFTER_EOF","stream.push() after EOF"),s("ERR_METHOD_NOT_IMPLEMENTED",(function(e){return"The "+e+" method is not implemented"})),s("ERR_STREAM_PREMATURE_CLOSE","Premature close"),s("ERR_STREAM_DESTROYED",(function(e){return"Cannot call "+e+" after a stream was destroyed"})),s("ERR_MULTIPLE_CALLBACK","Callback called multiple times"),s("ERR_STREAM_CANNOT_PIPE","Cannot pipe, not readable"),s("ERR_STREAM_WRITE_AFTER_END","write after end"),s("ERR_STREAM_NULL_VALUES","May not write null values to stream",TypeError),s("ERR_UNKNOWN_ENCODING",(function(e){return"Unknown encoding: "+e}),TypeError),s("ERR_STREAM_UNSHIFT_AFTER_END_EVENT","stream.unshift() after end event"),t.exports.codes=n}}},{package:"@lavamoat/lavapack>readable-stream",file:"../../node_modules/readable-stream/errors.js"}],[131,{"./_stream_readable":133,"./_stream_writable":135,inherits:101},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){var n=Object.keys||function(e){var t=[];for(var r in e)t.push(r);return t};t.exports=c;var s=e("./_stream_readable"),i=e("./_stream_writable");e("inherits")(c,s);for(var o=n(i.prototype),a=0;a<o.length;a++){var u=o[a];c.prototype[u]||(c.prototype[u]=i.prototype[u])}function c(e){if(!(this instanceof c))return new c(e);s.call(this,e),i.call(this,e),this.allowHalfOpen=!0,e&&(!1===e.readable&&(this.readable=!1),!1===e.writable&&(this.writable=!1),!1===e.allowHalfOpen&&(this.allowHalfOpen=!1,this.once("end",l)))}function l(){this._writableState.ended||process.nextTick(d,this)}function d(e){e.end()}Object.defineProperty(c.prototype,"writableHighWaterMark",{enumerable:!1,get:function(){return this._writableState.highWaterMark}}),Object.defineProperty(c.prototype,"writableBuffer",{enumerable:!1,get:function(){return this._writableState&&this._writableState.getBuffer()}}),Object.defineProperty(c.prototype,"writableLength",{enumerable:!1,get:function(){return this._writableState.length}}),Object.defineProperty(c.prototype,"destroyed",{enumerable:!1,get:function(){return this._readableState!==undefined&&this._writableState!==undefined&&(this._readableState.destroyed&&this._writableState.destroyed)},set:function(e){this._readableState!==undefined&&this._writableState!==undefined&&(this._readableState.destroyed=e,this._writableState.destroyed=e)}})}}},{package:"@lavamoat/lavapack>readable-stream",file:"../../node_modules/readable-stream/lib/_stream_duplex.js"}],[132,{"./_stream_transform":134,inherits:101},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){t.exports=s;var n=e("./_stream_transform");function s(e){if(!(this instanceof s))return new s(e);n.call(this,e)}e("inherits")(s,n),s.prototype._transform=function(e,t,r){r(null,e)}}}},{package:"@lavamoat/lavapack>readable-stream",file:"../../node_modules/readable-stream/lib/_stream_passthrough.js"}],[133,{"../errors":130,"./_stream_duplex":131,"./internal/streams/async_iterator":136,"./internal/streams/buffer_list":137,"./internal/streams/destroy":138,"./internal/streams/from":140,"./internal/streams/state":142,"./internal/streams/stream":143,buffer:"buffer",events:"events",inherits:101,"string_decoder/":191,util:"util"},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){var n;t.exports=k,k.ReadableState=E;e("events").EventEmitter;var s=function(e,t){return e.listeners(t).length},i=e("./internal/streams/stream"),o=e("buffer").Buffer,a=("undefined"!=typeof global?global:"undefined"!=typeof window?window:"undefined"!=typeof self?self:{}).Uint8Array||function(){};var u,c=e("util");u=c&&c.debuglog?c.debuglog("stream"):function(){};var l,d,f,h=e("./internal/streams/buffer_list"),p=e("./internal/streams/destroy"),m=e("./internal/streams/state").getHighWaterMark,g=e("../errors").codes,b=g.ERR_INVALID_ARG_TYPE,w=g.ERR_STREAM_PUSH_AFTER_EOF,y=g.ERR_METHOD_NOT_IMPLEMENTED,v=g.ERR_STREAM_UNSHIFT_AFTER_END_EVENT;e("inherits")(k,i);var _=p.errorOrDestroy,S=["error","close","destroy","pause","resume"];function E(t,r,s){n=n||e("./_stream_duplex"),t=t||{},"boolean"!=typeof s&&(s=r instanceof n),this.objectMode=!!t.objectMode,s&&(this.objectMode=this.objectMode||!!t.readableObjectMode),this.highWaterMark=m(this,t,"readableHighWaterMark",s),this.buffer=new h,this.length=0,this.pipes=null,this.pipesCount=0,this.flowing=null,this.ended=!1,this.endEmitted=!1,this.reading=!1,this.sync=!0,this.needReadable=!1,this.emittedReadable=!1,this.readableListening=!1,this.resumeScheduled=!1,this.paused=!0,this.emitClose=!1!==t.emitClose,this.autoDestroy=!!t.autoDestroy,this.destroyed=!1,this.defaultEncoding=t.defaultEncoding||"utf8",this.awaitDrain=0,this.readingMore=!1,this.decoder=null,this.encoding=null,t.encoding&&(l||(l=e("string_decoder/").StringDecoder),this.decoder=new l(t.encoding),this.encoding=t.encoding)}function k(t){if(n=n||e("./_stream_duplex"),!(this instanceof k))return new k(t);var r=this instanceof n;this._readableState=new E(t,this,r),this.readable=!0,t&&("function"==typeof t.read&&(this._read=t.read),"function"==typeof t.destroy&&(this._destroy=t.destroy)),i.call(this)}function T(e,t,r,n,s){u("readableAddChunk",t);var i,c=e._readableState;if(null===t)c.reading=!1,function(e,t){if(u("onEofChunk"),t.ended)return;if(t.decoder){var r=t.decoder.end();r&&r.length&&(t.buffer.push(r),t.length+=t.objectMode?1:r.length)}t.ended=!0,t.sync?M(e):(t.needReadable=!1,t.emittedReadable||(t.emittedReadable=!0,O(e)))}(e,c);else if(s||(i=function(e,t){var r;n=t,o.isBuffer(n)||n instanceof a||"string"==typeof t||t===undefined||e.objectMode||(r=new b("chunk",["string","Buffer","Uint8Array"],t));var n;return r}(c,t)),i)_(e,i);else if(c.objectMode||t&&t.length>0)if("string"==typeof t||c.objectMode||Object.getPrototypeOf(t)===o.prototype||(t=function(e){return o.from(e)}(t)),n)c.endEmitted?_(e,new v):j(e,c,t,!0);else if(c.ended)_(e,new w);else{if(c.destroyed)return!1;c.reading=!1,c.decoder&&!r?(t=c.decoder.write(t),c.objectMode||0!==t.length?j(e,c,t,!1):P(e,c)):j(e,c,t,!1)}else n||(c.reading=!1,P(e,c));return!c.ended&&(c.length<c.highWaterMark||0===c.length)}function j(e,t,r,n){t.flowing&&0===t.length&&!t.sync?(t.awaitDrain=0,e.emit("data",r)):(t.length+=t.objectMode?1:r.length,n?t.buffer.unshift(r):t.buffer.push(r),t.needReadable&&M(e)),P(e,t)}Object.defineProperty(k.prototype,"destroyed",{enumerable:!1,get:function(){return this._readableState!==undefined&&this._readableState.destroyed},set:function(e){this._readableState&&(this._readableState.destroyed=e)}}),k.prototype.destroy=p.destroy,k.prototype._undestroy=p.undestroy,k.prototype._destroy=function(e,t){t(e)},k.prototype.push=function(e,t){var r,n=this._readableState;return n.objectMode?r=!0:"string"==typeof e&&((t=t||n.defaultEncoding)!==n.encoding&&(e=o.from(e,t),t=""),r=!0),T(this,e,t,!1,r)},k.prototype.unshift=function(e){return T(this,e,null,!0,!1)},k.prototype.isPaused=function(){return!1===this._readableState.flowing},k.prototype.setEncoding=function(t){l||(l=e("string_decoder/").StringDecoder);var r=new l(t);this._readableState.decoder=r,this._readableState.encoding=this._readableState.decoder.encoding;for(var n=this._readableState.buffer.head,s="";null!==n;)s+=r.write(n.data),n=n.next;return this._readableState.buffer.clear(),""!==s&&this._readableState.buffer.push(s),this._readableState.length=s.length,this};var R=1073741824;function x(e,t){return e<=0||0===t.length&&t.ended?0:t.objectMode?1:e!=e?t.flowing&&t.length?t.buffer.head.data.length:t.length:(e>t.highWaterMark&&(t.highWaterMark=function(e){return e>=R?e=R:(e--,e|=e>>>1,e|=e>>>2,e|=e>>>4,e|=e>>>8,e|=e>>>16,e++),e}(e)),e<=t.length?e:t.ended?t.length:(t.needReadable=!0,0))}function M(e){var t=e._readableState;u("emitReadable",t.needReadable,t.emittedReadable),t.needReadable=!1,t.emittedReadable||(u("emitReadable",t.flowing),t.emittedReadable=!0,process.nextTick(O,e))}function O(e){var t=e._readableState;u("emitReadable_",t.destroyed,t.length,t.ended),t.destroyed||!t.length&&!t.ended||(e.emit("readable"),t.emittedReadable=!1),t.needReadable=!t.flowing&&!t.ended&&t.length<=t.highWaterMark,L(e)}function P(e,t){t.readingMore||(t.readingMore=!0,process.nextTick(C,e,t))}function C(e,t){for(;!t.reading&&!t.ended&&(t.length<t.highWaterMark||t.flowing&&0===t.length);){var r=t.length;if(u("maybeReadMore read 0"),e.read(0),r===t.length)break}t.readingMore=!1}function I(e){var t=e._readableState;t.readableListening=e.listenerCount("readable")>0,t.resumeScheduled&&!t.paused?t.flowing=!0:e.listenerCount("data")>0&&e.resume()}function A(e){u("readable nexttick read 0"),e.read(0)}function N(e,t){u("resume",t.reading),t.reading||e.read(0),t.resumeScheduled=!1,e.emit("resume"),L(e),t.flowing&&!t.reading&&e.read(0)}function L(e){var t=e._readableState;for(u("flow",t.flowing);t.flowing&&null!==e.read(););}function $(e,t){return 0===t.length?null:(t.objectMode?r=t.buffer.shift():!e||e>=t.length?(r=t.decoder?t.buffer.join(""):1===t.buffer.length?t.buffer.first():t.buffer.concat(t.length),t.buffer.clear()):r=t.buffer.consume(e,t.decoder),r);var r}function D(e){var t=e._readableState;u("endReadable",t.endEmitted),t.endEmitted||(t.ended=!0,process.nextTick(B,t,e))}function B(e,t){if(u("endReadableNT",e.endEmitted,e.length),!e.endEmitted&&0===e.length&&(e.endEmitted=!0,t.readable=!1,t.emit("end"),e.autoDestroy)){var r=t._writableState;(!r||r.autoDestroy&&r.finished)&&t.destroy()}}function F(e,t){for(var r=0,n=e.length;r<n;r++)if(e[r]===t)return r;return-1}k.prototype.read=function(e){u("read",e),e=parseInt(e,10);var t=this._readableState,r=e;if(0!==e&&(t.emittedReadable=!1),0===e&&t.needReadable&&((0!==t.highWaterMark?t.length>=t.highWaterMark:t.length>0)||t.ended))return u("read: emitReadable",t.length,t.ended),0===t.length&&t.ended?D(this):M(this),null;if(0===(e=x(e,t))&&t.ended)return 0===t.length&&D(this),null;var n,s=t.needReadable;return u("need readable",s),(0===t.length||t.length-e<t.highWaterMark)&&u("length less than watermark",s=!0),t.ended||t.reading?u("reading or ended",s=!1):s&&(u("do read"),t.reading=!0,t.sync=!0,0===t.length&&(t.needReadable=!0),this._read(t.highWaterMark),t.sync=!1,t.reading||(e=x(r,t))),null===(n=e>0?$(e,t):null)?(t.needReadable=t.length<=t.highWaterMark,e=0):(t.length-=e,t.awaitDrain=0),0===t.length&&(t.ended||(t.needReadable=!0),r!==e&&t.ended&&D(this)),null!==n&&this.emit("data",n),n},k.prototype._read=function(e){_(this,new y("_read()"))},k.prototype.pipe=function(e,t){var r=this,n=this._readableState;switch(n.pipesCount){case 0:n.pipes=e;break;case 1:n.pipes=[n.pipes,e];break;default:n.pipes.push(e)}n.pipesCount+=1,u("pipe count=%d opts=%j",n.pipesCount,t);var i=(!t||!1!==t.end)&&e!==process.stdout&&e!==process.stderr?a:m;function o(t,s){u("onunpipe"),t===r&&s&&!1===s.hasUnpiped&&(s.hasUnpiped=!0,u("cleanup"),e.removeListener("close",h),e.removeListener("finish",p),e.removeListener("drain",c),e.removeListener("error",f),e.removeListener("unpipe",o),r.removeListener("end",a),r.removeListener("end",m),r.removeListener("data",d),l=!0,!n.awaitDrain||e._writableState&&!e._writableState.needDrain||c())}function a(){u("onend"),e.end()}n.endEmitted?process.nextTick(i):r.once("end",i),e.on("unpipe",o);var c=function(e){return function(){var t=e._readableState;u("pipeOnDrain",t.awaitDrain),t.awaitDrain&&t.awaitDrain--,0===t.awaitDrain&&s(e,"data")&&(t.flowing=!0,L(e))}}(r);e.on("drain",c);var l=!1;function d(t){u("ondata");var s=e.write(t);u("dest.write",s),!1===s&&((1===n.pipesCount&&n.pipes===e||n.pipesCount>1&&-1!==F(n.pipes,e))&&!l&&(u("false write response, pause",n.awaitDrain),n.awaitDrain++),r.pause())}function f(t){u("onerror",t),m(),e.removeListener("error",f),0===s(e,"error")&&_(e,t)}function h(){e.removeListener("finish",p),m()}function p(){u("onfinish"),e.removeListener("close",h),m()}function m(){u("unpipe"),r.unpipe(e)}return r.on("data",d),function(e,t,r){if("function"==typeof e.prependListener)return e.prependListener(t,r);e._events&&e._events[t]?Array.isArray(e._events[t])?e._events[t].unshift(r):e._events[t]=[r,e._events[t]]:e.on(t,r)}(e,"error",f),e.once("close",h),e.once("finish",p),e.emit("pipe",r),n.flowing||(u("pipe resume"),r.resume()),e},k.prototype.unpipe=function(e){var t=this._readableState,r={hasUnpiped:!1};if(0===t.pipesCount)return this;if(1===t.pipesCount)return e&&e!==t.pipes||(e||(e=t.pipes),t.pipes=null,t.pipesCount=0,t.flowing=!1,e&&e.emit("unpipe",this,r)),this;if(!e){var n=t.pipes,s=t.pipesCount;t.pipes=null,t.pipesCount=0,t.flowing=!1;for(var i=0;i<s;i++)n[i].emit("unpipe",this,{hasUnpiped:!1});return this}var o=F(t.pipes,e);return-1===o||(t.pipes.splice(o,1),t.pipesCount-=1,1===t.pipesCount&&(t.pipes=t.pipes[0]),e.emit("unpipe",this,r)),this},k.prototype.on=function(e,t){var r=i.prototype.on.call(this,e,t),n=this._readableState;return"data"===e?(n.readableListening=this.listenerCount("readable")>0,!1!==n.flowing&&this.resume()):"readable"===e&&(n.endEmitted||n.readableListening||(n.readableListening=n.needReadable=!0,n.flowing=!1,n.emittedReadable=!1,u("on readable",n.length,n.reading),n.length?M(this):n.reading||process.nextTick(A,this))),r},k.prototype.addListener=k.prototype.on,k.prototype.removeListener=function(e,t){var r=i.prototype.removeListener.call(this,e,t);return"readable"===e&&process.nextTick(I,this),r},k.prototype.removeAllListeners=function(e){var t=i.prototype.removeAllListeners.apply(this,arguments);return"readable"!==e&&e!==undefined||process.nextTick(I,this),t},k.prototype.resume=function(){var e=this._readableState;return e.flowing||(u("resume"),e.flowing=!e.readableListening,function(e,t){t.resumeScheduled||(t.resumeScheduled=!0,process.nextTick(N,e,t))}(this,e)),e.paused=!1,this},k.prototype.pause=function(){return u("call pause flowing=%j",this._readableState.flowing),!1!==this._readableState.flowing&&(u("pause"),this._readableState.flowing=!1,this.emit("pause")),this._readableState.paused=!0,this},k.prototype.wrap=function(e){var t=this,r=this._readableState,n=!1;for(var s in e.on("end",(function(){if(u("wrapped end"),r.decoder&&!r.ended){var e=r.decoder.end();e&&e.length&&t.push(e)}t.push(null)})),e.on("data",(function(s){(u("wrapped data"),r.decoder&&(s=r.decoder.write(s)),!r.objectMode||null!==s&&s!==undefined)&&((r.objectMode||s&&s.length)&&(t.push(s)||(n=!0,e.pause())))})),e)this[s]===undefined&&"function"==typeof e[s]&&(this[s]=function(t){return function(){return e[t].apply(e,arguments)}}(s));for(var i=0;i<S.length;i++)e.on(S[i],this.emit.bind(this,S[i]));return this._read=function(t){u("wrapped _read",t),n&&(n=!1,e.resume())},this},"function"==typeof Symbol&&(k.prototype[Symbol.asyncIterator]=function(){return d===undefined&&(d=e("./internal/streams/async_iterator")),d(this)}),Object.defineProperty(k.prototype,"readableHighWaterMark",{enumerable:!1,get:function(){return this._readableState.highWaterMark}}),Object.defineProperty(k.prototype,"readableBuffer",{enumerable:!1,get:function(){return this._readableState&&this._readableState.buffer}}),Object.defineProperty(k.prototype,"readableFlowing",{enumerable:!1,get:function(){return this._readableState.flowing},set:function(e){this._readableState&&(this._readableState.flowing=e)}}),k._fromList=$,Object.defineProperty(k.prototype,"readableLength",{enumerable:!1,get:function(){return this._readableState.length}}),"function"==typeof Symbol&&(k.from=function(t,r){return f===undefined&&(f=e("./internal/streams/from")),f(k,t,r)})}}},{package:"@lavamoat/lavapack>readable-stream",file:"../../node_modules/readable-stream/lib/_stream_readable.js"}],[134,{"../errors":130,"./_stream_duplex":131,inherits:101},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){t.exports=l;var n=e("../errors").codes,s=n.ERR_METHOD_NOT_IMPLEMENTED,i=n.ERR_MULTIPLE_CALLBACK,o=n.ERR_TRANSFORM_ALREADY_TRANSFORMING,a=n.ERR_TRANSFORM_WITH_LENGTH_0,u=e("./_stream_duplex");function c(e,t){var r=this._transformState;r.transforming=!1;var n=r.writecb;if(null===n)return this.emit("error",new i);r.writechunk=null,r.writecb=null,null!=t&&this.push(t),n(e);var s=this._readableState;s.reading=!1,(s.needReadable||s.length<s.highWaterMark)&&this._read(s.highWaterMark)}function l(e){if(!(this instanceof l))return new l(e);u.call(this,e),this._transformState={afterTransform:c.bind(this),needTransform:!1,transforming:!1,writecb:null,writechunk:null,writeencoding:null},this._readableState.needReadable=!0,this._readableState.sync=!1,e&&("function"==typeof e.transform&&(this._transform=e.transform),"function"==typeof e.flush&&(this._flush=e.flush)),this.on("prefinish",d)}function d(){var e=this;"function"!=typeof this._flush||this._readableState.destroyed?f(this,null,null):this._flush((function(t,r){f(e,t,r)}))}function f(e,t,r){if(t)return e.emit("error",t);if(null!=r&&e.push(r),e._writableState.length)throw new a;if(e._transformState.transforming)throw new o;return e.push(null)}e("inherits")(l,u),l.prototype.push=function(e,t){return this._transformState.needTransform=!1,u.prototype.push.call(this,e,t)},l.prototype._transform=function(e,t,r){r(new s("_transform()"))},l.prototype._write=function(e,t,r){var n=this._transformState;if(n.writecb=r,n.writechunk=e,n.writeencoding=t,!n.transforming){var s=this._readableState;(n.needTransform||s.needReadable||s.length<s.highWaterMark)&&this._read(s.highWaterMark)}},l.prototype._read=function(e){var t=this._transformState;null===t.writechunk||t.transforming?t.needTransform=!0:(t.transforming=!0,this._transform(t.writechunk,t.writeencoding,t.afterTransform))},l.prototype._destroy=function(e,t){u.prototype._destroy.call(this,e,(function(e){t(e)}))}}}},{package:"@lavamoat/lavapack>readable-stream",file:"../../node_modules/readable-stream/lib/_stream_transform.js"}],[135,{"../errors":130,"./_stream_duplex":131,"./internal/streams/destroy":138,"./internal/streams/state":142,"./internal/streams/stream":143,buffer:"buffer",inherits:101,"util-deprecate":194},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){function n(e){var t=this;this.next=null,this.entry=null,this.finish=function(){!function(e,t,r){var n=e.entry;e.entry=null;for(;n;){var s=n.callback;t.pendingcb--,s(r),n=n.next}t.corkedRequestsFree.next=e}(t,e)}}var s;t.exports=k,k.WritableState=E;var i={deprecate:e("util-deprecate")},o=e("./internal/streams/stream"),a=e("buffer").Buffer,u=("undefined"!=typeof global?global:"undefined"!=typeof window?window:"undefined"!=typeof self?self:{}).Uint8Array||function(){};var c,l=e("./internal/streams/destroy"),d=e("./internal/streams/state").getHighWaterMark,f=e("../errors").codes,h=f.ERR_INVALID_ARG_TYPE,p=f.ERR_METHOD_NOT_IMPLEMENTED,m=f.ERR_MULTIPLE_CALLBACK,g=f.ERR_STREAM_CANNOT_PIPE,b=f.ERR_STREAM_DESTROYED,w=f.ERR_STREAM_NULL_VALUES,y=f.ERR_STREAM_WRITE_AFTER_END,v=f.ERR_UNKNOWN_ENCODING,_=l.errorOrDestroy;function S(){}function E(t,r,i){s=s||e("./_stream_duplex"),t=t||{},"boolean"!=typeof i&&(i=r instanceof s),this.objectMode=!!t.objectMode,i&&(this.objectMode=this.objectMode||!!t.writableObjectMode),this.highWaterMark=d(this,t,"writableHighWaterMark",i),this.finalCalled=!1,this.needDrain=!1,this.ending=!1,this.ended=!1,this.finished=!1,this.destroyed=!1;var o=!1===t.decodeStrings;this.decodeStrings=!o,this.defaultEncoding=t.defaultEncoding||"utf8",this.length=0,this.writing=!1,this.corked=0,this.sync=!0,this.bufferProcessing=!1,this.onwrite=function(e){!function(e,t){var r=e._writableState,n=r.sync,s=r.writecb;if("function"!=typeof s)throw new m;if(function(e){e.writing=!1,e.writecb=null,e.length-=e.writelen,e.writelen=0}(r),t)!function(e,t,r,n,s){--t.pendingcb,r?(process.nextTick(s,n),process.nextTick(O,e,t),e._writableState.errorEmitted=!0,_(e,n)):(s(n),e._writableState.errorEmitted=!0,_(e,n),O(e,t))}(e,r,n,t,s);else{var i=x(r)||e.destroyed;i||r.corked||r.bufferProcessing||!r.bufferedRequest||R(e,r),n?process.nextTick(j,e,r,i,s):j(e,r,i,s)}}(r,e)},this.writecb=null,this.writelen=0,this.bufferedRequest=null,this.lastBufferedRequest=null,this.pendingcb=0,this.prefinished=!1,this.errorEmitted=!1,this.emitClose=!1!==t.emitClose,this.autoDestroy=!!t.autoDestroy,this.bufferedRequestCount=0,this.corkedRequestsFree=new n(this)}function k(t){var r=this instanceof(s=s||e("./_stream_duplex"));if(!r&&!c.call(k,this))return new k(t);this._writableState=new E(t,this,r),this.writable=!0,t&&("function"==typeof t.write&&(this._write=t.write),"function"==typeof t.writev&&(this._writev=t.writev),"function"==typeof t.destroy&&(this._destroy=t.destroy),"function"==typeof t.final&&(this._final=t.final)),o.call(this)}function T(e,t,r,n,s,i,o){t.writelen=n,t.writecb=o,t.writing=!0,t.sync=!0,t.destroyed?t.onwrite(new b("write")):r?e._writev(s,t.onwrite):e._write(s,i,t.onwrite),t.sync=!1}function j(e,t,r,n){r||function(e,t){0===t.length&&t.needDrain&&(t.needDrain=!1,e.emit("drain"))}(e,t),t.pendingcb--,n(),O(e,t)}function R(e,t){t.bufferProcessing=!0;var r=t.bufferedRequest;if(e._writev&&r&&r.next){var s=t.bufferedRequestCount,i=new Array(s),o=t.corkedRequestsFree;o.entry=r;for(var a=0,u=!0;r;)i[a]=r,r.isBuf||(u=!1),r=r.next,a+=1;i.allBuffers=u,T(e,t,!0,t.length,i,"",o.finish),t.pendingcb++,t.lastBufferedRequest=null,o.next?(t.corkedRequestsFree=o.next,o.next=null):t.corkedRequestsFree=new n(t),t.bufferedRequestCount=0}else{for(;r;){var c=r.chunk,l=r.encoding,d=r.callback;if(T(e,t,!1,t.objectMode?1:c.length,c,l,d),r=r.next,t.bufferedRequestCount--,t.writing)break}null===r&&(t.lastBufferedRequest=null)}t.bufferedRequest=r,t.bufferProcessing=!1}function x(e){return e.ending&&0===e.length&&null===e.bufferedRequest&&!e.finished&&!e.writing}function M(e,t){e._final((function(r){t.pendingcb--,r&&_(e,r),t.prefinished=!0,e.emit("prefinish"),O(e,t)}))}function O(e,t){var r=x(t);if(r&&(function(e,t){t.prefinished||t.finalCalled||("function"!=typeof e._final||t.destroyed?(t.prefinished=!0,e.emit("prefinish")):(t.pendingcb++,t.finalCalled=!0,process.nextTick(M,e,t)))}(e,t),0===t.pendingcb&&(t.finished=!0,e.emit("finish"),t.autoDestroy))){var n=e._readableState;(!n||n.autoDestroy&&n.endEmitted)&&e.destroy()}return r}e("inherits")(k,o),E.prototype.getBuffer=function(){for(var e=this.bufferedRequest,t=[];e;)t.push(e),e=e.next;return t},function(){try{Object.defineProperty(E.prototype,"buffer",{get:i.deprecate((function(){return this.getBuffer()}),"_writableState.buffer is deprecated. Use _writableState.getBuffer "+"instead.","DEP0003")})}catch(e){}}(),"function"==typeof Symbol&&Symbol.hasInstance&&"function"==typeof Function.prototype[Symbol.hasInstance]?(c=Function.prototype[Symbol.hasInstance],Object.defineProperty(k,Symbol.hasInstance,{value:function(e){return!!c.call(this,e)||this===k&&(e&&e._writableState instanceof E)}})):c=function(e){return e instanceof this},k.prototype.pipe=function(){_(this,new g)},k.prototype.write=function(e,t,r){var n,s=this._writableState,i=!1,o=!s.objectMode&&(n=e,a.isBuffer(n)||n instanceof u);return o&&!a.isBuffer(e)&&(e=function(e){return a.from(e)}(e)),"function"==typeof t&&(r=t,t=null),o?t="buffer":t||(t=s.defaultEncoding),"function"!=typeof r&&(r=S),s.ending?function(e,t){var r=new y;_(e,r),process.nextTick(t,r)}(this,r):(o||function(e,t,r,n){var s;return null===r?s=new w:"string"==typeof r||t.objectMode||(s=new h("chunk",["string","Buffer"],r)),!s||(_(e,s),process.nextTick(n,s),!1)}(this,s,e,r))&&(s.pendingcb++,i=function(e,t,r,n,s,i){if(!r){var o=function(e,t,r){e.objectMode||!1===e.decodeStrings||"string"!=typeof t||(t=a.from(t,r));return t}(t,n,s);n!==o&&(r=!0,s="buffer",n=o)}var u=t.objectMode?1:n.length;t.length+=u;var c=t.length<t.highWaterMark;c||(t.needDrain=!0);if(t.writing||t.corked){var l=t.lastBufferedRequest;t.lastBufferedRequest={chunk:n,encoding:s,isBuf:r,callback:i,next:null},l?l.next=t.lastBufferedRequest:t.bufferedRequest=t.lastBufferedRequest,t.bufferedRequestCount+=1}else T(e,t,!1,u,n,s,i);return c}(this,s,o,e,t,r)),i},k.prototype.cork=function(){this._writableState.corked++},k.prototype.uncork=function(){var e=this._writableState;e.corked&&(e.corked--,e.writing||e.corked||e.bufferProcessing||!e.bufferedRequest||R(this,e))},k.prototype.setDefaultEncoding=function(e){if("string"==typeof e&&(e=e.toLowerCase()),!(["hex","utf8","utf-8","ascii","binary","base64","ucs2","ucs-2","utf16le","utf-16le","raw"].indexOf((e+"").toLowerCase())>-1))throw new v(e);return this._writableState.defaultEncoding=e,this},Object.defineProperty(k.prototype,"writableBuffer",{enumerable:!1,get:function(){return this._writableState&&this._writableState.getBuffer()}}),Object.defineProperty(k.prototype,"writableHighWaterMark",{enumerable:!1,get:function(){return this._writableState.highWaterMark}}),k.prototype._write=function(e,t,r){r(new p("_write()"))},k.prototype._writev=null,k.prototype.end=function(e,t,r){var n=this._writableState;return"function"==typeof e?(r=e,e=null,t=null):"function"==typeof t&&(r=t,t=null),null!==e&&e!==undefined&&this.write(e,t),n.corked&&(n.corked=1,this.uncork()),n.ending||function(e,t,r){t.ending=!0,O(e,t),r&&(t.finished?process.nextTick(r):e.once("finish",r));t.ended=!0,e.writable=!1}(this,n,r),this},Object.defineProperty(k.prototype,"writableLength",{enumerable:!1,get:function(){return this._writableState.length}}),Object.defineProperty(k.prototype,"destroyed",{enumerable:!1,get:function(){return this._writableState!==undefined&&this._writableState.destroyed},set:function(e){this._writableState&&(this._writableState.destroyed=e)}}),k.prototype.destroy=l.destroy,k.prototype._undestroy=l.undestroy,k.prototype._destroy=function(e,t){t(e)}}}},{package:"@lavamoat/lavapack>readable-stream",file:"../../node_modules/readable-stream/lib/_stream_writable.js"}],[136,{"./end-of-stream":139},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){var n;function s(e,t,r){return(t=function(e){var t=function(e,t){if("object"!=typeof e||null===e)return e;var r=e[Symbol.toPrimitive];if(r!==undefined){var n=r.call(e,t||"default");if("object"!=typeof n)return n;throw new TypeError("@@toPrimitive must return a primitive value.")}return("string"===t?String:Number)(e)}(e,"string");return"symbol"==typeof t?t:String(t)}(t))in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}var i=e("./end-of-stream"),o=Symbol("lastResolve"),a=Symbol("lastReject"),u=Symbol("error"),c=Symbol("ended"),l=Symbol("lastPromise"),d=Symbol("handlePromise"),f=Symbol("stream");function h(e,t){return{value:e,done:t}}function p(e){var t=e[o];if(null!==t){var r=e[f].read();null!==r&&(e[l]=null,e[o]=null,e[a]=null,t(h(r,!1)))}}function m(e){process.nextTick(p,e)}var g=Object.getPrototypeOf((function(){})),b=Object.setPrototypeOf((s(n={get stream(){return this[f]},next:function(){var e=this,t=this[u];if(null!==t)return Promise.reject(t);if(this[c])return Promise.resolve(h(undefined,!0));if(this[f].destroyed)return new Promise((function(t,r){process.nextTick((function(){e[u]?r(e[u]):t(h(undefined,!0))}))}));var r,n=this[l];if(n)r=new Promise(function(e,t){return function(r,n){e.then((function(){t[c]?r(h(undefined,!0)):t[d](r,n)}),n)}}(n,this));else{var s=this[f].read();if(null!==s)return Promise.resolve(h(s,!1));r=new Promise(this[d])}return this[l]=r,r}},Symbol.asyncIterator,(function(){return this})),s(n,"return",(function(){var e=this;return new Promise((function(t,r){e[f].destroy(null,(function(e){e?r(e):t(h(undefined,!0))}))}))})),n),g);t.exports=function(e){var t,r=Object.create(b,(s(t={},f,{value:e,writable:!0}),s(t,o,{value:null,writable:!0}),s(t,a,{value:null,writable:!0}),s(t,u,{value:null,writable:!0}),s(t,c,{value:e._readableState.endEmitted,writable:!0}),s(t,d,{value:function(e,t){var n=r[f].read();n?(r[l]=null,r[o]=null,r[a]=null,e(h(n,!1))):(r[o]=e,r[a]=t)},writable:!0}),t));return r[l]=null,i(e,(function(e){if(e&&"ERR_STREAM_PREMATURE_CLOSE"!==e.code){var t=r[a];return null!==t&&(r[l]=null,r[o]=null,r[a]=null,t(e)),void(r[u]=e)}var n=r[o];null!==n&&(r[l]=null,r[o]=null,r[a]=null,n(h(undefined,!0))),r[c]=!0})),e.on("readable",m.bind(null,r)),r}}}},{package:"@lavamoat/lavapack>readable-stream",file:"../../node_modules/readable-stream/lib/internal/streams/async_iterator.js"}],[137,{buffer:"buffer",util:"util"},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){function n(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function s(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?n(Object(r),!0).forEach((function(t){i(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):n(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function i(e,t,r){return(t=a(t))in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function o(e,t){for(var r=0;r<t.length;r++){var n=t[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,a(n.key),n)}}function a(e){var t=function(e,t){if("object"!=typeof e||null===e)return e;var r=e[Symbol.toPrimitive];if(r!==undefined){var n=r.call(e,t||"default");if("object"!=typeof n)return n;throw new TypeError("@@toPrimitive must return a primitive value.")}return("string"===t?String:Number)(e)}(e,"string");return"symbol"==typeof t?t:String(t)}var u=e("buffer").Buffer,c=e("util").inspect,l=c&&c.custom||"inspect";t.exports=function(){function e(){!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,e),this.head=null,this.tail=null,this.length=0}var t,r,n;return t=e,(r=[{key:"push",value:function(e){var t={data:e,next:null};this.length>0?this.tail.next=t:this.head=t,this.tail=t,++this.length}},{key:"unshift",value:function(e){var t={data:e,next:this.head};0===this.length&&(this.tail=t),this.head=t,++this.length}},{key:"shift",value:function(){if(0!==this.length){var e=this.head.data;return 1===this.length?this.head=this.tail=null:this.head=this.head.next,--this.length,e}}},{key:"clear",value:function(){this.head=this.tail=null,this.length=0}},{key:"join",value:function(e){if(0===this.length)return"";for(var t=this.head,r=""+t.data;t=t.next;)r+=e+t.data;return r}},{key:"concat",value:function(e){if(0===this.length)return u.alloc(0);for(var t,r,n,s=u.allocUnsafe(e>>>0),i=this.head,o=0;i;)t=i.data,r=s,n=o,u.prototype.copy.call(t,r,n),o+=i.data.length,i=i.next;return s}},{key:"consume",value:function(e,t){var r;return e<this.head.data.length?(r=this.head.data.slice(0,e),this.head.data=this.head.data.slice(e)):r=e===this.head.data.length?this.shift():t?this._getString(e):this._getBuffer(e),r}},{key:"first",value:function(){return this.head.data}},{key:"_getString",value:function(e){var t=this.head,r=1,n=t.data;for(e-=n.length;t=t.next;){var s=t.data,i=e>s.length?s.length:e;if(i===s.length?n+=s:n+=s.slice(0,e),0==(e-=i)){i===s.length?(++r,t.next?this.head=t.next:this.head=this.tail=null):(this.head=t,t.data=s.slice(i));break}++r}return this.length-=r,n}},{key:"_getBuffer",value:function(e){var t=u.allocUnsafe(e),r=this.head,n=1;for(r.data.copy(t),e-=r.data.length;r=r.next;){var s=r.data,i=e>s.length?s.length:e;if(s.copy(t,t.length-e,0,i),0==(e-=i)){i===s.length?(++n,r.next?this.head=r.next:this.head=this.tail=null):(this.head=r,r.data=s.slice(i));break}++n}return this.length-=n,t}},{key:l,value:function(e,t){return c(this,s(s({},t),{},{depth:0,customInspect:!1}))}}])&&o(t.prototype,r),n&&o(t,n),Object.defineProperty(t,"prototype",{writable:!1}),e}()}}},{package:"@lavamoat/lavapack>readable-stream",file:"../../node_modules/readable-stream/lib/internal/streams/buffer_list.js"}],[138,{},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){function n(e,t){i(e,t),s(e)}function s(e){e._writableState&&!e._writableState.emitClose||e._readableState&&!e._readableState.emitClose||e.emit("close")}function i(e,t){e.emit("error",t)}t.exports={destroy:function(e,t){var r=this,o=this._readableState&&this._readableState.destroyed,a=this._writableState&&this._writableState.destroyed;return o||a?(t?t(e):e&&(this._writableState?this._writableState.errorEmitted||(this._writableState.errorEmitted=!0,process.nextTick(i,this,e)):process.nextTick(i,this,e)),this):(this._readableState&&(this._readableState.destroyed=!0),this._writableState&&(this._writableState.destroyed=!0),this._destroy(e||null,(function(e){!t&&e?r._writableState?r._writableState.errorEmitted?process.nextTick(s,r):(r._writableState.errorEmitted=!0,process.nextTick(n,r,e)):process.nextTick(n,r,e):t?(process.nextTick(s,r),t(e)):process.nextTick(s,r)})),this)},undestroy:function(){this._readableState&&(this._readableState.destroyed=!1,this._readableState.reading=!1,this._readableState.ended=!1,this._readableState.endEmitted=!1),this._writableState&&(this._writableState.destroyed=!1,this._writableState.ended=!1,this._writableState.ending=!1,this._writableState.finalCalled=!1,this._writableState.prefinished=!1,this._writableState.finished=!1,this._writableState.errorEmitted=!1)},errorOrDestroy:function(e,t){var r=e._readableState,n=e._writableState;r&&r.autoDestroy||n&&n.autoDestroy?e.destroy(t):e.emit("error",t)}}}}},{package:"@lavamoat/lavapack>readable-stream",file:"../../node_modules/readable-stream/lib/internal/streams/destroy.js"}],[139,{"../../../errors":130},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){var n=e("../../../errors").codes.ERR_STREAM_PREMATURE_CLOSE;function s(){}t.exports=function e(t,r,i){if("function"==typeof r)return e(t,null,r);r||(r={}),i=function(e){var t=!1;return function(){if(!t){t=!0;for(var r=arguments.length,n=new Array(r),s=0;s<r;s++)n[s]=arguments[s];e.apply(this,n)}}}(i||s);var o=r.readable||!1!==r.readable&&t.readable,a=r.writable||!1!==r.writable&&t.writable,u=function(){t.writable||l()},c=t._writableState&&t._writableState.finished,l=function(){a=!1,c=!0,o||i.call(t)},d=t._readableState&&t._readableState.endEmitted,f=function(){o=!1,d=!0,a||i.call(t)},h=function(e){i.call(t,e)},p=function(){var e;return o&&!d?(t._readableState&&t._readableState.ended||(e=new n),i.call(t,e)):a&&!c?(t._writableState&&t._writableState.ended||(e=new n),i.call(t,e)):void 0},m=function(){t.req.on("finish",l)};return!function(e){return e.setHeader&&"function"==typeof e.abort}(t)?a&&!t._writableState&&(t.on("end",u),t.on("close",u)):(t.on("complete",l),t.on("abort",p),t.req?m():t.on("request",m)),t.on("end",f),t.on("finish",l),!1!==r.error&&t.on("error",h),t.on("close",p),function(){t.removeListener("complete",l),t.removeListener("abort",p),t.removeListener("request",m),t.req&&t.req.removeListener("finish",l),t.removeListener("end",u),t.removeListener("close",u),t.removeListener("finish",l),t.removeListener("end",f),t.removeListener("error",h),t.removeListener("close",p)}}}}},{package:"@lavamoat/lavapack>readable-stream",file:"../../node_modules/readable-stream/lib/internal/streams/end-of-stream.js"}],[140,{"../../../errors":130},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){function n(e,t,r,n,s,i,o){try{var a=e[i](o),u=a.value}catch(e){return void r(e)}a.done?t(u):Promise.resolve(u).then(n,s)}function s(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function i(e,t,r){return(t=function(e){var t=function(e,t){if("object"!=typeof e||null===e)return e;var r=e[Symbol.toPrimitive];if(r!==undefined){var n=r.call(e,t||"default");if("object"!=typeof n)return n;throw new TypeError("@@toPrimitive must return a primitive value.")}return("string"===t?String:Number)(e)}(e,"string");return"symbol"==typeof t?t:String(t)}(t))in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}var o=e("../../../errors").codes.ERR_INVALID_ARG_TYPE;t.exports=function(e,t,r){var a;if(t&&"function"==typeof t.next)a=t;else if(t&&t[Symbol.asyncIterator])a=t[Symbol.asyncIterator]();else{if(!t||!t[Symbol.iterator])throw new o("iterable",["Iterable"],t);a=t[Symbol.iterator]()}var u=new e(function(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?s(Object(r),!0).forEach((function(t){i(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):s(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}({objectMode:!0},r)),c=!1;function l(){return d.apply(this,arguments)}function d(){var e;return e=function*(){try{var e=yield a.next(),t=e.value;e.done?u.push(null):u.push(yield t)?l():c=!1}catch(e){u.destroy(e)}},d=function(){var t=this,r=arguments;return new Promise((function(s,i){var o=e.apply(t,r);function a(e){n(o,s,i,a,u,"next",e)}function u(e){n(o,s,i,a,u,"throw",e)}a(undefined)}))},d.apply(this,arguments)}return u._read=function(){c||(c=!0,l())},u}}}},{package:"@lavamoat/lavapack>readable-stream",file:"../../node_modules/readable-stream/lib/internal/streams/from.js"}],[141,{"../../../errors":130,"./end-of-stream":139},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){var n;var s=e("../../../errors").codes,i=s.ERR_MISSING_ARGS,o=s.ERR_STREAM_DESTROYED;function a(e){if(e)throw e}function u(e){e()}function c(e,t){return e.pipe(t)}t.exports=function(){for(var t=arguments.length,r=new Array(t),s=0;s<t;s++)r[s]=arguments[s];var l,d=function(e){return e.length?"function"!=typeof e[e.length-1]?a:e.pop():a}(r);if(Array.isArray(r[0])&&(r=r[0]),r.length<2)throw new i("streams");var f=r.map((function(t,s){var i=s<r.length-1;return function(t,r,s,i){i=function(e){var t=!1;return function(){t||(t=!0,e.apply(void 0,arguments))}}(i);var a=!1;t.on("close",(function(){a=!0})),n===undefined&&(n=e("./end-of-stream")),n(t,{readable:r,writable:s},(function(e){if(e)return i(e);a=!0,i()}));var u=!1;return function(e){if(!a&&!u)return u=!0,function(e){return e.setHeader&&"function"==typeof e.abort}(t)?t.abort():"function"==typeof t.destroy?t.destroy():void i(e||new o("pipe"))}}(t,i,s>0,(function(e){l||(l=e),e&&f.forEach(u),i||(f.forEach(u),d(l))}))}));return r.reduce(c)}}}},{package:"@lavamoat/lavapack>readable-stream",file:"../../node_modules/readable-stream/lib/internal/streams/pipeline.js"}],[142,{"../../../errors":130},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){var n=e("../../../errors").codes.ERR_INVALID_OPT_VALUE;t.exports={getHighWaterMark:function(e,t,r,s){var i=function(e,t,r){return null!=e.highWaterMark?e.highWaterMark:t?e[r]:null}(t,s,r);if(null!=i){if(!isFinite(i)||Math.floor(i)!==i||i<0)throw new n(s?r:"highWaterMark",i);return Math.floor(i)}return e.objectMode?16:16384}}}}},{package:"@lavamoat/lavapack>readable-stream",file:"../../node_modules/readable-stream/lib/internal/streams/state.js"}],[143,{stream:"stream"},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){t.exports=e("stream")}}},{package:"@lavamoat/lavapack>readable-stream",file:"../../node_modules/readable-stream/lib/internal/streams/stream.js"}],[144,{"./lib/_stream_duplex.js":131,"./lib/_stream_passthrough.js":132,"./lib/_stream_readable.js":133,"./lib/_stream_transform.js":134,"./lib/_stream_writable.js":135,"./lib/internal/streams/end-of-stream.js":139,"./lib/internal/streams/pipeline.js":141,stream:"stream"},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){var n=e("stream");"disable"===process.env.READABLE_STREAM&&n?(t.exports=n.Readable,Object.assign(t.exports,n),t.exports.Stream=n):((r=t.exports=e("./lib/_stream_readable.js")).Stream=n||r,r.Readable=r,r.Writable=e("./lib/_stream_writable.js"),r.Duplex=e("./lib/_stream_duplex.js"),r.Transform=e("./lib/_stream_transform.js"),r.PassThrough=e("./lib/_stream_passthrough.js"),r.finished=e("./lib/internal/streams/end-of-stream.js"),r.pipeline=e("./lib/internal/streams/pipeline.js"))}}},{package:"@lavamoat/lavapack>readable-stream",file:"../../node_modules/readable-stream/readable.js"}],[145,{buffer:"buffer"},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){
/*! safe-buffer. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> */
var n=e("buffer"),s=n.Buffer;function i(e,t){for(var r in e)t[r]=e[r]}function o(e,t,r){return s(e,t,r)}s.from&&s.alloc&&s.allocUnsafe&&s.allocUnsafeSlow?t.exports=n:(i(n,r),r.Buffer=o),o.prototype=Object.create(s.prototype),i(s,o),o.from=function(e,t,r){if("number"==typeof e)throw new TypeError("Argument must not be a number");return s(e,t,r)},o.alloc=function(e,t,r){if("number"!=typeof e)throw new TypeError("Argument must be a number");var n=s(e);return t!==undefined?"string"==typeof r?n.fill(t,r):n.fill(t):n.fill(0),n},o.allocUnsafe=function(e){if("number"!=typeof e)throw new TypeError("Argument must be a number");return s(e)},o.allocUnsafeSlow=function(e){if("number"!=typeof e)throw new TypeError("Argument must be a number");return n.SlowBuffer(e)}}}},{package:"browserify>browser-pack>safe-buffer",file:"../../node_modules/safe-buffer/index.js"}],[146,{"../functions/cmp":150,"../internal/debug":175,"../internal/parse-options":177,"../internal/re":178,"./range":147,"./semver":148},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){const n=Symbol("SemVer ANY");class s{static get ANY(){return n}constructor(e,t){if(t=i(t),e instanceof s){if(e.loose===!!t.loose)return e;e=e.value}e=e.trim().split(/\s+/).join(" "),c("comparator",e,t),this.options=t,this.loose=!!t.loose,this.parse(e),this.semver===n?this.value="":this.value=this.operator+this.semver.version,c("comp",this)}parse(e){const t=this.options.loose?o[a.COMPARATORLOOSE]:o[a.COMPARATOR],r=e.match(t);if(!r)throw new TypeError(`Invalid comparator: ${e}`);this.operator=r[1]!==undefined?r[1]:"","="===this.operator&&(this.operator=""),r[2]?this.semver=new l(r[2],this.options.loose):this.semver=n}toString(){return this.value}test(e){if(c("Comparator.test",e,this.options.loose),this.semver===n||e===n)return!0;if("string"==typeof e)try{e=new l(e,this.options)}catch(e){return!1}return u(e,this.operator,this.semver,this.options)}intersects(e,t){if(!(e instanceof s))throw new TypeError("a Comparator is required");return""===this.operator?""===this.value||new d(e.value,t).test(this.value):""===e.operator?""===e.value||new d(this.value,t).test(e.semver):(!(t=i(t)).includePrerelease||"<0.0.0-0"!==this.value&&"<0.0.0-0"!==e.value)&&(!(!t.includePrerelease&&(this.value.startsWith("<0.0.0")||e.value.startsWith("<0.0.0")))&&(!(!this.operator.startsWith(">")||!e.operator.startsWith(">"))||(!(!this.operator.startsWith("<")||!e.operator.startsWith("<"))||(!(this.semver.version!==e.semver.version||!this.operator.includes("=")||!e.operator.includes("="))||(!!(u(this.semver,"<",e.semver,t)&&this.operator.startsWith(">")&&e.operator.startsWith("<"))||!!(u(this.semver,">",e.semver,t)&&this.operator.startsWith("<")&&e.operator.startsWith(">")))))))}}t.exports=s;const i=e("../internal/parse-options"),{safeRe:o,t:a}=e("../internal/re"),u=e("../functions/cmp"),c=e("../internal/debug"),l=e("./semver"),d=e("./range")}}},{package:"@swc/cli>semver",file:"../../node_modules/semver/classes/comparator.js"}],[147,{"../internal/constants":174,"../internal/debug":175,"../internal/parse-options":177,"../internal/re":178,"./comparator":146,"./semver":148,"lru-cache":179},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){class n{constructor(e,t){if(t=i(t),e instanceof n)return e.loose===!!t.loose&&e.includePrerelease===!!t.includePrerelease?e:new n(e.raw,t);if(e instanceof o)return this.raw=e.value,this.set=[[e]],this.format(),this;if(this.options=t,this.loose=!!t.loose,this.includePrerelease=!!t.includePrerelease,this.raw=e.trim().split(/\s+/).join(" "),this.set=this.raw.split("||").map((e=>this.parseRange(e.trim()))).filter((e=>e.length)),!this.set.length)throw new TypeError(`Invalid SemVer Range: ${this.raw}`);if(this.set.length>1){const e=this.set[0];if(this.set=this.set.filter((e=>!g(e[0]))),0===this.set.length)this.set=[e];else if(this.set.length>1)for(const e of this.set)if(1===e.length&&b(e[0])){this.set=[e];break}}this.format()}format(){return this.range=this.set.map((e=>e.join(" ").trim())).join("||").trim(),this.range}toString(){return this.range}parseRange(e){const t=((this.options.includePrerelease&&p)|(this.options.loose&&m))+":"+e,r=s.get(t);if(r)return r;const n=this.options.loose,i=n?c[l.HYPHENRANGELOOSE]:c[l.HYPHENRANGE];e=e.replace(i,M(this.options.includePrerelease)),a("hyphen replace",e),e=e.replace(c[l.COMPARATORTRIM],d),a("comparator trim",e),e=e.replace(c[l.TILDETRIM],f),a("tilde trim",e),e=e.replace(c[l.CARETTRIM],h),a("caret trim",e);let u=e.split(" ").map((e=>y(e,this.options))).join(" ").split(/\s+/).map((e=>x(e,this.options)));n&&(u=u.filter((e=>(a("loose invalid filter",e,this.options),!!e.match(c[l.COMPARATORLOOSE]))))),a("range list",u);const b=new Map,w=u.map((e=>new o(e,this.options)));for(const e of w){if(g(e))return[e];b.set(e.value,e)}b.size>1&&b.has("")&&b.delete("");const v=[...b.values()];return s.set(t,v),v}intersects(e,t){if(!(e instanceof n))throw new TypeError("a Range is required");return this.set.some((r=>w(r,t)&&e.set.some((e=>w(e,t)&&r.every((r=>e.every((e=>r.intersects(e,t)))))))))}test(e){if(!e)return!1;if("string"==typeof e)try{e=new u(e,this.options)}catch(e){return!1}for(let t=0;t<this.set.length;t++)if(O(this.set[t],e,this.options))return!0;return!1}}t.exports=n;const s=new(e("lru-cache"))({max:1e3}),i=e("../internal/parse-options"),o=e("./comparator"),a=e("../internal/debug"),u=e("./semver"),{safeRe:c,t:l,comparatorTrimReplace:d,tildeTrimReplace:f,caretTrimReplace:h}=e("../internal/re"),{FLAG_INCLUDE_PRERELEASE:p,FLAG_LOOSE:m}=e("../internal/constants"),g=e=>"<0.0.0-0"===e.value,b=e=>""===e.value,w=(e,t)=>{let r=!0;const n=e.slice();let s=n.pop();for(;r&&n.length;)r=n.every((e=>s.intersects(e,t))),s=n.pop();return r},y=(e,t)=>(a("comp",e,t),e=E(e,t),a("caret",e),e=_(e,t),a("tildes",e),e=T(e,t),a("xrange",e),e=R(e,t),a("stars",e),e),v=e=>!e||"x"===e.toLowerCase()||"*"===e,_=(e,t)=>e.trim().split(/\s+/).map((e=>S(e,t))).join(" "),S=(e,t)=>{const r=t.loose?c[l.TILDELOOSE]:c[l.TILDE];return e.replace(r,((t,r,n,s,i)=>{let o;return a("tilde",e,t,r,n,s,i),v(r)?o="":v(n)?o=`>=${r}.0.0 <${+r+1}.0.0-0`:v(s)?o=`>=${r}.${n}.0 <${r}.${+n+1}.0-0`:i?(a("replaceTilde pr",i),o=`>=${r}.${n}.${s}-${i} <${r}.${+n+1}.0-0`):o=`>=${r}.${n}.${s} <${r}.${+n+1}.0-0`,a("tilde return",o),o}))},E=(e,t)=>e.trim().split(/\s+/).map((e=>k(e,t))).join(" "),k=(e,t)=>{a("caret",e,t);const r=t.loose?c[l.CARETLOOSE]:c[l.CARET],n=t.includePrerelease?"-0":"";return e.replace(r,((t,r,s,i,o)=>{let u;return a("caret",e,t,r,s,i,o),v(r)?u="":v(s)?u=`>=${r}.0.0${n} <${+r+1}.0.0-0`:v(i)?u="0"===r?`>=${r}.${s}.0${n} <${r}.${+s+1}.0-0`:`>=${r}.${s}.0${n} <${+r+1}.0.0-0`:o?(a("replaceCaret pr",o),u="0"===r?"0"===s?`>=${r}.${s}.${i}-${o} <${r}.${s}.${+i+1}-0`:`>=${r}.${s}.${i}-${o} <${r}.${+s+1}.0-0`:`>=${r}.${s}.${i}-${o} <${+r+1}.0.0-0`):(a("no pr"),u="0"===r?"0"===s?`>=${r}.${s}.${i}${n} <${r}.${s}.${+i+1}-0`:`>=${r}.${s}.${i}${n} <${r}.${+s+1}.0-0`:`>=${r}.${s}.${i} <${+r+1}.0.0-0`),a("caret return",u),u}))},T=(e,t)=>(a("replaceXRanges",e,t),e.split(/\s+/).map((e=>j(e,t))).join(" ")),j=(e,t)=>{e=e.trim();const r=t.loose?c[l.XRANGELOOSE]:c[l.XRANGE];return e.replace(r,((r,n,s,i,o,u)=>{a("xRange",e,r,n,s,i,o,u);const c=v(s),l=c||v(i),d=l||v(o),f=d;return"="===n&&f&&(n=""),u=t.includePrerelease?"-0":"",c?r=">"===n||"<"===n?"<0.0.0-0":"*":n&&f?(l&&(i=0),o=0,">"===n?(n=">=",l?(s=+s+1,i=0,o=0):(i=+i+1,o=0)):"<="===n&&(n="<",l?s=+s+1:i=+i+1),"<"===n&&(u="-0"),r=`${n+s}.${i}.${o}${u}`):l?r=`>=${s}.0.0${u} <${+s+1}.0.0-0`:d&&(r=`>=${s}.${i}.0${u} <${s}.${+i+1}.0-0`),a("xRange return",r),r}))},R=(e,t)=>(a("replaceStars",e,t),e.trim().replace(c[l.STAR],"")),x=(e,t)=>(a("replaceGTE0",e,t),e.trim().replace(c[t.includePrerelease?l.GTE0PRE:l.GTE0],"")),M=e=>(t,r,n,s,i,o,a,u,c,l,d,f,h)=>`${r=v(n)?"":v(s)?`>=${n}.0.0${e?"-0":""}`:v(i)?`>=${n}.${s}.0${e?"-0":""}`:o?`>=${r}`:`>=${r}${e?"-0":""}`} ${u=v(c)?"":v(l)?`<${+c+1}.0.0-0`:v(d)?`<${c}.${+l+1}.0-0`:f?`<=${c}.${l}.${d}-${f}`:e?`<${c}.${l}.${+d+1}-0`:`<=${u}`}`.trim(),O=(e,t,r)=>{for(let r=0;r<e.length;r++)if(!e[r].test(t))return!1;if(t.prerelease.length&&!r.includePrerelease){for(let r=0;r<e.length;r++)if(a(e[r].semver),e[r].semver!==o.ANY&&e[r].semver.prerelease.length>0){const n=e[r].semver;if(n.major===t.major&&n.minor===t.minor&&n.patch===t.patch)return!0}return!1}return!0}}}},{package:"@swc/cli>semver",file:"../../node_modules/semver/classes/range.js"}],[148,{"../internal/constants":174,"../internal/debug":175,"../internal/identifiers":176,"../internal/parse-options":177,"../internal/re":178},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){const n=e("../internal/debug"),{MAX_LENGTH:s,MAX_SAFE_INTEGER:i}=e("../internal/constants"),{safeRe:o,t:a}=e("../internal/re"),u=e("../internal/parse-options"),{compareIdentifiers:c}=e("../internal/identifiers");class l{constructor(e,t){if(t=u(t),e instanceof l){if(e.loose===!!t.loose&&e.includePrerelease===!!t.includePrerelease)return e;e=e.version}else if("string"!=typeof e)throw new TypeError(`Invalid version. Must be a string. Got type "${typeof e}".`);if(e.length>s)throw new TypeError(`version is longer than ${s} characters`);n("SemVer",e,t),this.options=t,this.loose=!!t.loose,this.includePrerelease=!!t.includePrerelease;const r=e.trim().match(t.loose?o[a.LOOSE]:o[a.FULL]);if(!r)throw new TypeError(`Invalid Version: ${e}`);if(this.raw=e,this.major=+r[1],this.minor=+r[2],this.patch=+r[3],this.major>i||this.major<0)throw new TypeError("Invalid major version");if(this.minor>i||this.minor<0)throw new TypeError("Invalid minor version");if(this.patch>i||this.patch<0)throw new TypeError("Invalid patch version");r[4]?this.prerelease=r[4].split(".").map((e=>{if(/^[0-9]+$/.test(e)){const t=+e;if(t>=0&&t<i)return t}return e})):this.prerelease=[],this.build=r[5]?r[5].split("."):[],this.format()}format(){return this.version=`${this.major}.${this.minor}.${this.patch}`,this.prerelease.length&&(this.version+=`-${this.prerelease.join(".")}`),this.version}toString(){return this.version}compare(e){if(n("SemVer.compare",this.version,this.options,e),!(e instanceof l)){if("string"==typeof e&&e===this.version)return 0;e=new l(e,this.options)}return e.version===this.version?0:this.compareMain(e)||this.comparePre(e)}compareMain(e){return e instanceof l||(e=new l(e,this.options)),c(this.major,e.major)||c(this.minor,e.minor)||c(this.patch,e.patch)}comparePre(e){if(e instanceof l||(e=new l(e,this.options)),this.prerelease.length&&!e.prerelease.length)return-1;if(!this.prerelease.length&&e.prerelease.length)return 1;if(!this.prerelease.length&&!e.prerelease.length)return 0;let t=0;do{const r=this.prerelease[t],s=e.prerelease[t];if(n("prerelease compare",t,r,s),r===undefined&&s===undefined)return 0;if(s===undefined)return 1;if(r===undefined)return-1;if(r!==s)return c(r,s)}while(++t)}compareBuild(e){e instanceof l||(e=new l(e,this.options));let t=0;do{const r=this.build[t],s=e.build[t];if(n("prerelease compare",t,r,s),r===undefined&&s===undefined)return 0;if(s===undefined)return 1;if(r===undefined)return-1;if(r!==s)return c(r,s)}while(++t)}inc(e,t,r){switch(e){case"premajor":this.prerelease.length=0,this.patch=0,this.minor=0,this.major++,this.inc("pre",t,r);break;case"preminor":this.prerelease.length=0,this.patch=0,this.minor++,this.inc("pre",t,r);break;case"prepatch":this.prerelease.length=0,this.inc("patch",t,r),this.inc("pre",t,r);break;case"prerelease":0===this.prerelease.length&&this.inc("patch",t,r),this.inc("pre",t,r);break;case"major":0===this.minor&&0===this.patch&&0!==this.prerelease.length||this.major++,this.minor=0,this.patch=0,this.prerelease=[];break;case"minor":0===this.patch&&0!==this.prerelease.length||this.minor++,this.patch=0,this.prerelease=[];break;case"patch":0===this.prerelease.length&&this.patch++,this.prerelease=[];break;case"pre":{const e=Number(r)?1:0;if(!t&&!1===r)throw new Error("invalid increment argument: identifier is empty");if(0===this.prerelease.length)this.prerelease=[e];else{let n=this.prerelease.length;for(;--n>=0;)"number"==typeof this.prerelease[n]&&(this.prerelease[n]++,n=-2);if(-1===n){if(t===this.prerelease.join(".")&&!1===r)throw new Error("invalid increment argument: identifier already exists");this.prerelease.push(e)}}if(t){let n=[t,e];!1===r&&(n=[t]),0===c(this.prerelease[0],t)?isNaN(this.prerelease[1])&&(this.prerelease=n):this.prerelease=n}break}default:throw new Error(`invalid increment argument: ${e}`)}return this.raw=this.format(),this.build.length&&(this.raw+=`+${this.build.join(".")}`),this}}t.exports=l}}},{package:"@swc/cli>semver",file:"../../node_modules/semver/classes/semver.js"}],[149,{"./parse":165},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){const n=e("./parse");t.exports=(e,t)=>{const r=n(e.trim().replace(/^[=v]+/,""),t);return r?r.version:null}}}},{package:"@swc/cli>semver",file:"../../node_modules/semver/functions/clean.js"}],[150,{"./eq":156,"./gt":157,"./gte":158,"./lt":160,"./lte":161,"./neq":164},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){const n=e("./eq"),s=e("./neq"),i=e("./gt"),o=e("./gte"),a=e("./lt"),u=e("./lte");t.exports=(e,t,r,c)=>{switch(t){case"===":return"object"==typeof e&&(e=e.version),"object"==typeof r&&(r=r.version),e===r;case"!==":return"object"==typeof e&&(e=e.version),"object"==typeof r&&(r=r.version),e!==r;case"":case"=":case"==":return n(e,r,c);case"!=":return s(e,r,c);case">":return i(e,r,c);case">=":return o(e,r,c);case"<":return a(e,r,c);case"<=":return u(e,r,c);default:throw new TypeError(`Invalid operator: ${t}`)}}}}},{package:"@swc/cli>semver",file:"../../node_modules/semver/functions/cmp.js"}],[151,{"../classes/semver":148,"../internal/re":178,"./parse":165},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){const n=e("../classes/semver"),s=e("./parse"),{safeRe:i,t:o}=e("../internal/re");t.exports=(e,t)=>{if(e instanceof n)return e;if("number"==typeof e&&(e=String(e)),"string"!=typeof e)return null;let r=null;if((t=t||{}).rtl){let t;for(;(t=i[o.COERCERTL].exec(e))&&(!r||r.index+r[0].length!==e.length);)r&&t.index+t[0].length===r.index+r[0].length||(r=t),i[o.COERCERTL].lastIndex=t.index+t[1].length+t[2].length;i[o.COERCERTL].lastIndex=-1}else r=e.match(i[o.COERCE]);return null===r?null:s(`${r[2]}.${r[3]||"0"}.${r[4]||"0"}`,t)}}}},{package:"@swc/cli>semver",file:"../../node_modules/semver/functions/coerce.js"}],[152,{"../classes/semver":148},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){const n=e("../classes/semver");t.exports=(e,t,r)=>{const s=new n(e,r),i=new n(t,r);return s.compare(i)||s.compareBuild(i)}}}},{package:"@swc/cli>semver",file:"../../node_modules/semver/functions/compare-build.js"}],[153,{"./compare":154},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){const n=e("./compare");t.exports=(e,t)=>n(e,t,!0)}}},{package:"@swc/cli>semver",file:"../../node_modules/semver/functions/compare-loose.js"}],[154,{"../classes/semver":148},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){const n=e("../classes/semver");t.exports=(e,t,r)=>new n(e,r).compare(new n(t,r))}}},{package:"@swc/cli>semver",file:"../../node_modules/semver/functions/compare.js"}],[155,{"./parse.js":165},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){const n=e("./parse.js");t.exports=(e,t)=>{const r=n(e,null,!0),s=n(t,null,!0),i=r.compare(s);if(0===i)return null;const o=i>0,a=o?r:s,u=o?s:r,c=!!a.prerelease.length;if(!!u.prerelease.length&&!c)return u.patch||u.minor?a.patch?"patch":a.minor?"minor":"major":"major";const l=c?"pre":"";return r.major!==s.major?l+"major":r.minor!==s.minor?l+"minor":r.patch!==s.patch?l+"patch":"prerelease"}}}},{package:"@swc/cli>semver",file:"../../node_modules/semver/functions/diff.js"}],[156,{"./compare":154},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){const n=e("./compare");t.exports=(e,t,r)=>0===n(e,t,r)}}},{package:"@swc/cli>semver",file:"../../node_modules/semver/functions/eq.js"}],[157,{"./compare":154},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){const n=e("./compare");t.exports=(e,t,r)=>n(e,t,r)>0}}},{package:"@swc/cli>semver",file:"../../node_modules/semver/functions/gt.js"}],[158,{"./compare":154},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){const n=e("./compare");t.exports=(e,t,r)=>n(e,t,r)>=0}}},{package:"@swc/cli>semver",file:"../../node_modules/semver/functions/gte.js"}],[159,{"../classes/semver":148},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){const n=e("../classes/semver");t.exports=(e,t,r,s,i)=>{"string"==typeof r&&(i=s,s=r,r=undefined);try{return new n(e instanceof n?e.version:e,r).inc(t,s,i).version}catch(e){return null}}}}},{package:"@swc/cli>semver",file:"../../node_modules/semver/functions/inc.js"}],[160,{"./compare":154},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){const n=e("./compare");t.exports=(e,t,r)=>n(e,t,r)<0}}},{package:"@swc/cli>semver",file:"../../node_modules/semver/functions/lt.js"}],[161,{"./compare":154},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){const n=e("./compare");t.exports=(e,t,r)=>n(e,t,r)<=0}}},{package:"@swc/cli>semver",file:"../../node_modules/semver/functions/lte.js"}],[162,{"../classes/semver":148},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){const n=e("../classes/semver");t.exports=(e,t)=>new n(e,t).major}}},{package:"@swc/cli>semver",file:"../../node_modules/semver/functions/major.js"}],[163,{"../classes/semver":148},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){const n=e("../classes/semver");t.exports=(e,t)=>new n(e,t).minor}}},{package:"@swc/cli>semver",file:"../../node_modules/semver/functions/minor.js"}],[164,{"./compare":154},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){const n=e("./compare");t.exports=(e,t,r)=>0!==n(e,t,r)}}},{package:"@swc/cli>semver",file:"../../node_modules/semver/functions/neq.js"}],[165,{"../classes/semver":148},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){const n=e("../classes/semver");t.exports=(e,t,r=!1)=>{if(e instanceof n)return e;try{return new n(e,t)}catch(e){if(!r)return null;throw e}}}}},{package:"@swc/cli>semver",file:"../../node_modules/semver/functions/parse.js"}],[166,{"../classes/semver":148},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){const n=e("../classes/semver");t.exports=(e,t)=>new n(e,t).patch}}},{package:"@swc/cli>semver",file:"../../node_modules/semver/functions/patch.js"}],[167,{"./parse":165},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){const n=e("./parse");t.exports=(e,t)=>{const r=n(e,t);return r&&r.prerelease.length?r.prerelease:null}}}},{package:"@swc/cli>semver",file:"../../node_modules/semver/functions/prerelease.js"}],[168,{"./compare":154},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){const n=e("./compare");t.exports=(e,t,r)=>n(t,e,r)}}},{package:"@swc/cli>semver",file:"../../node_modules/semver/functions/rcompare.js"}],[169,{"./compare-build":152},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){const n=e("./compare-build");t.exports=(e,t)=>e.sort(((e,r)=>n(r,e,t)))}}},{package:"@swc/cli>semver",file:"../../node_modules/semver/functions/rsort.js"}],[170,{"../classes/range":147},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){const n=e("../classes/range");t.exports=(e,t,r)=>{try{t=new n(t,r)}catch(e){return!1}return t.test(e)}}}},{package:"@swc/cli>semver",file:"../../node_modules/semver/functions/satisfies.js"}],[171,{"./compare-build":152},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){const n=e("./compare-build");t.exports=(e,t)=>e.sort(((e,r)=>n(e,r,t)))}}},{package:"@swc/cli>semver",file:"../../node_modules/semver/functions/sort.js"}],[172,{"./parse":165},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){const n=e("./parse");t.exports=(e,t)=>{const r=n(e,t);return r?r.version:null}}}},{package:"@swc/cli>semver",file:"../../node_modules/semver/functions/valid.js"}],[173,{"./classes/comparator":146,"./classes/range":147,"./classes/semver":148,"./functions/clean":149,"./functions/cmp":150,"./functions/coerce":151,"./functions/compare":154,"./functions/compare-build":152,"./functions/compare-loose":153,"./functions/diff":155,"./functions/eq":156,"./functions/gt":157,"./functions/gte":158,"./functions/inc":159,"./functions/lt":160,"./functions/lte":161,"./functions/major":162,"./functions/minor":163,"./functions/neq":164,"./functions/parse":165,"./functions/patch":166,"./functions/prerelease":167,"./functions/rcompare":168,"./functions/rsort":169,"./functions/satisfies":170,"./functions/sort":171,"./functions/valid":172,"./internal/constants":174,"./internal/identifiers":176,"./internal/re":178,"./ranges/gtr":180,"./ranges/intersects":181,"./ranges/ltr":182,"./ranges/max-satisfying":183,"./ranges/min-satisfying":184,"./ranges/min-version":185,"./ranges/outside":186,"./ranges/simplify":187,"./ranges/subset":188,"./ranges/to-comparators":189,"./ranges/valid":190},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){const n=e("./internal/re"),s=e("./internal/constants"),i=e("./classes/semver"),o=e("./internal/identifiers"),a=e("./functions/parse"),u=e("./functions/valid"),c=e("./functions/clean"),l=e("./functions/inc"),d=e("./functions/diff"),f=e("./functions/major"),h=e("./functions/minor"),p=e("./functions/patch"),m=e("./functions/prerelease"),g=e("./functions/compare"),b=e("./functions/rcompare"),w=e("./functions/compare-loose"),y=e("./functions/compare-build"),v=e("./functions/sort"),_=e("./functions/rsort"),S=e("./functions/gt"),E=e("./functions/lt"),k=e("./functions/eq"),T=e("./functions/neq"),j=e("./functions/gte"),R=e("./functions/lte"),x=e("./functions/cmp"),M=e("./functions/coerce"),O=e("./classes/comparator"),P=e("./classes/range"),C=e("./functions/satisfies"),I=e("./ranges/to-comparators"),A=e("./ranges/max-satisfying"),N=e("./ranges/min-satisfying"),L=e("./ranges/min-version"),$=e("./ranges/valid"),D=e("./ranges/outside"),B=e("./ranges/gtr"),F=e("./ranges/ltr"),W=e("./ranges/intersects"),q=e("./ranges/simplify"),U=e("./ranges/subset");t.exports={parse:a,valid:u,clean:c,inc:l,diff:d,major:f,minor:h,patch:p,prerelease:m,compare:g,rcompare:b,compareLoose:w,compareBuild:y,sort:v,rsort:_,gt:S,lt:E,eq:k,neq:T,gte:j,lte:R,cmp:x,coerce:M,Comparator:O,Range:P,satisfies:C,toComparators:I,maxSatisfying:A,minSatisfying:N,minVersion:L,validRange:$,outside:D,gtr:B,ltr:F,intersects:W,simplifyRange:q,subset:U,SemVer:i,re:n.re,src:n.src,tokens:n.t,SEMVER_SPEC_VERSION:s.SEMVER_SPEC_VERSION,RELEASE_TYPES:s.RELEASE_TYPES,compareIdentifiers:o.compareIdentifiers,rcompareIdentifiers:o.rcompareIdentifiers}}}},{package:"@swc/cli>semver",file:"../../node_modules/semver/index.js"}],[174,{},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){const n=Number.MAX_SAFE_INTEGER||9007199254740991;t.exports={MAX_LENGTH:256,MAX_SAFE_COMPONENT_LENGTH:16,MAX_SAFE_BUILD_LENGTH:250,MAX_SAFE_INTEGER:n,RELEASE_TYPES:["major","premajor","minor","preminor","patch","prepatch","prerelease"],SEMVER_SPEC_VERSION:"2.0.0",FLAG_INCLUDE_PRERELEASE:1,FLAG_LOOSE:2}}}},{package:"@swc/cli>semver",file:"../../node_modules/semver/internal/constants.js"}],[175,{},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){const n="object"==typeof process&&process.env&&process.env.NODE_DEBUG&&/\bsemver\b/i.test(process.env.NODE_DEBUG)?(...e)=>console.error("SEMVER",...e):()=>{};t.exports=n}}},{package:"@swc/cli>semver",file:"../../node_modules/semver/internal/debug.js"}],[176,{},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){const n=/^[0-9]+$/,s=(e,t)=>{const r=n.test(e),s=n.test(t);return r&&s&&(e=+e,t=+t),e===t?0:r&&!s?-1:s&&!r?1:e<t?-1:1};t.exports={compareIdentifiers:s,rcompareIdentifiers:(e,t)=>s(t,e)}}}},{package:"@swc/cli>semver",file:"../../node_modules/semver/internal/identifiers.js"}],[177,{},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){const n=Object.freeze({loose:!0}),s=Object.freeze({});t.exports=e=>e?"object"!=typeof e?n:e:s}}},{package:"@swc/cli>semver",file:"../../node_modules/semver/internal/parse-options.js"}],[178,{"./constants":174,"./debug":175},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){const{MAX_SAFE_COMPONENT_LENGTH:n,MAX_SAFE_BUILD_LENGTH:s,MAX_LENGTH:i}=e("./constants"),o=e("./debug"),a=(r=t.exports={}).re=[],u=r.safeRe=[],c=r.src=[],l=r.t={};let d=0;const f="[a-zA-Z0-9-]",h=[["\\s",1],["\\d",i],[f,s]],p=(e,t,r)=>{const n=(e=>{for(const[t,r]of h)e=e.split(`${t}*`).join(`${t}{0,${r}}`).split(`${t}+`).join(`${t}{1,${r}}`);return e})(t),s=d++;o(e,s,t),l[e]=s,c[s]=t,a[s]=new RegExp(t,r?"g":undefined),u[s]=new RegExp(n,r?"g":undefined)};p("NUMERICIDENTIFIER","0|[1-9]\\d*"),p("NUMERICIDENTIFIERLOOSE","\\d+"),p("NONNUMERICIDENTIFIER",`\\d*[a-zA-Z-]${f}*`),p("MAINVERSION",`(${c[l.NUMERICIDENTIFIER]})\\.(${c[l.NUMERICIDENTIFIER]})\\.(${c[l.NUMERICIDENTIFIER]})`),p("MAINVERSIONLOOSE",`(${c[l.NUMERICIDENTIFIERLOOSE]})\\.(${c[l.NUMERICIDENTIFIERLOOSE]})\\.(${c[l.NUMERICIDENTIFIERLOOSE]})`),p("PRERELEASEIDENTIFIER",`(?:${c[l.NUMERICIDENTIFIER]}|${c[l.NONNUMERICIDENTIFIER]})`),p("PRERELEASEIDENTIFIERLOOSE",`(?:${c[l.NUMERICIDENTIFIERLOOSE]}|${c[l.NONNUMERICIDENTIFIER]})`),p("PRERELEASE",`(?:-(${c[l.PRERELEASEIDENTIFIER]}(?:\\.${c[l.PRERELEASEIDENTIFIER]})*))`),p("PRERELEASELOOSE",`(?:-?(${c[l.PRERELEASEIDENTIFIERLOOSE]}(?:\\.${c[l.PRERELEASEIDENTIFIERLOOSE]})*))`),p("BUILDIDENTIFIER",`${f}+`),p("BUILD",`(?:\\+(${c[l.BUILDIDENTIFIER]}(?:\\.${c[l.BUILDIDENTIFIER]})*))`),p("FULLPLAIN",`v?${c[l.MAINVERSION]}${c[l.PRERELEASE]}?${c[l.BUILD]}?`),p("FULL",`^${c[l.FULLPLAIN]}$`),p("LOOSEPLAIN",`[v=\\s]*${c[l.MAINVERSIONLOOSE]}${c[l.PRERELEASELOOSE]}?${c[l.BUILD]}?`),p("LOOSE",`^${c[l.LOOSEPLAIN]}$`),p("GTLT","((?:<|>)?=?)"),p("XRANGEIDENTIFIERLOOSE",`${c[l.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`),p("XRANGEIDENTIFIER",`${c[l.NUMERICIDENTIFIER]}|x|X|\\*`),p("XRANGEPLAIN",`[v=\\s]*(${c[l.XRANGEIDENTIFIER]})(?:\\.(${c[l.XRANGEIDENTIFIER]})(?:\\.(${c[l.XRANGEIDENTIFIER]})(?:${c[l.PRERELEASE]})?${c[l.BUILD]}?)?)?`),p("XRANGEPLAINLOOSE",`[v=\\s]*(${c[l.XRANGEIDENTIFIERLOOSE]})(?:\\.(${c[l.XRANGEIDENTIFIERLOOSE]})(?:\\.(${c[l.XRANGEIDENTIFIERLOOSE]})(?:${c[l.PRERELEASELOOSE]})?${c[l.BUILD]}?)?)?`),p("XRANGE",`^${c[l.GTLT]}\\s*${c[l.XRANGEPLAIN]}$`),p("XRANGELOOSE",`^${c[l.GTLT]}\\s*${c[l.XRANGEPLAINLOOSE]}$`),p("COERCE",`${"(^|[^\\d])"+"(\\d{1,"}${n}})(?:\\.(\\d{1,${n}}))?(?:\\.(\\d{1,${n}}))?(?:$|[^\\d])`),p("COERCERTL",c[l.COERCE],!0),p("LONETILDE","(?:~>?)"),p("TILDETRIM",`(\\s*)${c[l.LONETILDE]}\\s+`,!0),r.tildeTrimReplace="$1~",p("TILDE",`^${c[l.LONETILDE]}${c[l.XRANGEPLAIN]}$`),p("TILDELOOSE",`^${c[l.LONETILDE]}${c[l.XRANGEPLAINLOOSE]}$`),p("LONECARET","(?:\\^)"),p("CARETTRIM",`(\\s*)${c[l.LONECARET]}\\s+`,!0),r.caretTrimReplace="$1^",p("CARET",`^${c[l.LONECARET]}${c[l.XRANGEPLAIN]}$`),p("CARETLOOSE",`^${c[l.LONECARET]}${c[l.XRANGEPLAINLOOSE]}$`),p("COMPARATORLOOSE",`^${c[l.GTLT]}\\s*(${c[l.LOOSEPLAIN]})$|^$`),p("COMPARATOR",`^${c[l.GTLT]}\\s*(${c[l.FULLPLAIN]})$|^$`),p("COMPARATORTRIM",`(\\s*)${c[l.GTLT]}\\s*(${c[l.LOOSEPLAIN]}|${c[l.XRANGEPLAIN]})`,!0),r.comparatorTrimReplace="$1$2$3",p("HYPHENRANGE",`^\\s*(${c[l.XRANGEPLAIN]})\\s+-\\s+(${c[l.XRANGEPLAIN]})\\s*$`),p("HYPHENRANGELOOSE",`^\\s*(${c[l.XRANGEPLAINLOOSE]})\\s+-\\s+(${c[l.XRANGEPLAINLOOSE]})\\s*$`),p("STAR","(<|>)?=?\\s*\\*"),p("GTE0","^\\s*>=\\s*0\\.0\\.0\\s*$"),p("GTE0PRE","^\\s*>=\\s*0\\.0\\.0-0\\s*$")}}},{package:"@swc/cli>semver",file:"../../node_modules/semver/internal/re.js"}],[179,{yallist:197},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){const n=e("yallist"),s=Symbol("max"),i=Symbol("length"),o=Symbol("lengthCalculator"),a=Symbol("allowStale"),u=Symbol("maxAge"),c=Symbol("dispose"),l=Symbol("noDisposeOnSet"),d=Symbol("lruList"),f=Symbol("cache"),h=Symbol("updateAgeOnGet"),p=()=>1;const m=(e,t,r)=>{const n=e[f].get(t);if(n){const t=n.value;if(g(e,t)){if(w(e,n),!e[a])return undefined}else r&&(e[h]&&(n.value.now=Date.now()),e[d].unshiftNode(n));return t.value}},g=(e,t)=>{if(!t||!t.maxAge&&!e[u])return!1;const r=Date.now()-t.now;return t.maxAge?r>t.maxAge:e[u]&&r>e[u]},b=e=>{if(e[i]>e[s])for(let t=e[d].tail;e[i]>e[s]&&null!==t;){const r=t.prev;w(e,t),t=r}},w=(e,t)=>{if(t){const r=t.value;e[c]&&e[c](r.key,r.value),e[i]-=r.length,e[f].delete(r.key),e[d].removeNode(t)}};class y{constructor(e,t,r,n,s){this.key=e,this.value=t,this.length=r,this.now=n,this.maxAge=s||0}}const v=(e,t,r,n)=>{let s=r.value;g(e,s)&&(w(e,r),e[a]||(s=undefined)),s&&t.call(n,s.value,s.key,e)};t.exports=class{constructor(e){if("number"==typeof e&&(e={max:e}),e||(e={}),e.max&&("number"!=typeof e.max||e.max<0))throw new TypeError("max must be a non-negative number");this[s]=e.max||Infinity;const t=e.length||p;if(this[o]="function"!=typeof t?p:t,this[a]=e.stale||!1,e.maxAge&&"number"!=typeof e.maxAge)throw new TypeError("maxAge must be a number");this[u]=e.maxAge||0,this[c]=e.dispose,this[l]=e.noDisposeOnSet||!1,this[h]=e.updateAgeOnGet||!1,this.reset()}set max(e){if("number"!=typeof e||e<0)throw new TypeError("max must be a non-negative number");this[s]=e||Infinity,b(this)}get max(){return this[s]}set allowStale(e){this[a]=!!e}get allowStale(){return this[a]}set maxAge(e){if("number"!=typeof e)throw new TypeError("maxAge must be a non-negative number");this[u]=e,b(this)}get maxAge(){return this[u]}set lengthCalculator(e){"function"!=typeof e&&(e=p),e!==this[o]&&(this[o]=e,this[i]=0,this[d].forEach((e=>{e.length=this[o](e.value,e.key),this[i]+=e.length}))),b(this)}get lengthCalculator(){return this[o]}get length(){return this[i]}get itemCount(){return this[d].length}rforEach(e,t){t=t||this;for(let r=this[d].tail;null!==r;){const n=r.prev;v(this,e,r,t),r=n}}forEach(e,t){t=t||this;for(let r=this[d].head;null!==r;){const n=r.next;v(this,e,r,t),r=n}}keys(){return this[d].toArray().map((e=>e.key))}values(){return this[d].toArray().map((e=>e.value))}reset(){this[c]&&this[d]&&this[d].length&&this[d].forEach((e=>this[c](e.key,e.value))),this[f]=new Map,this[d]=new n,this[i]=0}dump(){return this[d].map((e=>!g(this,e)&&{k:e.key,v:e.value,e:e.now+(e.maxAge||0)})).toArray().filter((e=>e))}dumpLru(){return this[d]}set(e,t,r){if((r=r||this[u])&&"number"!=typeof r)throw new TypeError("maxAge must be a number");const n=r?Date.now():0,a=this[o](t,e);if(this[f].has(e)){if(a>this[s])return w(this,this[f].get(e)),!1;const o=this[f].get(e).value;return this[c]&&(this[l]||this[c](e,o.value)),o.now=n,o.maxAge=r,o.value=t,this[i]+=a-o.length,o.length=a,this.get(e),b(this),!0}const h=new y(e,t,a,n,r);return h.length>this[s]?(this[c]&&this[c](e,t),!1):(this[i]+=h.length,this[d].unshift(h),this[f].set(e,this[d].head),b(this),!0)}has(e){if(!this[f].has(e))return!1;const t=this[f].get(e).value;return!g(this,t)}get(e){return m(this,e,!0)}peek(e){return m(this,e,!1)}pop(){const e=this[d].tail;return e?(w(this,e),e.value):null}del(e){w(this,this[f].get(e))}load(e){this.reset();const t=Date.now();for(let r=e.length-1;r>=0;r--){const n=e[r],s=n.e||0;if(0===s)this.set(n.k,n.v);else{const e=s-t;e>0&&this.set(n.k,n.v,e)}}}prune(){this[f].forEach(((e,t)=>m(this,t,!1)))}}}}},{package:"@swc/cli>semver>lru-cache",file:"../../node_modules/semver/node_modules/lru-cache/index.js"}],[180,{"./outside":186},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){const n=e("./outside");t.exports=(e,t,r)=>n(e,t,">",r)}}},{package:"@swc/cli>semver",file:"../../node_modules/semver/ranges/gtr.js"}],[181,{"../classes/range":147},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){const n=e("../classes/range");t.exports=(e,t,r)=>(e=new n(e,r),t=new n(t,r),e.intersects(t,r))}}},{package:"@swc/cli>semver",file:"../../node_modules/semver/ranges/intersects.js"}],[182,{"./outside":186},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){const n=e("./outside");t.exports=(e,t,r)=>n(e,t,"<",r)}}},{package:"@swc/cli>semver",file:"../../node_modules/semver/ranges/ltr.js"}],[183,{"../classes/range":147,"../classes/semver":148},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){const n=e("../classes/semver"),s=e("../classes/range");t.exports=(e,t,r)=>{let i=null,o=null,a=null;try{a=new s(t,r)}catch(e){return null}return e.forEach((e=>{a.test(e)&&(i&&-1!==o.compare(e)||(i=e,o=new n(i,r)))})),i}}}},{package:"@swc/cli>semver",file:"../../node_modules/semver/ranges/max-satisfying.js"}],[184,{"../classes/range":147,"../classes/semver":148},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){const n=e("../classes/semver"),s=e("../classes/range");t.exports=(e,t,r)=>{let i=null,o=null,a=null;try{a=new s(t,r)}catch(e){return null}return e.forEach((e=>{a.test(e)&&(i&&1!==o.compare(e)||(i=e,o=new n(i,r)))})),i}}}},{package:"@swc/cli>semver",file:"../../node_modules/semver/ranges/min-satisfying.js"}],[185,{"../classes/range":147,"../classes/semver":148,"../functions/gt":157},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){const n=e("../classes/semver"),s=e("../classes/range"),i=e("../functions/gt");t.exports=(e,t)=>{e=new s(e,t);let r=new n("0.0.0");if(e.test(r))return r;if(r=new n("0.0.0-0"),e.test(r))return r;r=null;for(let t=0;t<e.set.length;++t){const s=e.set[t];let o=null;s.forEach((e=>{const t=new n(e.semver.version);switch(e.operator){case">":0===t.prerelease.length?t.patch++:t.prerelease.push(0),t.raw=t.format();case"":case">=":o&&!i(t,o)||(o=t);break;case"<":case"<=":break;default:throw new Error(`Unexpected operation: ${e.operator}`)}})),!o||r&&!i(r,o)||(r=o)}return r&&e.test(r)?r:null}}}},{package:"@swc/cli>semver",file:"../../node_modules/semver/ranges/min-version.js"}],[186,{"../classes/comparator":146,"../classes/range":147,"../classes/semver":148,"../functions/gt":157,"../functions/gte":158,"../functions/lt":160,"../functions/lte":161,"../functions/satisfies":170},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){const n=e("../classes/semver"),s=e("../classes/comparator"),{ANY:i}=s,o=e("../classes/range"),a=e("../functions/satisfies"),u=e("../functions/gt"),c=e("../functions/lt"),l=e("../functions/lte"),d=e("../functions/gte");t.exports=(e,t,r,f)=>{let h,p,m,g,b;switch(e=new n(e,f),t=new o(t,f),r){case">":h=u,p=l,m=c,g=">",b=">=";break;case"<":h=c,p=d,m=u,g="<",b="<=";break;default:throw new TypeError('Must provide a hilo val of "<" or ">"')}if(a(e,t,f))return!1;for(let r=0;r<t.set.length;++r){const n=t.set[r];let o=null,a=null;if(n.forEach((e=>{e.semver===i&&(e=new s(">=0.0.0")),o=o||e,a=a||e,h(e.semver,o.semver,f)?o=e:m(e.semver,a.semver,f)&&(a=e)})),o.operator===g||o.operator===b)return!1;if((!a.operator||a.operator===g)&&p(e,a.semver))return!1;if(a.operator===b&&m(e,a.semver))return!1}return!0}}}},{package:"@swc/cli>semver",file:"../../node_modules/semver/ranges/outside.js"}],[187,{"../functions/compare.js":154,"../functions/satisfies.js":170},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){const n=e("../functions/satisfies.js"),s=e("../functions/compare.js");t.exports=(e,t,r)=>{const i=[];let o=null,a=null;const u=e.sort(((e,t)=>s(e,t,r)));for(const e of u){n(e,t,r)?(a=e,o||(o=e)):(a&&i.push([o,a]),a=null,o=null)}o&&i.push([o,null]);const c=[];for(const[e,t]of i)e===t?c.push(e):t||e!==u[0]?t?e===u[0]?c.push(`<=${t}`):c.push(`${e} - ${t}`):c.push(`>=${e}`):c.push("*");const l=c.join(" || "),d="string"==typeof t.raw?t.raw:String(t);return l.length<d.length?l:t}}}},{package:"@swc/cli>semver",file:"../../node_modules/semver/ranges/simplify.js"}],[188,{"../classes/comparator.js":146,"../classes/range.js":147,"../functions/compare.js":154,"../functions/satisfies.js":170},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){const n=e("../classes/range.js"),s=e("../classes/comparator.js"),{ANY:i}=s,o=e("../functions/satisfies.js"),a=e("../functions/compare.js"),u=[new s(">=0.0.0-0")],c=[new s(">=0.0.0")],l=(e,t,r)=>{if(e===t)return!0;if(1===e.length&&e[0].semver===i){if(1===t.length&&t[0].semver===i)return!0;e=r.includePrerelease?u:c}if(1===t.length&&t[0].semver===i){if(r.includePrerelease)return!0;t=c}const n=new Set;let s,l,h,p,m,g,b;for(const t of e)">"===t.operator||">="===t.operator?s=d(s,t,r):"<"===t.operator||"<="===t.operator?l=f(l,t,r):n.add(t.semver);if(n.size>1)return null;if(s&&l){if(h=a(s.semver,l.semver,r),h>0)return null;if(0===h&&(">="!==s.operator||"<="!==l.operator))return null}for(const e of n){if(s&&!o(e,String(s),r))return null;if(l&&!o(e,String(l),r))return null;for(const n of t)if(!o(e,String(n),r))return!1;return!0}let w=!(!l||r.includePrerelease||!l.semver.prerelease.length)&&l.semver,y=!(!s||r.includePrerelease||!s.semver.prerelease.length)&&s.semver;w&&1===w.prerelease.length&&"<"===l.operator&&0===w.prerelease[0]&&(w=!1);for(const e of t){if(b=b||">"===e.operator||">="===e.operator,g=g||"<"===e.operator||"<="===e.operator,s)if(y&&e.semver.prerelease&&e.semver.prerelease.length&&e.semver.major===y.major&&e.semver.minor===y.minor&&e.semver.patch===y.patch&&(y=!1),">"===e.operator||">="===e.operator){if(p=d(s,e,r),p===e&&p!==s)return!1}else if(">="===s.operator&&!o(s.semver,String(e),r))return!1;if(l)if(w&&e.semver.prerelease&&e.semver.prerelease.length&&e.semver.major===w.major&&e.semver.minor===w.minor&&e.semver.patch===w.patch&&(w=!1),"<"===e.operator||"<="===e.operator){if(m=f(l,e,r),m===e&&m!==l)return!1}else if("<="===l.operator&&!o(l.semver,String(e),r))return!1;if(!e.operator&&(l||s)&&0!==h)return!1}return!(s&&g&&!l&&0!==h)&&(!(l&&b&&!s&&0!==h)&&(!y&&!w))},d=(e,t,r)=>{if(!e)return t;const n=a(e.semver,t.semver,r);return n>0?e:n<0||">"===t.operator&&">="===e.operator?t:e},f=(e,t,r)=>{if(!e)return t;const n=a(e.semver,t.semver,r);return n<0?e:n>0||"<"===t.operator&&"<="===e.operator?t:e};t.exports=(e,t,r={})=>{if(e===t)return!0;e=new n(e,r),t=new n(t,r);let s=!1;e:for(const n of e.set){for(const e of t.set){const t=l(n,e,r);if(s=s||null!==t,t)continue e}if(s)return!1}return!0}}}},{package:"@swc/cli>semver",file:"../../node_modules/semver/ranges/subset.js"}],[189,{"../classes/range":147},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){const n=e("../classes/range");t.exports=(e,t)=>new n(e,t).set.map((e=>e.map((e=>e.value)).join(" ").trim().split(" ")))}}},{package:"@swc/cli>semver",file:"../../node_modules/semver/ranges/to-comparators.js"}],[190,{"../classes/range":147},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){const n=e("../classes/range");t.exports=(e,t)=>{try{return new n(e,t).range||"*"}catch(e){return null}}}}},{package:"@swc/cli>semver",file:"../../node_modules/semver/ranges/valid.js"}],[191,{"safe-buffer":145},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){var n=e("safe-buffer").Buffer,s=n.isEncoding||function(e){switch((e=""+e)&&e.toLowerCase()){case"hex":case"utf8":case"utf-8":case"ascii":case"binary":case"base64":case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":case"raw":return!0;default:return!1}};function i(e){var t;switch(this.encoding=function(e){var t=function(e){if(!e)return"utf8";for(var t;;)switch(e){case"utf8":case"utf-8":return"utf8";case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return"utf16le";case"latin1":case"binary":return"latin1";case"base64":case"ascii":case"hex":return e;default:if(t)return;e=(""+e).toLowerCase(),t=!0}}(e);if("string"!=typeof t&&(n.isEncoding===s||!s(e)))throw new Error("Unknown encoding: "+e);return t||e}(e),this.encoding){case"utf16le":this.text=u,this.end=c,t=4;break;case"utf8":this.fillLast=a,t=4;break;case"base64":this.text=l,this.end=d,t=3;break;default:return this.write=f,void(this.end=h)}this.lastNeed=0,this.lastTotal=0,this.lastChar=n.allocUnsafe(t)}function o(e){return e<=127?0:e>>5==6?2:e>>4==14?3:e>>3==30?4:e>>6==2?-1:-2}function a(e){var t=this.lastTotal-this.lastNeed,r=function(e,t,r){if(128!=(192&t[0]))return e.lastNeed=0,"�";if(e.lastNeed>1&&t.length>1){if(128!=(192&t[1]))return e.lastNeed=1,"�";if(e.lastNeed>2&&t.length>2&&128!=(192&t[2]))return e.lastNeed=2,"�"}}(this,e);return r!==undefined?r:this.lastNeed<=e.length?(e.copy(this.lastChar,t,0,this.lastNeed),this.lastChar.toString(this.encoding,0,this.lastTotal)):(e.copy(this.lastChar,t,0,e.length),void(this.lastNeed-=e.length))}function u(e,t){if((e.length-t)%2==0){var r=e.toString("utf16le",t);if(r){var n=r.charCodeAt(r.length-1);if(n>=55296&&n<=56319)return this.lastNeed=2,this.lastTotal=4,this.lastChar[0]=e[e.length-2],this.lastChar[1]=e[e.length-1],r.slice(0,-1)}return r}return this.lastNeed=1,this.lastTotal=2,this.lastChar[0]=e[e.length-1],e.toString("utf16le",t,e.length-1)}function c(e){var t=e&&e.length?this.write(e):"";if(this.lastNeed){var r=this.lastTotal-this.lastNeed;return t+this.lastChar.toString("utf16le",0,r)}return t}function l(e,t){var r=(e.length-t)%3;return 0===r?e.toString("base64",t):(this.lastNeed=3-r,this.lastTotal=3,1===r?this.lastChar[0]=e[e.length-1]:(this.lastChar[0]=e[e.length-2],this.lastChar[1]=e[e.length-1]),e.toString("base64",t,e.length-r))}function d(e){var t=e&&e.length?this.write(e):"";return this.lastNeed?t+this.lastChar.toString("base64",0,3-this.lastNeed):t}function f(e){return e.toString(this.encoding)}function h(e){return e&&e.length?this.write(e):""}r.StringDecoder=i,i.prototype.write=function(e){if(0===e.length)return"";var t,r;if(this.lastNeed){if((t=this.fillLast(e))===undefined)return"";r=this.lastNeed,this.lastNeed=0}else r=0;return r<e.length?t?t+this.text(e,r):this.text(e,r):t||""},i.prototype.end=function(e){var t=e&&e.length?this.write(e):"";return this.lastNeed?t+"�":t},i.prototype.text=function(e,t){var r=function(e,t,r){var n=t.length-1;if(n<r)return 0;var s=o(t[n]);if(s>=0)return s>0&&(e.lastNeed=s-1),s;if(--n<r||-2===s)return 0;if(s=o(t[n]),s>=0)return s>0&&(e.lastNeed=s-2),s;if(--n<r||-2===s)return 0;if(s=o(t[n]),s>=0)return s>0&&(2===s?s=0:e.lastNeed=s-3),s;return 0}(this,e,t);if(!this.lastNeed)return e.toString("utf8",t);this.lastTotal=r;var n=e.length-(r-this.lastNeed);return e.copy(this.lastChar,0,n),e.toString("utf8",t,n)},i.prototype.fillLast=function(e){if(this.lastNeed<=e.length)return e.copy(this.lastChar,this.lastTotal-this.lastNeed,0,this.lastNeed),this.lastChar.toString(this.encoding,0,this.lastTotal);e.copy(this.lastChar,this.lastTotal-this.lastNeed,0,e.length),this.lastNeed-=e.length}}}},{package:"browserify>string_decoder",file:"../../node_modules/string_decoder/lib/string_decoder.js"}],[192,{},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){!function(e,n){"object"==typeof r&&void 0!==t?n(r):"function"==typeof define&&define.amd?define(["exports"],n):n((e="undefined"!=typeof globalThis?globalThis:e||self).Superstruct={})}(this,(function(e){class t extends TypeError{constructor(e,t){let r;const{message:n,explanation:s,...i}=e,{path:o}=e,a=0===o.length?n:`At path: ${o.join(".")} -- ${n}`;super(s??a),null!=s&&(this.cause=a),Object.assign(this,i),this.name=this.constructor.name,this.failures=()=>r??(r=[e,...t()])}}function r(e){return"object"==typeof e&&null!=e}function n(e){if("[object Object]"!==Object.prototype.toString.call(e))return!1;const t=Object.getPrototypeOf(e);return null===t||t===Object.prototype}function s(e){return"symbol"==typeof e?e.toString():"string"==typeof e?JSON.stringify(e):`${e}`}function i(e,t,r,n){if(!0===e)return;!1===e?e={}:"string"==typeof e&&(e={message:e});const{path:i,branch:o}=t,{type:a}=r,{refinement:u,message:c=`Expected a value of type \`${a}\`${u?` with refinement \`${u}\``:""}, but received: \`${s(n)}\``}=e;return{value:n,type:a,refinement:u,key:i[i.length-1],path:i,branch:o,...e,message:c}}function*o(e,t,n,s){var o;r(o=e)&&"function"==typeof o[Symbol.iterator]||(e=[e]);for(const r of e){const e=i(r,t,n,s);e&&(yield e)}}function*a(e,t,n={}){const{path:s=[],branch:i=[e],coerce:o=!1,mask:u=!1}=n,c={path:s,branch:i};if(o&&(e=t.coercer(e,c),u&&"type"!==t.type&&r(t.schema)&&r(e)&&!Array.isArray(e)))for(const r in e)t.schema[r]===undefined&&delete e[r];let l="valid";for(const r of t.validator(e,c))r.explanation=n.message,l="not_valid",yield[r,undefined];for(let[d,f,h]of t.entries(e,c)){const t=a(f,h,{path:d===undefined?s:[...s,d],branch:d===undefined?i:[...i,f],coerce:o,mask:u,message:n.message});for(const n of t)n[0]?(l=null!=n[0].refinement?"not_refined":"not_valid",yield[n[0],undefined]):o&&(f=n[1],d===undefined?e=f:e instanceof Map?e.set(d,f):e instanceof Set?e.add(f):r(e)&&(f!==undefined||d in e)&&(e[d]=f))}if("not_valid"!==l)for(const r of t.refiner(e,c))r.explanation=n.message,l="not_refined",yield[r,undefined];"valid"===l&&(yield[undefined,e])}class u{constructor(e){const{type:t,schema:r,validator:n,refiner:s,coercer:i=(e=>e),entries:a=function*(){}}=e;this.type=t,this.schema=r,this.entries=a,this.coercer=i,this.validator=n?(e,t)=>o(n(e,t),t,this,e):()=>[],this.refiner=s?(e,t)=>o(s(e,t),t,this,e):()=>[]}assert(e,t){return c(e,this,t)}create(e,t){return l(e,this,t)}is(e){return f(e,this)}mask(e,t){return d(e,this,t)}validate(e,t={}){return h(e,this,t)}}function c(e,t,r){const n=h(e,t,{message:r});if(n[0])throw n[0]}function l(e,t,r){const n=h(e,t,{coerce:!0,message:r});if(n[0])throw n[0];return n[1]}function d(e,t,r){const n=h(e,t,{coerce:!0,mask:!0,message:r});if(n[0])throw n[0];return n[1]}function f(e,t){return!h(e,t)[0]}function h(e,r,n={}){const s=a(e,r,n),i=function(e){const{done:t,value:r}=e.next();return t?undefined:r}(s);if(i[0]){return[new t(i[0],(function*(){for(const e of s)e[0]&&(yield e[0])})),undefined]}{const e=i[1];return[undefined,e]}}function p(e,t){return new u({type:e,schema:null,validator:t})}function m(){return p("never",(()=>!1))}function g(e){const t=e?Object.keys(e):[],n=m();return new u({type:"object",schema:e||null,*entries(s){if(e&&r(s)){const r=new Set(Object.keys(s));for(const n of t)r.delete(n),yield[n,s[n],e[n]];for(const e of r)yield[e,s[e],n]}},validator:e=>r(e)||`Expected an object, but received: ${s(e)}`,coercer:e=>r(e)?{...e}:e})}function b(e){return new u({...e,validator:(t,r)=>t===undefined||e.validator(t,r),refiner:(t,r)=>t===undefined||e.refiner(t,r)})}function w(){return p("string",(e=>"string"==typeof e||`Expected a string, but received: ${s(e)}`))}function y(e){const t=Object.keys(e);return new u({type:"type",schema:e,*entries(n){if(r(n))for(const r of t)yield[r,n[r],e[r]]},validator:e=>r(e)||`Expected an object, but received: ${s(e)}`,coercer:e=>r(e)?{...e}:e})}function v(){return p("unknown",(()=>!0))}function _(e,t,r){return new u({...e,coercer:(n,s)=>f(n,t)?e.coercer(r(n,s),s):e.coercer(n,s)})}function S(e){return e instanceof Map||e instanceof Set?e.size:e.length}function E(e,t,r){return new u({...e,*refiner(n,s){yield*e.refiner(n,s);const i=o(r(n,s),s,e,n);for(const e of i)yield{...e,refinement:t}}})}e.Struct=u,e.StructError=t,e.any=function(){return p("any",(()=>!0))},e.array=function(e){return new u({type:"array",schema:e,*entries(t){if(e&&Array.isArray(t))for(const[r,n]of t.entries())yield[r,n,e]},coercer:e=>Array.isArray(e)?e.slice():e,validator:e=>Array.isArray(e)||`Expected an array value, but received: ${s(e)}`})},e.assert=c,e.assign=function(...e){const t="type"===e[0].type,r=e.map((e=>e.schema)),n=Object.assign({},...r);return t?y(n):g(n)},e.bigint=function(){return p("bigint",(e=>"bigint"==typeof e))},e.boolean=function(){return p("boolean",(e=>"boolean"==typeof e))},e.coerce=_,e.create=l,e.date=function(){return p("date",(e=>e instanceof Date&&!isNaN(e.getTime())||`Expected a valid \`Date\` object, but received: ${s(e)}`))},e.defaulted=function(e,t,r={}){return _(e,v(),(e=>{const s="function"==typeof t?t():t;if(e===undefined)return s;if(!r.strict&&n(e)&&n(s)){const t={...e};let r=!1;for(const e in s)t[e]===undefined&&(t[e]=s[e],r=!0);if(r)return t}return e}))},e.define=p,e.deprecated=function(e,t){return new u({...e,refiner:(t,r)=>t===undefined||e.refiner(t,r),validator:(r,n)=>r===undefined||(t(r,n),e.validator(r,n))})},e.dynamic=function(e){return new u({type:"dynamic",schema:null,*entries(t,r){const n=e(t,r);yield*n.entries(t,r)},validator:(t,r)=>e(t,r).validator(t,r),coercer:(t,r)=>e(t,r).coercer(t,r),refiner:(t,r)=>e(t,r).refiner(t,r)})},e.empty=function(e){return E(e,"empty",(t=>{const r=S(t);return 0===r||`Expected an empty ${e.type} but received one with a size of \`${r}\``}))},e.enums=function(e){const t={},r=e.map((e=>s(e))).join();for(const r of e)t[r]=r;return new u({type:"enums",schema:t,validator:t=>e.includes(t)||`Expected one of \`${r}\`, but received: ${s(t)}`})},e.func=function(){return p("func",(e=>"function"==typeof e||`Expected a function, but received: ${s(e)}`))},e.instance=function(e){return p("instance",(t=>t instanceof e||`Expected a \`${e.name}\` instance, but received: ${s(t)}`))},e.integer=function(){return p("integer",(e=>"number"==typeof e&&!isNaN(e)&&Number.isInteger(e)||`Expected an integer, but received: ${s(e)}`))},e.intersection=function(e){return new u({type:"intersection",schema:null,*entries(t,r){for(const n of e)yield*n.entries(t,r)},*validator(t,r){for(const n of e)yield*n.validator(t,r)},*refiner(t,r){for(const n of e)yield*n.refiner(t,r)}})},e.is=f,e.lazy=function(e){let t;return new u({type:"lazy",schema:null,*entries(r,n){t??(t=e()),yield*t.entries(r,n)},validator:(r,n)=>(t??(t=e()),t.validator(r,n)),coercer:(r,n)=>(t??(t=e()),t.coercer(r,n)),refiner:(r,n)=>(t??(t=e()),t.refiner(r,n))})},e.literal=function(e){const t=s(e),r=typeof e;return new u({type:"literal",schema:"string"===r||"number"===r||"boolean"===r?e:null,validator:r=>r===e||`Expected the literal \`${t}\`, but received: ${s(r)}`})},e.map=function(e,t){return new u({type:"map",schema:null,*entries(r){if(e&&t&&r instanceof Map)for(const[n,s]of r.entries())yield[n,n,e],yield[n,s,t]},coercer:e=>e instanceof Map?new Map(e):e,validator:e=>e instanceof Map||`Expected a \`Map\` object, but received: ${s(e)}`})},e.mask=d,e.max=function(e,t,r={}){const{exclusive:n}=r;return E(e,"max",(r=>n?r<t:r<=t||`Expected a ${e.type} less than ${n?"":"or equal to "}${t} but received \`${r}\``))},e.min=function(e,t,r={}){const{exclusive:n}=r;return E(e,"min",(r=>n?r>t:r>=t||`Expected a ${e.type} greater than ${n?"":"or equal to "}${t} but received \`${r}\``))},e.never=m,e.nonempty=function(e){return E(e,"nonempty",(t=>S(t)>0||`Expected a nonempty ${e.type} but received an empty one`))},e.nullable=function(e){return new u({...e,validator:(t,r)=>null===t||e.validator(t,r),refiner:(t,r)=>null===t||e.refiner(t,r)})},e.number=function(){return p("number",(e=>"number"==typeof e&&!isNaN(e)||`Expected a number, but received: ${s(e)}`))},e.object=g,e.omit=function(e,t){const{schema:r}=e,n={...r};for(const e of t)delete n[e];return"type"===e.type?y(n):g(n)},e.optional=b,e.partial=function(e){const t=e instanceof u?{...e.schema}:{...e};for(const e in t)t[e]=b(t[e]);return g(t)},e.pattern=function(e,t){return E(e,"pattern",(r=>t.test(r)||`Expected a ${e.type} matching \`/${t.source}/\` but received "${r}"`))},e.pick=function(e,t){const{schema:r}=e,n={};for(const e of t)n[e]=r[e];return g(n)},e.record=function(e,t){return new u({type:"record",schema:null,*entries(n){if(r(n))for(const r in n){const s=n[r];yield[r,r,e],yield[r,s,t]}},validator:e=>r(e)||`Expected an object, but received: ${s(e)}`})},e.refine=E,e.regexp=function(){return p("regexp",(e=>e instanceof RegExp))},e.set=function(e){return new u({type:"set",schema:null,*entries(t){if(e&&t instanceof Set)for(const r of t)yield[r,r,e]},coercer:e=>e instanceof Set?new Set(e):e,validator:e=>e instanceof Set||`Expected a \`Set\` object, but received: ${s(e)}`})},e.size=function(e,t,r=t){const n=`Expected a ${e.type}`,s=t===r?`of \`${t}\``:`between \`${t}\` and \`${r}\``;return E(e,"size",(e=>{if("number"==typeof e||e instanceof Date)return t<=e&&e<=r||`${n} ${s} but received \`${e}\``;if(e instanceof Map||e instanceof Set){const{size:i}=e;return t<=i&&i<=r||`${n} with a size ${s} but received one with a size of \`${i}\``}{const{length:i}=e;return t<=i&&i<=r||`${n} with a length ${s} but received one with a length of \`${i}\``}}))},e.string=w,e.struct=function(e,t){return console.warn("superstruct@0.11 - The `struct` helper has been renamed to `define`."),p(e,t)},e.trimmed=function(e){return _(e,w(),(e=>e.trim()))},e.tuple=function(e){const t=m();return new u({type:"tuple",schema:null,*entries(r){if(Array.isArray(r)){const n=Math.max(e.length,r.length);for(let s=0;s<n;s++)yield[s,r[s],e[s]||t]}},validator:e=>Array.isArray(e)||`Expected an array, but received: ${s(e)}`})},e.type=y,e.union=function(e){const t=e.map((e=>e.type)).join(" | ");return new u({type:"union",schema:null,coercer(t){for(const r of e){const[e,n]=r.validate(t,{coerce:!0});if(!e)return n}return t},validator(r,n){const i=[];for(const t of e){const[...e]=a(r,t,n),[s]=e;if(!s[0])return[];for(const[t]of e)t&&i.push(t)}return[`Expected the value to satisfy a union of \`${t}\`, but received: ${s(r)}`,...i]}})},e.unknown=v,e.validate=h}))}}},{package:"superstruct",file:"../../node_modules/superstruct/dist/index.cjs"}],[193,{"has-flag":100,os:"os",tty:"tty"},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){const n=e("os"),s=e("tty"),i=e("has-flag"),{env:o}=process;let a;function u(e,{streamIsTTY:t,sniffFlags:r=!0}={}){const s=function(){if("FORCE_COLOR"in o)return"true"===o.FORCE_COLOR?1:"false"===o.FORCE_COLOR?0:0===o.FORCE_COLOR.length?1:Math.min(Number.parseInt(o.FORCE_COLOR,10),3)}();s!==undefined&&(a=s);const u=r?a:s;if(0===u)return 0;if(r){if(i("color=16m")||i("color=full")||i("color=truecolor"))return 3;if(i("color=256"))return 2}if(e&&!t&&u===undefined)return 0;const c=u||0;if("dumb"===o.TERM)return c;if("win32"===process.platform){const e=n.release().split(".");return Number(e[0])>=10&&Number(e[2])>=10586?Number(e[2])>=14931?3:2:1}if("CI"in o)return["TRAVIS","CIRCLECI","APPVEYOR","GITLAB_CI","GITHUB_ACTIONS","BUILDKITE","DRONE"].some((e=>e in o))||"codeship"===o.CI_NAME?1:c;if("TEAMCITY_VERSION"in o)return/^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(o.TEAMCITY_VERSION)?1:0;if("truecolor"===o.COLORTERM)return 3;if("TERM_PROGRAM"in o){const e=Number.parseInt((o.TERM_PROGRAM_VERSION||"").split(".")[0],10);switch(o.TERM_PROGRAM){case"iTerm.app":return e>=3?3:2;case"Apple_Terminal":return 2}}return/-256(color)?$/i.test(o.TERM)?2:/^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(o.TERM)||"COLORTERM"in o?1:c}function c(e,t={}){return function(e){return 0!==e&&{level:e,hasBasic:!0,has256:e>=2,has16m:e>=3}}(u(e,{streamIsTTY:e&&e.isTTY,...t}))}i("no-color")||i("no-colors")||i("color=false")||i("color=never")?a=0:(i("color")||i("colors")||i("color=true")||i("color=always"))&&(a=1),t.exports={supportsColor:c,stdout:c({isTTY:s.isatty(1)}),stderr:c({isTTY:s.isatty(2)})}}}},{package:"@wdio/mocha-framework>mocha>supports-color",file:"../../node_modules/supports-color/index.js"}],[194,{util:"util"},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){t.exports=e("util").deprecate}}},{package:"browserify>readable-stream>util-deprecate",file:"../../node_modules/util-deprecate/node.js"}],[195,{},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){t.exports=function e(t,r){if(t&&r)return e(t)(r);if("function"!=typeof t)throw new TypeError("need wrapper function");return Object.keys(t).forEach((function(e){n[e]=t[e]})),n;function n(){for(var e=new Array(arguments.length),r=0;r<e.length;r++)e[r]=arguments[r];var n=t.apply(this,e),s=e[e.length-1];return"function"==typeof n&&n!==s&&Object.keys(s).forEach((function(e){n[e]=s[e]})),n}}}}},{package:"@metamask/object-multiplex>once>wrappy",file:"../../node_modules/wrappy/wrappy.js"}],[196,{},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){t.exports=function(e){e.prototype[Symbol.iterator]=function*(){for(let e=this.head;e;e=e.next)yield e.value}}}}},{package:"@swc/cli>semver>lru-cache>yallist",file:"../../node_modules/yallist/iterator.js"}],[197,{"./iterator.js":196},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){function n(e){var t=this;if(t instanceof n||(t=new n),t.tail=null,t.head=null,t.length=0,e&&"function"==typeof e.forEach)e.forEach((function(e){t.push(e)}));else if(arguments.length>0)for(var r=0,s=arguments.length;r<s;r++)t.push(arguments[r]);return t}function s(e,t,r){var n=t===e.head?new a(r,null,t,e):new a(r,t,t.next,e);return null===n.next&&(e.tail=n),null===n.prev&&(e.head=n),e.length++,n}function i(e,t){e.tail=new a(t,e.tail,null,e),e.head||(e.head=e.tail),e.length++}function o(e,t){e.head=new a(t,null,e.head,e),e.tail||(e.tail=e.head),e.length++}function a(e,t,r,n){if(!(this instanceof a))return new a(e,t,r,n);this.list=n,this.value=e,t?(t.next=this,this.prev=t):this.prev=null,r?(r.prev=this,this.next=r):this.next=null}t.exports=n,n.Node=a,n.create=n,n.prototype.removeNode=function(e){if(e.list!==this)throw new Error("removing node which does not belong to this list");var t=e.next,r=e.prev;return t&&(t.prev=r),r&&(r.next=t),e===this.head&&(this.head=t),e===this.tail&&(this.tail=r),e.list.length--,e.next=null,e.prev=null,e.list=null,t},n.prototype.unshiftNode=function(e){if(e!==this.head){e.list&&e.list.removeNode(e);var t=this.head;e.list=this,e.next=t,t&&(t.prev=e),this.head=e,this.tail||(this.tail=e),this.length++}},n.prototype.pushNode=function(e){if(e!==this.tail){e.list&&e.list.removeNode(e);var t=this.tail;e.list=this,e.prev=t,t&&(t.next=e),this.tail=e,this.head||(this.head=e),this.length++}},n.prototype.push=function(){for(var e=0,t=arguments.length;e<t;e++)i(this,arguments[e]);return this.length},n.prototype.unshift=function(){for(var e=0,t=arguments.length;e<t;e++)o(this,arguments[e]);return this.length},n.prototype.pop=function(){if(!this.tail)return undefined;var e=this.tail.value;return this.tail=this.tail.prev,this.tail?this.tail.next=null:this.head=null,this.length--,e},n.prototype.shift=function(){if(!this.head)return undefined;var e=this.head.value;return this.head=this.head.next,this.head?this.head.prev=null:this.tail=null,this.length--,e},n.prototype.forEach=function(e,t){t=t||this;for(var r=this.head,n=0;null!==r;n++)e.call(t,r.value,n,this),r=r.next},n.prototype.forEachReverse=function(e,t){t=t||this;for(var r=this.tail,n=this.length-1;null!==r;n--)e.call(t,r.value,n,this),r=r.prev},n.prototype.get=function(e){for(var t=0,r=this.head;null!==r&&t<e;t++)r=r.next;if(t===e&&null!==r)return r.value},n.prototype.getReverse=function(e){for(var t=0,r=this.tail;null!==r&&t<e;t++)r=r.prev;if(t===e&&null!==r)return r.value},n.prototype.map=function(e,t){t=t||this;for(var r=new n,s=this.head;null!==s;)r.push(e.call(t,s.value,this)),s=s.next;return r},n.prototype.mapReverse=function(e,t){t=t||this;for(var r=new n,s=this.tail;null!==s;)r.push(e.call(t,s.value,this)),s=s.prev;return r},n.prototype.reduce=function(e,t){var r,n=this.head;if(arguments.length>1)r=t;else{if(!this.head)throw new TypeError("Reduce of empty list with no initial value");n=this.head.next,r=this.head.value}for(var s=0;null!==n;s++)r=e(r,n.value,s),n=n.next;return r},n.prototype.reduceReverse=function(e,t){var r,n=this.tail;if(arguments.length>1)r=t;else{if(!this.tail)throw new TypeError("Reduce of empty list with no initial value");n=this.tail.prev,r=this.tail.value}for(var s=this.length-1;null!==n;s--)r=e(r,n.value,s),n=n.prev;return r},n.prototype.toArray=function(){for(var e=new Array(this.length),t=0,r=this.head;null!==r;t++)e[t]=r.value,r=r.next;return e},n.prototype.toArrayReverse=function(){for(var e=new Array(this.length),t=0,r=this.tail;null!==r;t++)e[t]=r.value,r=r.prev;return e},n.prototype.slice=function(e,t){(t=t||this.length)<0&&(t+=this.length),(e=e||0)<0&&(e+=this.length);var r=new n;if(t<e||t<0)return r;e<0&&(e=0),t>this.length&&(t=this.length);for(var s=0,i=this.head;null!==i&&s<e;s++)i=i.next;for(;null!==i&&s<t;s++,i=i.next)r.push(i.value);return r},n.prototype.sliceReverse=function(e,t){(t=t||this.length)<0&&(t+=this.length),(e=e||0)<0&&(e+=this.length);var r=new n;if(t<e||t<0)return r;e<0&&(e=0),t>this.length&&(t=this.length);for(var s=this.length,i=this.tail;null!==i&&s>t;s--)i=i.prev;for(;null!==i&&s>e;s--,i=i.prev)r.push(i.value);return r},n.prototype.splice=function(e,t,...r){e>this.length&&(e=this.length-1),e<0&&(e=this.length+e);for(var n=0,i=this.head;null!==i&&n<e;n++)i=i.next;var o=[];for(n=0;i&&n<t;n++)o.push(i.value),i=this.removeNode(i);null===i&&(i=this.tail),i!==this.head&&i!==this.tail&&(i=i.prev);for(n=0;n<r.length;n++)i=s(this,i,r[n]);return o},n.prototype.reverse=function(){for(var e=this.head,t=this.tail,r=e;null!==r;r=r.prev){var n=r.prev;r.prev=r.next,r.next=n}return this.head=t,this.tail=e,this};try{e("./iterator.js")(n)}catch(e){}}}},{package:"@swc/cli>semver>lru-cache>yallist",file:"../../node_modules/yallist/yallist.js"}],[198,{"../logging":217,"./../../../snaps-utils/src/index.executionenv":221,"./commands":199,"./endowments":204,"./globalEvents":211,"./sortParams":214,"./utils":215,"./validation":216,"@metamask/providers":51,"@metamask/utils":69,"eth-rpc-errors":95,"json-rpc-engine":110,superstruct:192},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){Object.defineProperty(r,"__esModule",{value:!0}),r.BaseSnapExecutor=void 0;var n=e("@metamask/providers"),s=e("./../../../snaps-utils/src/index.executionenv"),i=e("@metamask/utils"),o=e("eth-rpc-errors"),a=e("json-rpc-engine"),u=e("superstruct"),c=e("../logging"),l=e("./commands"),d=e("./endowments"),f=e("./globalEvents"),h=e("./sortParams"),p=e("./utils"),m=e("./validation");function g(e,t,r){return(t=function(e){var t=function(e,t){if("object"!=typeof e||null===e)return e;var r=e[Symbol.toPrimitive];if(r!==undefined){var n=r.call(e,t||"default");if("object"!=typeof n)return n;throw new TypeError("@@toPrimitive must return a primitive value.")}return("string"===t?String:Number)(e)}(e,"string");return"symbol"==typeof t?t:String(t)}(t))in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}const b={code:o.errorCodes.rpc.internal,message:"Execution Environment Error"},w={ping:{struct:m.PingRequestArgumentsStruct,params:[]},executeSnap:{struct:m.ExecuteSnapRequestArgumentsStruct,params:["snapId","sourceCode","endowments"]},terminate:{struct:m.TerminateRequestArgumentsStruct,params:[]},snapRpc:{struct:m.SnapRpcRequestArgumentsStruct,params:["target","handler","origin","request"]}};r.BaseSnapExecutor=class{constructor(e,t){g(this,"snapData",void 0),g(this,"commandStream",void 0),g(this,"rpcStream",void 0),g(this,"methods",void 0),g(this,"snapErrorHandler",void 0),g(this,"snapPromiseErrorHandler",void 0),g(this,"lastTeardown",0),this.snapData=new Map,this.commandStream=e,this.commandStream.on("data",(e=>{this.onCommandRequest(e).catch((e=>{(0,s.logError)(e)}))})),this.rpcStream=t,this.methods=(0,l.getCommandMethodImplementations)(this.startSnap.bind(this),(async(e,t,r)=>{const n=this.snapData.get(e),o=null==n?void 0:n.exports[t],{required:a}=s.SNAP_EXPORTS[t];if((0,i.assert)(!a||o!==undefined,`No ${t} handler exported for snap "${e}`),!o)return null;let u=await this.executeInSnapContext(e,(()=>o(r)));u===undefined&&(u=null);try{return(0,i.getSafeJson)(u)}catch(e){throw new TypeError(`Received non-JSON-serializable value: ${e.message.replace(/^Assertion failed: /u,"")}`)}}),this.onTerminate.bind(this))}errorHandler(e,t){const r=(0,p.constructError)(e),n=(0,o.serializeError)(r,{fallbackError:b,shouldIncludeStack:!1}),s={...t,stack:(null==r?void 0:r.stack)??null};this.notify({method:"UnhandledError",params:{error:{...n,data:s}}})}async onCommandRequest(e){if(!(0,i.isJsonRpcRequest)(e))throw new Error("Command stream received a non-JSON-RPC request.");const{id:t,method:r,params:n}=e;if(!(0,i.hasProperty)(w,r))return void this.respond(t,{error:o.ethErrors.rpc.methodNotFound({data:{method:r}}).serialize()});const s=w[r],a=(0,h.sortParamKeys)(s.params,n),[c]=(0,u.validate)(a,s.struct);if(c)this.respond(t,{error:o.ethErrors.rpc.invalidParams({message:`Invalid parameters for method "${r}": ${c.message}.`,data:{method:r,params:a}}).serialize()});else try{const e=await this.methods[r](...a);this.respond(t,{result:e})}catch(e){this.respond(t,{error:(0,o.serializeError)(e,{fallbackError:b})})}}notify(e){if(!(0,i.isValidJson)(e)||!(0,i.isObject)(e))throw new Error("JSON-RPC notifications must be JSON serializable objects");this.commandStream.write({...e,jsonrpc:"2.0"})}respond(e,t){(0,i.isValidJson)(t)&&(0,i.isObject)(t)?this.commandStream.write({...t,id:e,jsonrpc:"2.0"}):this.commandStream.write({error:(0,o.serializeError)(new Error("JSON-RPC responses must be JSON serializable objects."),{fallbackError:b}),id:e,jsonrpc:"2.0"})}async startSnap(e,t,r){(0,c.log)(`Starting snap '${e}' in worker.`),this.snapPromiseErrorHandler&&(0,f.removeEventListener)("unhandledrejection",this.snapPromiseErrorHandler),this.snapErrorHandler&&(0,f.removeEventListener)("error",this.snapErrorHandler),this.snapErrorHandler=t=>{this.errorHandler(t.error,{snapId:e})},this.snapPromiseErrorHandler=t=>{this.errorHandler(t instanceof Error?t:t.reason,{snapId:e})};const s=new n.StreamProvider(this.rpcStream,{jsonRpcStreamName:"metamask-provider",rpcMiddleware:[(0,a.createIdRemapMiddleware)()]});await s.initialize();const i=this.createSnapGlobal(s),o=this.createEIP1193Provider(s),u={exports:{}};try{const{endowments:n,teardown:s}=(0,d.createEndowments)(i,o,e,r);this.snapData.set(e,{idleTeardown:s,runningEvaluations:new Set,exports:{}}),(0,f.addEventListener)("unhandledRejection",this.snapPromiseErrorHandler),(0,f.addEventListener)("error",this.snapErrorHandler);const a=new Compartment({...n,module:u,exports:u.exports});a.globalThis.self=a.globalThis,a.globalThis.global=a.globalThis,a.globalThis.window=a.globalThis,await this.executeInSnapContext(e,(()=>{a.evaluate(t),this.registerSnapExports(e,u)}))}catch(t){throw this.removeSnap(e),new Error(`Error while running snap '${e}': ${t.message}`)}}onTerminate(){this.snapData.forEach((e=>e.runningEvaluations.forEach((e=>e.stop())))),this.snapData.clear()}registerSnapExports(e,t){const r=this.snapData.get(e);r&&(r.exports=s.SNAP_EXPORT_NAMES.reduce(((e,r)=>{const n=t.exports[r],{validator:i}=s.SNAP_EXPORTS[r];return i(n)?{...e,[r]:n}:e}),{}))}createSnapGlobal(e){const t=e.request.bind(e),r=async e=>{const r=(0,p.sanitizeRequestArguments)(e);(0,p.assertSnapOutboundRequest)(r),this.notify({method:"OutboundRequest"});try{return await(0,p.withTeardown)(t(r),this)}finally{this.notify({method:"OutboundResponse"})}},n=new Proxy({},{has:(e,t)=>"string"==typeof t&&["request"].includes(t),get:(e,t)=>"request"===t?r:undefined});return harden(n)}createEIP1193Provider(e){const t=e.request.bind(e),r=(0,p.proxyStreamProvider)(e,(async e=>{const r=(0,p.sanitizeRequestArguments)(e);(0,p.assertEthereumOutboundRequest)(r),this.notify({method:"OutboundRequest"});try{return await(0,p.withTeardown)(t(r),this)}finally{this.notify({method:"OutboundResponse"})}}));return harden(r)}removeSnap(e){this.snapData.delete(e)}async executeInSnapContext(e,t){const r=this.snapData.get(e);if(r===undefined)throw new Error(`Tried to execute in context of unknown snap: "${e}".`);let n;const s=new Promise(((t,r)=>n=()=>r(o.ethErrors.rpc.internal(`The snap "${e}" has been terminated during execution.`)))),i={stop:n};try{return r.runningEvaluations.add(i),await Promise.race([t(),s])}finally{r.runningEvaluations.delete(i),0===r.runningEvaluations.size&&(this.lastTeardown+=1,await r.idleTeardown())}}}}}},{package:"$root$",file:"src/common/BaseSnapExecutor.ts"}],[199,{"./../../../snaps-utils/src/index.executionenv":221,"./validation":216,"@metamask/utils":69},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){Object.defineProperty(r,"__esModule",{value:!0}),r.getCommandMethodImplementations=function(e,t,r){return{ping:async()=>Promise.resolve("OK"),terminate:async()=>(r(),Promise.resolve("OK")),executeSnap:async(t,r,n)=>(await e(t,r,n),"OK"),snapRpc:async(e,r,n,s)=>await t(e,r,o(n,r,s))??null}},r.getHandlerArguments=o;var n=e("./../../../snaps-utils/src/index.executionenv"),s=e("@metamask/utils"),i=e("./validation");function o(e,t,r){switch(t){case n.HandlerType.OnTransaction:{(0,i.assertIsOnTransactionRequestArguments)(r.params);const{transaction:e,chainId:t,transactionOrigin:n}=r.params;return{transaction:e,chainId:t,transactionOrigin:n}}case n.HandlerType.OnNameLookup:{(0,i.assertIsOnNameLookupRequestArguments)(r.params);const{chainId:e,domain:t,address:n}=r.params;return t?{chainId:e,domain:t}:{chainId:e,address:n}}case n.HandlerType.OnRpcRequest:case n.HandlerType.OnKeyringRequest:return{origin:e,request:r};case n.HandlerType.OnCronjob:case n.HandlerType.OnInstall:case n.HandlerType.OnUpdate:return{request:r};default:return(0,s.assertExhaustive)(t)}}}}},{package:"$root$",file:"src/common/commands.ts"}],[200,{"../globalObject":212,"./console":201,"./crypto":202,"./date":203,"./interval":205,"./math":206,"./network":207,"./textDecoder":208,"./textEncoder":209,"./timeout":210},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){Object.defineProperty(r,"__esModule",{value:!0}),r.default=void 0;var n=e("../globalObject"),s=h(e("./console")),i=h(e("./crypto")),o=h(e("./date")),a=h(e("./interval")),u=h(e("./math")),c=h(e("./network")),l=h(e("./textDecoder")),d=h(e("./textEncoder")),f=h(e("./timeout"));function h(e){return e&&e.__esModule?e:{default:e}}const p=[{endowment:AbortController,name:"AbortController"},{endowment:AbortSignal,name:"AbortSignal"},{endowment:ArrayBuffer,name:"ArrayBuffer"},{endowment:atob,name:"atob",bind:!0},{endowment:BigInt,name:"BigInt"},{endowment:BigInt64Array,name:"BigInt64Array"},{endowment:BigUint64Array,name:"BigUint64Array"},{endowment:btoa,name:"btoa",bind:!0},{endowment:DataView,name:"DataView"},{endowment:Float32Array,name:"Float32Array"},{endowment:Float64Array,name:"Float64Array"},{endowment:Int8Array,name:"Int8Array"},{endowment:Int16Array,name:"Int16Array"},{endowment:Int32Array,name:"Int32Array"},{endowment:Uint8Array,name:"Uint8Array"},{endowment:Uint8ClampedArray,name:"Uint8ClampedArray"},{endowment:Uint16Array,name:"Uint16Array"},{endowment:Uint32Array,name:"Uint32Array"},{endowment:URL,name:"URL"},{endowment:WebAssembly,name:"WebAssembly"}];var m=()=>{const e=[i.default,a.default,u.default,c.default,f.default,l.default,d.default,o.default,s.default];return p.forEach((t=>{const r={names:[t.name],factory:()=>{const e="function"==typeof t.endowment&&t.bind?t.endowment.bind(n.rootRealmGlobal):t.endowment;return{[t.name]:harden(e)}}};e.push(r)})),e};r.default=m}}},{package:"$root$",file:"src/common/endowments/commonEndowmentFactory.ts"}],[201,{"../globalObject":212,"@metamask/utils":69},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){Object.defineProperty(r,"__esModule",{value:!0}),r.default=r.consoleMethods=r.consoleAttenuatedMethods=void 0;var n=e("@metamask/utils"),s=e("../globalObject");const i=new Set(["log","assert","error","debug","info","warn"]);r.consoleAttenuatedMethods=i;const o=new Set(["debug","error","info","log","warn","dir","dirxml","table","trace","group","groupCollapsed","groupEnd","clear","count","countReset","assert","profile","profileEnd","time","timeLog","timeEnd","timeStamp","context"]);r.consoleMethods=o;const a=["log","error","debug","info","warn"];function u(e,t,...r){const n=`[Snap: ${e}]`;return"string"==typeof t?[`${n} ${t}`,...r]:[n,t,...r]}var c={names:["console"],factory:function({snapId:e}={}){(0,n.assert)(e!==undefined);const t=Object.getOwnPropertyNames(s.rootRealmGlobal.console).reduce(((e,t)=>o.has(t)&&!i.has(t)?{...e,[t]:s.rootRealmGlobal.console[t]}:e),{});return harden({console:{...t,assert:(t,r,...n)=>{s.rootRealmGlobal.console.assert(t,...u(e,r,...n))},...a.reduce(((t,r)=>({...t,[r]:(t,...n)=>{s.rootRealmGlobal.console[r](...u(e,t,...n))}})),{})}})}};r.default=c}}},{package:"$root$",file:"src/common/endowments/console.ts"}],[202,{"../globalObject":212,crypto:"crypto"},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){Object.defineProperty(r,"__esModule",{value:!0}),r.default=r.createCrypto=void 0;var n=e("../globalObject");const s=()=>{if("crypto"in n.rootRealmGlobal&&"object"==typeof n.rootRealmGlobal.crypto&&"SubtleCrypto"in n.rootRealmGlobal&&"function"==typeof n.rootRealmGlobal.SubtleCrypto)return{crypto:harden(n.rootRealmGlobal.crypto),SubtleCrypto:harden(n.rootRealmGlobal.SubtleCrypto)};const t=e("crypto").webcrypto;return{crypto:harden(t),SubtleCrypto:harden(t.subtle.constructor)}};r.createCrypto=s;var i={names:["crypto","SubtleCrypto"],factory:s};r.default=i}}},{package:"$root$",file:"src/common/endowments/crypto.ts"}],[203,{"../globalObject":212},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){Object.defineProperty(r,"__esModule",{value:!0}),r.default=void 0;var n=e("../globalObject");var s={names:["Date"],factory:function(){const e=Object.getOwnPropertyNames(n.rootRealmGlobal.Date);let t=0;const r=()=>{const e=n.rootRealmGlobal.Date.now(),r=Math.round(e+Math.random());return r>t&&(t=r),t},s=function(...e){return Reflect.construct(n.rootRealmGlobal.Date,0===e.length?[r()]:e,new.target)};return e.forEach((e=>{Reflect.defineProperty(s,e,{configurable:!1,writable:!1,value:"now"===e?r:n.rootRealmGlobal.Date[e]})})),{Date:harden(s)}}};r.default=s}}},{package:"$root$",file:"src/common/endowments/date.ts"}],[204,{"../globalObject":212,"./../../../../snaps-utils/src/index.executionenv":221,"./commonEndowmentFactory":200,"@metamask/utils":69},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){Object.defineProperty(r,"__esModule",{value:!0}),r.createEndowments=function(e,t,r,n=[]){const u={},c=n.reduce((({allEndowments:e,teardowns:n},c)=>{if(a.has(c)){if(!(0,i.hasProperty)(u,c)){const{teardownFunction:e,...t}=a.get(c)({snapId:r});Object.assign(u,t),e&&n.push(e)}e[c]=u[c]}else if("ethereum"===c)e[c]=t;else{if(!(c in o.rootRealmGlobal))throw new Error(`Unknown endowment: "${c}".`);{(0,s.logWarning)(`Access to unhardened global ${c}.`);const t=o.rootRealmGlobal[c];e[c]=t}}return{allEndowments:e,teardowns:n}}),{allEndowments:{snap:e},teardowns:[]});return{endowments:c.allEndowments,teardown:async()=>{await Promise.all(c.teardowns.map((e=>e())))}}};var n,s=e("./../../../../snaps-utils/src/index.executionenv"),i=e("@metamask/utils"),o=e("../globalObject");const a=(0,((n=e("./commonEndowmentFactory"))&&n.__esModule?n:{default:n}).default)().reduce(((e,t)=>(t.names.forEach((r=>{e.set(r,t.factory)})),e)),new Map)}}},{package:"$root$",file:"src/common/endowments/index.ts"}],[205,{},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){Object.defineProperty(r,"__esModule",{value:!0}),r.default=void 0;var n={names:["setInterval","clearInterval"],factory:()=>{const e=new Map,t=t=>{harden(t);const r=e.get(t);r!==undefined&&(clearInterval(r),e.delete(t))};return{setInterval:harden(((t,r)=>{if("function"!=typeof t)throw new Error("The interval handler must be a function. Received: "+typeof t);harden(t);const n=Object.freeze(Object.create(null)),s=setInterval(t,Math.max(10,r??0));return e.set(n,s),n})),clearInterval:harden(t),teardownFunction:()=>{for(const r of e.keys())t(r)}}}};r.default=n}}},{package:"$root$",file:"src/common/endowments/interval.ts"}],[206,{"../globalObject":212,"./crypto":202},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){Object.defineProperty(r,"__esModule",{value:!0}),r.default=void 0;var n=e("../globalObject"),s=e("./crypto");var i={names:["Math"],factory:function(){const e=Object.getOwnPropertyNames(n.rootRealmGlobal.Math).reduce(((e,t)=>"random"===t?e:{...e,[t]:n.rootRealmGlobal.Math[t]}),{}),{crypto:t}=(0,s.createCrypto)();return harden({Math:{...e,random:()=>t.getRandomValues(new Uint32Array(1))[0]/2**32}})}};r.default=i}}},{package:"$root$",file:"src/common/endowments/math.ts"}],[207,{"../utils":215},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){Object.defineProperty(r,"__esModule",{value:!0}),r.default=void 0;var n=e("../utils");function s(e,t,r){!function(e,t){if(t.has(e))throw new TypeError("Cannot initialize the same private elements twice on an object")}(e,t),t.set(e,r)}function i(e,t){return function(e,t){if(t.get)return t.get.call(e);return t.value}(e,a(e,t,"get"))}function o(e,t,r){return function(e,t,r){if(t.set)t.set.call(e,r);else{if(!t.writable)throw new TypeError("attempted to set read only private field");t.value=r}}(e,a(e,t,"set"),r),r}function a(e,t,r){if(!t.has(e))throw new TypeError("attempted to "+r+" private field on non-instance");return t.get(e)}var u=new WeakMap,c=new WeakMap;class l{constructor(e,t){s(this,u,{writable:!0,value:void 0}),s(this,c,{writable:!0,value:void 0}),o(this,c,e),o(this,u,t)}get body(){return i(this,c).body}get bodyUsed(){return i(this,c).bodyUsed}get headers(){return i(this,c).headers}get ok(){return i(this,c).ok}get redirected(){return i(this,c).redirected}get status(){return i(this,c).status}get statusText(){return i(this,c).statusText}get type(){return i(this,c).type}get url(){return i(this,c).url}async text(){return(0,n.withTeardown)(i(this,c).text(),this)}async arrayBuffer(){return(0,n.withTeardown)(i(this,c).arrayBuffer(),this)}async blob(){return(0,n.withTeardown)(i(this,c).blob(),this)}clone(){const e=i(this,c).clone();return new l(e,i(this,u))}async formData(){return(0,n.withTeardown)(i(this,c).formData(),this)}async json(){return(0,n.withTeardown)(i(this,c).json(),this)}}var d={names:["fetch","Request","Headers","Response"],factory:()=>{const e=new Set,t={lastTeardown:0},r=new FinalizationRegistry((e=>e()));return{fetch:harden((async(s,i)=>{const o=new AbortController;if(null!==(null==i?void 0:i.signal)&&(null==i?void 0:i.signal)!==undefined){const e=i.signal;e.addEventListener("abort",(()=>{o.abort(e.reason)}),{once:!0})}let a,u;try{const r=fetch(s,{...i,signal:o.signal});u={cancel:async()=>{o.abort();try{await r}catch{}}},e.add(u),a=new l(await(0,n.withTeardown)(r,t),t)}finally{u!==undefined&&e.delete(u)}if(null!==a.body){const t=new WeakRef(a.body),n={cancel:async()=>{try{var e;await(null===(e=t.deref())||void 0===e?void 0:e.cancel())}catch{}}};e.add(n),r.register(a.body,(()=>e.delete(n)))}return harden(a)})),Request:harden(Request),Headers:harden(Headers),Response:harden(Response),teardownFunction:async()=>{t.lastTeardown+=1;const r=[];e.forEach((({cancel:e})=>r.push(e()))),e.clear(),await Promise.all(r)}}}};r.default=d}}},{package:"$root$",file:"src/common/endowments/network.ts"}],[208,{},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){Object.defineProperty(r,"__esModule",{value:!0}),r.default=void 0;var n={names:["TextDecoder"],factory:()=>({TextDecoder:harden(TextDecoder)})};r.default=n}}},{package:"$root$",file:"src/common/endowments/textDecoder.ts"}],[209,{},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){Object.defineProperty(r,"__esModule",{value:!0}),r.default=void 0;var n={names:["TextEncoder"],factory:()=>({TextEncoder:harden(TextEncoder)})};r.default=n}}},{package:"$root$",file:"src/common/endowments/textEncoder.ts"}],[210,{},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){Object.defineProperty(r,"__esModule",{value:!0}),r.default=void 0;var n={names:["setTimeout","clearTimeout"],factory:()=>{const e=new Map,t=t=>{const r=e.get(t);r!==undefined&&(clearTimeout(r),e.delete(t))};return{setTimeout:harden(((t,r)=>{if("function"!=typeof t)throw new Error("The timeout handler must be a function. Received: "+typeof t);harden(t);const n=Object.freeze(Object.create(null)),s=setTimeout((()=>{e.delete(n),t()}),Math.max(10,r??0));return e.set(n,s),n})),clearTimeout:harden(t),teardownFunction:()=>{for(const r of e.keys())t(r)}}}};r.default=n}}},{package:"$root$",file:"src/common/endowments/timeout.ts"}],[211,{"./globalObject":212},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){Object.defineProperty(r,"__esModule",{value:!0}),r.addEventListener=function(e,t){if("addEventListener"in n.rootRealmGlobal&&"function"==typeof n.rootRealmGlobal.addEventListener)return n.rootRealmGlobal.addEventListener(e.toLowerCase(),t);if(n.rootRealmGlobal.process&&"on"in n.rootRealmGlobal.process&&"function"==typeof n.rootRealmGlobal.process.on)return n.rootRealmGlobal.process.on(e,t);throw new Error("Platform agnostic addEventListener failed")},r.removeEventListener=function(e,t){if("removeEventListener"in n.rootRealmGlobal&&"function"==typeof n.rootRealmGlobal.removeEventListener)return n.rootRealmGlobal.removeEventListener(e.toLowerCase(),t);if(n.rootRealmGlobal.process&&"removeListener"in n.rootRealmGlobal.process&&"function"==typeof n.rootRealmGlobal.process.removeListener)return n.rootRealmGlobal.process.removeListener(e,t);throw new Error("Platform agnostic removeEventListener failed")};var n=e("./globalObject")}}},{package:"$root$",file:"src/common/globalEvents.ts"}],[212,{},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){Object.defineProperty(r,"__esModule",{value:!0}),r.rootRealmGlobalName=r.rootRealmGlobal=void 0;var n=function(e){return e.globalThis="globalThis",e.global="global",e.self="self",e.window="window",e}(n||{});let s,i;if("undefined"!=typeof globalThis)s=globalThis,i=n.globalThis;else if("undefined"!=typeof self)s=self,i=n.self;else if("undefined"!=typeof window)s=window,i=n.window;else{if("undefined"==typeof global)throw new Error("Unknown realm type; failed to identify global object.");s=global,i=n.global}const o=s;r.rootRealmGlobal=o;const a=i;r.rootRealmGlobalName=a}}},{package:"$root$",file:"src/common/globalObject.ts"}],[213,{"./../../../../snaps-utils/src/index.executionenv":221},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){Object.defineProperty(r,"__esModule",{value:!0}),r.executeLockdownMore=function(){try{const e=Reflect.ownKeys((new Compartment).globalThis),t=new Set(["eval","Function"]);new Set([...e]).forEach((e=>{const r=Reflect.getOwnPropertyDescriptor(globalThis,e);r&&(r.configurable&&(!function(e){return"set"in e||"get"in e}(r)?Object.defineProperty(globalThis,e,{configurable:!1,writable:!1}):Object.defineProperty(globalThis,e,{configurable:!1})),t.has(e)&&harden(globalThis[e]))}))}catch(e){throw(0,n.logError)("Protecting intrinsics failed:",e),e}};var n=e("./../../../../snaps-utils/src/index.executionenv")}}},{package:"$root$",file:"src/common/lockdown/lockdown-more.ts"}],[214,{},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){Object.defineProperty(r,"__esModule",{value:!0}),r.sortParamKeys=void 0;r.sortParamKeys=(e,t)=>{if(!t)return[];if(t instanceof Array)return t;const r=e.reduce(((e,t,r)=>({...e,[t]:r})),{});return Object.entries(t).sort((([e,t],[n,s])=>r[e]-r[n])).map((([e,t])=>t))}}}},{package:"$root$",file:"src/common/sortParams.ts"}],[215,{"../logging":217,"@metamask/utils":69,"eth-rpc-errors":95},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){Object.defineProperty(r,"__esModule",{value:!0}),r.BLOCKED_RPC_METHODS=void 0,r.assertEthereumOutboundRequest=function(e){(0,n.assert)(!String.prototype.startsWith.call(e.method,"snap_"),s.ethErrors.rpc.methodNotFound({data:{method:e.method}})),(0,n.assert)(!o.includes(e.method),s.ethErrors.rpc.methodNotFound({data:{method:e.method}})),(0,n.assertStruct)(e,n.JsonStruct,"Provided value is not JSON-RPC compatible")},r.assertSnapOutboundRequest=function(e){(0,n.assert)(String.prototype.startsWith.call(e.method,"wallet_")||String.prototype.startsWith.call(e.method,"snap_"),"The global Snap API only allows RPC methods starting with `wallet_*` and `snap_*`."),(0,n.assert)(!o.includes(e.method),s.ethErrors.rpc.methodNotFound({data:{method:e.method}})),(0,n.assertStruct)(e,n.JsonStruct,"Provided value is not JSON-RPC compatible")},r.constructError=function(e){let t;e instanceof Error?t=e:"string"==typeof e&&(t=new Error(e),delete t.stack);return t},r.proxyStreamProvider=function(e,t){return new Proxy({},{has:(e,t)=>"string"==typeof t&&["request","on","removeListener"].includes(t),get:(r,n)=>"request"===n?t:["on","removeListener"].includes(n)?e[n]:undefined})},r.sanitizeRequestArguments=function(e){const t=JSON.parse(JSON.stringify(e));return(0,n.getSafeJson)(t)},r.withTeardown=async function(e,t){const r=t.lastTeardown;return new Promise(((n,s)=>{e.then((e=>{t.lastTeardown===r?n(e):(0,i.log)("Late promise received after Snap finished execution. Promise will be dropped.")})).catch((e=>{t.lastTeardown===r?s(e):(0,i.log)("Late promise received after Snap finished execution. Promise will be dropped.")}))}))};var n=e("@metamask/utils"),s=e("eth-rpc-errors"),i=e("../logging");const o=Object.freeze(["wallet_requestSnaps","wallet_requestPermissions","eth_sendRawTransaction","eth_sendTransaction","eth_sign","eth_signTypedData","eth_signTypedData_v1","eth_signTypedData_v3","eth_signTypedData_v4","eth_decrypt","eth_getEncryptionPublicKey","wallet_addEthereumChain","wallet_switchEthereumChain","wallet_watchAsset","wallet_registerOnboarding","wallet_scanQRCode"]);r.BLOCKED_RPC_METHODS=o}}},{package:"$root$",file:"src/common/utils.ts"}],[216,{"./../../../snaps-utils/src/index.executionenv":221,"@metamask/utils":69,superstruct:192},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){Object.defineProperty(r,"__esModule",{value:!0}),r.TerminateRequestArgumentsStruct=r.SnapRpcRequestArgumentsStruct=r.PingRequestArgumentsStruct=r.OnTransactionRequestArgumentsStruct=r.OnNameLookupRequestArgumentsStruct=r.JsonRpcRequestWithoutIdStruct=r.ExecuteSnapRequestArgumentsStruct=r.EndowmentStruct=void 0,r.assertIsOnNameLookupRequestArguments=function(e){(0,s.assertStruct)(e,w,"Invalid request params")},r.assertIsOnTransactionRequestArguments=function(e){(0,s.assertStruct)(e,p,"Invalid request params")},r.isEndowment=u,r.isEndowmentsArray=function(e){return Array.isArray(e)&&e.every(u)};var n=e("./../../../snaps-utils/src/index.executionenv"),s=e("@metamask/utils"),i=e("superstruct");const o=(0,i.assign)((0,i.omit)(s.JsonRpcRequestStruct,["id"]),(0,i.object)({id:(0,i.optional)(s.JsonRpcIdStruct)}));r.JsonRpcRequestWithoutIdStruct=o;const a=(0,i.string)();function u(e){return(0,i.is)(e,a)}r.EndowmentStruct=a;const c=(0,i.literal)("OK"),l=(0,i.optional)((0,i.union)([(0,i.literal)(undefined),(0,i.array)()]));r.PingRequestArgumentsStruct=l;const d=(0,i.union)([(0,i.literal)(undefined),(0,i.array)()]);r.TerminateRequestArgumentsStruct=d;const f=(0,i.tuple)([(0,i.string)(),(0,i.string)(),(0,i.optional)((0,i.array)(a))]);r.ExecuteSnapRequestArgumentsStruct=f;const h=(0,i.tuple)([(0,i.string)(),(0,i.enums)(Object.values(n.HandlerType)),(0,i.string)(),(0,i.assign)(o,(0,i.object)({params:(0,i.optional)((0,i.record)((0,i.string)(),s.JsonStruct))}))]);r.SnapRpcRequestArgumentsStruct=h;const p=(0,i.object)({transaction:(0,i.record)((0,i.string)(),s.JsonStruct),chainId:n.ChainIdStruct,transactionOrigin:(0,i.nullable)((0,i.string)())});r.OnTransactionRequestArgumentsStruct=p;const m={chainId:n.ChainIdStruct},g=(0,i.object)({...m,address:(0,i.string)()}),b=(0,i.object)({...m,domain:(0,i.string)()}),w=(0,i.union)([g,b]);r.OnNameLookupRequestArgumentsStruct=w;(0,i.assign)(s.JsonRpcSuccessStruct,(0,i.object)({result:c})),s.JsonRpcSuccessStruct}}},{package:"$root$",file:"src/common/validation.ts"}],[217,{"./../../snaps-utils/src/index.executionenv":221,"@metamask/utils":69},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){Object.defineProperty(r,"__esModule",{value:!0}),r.log=void 0;var n=e("./../../snaps-utils/src/index.executionenv");const s=(0,e("@metamask/utils").createModuleLogger)(n.snapsLogger,"snaps-execution-environments");r.log=s}}},{package:"$root$",file:"src/logging.ts"}],[218,{"../common/BaseSnapExecutor":198,"../logging":217,"./../../../snaps-utils/src/index.executionenv":221,"@metamask/object-multiplex":3,"@metamask/post-message-stream":19,stream:"stream"},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){Object.defineProperty(r,"__esModule",{value:!0}),r.ChildProcessSnapExecutor=void 0;var n,s=(n=e("@metamask/object-multiplex"))&&n.__esModule?n:{default:n},i=e("@metamask/post-message-stream"),o=e("./../../../snaps-utils/src/index.executionenv"),a=e("stream"),u=e("../common/BaseSnapExecutor"),c=e("../logging");class l extends u.BaseSnapExecutor{static initialize(){(0,c.log)("Worker: Connecting to parent.");const e=new i.ProcessMessageStream,t=new s.default;(0,a.pipeline)(e,t,e,(e=>{e&&(0,o.logError)("Parent stream failure, closing worker.",e),self.close()}));const r=t.createStream(o.SNAP_STREAM_NAMES.COMMAND),n=t.createStream(o.SNAP_STREAM_NAMES.JSON_RPC);return new l(r,n)}}r.ChildProcessSnapExecutor=l}}},{package:"$root$",file:"src/node-process/ChildProcessSnapExecutor.ts"}],[219,{"../common/lockdown/lockdown-more":213,"./ChildProcessSnapExecutor":218},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){var n=e("../common/lockdown/lockdown-more"),s=e("./ChildProcessSnapExecutor");(0,n.executeLockdownMore)(),s.ChildProcessSnapExecutor.initialize()}}},{package:"$root$",file:"src/node-process/index.ts"}],[220,{},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){Object.defineProperty(r,"__esModule",{value:!0}),r.SeverityLevel=r.SNAP_EXPORTS=r.HandlerType=void 0;let n=function(e){return e.OnRpcRequest="onRpcRequest",e.OnTransaction="onTransaction",e.OnCronjob="onCronjob",e.OnInstall="onInstall",e.OnUpdate="onUpdate",e.OnNameLookup="onNameLookup",e.OnKeyringRequest="onKeyringRequest",e}({});r.HandlerType=n;const s={[n.OnRpcRequest]:{type:n.OnRpcRequest,required:!0,validator:e=>"function"==typeof e},[n.OnTransaction]:{type:n.OnTransaction,required:!0,validator:e=>"function"==typeof e},[n.OnCronjob]:{type:n.OnCronjob,required:!0,validator:e=>"function"==typeof e},[n.OnNameLookup]:{type:n.OnNameLookup,required:!0,validator:e=>"function"==typeof e},[n.OnInstall]:{type:n.OnInstall,required:!1,validator:e=>"function"==typeof e},[n.OnUpdate]:{type:n.OnUpdate,required:!1,validator:e=>"function"==typeof e},[n.OnKeyringRequest]:{type:n.OnKeyringRequest,required:!0,validator:e=>"function"==typeof e}};r.SNAP_EXPORTS=s;let i=function(e){return e.Critical="critical",e}({});r.SeverityLevel=i}}},{package:"external:../snaps-utils/src/handlers.ts",file:"../snaps-utils/src/handlers.ts"}],[221,{"./handlers":220,"./logging":222,"./namespace":223,"./types":224},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){Object.defineProperty(r,"__esModule",{value:!0});var n=e("./handlers");Object.keys(n).forEach((function(e){"default"!==e&&"__esModule"!==e&&(e in r&&r[e]===n[e]||Object.defineProperty(r,e,{enumerable:!0,get:function(){return n[e]}}))}));var s=e("./logging");Object.keys(s).forEach((function(e){"default"!==e&&"__esModule"!==e&&(e in r&&r[e]===s[e]||Object.defineProperty(r,e,{enumerable:!0,get:function(){return s[e]}}))}));var i=e("./namespace");Object.keys(i).forEach((function(e){"default"!==e&&"__esModule"!==e&&(e in r&&r[e]===i[e]||Object.defineProperty(r,e,{enumerable:!0,get:function(){return i[e]}}))}));var o=e("./types");Object.keys(o).forEach((function(e){"default"!==e&&"__esModule"!==e&&(e in r&&r[e]===o[e]||Object.defineProperty(r,e,{enumerable:!0,get:function(){return o[e]}}))}))}}},{package:"external:../snaps-utils/src/index.executionenv.ts",file:"../snaps-utils/src/index.executionenv.ts"}],[222,{"@metamask/utils":69},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){Object.defineProperty(r,"__esModule",{value:!0}),r.logError=function(e,...t){console.error(e,...t)},r.logInfo=function(e,...t){console.log(e,...t)},r.logWarning=function(e,...t){console.warn(e,...t)},r.snapsLogger=void 0;const n=(0,e("@metamask/utils").createProjectLogger)("snaps");r.snapsLogger=n}}},{package:"external:../snaps-utils/src/logging.ts",file:"../snaps-utils/src/logging.ts"}],[223,{superstruct:192},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){Object.defineProperty(r,"__esModule",{value:!0}),r.NamespaceStruct=r.NamespaceIdStruct=r.LimitedString=r.ChainStruct=r.ChainIdStruct=r.CHAIN_ID_REGEX=r.AccountIdStruct=r.AccountIdArrayStruct=r.AccountAddressStruct=r.ACCOUNT_ID_REGEX=r.ACCOUNT_ADDRESS_REGEX=void 0,r.isAccountId=function(e){return(0,n.is)(e,c)},r.isAccountIdArray=function(e){return(0,n.is)(e,l)},r.isChainId=function(e){return(0,n.is)(e,u)},r.isNamespace=function(e){return(0,n.is)(e,h)},r.isNamespaceId=function(e){return(0,n.is)(e,p)},r.parseAccountId=function(e){const t=i.exec(e);if(null==t||!t.groups)throw new Error("Invalid account ID.");return{address:t.groups.accountAddress,chainId:t.groups.chainId,chain:{namespace:t.groups.namespace,reference:t.groups.reference}}},r.parseChainId=function(e){const t=s.exec(e);if(null==t||!t.groups)throw new Error("Invalid chain ID.");return{namespace:t.groups.namespace,reference:t.groups.reference}};var n=e("superstruct");const s=/^(?<namespace>[-a-z0-9]{3,8}):(?<reference>[-a-zA-Z0-9]{1,32})$/u;r.CHAIN_ID_REGEX=s;const i=/^(?<chainId>(?<namespace>[-a-z0-9]{3,8}):(?<reference>[-a-zA-Z0-9]{1,32})):(?<accountAddress>[a-zA-Z0-9]{1,64})$/u;r.ACCOUNT_ID_REGEX=i;const o=/^(?<accountAddress>[a-zA-Z0-9]{1,64})$/u;r.ACCOUNT_ADDRESS_REGEX=o;const a=(0,n.size)((0,n.string)(),1,40);r.LimitedString=a;const u=(0,n.pattern)((0,n.string)(),s);r.ChainIdStruct=u;const c=(0,n.pattern)((0,n.string)(),i);r.AccountIdStruct=c;const l=(0,n.array)(c);r.AccountIdArrayStruct=l;const d=(0,n.pattern)((0,n.string)(),o);r.AccountAddressStruct=d;const f=(0,n.object)({id:u,name:a});r.ChainStruct=f;const h=(0,n.object)({chains:(0,n.array)(f),methods:(0,n.optional)((0,n.array)(a)),events:(0,n.optional)((0,n.array)(a))});r.NamespaceStruct=h;const p=(0,n.pattern)((0,n.string)(),/^[-a-z0-9]{3,8}$/u);r.NamespaceIdStruct=p}}},{package:"external:../snaps-utils/src/namespace.ts",file:"../snaps-utils/src/namespace.ts"}],[224,{"./handlers":220,"@metamask/utils":69,superstruct:192},function(){with(this.scopeTerminator)with(this.globalThis)return function(){"use strict";return function(e,t,r){Object.defineProperty(r,"__esModule",{value:!0}),r.WALLET_SNAP_PERMISSION_KEY=r.SnapValidationFailureReason=r.SnapIdPrefixes=r.SNAP_STREAM_NAMES=r.SNAP_EXPORT_NAMES=r.NpmSnapPackageJsonStruct=r.NpmSnapFileNames=r.NameStruct=void 0,r.assertIsNpmSnapPackageJson=function(e){(0,n.assertStruct)(e,u,`"${o.PackageJson}" is invalid`)},r.isNpmSnapPackageJson=function(e){return(0,s.is)(e,u)},r.isValidUrl=function(e,t={}){return(0,s.is)(e,h(t))},r.uri=void 0;var n=e("@metamask/utils"),s=e("superstruct"),i=e("./handlers");let o=function(e){return e.PackageJson="package.json",e.Manifest="snap.manifest.json",e}({});r.NpmSnapFileNames=o;const a=(0,s.size)((0,s.pattern)((0,s.string)(),/^(?:@[a-z0-9-*~][a-z0-9-*._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/u),1,214);r.NameStruct=a;const u=(0,s.type)({version:n.VersionStruct,name:a,main:(0,s.optional)((0,s.size)((0,s.string)(),1,Infinity)),repository:(0,s.optional)((0,s.object)({type:(0,s.size)((0,s.string)(),1,Infinity),url:(0,s.size)((0,s.string)(),1,Infinity)}))});r.NpmSnapPackageJsonStruct=u;let c=function(e){return e.npm="npm:",e.local="local:",e}({});r.SnapIdPrefixes=c;let l=function(e){return e.NameMismatch='"name" field mismatch',e.VersionMismatch='"version" field mismatch',e.RepositoryMismatch='"repository" field mismatch',e.ShasumMismatch='"shasum" field mismatch',e}({});r.SnapValidationFailureReason=l;let d=function(e){return e.JSON_RPC="jsonRpc",e.COMMAND="command",e}({});r.SNAP_STREAM_NAMES=d;const f=Object.values(i.HandlerType);r.SNAP_EXPORT_NAMES=f;const h=(e={})=>(0,s.refine)((0,s.union)([(0,s.string)(),(0,s.instance)(URL)]),"uri",(t=>{try{const r=new URL(t),n=(0,s.type)(e);return(0,s.assert)(r,n),!0}catch{return`Expected URL, got "${t.toString()}".`}}));r.uri=h;r.WALLET_SNAP_PERMISSION_KEY="wallet_snap"}}},{package:"external:../snaps-utils/src/types.ts",file:"../snaps-utils/src/types.ts"}]],[219],{resources:{"@lavamoat/lavapack>readable-stream":{builtin:{"buffer.Buffer":!0,"events.EventEmitter":!0,stream:!0,util:!0},globals:{"process.env.READABLE_STREAM":!0,"process.nextTick":!0,"process.stderr":!0,"process.stdout":!0},packages:{"browserify>inherits":!0,"browserify>readable-stream>util-deprecate":!0,"browserify>string_decoder":!0,buffer:!0,events:!0,stream:!0,util:!0}},"@metamask/object-multiplex":{globals:{"console.warn":!0},packages:{"@metamask/object-multiplex>end-of-stream":!0,"@metamask/object-multiplex>once":!0,"@metamask/object-multiplex>readable-stream":!0}},"@metamask/object-multiplex>end-of-stream":{globals:{"process.nextTick":!0},packages:{"@metamask/object-multiplex>once":!0}},"@metamask/object-multiplex>once":{packages:{"@metamask/object-multiplex>once>wrappy":!0}},"@metamask/object-multiplex>readable-stream":{builtin:{"events.EventEmitter":!0,stream:!0,"timers.setImmediate":!0,util:!0},globals:{"process.browser":!0,"process.env.READABLE_STREAM":!0,"process.stderr":!0,"process.stdout":!0,"process.version.slice":!0},packages:{"@metamask/object-multiplex>readable-stream>isarray":!0,"@metamask/object-multiplex>readable-stream>safe-buffer":!0,"@metamask/object-multiplex>readable-stream>string_decoder":!0,"browserify>inherits":!0,"browserify>readable-stream>core-util-is":!0,"browserify>readable-stream>process-nextick-args":!0,"browserify>readable-stream>util-deprecate":!0,events:!0,stream:!0,timers:!0,util:!0}},"@metamask/object-multiplex>readable-stream>safe-buffer":{builtin:{buffer:!0},packages:{buffer:!0}},"@metamask/object-multiplex>readable-stream>string_decoder":{packages:{"@metamask/object-multiplex>readable-stream>safe-buffer":!0}},"@metamask/post-message-stream":{builtin:{"worker_threads.parentPort":!0},globals:{"MessageEvent.prototype":!0,WorkerGlobalScope:!0,addEventListener:!0,browser:!0,chrome:!0,"location.origin":!0,postMessage:!0,"process.on":!0,"process.removeListener":!0,"process.send":!0,removeEventListener:!0},packages:{"@lavamoat/lavapack>readable-stream":!0,"@metamask/post-message-stream>@metamask/utils":!0,worker_threads:!0}},"@metamask/post-message-stream>@metamask/utils":{builtin:{"buffer.Buffer":!0},globals:{TextDecoder:!0,TextEncoder:!0},packages:{"@swc/cli>semver":!0,buffer:!0,"eslint>debug":!0,superstruct:!0}},"@metamask/providers":{globals:{Event:!0,addEventListener:!0,"chrome.runtime.connect":!0,console:!0,dispatchEvent:!0,"document.createElement":!0,"document.readyState":!0,ethereum:"write","location.hostname":!0,removeEventListener:!0,web3:!0},packages:{"@metamask/object-multiplex":!0,"@metamask/providers>@metamask/safe-event-emitter":!0,"@metamask/providers>detect-browser":!0,"@metamask/providers>extension-port-stream":!0,"@metamask/providers>is-stream":!0,"@metamask/providers>json-rpc-middleware-stream":!0,"@metamask/providers>pump":!0,"eslint>fast-deep-equal":!0,"eth-rpc-errors":!0,"json-rpc-engine":!0}},"@metamask/providers>@metamask/safe-event-emitter":{builtin:{"events.EventEmitter":!0},globals:{setTimeout:!0},packages:{events:!0}},"@metamask/providers>detect-browser":{globals:{document:!0,navigator:!0,process:!0}},"@metamask/providers>extension-port-stream":{builtin:{"buffer.Buffer":!0,"stream.Duplex":!0},packages:{buffer:!0,stream:!0}},"@metamask/providers>json-rpc-middleware-stream":{globals:{"console.warn":!0,setTimeout:!0},packages:{"@metamask/providers>json-rpc-middleware-stream>readable-stream":!0,"json-rpc-engine>@metamask/safe-event-emitter":!0}},"@metamask/providers>json-rpc-middleware-stream>readable-stream":{builtin:{"events.EventEmitter":!0,stream:!0,"timers.setImmediate":!0,util:!0},globals:{"process.browser":!0,"process.env.READABLE_STREAM":!0,"process.stderr":!0,"process.stdout":!0,"process.version.slice":!0},packages:{"@metamask/providers>json-rpc-middleware-stream>readable-stream>isarray":!0,"@metamask/providers>json-rpc-middleware-stream>readable-stream>safe-buffer":!0,"@metamask/providers>json-rpc-middleware-stream>readable-stream>string_decoder":!0,"browserify>inherits":!0,"browserify>readable-stream>core-util-is":!0,"browserify>readable-stream>process-nextick-args":!0,"browserify>readable-stream>util-deprecate":!0,events:!0,stream:!0,timers:!0,util:!0}},"@metamask/providers>json-rpc-middleware-stream>readable-stream>safe-buffer":{builtin:{buffer:!0},packages:{buffer:!0}},"@metamask/providers>json-rpc-middleware-stream>readable-stream>string_decoder":{packages:{"@metamask/providers>json-rpc-middleware-stream>readable-stream>safe-buffer":!0}},"@metamask/providers>pump":{builtin:{fs:!0},globals:{"process.version":!0},packages:{"@metamask/object-multiplex>end-of-stream":!0,"@metamask/object-multiplex>once":!0,fs:!0}},"@metamask/utils":{builtin:{"buffer.Buffer":!0},globals:{TextDecoder:!0,TextEncoder:!0},packages:{"@metamask/utils>@noble/hashes":!0,"@swc/cli>semver":!0,buffer:!0,"eslint>debug":!0,superstruct:!0}},"@metamask/utils>@noble/hashes":{globals:{TextEncoder:!0,crypto:!0}},"@swc/cli>semver":{globals:{"console.error":!0,process:!0},packages:{"@swc/cli>semver>lru-cache":!0}},"@swc/cli>semver>lru-cache":{packages:{"@swc/cli>semver>lru-cache>yallist":!0}},"@wdio/mocha-framework>mocha>supports-color":{builtin:{"os.release":!0,"tty.isatty":!0},globals:{"process.env":!0,"process.platform":!0},packages:{"istanbul-lib-report>supports-color>has-flag":!0,os:!0,tty:!0}},"browserify>browser-pack>safe-buffer":{builtin:{buffer:!0},packages:{buffer:!0}},"browserify>inherits":{builtin:{"util.inherits":!0},packages:{util:!0}},"browserify>readable-stream>core-util-is":{packages:{"browserify>insert-module-globals>is-buffer":!0}},"browserify>readable-stream>process-nextick-args":{globals:{process:!0}},"browserify>readable-stream>util-deprecate":{builtin:{"util.deprecate":!0},packages:{util:!0}},"browserify>string_decoder":{packages:{"browserify>browser-pack>safe-buffer":!0}},"eslint>debug":{builtin:{"tty.isatty":!0,"util.deprecate":!0,"util.format":!0,"util.inspect":!0},globals:{console:!0,document:!0,localStorage:!0,navigator:!0,process:!0},packages:{"@wdio/mocha-framework>mocha>supports-color":!0,"eslint>debug>ms":!0,tty:!0,util:!0}},"eth-rpc-errors":{packages:{"eth-rpc-errors>fast-safe-stringify":!0}},"external:../snaps-utils/src/icon.ts":{builtin:{buffer:!0}},"external:../snaps-utils/src/index.executionenv.ts":{packages:{"external:../snaps-utils/src/handlers.ts":!0,"external:../snaps-utils/src/logging.ts":!0,"external:../snaps-utils/src/namespace.ts":!0,"external:../snaps-utils/src/types.ts":!0}},"external:../snaps-utils/src/logging.ts":{globals:{"console.error":!0,"console.log":!0,"console.warn":!0},packages:{"@metamask/utils":!0}},"external:../snaps-utils/src/namespace.ts":{packages:{superstruct:!0}},"external:../snaps-utils/src/types.ts":{globals:{URL:!0},packages:{"@metamask/utils":!0,"external:../snaps-utils/src/handlers.ts":!0,superstruct:!0}},"istanbul-lib-report>supports-color>has-flag":{globals:{"process.argv":!0}},"json-rpc-engine":{packages:{"eth-rpc-errors":!0,"json-rpc-engine>@metamask/safe-event-emitter":!0}},"json-rpc-engine>@metamask/safe-event-emitter":{builtin:{"events.EventEmitter":!0},globals:{setTimeout:!0},packages:{events:!0}},superstruct:{globals:{"console.warn":!0,define:!0}}}});