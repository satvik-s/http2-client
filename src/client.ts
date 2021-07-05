import {
    ClientHttp2Session,
    ClientSessionOptions,
    ClientSessionRequestOptions,
    connect,
    constants,
    OutgoingHttpHeaders,
    SecureClientSessionOptions,
} from 'http2';
import { Http2RequestOptions } from './types/requestOptions';
import { Http2Response } from './types/response';
import { PayloadType } from './types/payloadType';

const {
    HTTP_STATUS_INTERNAL_SERVER_ERROR,
    HTTP2_HEADER_AUTHORITY,
    HTTP2_HEADER_CONTENT_TYPE,
    HTTP2_HEADER_METHOD,
    HTTP2_HEADER_PATH,
    HTTP2_HEADER_SCHEME,
    HTTP2_HEADER_STATUS,
} = constants;

const HTTP2_METHOD_WITH_PAYLOAD = ['POST', 'PUT'];

export class Http2Client {
    session: ClientHttp2Session;

    constructor(
        private readonly url: string,
        private readonly options?: ClientSessionOptions | SecureClientSessionOptions,
    ) {
        this.session = connect(url, options);
    }

    close(): void {
        this.session.close();
    }

    async request(
        requestOptions: Partial<Http2RequestOptions>,
        nativeOptions?: ClientSessionRequestOptions,
    ): Promise<Http2Response> {
        return new Promise((resolve, reject) => {
            if (this.session.closed || this.session.destroyed) {
                this._reconnect();
            }

            let status = -1;
            let contentTypeHeader: PayloadType = PayloadType.STRING;
            const responseHeaders: Record<string, string> = {};
            const data: string[] = [];
            const requestBody = this._getRequestBody(requestOptions);
            const requestHeaders = {
                ...this._getRequestHeaders(requestOptions),
                ...(requestBody && { 'Content-Length': requestBody.length }),
                ...requestOptions.headers,
            };
            const req = this.session.request(requestHeaders, nativeOptions);

            req.setEncoding('utf8');

            req.on('response', (headers) => {
                if (headers[':status']) {
                    status = headers[':status'];
                }
                for (const name in headers) {
                    if (headers[name] && name !== HTTP2_HEADER_STATUS) {
                        const header = headers[name]?.toString();
                        if (header) {
                            responseHeaders[name] = header;
                            if (name === HTTP2_HEADER_CONTENT_TYPE && header.includes('json')) {
                                contentTypeHeader = PayloadType.JSON;
                            }
                        }
                    }
                }
            });

            req.on('data', (chunk) => {
                data.push(chunk);
            });

            req.on('end', () => {
                req.end();
                resolve({
                    body: this._getResponseBody(data, contentTypeHeader),
                    headers: responseHeaders,
                    statusCode: this._getResponseStatus(status),
                });
            });

            req.on('error', (err) => {
                req.end();
                reject(err);
            });
        });
    }

    private _getRequestBody(requestOptions: Partial<Http2RequestOptions>): Buffer | undefined {
        if (requestOptions.method && HTTP2_METHOD_WITH_PAYLOAD.includes(requestOptions.method)) {
            const requestBody = requestOptions.body;
            if (requestBody) {
                switch (requestBody.type) {
                    case PayloadType.BUFFER:
                        return requestBody.data;
                    case PayloadType.JSON:
                        return Buffer.from(JSON.stringify(requestBody.data));
                    case PayloadType.STRING:
                        return Buffer.from(requestBody.data);
                }
            }
        }
        return;
    }

    private _getRequestHeaders(options: Partial<Http2RequestOptions>): OutgoingHttpHeaders {
        if (options.method === 'OPTIONS') {
            return {
                ...(options.authority && {
                    [HTTP2_HEADER_AUTHORITY]: options.authority,
                }),
                [HTTP2_HEADER_METHOD]: 'OPTIONS',
                ...(options.scheme && {
                    [HTTP2_HEADER_SCHEME]: options.scheme,
                }),
                ...(options.body?.type === PayloadType.JSON
                    ? { 'Content-Type': 'application/json' }
                    : { 'Content-Type': 'text/plain' }),
            };
        } else {
            return {
                ...(options.authority && {
                    [HTTP2_HEADER_AUTHORITY]: options.authority,
                }),
                [HTTP2_HEADER_METHOD]: options.method || 'GET',
                [HTTP2_HEADER_PATH]: options.path || '/',
                [HTTP2_HEADER_SCHEME]: options.scheme || 'https',
                ...(options.body?.type === PayloadType.JSON
                    ? { 'Content-Type': 'application/json' }
                    : { 'Content-Type': 'text/plain' }),
            };
        }
    }

    private _getResponseBody(data: unknown[], responseType: PayloadType) {
        switch (responseType) {
            case PayloadType.BUFFER:
                return data.join().toString();
            case PayloadType.JSON:
                return JSON.parse(data.join());
            case PayloadType.STRING:
            default:
                return data.join();
        }
    }

    private _getResponseStatus(status: number): number {
        return status === -1 ? HTTP_STATUS_INTERNAL_SERVER_ERROR : status;
    }

    private _reconnect(): void {
        this.session = connect(this.url, this.options);
    }
}
