// Mock Web APIs first
class MockResponse {
  constructor(body, init = {}) {
    this.body = body;
    this.status = init.status || 200;
    this.statusText = init.statusText || '';
    this.headers = new Headers(init.headers || {});
    this.ok = this.status >= 200 && this.status < 300;
    this.type = 'basic';
    this.url = '';
  }

  async json() {
    return typeof this.body === 'string' ? JSON.parse(this.body) : this.body;
  }

  async text() {
    return typeof this.body === 'string' ? this.body : JSON.stringify(this.body);
  }

  static json(data, init = {}) {
    const body = JSON.stringify(data);
    return new MockResponse(body, {
      ...init,
      headers: {
        'content-type': 'application/json',
        ...(init?.headers || {})
      }
    });
  }
}

class Headers extends Map {
  constructor(init = {}) {
    super(Object.entries(init));
  }
}

global.Response = MockResponse;
global.Headers = Map;
global.Request = class Request {
  constructor(input, init = {}) {
    this.url = input;
    this.method = init.method || 'GET';
    this.headers = new Map(Object.entries(init.headers || {}));
    this.body = init.body;
  }

  async json() {
    return typeof this.body === 'string' ? JSON.parse(this.body) : this.body;
  }

  async text() {
    return typeof this.body === 'string' ? this.body : JSON.stringify(this.body);
  }
};

// Mock Response globally for Next.js and Web APIs
global.Response = MockResponse;

// Mock Next.js modules
jest.mock('next/server', () => {
  const MockNextResponse = {
    json: MockResponse.json,
    redirect: (url) => new MockResponse(null, {
      status: 302,
      headers: { Location: url }
    }),
    next: (init) => new MockResponse(null, init),
    rewrite: (url) => new MockResponse(null, {
      headers: { 'x-middleware-rewrite': url }
    })
  };

  return {
    NextResponse: MockNextResponse,
    Response: MockResponse
  };
});

import '@testing-library/jest-dom'

// Mock next-auth/jwt
jest.mock('next-auth/jwt', () => ({
  getToken: jest.fn(() => Promise.resolve({ 
    accessToken: 'mock-access-token',
    user: { name: 'Test User' }
  }))
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    }
  },
  useSearchParams() {
    return {
      get: jest.fn(),
    }
  },
}))

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession() {
    return { data: null, status: 'unauthenticated' }
  },
}))

// Reset mocks between tests
beforeEach(() => {
  jest.clearAllMocks()
})

// Global fetch mock
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({}),
  })
)
