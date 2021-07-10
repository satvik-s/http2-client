import { Http2Client } from '../../src';

describe('client', () => {
    let http2GoClient: Http2Client;
    let http2LocalhostClient: Http2Client;
    let http2ProClient: Http2Client;
    jest.setTimeout(20000);

    beforeAll(() => {
        http2GoClient = new Http2Client('https://http2.golang.org');
        http2LocalhostClient = new Http2Client('http://localhost:3001');
        http2ProClient = new Http2Client('https://http2.pro');
    });

    afterAll(() => {
        http2GoClient.close();
        http2LocalhostClient.close();
        http2ProClient.close();
    });

    test('receive JSON response for local http2 request', async () => {
        const resp = await http2LocalhostClient.request({
            method: 'GET',
            scheme: 'http',
            path: '/ping',
        });

        expect(resp.statusCode).toEqual(200);
        expect(resp.body).toEqual('pong');
    });

    test('receive JSON response for http2 request', async () => {
        const resp = await http2ProClient.request({
            method: 'GET',
            scheme: 'https',
            path: '/api/v1',
        });

        expect(resp.statusCode).toEqual(200);
        expect(resp.body).toEqual({ http2: 1, protocol: 'HTTP/2.0', push: 1, user_agent: '' });
        expect(Object.keys(resp.headers)).not.toContain(':status');
    });

    test('receive request info for http2 request', async () => {
        const resp = await http2GoClient.request({
            path: '/reqinfo',
        });

        expect(resp.statusCode).toEqual(200);
        expect(resp.body).toContain('Protocol: HTTP/2.0');
    });

    test('receive time stream for http2 request and exit w/ timeout', async () => {
        const resp = await http2GoClient.request({
            path: '/clockstream',
            activeTimeout: 1000,
        });

        expect(resp.statusCode).toEqual(200);
    });

    test('receive request string payload back', async () => {
        const resp = await http2GoClient.request({
            body: {
                type: 'STRING' as any,
                data: 'test-string',
            },
            method: 'PUT',
            path: '/ECHO',
        });

        expect(resp.statusCode).toEqual(200);
        expect(resp.body).toEqual('TEST-STRING');
    });

    test('receive request json payload back', async () => {
        const resp = await http2GoClient.request({
            body: {
                type: 'JSON' as any,
                data: {
                    key: 'value',
                },
            },
            method: 'PUT',
            path: '/ECHO',
        });

        expect(resp.statusCode).toEqual(200);
        expect(resp.body).toEqual(JSON.stringify({ KEY: 'VALUE' }));
    });

    test('receive image file stream for http2 request', async () => {
        const resp = await http2GoClient.request({
            path: '/file/gopher.png',
        });

        expect(resp.statusCode).toEqual(200);
    });

    test('receive large zip file stream for http2 request', async () => {
        const resp = await http2GoClient.request({
            path: '/file/go.src.tar.gz',
        });

        expect(resp.statusCode).toEqual(200);
    });
});
