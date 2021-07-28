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
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var path_1 = __importDefault(require("path"));
var chalk_1 = __importDefault(require("chalk"));
var get_jsx_lite_config_1 = require("../helpers/get-jsx-lite-config");
var globby_1 = __importDefault(require("globby"));
var fs_extra_1 = __importDefault(require("fs-extra"));
var core_1 = require("@jsx-lite/core");
var command = {
    name: 'build',
    alias: 'b',
    run: function (toolbox) { return __awaiter(void 0, void 0, void 0, function () {
        var config, cwd, tree;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    config = __assign({ targets: [], dest: 'dist', files: 'src/*' }, get_jsx_lite_config_1.getJsxLiteConfig());
                    cwd = process.cwd();
                    return [4 /*yield*/, globby_1.default(config.files)];
                case 1:
                    tree = _a.sent();
                    return [4 /*yield*/, Promise.all(config.targets.map(function (target) { return __awaiter(void 0, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, Promise.all(tree.map(function (filePath) { return __awaiter(void 0, void 0, void 0, function () {
                                            var outPath, extension, fileContents, parsed, output, _a, info, _i, _b, file, filePath_1, info_1, outPath_1, path, info, path, output, info;
                                            var _c, _d;
                                            return __generator(this, function (_e) {
                                                switch (_e.label) {
                                                    case 0:
                                                        outPath = path_1.default.resolve(cwd, config.dest, target, filePath);
                                                        if (!(filePath.endsWith('.lite.jsx') ||
                                                            filePath.endsWith('.lite.tsx'))) return [3 /*break*/, 25];
                                                        extension = '.ts';
                                                        return [4 /*yield*/, fs_extra_1.default.readFile(filePath, 'utf8')];
                                                    case 1:
                                                        fileContents = _e.sent();
                                                        parsed = core_1.parseJsx(fileContents);
                                                        output = void 0;
                                                        _a = target;
                                                        switch (_a) {
                                                            case 'react': return [3 /*break*/, 2];
                                                            case 'vue': return [3 /*break*/, 3];
                                                            case 'angular': return [3 /*break*/, 4];
                                                            case 'svelte': return [3 /*break*/, 5];
                                                            case 'builder': return [3 /*break*/, 6];
                                                            case 'solid': return [3 /*break*/, 7];
                                                            case 'html': return [3 /*break*/, 8];
                                                            case 'webcomponents': return [3 /*break*/, 9];
                                                            case 'qwik': return [3 /*break*/, 10];
                                                        }
                                                        return [3 /*break*/, 19];
                                                    case 2:
                                                        output = core_1.componentToReact(parsed);
                                                        extension = '.tsx';
                                                        return [3 /*break*/, 20];
                                                    case 3:
                                                        output = core_1.componentToVue(parsed);
                                                        extension = '.vue';
                                                        return [3 /*break*/, 20];
                                                    case 4:
                                                        output = core_1.componentToAngular(parsed);
                                                        return [3 /*break*/, 20];
                                                    case 5:
                                                        output = core_1.componentToSvelte(parsed);
                                                        extension = '.svelte';
                                                        return [3 /*break*/, 20];
                                                    case 6:
                                                        output = JSON.stringify(core_1.componentToBuilder(parsed), null, 2);
                                                        extension = '.json';
                                                        return [3 /*break*/, 20];
                                                    case 7:
                                                        output = core_1.componentToSolid(parsed);
                                                        extension = '.tsx';
                                                        return [3 /*break*/, 20];
                                                    case 8:
                                                        output = core_1.componentToHtml(parsed);
                                                        extension = '.html';
                                                        return [3 /*break*/, 20];
                                                    case 9:
                                                        output = core_1.componentToCustomElement(parsed);
                                                        return [3 /*break*/, 20];
                                                    case 10: return [4 /*yield*/, core_1.componentToQwik(parsed, ((_d = (_c = config) === null || _c === void 0 ? void 0 : _c.options) === null || _d === void 0 ? void 0 : _d.qwik) || undefined)];
                                                    case 11:
                                                        info = _e.sent();
                                                        _i = 0, _b = info.files;
                                                        _e.label = 12;
                                                    case 12:
                                                        if (!(_i < _b.length)) return [3 /*break*/, 18];
                                                        file = _b[_i];
                                                        filePath_1 = file.path;
                                                        if (!config.mapFile) return [3 /*break*/, 14];
                                                        return [4 /*yield*/, config.mapFile({
                                                                content: file.contents,
                                                                target: target,
                                                                path: filePath_1
                                                            })];
                                                    case 13:
                                                        info_1 = _e.sent();
                                                        output = info_1.content;
                                                        if (info_1.path !== filePath_1) {
                                                            filePath_1 = info_1.path;
                                                        }
                                                        else {
                                                            filePath_1 = outPath;
                                                        }
                                                        return [3 /*break*/, 15];
                                                    case 14:
                                                        outPath_1 = path_1.default.resolve(cwd, config.dest, target, filePath_1);
                                                        filePath_1 = outPath_1.replace(/\.lite\.(j|t)sx$/, extension);
                                                        output = file.contents;
                                                        _e.label = 15;
                                                    case 15:
                                                        console.info(chalk_1.default.green('Generated:', filePath_1));
                                                        return [4 /*yield*/, fs_extra_1.default.outputFile(filePath_1, output)];
                                                    case 16:
                                                        _e.sent();
                                                        _e.label = 17;
                                                    case 17:
                                                        _i++;
                                                        return [3 /*break*/, 12];
                                                    case 18: return [2 /*return*/];
                                                    case 19: throw new Error("Unknown output target: \"" + target + ":");
                                                    case 20:
                                                        path = filePath;
                                                        if (!config.mapFile) return [3 /*break*/, 22];
                                                        return [4 /*yield*/, config.mapFile({
                                                                content: output,
                                                                target: target,
                                                                path: filePath
                                                            })];
                                                    case 21:
                                                        info = _e.sent();
                                                        output = info.content;
                                                        if (info.path !== filePath) {
                                                            path = info.path;
                                                        }
                                                        else {
                                                            path = outPath;
                                                        }
                                                        return [3 /*break*/, 23];
                                                    case 22:
                                                        path = outPath.replace(/\.lite\.(j|t)sx$/, extension);
                                                        _e.label = 23;
                                                    case 23:
                                                        console.info(chalk_1.default.green('Generated:', path));
                                                        return [4 /*yield*/, fs_extra_1.default.outputFile(path, output)];
                                                    case 24:
                                                        _e.sent();
                                                        return [3 /*break*/, 31];
                                                    case 25:
                                                        path = filePath;
                                                        return [4 /*yield*/, fs_extra_1.default.readFile(filePath, 'utf8')];
                                                    case 26:
                                                        output = _e.sent();
                                                        if (!config.mapFile) return [3 /*break*/, 29];
                                                        return [4 /*yield*/, config.mapFile({
                                                                content: output,
                                                                target: target,
                                                                path: filePath
                                                            })];
                                                    case 27:
                                                        info = _e.sent();
                                                        output = info.content;
                                                        if (info.path !== filePath) {
                                                            path = info.path;
                                                        }
                                                        else {
                                                            path = outPath;
                                                        }
                                                        return [4 /*yield*/, fs_extra_1.default.outputFile(path, output)];
                                                    case 28:
                                                        _e.sent();
                                                        return [2 /*return*/];
                                                    case 29:
                                                        console.info(chalk_1.default.green('Generated:', path));
                                                        return [4 /*yield*/, fs_extra_1.default.copy(cwd + '/' + filePath, outPath)];
                                                    case 30:
                                                        _e.sent();
                                                        _e.label = 31;
                                                    case 31: return [2 /*return*/];
                                                }
                                            });
                                        }); }))];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); }))];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); }
};
module.exports = command;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVpbGQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29tbWFuZHMvYnVpbGQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDhDQUE2QjtBQUM3QixnREFBeUI7QUFFekIsc0VBQWlFO0FBQ2pFLGtEQUEyQjtBQUMzQixzREFBeUI7QUFDekIsdUNBV3VCO0FBRXZCLElBQU0sT0FBTyxHQUFtQjtJQUM5QixJQUFJLEVBQUUsT0FBTztJQUNiLEtBQUssRUFBRSxHQUFHO0lBQ1YsR0FBRyxFQUFFLFVBQU0sT0FBTzs7Ozs7b0JBQ1YsTUFBTSxjQUNWLE9BQU8sRUFBRSxFQUFFLEVBQ1gsSUFBSSxFQUFFLE1BQU0sRUFDWixLQUFLLEVBQUUsT0FBTyxJQUNYLHNDQUFnQixFQUFFLENBQ3RCLENBQUE7b0JBQ0ssR0FBRyxHQUFHLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQTtvQkFFWixxQkFBTSxnQkFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsRUFBQTs7b0JBQWpDLElBQUksR0FBRyxTQUEwQjtvQkFDdkMscUJBQU0sT0FBTyxDQUFDLEdBQUcsQ0FDZixNQUFNLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFNLE1BQU07Ozs0Q0FDN0IscUJBQU0sT0FBTyxDQUFDLEdBQUcsQ0FDZixJQUFJLENBQUMsR0FBRyxDQUFDLFVBQU0sUUFBUTs7Ozs7O3dEQUNmLE9BQU8sR0FBRyxjQUFVLENBQUMsT0FBTyxDQUNoQyxHQUFHLEVBQ0gsTUFBTSxDQUFDLElBQUksRUFDWCxNQUFNLEVBQ04sUUFBUSxDQUNULENBQUE7NkRBRUMsQ0FBQSxRQUFRLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQzs0REFDOUIsUUFBUSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQSxFQUQ5Qix5QkFDOEI7d0RBRzFCLFNBQVMsR0FBRyxLQUFLLENB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