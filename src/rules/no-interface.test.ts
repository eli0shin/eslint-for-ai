import { RuleTester } from '@typescript-eslint/rule-tester';
import rule from './no-interface.js';

const ruleTester = new RuleTester();

ruleTester.run('no-interface', rule, {
  valid: [
    // Type alias for object
    {
      code: `
        type User = {
          id: string;
          name: string;
        };
      `,
    },
    // Type alias for union
    {
      code: `
        type Status = 'active' | 'inactive' | 'pending';
      `,
    },
    // Type alias for function
    {
      code: `
        type Handler = (event: Event) => void;
      `,
    },
    // Type alias with generic
    {
      code: `
        type Result<T> = {
          data: T;
          error?: string;
        };
      `,
    },
    // Type alias for intersection
    {
      code: `
        type Person = Named & Aged;
      `,
    },
  ],
  invalid: [
    // Simple interface
    {
      code: `
        interface User {
          id: string;
          name: string;
        }
      `,
      errors: [
        {
          messageId: 'noInterface',
          data: {
            interfaceName: 'User',
          },
        },
      ],
    },
    // Interface with methods
    {
      code: `
        interface Repository {
          findById(id: string): Promise<any>;
          save(data: any): Promise<void>;
        }
      `,
      errors: [
        {
          messageId: 'noInterface',
          data: {
            interfaceName: 'Repository',
          },
        },
      ],
    },
    // Interface extending another interface
    {
      code: `
        interface Employee extends Person {
          employeeId: string;
        }
      `,
      errors: [
        {
          messageId: 'noInterface',
          data: {
            interfaceName: 'Employee',
          },
        },
      ],
    },
    // Generic interface
    {
      code: `
        interface Container<T> {
          value: T;
        }
      `,
      errors: [
        {
          messageId: 'noInterface',
          data: {
            interfaceName: 'Container',
          },
        },
      ],
    },
    // Empty interface
    {
      code: `
        interface EmptyInterface {}
      `,
      errors: [
        {
          messageId: 'noInterface',
          data: {
            interfaceName: 'EmptyInterface',
          },
        },
      ],
    },
    // Interface with optional properties
    {
      code: `
        interface Config {
          apiKey: string;
          timeout?: number;
        }
      `,
      errors: [
        {
          messageId: 'noInterface',
          data: {
            interfaceName: 'Config',
          },
        },
      ],
    },
  ],
});
