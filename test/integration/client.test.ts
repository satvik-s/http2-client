import { Http2Client } from '../../src';

describe('client', () => {
    let client: Http2Client;

    beforeAll(() => {
        client = new Http2Client('https://http2.pro');
    });

    afterAll(() => {
        client.close();
    });

    test('receive JSON response for http2 request', async () => {
        const resp = await client.request({ method: 'GET', scheme: 'https', path: '/api/v1' });

        expect(resp.body).toEqual({ http2: 1, protocol: 'HTTP/2.0', push: 1, user_agent: '' });
        expect(Object.keys(resp.headers)).not.toContain(':status');
    });
});
