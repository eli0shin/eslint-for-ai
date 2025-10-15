import { RuleTester } from '@typescript-eslint/rule-tester';
import rule from './no-standalone-class.js';

const ruleTester = new RuleTester();

ruleTester.run('no-standalone-class', rule, {
  valid: [
    // Class that extends another class
    {
      code: `
        class MyComponent extends Component {
          render() {
            return 'Hello';
          }
        }
      `,
    },
    // Class that extends with generic
    {
      code: `
        class UserService extends BaseService<User> {
          getUser(id: string) {
            return this.find(id);
          }
        }
      `,
    },
    // Class extending built-in
    {
      code: `
        class CustomError extends Error {
          constructor(message: string) {
            super(message);
          }
        }
      `,
    },
    // Abstract class extending another class
    {
      code: `
        abstract class AbstractRepository extends BaseRepository {
          abstract findById(id: string): Promise<any>;
        }
      `,
    },
  ],
  invalid: [
    // Standalone class without extension
    {
      code: `
        class UserService {
          getUser(id: string) {
            return fetchUser(id);
          }
        }
      `,
      errors: [
        {
          messageId: 'standaloneClass',
          data: {
            className: 'UserService',
          },
        },
      ],
    },
    // Standalone class with constructor
    {
      code: `
        class Calculator {
          constructor(private value: number) {}

          add(n: number) {
            return this.value + n;
          }
        }
      `,
      errors: [
        {
          messageId: 'standaloneClass',
          data: {
            className: 'Calculator',
          },
        },
      ],
    },
    // Standalone abstract class
    {
      code: `
        abstract class Repository {
          abstract findById(id: string): Promise<any>;
        }
      `,
      errors: [
        {
          messageId: 'standaloneClass',
          data: {
            className: 'Repository',
          },
        },
      ],
    },
    // Standalone class with static methods
    {
      code: `
        class Utils {
          static format(value: string) {
            return value.trim();
          }
        }
      `,
      errors: [
        {
          messageId: 'standaloneClass',
          data: {
            className: 'Utils',
          },
        },
      ],
    },
    // Empty standalone class
    {
      code: `
        class EmptyClass {}
      `,
      errors: [
        {
          messageId: 'standaloneClass',
          data: {
            className: 'EmptyClass',
          },
        },
      ],
    },
  ],
});
