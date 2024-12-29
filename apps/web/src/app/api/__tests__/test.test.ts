import { POST, dynamic } from '../test/route';

describe('Test API Route', () => {
  const consoleSpy = jest.spyOn(console, 'log');

  beforeEach(() => {
    consoleSpy.mockClear();
  });

  afterAll(() => {
    consoleSpy.mockRestore();
  });

  it('should return success message', async () => {
    const response = await POST(new Request('http://localhost:3000/api/test'));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ message: 'Test successful' });
    expect(consoleSpy).toHaveBeenCalledWith('Test API route hit');
  });

  it('should have force-dynamic export', () => {
    expect(dynamic).toBe('force-dynamic');
  });
});
