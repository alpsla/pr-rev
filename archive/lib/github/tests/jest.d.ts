/// <reference types="jest" />

declare namespace jest {
  interface Matchers<R> {
    /**
     * Checks if an error matches the expected GitHub error format
     * @param expectedStatus - The expected HTTP status code
     * @param expectedMessage - The expected error message
     */
    toBeGitHubError(expectedStatus: number, expectedMessage: string): R;
  }
}
