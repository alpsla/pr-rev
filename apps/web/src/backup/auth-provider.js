'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AuthProvider;
var jsx_runtime_1 = require("react/jsx-runtime");
var react_1 = require("next-auth/react");
function AuthProvider(_a) {
    var children = _a.children;
    return (0, jsx_runtime_1.jsx)(react_1.SessionProvider, { children: children });
}
