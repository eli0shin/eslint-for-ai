import { RuleTester } from '@typescript-eslint/rule-tester';
import rule from './no-conditional-expect.js';

const ruleTester = new RuleTester();

ruleTester.run('no-conditional-expect', rule, {
  valid: [
    // Direct expect in test
    {
      code: `
        test('simple assertion', () => {
          expect(result).toBe(true);
        });
      `,
    },
    // Multiple direct expects
    {
      code: `
        test('multiple assertions', () => {
          expect(a).toBe(1);
          expect(b).toBe(2);
          expect(c).toBe(3);
        });
      `,
    },
    // Conditional logic without expect inside
    {
      code: `
        test('conditional setup', () => {
          const value = condition ? 'a' : 'b';
          expect(value).toBe('a');
        });
      `,
    },
    // expect in beforeEach (not a test)
    {
      code: `
        beforeEach(() => {
          if (condition) {
            expect(ready).toBe(true);
          }
        });
      `,
    },
    // expect outside of test entirely
    {
      code: `
        function helper() {
          if (condition) {
            expect(something).toBe(true);
          }
        }
      `,
    },
    // it() with direct expect
    {
      code: `
        it('should work', () => {
          expect(calculate(5)).toBe(10);
        });
      `,
    },
    // Conditional in describe but expect direct in test
    {
      code: `
        describe('suite', () => {
          const config = shouldMock ? mockConfig : realConfig;

          test('test', () => {
            expect(config.value).toBe(1);
          });
        });
      `,
    },
    // Expect with not modifier
    {
      code: `
        test('negated expect', () => {
          expect(result).not.toBe(false);
        });
      `,
    },
  ],
  invalid: [
    // expect in if statement
    {
      code: `
        test('conditional expect', () => {
          if (condition) {
            expect(result).toBe(true);
          }
        });
      `,
      errors: [{ messageId: 'conditionalExpect' }],
    },
    // expect in else branch
    {
      code: `
        test('in else', () => {
          if (condition) {
            doThing();
          } else {
            expect(result).toBe(false);
          }
        });
      `,
      errors: [{ messageId: 'conditionalExpect' }],
    },
    // expect in both if and else
    {
      code: `
        test('both branches', () => {
          if (condition) {
            expect(a).toBe(1);
          } else {
            expect(b).toBe(2);
          }
        });
      `,
      errors: [{ messageId: 'conditionalExpect' }, { messageId: 'conditionalExpect' }],
    },
    // expect in ternary consequent
    {
      code: `
        test('ternary expect', () => {
          condition ? expect(a).toBe(1) : null;
        });
      `,
      errors: [{ messageId: 'conditionalExpect' }],
    },
    // expect in ternary alternate
    {
      code: `
        test('ternary alternate', () => {
          condition ? null : expect(b).toBe(2);
        });
      `,
      errors: [{ messageId: 'conditionalExpect' }],
    },
    // expect in switch case
    {
      code: `
        test('switch expect', () => {
          switch (value) {
            case 'a':
              expect(result).toBe(1);
              break;
          }
        });
      `,
      errors: [{ messageId: 'conditionalExpect' }],
    },
    // expect in multiple switch cases
    {
      code: `
        test('multiple switch cases', () => {
          switch (value) {
            case 'a':
              expect(result).toBe(1);
              break;
            case 'b':
              expect(result).toBe(2);
              break;
          }
        });
      `,
      errors: [{ messageId: 'conditionalExpect' }, { messageId: 'conditionalExpect' }],
    },
    // expect in default case
    {
      code: `
        test('default case', () => {
          switch (value) {
            default:
              expect(result).toBe(0);
          }
        });
      `,
      errors: [{ messageId: 'conditionalExpect' }],
    },
    // Nested if
    {
      code: `
        test('nested if', () => {
          if (outer) {
            if (inner) {
              expect(result).toBe(true);
            }
          }
        });
      `,
      errors: [{ messageId: 'conditionalExpect' }],
    },
    // expect.not in conditional
    {
      code: `
        test('not in conditional', () => {
          if (condition) {
            expect(result).not.toBe(false);
          }
        });
      `,
      errors: [{ messageId: 'conditionalExpect' }],
    },
    // it() with conditional expect
    {
      code: `
        it('should conditionally assert', () => {
          if (ready) {
            expect(value).toBe(true);
          }
        });
      `,
      errors: [{ messageId: 'conditionalExpect' }],
    },
    // expect with matcher chain in conditional
    {
      code: `
        test('matcher chain', () => {
          if (condition) {
            expect(arr).toHaveLength(3);
          }
        });
      `,
      errors: [{ messageId: 'conditionalExpect' }],
    },
    // async test with conditional expect
    {
      code: `
        test('async conditional', async () => {
          if (await checkCondition()) {
            expect(result).toBe(true);
          }
        });
      `,
      errors: [{ messageId: 'conditionalExpect' }],
    },
  ],
});
