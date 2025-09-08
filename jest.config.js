/** @type {import('ts-jest').JestConfigWithTsJest} */
import { createRequire } from 'module';
import { pathsToModuleNameMapper } from 'ts-jest';

const require = createRequire(import.meta.url);
const baseTsconfig = require('./tsconfig.json');

const compilerOptions = (baseTsconfig && baseTsconfig.compilerOptions) || {};
const hasPaths = compilerOptions.paths && Object.keys(compilerOptions.paths).length > 0;

const moduleNameMapper = hasPaths
    ? pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>/' })
    : {
        '^src/(.*)$': '<rootDir>/src/$1',
        '^__mocks__/(.*)$': '<rootDir>/tests/__mocks__/$1',
    };

export default {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleFileExtensions: ['js', 'ts', 'd.ts'],
    moduleNameMapper,
    modulePaths: ['<rootDir>'],

    // Treat TS as ESM since "type": "module" is set in package.json
    extensionsToTreatAsEsm: ['.ts'],
    globals: {
        'ts-jest': {
            tsconfig: './tsconfig.test.json',
            useESM: true,
        },
    },
};