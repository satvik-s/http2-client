<div>
  <br />
    <img width="300" src="https://github.com/satvik-s/http2-client/blob/develop/docs/images/http2-client.png?raw=true">
  <p />
</div>

# http2-client

[![npm](https://img.shields.io/npm/v/@satvik-s/http2-client)](https://www.npmjs.com/package/@satvik-s/http2-client)
[![David](https://img.shields.io/david/satvik-s/http2-client)](https://www.npmjs.com/package/@satvik-s/http2-client)
[![node-current](https://img.shields.io/node/v/@satvik-s/http2-client)](https://www.npmjs.com/package/@satvik-s/http2-client)
[![Snyk Vulnerabilities](https://img.shields.io/snyk/vulnerabilities/github/satvik-s/http2-client)](https://www.npmjs.com/package/@satvik-s/http2-client)
[![GitHub](https://img.shields.io/github/license/satvik-s/http2-client)](https://github.com/satvik-s/http2-client)

_An opinionated HTTP/2 wrapper around native NodeJS module_

__http2-client__ provides a simple and accessible interface to make HTTP/2 requests to servers.

## How it works

The `Http2Client` class provides ability to the user to create instances of an HTTP/2 client which
can then be leveraged to call single/multiple APIs, single/multiple times over its lifetime.

## Examples

### GET Request

```typescript
import { Http2Client } from '@satvik-s/http2-client';

const client = new Http2Client('https://test-service.com');
const resp = await client.request({
    method: 'GET',
    scheme: 'https',
    path: '/v1/test-api',
});

console.log('status', resp.statusCode);
console.log('body', resp.body);
console.log('headers', resp.headers);
```

### POST Request

```typescript
import { Http2Client, PayloadType } from '@satvik-s/http2-client';

const client = new Http2Client('https://test-service.com');
const resp = await client.request({
    method: 'POST',
    scheme: 'https',
    path: '/v1/test-api',
    body: {
        type: PayloadType.JSON,
        data: {
            hello: 'world',
        }
    },
});

console.log('status', resp.statusCode);
console.log('body', resp.body);
console.log('headers', resp.headers);
```

## Contributing

Contributions are welcome! Read `CONTRIBUTING.md` for more details.
