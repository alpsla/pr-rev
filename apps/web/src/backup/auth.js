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
exports.authOptions = void 0;
var github_1 = require("next-auth/providers/github");
var prisma_adapter_1 = require("@next-auth/prisma-adapter");
var prisma_1 = require("@/lib/prisma");
exports.authOptions = {
    providers: [
        (0, github_1.default)({
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
            authorization: {
                url: "https://github.com/login/oauth/authorize",
                params: {
                    scope: 'read:user user:email repo',
                    prompt: 'consent'
                }
            }
        }),
    ],
    adapter: (0, prisma_adapter_1.PrismaAdapter)(prisma_1.prisma),
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    callbacks: {
        signIn: function (_a) {
            return __awaiter(this, arguments, void 0, function (_b) {
                var response, scopesHeader, scopes, error_1;
                var user = _b.user, account = _b.account;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            if (!((account === null || account === void 0 ? void 0 : account.provider) === 'github' && account.access_token)) return [3 /*break*/, 5];
                            _c.label = 1;
                        case 1:
                            _c.trys.push([1, 4, , 5]);
                            return [4 /*yield*/, fetch('https://api.github.com/user', {
                                    headers: {
                                        'Authorization': "Bearer ".concat(account.access_token),
                                        'Accept': 'application/vnd.github.v3+json'
                                    }
                                })];
                        case 2:
                            response = _c.sent();
                            if (!response.ok) {
                                console.error('Failed to verify GitHub scopes:', response.status);
                                return [2 /*return*/, true]; // Continue sign in but log the error
                            }
                            scopesHeader = response.headers.get('x-oauth-scopes') || '';
                            scopes = scopesHeader.split(',').map(function (s) { return s.trim(); }).filter(Boolean);
                            console.log('GitHub OAuth Scopes:', {
                                raw: scopesHeader,
                                parsed: scopes,
                                hasPrivateAccess: scopes.includes('repo')
                            });
                            // Store the verified scopes
                            account.scope = scopesHeader;
                            // Update user with actual scopes from GitHub
                            return [4 /*yield*/, prisma_1.prisma.user.update({
                                    where: { email: user.email },
                                    data: {
                                        githubScope: scopesHeader,
                                        hasPrivateAccess: scopes.includes('repo'),
                                        lastScopeUpdate: new Date(),
                                    },
                                })];
                        case 3:
                            // Update user with actual scopes from GitHub
                            _c.sent();
                            return [3 /*break*/, 5];
                        case 4:
                            error_1 = _c.sent();
                            console.error('Failed to verify GitHub scopes:', error_1);
                            return [3 /*break*/, 5];
                        case 5: return [2 /*return*/, true];
                    }
                });
            });
        },
        jwt: function (_a) {
            return __awaiter(this, arguments, void 0, function (_b) {
                var scopes;
                var token = _b.token, account = _b.account, user = _b.user;
                return __generator(this, function (_c) {
                    if (account) {
                        scopes = (account.scope || '').split(',').map(function (s) { return s.trim(); });
                        token.accessToken = account.access_token;
                        token.scope = account.scope;
                        token.hasPrivateAccess = scopes.includes('repo');
                    }
                    return [2 /*return*/, token];
                });
            });
        },
        session: function (_a) {
            return __awaiter(this, arguments, void 0, function (_b) {
                var session = _b.session, token = _b.token;
                return __generator(this, function (_c) {
                    if (token) {
                        session.accessToken = token.accessToken;
                        session.scope = token.scope;
                        session.user.hasPrivateAccess = token.hasPrivateAccess;
                    }
                    return [2 /*return*/, session];
                });
            });
        }
    },
    pages: {
        signIn: '/auth/signin',
        error: '/auth/error',
    },
    debug: process.env.NODE_ENV === 'development',
};
