import { PayloadType } from './payloadType';

export type BufferPayload = {
    type: PayloadType.BUFFER;
    data: Buffer;
};

export type JsonPayload = {
    type: PayloadType.JSON;
    data: Record<string, unknown>;
};

export type StringPayload = {
    type: PayloadType.STRING;
    data: string;
};
