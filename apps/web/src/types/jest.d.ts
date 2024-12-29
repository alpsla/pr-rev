import 'jest';

declare global {
  namespace NodeJS {
    interface Global {
      fetch: jest.Mock<Promise<Response>>;
    }
  }
}
