import { RuleTester } from "@typescript-eslint/rule-tester";
import rule from "./no-code-after-try-catch.js";

const ruleTester = new RuleTester();

ruleTester.run("no-code-after-try-catch", rule, {
  valid: [
    // Code before try/catch is allowed
    {
      code: `
        function processData(input: string) {
          const setup = initialize();
          try {
            return doSomething(setup);
          } catch (e) {
            return handleError(e);
          }
        }
      `,
    },
    // Try/catch with finally, all returns inside
    {
      code: `
        function saveData(data: any) {
          try {
            return save(data);
          } catch (e) {
            return null;
          } finally {
            cleanup();
          }
        }
      `,
    },
    // No try/catch in function
    {
      code: `
        function simple(x: number) {
          return x + 1;
        }
      `,
    },
    // Arrow function with proper try/catch
    {
      code: `
        const fetchUser = async (id: string) => {
          try {
            return await api.getUser(id);
          } catch (e) {
            return null;
          }
        };
      `,
    },
    // Try/catch not at function body level (nested in if)
    {
      code: `
        function conditional(flag: boolean) {
          if (flag) {
            try {
              doSomething();
            } catch (e) {
              console.error(e);
            }
          }
          return "after";
        }
      `,
    },
    // Multiple returns in catch
    {
      code: `
        function multiCatch(input: string) {
          try {
            return parseData(input);
          } catch (e) {
            if (e instanceof SyntaxError) {
              return null;
            }
            return undefined;
          }
        }
      `,
    },
    // Try/catch without returns, but no code after (valid use case)
    {
      code: `
        function logOperation() {
          try {
            performOperation();
            console.log("success");
          } catch (e) {
            console.error("failed", e);
          }
        }
      `,
    },
  ],
  invalid: [
    // Basic fallback after try/catch
    {
      code: `
        function bad() {
          try {
            return doSomething();
          } catch (e) {
            console.error(e);
          }
          return defaultValue;
        }
      `,
      errors: [
        {
          messageId: "codeAfterTryCatch",
        },
      ],
    },
    // Code after try/catch even with returns inside
    {
      code: `
        function badWithReturns() {
          try {
            return doA();
          } catch (e) {
            return handleError(e);
          }
          console.log("This should not be here");
        }
      `,
      errors: [
        {
          messageId: "codeAfterTryCatch",
        },
      ],
    },
    // Arrow function with code after
    {
      code: `
        const bad = () => {
          try {
            return process();
          } catch (e) {
            return null;
          }
          cleanup();
        };
      `,
      errors: [
        {
          messageId: "codeAfterTryCatch",
        },
      ],
    },
    // Multiple statements after try/catch
    {
      code: `
        function multiple() {
          try {
            return doSomething();
          } catch (e) {
            return null;
          }
          console.log("cleanup");
          return fallback;
        }
      `,
      errors: [
        {
          messageId: "codeAfterTryCatch",
        },
      ],
    },
    // Statements after try/catch with no returns
    {
      code: `
        function multiple() {
          try {
            doSomething();
          } catch (e) {
            console.log(e);
          }
          console.log("cleanup");
        }
      `,
      errors: [
        {
          messageId: "codeAfterTryCatch",
        },
      ],
    },
    // Try/catch in conditional with code after (at function level)
    {
      code: `
        function conditionalBad(flag: boolean) {
          if (flag) {
            try {
              return doA();
            } catch (e) {
              return handleA(e);
            }
          }
          return doB();
        }
      `,
      errors: [
        {
          messageId: "codeAfterTryCatch",
        },
      ],
    },
    // Try/catch with finally and code after
    {
      code: `
        function withFinally() {
          try {
            return doSomething();
          } catch (e) {
            return handleError(e);
          } finally {
            cleanup();
          }
          return fallback;
        }
      `,
      errors: [
        {
          messageId: "codeAfterTryCatch",
        },
      ],
    },
  ],
});
