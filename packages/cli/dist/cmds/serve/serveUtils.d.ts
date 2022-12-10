/**
 * Log a message with the URL and port of the server.
 *
 * @param port - The port that the server is running on.
 */
export declare function logServerListening(port: number): void;
/**
 * Log a message with the request URL.
 *
 * @param request - The request object.
 * @param request.url - The URL of the request.
 */
export declare function logRequest(request: {
    url: string;
}): void;
/**
 * Log an error message.
 *
 * @param error - The error to log.
 * @param port - The port that the server is running on.
 */
export declare function logServerError(error: Error, port: number): void;
