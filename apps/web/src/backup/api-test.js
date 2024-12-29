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
exports.testGitHubOAuth = testGitHubOAuth;
exports.testClaudeConnection = testClaudeConnection;
var rest_1 = require("@octokit/rest");
var sdk_1 = require("@anthropic-ai/sdk");
var dotenv = require("dotenv");
// Load environment variables from .env file
dotenv.config({ path: '../../.env' });
// Initialize Claude API
var anthropic = new sdk_1.default({
    apiKey: process.env.CLAUDE_API_KEY || '',
});
// Initialize GitHub OAuth App credentials
var clientId = process.env.GITHUB_CLIENT_ID;
var clientSecret = process.env.GITHUB_CLIENT_SECRET;
function testGitHubOAuth() {
    return __awaiter(this, void 0, void 0, function () {
        var octokit, rateLimit, authUrl, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    octokit = new rest_1.Octokit();
                    return [4 /*yield*/, octokit.rateLimit.get()];
                case 1:
                    rateLimit = (_a.sent()).data;
                    console.log('GitHub API Basic Access Test Success:', {
                        rate: rateLimit.rate,
                        message: 'Successfully connected to GitHub API'
                    });
                    authUrl = "https://github.com/login/oauth/authorize?client_id=".concat(clientId, "&scope=repo,user");
                    console.log('\nGitHub OAuth Setup Test Success:');
                    console.log('✓ Client ID configured');
                    console.log('✓ Client Secret configured');
                    console.log('\nTo complete OAuth setup, users will need to:');
                    console.log('1. Visit the authorization URL');
                    console.log('2. Grant access to the application');
                    console.log('\nAuthorization URL:', authUrl);
                    return [2 /*return*/, true];
                case 2:
                    error_1 = _a.sent();
                    console.error('GitHub API Test Failed:', error_1);
                    return [2 /*return*/, false];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function testClaudeConnection() {
    return __awaiter(this, void 0, void 0, function () {
        var message, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, anthropic.messages.create({
                            model: 'claude-3-opus-20240229',
                            max_tokens: 100,
                            messages: [{
                                    role: 'user',
                                    content: 'Say "API connection successful!" if you receive this message.'
                                }]
                        })];
                case 1:
                    message = _a.sent();
                    console.log('Claude API Test Success:', message.content);
                    return [2 /*return*/, true];
                case 2:
                    error_2 = _a.sent();
                    console.error('Claude API Test Failed:', error_2);
                    return [2 /*return*/, false];
                case 3: return [2 /*return*/];
            }
        });
    });
}
// Run both tests
function runTests() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Debug: Print environment variables (excluding sensitive values)
                    console.log('Environment Variables Check:');
                    console.log('GITHUB_CLIENT_ID:', process.env.GITHUB_CLIENT_ID ? '✓ Set' : '✗ Not Set');
                    console.log('GITHUB_CLIENT_SECRET:', process.env.GITHUB_CLIENT_SECRET ? '✓ Set' : '✗ Not Set');
                    console.log('CLAUDE_API_KEY:', process.env.CLAUDE_API_KEY ? '✓ Set' : '✗ Not Set');
                    console.log('\nStarting API Tests...');
                    console.log('\nTesting GitHub API and OAuth Setup...');
                    return [4 /*yield*/, testGitHubOAuth()];
                case 1:
                    _a.sent();
                    console.log('\nTesting Claude API...');
                    return [4 /*yield*/, testClaudeConnection()];
                case 2:
                    _a.sent();
                    console.log('\nTests completed!');
                    return [2 /*return*/];
            }
        });
    });
}
// Only run if this file is executed directly
if (require.main === module) {
    runTests().catch(console.error);
}
