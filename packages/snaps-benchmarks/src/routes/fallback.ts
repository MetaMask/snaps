import { Request, Response } from 'express';

/**
 * Respond with a 405 Method Not Allowed error.
 *
 * @param _request - The request object.
 * @param response - The response object.
 */
export function methodNotAllowed(_request: Request, response: Response) {
  response.status(405);
  response.json({
    error: 'Method not allowed',
  });
}
