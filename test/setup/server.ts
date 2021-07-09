import fastify from 'fastify';

const server = fastify({
    http2: true,
    logger: true,
});

server.get('/ping', async (_request, _reply) => {
    return 'pong';
});

server.listen(8080, (err, address) => {
    if (err) {
        console.error(err);
        // eslint-disable-next-line no-process-exit
        process.exit(1);
    }
    console.log(`Server listening at ${address}`);
});
