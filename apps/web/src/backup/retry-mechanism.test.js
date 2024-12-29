"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var api_1 = require("../../api");
var mock_factory_1 = require("../utils/mock-factory");
var test_data_1 = require("../utils/test-data");
var mock_responses_1 = require("../utils/mock-responses");
var test_helpers_1 = require("../utils/test-helpers");
var errors_1 = require("../../errors");
describe('GitHubService - Retry Mechanism', function () {
    var ctx = (0, mock_factory_1.createMockContext)();
    var service;
    beforeEach(function () {
        service = new api_1.GitHubService(ctx.prisma, ctx.octokit, { type: 'token', credentials: { token: 'test-token' } });
        jest.useFakeTimers();
    });
    afterEach(function () {
        jest.clearAllMocks();
        jest.useRealTimers();
    });
    describe('Rate Limit Retries', function () {
        it('should retry on rate limit with exponential backoff', function () { return __awaiter(void 0, void 0, void 0, function () {
            var rateLimitError, promise, error;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        rateLimitError = {
                            response: {
                                status: 403,
                                data: { message: 'API rate limit exceeded' },
                                headers: {
                                    'x-ratelimit-limit': '5000',
                                    'x-ratelimit-remaining': '0',
                                    'x-ratelimit-reset': '1609459200'
                                }
                            }
                        };
                        ctx.octokit.rest.repos.get
                            .mockRejectedValueOnce(rateLimitError)
                            .mockRejectedValueOnce(rateLimitError)
                            .mockRejectedValueOnce(rateLimitError);
                        promise = service.getRepository(test_data_1.TEST_OWNER, test_data_1.TEST_REPO);
                        // Should retry with exponential backoff (1000ms, 2000ms, 4000ms)
                        jest.advanceTimersByTime(1000); // First retry
                        jest.advanceTimersByTime(2000); // Second retry
                        jest.advanceTimersByTime(4000); // Third retry
                        return [4 /*yield*/, (0, test_helpers_1.expectGitHubError)(promise, 403, 'API rate limit exceeded')];
                    case 1:
                        error = _a.sent();
                        (0, test_helpers_1.expectErrorType)(error, errors_1.RateLimitError);
                        expect(ctx.octokit.rest.repos.get).toHaveBeenCalledTimes(3);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should succeed after rate limit retry', function () { return __awaiter(void 0, void 0, void 0, function () {
            var promise, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // First attempt fails with rate limit
                        ctx.octokit.rest.repos.get.mockRejectedValueOnce({
                            response: {
                                status: 403,
                                data: { message: 'API rate limit exceeded' },
                                headers: {
                                    'x-ratelimit-limit': '5000',
                                    'x-ratelimit-remaining': '0',
                                    'x-ratelimit-reset': '1609459200'
                                }
                            }
                        });
                        // Second attempt succeeds
                        ctx.octokit.rest.repos.get.mockResolvedValueOnce({
                            data: (0, mock_responses_1.createMockRepositoryResponse)(test_data_1.TEST_OWNER, test_data_1.TEST_REPO),
                            status: 200,
                            url: "https://api.github.com/repos/".concat(test_data_1.TEST_OWNER, "/").concat(test_data_1.TEST_REPO),
                            headers: {}
                        });
                        promise = service.getRepository(test_data_1.TEST_OWNER, test_data_1.TEST_REPO);
                        jest.advanceTimersByTime(1000); // First retry delay
                        return [4 /*yield*/, promise];
                    case 1:
                        result = _a.sent();
                        expect(result).toBeDefined();
                        expect(result.name).toBe(test_data_1.TEST_REPO);
                        expect(ctx.octokit.rest.repos.get).toHaveBeenCalledTimes(2);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('Network Error Retries', function () {
        it('should retry on network errors', function () { return __awaiter(void 0, void 0, void 0, function () {
            var networkError, promise, error;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        networkError = {
                            code: 'ECONNREFUSED',
                            message: 'Network Error'
                        };
                        ctx.octokit.rest.repos.get
                            .mockRejectedValueOnce(networkError)
                            .mockRejectedValueOnce(networkError)
                            .mockRejectedValueOnce(networkError);
                        promise = service.getRepository(test_data_1.TEST_OWNER, test_data_1.TEST_REPO);
                        // Should retry with exponential backoff
                        jest.advanceTimersByTime(1000); // First retry
                        jest.advanceTimersByTime(2000); // Second retry
                        jest.advanceTimersByTime(4000); // Third retry
                        return [4 /*yield*/, (0, test_helpers_1.expectGitHubError)(promise, 500, 'Network Error')];
                    case 1:
                        error = _a.sent();
                        (0, test_helpers_1.expectErrorType)(error, errors_1.NetworkError);
                        expect(ctx.octokit.rest.repos.get).toHaveBeenCalledTimes(3);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should succeed after network error retry', function () { return __awaiter(void 0, void 0, void 0, function () {
            var promise, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // First attempt fails with network error
                        ctx.octokit.rest.repos.get.mockRejectedValueOnce({
                            code: 'ECONNREFUSED',
                            message: 'Network Error'
                        });
                        // Second attempt succeeds
                        ctx.octokit.rest.repos.get.mockResolvedValueOnce({
                            data: (0, mock_responses_1.createMockRepositoryResponse)(test_data_1.TEST_OWNER, test_data_1.TEST_REPO),
                            status: 200,
                            url: "https://api.github.com/repos/".concat(test_data_1.TEST_OWNER, "/").concat(test_data_1.TEST_REPO),
                            headers: {}
                        });
                        promise = service.getRepository(test_data_1.TEST_OWNER, test_data_1.TEST_REPO);
                        jest.advanceTimersByTime(1000); // First retry delay
                        return [4 /*yield*/, promise];
                    case 1:
                        result = _a.sent();
                        expect(result).toBeDefined();
                        expect(result.name).toBe(test_data_1.TEST_REPO);
                        expect(ctx.octokit.rest.repos.get).toHaveBeenCalledTimes(2);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('Server Error Retries', function () {
        it('should retry on 5xx errors', function () { return __awaiter(void 0, void 0, void 0, function () {
            var serverError, promise, error;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        serverError = {
                            response: {
                                status: 500,
                                data: { message: 'Internal Server Error' }
                            }
                        };
                        ctx.octokit.rest.repos.get
                            .mockRejectedValueOnce(serverError)
                            .mockRejectedValueOnce(serverError)
                            .mockRejectedValueOnce(serverError);
                        promise = service.getRepository(test_data_1.TEST_OWNER, test_data_1.TEST_REPO);
                        // Should retry with exponential backoff
                        jest.advanceTimersByTime(1000); // First retry
                        jest.advanceTimersByTime(2000); // Second retry
                        jest.advanceTimersByTime(4000); // Third retry
                        return [4 /*yield*/, (0, test_helpers_1.expectGitHubError)(promise, 500, 'Internal Server Error')];
                    case 1:
                        error = _a.sent();
                        (0, test_helpers_1.expectErrorType)(error, errors_1.ServerError);
                        expect(ctx.octokit.rest.repos.get).toHaveBeenCalledTimes(3);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should succeed after server error retry', function () { return __awaiter(void 0, void 0, void 0, function () {
            var promise, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // First attempt fails with server error
                        ctx.octokit.rest.repos.get.mockRejectedValueOnce({
                            response: {
                                status: 500,
                                data: { message: 'Internal Server Error' }
                            }
                        });
                        // Second attempt succeeds
                        ctx.octokit.rest.repos.get.mockResolvedValueOnce({
                            data: (0, mock_responses_1.createMockRepositoryResponse)(test_data_1.TEST_OWNER, test_data_1.TEST_REPO),
                            status: 200,
                            url: "https://api.github.com/repos/".concat(test_data_1.TEST_OWNER, "/").concat(test_data_1.TEST_REPO),
                            headers: {}
                        });
                        promise = service.getRepository(test_data_1.TEST_OWNER, test_data_1.TEST_REPO);
                        jest.advanceTimersByTime(1000); // First retry delay
                        return [4 /*yield*/, promise];
                    case 1:
                        result = _a.sent();
                        expect(result).toBeDefined();
                        expect(result.name).toBe(test_data_1.TEST_REPO);
                        expect(ctx.octokit.rest.repos.get).toHaveBeenCalledTimes(2);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('Non-Retryable Errors', function () {
        it('should not retry on 404 errors', function () { return __awaiter(void 0, void 0, void 0, function () {
            var error;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        ctx.octokit.rest.repos.get.mockRejectedValueOnce({
                            response: {
                                status: 404,
                                data: { message: 'Not Found' }
                            }
                        });
                        return [4 /*yield*/, (0, test_helpers_1.expectGitHubError)(service.getRepository(test_data_1.TEST_OWNER, test_data_1.TEST_REPO), 404, 'Not Found')];
                    case 1:
                        error = _a.sent();
                        expect(error.name).toBe('GitHubError');
                        expect(ctx.octokit.rest.repos.get).toHaveBeenCalledTimes(1);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should not retry on validation errors', function () { return __awaiter(void 0, void 0, void 0, function () {
            var error;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        ctx.octokit.rest.repos.get.mockRejectedValueOnce({
                            response: {
                                status: 422,
                                data: {
                                    message: 'Validation Failed',
                                    errors: [{ resource: 'Repository', code: 'custom_field_key' }]
                                }
                            }
                        });
                        return [4 /*yield*/, (0, test_helpers_1.expectGitHubError)(service.getRepository(test_data_1.TEST_OWNER, test_data_1.TEST_REPO), 422, 'Validation Failed')];
                    case 1:
                        error = _a.sent();
                        expect(error.name).toBe('ValidationError');
                        expect(ctx.octokit.rest.repos.get).toHaveBeenCalledTimes(1);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should not retry on authentication errors', function () { return __awaiter(void 0, void 0, void 0, function () {
            var error;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        ctx.octokit.rest.repos.get.mockRejectedValueOnce({
                            response: {
                                status: 401,
                                data: { message: 'Bad credentials' }
                            }
                        });
                        return [4 /*yield*/, (0, test_helpers_1.expectGitHubError)(service.getRepository(test_data_1.TEST_OWNER, test_data_1.TEST_REPO), 401, 'Bad credentials')];
                    case 1:
                        error = _a.sent();
                        expect(error.name).toBe('AuthenticationError');
                        expect(ctx.octokit.rest.repos.get).toHaveBeenCalledTimes(1);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('Retry State Management', function () {
        it('should reset retry count after successful request', function () { return __awaiter(void 0, void 0, void 0, function () {
            var serverError, promise, error;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // First request succeeds
                        ctx.octokit.rest.repos.get.mockResolvedValueOnce({
                            data: (0, mock_responses_1.createMockRepositoryResponse)(test_data_1.TEST_OWNER, test_data_1.TEST_REPO),
                            status: 200,
                            url: "https://api.github.com/repos/".concat(test_data_1.TEST_OWNER, "/").concat(test_data_1.TEST_REPO),
                            headers: {}
                        });
                        return [4 /*yield*/, service.getRepository(test_data_1.TEST_OWNER, test_data_1.TEST_REPO)];
                    case 1:
                        _a.sent();
                        serverError = {
                            response: {
                                status: 500,
                                data: { message: 'Internal Server Error' }
                            }
                        };
                        ctx.octokit.rest.repos.get
                            .mockRejectedValueOnce(serverError)
                            .mockRejectedValueOnce(serverError)
                            .mockRejectedValueOnce(serverError);
                        promise = service.getRepository(test_data_1.TEST_OWNER, test_data_1.TEST_REPO);
                        // Should start retry count from 0
                        jest.advanceTimersByTime(1000); // First retry
                        jest.advanceTimersByTime(2000); // Second retry
                        jest.advanceTimersByTime(4000); // Third retry
                        return [4 /*yield*/, (0, test_helpers_1.expectGitHubError)(promise, 500, 'Internal Server Error')];
                    case 2:
                        error = _a.sent();
                        (0, test_helpers_1.expectErrorType)(error, errors_1.ServerError);
                        expect(ctx.octokit.rest.repos.get).toHaveBeenCalledTimes(4); // 1 success + 3 retries
                        return [2 /*return*/];
                }
            });
        }); });
        it('should maintain separate retry states for different operations', function () { return __awaiter(void 0, void 0, void 0, function () {
            var serverError, repoPromise, prPromise, error, prResult;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        serverError = {
                            response: {
                                status: 500,
                                data: { message: 'Internal Server Error' }
                            }
                        };
                        // Repository request fails with retries
                        ctx.octokit.rest.repos.get
                            .mockRejectedValueOnce(serverError)
                            .mockRejectedValueOnce(serverError)
                            .mockRejectedValueOnce(serverError);
                        repoPromise = service.getRepository(test_data_1.TEST_OWNER, test_data_1.TEST_REPO);
                        // PR request succeeds immediately
                        ctx.octokit.rest.pulls.get.mockResolvedValueOnce({
                            data: (0, mock_responses_1.createMockPullRequestResponse)(test_data_1.TEST_OWNER, test_data_1.TEST_REPO, 1),
                            status: 200,
                            url: "https://api.github.com/repos/".concat(test_data_1.TEST_OWNER, "/").concat(test_data_1.TEST_REPO, "/pulls/1"),
                            headers: {}
                        });
                        prPromise = service.getPullRequest(test_data_1.TEST_OWNER, test_data_1.TEST_REPO, 1);
                        // Advance time for repository retries
                        jest.advanceTimersByTime(1000); // First retry
                        jest.advanceTimersByTime(2000); // Second retry
                        jest.advanceTimersByTime(4000); // Third retry
                        return [4 /*yield*/, (0, test_helpers_1.expectGitHubError)(repoPromise, 500, 'Internal Server Error')];
                    case 1:
                        error = _a.sent();
                        (0, test_helpers_1.expectErrorType)(error, errors_1.ServerError);
                        return [4 /*yield*/, prPromise];
                    case 2:
                        prResult = _a.sent();
                        expect(ctx.octokit.rest.repos.get).toHaveBeenCalledTimes(3);
                        expect(ctx.octokit.rest.pulls.get).toHaveBeenCalledTimes(1);
                        expect(prResult).toBeDefined();
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
