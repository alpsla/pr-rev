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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AvatarFallback = exports.AvatarImage = exports.Avatar = void 0;
var jsx_runtime_1 = require("react/jsx-runtime");
var React = require("react");
var AvatarPrimitive = require("@radix-ui/react-avatar");
var utils_1 = require("@/lib/utils");
var Avatar = React.forwardRef(function (_a, ref) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return ((0, jsx_runtime_1.jsxs)(AvatarPrimitive.Root, __assign({ ref: ref, className: (0, utils_1.cn)("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full", className) }, props, { children: [(0, jsx_runtime_1.jsx)(AvatarPrimitive.Image, { className: (0, utils_1.cn)("aspect-square h-full w-full") }), (0, jsx_runtime_1.jsx)(AvatarPrimitive.Fallback, { className: (0, utils_1.cn)("flex h-full w-full items-center justify-center rounded-full bg-muted"), children: (0, jsx_runtime_1.jsx)("span", { className: (0, utils_1.cn)("text-xs font-medium text-muted"), children: "JL" }) })] })));
});
exports.Avatar = Avatar;
Avatar.displayName = AvatarPrimitive.Root.displayName;
var AvatarImage = React.forwardRef(function (_a, ref) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return ((0, jsx_runtime_1.jsx)(AvatarPrimitive.Image, __assign({ ref: ref, className: (0, utils_1.cn)("aspect-square h-full w-full", className) }, props)));
});
exports.AvatarImage = AvatarImage;
AvatarImage.displayName = AvatarPrimitive.Image.displayName;
var AvatarFallback = React.forwardRef(function (_a, ref) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return ((0, jsx_runtime_1.jsx)(AvatarPrimitive.Fallback, __assign({ ref: ref, className: (0, utils_1.cn)("flex h-full w-full items-center justify-center rounded-full bg-muted", className) }, props)));
});
exports.AvatarFallback = AvatarFallback;
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;
