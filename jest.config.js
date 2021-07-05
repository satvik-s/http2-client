module.exports = {
    clearMocks: true,
    collectCoverageFrom: ['src/**/*.ts'],
    coverageReporters: ['cobertura', 'html', 'text-summary', 'text'],
    preset: 'ts-jest',
    testEnvironment: 'node',
    testPathIgnorePatterns: ['<rootDir>/dist/'],
};
