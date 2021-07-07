export interface Http2Response {
    body: unknown;
    headers: Record<string, string>;
    statusCode: number;
}
