"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToastProvider = ToastProvider;
var jsx_runtime_1 = require("react/jsx-runtime");
var toaster_1 = require("@/components/ui/toaster");
function ToastProvider(_a) {
    var children = _a.children;
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [children, (0, jsx_runtime_1.jsx)(toaster_1.Toaster, {})] }));
}
