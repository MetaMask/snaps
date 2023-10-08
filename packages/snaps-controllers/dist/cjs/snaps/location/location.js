"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "detectSnapLocation", {
    enumerable: true,
    get: function() {
        return detectSnapLocation;
    }
});
const _utils = require("@metamask/utils");
const _http = require("./http");
const _local = require("./local");
const _npm = require("./npm");
function detectSnapLocation(location, opts) {
    const allowHttp = opts?.allowHttp ?? false;
    const allowLocal = opts?.allowLocal ?? false;
    const root = new URL(location);
    switch(root.protocol){
        case 'npm:':
            return new _npm.NpmLocation(root, opts);
        case 'local:':
            (0, _utils.assert)(allowLocal, new TypeError('Fetching local snaps is disabled.'));
            return new _local.LocalLocation(root, opts);
        case 'http:':
        case 'https:':
            (0, _utils.assert)(allowHttp, new TypeError('Fetching snaps through http/https is disabled.'));
            return new _http.HttpLocation(root, opts);
        default:
            throw new TypeError(`Unrecognized "${root.protocol}" snap location protocol.`);
    }
}

//# sourceMappingURL=location.js.map