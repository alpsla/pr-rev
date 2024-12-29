"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cache = void 0;
var Cache = /** @class */ (function () {
    function Cache(options) {
        this.cache = new Map();
        this.ttl = options.ttl;
        this.maxSize = options.maxSize || 1000;
    }
    Cache.prototype.set = function (key, value) {
        if (this.cache.size >= this.maxSize) {
            this.evictOldest();
        }
        this.cache.set(key, {
            data: value,
            timestamp: Date.now()
        });
    };
    Cache.prototype.get = function (key) {
        var item = this.cache.get(key);
        if (!item)
            return null;
        if (this.isExpired(item.timestamp)) {
            this.cache.delete(key);
            return null;
        }
        return item.data;
    };
    Cache.prototype.isExpired = function (timestamp) {
        return Date.now() - timestamp > this.ttl;
    };
    Cache.prototype.evictOldest = function () {
        var oldest = __spreadArray([], this.cache.entries(), true).sort(function (_a, _b) {
            var a = _a[1];
            var b = _b[1];
            return a.timestamp - b.timestamp;
        })[0];
        if (oldest) {
            this.cache.delete(oldest[0]);
        }
    };
    return Cache;
}());
exports.Cache = Cache;
