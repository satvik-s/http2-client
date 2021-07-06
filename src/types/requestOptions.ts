import { Method } from './method';
import { BufferPayload, JsonPayload, StringPayload } from './payloads';
import { Scheme } from './scheme';

export interface Http2RequestOptions {
    authority: string;
    body: BufferPayload | JsonPayload | StringPayload;
    headers: Record<string, string>;
    method: Method;
    path: string;
    queryParams: Record<string, string>;
    scheme: Scheme;
    timeout: number;
}
