"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
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
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
    function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@jsx-lite/core");
var path_1 = require("path");
var targets = __importStar(require("../targets"));
var command = {
    name: 'compile',
    alias: 'c',
    run: function (toolbox) { return __awaiter(void 0, void 0, void 0, function () {
        function readFiles() {
            return __asyncGenerator(this, arguments, function readFiles_1() {
                var data, _i, paths_1, path, data;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!isStdin) return [3 /*break*/, 4];
                            return [4 /*yield*/, __await(readStdin())];
                        case 1:
                            data = _a.sent();
                            return [4 /*yield*/, __await({ data: data })];
                        case 2: return [4 /*yield*/, _a.sent()];
                        case 3:
                            _a.sent();
                            _a.label = 4;
                        case 4:
                            _i = 0, paths_1 = paths;
                            _a.label = 5;
                        case 5:
                            if (!(_i < paths_1.length)) return [3 /*break*/, 9];
                            path = paths_1[_i];
                            if (filesystem.exists(path) !== 'file') {
                                print.error("\"" + path + "\" is not a file");
                                process.exit(1);
                            }
                            data = filesystem.read(path);
                            return [4 /*yield*/, __await({ path: path, data: data })];
                        case 6: return [4 /*yield*/, _a.sent()];
                        case 7:
                            _a.sent();
                            _a.label = 8;
                        case 8:
                            _i++;
                            return [3 /*break*/, 5];
                        case 9: return [2 /*return*/];
                    }
                });
            });
        }
        var parameters, strings, filesystem, print, opts, from_, to, out, force, dryRun, outDir, header, plugins, generatorOpts, paths, isStdin, generator, _a, _b, _c, data, path, output, json, isJSON, e_1_1;
        var e_1, _d;
        var _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
        return __generator(this, function (_q) {
            switch (_q.label) {
                case 0:
                    parameters = toolbox.parameters, strings = toolbox.strings, filesystem = toolbox.filesystem, print = toolbox.print;
                    opts = parameters.options;
                    if ((_f = (_e = opts.l) !== null && _e !== void 0 ? _e : opts.list) !== null && _f !== void 0 ? _f : false) {
                        return [2 /*return*/, listTargets()];
                    }
                    from_ = strings.camelCase((_h = (_g = opts.f) !== null && _g !== void 0 ? _g : opts.from) !== null && _h !== void 0 ? _h : 'jsxLite');
                    to = strings.camelCase((_j = opts.t) !== null && _j !== void 0 ? _j : opts.to);
                    out = (_k = opts.o) !== null && _k !== void 0 ? _k : opts.out;
                    force = (_l = opts.force) !== null && _l !== void 0 ? _l : false;
                    dryRun = (_o = (_m = opts.dryRun) !== null && _m !== void 0 ? _m : opts.n) !== null && _o !== void 0 ? _o : false;
                    outDir = opts.outDir;
                    header = opts.header;
                    plugins = [];
                    if (!opts.builderComponents) {
                        plugins.push(core_1.compileAwayBuilderComponents());
                    }
                    generatorOpts = {
                        prettier: (_p = opts.prettier) !== null && _p !== void 0 ? _p : true,
                        plugins: plugins,
                        format: opts.format,
                        prefix: opts.prefix,
                        includeIds: opts.includeIds,
                        stylesType: opts.styles,
                        stateType: opts.state,
                        reactive: opts.reactive
                    };
                    paths = parameters.array;
                    isStdin = parameters.first === '-' || paths.length === 0;
                    // Input validations
                    // Validate that "--to" is supported
                    if (!isTarget(to)) {
                        console.error("no matching output target for \"" + to + "\"");
                        process.exit(1);
                    }
                    generator = targets[to];
                    if (out && paths.length > 1) {
                        console.error("--out doesn't support multiple input files, did you mean --outDir?");
                        process.exit(1);
                    }
                    _q.label = 1;
                case 1:
                    _q.trys.push([1, 6, 7, 12]);
                    _a = __asyncValues(readFiles());
                    _q.label = 2;
                case 2: return [4 /*yield*/, _a.next()];
                case 3:
                    if (!(_b = _q.sent(), !_b.done)) return [3 /*break*/, 5];
                    _c = _b.value, data = _c.data, path = _c.path;
                    output = void 0;
                    if (outDir) {
                        out = path_1.join(outDir, path);
                    }
                    // Validate that "--out" file doesn't already exist
                    if (force === false && out && filesystem.exists(out) === 'file') {
                        print.error(out + " already exists. Use --force if you want to overwrite existing files.");
                        process.exit(1);
                    }
                    try {
                        json = void 0;
                        switch (from_) {
                            case 'jsxLite':
                                json = core_1.parseJsx(data);
                                break;
                            case 'builder':
                                json = core_1.builderContentToJsxLiteComponent(JSON.parse(data));
                                break;
                            default:
                                print.error(from_ + " is not a valid input type");
                                process.exit(1);
                        }
                        // TODO validate generator options
                        output = generator(json, generatorOpts);
                    }
                    catch (e) {
                        print.divider();
                        print.info("Path: " + path);
                        print.divider();
                        print.info('Error:');
                        print.error(e);
                        process.exit(1);
                    }
                    isJSON = typeof output === 'object';
                    if (!isJSON) {
                        output = header ? header + "\n" + output : output;
                    }
                    if (!out) {
                        if (isJSON) {
                            console.log(JSON.stringify(output, null, 2));
                            return [2 /*return*/];
                        }
                        console.log(output);
                        return [2 /*return*/];
                    }
                    print.info(out);
                    if (!dryRun) {
                        filesystem.write(out, output);
                    }
                    _q.label = 4;
                case 4: return [3 /*break*/, 2];
                case 5: return [3 /*break*/, 12];
                case 6:
                    e_1_1 = _q.sent();
                    e_1 = { error: e_1_1 };
                    return [3 /*break*/, 12];
                case 7:
                    _q.trys.push([7, , 10, 11]);
                    if (!(_b && !_b.done && (_d = _a.return))) return [3 /*break*/, 9];
                    return [4 /*yield*/, _d.call(_a)];
                case 8:
                    _q.sent();
                    _q.label = 9;
                case 9: return [3 /*break*/, 11];
                case 10:
                    if (e_1) throw e_1.error;
                    return [7 /*endfinally*/];
                case 11: return [7 /*endfinally*/];
                case 12: return [2 /*return*/];
            }
        });
    }); }
};
module.exports = command;
/**
 * List all targets (args to --to). This could be moved to it's own command at
 * some point depending on the desired API.
 */
