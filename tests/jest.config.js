/** @type {import('ts-jest').JestConfigWithTsJest} */

import  tsconfig  from './tsconfig.json' with {type:"json"};
import {pathsToModuleNameMapper} from "ts-jest";
const moduleNameMapper = pathsToModuleNameMapper(tsconfig.compilerOptions.paths, { prefix: '<rootDir>/' });

export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: ['js', 'ts','d.ts'],
  moduleNameMapper,
  modulePaths: ['<rootDir>','<rootDir>../public_html/js']
};