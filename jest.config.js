module.exports = {
    clearMocks: true,
    collectCoverageFrom: ['src/**/*.ts'],
    coverageReporters: ['cobertura', 'html', 'text-summary', 'text'],
    globalSetup: '<rootDir>/test/setup/serverStart.ts',
    globalTeardown: '<rootDir>/test/setup/serverStop.ts',
    preset: 'ts-jest',
    testEnvironment: 'node',
    testPathIgnorePatterns: ['<rootDir>/dist/'],
};
