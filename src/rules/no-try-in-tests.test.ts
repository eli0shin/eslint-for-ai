import { RuleTester } from '@typescript-eslint/rule-tester';
import rule from './no-try-in-tests.js';

const ruleTester = new RuleTester();

ruleTester.run('no-try-in-tests', rule, {
  valid: [
    // Try in regular function (not a test)
    {
      code: `
        function fetchData() {
          try {
            return fetch(url);
          } catch (e) {
            throw e;
          }
        }
      `,
    },
    // Try in helper function defined outside test
    {
      code: `
        function helper() {
          try {
            doSomething();
          } catch (e) {
            console.error(e);
          }
        }

        test('uses helper', () => {
          helper();
          expect(result).toBe(true);
        });
      `,
    },
    // Test without try
    {
      code: `
        test('simple test', () => {
          const result = add(1, 2);
          expect(result).toBe(3);
        });
      `,
    },
    // it() without try
    {
      code: `
        it('should work', () => {
          expect(calculate(5)).toBe(10);
        });
      `,
    },
    // Try in beforeEach hook (allowed)
    {
      code: `
        beforeEach(() => {
          try {
            setup();
          } catch (e) {
            // setup failed
          }
        });

        test('runs after setup', () => {
          expect(ready).toBe(true);
        });
      `,
    },
    // Try in afterEach hook (allowed)
    {
      code: `
        afterEach(() => {
          try {
            cleanup();
          } catch (e) {
            // cleanup failed
          }
        });

        test('test', () => {
          expect(1).toBe(1);
        });
      `,
    },
    // describe block with try outside test
    {
      code: `
        describe('suite', () => {
          function setup() {
            try {
              init();
            } catch (e) {}
          }

          test('test', () => {
            setup();
            expect(1).toBe(1);
          });
        });
      `,
    },
  ],
  invalid: [
    // Direct try in test()
    {
      code: `
        test('handles error', () => {
          try {
            riskyOperation();
          } catch (e) {
            // swallow
          }
          expect(true).toBe(true);
        });
      `,
      errors: [{ messageId: 'tryInTest' }],
    },
    // Direct try in it()
    {
      code: `
        it('catches error', () => {
          try {
            something();
          } catch (e) {
            expect(e).toBeDefined();
          }
        });
      `,
      errors: [{ messageId: 'tryInTest' }],
    },
    // Nested try inside conditional in test
    {
      code: `
        test('nested', () => {
          if (condition) {
            try {
              doThing();
            } catch (e) {}
          }
        });
      `,
      errors: [{ messageId: 'tryInTest' }],
    },
    // Try-finally in test
    {
      code: `
        test('with finally', () => {
          try {
            setup();
          } finally {
            cleanup();
          }
        });
      `,
      errors: [{ messageId: 'tryInTest' }],
    },
    // Try-catch-finally in test
    {
      code: `
        test('full try', () => {
          try {
            something();
          } catch (e) {
            handle(e);
          } finally {
            cleanup();
          }
        });
      `,
      errors: [{ messageId: 'tryInTest' }],
    },
    // Multiple try blocks in test
    {
      code: `
        test('multiple tries', () => {
          try {
            first();
          } catch (e) {}
          try {
            second();
          } catch (e) {}
        });
      `,
      errors: [{ messageId: 'tryInTest' }, { messageId: 'tryInTest' }],
    },
    // Async test with try
    {
      code: `
        test('async test', async () => {
          try {
            await fetchData();
          } catch (e) {
            // handle
          }
        });
      `,
      errors: [{ messageId: 'tryInTest' }],
    },
    // Try inside arrow function inside test (nested function in test)
    {
      code: `
        test('nested function', () => {
          const fn = () => {
            try {
              doSomething();
            } catch (e) {}
          };
          fn();
        });
      `,
      errors: [{ messageId: 'tryInTest' }],
    },
    // Try inside function expression inside test
    {
      code: `
        test('nested function expression', () => {
          const fn = function() {
            try {
              doSomething();
            } catch (e) {}
          };
          fn();
        });
      `,
      errors: [{ messageId: 'tryInTest' }],
    },
  ],
});
