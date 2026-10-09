import {afterEach, beforeEach, describe, it, jest} from "@jest/globals";

import {iso6392T} from "renderer/dataStructure/iso6392.js";

afterEach(() => {
    jest.clearAllMocks();
});

describe('iso6392T', () => {
    describe('valid ISO 639-2T codes', () => {
        it.each([
            'eng',
            'fra',
            'deu',
            'spa',
            'ita',
        ])('returns the input for valid code "%s"', (code) => {
            expect(iso6392T(code)).toBe(code);
        });

        it('accepts a code that exists in iso6392T', () => {
            expect(iso6392T('eng')).toBe('eng');
        });

        it('accepts an iso6392B code when iso6392T is undefined', () => {
            // Example: a language whose terminology code is unavailable
            // and whose bibliographic code is used as a fallback.
            expect(iso6392T('bod')).toBe('bod');
        });
    });

    describe('invalid ISO code formats', () => {
        it.each([
            '',
            'en',
            'engl',
            'ENG',
            '123',
            'en1',
            ' eng',
            'eng ',
            'eng\n',
        ])('throws an error for invalid input "%s"', (input) => {
            expect(() => iso6392T(input)).toThrow(
                new Error(`Invalid ISO 639-2T code: "${input}"`),
            );
        });
    });

    describe('unknown ISO 639-2T codes', () => {
        it.each([
            'qaa',
            'zzz',
            'abc',
        ])('throws an error for unknown code "%s"', (input) => {
            expect(() => iso6392T(input)).toThrow(
                new Error(`Unknown ISO 639-2T code: "${input}"`),
            );
        });
    });
});