export function timestampIsInPast(timestamp: number): boolean {
    return timestamp < Date.now();
}
