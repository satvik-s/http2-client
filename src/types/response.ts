export interface Http2Response {
    body: Buffer | Record<string, unknown> | string;
    headers: Record<string, string>;
    statusCode: number;
}
