"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cn = cn;
function cn() {
    var inputs = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        inputs[_i] = arguments[_i];
    }
    return inputs.filter(Boolean).join(" ");
}
