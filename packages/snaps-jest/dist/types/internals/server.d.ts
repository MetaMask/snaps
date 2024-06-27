/// <reference types="node" />
import type { Server } from 'http';
import type { SnapsEnvironmentOptions } from '../options';
export declare type ServerOptions = Required<Required<SnapsEnvironmentOptions>['server']>;
/**
 * Start an HTTP server on `localhost` with a random port. This is used to serve
 * the static files for the environment.
 *
 * @param options - The options to use.
 * @param options.port - The port to use for the server.
 * @param options.root - The root directory to serve from the server.
 * @returns The HTTP server.
 */
export declare function startServer(options: ServerOptions): Promise<Server<typeof import("http").IncomingMessage, typeof import("http").ServerResponse>>;
