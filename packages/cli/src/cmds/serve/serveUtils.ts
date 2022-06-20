import { logError } from '../../utils';

/**
 * Log a message with the URL and port of the server.
 *
 * @param port - The port that the server is running on.
 */
export function logServerListening(port: number) {
  console.log(`Server listening on: http://localhost:${port}`);
}

/**
 * Log a message with the request URL.
 *
 * @param request - The request object.
 * @param request.url - The URL of the request.
 */
export function logRequest(request: { url: string }) {
  console.log(`Handling incoming request for: ${request.url}`);
}

/**
 * Log an error message.
 *
 * @param error - The error to log.
 * @param port - The port that the server is running on.
 */
export function logServerError(error: Error, port: number) {
  if ((error as any).code === 'EADDRINUSE') {
    logError(`Server error: Port ${port} already in use.`);
  } else {
    logError(`Server error: ${error.message}`, error);
  }
}
