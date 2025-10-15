import { RuleTester } from '@typescript-eslint/rule-tester';
import rule from '../../src/rules/no-bare-wrapper.js';

const ruleTester = new RuleTester();

ruleTester.run('no-bare-wrapper', rule, {
  valid: [
    // Function that does actual work
    {
      code: `
        function processData(input: string): string {
          const trimmed = input.trim();
          return trimmed.toUpperCase();
        }
      `,
    },
    // Function that transforms arguments
    {
      code: `
        function getUser(id: number) {
          return fetchUser(id.toString());
        }
      `,
    },
    // Function with additional logic before calling
    {
      code: `
        function saveData(data: any) {
          console.log('Saving data...');
          return save(data);
        }
      `,
    },
    // Function with additional logic after calling
    {
      code: `
        function loadData(id: string) {
          const result = load(id);
          console.log('Data loaded');
          return result;
        }
      `,
    },
    // Function with different number of parameters
    {
      code: `
        function createUser(name: string) {
          return createUserWithDefaults(name, 'user', true);
        }
      `,
    },
    // Function that returns a different value
    {
      code: `
        function isValid(input: string) {
          validate(input);
          return true;
        }
      `,
    },
    // Arrow function with body doing actual work
    {
      code: `
        const processData = (input: string) => {
          const trimmed = input.trim();
          return trimmed.toUpperCase();
        };
      `,
    },
    // Empty function (not a wrapper)
    {
      code: `
        function noop() {}
      `,
    },
    // Function with only a non-call statement
    {
      code: `
        function getValue() {
          return 42;
        }
      `,
    },
  ],
  invalid: [
    // Classic bare wrapper - regular function
    {
      code: `
        function getUserData(id: string) {
          return fetchUserData(id);
        }
      `,
      errors: [
        {
          messageId: 'bareWrapper',
          data: {
            functionName: 'getUserData',
            wrappedFunction: 'fetchUserData',
          },
        },
      ],
    },
    // Bare wrapper with arrow function
    {
      code: `
        const process = (data: any) => {
          return processData(data);
        };
      `,
      errors: [
        {
          messageId: 'bareWrapper',
          data: {
            functionName: 'process',
            wrappedFunction: 'processData',
          },
        },
      ],
    },
    // Bare wrapper with multiple parameters
    {
      code: `
        function createItem(name: string, type: string, active: boolean) {
          return createNewItem(name, type, active);
        }
      `,
      errors: [
        {
          messageId: 'bareWrapper',
          data: {
            functionName: 'createItem',
            wrappedFunction: 'createNewItem',
          },
        },
      ],
    },
    // Bare wrapper without explicit return
    {
      code: `
        const getData = (id: string) => fetchData(id);
      `,
      errors: [
        {
          messageId: 'bareWrapper',
          data: {
            functionName: 'getData',
            wrappedFunction: 'fetchData',
          },
        },
      ],
    },
    // Bare wrapper calling method
    {
      code: `
        function getItems(filter: string) {
          return this.service.getItems(filter);
        }
      `,
      errors: [
        {
          messageId: 'bareWrapper',
          data: {
            functionName: 'getItems',
            wrappedFunction: 'this.service.getItems',
          },
        },
      ],
    },
    // Bare wrapper with no parameters
    {
      code: `
        function initialize() {
          return setup();
        }
      `,
      errors: [
        {
          messageId: 'bareWrapper',
          data: {
            functionName: 'initialize',
            wrappedFunction: 'setup',
          },
        },
      ],
    },
    // Bare wrapper as class method
    {
      code: `
        class MyClass {
          public process(data: string) {
            return this.internalProcess(data);
          }
        }
      `,
      errors: [
        {
          messageId: 'bareWrapper',
          data: {
            functionName: 'process',
            wrappedFunction: 'this.internalProcess',
          },
        },
      ],
    },
  ],
});
