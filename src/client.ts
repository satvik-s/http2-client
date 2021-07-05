import {
    ClientHttp2Session,
    ClientSessionOptions,
    ClientSessionRequestOptions,
    connect,
    SecureClientSessionOptions,
} from 'http2';
import { Http2RequestOptions } from './types/requestOptions';
import { constants } from 'http2';
import { Http2Response } from './types/response';
import { Http2ResponseType } from './types/responseType';

const {
    HTTP2_HEADER_METHOD,
    HTTP2_HEADER_PATH,
    HTTP2_HEADER_SCHEME,
    HTTP2_HEADER_STATUS,
    HTTP_STATUS_INTERNAL_SERVER_ERROR,
    HTTP2_HEADER_CONTENT_TYPE,
} = constants;

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
        requestOptions: Http2RequestOptions,
        nativeOptions?: ClientSessionRequestOptions,
    ): Promise<Http2Response> {
        return new Promise((resolve, reject) => {
            if (this.session.closed || this.session.destroyed) {
                this._reconnect();
            }

            let status = -1;
            let contentTypeHeader: Http2ResponseType = 'STRING';
            const responseHeaders: Record<string, string> = {};
            const data: string[] = [];
            const req = this.session.request(
                {
                    [HTTP2_HEADER_METHOD]: requestOptions.method,
                    [HTTP2_HEADER_PATH]: requestOptions.path,
                    [HTTP2_HEADER_SCHEME]: requestOptions.scheme,
                },
                nativeOptions,
            );

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
                                contentTypeHeader = 'JSON';
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

    private _getResponseBody(data: unknown[], responseType: Http2ResponseType) {
        switch (responseType) {
            case 'JSON':
                return JSON.parse(data.join());
            case 'STRING':
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
