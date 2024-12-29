'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileDisplay = ProfileDisplay;
var jsx_runtime_1 = require("react/jsx-runtime");
var react_1 = require("next-auth/react");
var image_1 = require("next/image");
function ProfileDisplay() {
    var _a, _b, _c;
    var _d = (0, react_1.useSession)(), session = _d.data, status = _d.status;
    if (status === 'loading') {
        return ((0, jsx_runtime_1.jsxs)("div", { className: "animate-pulse flex space-x-4", children: [(0, jsx_runtime_1.jsx)("div", { className: "rounded-full bg-muted h-12 w-12" }), (0, jsx_runtime_1.jsxs)("div", { className: "flex-1 space-y-4 py-1", children: [(0, jsx_runtime_1.jsx)("div", { className: "h-4 bg-muted rounded w-3/4" }), (0, jsx_runtime_1.jsx)("div", { className: "h-4 bg-muted rounded w-1/2" })] })] }));
    }
    if (status === 'unauthenticated') {
        return ((0, jsx_runtime_1.jsx)("p", { className: "text-muted-foreground", children: "Please sign in to view your profile." }));
    }
    return ((0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-4", children: [((_a = session === null || session === void 0 ? void 0 : session.user) === null || _a === void 0 ? void 0 : _a.image) && ((0, jsx_runtime_1.jsx)(image_1.default, { src: session.user.image, alt: "".concat(session.user.name, "'s avatar"), width: 48, height: 48, className: "rounded-full" })), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-1", children: [(0, jsx_runtime_1.jsx)("h2", { className: "font-medium", children: (_b = session === null || session === void 0 ? void 0 : session.user) === null || _b === void 0 ? void 0 : _b.name }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-muted-foreground font-mono", children: (_c = session === null || session === void 0 ? void 0 : session.user) === null || _c === void 0 ? void 0 : _c.email })] })] }));
}
