import { fastify, FastifyInstance, FastifyLoggerInstance } from 'fastify';
import { Http2Server, Http2ServerRequest, Http2ServerResponse } from 'http2';

let server: FastifyInstance<
    Http2Server,
    Http2ServerRequest,
    Http2ServerResponse,
    FastifyLoggerInstance
>;

export function getServer(): FastifyInstance<
    Http2Server,
    Http2ServerRequest,
    Http2ServerResponse,
    FastifyLoggerInstance
> {
    return server;
}

export function initServer(): void {
    server = fastify({ http2: true, logger: true });

    server.get('/', function (_request, reply) {
        reply.code(200).send('hello world');
    });

    server.get('/ping', function (_request, reply) {
        reply.code(200).send('pong');
    });
}
