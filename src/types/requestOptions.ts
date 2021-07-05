import { Method } from './method';
import { BufferPayload, JsonPayload, StringPayload } from './payloads';
import { Scheme } from './scheme';

export interface Http2RequestOptions {
    authority: string;
    headers: Record<string, string>;
    method: Method;
    path: string;
    body: BufferPayload | JsonPayload | StringPayload;
    scheme: Scheme;
    queryParams: Record<string, string>;
}
