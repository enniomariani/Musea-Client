/** @type {import('ts-jest').JestConfigWithTsJest} */

// Prefer reading from the base config that contains "paths"
import baseTsconfig from './tsconfig.json' with { type: 'json' };
import { pathsToModuleNameMapper } from 'ts-jest';

// Safely build moduleNameMapper only if paths are defined
const compilerOptions = (baseTsconfig && baseTsconfig.compilerOptions) || {};
const hasPaths = compilerOptions.paths && Object.keys(compilerOptions.paths).length > 0;

const moduleNameMapper = hasPaths
    ? pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>/' })
    : {
        // Fallback if you use an alias like @app/* -> src/*
        '^@app/(.*)$': '<rootDir>/src/$1',
    };

export default {
    preset: 'ts-jest',
    testEnvironment: 'node', // or 'jsdom' if you need DOM
    moduleFileExtensions: ['js', 'ts', 'd.ts'],
    moduleNameMapper,
    // Remove the odd '../src' entry; Jest resolves from <rootDir> already
    modulePaths: ['<rootDir>'],

    // Optional: tell ts-jest which tsconfig to use for tests
    globals: {
        'ts-jest': {
            tsconfig: './tsconfig.json',
        },
    },
};