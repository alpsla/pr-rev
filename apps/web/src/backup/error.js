"use strict";
// src/lib/github/types/error.ts
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServerError = exports.ValidationError = exports.NotFoundError = exports.RateLimitError = exports.AuthenticationError = exports.GitHubError = void 0;
var GitHubError = /** @class */ (function (_super) {
    __extends(GitHubError, _super);
    function GitHubError(message, status, data, context) {
        var _this = _super.call(this, message) || this;
        _this.status = status;
        _this.data = data;
        _this.context = context;
        _this.name = 'GitHubError';
        return _this;
    }
    return GitHubError;
}(Error));
exports.GitHubError = GitHubError;
var AuthenticationError = /** @class */ (function (_super) {
    __extends(AuthenticationError, _super);
    function AuthenticationError(message, originalError, context) {
        var _this = _super.call(this, message, 401, originalError, context) || this;
        _this.name = 'AuthenticationError';
        return _this;
    }
    return AuthenticationError;
}(GitHubError));
exports.AuthenticationError = AuthenticationError;
var RateLimitError = /** @class */ (function (_super) {
    __extends(RateLimitError, _super);
    function RateLimitError(message, originalError, context) {
        var _this = _super.call(this, message, 429, originalError, context) || this;
        _this.name = 'RateLimitError';
        return _this;
    }
    return RateLimitError;
}(GitHubError));
exports.RateLimitError = RateLimitError;
var NotFoundError = /** @class */ (function (_super) {
    __extends(NotFoundError, _super);
    function NotFoundError(message, originalError, context) {
        var _this = _super.call(this, message, 404, originalError, context) || this;
        _this.name = 'NotFoundError';
        return _this;
    }
    return NotFoundError;
}(GitHubError));
exports.NotFoundError = NotFoundError;
var ValidationError = /** @class */ (function (_super) {
    __extends(ValidationError, _super);
    function ValidationError(message, originalError, context) {
        var _this = _super.call(this, message, 422, originalError, context) || this;
        _this.name = 'ValidationError';
        return _this;
    }
    return ValidationError;
}(GitHubError));
exports.ValidationError = ValidationError;
var ServerError = /** @class */ (function (_super) {
    __extends(ServerError, _super);
    function ServerError(message, originalError, context) {
        var _this = _super.call(this, message, 500, originalError, context) || this;
        _this.name = 'ServerError';
        return _this;
    }
    return ServerError;
}(GitHubError));
exports.ServerError = ServerError;
