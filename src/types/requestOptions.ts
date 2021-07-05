import { Method } from './method';
import { Scheme } from './scheme';

export interface Http2RequestOptions {
    method: Method;
    path: string;
    scheme: Scheme;
}
