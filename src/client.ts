import {
    ClientHttp2Session,
    ClientSessionOptions,
    ClientSessionRequestOptions,
    connect,
    constants,
    OutgoingHttpHeaders,
    SecureClientSessionOptions,
} from 'http2';
import { PayloadType } from './types/payloadType';
import { Http2RequestOptions } from './types/requestOptions';
import { Http2Response } from './types/response';
import { convertQueryParamsToUrl, getContentTypeHeader } from './utils/requestUtil';
import { getResponsePayloadType } from './utils/responseUtil';
import { timestampIsInPast } from './utils/timeUtil';

const {
    HTTP_STATUS_INTERNAL_SERVER_ERROR,
    HTTP2_HEADER_AUTHORITY,
    HTTP2_HEADER_CONTENT_TYPE,
    HTTP2_HEADER_METHOD,
    HTTP2_HEADER_PATH,
    HTTP2_HEADER_SCHEME,
    HTTP2_HEADER_STATUS,
    NGHTTP2_CANCEL,
} = constants;

const HTTP2_METHODS_WITH_PAYLOAD = ['POST', 'PUT'];

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
            let responsePayloadType: PayloadType | undefined;
            const requestStartMilliSeconds = Date.now();
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
            req.setTimeout(requestOptions.inactiveTimeout || 2000, () => req.close(NGHTTP2_CANCEL));
            if (requestBody) {
                req.write(requestBody);
            }

            req.on('aborted', () => {
                console.log('stream aborted');
            });

            req.on('close', () => {
                resolve({
                    body: this._getResponseBody(data, responsePayloadType),
                    headers: responseHeaders,
                    statusCode: this._getResponseStatus(status),
                });
            });

            req.on('data', (chunk) => {
                if (
                    requestOptions.activeTimeout &&
                    timestampIsInPast(requestStartMilliSeconds + requestOptions.activeTimeout)
                ) {
                    req.close();
                }
                data.push(chunk);
            });

            req.on('error', (err) => {
                console.log('error');
                console.log({
                    name: err.name,
                    message: err.message,
                });
                reject(err);
            });

            req.on('frameError', (errorType, code, id) => {
                console.log('frame error');
                console.log({
                    errorType,
                    code,
                    id,
                });
                reject({ errorType, code, id });
            });

            req.on('response', (headers) => {
                if (headers[':status']) {
                    status = headers[':status'];
                }
                for (const name in headers) {
                    if (headers[name] && name !== HTTP2_HEADER_STATUS) {
                        const header = headers[name]?.toString();
                        if (header) {
                            responseHeaders[name] = header;
                            if (name === HTTP2_HEADER_CONTENT_TYPE) {
                                responsePayloadType = getResponsePayloadType(header);
                            }
                        }
                    }
                }
            });

            req.on('timeout', () => {
                console.log('stream timed out');
            });
        });
    }

    private _getRequestBody(requestOptions: Partial<Http2RequestOptions>): Buffer | undefined {
        if (requestOptions.method && HTTP2_METHODS_WITH_PAYLOAD.includes(requestOptions.method)) {
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
                'Content-Type': getContentTypeHeader(options.body?.type),
            };
        } else {
            return {
                ...(options.authority && {
                    [HTTP2_HEADER_AUTHORITY]: options.authority,
                }),
                [HTTP2_HEADER_METHOD]: options.method || 'GET',
                [HTTP2_HEADER_PATH]:
                    (options.path || '/') + convertQueryParamsToUrl(options.queryParams),
                [HTTP2_HEADER_SCHEME]: options.scheme || 'https',
                'Content-Type': getContentTypeHeader(options.body?.type),
            };
        }
    }

    private _getResponseBody(data: unknown[], responseType?: PayloadType) {
        switch (responseType) {
            case PayloadType.BUFFER:
                return data.join().toString();
            case PayloadType.JSON:
                return data.length === 0 ? {} : JSON.parse(data.join());
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
