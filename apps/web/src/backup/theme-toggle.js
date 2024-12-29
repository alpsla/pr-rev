"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThemeToggle = ThemeToggle;
var jsx_runtime_1 = require("react/jsx-runtime");
var React = require("react");
var lucide_react_1 = require("lucide-react");
var next_themes_1 = require("next-themes");
var button_1 = require("@/components/ui/button");
function ThemeToggle() {
    var _a = (0, next_themes_1.useTheme)(), theme = _a.theme, setTheme = _a.setTheme;
    var _b = React.useState(false), mounted = _b[0], setMounted = _b[1];
    React.useEffect(function () {
        setMounted(true);
    }, []);
    if (!mounted) {
        return ((0, jsx_runtime_1.jsx)(button_1.Button, { variant: "ghost", size: "icon", className: "h-9 w-9 text-muted-foreground hover:text-foreground", children: (0, jsx_runtime_1.jsx)("div", { className: "h-[1.2rem] w-[1.2rem]" }) }));
    }
    var toggleTheme = function () {
        setTheme(theme === "light" ? "dark" : "light");
    };
    return ((0, jsx_runtime_1.jsx)(button_1.Button, { variant: "ghost", size: "icon", onClick: toggleTheme, className: "h-9 w-9 text-muted-foreground hover:text-foreground", children: theme === "light" ? ((0, jsx_runtime_1.jsx)(lucide_react_1.Moon, { className: "h-[1.2rem] w-[1.2rem]" })) : ((0, jsx_runtime_1.jsx)(lucide_react_1.Sun, { className: "h-[1.2rem] w-[1.2rem]" })) }));
}
