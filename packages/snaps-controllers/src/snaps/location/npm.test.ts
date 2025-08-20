import type { SemVerRange } from '@metamask/utils';
import { createReadStream } from 'fs';
import fetchMock from 'jest-fetch-mock';
import path from 'path';
import { Readable } from 'stream';

import {
  DEFAULT_NPM_REGISTRY,
  NpmLocation,
  getNpmCanonicalBasePath,
} from './npm';

fetchMock.enableMocks();

const exampleSnapVersion = '1.2.1' as SemVerRange;

describe('NpmLocation', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  it('fetches a package tarball, extracts the necessary files, and validates them', async () => {
    const tarballUrl = `https://registry.npmjs.cf/@metamask/jsx-example-snap/-/jsx-example-snap-${exampleSnapVersion}.tgz`;
    const tarballRegistry = `https://registry.npmjs.org/@metamask/jsx-example-snap/-/jsx-example-snap-${exampleSnapVersion}.tgz`;

    const customFetchMock = jest.fn();

    customFetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          'dist-tags': {
            latest: exampleSnapVersion,
          },
          versions: {
            [exampleSnapVersion]: {
              dist: {
                // return npmjs.org registry here so that we can check overriding it with npmjs.cf works
                tarball: tarballRegistry,
              },
            },
          },
        }),
      } as any)
      .mockResolvedValue({
        // eslint-disable-next-line no-restricted-globals
        headers: new Headers({ 'content-length': '5477' }),
        ok: true,
        body: Readable.toWeb(
          createReadStream(
            path.resolve(
              __dirname,
              `../../../test/fixtures/metamask-jsx-example-snap-${exampleSnapVersion}.tgz`,
            ),
          ),
        ),
      } as any);

    const location = new NpmLocation(
      new URL('npm://registry.npmjs.cf/@metamask/jsx-example-snap'),
      {
        versionRange: exampleSnapVersion,
        fetch: customFetchMock as typeof fetch,
        allowCustomRegistries: true,
      },
    );

    const manifest = await location.manifest();
    expect(manifest.path).toBe('snap.manifest.json');
    expect(manifest.data.canonicalPath).toBe(
      'npm://registry.npmjs.cf/@metamask/jsx-example-snap/snap.manifest.json',
    );
    const sourceCode = await location.fetch(
      manifest.result.source.location.npm.filePath,
    );
    expect(sourceCode.path).toBe('dist/bundle.js');
    expect(sourceCode.data.canonicalPath).toBe(
      'npm://registry.npmjs.cf/@metamask/jsx-example-snap/dist/bundle.js',
    );

    expect(customFetchMock).toHaveBeenCalledTimes(2);
    expect(customFetchMock).toHaveBeenNthCalledWith(
      1,
      'https://registry.npmjs.cf/@metamask/jsx-example-snap',
      { headers: { accept: 'application/json' } },
    );
    expect(customFetchMock).toHaveBeenNthCalledWith(2, tarballUrl);

    expect(manifest.result).toMatchInlineSnapshot(`
      {
        "description": "MetaMask example snap demonstrating the use of JSX for UI components.",
        "initialPermissions": {
          "endowment:rpc": {
            "dapps": true,
          },
          "snap_dialog": {},
          "snap_manageState": {},
        },
        "manifestVersion": "0.1",
        "proposedName": "JSX Example Snap",
        "repository": {
          "type": "git",
          "url": "https://github.com/MetaMask/snaps.git",
        },
        "source": {
          "location": {
            "npm": {
              "filePath": "dist/bundle.js",
              "packageName": "@metamask/jsx-example-snap",
              "registry": "https://registry.npmjs.org/",
            },
          },
          "shasum": "3U9+Lvmmdc9JRmaHLcwGgi9lpnaj25joBF9+zXY4644=",
        },
        "version": "1.2.1",
      }
    `);

    expect(sourceCode.toString()).toMatchInlineSnapshot(
      `"(()=>{var e={12:e=>{e.exports=a,a.default=a,a.stable=d,a.stableStringify=d;var t="[...]",n="[Circular]",r=[],o=[];function i(){return{depthLimit:Number.MAX_SAFE_INTEGER,edgesLimit:Number.MAX_SAFE_INTEGER}}function a(e,t,n,a){var s;void 0===a&&(a=i()),c(e,"",0,[],void 0,0,a);try{s=0===o.length?JSON.stringify(e,t,n):JSON.stringify(e,l(t),n)}catch(e){return JSON.stringify("[unable to serialize, circular reference is too complex to analyze]")}finally{for(;0!==r.length;){var u=r.pop();4===u.length?Object.defineProperty(u[0],u[1],u[3]):u[0][u[1]]=u[2]}}return s}function s(e,t,n,i){var a=Object.getOwnPropertyDescriptor(i,n);void 0!==a.get?a.configurable?(Object.defineProperty(i,n,{value:e}),r.push([i,n,t,a])):o.push([t,n,e]):(i[n]=e,r.push([i,n,t]))}function c(e,r,o,i,a,u,d){var f;if(u+=1,"object"==typeof e&&null!==e){for(f=0;f<i.length;f++)if(i[f]===e)return void s(n,e,r,a);if(void 0!==d.depthLimit&&u>d.depthLimit)return void s(t,e,r,a);if(void 0!==d.edgesLimit&&o+1>d.edgesLimit)return void s(t,e,r,a);if(i.push(e),Array.isArray(e))for(f=0;f<e.length;f++)c(e[f],f,f,i,e,u,d);else{var l=Object.keys(e);for(f=0;f<l.length;f++){var p=l[f];c(e[p],p,f,i,e,u,d)}}i.pop()}}function u(e,t){return e<t?-1:e>t?1:0}function d(e,t,n,a){void 0===a&&(a=i());var s,c=f(e,"",0,[],void 0,0,a)||e;try{s=0===o.length?JSON.stringify(c,t,n):JSON.stringify(c,l(t),n)}catch(e){return JSON.stringify("[unable to serialize, circular reference is too complex to analyze]")}finally{for(;0!==r.length;){var u=r.pop();4===u.length?Object.defineProperty(u[0],u[1],u[3]):u[0][u[1]]=u[2]}}return s}function f(e,o,i,a,c,d,l){var p;if(d+=1,"object"==typeof e&&null!==e){for(p=0;p<a.length;p++)if(a[p]===e)return void s(n,e,o,c);try{if("function"==typeof e.toJSON)return}catch(e){return}if(void 0!==l.depthLimit&&d>l.depthLimit)return void s(t,e,o,c);if(void 0!==l.edgesLimit&&i+1>l.edgesLimit)return void s(t,e,o,c);if(a.push(e),Array.isArray(e))for(p=0;p<e.length;p++)f(e[p],p,p,a,e,d,l);else{var m={},h=Object.keys(e).sort(u);for(p=0;p<h.length;p++){var y=h[p];f(e[y],y,p,a,e,d,l),m[y]=e[y]}if(void 0===c)return m;r.push([c,o,e]),c[o]=m}a.pop()}}function l(e){return e=void 0!==e?e:function(e,t){return t},function(t,n){if(o.length>0)for(var r=0;r<o.length;r++){var i=o[r];if(i[1]===t&&i[0]===n){n=i[2],o.splice(r,1);break}}return e.call(this,t,n)}}}},t={};function n(r){var o=t[r];if(void 0!==o)return o.exports;var i=t[r]={exports:{}};return e[r](i,i.exports,n),i.exports}n.d=(e,t)=>{for(var r in t)n.o(t,r)&&!n.o(e,r)&&Object.defineProperty(e,r,{enumerable:!0,get:t[r]})},n.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),n.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})};var r={};(()=>{"use strict";function e(e,t,n){if("string"==typeof e)throw new Error(\`An HTML element ("\${String(e)}") was used in a Snap component, which is not supported by Snaps UI. Please use one of the supported Snap components.\`);if(!e)throw new Error("A JSX fragment was used in a Snap component, which is not supported by Snaps UI. Please use one of the supported Snap components.");return e({...t,key:n})}function t(t,n,r){return e(t,n,r)}n.r(r),n.d(r,{onRpcRequest:()=>xe,onUserInput:()=>Ae});var o={invalidInput:-32e3,resourceNotFound:-32001,resourceUnavailable:-32002,transactionRejected:-32003,methodNotSupported:-32004,limitExceeded:-32005,parse:-32700,invalidRequest:-32600,methodNotFound:-32601,invalidParams:-32602,internal:-32603},i={"-32700":{standard:"JSON RPC 2.0",message:"Invalid JSON was received by the server. An error occurred on the server while parsing the JSON text."},"-32600":{standard:"JSON RPC 2.0",message:"The JSON sent is not a valid Request object."},"-32601":{standard:"JSON RPC 2.0",message:"The method does not exist / is not available."},"-32602":{standard:"JSON RPC 2.0",message:"Invalid method parameter(s)."},"-32603":{standard:"JSON RPC 2.0",message:"Internal JSON-RPC error."},"-32000":{standard:"EIP-1474",message:"Invalid input."},"-32001":{standard:"EIP-1474",message:"Resource not found."},"-32002":{standard:"EIP-1474",message:"Resource unavailable."},"-32003":{standard:"EIP-1474",message:"Transaction rejected."},"-32004":{standard:"EIP-1474",message:"Method not supported."},"-32005":{standard:"EIP-1474",message:"Request limit exceeded."},4001:{standard:"EIP-1193",message:"User rejected the request."},4100:{standard:"EIP-1193",message:"The requested account and/or method has not been authorized by the user."},4200:{standard:"EIP-1193",message:"The requested method is not supported by this Ethereum provider."},4900:{standard:"EIP-1193",message:"The provider is disconnected from all chains."},4901:{standard:"EIP-1193",message:"The provider is disconnected from the specified chain."}};function a(e){return Boolean(e)&&"object"==typeof e&&!Array.isArray(e)}const s=(e,t)=>Object.hasOwnProperty.call(e,t);var c;!function(e){e[e.Null=4]="Null",e[e.Comma=1]="Comma",e[e.Wrapper=1]="Wrapper",e[e.True=4]="True",e[e.False=5]="False",e[e.Quote=1]="Quote",e[e.Colon=1]="Colon",e[e.Date=24]="Date"}(c=c||(c={}));class u extends TypeError{constructor(e,t){let n;const{message:r,explanation:o,...i}=e,{path:a}=e,s=0===a.length?r:\`At path: \${a.join(".")} -- \${r}\`;super(o??s),null!=o&&(this.cause=s),Object.assign(this,i),this.name=this.constructor.name,this.failures=()=>n??(n=[e,...t()])}}function d(e){return"object"==typeof e&&null!==e}function f(e){return"symbol"==typeof e?e.toString():"string"==typeof e?JSON.stringify(e):\`\${e}\`}function l(e,t,n,r){if(!0===e)return;!1===e?e={}:"string"==typeof e&&(e={message:e});const{path:o,branch:i}=t,{type:a}=n,{refinement:s,message:c=\`Expected a value of type \\\`\${a}\\\`\${s?\` with refinement \\\`\${s}\\\`\`:""}, but received: \\\`\${f(r)}\\\`\`}=e;return{value:r,type:a,refinement:s,key:o[o.length-1],path:o,branch:i,...e,message:c}}function*p(e,t,n,r){(function(e){return d(e)&&"function"==typeof e[Symbol.iterator]})(e)||(e=[e]);for(const o of e){const e=l(o,t,n,r);e&&(yield e)}}function*m(e,t,n={}){const{path:r=[],branch:o=[e],coerce:i=!1,mask:a=!1}=n,s={path:r,branch:o};if(i&&(e=t.coercer(e,s),a&&"type"!==t.type&&d(t.schema)&&d(e)&&!Array.isArray(e)))for(const n in e)void 0===t.schema[n]&&delete e[n];let c="valid";for(const r of t.validator(e,s))r.explanation=n.message,c="not_valid",yield[r,void 0];for(let[u,f,l]of t.entries(e,s)){const t=m(f,l,{path:void 0===u?r:[...r,u],branch:void 0===u?o:[...o,f],coerce:i,mask:a,message:n.message});for(const n of t)n[0]?(c=null===n[0].refinement||void 0===n[0].refinement?"not_valid":"not_refined",yield[n[0],void 0]):i&&(f=n[1],void 0===u?e=f:e instanceof Map?e.set(u,f):e instanceof Set?e.add(f):d(e)&&(void 0!==f||u in e)&&(e[u]=f))}if("not_valid"!==c)for(const r of t.refiner(e,s))r.explanation=n.message,c="not_refined",yield[r,void 0];"valid"===c&&(yield[void 0,e])}class h{constructor(e){const{type:t,schema:n,validator:r,refiner:o,coercer:i=(e=>e),entries:a=function*(){}}=e;this.type=t,this.schema=n,this.entries=a,this.coercer=i,this.validator=r?(e,t)=>p(r(e,t),t,this,e):()=>[],this.refiner=o?(e,t)=>p(o(e,t),t,this,e):()=>[]}assert(e,t){return y(e,this,t)}create(e,t){return v(e,this,t)}is(e){return g(e,this)}mask(e,t){return function(e,t,n){const r=b(e,t,{coerce:!0,mask:!0,message:n});if(r[0])throw r[0];return r[1]}(e,this,t)}validate(e,t={}){return b(e,this,t)}}function y(e,t,n){const r=b(e,t,{message:n});if(r[0])throw r[0]}function v(e,t,n){const r=b(e,t,{coerce:!0,message:n});if(r[0])throw r[0];return r[1]}function g(e,t){return!b(e,t)[0]}function b(e,t,n={}){const r=m(e,t,n),o=function(e){const{done:t,value:n}=e.next();return t?void 0:n}(r);if(o[0]){return[new u(o[0],(function*(){for(const e of r)e[0]&&(yield e[0])})),void 0]}return[void 0,o[1]]}function E(...e){const t="type"===e[0]?.type,n=e.map((({schema:e})=>e)),r=Object.assign({},...n);return t?function(e){const t=Object.keys(e);return new h({type:"type",schema:e,*entries(n){if(d(n))for(const r of t)yield[r,n[r],e[r]]},validator:e=>d(e)||\`Expected an object, but received: \${f(e)}\`,coercer:e=>d(e)?{...e}:e})}(r):I(r)}function w(e,t){return new h({type:e,schema:null,validator:t})}function S(e){let t;return new h({type:"lazy",schema:null,*entries(n,r){t??(t=e()),yield*t.entries(n,r)},validator:(n,r)=>(t??(t=e()),t.validator(n,r)),coercer:(n,r)=>(t??(t=e()),t.coercer(n,r)),refiner:(n,r)=>(t??(t=e()),t.refiner(n,r))})}function O(e){return new h({type:"array",schema:e,*entries(t){if(e&&Array.isArray(t))for(const[n,r]of t.entries())yield[n,r,e]},coercer:e=>Array.isArray(e)?e.slice():e,validator:e=>Array.isArray(e)||\`Expected an array value, but received: \${f(e)}\`})}function j(){return w("boolean",(e=>"boolean"==typeof e))}function N(e){const t=f(e),n=typeof e;return new h({type:"literal",schema:"string"===n||"number"===n||"boolean"===n?e:null,validator:n=>n===e||\`Expected the literal \\\`\${t}\\\`, but received: \${f(n)}\`})}function P(){return w("never",(()=>!1))}function x(e){return new h({...e,validator:(t,n)=>null===t||e.validator(t,n),refiner:(t,n)=>null===t||e.refiner(t,n)})}function A(){return w("number",(e=>"number"==typeof e&&!isNaN(e)||\`Expected a number, but received: \${f(e)}\`))}function I(e){const t=e?Object.keys(e):[],n=P();return new h({type:"object",schema:e??null,*entries(r){if(e&&d(r)){const o=new Set(Object.keys(r));for(const n of t)o.delete(n),yield[n,r[n],e[n]];for(const e of o)yield[e,r[e],n]}},validator:e=>d(e)||\`Expected an object, but received: \${f(e)}\`,coercer:e=>d(e)?{...e}:e})}function k(e){return new h({...e,validator:(t,n)=>void 0===t||e.validator(t,n),refiner:(t,n)=>void 0===t||e.refiner(t,n)})}function _(e,t){return new h({type:"record",schema:null,*entries(n){if(d(n))for(const r in n){const o=n[r];yield[r,r,e],yield[r,o,t]}},validator:e=>d(e)||\`Expected an object, but received: \${f(e)}\`})}function C(){return w("string",(e=>"string"==typeof e||\`Expected a string, but received: \${f(e)}\`))}function $(e){const t=e.map((e=>e.type)).join(" | ");return new h({type:"union",schema:null,coercer(t){for(const n of e){const[e,r]=n.validate(t,{coerce:!0});if(!e)return r}return t},validator(n,r){const o=[];for(const t of e){const[...e]=m(n,t,r),[i]=e;if(!i?.[0])return[];for(const[t]of e)t&&o.push(t)}return[\`Expected the value to satisfy a union of \\\`\${t}\\\`, but received: \${f(n)}\`,...o]}})}function J(e,t,n){return new h({...e,coercer:(r,o)=>g(r,t)?e.coercer(n(r,o),o):e.coercer(r,o)})}function T(e){return function(e){return function(e){return"object"==typeof e&&null!==e&&"message"in e}(e)&&"string"==typeof e.message?e.message:null==e?"":String(e)}(e).replace(/\\.$/u,"")}function R(e,t){return n=e,Boolean("string"==typeof n?.prototype?.constructor?.name)?new e({message:t}):e({message:t});var n}class F extends Error{constructor(e){super(e.message),this.code="ERR_ASSERTION"}}function q(e,t="Assertion failed.",n=F){if(!e){if(t instanceof Error)throw t;throw R(n,t)}}const L=e=>I(e);function M({path:e,branch:t}){const n=e[e.length-1];return s(t[t.length-2],n)}function U(e){return new h({...e,type:\`optional \${e.type}\`,validator:(t,n)=>!M(n)||e.validator(t,n),refiner:(t,n)=>!M(n)||e.refiner(t,n)})}const z=$([N(null),j(),w("finite number",(e=>g(e,A())&&Number.isFinite(e))),C(),O(S((()=>z))),_(C(),S((()=>z)))]),B=J(z,w("any",(()=>!0)),(e=>(function(e,t,n="Assertion failed",r=F){try{y(e,t)}catch(e){throw R(r,\`\${n}: \${T(e)}.\`)}}(e,z),JSON.parse(JSON.stringify(e,((e,t)=>{if("__proto__"!==e&&"constructor"!==e)return t}))))));function D(e){try{return function(e){v(e,B)}(e),!0}catch{return!1}}const X=N("2.0"),G=x($([A(),C()])),H=L({code:w("integer",(e=>"number"==typeof e&&!isNaN(e)&&Number.isInteger(e)||\`Expected an integer, but received: \${f(e)}\`)),message:C(),data:U(B),stack:U(C())}),Q=$([_(C(),B),O(B)]);L({id:G,jsonrpc:X,method:C(),params:U(Q)}),L({jsonrpc:X,method:C(),params:U(Q)});I({id:G,jsonrpc:X,result:k(w("unknown",(()=>!0))),error:k(H)});const W=L({id:G,jsonrpc:X,result:B}),K=L({id:G,jsonrpc:X,error:H});$([W,K]);var V=o.internal,Y="Unspecified error message. This is a bug, please report it.",Z=(ee(V),"Unspecified server error.");function ee(e,t=Y){if(function(e){return Number.isInteger(e)}(e)){const t=e.toString();if(s(i,t))return i[t].message;if(function(e){return e>=-32099&&e<=-32e3}(e))return Z}return t}function te(e){return Array.isArray(e)?e.map((e=>D(e)?e:a(e)?ne(e):null)):a(e)?ne(e):D(e)?e:null}function ne(e){return Object.getOwnPropertyNames(e).reduce(((t,n)=>{const r=e[n];return D(r)&&(t[n]=r),t}),{})}var re=n(12),oe=class extends Error{constructor(e,t,n){var r=(...e)=>{super(...e)};if(!Number.isInteger(e))throw new Error('"code" must be an integer.');if(!t||"string"!=typeof t)throw new Error('"message" must be a non-empty string.');!function(e){return a(e)&&s(e,"cause")&&a(e.cause)}(n)?r(t):(r(t,{cause:n.cause}),s(this,"cause")||Object.assign(this,{cause:n.cause})),void 0!==n&&(this.data=n),this.code=e}serialize(){const e={code:this.code,message:this.message};return void 0!==this.data&&(e.data=this.data,function(e){if("object"!=typeof e||null===e)return!1;try{let t=e;for(;null!==Object.getPrototypeOf(t);)t=Object.getPrototypeOf(t);return Object.getPrototypeOf(e)===t}catch(e){return!1}}(this.data)&&(e.data.cause=te(this.data.cause))),this.stack&&(e.stack=this.stack),e}toString(){return re(this.serialize(),ie,2)}};function ie(e,t){if("[Circular]"!==t)return t}var ae,se,ce=e=>ue(o.methodNotFound,e);function ue(e,t){const[n,r]=de(t);return new oe(e,n??ee(e),r)}function de(e){if(e){if("string"==typeof e)return[e];if("object"==typeof e&&!Array.isArray(e)){const{message:t,data:n}=e;if(t&&"string"!=typeof t)throw new Error("Must specify string message.");return[t??void 0,n]}}return[]}!function(e){e.Alert="alert",e.Confirmation="confirmation",e.Prompt="prompt"}(ae||(ae={})),function(e){e.ButtonClickEvent="ButtonClickEvent",e.FormSubmitEvent="FormSubmitEvent",e.InputChangeEvent="InputChangeEvent",e.FileUploadEvent="FileUploadEvent"}(se||(se={}));const fe=I({type:C(),name:k(C())}),le=E(fe,I({type:N(se.ButtonClickEvent),name:k(C())})),pe=I({name:C(),size:A(),contentType:C(),contents:C()}),me=E(fe,I({type:N(se.FormSubmitEvent),value:_(C(),x($([C(),pe,j()]))),name:C()})),he=E(fe,I({type:N(se.InputChangeEvent),name:C(),value:$([C(),j()])}));$([le,me,he,E(fe,I({type:N(se.FileUploadEvent),name:C(),file:x(pe)}))]);function ye(e){return Object.fromEntries(Object.entries(e).filter((([,e])=>void 0!==e)))}function ve(e){return t=>{const{key:n=null,...r}=t;return{type:e,props:ye(r),key:n}}}const ge=ve("Text"),be=ve("Bold"),Ee=ve("Box"),we=ve("Tooltip"),Se=ve("Card"),Oe=ve("Button"),je=()=>t(ge,{children:["Click the ",e(be,{children:"increment"})," button to increase the count."]}),Ne=({count:n})=>t(Ee,{children:[e(we,{content:e(je,{}),children:e(ge,{children:"Hover for explanation"})}),e(Se,{title:"Count",value:String(n)}),e(Oe,{name:"increment",children:"Increment"})]});async function Pe(){const e=await snap.request({method:"snap_manageState",params:{operation:"get"}});return e?(q("number"==typeof e.count,"Expected count to be a number."),e.count):0}const xe=async({request:t})=>{if("display"===t.method){const t=await Pe();return await snap.request({method:"snap_dialog",params:{type:ae.Alert,content:e(Ne,{count:t})}})}throw ce({data:{method:t.method}})},Ae=async({event:t,id:n})=>{q(t.type===se.ButtonClickEvent),q("increment"===t.name);const r=await async function(){const e={count:await Pe()+1};return await snap.request({method:"snap_manageState",params:{operation:"update",newState:e}}),e.count}();await snap.request({method:"snap_updateInterface",params:{id:n,ui:e(Ne,{count:r})}})}})();var o=exports;for(var i in r)o[i]=r[i];r.__esModule&&Object.defineProperty(o,"__esModule",{value:!0})})();"`,
    );

    expect(location.version).toBe(exampleSnapVersion);
  });

  it('fetches a package tarball directly without fetching the metadata when possible', async () => {
    const customFetchMock = jest.fn();

    customFetchMock.mockResolvedValue({
      ok: true,
      // eslint-disable-next-line no-restricted-globals
      headers: new Headers({ 'content-length': '5477' }),
      body: Readable.toWeb(
        createReadStream(
          path.resolve(
            __dirname,
            `../../../test/fixtures/metamask-jsx-example-snap-${exampleSnapVersion}.tgz`,
          ),
        ),
      ),
    } as any);

    const tarballUrl = `https://registry.npmjs.org/@metamask/jsx-example-snap/-/jsx-example-snap-${exampleSnapVersion}.tgz`;

    const location = new NpmLocation(
      new URL('npm:@metamask/jsx-example-snap'),
      {
        versionRange: exampleSnapVersion,
        fetch: customFetchMock as typeof fetch,
      },
    );

    const manifest = await location.manifest();
    const sourceCode = (
      await location.fetch(manifest.result.source.location.npm.filePath)
    ).toString();

    expect(customFetchMock).toHaveBeenCalledTimes(1);
    expect(customFetchMock).toHaveBeenNthCalledWith(1, tarballUrl);

    expect(manifest.result).toMatchInlineSnapshot(`
      {
        "description": "MetaMask example snap demonstrating the use of JSX for UI components.",
        "initialPermissions": {
          "endowment:rpc": {
            "dapps": true,
          },
          "snap_dialog": {},
          "snap_manageState": {},
        },
        "manifestVersion": "0.1",
        "proposedName": "JSX Example Snap",
        "repository": {
          "type": "git",
          "url": "https://github.com/MetaMask/snaps.git",
        },
        "source": {
          "location": {
            "npm": {
              "filePath": "dist/bundle.js",
              "packageName": "@metamask/jsx-example-snap",
              "registry": "https://registry.npmjs.org/",
            },
          },
          "shasum": "3U9+Lvmmdc9JRmaHLcwGgi9lpnaj25joBF9+zXY4644=",
        },
        "version": "1.2.1",
      }
    `);

    expect(sourceCode).toMatchInlineSnapshot(
      `"(()=>{var e={12:e=>{e.exports=a,a.default=a,a.stable=d,a.stableStringify=d;var t="[...]",n="[Circular]",r=[],o=[];function i(){return{depthLimit:Number.MAX_SAFE_INTEGER,edgesLimit:Number.MAX_SAFE_INTEGER}}function a(e,t,n,a){var s;void 0===a&&(a=i()),c(e,"",0,[],void 0,0,a);try{s=0===o.length?JSON.stringify(e,t,n):JSON.stringify(e,l(t),n)}catch(e){return JSON.stringify("[unable to serialize, circular reference is too complex to analyze]")}finally{for(;0!==r.length;){var u=r.pop();4===u.length?Object.defineProperty(u[0],u[1],u[3]):u[0][u[1]]=u[2]}}return s}function s(e,t,n,i){var a=Object.getOwnPropertyDescriptor(i,n);void 0!==a.get?a.configurable?(Object.defineProperty(i,n,{value:e}),r.push([i,n,t,a])):o.push([t,n,e]):(i[n]=e,r.push([i,n,t]))}function c(e,r,o,i,a,u,d){var f;if(u+=1,"object"==typeof e&&null!==e){for(f=0;f<i.length;f++)if(i[f]===e)return void s(n,e,r,a);if(void 0!==d.depthLimit&&u>d.depthLimit)return void s(t,e,r,a);if(void 0!==d.edgesLimit&&o+1>d.edgesLimit)return void s(t,e,r,a);if(i.push(e),Array.isArray(e))for(f=0;f<e.length;f++)c(e[f],f,f,i,e,u,d);else{var l=Object.keys(e);for(f=0;f<l.length;f++){var p=l[f];c(e[p],p,f,i,e,u,d)}}i.pop()}}function u(e,t){return e<t?-1:e>t?1:0}function d(e,t,n,a){void 0===a&&(a=i());var s,c=f(e,"",0,[],void 0,0,a)||e;try{s=0===o.length?JSON.stringify(c,t,n):JSON.stringify(c,l(t),n)}catch(e){return JSON.stringify("[unable to serialize, circular reference is too complex to analyze]")}finally{for(;0!==r.length;){var u=r.pop();4===u.length?Object.defineProperty(u[0],u[1],u[3]):u[0][u[1]]=u[2]}}return s}function f(e,o,i,a,c,d,l){var p;if(d+=1,"object"==typeof e&&null!==e){for(p=0;p<a.length;p++)if(a[p]===e)return void s(n,e,o,c);try{if("function"==typeof e.toJSON)return}catch(e){return}if(void 0!==l.depthLimit&&d>l.depthLimit)return void s(t,e,o,c);if(void 0!==l.edgesLimit&&i+1>l.edgesLimit)return void s(t,e,o,c);if(a.push(e),Array.isArray(e))for(p=0;p<e.length;p++)f(e[p],p,p,a,e,d,l);else{var m={},h=Object.keys(e).sort(u);for(p=0;p<h.length;p++){var y=h[p];f(e[y],y,p,a,e,d,l),m[y]=e[y]}if(void 0===c)return m;r.push([c,o,e]),c[o]=m}a.pop()}}function l(e){return e=void 0!==e?e:function(e,t){return t},function(t,n){if(o.length>0)for(var r=0;r<o.length;r++){var i=o[r];if(i[1]===t&&i[0]===n){n=i[2],o.splice(r,1);break}}return e.call(this,t,n)}}}},t={};function n(r){var o=t[r];if(void 0!==o)return o.exports;var i=t[r]={exports:{}};return e[r](i,i.exports,n),i.exports}n.d=(e,t)=>{for(var r in t)n.o(t,r)&&!n.o(e,r)&&Object.defineProperty(e,r,{enumerable:!0,get:t[r]})},n.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),n.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})};var r={};(()=>{"use strict";function e(e,t,n){if("string"==typeof e)throw new Error(\`An HTML element ("\${String(e)}") was used in a Snap component, which is not supported by Snaps UI. Please use one of the supported Snap components.\`);if(!e)throw new Error("A JSX fragment was used in a Snap component, which is not supported by Snaps UI. Please use one of the supported Snap components.");return e({...t,key:n})}function t(t,n,r){return e(t,n,r)}n.r(r),n.d(r,{onRpcRequest:()=>xe,onUserInput:()=>Ae});var o={invalidInput:-32e3,resourceNotFound:-32001,resourceUnavailable:-32002,transactionRejected:-32003,methodNotSupported:-32004,limitExceeded:-32005,parse:-32700,invalidRequest:-32600,methodNotFound:-32601,invalidParams:-32602,internal:-32603},i={"-32700":{standard:"JSON RPC 2.0",message:"Invalid JSON was received by the server. An error occurred on the server while parsing the JSON text."},"-32600":{standard:"JSON RPC 2.0",message:"The JSON sent is not a valid Request object."},"-32601":{standard:"JSON RPC 2.0",message:"The method does not exist / is not available."},"-32602":{standard:"JSON RPC 2.0",message:"Invalid method parameter(s)."},"-32603":{standard:"JSON RPC 2.0",message:"Internal JSON-RPC error."},"-32000":{standard:"EIP-1474",message:"Invalid input."},"-32001":{standard:"EIP-1474",message:"Resource not found."},"-32002":{standard:"EIP-1474",message:"Resource unavailable."},"-32003":{standard:"EIP-1474",message:"Transaction rejected."},"-32004":{standard:"EIP-1474",message:"Method not supported."},"-32005":{standard:"EIP-1474",message:"Request limit exceeded."},4001:{standard:"EIP-1193",message:"User rejected the request."},4100:{standard:"EIP-1193",message:"The requested account and/or method has not been authorized by the user."},4200:{standard:"EIP-1193",message:"The requested method is not supported by this Ethereum provider."},4900:{standard:"EIP-1193",message:"The provider is disconnected from all chains."},4901:{standard:"EIP-1193",message:"The provider is disconnected from the specified chain."}};function a(e){return Boolean(e)&&"object"==typeof e&&!Array.isArray(e)}const s=(e,t)=>Object.hasOwnProperty.call(e,t);var c;!function(e){e[e.Null=4]="Null",e[e.Comma=1]="Comma",e[e.Wrapper=1]="Wrapper",e[e.True=4]="True",e[e.False=5]="False",e[e.Quote=1]="Quote",e[e.Colon=1]="Colon",e[e.Date=24]="Date"}(c=c||(c={}));class u extends TypeError{constructor(e,t){let n;const{message:r,explanation:o,...i}=e,{path:a}=e,s=0===a.length?r:\`At path: \${a.join(".")} -- \${r}\`;super(o??s),null!=o&&(this.cause=s),Object.assign(this,i),this.name=this.constructor.name,this.failures=()=>n??(n=[e,...t()])}}function d(e){return"object"==typeof e&&null!==e}function f(e){return"symbol"==typeof e?e.toString():"string"==typeof e?JSON.stringify(e):\`\${e}\`}function l(e,t,n,r){if(!0===e)return;!1===e?e={}:"string"==typeof e&&(e={message:e});const{path:o,branch:i}=t,{type:a}=n,{refinement:s,message:c=\`Expected a value of type \\\`\${a}\\\`\${s?\` with refinement \\\`\${s}\\\`\`:""}, but received: \\\`\${f(r)}\\\`\`}=e;return{value:r,type:a,refinement:s,key:o[o.length-1],path:o,branch:i,...e,message:c}}function*p(e,t,n,r){(function(e){return d(e)&&"function"==typeof e[Symbol.iterator]})(e)||(e=[e]);for(const o of e){const e=l(o,t,n,r);e&&(yield e)}}function*m(e,t,n={}){const{path:r=[],branch:o=[e],coerce:i=!1,mask:a=!1}=n,s={path:r,branch:o};if(i&&(e=t.coercer(e,s),a&&"type"!==t.type&&d(t.schema)&&d(e)&&!Array.isArray(e)))for(const n in e)void 0===t.schema[n]&&delete e[n];let c="valid";for(const r of t.validator(e,s))r.explanation=n.message,c="not_valid",yield[r,void 0];for(let[u,f,l]of t.entries(e,s)){const t=m(f,l,{path:void 0===u?r:[...r,u],branch:void 0===u?o:[...o,f],coerce:i,mask:a,message:n.message});for(const n of t)n[0]?(c=null===n[0].refinement||void 0===n[0].refinement?"not_valid":"not_refined",yield[n[0],void 0]):i&&(f=n[1],void 0===u?e=f:e instanceof Map?e.set(u,f):e instanceof Set?e.add(f):d(e)&&(void 0!==f||u in e)&&(e[u]=f))}if("not_valid"!==c)for(const r of t.refiner(e,s))r.explanation=n.message,c="not_refined",yield[r,void 0];"valid"===c&&(yield[void 0,e])}class h{constructor(e){const{type:t,schema:n,validator:r,refiner:o,coercer:i=(e=>e),entries:a=function*(){}}=e;this.type=t,this.schema=n,this.entries=a,this.coercer=i,this.validator=r?(e,t)=>p(r(e,t),t,this,e):()=>[],this.refiner=o?(e,t)=>p(o(e,t),t,this,e):()=>[]}assert(e,t){return y(e,this,t)}create(e,t){return v(e,this,t)}is(e){return g(e,this)}mask(e,t){return function(e,t,n){const r=b(e,t,{coerce:!0,mask:!0,message:n});if(r[0])throw r[0];return r[1]}(e,this,t)}validate(e,t={}){return b(e,this,t)}}function y(e,t,n){const r=b(e,t,{message:n});if(r[0])throw r[0]}function v(e,t,n){const r=b(e,t,{coerce:!0,message:n});if(r[0])throw r[0];return r[1]}function g(e,t){return!b(e,t)[0]}function b(e,t,n={}){const r=m(e,t,n),o=function(e){const{done:t,value:n}=e.next();return t?void 0:n}(r);if(o[0]){return[new u(o[0],(function*(){for(const e of r)e[0]&&(yield e[0])})),void 0]}return[void 0,o[1]]}function E(...e){const t="type"===e[0]?.type,n=e.map((({schema:e})=>e)),r=Object.assign({},...n);return t?function(e){const t=Object.keys(e);return new h({type:"type",schema:e,*entries(n){if(d(n))for(const r of t)yield[r,n[r],e[r]]},validator:e=>d(e)||\`Expected an object, but received: \${f(e)}\`,coercer:e=>d(e)?{...e}:e})}(r):I(r)}function w(e,t){return new h({type:e,schema:null,validator:t})}function S(e){let t;return new h({type:"lazy",schema:null,*entries(n,r){t??(t=e()),yield*t.entries(n,r)},validator:(n,r)=>(t??(t=e()),t.validator(n,r)),coercer:(n,r)=>(t??(t=e()),t.coercer(n,r)),refiner:(n,r)=>(t??(t=e()),t.refiner(n,r))})}function O(e){return new h({type:"array",schema:e,*entries(t){if(e&&Array.isArray(t))for(const[n,r]of t.entries())yield[n,r,e]},coercer:e=>Array.isArray(e)?e.slice():e,validator:e=>Array.isArray(e)||\`Expected an array value, but received: \${f(e)}\`})}function j(){return w("boolean",(e=>"boolean"==typeof e))}function N(e){const t=f(e),n=typeof e;return new h({type:"literal",schema:"string"===n||"number"===n||"boolean"===n?e:null,validator:n=>n===e||\`Expected the literal \\\`\${t}\\\`, but received: \${f(n)}\`})}function P(){return w("never",(()=>!1))}function x(e){return new h({...e,validator:(t,n)=>null===t||e.validator(t,n),refiner:(t,n)=>null===t||e.refiner(t,n)})}function A(){return w("number",(e=>"number"==typeof e&&!isNaN(e)||\`Expected a number, but received: \${f(e)}\`))}function I(e){const t=e?Object.keys(e):[],n=P();return new h({type:"object",schema:e??null,*entries(r){if(e&&d(r)){const o=new Set(Object.keys(r));for(const n of t)o.delete(n),yield[n,r[n],e[n]];for(const e of o)yield[e,r[e],n]}},validator:e=>d(e)||\`Expected an object, but received: \${f(e)}\`,coercer:e=>d(e)?{...e}:e})}function k(e){return new h({...e,validator:(t,n)=>void 0===t||e.validator(t,n),refiner:(t,n)=>void 0===t||e.refiner(t,n)})}function _(e,t){return new h({type:"record",schema:null,*entries(n){if(d(n))for(const r in n){const o=n[r];yield[r,r,e],yield[r,o,t]}},validator:e=>d(e)||\`Expected an object, but received: \${f(e)}\`})}function C(){return w("string",(e=>"string"==typeof e||\`Expected a string, but received: \${f(e)}\`))}function $(e){const t=e.map((e=>e.type)).join(" | ");return new h({type:"union",schema:null,coercer(t){for(const n of e){const[e,r]=n.validate(t,{coerce:!0});if(!e)return r}return t},validator(n,r){const o=[];for(const t of e){const[...e]=m(n,t,r),[i]=e;if(!i?.[0])return[];for(const[t]of e)t&&o.push(t)}return[\`Expected the value to satisfy a union of \\\`\${t}\\\`, but received: \${f(n)}\`,...o]}})}function J(e,t,n){return new h({...e,coercer:(r,o)=>g(r,t)?e.coercer(n(r,o),o):e.coercer(r,o)})}function T(e){return function(e){return function(e){return"object"==typeof e&&null!==e&&"message"in e}(e)&&"string"==typeof e.message?e.message:null==e?"":String(e)}(e).replace(/\\.$/u,"")}function R(e,t){return n=e,Boolean("string"==typeof n?.prototype?.constructor?.name)?new e({message:t}):e({message:t});var n}class F extends Error{constructor(e){super(e.message),this.code="ERR_ASSERTION"}}function q(e,t="Assertion failed.",n=F){if(!e){if(t instanceof Error)throw t;throw R(n,t)}}const L=e=>I(e);function M({path:e,branch:t}){const n=e[e.length-1];return s(t[t.length-2],n)}function U(e){return new h({...e,type:\`optional \${e.type}\`,validator:(t,n)=>!M(n)||e.validator(t,n),refiner:(t,n)=>!M(n)||e.refiner(t,n)})}const z=$([N(null),j(),w("finite number",(e=>g(e,A())&&Number.isFinite(e))),C(),O(S((()=>z))),_(C(),S((()=>z)))]),B=J(z,w("any",(()=>!0)),(e=>(function(e,t,n="Assertion failed",r=F){try{y(e,t)}catch(e){throw R(r,\`\${n}: \${T(e)}.\`)}}(e,z),JSON.parse(JSON.stringify(e,((e,t)=>{if("__proto__"!==e&&"constructor"!==e)return t}))))));function D(e){try{return function(e){v(e,B)}(e),!0}catch{return!1}}const X=N("2.0"),G=x($([A(),C()])),H=L({code:w("integer",(e=>"number"==typeof e&&!isNaN(e)&&Number.isInteger(e)||\`Expected an integer, but received: \${f(e)}\`)),message:C(),data:U(B),stack:U(C())}),Q=$([_(C(),B),O(B)]);L({id:G,jsonrpc:X,method:C(),params:U(Q)}),L({jsonrpc:X,method:C(),params:U(Q)});I({id:G,jsonrpc:X,result:k(w("unknown",(()=>!0))),error:k(H)});const W=L({id:G,jsonrpc:X,result:B}),K=L({id:G,jsonrpc:X,error:H});$([W,K]);var V=o.internal,Y="Unspecified error message. This is a bug, please report it.",Z=(ee(V),"Unspecified server error.");function ee(e,t=Y){if(function(e){return Number.isInteger(e)}(e)){const t=e.toString();if(s(i,t))return i[t].message;if(function(e){return e>=-32099&&e<=-32e3}(e))return Z}return t}function te(e){return Array.isArray(e)?e.map((e=>D(e)?e:a(e)?ne(e):null)):a(e)?ne(e):D(e)?e:null}function ne(e){return Object.getOwnPropertyNames(e).reduce(((t,n)=>{const r=e[n];return D(r)&&(t[n]=r),t}),{})}var re=n(12),oe=class extends Error{constructor(e,t,n){var r=(...e)=>{super(...e)};if(!Number.isInteger(e))throw new Error('"code" must be an integer.');if(!t||"string"!=typeof t)throw new Error('"message" must be a non-empty string.');!function(e){return a(e)&&s(e,"cause")&&a(e.cause)}(n)?r(t):(r(t,{cause:n.cause}),s(this,"cause")||Object.assign(this,{cause:n.cause})),void 0!==n&&(this.data=n),this.code=e}serialize(){const e={code:this.code,message:this.message};return void 0!==this.data&&(e.data=this.data,function(e){if("object"!=typeof e||null===e)return!1;try{let t=e;for(;null!==Object.getPrototypeOf(t);)t=Object.getPrototypeOf(t);return Object.getPrototypeOf(e)===t}catch(e){return!1}}(this.data)&&(e.data.cause=te(this.data.cause))),this.stack&&(e.stack=this.stack),e}toString(){return re(this.serialize(),ie,2)}};function ie(e,t){if("[Circular]"!==t)return t}var ae,se,ce=e=>ue(o.methodNotFound,e);function ue(e,t){const[n,r]=de(t);return new oe(e,n??ee(e),r)}function de(e){if(e){if("string"==typeof e)return[e];if("object"==typeof e&&!Array.isArray(e)){const{message:t,data:n}=e;if(t&&"string"!=typeof t)throw new Error("Must specify string message.");return[t??void 0,n]}}return[]}!function(e){e.Alert="alert",e.Confirmation="confirmation",e.Prompt="prompt"}(ae||(ae={})),function(e){e.ButtonClickEvent="ButtonClickEvent",e.FormSubmitEvent="FormSubmitEvent",e.InputChangeEvent="InputChangeEvent",e.FileUploadEvent="FileUploadEvent"}(se||(se={}));const fe=I({type:C(),name:k(C())}),le=E(fe,I({type:N(se.ButtonClickEvent),name:k(C())})),pe=I({name:C(),size:A(),contentType:C(),contents:C()}),me=E(fe,I({type:N(se.FormSubmitEvent),value:_(C(),x($([C(),pe,j()]))),name:C()})),he=E(fe,I({type:N(se.InputChangeEvent),name:C(),value:$([C(),j()])}));$([le,me,he,E(fe,I({type:N(se.FileUploadEvent),name:C(),file:x(pe)}))]);function ye(e){return Object.fromEntries(Object.entries(e).filter((([,e])=>void 0!==e)))}function ve(e){return t=>{const{key:n=null,...r}=t;return{type:e,props:ye(r),key:n}}}const ge=ve("Text"),be=ve("Bold"),Ee=ve("Box"),we=ve("Tooltip"),Se=ve("Card"),Oe=ve("Button"),je=()=>t(ge,{children:["Click the ",e(be,{children:"increment"})," button to increase the count."]}),Ne=({count:n})=>t(Ee,{children:[e(we,{content:e(je,{}),children:e(ge,{children:"Hover for explanation"})}),e(Se,{title:"Count",value:String(n)}),e(Oe,{name:"increment",children:"Increment"})]});async function Pe(){const e=await snap.request({method:"snap_manageState",params:{operation:"get"}});return e?(q("number"==typeof e.count,"Expected count to be a number."),e.count):0}const xe=async({request:t})=>{if("display"===t.method){const t=await Pe();return await snap.request({method:"snap_dialog",params:{type:ae.Alert,content:e(Ne,{count:t})}})}throw ce({data:{method:t.method}})},Ae=async({event:t,id:n})=>{q(t.type===se.ButtonClickEvent),q("increment"===t.name);const r=await async function(){const e={count:await Pe()+1};return await snap.request({method:"snap_manageState",params:{operation:"update",newState:e}}),e.count}();await snap.request({method:"snap_updateInterface",params:{id:n,ui:e(Ne,{count:r})}})}})();var o=exports;for(var i in r)o[i]=r[i];r.__esModule&&Object.defineProperty(o,"__esModule",{value:!0})})();"`,
    );

    expect(location.version).toBe(exampleSnapVersion);
  });

  it('throws if fetch fails', async () => {
    fetchMock.mockResponse(async () => ({ status: 404, body: 'Not found' }));
    const location = new NpmLocation(new URL('npm:@metamask/jsx-example-snap'));
    await expect(location.manifest()).rejects.toThrow(
      'Failed to fetch NPM registry entry. Status code: 404.',
    );
    await expect(location.fetch('foo')).rejects.toThrow(
      'Failed to fetch NPM registry entry. Status code: 404.',
    );
  });

  it('throws if fetching the NPM tarball fails', async () => {
    const tarballRegistry = `https://registry.npmjs.org/@metamask/jsx-example-snap/-/jsx-example-snap-${exampleSnapVersion}.tgz`;

    const customFetchMock = jest.fn();

    customFetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          'dist-tags': {
            latest: exampleSnapVersion,
          },
          versions: {
            [exampleSnapVersion]: {
              dist: {
                // return npmjs.org registry here so that we can check overriding it with npmjs.cf works
                tarball: tarballRegistry,
              },
            },
          },
        }),
      } as any)
      .mockResolvedValue({
        ok: false,
        body: null,
      } as any);

    const location = new NpmLocation(
      new URL('npm:@metamask/jsx-example-snap'),
      {
        versionRange: exampleSnapVersion,
        fetch: customFetchMock as typeof fetch,
      },
    );

    await expect(location.manifest()).rejects.toThrow(
      'Failed to fetch tarball for package "@metamask/jsx-example-snap"',
    );
  });

  it('throws if NPM returns 404', async () => {
    const customFetchMock = jest.fn().mockResolvedValue({
      ok: false,
      body: null,
      status: 404,
    } as any);

    const location = new NpmLocation(
      new URL('npm:@metamask/jsx-example-snap'),
      {
        versionRange: exampleSnapVersion,
        fetch: customFetchMock as typeof fetch,
      },
    );

    await expect(location.manifest()).rejects.toThrow(
      '"@metamask/jsx-example-snap" was not found in the NPM registry',
    );
  });

  it('throws if the NPM tarball URL is invalid', async () => {
    const customFetchMock = jest.fn();

    customFetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        'dist-tags': {
          latest: exampleSnapVersion,
        },
        versions: {
          [exampleSnapVersion]: {
            dist: {
              tarball: 'foo',
            },
          },
        },
      }),
    } as any);

    const location = new NpmLocation(
      new URL('npm:@metamask/jsx-example-snap'),
      {
        versionRange: '*' as SemVerRange,
        fetch: customFetchMock as typeof fetch,
      },
    );

    await expect(location.manifest()).rejects.toThrow(
      `Failed to find valid tarball URL in NPM metadata for package "@metamask/jsx-example-snap".`,
    );
  });

  it("can't use custom registries by default", () => {
    expect(
      () =>
        new NpmLocation(
          new URL('npm://registry.npmjs.cf/@metamask/jsx-example-snap'),
        ),
    ).toThrow(
      'Custom NPM registries are disabled, tried to use "https://registry.npmjs.cf/"',
    );
  });

  it.each(['foo:bar@registry.com', 'foo@registry.com'])(
    'supports registries with usernames and passwords',
    (host) => {
      const location = new NpmLocation(new URL(`npm://${host}/snap`), {
        allowCustomRegistries: true,
      });
      expect(location.registry.toString()).toBe(`https://${host}/`);
    },
  );

  it('has meta properties', () => {
    const location = new NpmLocation(new URL('npm:foo'));
    expect(location.packageName).toBe('foo');
    expect(location.registry.toString()).toBe('https://registry.npmjs.org/');
    expect(location.versionRange).toBe('*');
    expect(() => location.version).toThrow(
      'Tried to access version without first fetching NPM package.',
    );
  });

  // TODO(ritave): Doing this tests requires writing tarball packing utility function
  //               With the current changeset going way out of scope, I'm leaving this for future.
  it.todo('sets canonical path properly');
  // TODO(ritave): Requires writing tarball packing utility out of scope for a hot-fix blocking release.
  it.todo('paths are normalized to remove "./" prefix');
});

describe('getNpmCanonicalBasePath', () => {
  it('returns the default base path', () => {
    expect(
      getNpmCanonicalBasePath(DEFAULT_NPM_REGISTRY, '@metamask/example-snap'),
    ).toBe('npm://registry.npmjs.org/@metamask/example-snap/');
  });

  it('returns a path for a custom registry', () => {
    expect(
      getNpmCanonicalBasePath(
        new URL('https://foo:bar@registry.com/'),
        '@metamask/example-snap',
      ),
    ).toBe('npm://foo:bar@registry.com/@metamask/example-snap/');
  });
});
