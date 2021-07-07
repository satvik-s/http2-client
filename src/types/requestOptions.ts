import { Method } from './method';
import { BufferPayload, JsonPayload, StringPayload } from './payloads';
import { Scheme } from './scheme';

export interface Http2RequestOptions {
    activeTimeout: number;
    authority: string;
    body: BufferPayload | JsonPayload | StringPayload;
    headers: Record<string, string>;
    inactiveTimeout: number;
    method: Method;
    path: string;
    queryParams: Record<string, string>;
    scheme: Scheme;
}
