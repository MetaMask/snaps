"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logServerError = exports.logRequest = exports.logServerListening = void 0;
const utils_1 = require("../../utils");
/**
 * Log a message with the URL and port of the server.
 *
 * @param port - The port that the server is running on.
 */
function logServerListening(port) {
    console.log(`Server listening on: http://localhost:${port}`);
}
exports.logServerListening = logServerListening;
/**
 * Log a message with the request URL.
 *
 * @param request - The request object.
 * @param request.url - The URL of the request.
 */
function logRequest(request) {
    console.log(`Handling incoming request for: ${request.url}`);
}
exports.logRequest = logRequest;
/**
 * Log an error message.
 *
 * @param error - The error to log.
 * @param port - The port that the server is running on.
 */
function logServerError(error, port) {
    if (error.code === 'EADDRINUSE') {
        (0, utils_1.logError)(`Server error: Port ${port} already in use.`);
    }
    else {
        (0, utils_1.logError)(`Server error: ${error.message}`, error);
    }
}
exports.logServerError = logServerError;
//# sourceMappingURL=serveUtils.js.map