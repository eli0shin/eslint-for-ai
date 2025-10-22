import { RuleTester } from '@typescript-eslint/rule-tester';
import rule from './no-constant-assertion.js';

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      projectService: {
        allowDefaultProject: ['*.ts'],
      },
    },
  },
});

ruleTester.run('no-constant-assertion', rule, {
  valid: [
    // Function parameters are dynamic
    {
      code: `
        function myTest(value) {
          expect(value).toBe(true);
        }
      `,
    },
    // Function call results are dynamic
    {
      code: `
        test('returns correct value', () => {
          expect(getValue()).toBe(5);
        });
      `,
    },
    // Method call results are dynamic
    {
      code: `
        test('calls method', () => {
          expect(obj.method()).toEqual('test');
        });
      `,
    },
    // Variables from function calls are dynamic
    {
      code: `
        test('computes result', () => {
          const result = compute();
          expect(result).toBe(5);
        });
      `,
    },
    // Dynamic member access
    {
      code: `
        test('gets property', () => {
          const obj = getObject();
          expect(obj.prop).toBe(5);
        });
      `,
    },
    // Arrow function results are dynamic
    {
      code: `
        test('arrow function', () => {
          const fn = () => true;
          expect(fn()).toBe(true);
        });
      `,
    },
  ],
  invalid: [
    // Direct literal
    {
      code: `
        test('literal test', () => {
          expect(true).toBe(true);
        });
      `,
      errors: [
        {
          messageId: 'constantAssertion',
        },
      ],
    },
    // Number literal
    {
      code: `
        test('number literal', () => {
          expect(5).toEqual(5);
        });
      `,
      errors: [
        {
          messageId: 'constantAssertion',
        },
      ],
    },
    // String literal
    {
      code: `
        test('string literal', () => {
          expect('hello').toBe('world');
        });
      `,
      errors: [
        {
          messageId: 'constantAssertion',
        },
      ],
    },
    // Variable assigned to literal
    {
      code: `
        test('variable literal', () => {
          const x = true;
          expect(x).toBe(true);
        });
      `,
      errors: [
        {
          messageId: 'constantAssertion',
        },
      ],
    },
    // Null literal
    {
      code: `
        test('null literal', () => {
          const value = null;
          expect(value).toBeNull();
        });
      `,
      errors: [
        {
          messageId: 'constantAssertion',
        },
      ],
    },
    // Undefined literal
    {
      code: `
        test('undefined literal', () => {
          const value = undefined;
          expect(value).toBeUndefined();
        });
      `,
      errors: [
        {
          messageId: 'constantAssertion',
        },
      ],
    },
    // Object destructuring
    {
      code: `
        test('object destructuring', () => {
          const { prop } = { prop: 5 };
          expect(prop).toBe(5);
        });
      `,
      errors: [
        {
          messageId: 'constantAssertion',
        },
      ],
    },
    // Array destructuring
    {
      code: `
        test('array destructuring', () => {
          const [first] = [1, 2];
          expect(first).toBe(1);
        });
      `,
      errors: [
        {
          messageId: 'constantAssertion',
        },
      ],
    },
    // Property access on constant object
    {
      code: `
        test('property access', () => {
          const obj = { x: 5 };
          expect(obj.x).toBe(5);
        });
      `,
      errors: [
        {
          messageId: 'constantAssertion',
        },
      ],
    },
    // Nested property access
    {
      code: `
        test('nested property', () => {
          const data = { user: { id: 1 } };
          expect(data.user.id).toBe(1);
        });
      `,
      errors: [
        {
          messageId: 'constantAssertion',
        },
      ],
    },
    // Empty array
    {
      code: `
        test('empty array', () => {
          const arr = [];
          expect(arr).toEqual([]);
        });
      `,
      errors: [
        {
          messageId: 'constantAssertion',
        },
      ],
    },
    // Empty object
    {
      code: `
        test('empty object', () => {
          const obj = {};
          expect(obj).toEqual({});
        });
      `,
      errors: [
        {
          messageId: 'constantAssertion',
        },
      ],
    },
  ],
});
