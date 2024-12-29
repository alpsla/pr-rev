"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var PrismaClient = require('@prisma/client').PrismaClient;
var UILanguage = require('@prisma/client').UILanguage;
var prisma = new PrismaClient();
var translations = {
    common: {
        submit: {
            en: 'Submit',
            es: 'Enviar',
            fr: 'Soumettre',
            de: 'Einreichen',
            it: 'Invia',
            pt: 'Enviar',
            ja: '送信',
            ko: '제출',
            zh_cn: '提交',
            zh_tw: '提交'
        },
        cancel: {
            en: 'Cancel',
            es: 'Cancelar',
            fr: 'Annuler',
            de: 'Abbrechen',
            it: 'Annulla',
            pt: 'Cancelar',
            ja: 'キャンセル',
            ko: '취소',
            zh_cn: '取消',
            zh_tw: '取消'
        }
    },
    pr_review: {
        analyze: {
            en: 'Analyze Pull Request',
            es: 'Analizar Pull Request',
            fr: 'Analyser la Pull Request',
            de: 'Pull Request analysieren',
            it: 'Analizza Pull Request',
            pt: 'Analisar Pull Request',
            ja: 'プルリクエストを分析',
            ko: '풀 리퀘스트 분석',
            zh_cn: '分析拉取请求',
            zh_tw: '分析拉取請求'
        }
    }
};
var languageMap = {
    'en': 'EN',
    'es': 'ES',
    'fr': 'FR',
    'de': 'DE',
    'it': 'IT',
    'pt': 'PT',
    'ja': 'JA',
    'ko': 'KO',
    'zh_cn': 'ZH_CN',
    'zh_tw': 'ZH_TW'
};
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var _i, _a, _b, category, categoryData, _c, _d, _e, key, translationSet, _f, _g, _h, lang, value;
        return __generator(this, function (_j) {
            switch (_j.label) {
                case 0: 
                // Clear existing data
                return [4 /*yield*/, prisma.localeSettings.deleteMany()
                    // Insert translations
                ];
                case 1:
                    // Clear existing data
                    _j.sent();
                    _i = 0, _a = Object.entries(translations);
                    _j.label = 2;
                case 2:
                    if (!(_i < _a.length)) return [3 /*break*/, 9];
                    _b = _a[_i], category = _b[0], categoryData = _b[1];
                    _c = 0, _d = Object.entries(categoryData);
                    _j.label = 3;
                case 3:
                    if (!(_c < _d.length)) return [3 /*break*/, 8];
                    _e = _d[_c], key = _e[0], translationSet = _e[1];
                    _f = 0, _g = Object.entries(translationSet);
                    _j.label = 4;
                case 4:
                    if (!(_f < _g.length)) return [3 /*break*/, 7];
                    _h = _g[_f], lang = _h[0], value = _h[1];
                    return [4 /*yield*/, prisma.localeSettings.create({
                            data: {
                                language: languageMap[lang],
                                key: "".concat(category, ".").concat(key),
                                value: value,
                                category: category,
                                description: "Translation for ".concat(category, ".").concat(key)
                            }
                        })];
                case 5:
                    _j.sent();
                    _j.label = 6;
                case 6:
                    _f++;
                    return [3 /*break*/, 4];
                case 7:
                    _c++;
                    return [3 /*break*/, 3];
                case 8:
                    _i++;
                    return [3 /*break*/, 2];
                case 9:
                    console.log('Seed data inserted successfully!');
                    return [2 /*return*/];
            }
        });
    });
}
main()
    .catch(function (e) {
    console.error(e);
    process.exit(1);
})
    .finally(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma.$disconnect()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
