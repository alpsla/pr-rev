"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var prisma_1 = require("./mocks/prisma");
var rest_1 = require("@octokit/rest");
var api_1 = require("../api");
describe('Enhanced GitHub Service Tests', function () {
    var service;
    var ctx;
    var octokitInstance;
    beforeEach(function () {
        // Initialize the mock context
        ctx = (0, prisma_1.createMockContext)();
        // Reset all mocks
        jest.clearAllMocks();
        // Create new Octokit instance
        octokitInstance = new rest_1.Octokit({ auth: 'test-token' });
        // Set up rate limit mock
        mocks.mockRateLimitGet.mockImplementation(function () {
            return Promise.resolve(createMockResponse(createRateLimitResponse()));
        });
        service = new api_1.GitHubService(ctx.prisma, octokitInstance, {
            type: 'token',
            credentials: { token: 'test-token' }
        });
        // Add any additional mock setups
        mocks.mockReposGet.mockResolvedValue(mockGithubRepoResponse);
        mocks.mockPullsGet.mockResolvedValue(mockPullsGetResponse);
    });
    afterEach(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, service.destroy()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    var createBasicMockRepo = function (overrides) {
        if (overrides === void 0) { overrides = {}; }
        return (__assign({ id: 1, node_id: 'R_1', name: 'test-repo', full_name: 'test-owner/test-repo', private: false, owner: {
                login: 'test-owner',
                id: 1,
                node_id: 'U_1',
                avatar_url: 'https://github.com/images/error/octocat.gif',
                gravatar_id: '',
                url: 'https://api.github.com/users/test-owner',
                html_url: 'https://github.com/test-owner',
                type: 'User',
                site_admin: false,
                starred_at: undefined,
                followers_url: 'https://api.github.com/users/test-owner/followers',
                following_url: 'https://api.github.com/users/test-owner/following{/other_user}',
                gists_url: 'https://api.github.com/users/test-owner/gists{/gist_id}',
                starred_url: 'https://api.github.com/users/test-owner/starred{/owner}{/repo}',
                subscriptions_url: 'https://api.github.com/users/test-owner/subscriptions',
                organizations_url: 'https://api.github.com/users/test-owner/orgs',
                repos_url: 'https://api.github.com/users/test-owner/repos',
                events_url: 'https://api.github.com/users/test-owner/events{/privacy}',
                received_events_url: 'https://api.github.com/users/test-owner/received_events'
            }, html_url: 'https://github.com/test-owner/test-repo', description: 'Test repository', fork: false, url: 'https://api.github.com/repos/test-owner/test-repo', archive_url: 'https://api.github.com/repos/test-owner/test-repo/{archive_format}{/ref}', assignees_url: 'https://api.github.com/repos/test-owner/test-repo/assignees{/user}', blobs_url: 'https://api.github.com/repos/test-owner/test-repo/git/blobs{/sha}', branches_url: 'https://api.github.com/repos/test-owner/test-repo/branches{/branch}', collaborators_url: 'https://api.github.com/repos/test-owner/test-repo/collaborators{/collaborator}', comments_url: 'https://api.github.com/repos/test-owner/test-repo/comments{/number}', commits_url: 'https://api.github.com/repos/test-owner/test-repo/commits{/sha}', compare_url: 'https://api.github.com/repos/test-owner/test-repo/compare/{base}...{head}', contents_url: 'https://api.github.com/repos/test-owner/test-repo/contents/{+path}', contributors_url: 'https://api.github.com/repos/test-owner/test-repo/contributors', deployments_url: 'https://api.github.com/repos/test-owner/test-repo/deployments', downloads_url: 'https://api.github.com/repos/test-owner/test-repo/downloads', events_url: 'https://api.github.com/repos/test-owner/test-repo/events', forks_url: 'https://api.github.com/repos/test-owner/test-repo/forks', git_commits_url: 'https://api.github.com/repos/test-owner/test-repo/git/commits{/sha}', git_refs_url: 'https://api.github.com/repos/test-owner/test-repo/git/refs{/sha}', git_tags_url: 'https://api.github.com/repos/test-owner/test-repo/git/tags{/sha}', git_url: 'git://github.com/test-owner/test-repo.git', hooks_url: 'https://api.github.com/repos/test-owner/test-repo/hooks', issue_comment_url: 'https://api.github.com/repos/test-owner/test-repo/issues/comments{/number}', issue_events_url: 'https://api.github.com/repos/test-owner/test-repo/issues/events{/number}', issues_url: 'https://api.github.com/repos/test-owner/test-repo/issues{/number}', keys_url: 'https://api.github.com/repos/test-owner/test-repo/keys{/key_id}', labels_url: 'https://api.github.com/repos/test-owner/test-repo/labels{/name}', languages_url: 'https://api.github.com/repos/test-owner/test-repo/languages', merges_url: 'https://api.github.com/repos/test-owner/test-repo/merges', milestones_url: 'https://api.github.com/repos/test-owner/test-repo/milestones{/number}', mirror_url: null, notifications_url: 'https://api.github.com/repos/test-owner/test-repo/notifications{?since,all,participating}', pulls_url: 'https://api.github.com/repos/test-owner/test-repo/pulls{/number}', releases_url: 'https://api.github.com/repos/test-owner/test-repo/releases{/id}', ssh_url: 'git@github.com:test-owner/test-repo.git', stargazers_url: 'https://api.github.com/repos/test-owner/test-repo/stargazers', statuses_url: 'https://api.github.com/repos/test-owner/test-repo/statuses/{sha}', subscribers_url: 'https://api.github.com/repos/test-owner/test-repo/subscribers', subscription_url: 'https://api.github.com/repos/test-owner/test-repo/subscription', tags_url: 'https://api.github.com/repos/test-owner/test-repo/tags', teams_url: 'https://api.github.com/repos/test-owner/test-repo/teams', trees_url: 'https://api.github.com/repos/test-owner/test-repo/git/trees{/sha}', clone_url: 'https://github.com/test-owner/test-repo.git', svn_url: 'https://github.com/test-owner/test-repo', homepage: null, language: null, forks_count: 0, stargazers_count: 0, watchers_count: 0, size: 0, default_branch: 'main', open_issues_count: 0, is_template: false, topics: [], has_issues: true, has_projects: true, has_wiki: true, has_pages: false, has_downloads: true, has_discussions: false, archived: false, disabled: false, visibility: 'public', pushed_at: '2024-01-01T00:00:00Z', created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z', permissions: {
                admin: true,
                maintain: true,
                push: true,
                triage: true,
                pull: true
            }, allow_rebase_merge: true, template_repository: null, temp_clone_token: '', allow_squash_merge: true, allow_auto_merge: false, delete_branch_on_merge: false, allow_update_branch: false, use_squash_pr_title_as_default: false, squash_merge_commit_title: 'COMMIT_OR_PR_TITLE', squash_merge_commit_message: 'COMMIT_MESSAGES', merge_commit_title: 'MERGE_MESSAGE', merge_commit_message: 'PR_TITLE', allow_merge_commit: true, allow_forking: true, web_commit_signoff_required: false, subscribers_count: 0, network_count: 0, license: null, forks: 0, open_issues: 0, watchers: 0 }, overrides));
    };
    describe('Repository Operations', function () {
        test('fetches repository information', function () { return __awaiter(void 0, void 0, void 0, function () {
            var mockRepo, repo;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockRepo = createBasicMockRepo();
                        mocks.mockReposGet.mockImplementation(function () { return Promise.resolve(createMockResponse(mockRepo)); });
                        return [4 /*yield*/, service.getRepository('test-owner', 'test-repo')];
                    case 1:
                        repo = _a.sent();
                        expect(repo).toBeDefined();
                        expect(repo.name).toBe('test-repo');
                        expect(repo.fullName).toBe('test-owner/test-repo');
                        expect(mocks.mockReposGet).toHaveBeenCalledWith({
                            owner: 'test-owner',
                            repo: 'test-repo'
                        });
                        return [2 /*return*/];
                }
            });
        }); });
        test('handles repository not found error', function () { return __awaiter(void 0, void 0, void 0, function () {
            var error;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        error = new Error('Not Found');
                        Object.assign(error, { status: 404 });
                        mocks.mockReposGet.mockImplementation(function () { return Promise.reject(error); });
                        return [4 /*yield*/, expect(service.getRepository('test-owner', 'test-repo'))
                                .rejects.toThrow('Not Found')];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('Rate Limiting', function () {
        test('handles rate limit errors with retry', function () { return __awaiter(void 0, void 0, void 0, function () {
            var rateLimitError, mockRepo, repo;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        rateLimitError = new Error('API rate limit exceeded');
                        Object.assign(rateLimitError, { status: 403 });
                        mockRepo = createBasicMockRepo();
                        mocks.mockReposGet
                            .mockImplementationOnce(function () { return Promise.reject(rateLimitError); })
                            .mockImplementationOnce(function () { return Promise.resolve(createMockResponse(mockRepo)); });
                        return [4 /*yield*/, service.getRepository('test-owner', 'test-repo')];
                    case 1:
                        repo = _a.sent();
                        expect(repo).toBeDefined();
                        expect(mocks.mockReposGet).toHaveBeenCalledTimes(2);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('Error Handling', function () {
        test('handles network errors', function () { return __awaiter(void 0, void 0, void 0, function () {
            var networkError;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        networkError = new Error('Network error');
                        Object.assign(networkError, { status: 500 });
                        mocks.mockReposGet.mockImplementation(function () { return Promise.reject(networkError); });
                        return [4 /*yield*/, expect(service.getRepository('test-owner', 'test-repo'))
                                .rejects.toThrow('Network error')];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        test('handles invalid responses', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mocks.mockReposGet.mockImplementation(function () { return Promise.resolve(createMockResponse({})); });
                        return [4 /*yield*/, expect(service.getRepository('test-owner', 'test-repo'))
                                .rejects.toThrow()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
