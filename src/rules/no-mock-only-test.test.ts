import { RuleTester } from '@typescript-eslint/rule-tester';
import rule from './no-mock-only-test.js';

const ruleTester = new RuleTester();

ruleTester.run('no-mock-only-test', rule, {
  valid: [
    // Test with behavior assertion only
    {
      code: `
        test('returns correct value', () => {
          const result = add(1, 2);
          expect(result).toBe(3);
        });
      `,
    },
    // Test with multiple behavior assertions
    {
      code: `
        test('processes data correctly', () => {
          const result = processData('hello');
          expect(result).toBe('HELLO');
          expect(result.length).toBe(5);
        });
      `,
    },
    // Test with mock AND behavior assertion
    {
      code: `
        test('calls callback and returns value', () => {
          const mockFn = vi.fn();
          const result = processWithCallback(mockFn, 'data');
          expect(mockFn).toHaveBeenCalled();
          expect(result).toBe('processed');
        });
      `,
    },
    // Test with no assertions (not our concern)
    {
      code: `
        test('does something', () => {
          const result = doSomething();
        });
      `,
    },
    // Test with behavior assertion using toEqual
    {
      code: `
        test('returns object', () => {
          const result = getData();
          expect(result).toEqual({ name: 'test' });
        });
      `,
    },
    // Test with behavior assertion using toThrow
    {
      code: `
        test('throws error', () => {
          expect(() => dangerousFunction()).toThrow('error');
        });
      `,
    },
    // Test using it() instead of test()
    {
      code: `
        it('should work correctly', () => {
          const result = calculate(5);
          expect(result).toBe(10);
        });
      `,
    },
    // Test with toHaveBeenCalled but also has behavior check
    {
      code: `
        test('integration test', () => {
          const spy = vi.spyOn(service, 'call');
          const result = runService();
          expect(spy).toHaveBeenCalledWith('arg');
          expect(result.success).toBe(true);
        });
      `,
    },
  ],
  invalid: [
    // Only toHaveBeenCalled
    {
      code: `
        test('calls function', () => {
          const mockFn = vi.fn();
          processData(mockFn);
          expect(mockFn).toHaveBeenCalled();
        });
      `,
      errors: [
        {
          messageId: 'mockOnlyTest',
        },
      ],
    },
    // Only toHaveBeenCalledWith
    {
      code: `
        test('calls with correct args', () => {
          const mockFn = vi.fn();
          processData(mockFn, 'arg');
          expect(mockFn).toHaveBeenCalledWith('arg');
        });
      `,
      errors: [
        {
          messageId: 'mockOnlyTest',
        },
      ],
    },
    // Only toHaveBeenCalledTimes
    {
      code: `
        test('calls multiple times', () => {
          const mockFn = vi.fn();
          repeat(mockFn, 3);
          expect(mockFn).toHaveBeenCalledTimes(3);
        });
      `,
      errors: [
        {
          messageId: 'mockOnlyTest',
        },
      ],
    },
    // Multiple mock assertions, no behavior assertions
    {
      code: `
        test('calls functions in order', () => {
          const mockA = vi.fn();
          const mockB = vi.fn();
          process(mockA, mockB);
          expect(mockA).toHaveBeenCalled();
          expect(mockB).toHaveBeenCalledWith('data');
        });
      `,
      errors: [
        {
          messageId: 'mockOnlyTest',
        },
      ],
    },
    // Using toHaveBeenLastCalledWith
    {
      code: `
        test('last call is correct', () => {
          const mockFn = vi.fn();
          call(mockFn);
          expect(mockFn).toHaveBeenLastCalledWith('last');
        });
      `,
      errors: [
        {
          messageId: 'mockOnlyTest',
        },
      ],
    },
    // Using toHaveBeenNthCalledWith
    {
      code: `
        test('second call is correct', () => {
          const mockFn = vi.fn();
          callMultiple(mockFn);
          expect(mockFn).toHaveBeenNthCalledWith(2, 'second');
        });
      `,
      errors: [
        {
          messageId: 'mockOnlyTest',
        },
      ],
    },
    // Using it() with only mock assertions
    {
      code: `
        it('should call the callback', () => {
          const callback = jest.fn();
          trigger(callback);
          expect(callback).toHaveBeenCalled();
        });
      `,
      errors: [
        {
          messageId: 'mockOnlyTest',
        },
      ],
    },
    // Using .not.toHaveBeenCalled (still a mock assertion)
    {
      code: `
        test('does not call function', () => {
          const mockFn = vi.fn();
          conditionalCall(false, mockFn);
          expect(mockFn).not.toHaveBeenCalled();
        });
      `,
      errors: [
        {
          messageId: 'mockOnlyTest',
        },
      ],
    },
    // Jest spy on mock
    {
      code: `
        test('spies on method', () => {
          const spy = jest.spyOn(obj, 'method');
          obj.method('arg');
          expect(spy).toHaveBeenCalledWith('arg');
        });
      `,
      errors: [
        {
          messageId: 'mockOnlyTest',
        },
      ],
    },
  ],
});