function listTargets() {
    for (var _i = 0, _a = Object.keys(targets); _i < _a.length; _i++) {
        var prop = _a[_i];
        console.log(prop);
    }
    return;
}
function isTarget(term) {
    return typeof targets[term] !== 'undefined';
}
function readStdin() {
    return __awaiter(this, void 0, void 0, function () {
        var chunks;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    chunks = [];
                    return [4 /*yield*/, new Promise(function (res) {
                            return process.stdin
                                .on('data', function (data) {
                                return chunks.push(data);
                            })
                                .on('end', function () {
                                return res(true);
                            });
                        })];
                case 1:
                    _a.sent();
                    return [2 /*return*/, Buffer.concat(chunks).toString('utf-8')];
            }
        });
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcGlsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21tYW5kcy9jb21waWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSx1Q0FLdUI7QUFFdkIsNkJBQTJCO0FBQzNCLGtEQUFxQztBQVlyQyxJQUFNLE9BQU8sR0FBbUI7SUFDOUIsSUFBSSxFQUFFLFNBQVM7SUFDZixLQUFLLEVBQUUsR0FBRztJQUNWLEdBQUcsRUFBRSxVQUFNLE9BQU87UUEwRGhCLFNBQWdCLFNBQVM7Ozs7OztpQ0FDbkIsT0FBTyxFQUFQLHdCQUFPOzRCQUNJLDZCQUFNLFNBQVMsRUFBRSxHQUFBOzs0QkFBeEIsSUFBSSxHQUFHLFNBQWlCO3lEQUN4QixFQUFFLElBQUksTUFBQSxFQUFFO2dDQUFkLGdDQUFjOzs0QkFBZCxTQUFjLENBQUE7OztrQ0FFUSxFQUFMLGVBQUs7OztpQ0FBTCxDQUFBLG1CQUFLLENBQUE7NEJBQWIsSUFBSTs0QkFDYixJQUFJLFVBQVUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssTUFBTSxFQUFFO2dDQUN0QyxLQUFLLENBQUMsS0FBSyxDQUFDLE9BQUksSUFBSSxxQkFBaUIsQ0FBQyxDQUFBO2dDQUN0QyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFBOzZCQUNoQjs0QkFDSyxJQUFJLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTt5REFDNUIsRUFBRSxJQUFJLE1BQUEsRUFBRSxJQUFJLE1BQUEsRUFBRTtnQ0FBcEIsZ0NBQW9COzs0QkFBcEIsU0FBb0IsQ0FBQTs7OzRCQU5ILElBQUssQ0FBQTs7Ozs7O1NBUXpCOzs7Ozs7O29CQXRFTyxVQUFVLEdBQWlDLE9BQU8sV0FBeEMsRUFBRSxPQUFPLEdBQXdCLE9BQU8sUUFBL0Is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