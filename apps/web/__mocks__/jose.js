// Mock jose module
module.exports = {
  decodeJwt: jest.fn(),
  SignJWT: jest.fn(),
  jwtVerify: jest.fn(),
  createRemoteJWKSet: jest.fn()
};
