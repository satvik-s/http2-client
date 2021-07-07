import { PayloadType } from '../types/payloadType';

export function getResponsePayloadType(contentTypeHeader: string): PayloadType | undefined {
    const trimmedHeaderType = contentTypeHeader.split(';')[0];
    switch (trimmedHeaderType) {
        case 'application/json':
        case 'multipart/form-data':
            return PayloadType.JSON;
        case 'text/html':
        case 'text/plain':
            return PayloadType.STRING;
        default:
            return PayloadType.BUFFER;
    }
}
