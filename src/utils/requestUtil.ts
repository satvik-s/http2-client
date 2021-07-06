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
