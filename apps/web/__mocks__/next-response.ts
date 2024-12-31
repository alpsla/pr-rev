// Mock Next.js Response object for tests
export class Response {
  private readonly _body: BodyInit | null;
  private readonly _init: ResponseInit;

  constructor(body: BodyInit | null = null, init: ResponseInit = {}) {
    this._body = body;
    this._init = init;
  }

  static json(data: Record<string, unknown>, init: ResponseInit = {}): Response {
    return new Response(JSON.stringify(data), {
      ...init,
      headers: {
        ...init.headers,
        'content-type': 'application/json',
      },
    });
  }
}

export class NextResponse extends Response {
  static json(data: Record<string, unknown>, init: ResponseInit = {}): NextResponse {
    return new NextResponse(JSON.stringify(data), {
      ...init,
      headers: {
        ...init.headers,
        'content-type': 'application/json',
      },
    });
  }
}

export default NextResponse;
