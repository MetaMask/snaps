import { logError } from '../../utils';

export function logServerListening(port: number) {
  console.log(`Server listening on: http://localhost:${port}`);
}

export function logRequest(request: { url: string }) {
  console.log(`Handling incoming request for: ${request.url}`);
}

export function logServerError(error: Error, port: number) {
  if ((error as any).code === 'EADDRINUSE') {
    logError(`Server error: Port ${port} already in use.`);
  } else {
    logError(`Server error: ${error.message}`, error);
  }
}
