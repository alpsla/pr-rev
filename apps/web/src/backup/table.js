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
exports.TableCaption = exports.TableCell = exports.TableRow = exports.TableHead = exports.TableFooter = exports.TableBody = exports.TableHeader = exports.Table = void 0;
var jsx_runtime_1 = require("react/jsx-runtime");
var React = require("react");
var utils_1 = require("@/lib/utils");
var Table = React.forwardRef(function (_a, ref) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return ((0, jsx_runtime_1.jsx)("div", { className: "relative w-full overflow-auto", children: (0, jsx_runtime_1.jsxs)("table", __assign({ ref: ref, className: (0, utils_1.cn)("w-full caption-bottom text-sm", className) }, props, { children: [(0, jsx_runtime_1.jsx)(TableHeader, { children: (0, jsx_runtime_1.jsxs)(TableRow, { children: [(0, jsx_runtime_1.jsx)(TableHead, { children: "Column 1" }), (0, jsx_runtime_1.jsx)(TableHead, { children: "Column 2" }), (0, jsx_runtime_1.jsx)(TableHead, { children: "Column 3" })] }) }), (0, jsx_runtime_1.jsxs)(TableBody, { children: [(0, jsx_runtime_1.jsxs)(TableRow, { children: [(0, jsx_runtime_1.jsx)(TableCell, { children: "Cell 1" }), (0, jsx_runtime_1.jsx)(TableCell, { children: "Cell 2" }), (0, jsx_runtime_1.jsx)(TableCell, { children: "Cell 3" })] }), (0, jsx_runtime_1.jsxs)(TableRow, { children: [(0, jsx_runtime_1.jsx)(TableCell, { children: "Cell 4" }), (0, jsx_runtime_1.jsx)(TableCell, { children: "Cell 5" }), (0, jsx_runtime_1.jsx)(TableCell, { children: "Cell 6" })] })] })] })) }));
});
exports.Table = Table;
Table.displayName = "Table";
var TableHeader = React.forwardRef(function (_a, ref) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return ((0, jsx_runtime_1.jsx)("thead", __assign({ ref: ref, className: (0, utils_1.cn)("[&_tr]:border-b", className) }, props)));
});
exports.TableHeader = TableHeader;
TableHeader.displayName = "TableHeader";
var TableBody = React.forwardRef(function (_a, ref) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return ((0, jsx_runtime_1.jsx)("tbody", __assign({ ref: ref, className: (0, utils_1.cn)("[&_tr:last-child]:border-0", className) }, props)));
});
exports.TableBody = TableBody;
TableBody.displayName = "TableBody";
var TableFooter = React.forwardRef(function (_a, ref) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return ((0, jsx_runtime_1.jsx)("tfoot", __assign({ ref: ref, className: (0, utils_1.cn)("border-t bg-muted/50 font-medium [&>tr]:last:border-b-0", className) }, props)));
});
exports.TableFooter = TableFooter;
TableFooter.displayName = "TableFooter";
var TableRow = React.forwardRef(function (_a, ref) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return ((0, jsx_runtime_1.jsx)("tr", __assign({ ref: ref, className: (0, utils_1.cn)("border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted", className) }, props)));
});
exports.TableRow = TableRow;
TableRow.displayName = "TableRow";
var TableHead = React.forwardRef(function (_a, ref) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return ((0, jsx_runtime_1.jsx)("th", __assign({ ref: ref, className: (0, utils_1.cn)("h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0", className) }, props)));
});
exports.TableHead = TableHead;
TableHead.displayName = "TableHead";
var TableCell = React.forwardRef(function (_a, ref) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return ((0, jsx_runtime_1.jsx)("td", __assign({ ref: ref, className: (0, utils_1.cn)("p-4 align-middle [&:has([role=checkbox])]:pr-0", className) }, props)));
});
exports.TableCell = TableCell;
TableCell.displayName = "TableCell";
var TableCaption = React.forwardRef(function (_a, ref) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return ((0, jsx_runtime_1.jsx)("caption", __assign({ ref: ref, className: (0, utils_1.cn)("mt-4 text-sm text-muted-foreground", className) }, props)));
});
exports.TableCaption = TableCaption;
TableCaption.displayName = "TableCaption";
