import { PayloadType } from '../types/payloadType';

export function convertQueryParamsToUrl(params?: Record<string, string>): string {
    if (params) {
        return (
            '?' +
            Object.keys(params)
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key]!)}`)
                .join('&')
        );
    }
    return '';
}

export function getContentTypeHeader(payloadType?: PayloadType): string {
    switch (payloadType) {
        case PayloadType.JSON:
            return 'application/json';
        default:
            return 'text/plain';
    }
}
