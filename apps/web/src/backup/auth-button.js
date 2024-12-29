'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthButton = AuthButton;
var jsx_runtime_1 = require("react/jsx-runtime");
var react_1 = require("next-auth/react");
var button_1 = require("@/components/ui/button");
var lucide_react_1 = require("lucide-react");
var skeleton_1 = require("@/components/ui/skeleton");
function AuthButton() {
    var _a = (0, react_1.useSession)(), session = _a.data, status = _a.status;
    if (status === 'loading') {
        return (0, jsx_runtime_1.jsx)(skeleton_1.Skeleton, { className: "h-10 w-[120px]" });
    }
    if (session) {
        return ((0, jsx_runtime_1.jsxs)(button_1.Button, { variant: "outline", onClick: function () { return (0, react_1.signOut)(); }, className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.LogOutIcon, { className: "h-4 w-4" }), "Sign Out"] }));
    }
    return ((0, jsx_runtime_1.jsxs)(button_1.Button, { onClick: function () { return (0, react_1.signIn)('github'); }, className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.GithubIcon, { className: "h-4 w-4" }), "Sign in with GitHub"] }));
}
