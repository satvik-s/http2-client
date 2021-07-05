import { Method } from './method';
import { BufferPayload, JsonPayload, StringPayload } from './payloads';
import { Scheme } from './scheme';

export interface Http2RequestOptions {
    authority: string;
    method: Method;
    path: string;
    payload: BufferPayload | JsonPayload | StringPayload;
    scheme: Scheme;
}
