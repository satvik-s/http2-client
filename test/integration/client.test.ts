import { Http2Client } from '../../src';

describe('client', () => {
    let http2GoClient: Http2Client;
    let http2ProClient: Http2Client;

    beforeAll(() => {
        http2GoClient = new Http2Client('https://http2.golang.org');
        http2ProClient = new Http2Client('https://http2.pro');
    });

    afterAll(() => {
        http2GoClient.close();
        http2ProClient.close();
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
});
