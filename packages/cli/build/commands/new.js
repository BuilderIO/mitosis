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
Object.defineProperty(exports, "__esModule", { value: true });
var command = {
    name: 'new',
    alias: 'n',
    description: 'jsx-lite new [options]',
    run: function (toolbox) {
        return __awaiter(this, void 0, void 0, function () {
            function exec(cmd, opts) {
                return __awaiter(this, void 0, void 0, function () {
                    var result, e_1;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                _a.trys.push([0, 2, , 3]);
                                return [4 /*yield*/, sys.exec(cmd, opts)];
                            case 1:
                                result = _a.sent();
                                result.stdout && print.info(result.stdout);
                                return [3 /*break*/, 3];
                            case 2:
                                e_1 = _a.sent();
                                print.error("Command failed with exit code " + e_1.exitCode + ": " + e_1.command);
                                e_1.stdout && print.error(e_1.stdout);
                                e_1.stderr && print.error(e_1.stderr);
                                process.exit(1);
                                return [3 /*break*/, 3];
                            case 3: return [2 /*return*/];
                        }
                    });
                });
            }
            var sys, pkg, print, spinner;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        sys = toolbox.system;
                        pkg = toolbox.packageManager;
                        print = toolbox.print;
                        spinner = print.spin({});
                        spinner.start('Creating new project');
                        return [4 /*yield*/, exec('npm init -y')];
                    case 1:
                        _a.sent();
                        spinner.succeed('Wrote package.json');
                        spinner.start('Installing packages');
                        return [4 /*yield*/, pkg.add(['@jsx-lite/core', '@jsx-lite/cli', 'typescript'], {
                                dev: true,
                                force: 'npm'
                            })];
                    case 2:
                        _a.sent();
                        spinner.succeed('Installed packages');
                        toolbox.template.generate({
                            template: 'tsconfig.json.ejs',
                            target: 'tsconfig.json'
                        });
                        spinner.succeed('Wrote tsconfig.json');
                        toolbox.template.generate({
                            template: 'jsx-lite.config.js.ejs',
                            target: 'jsx-lite.config.js'
                        });
                        spinner.succeed('Wrote jsx-lite.config.js ');
                        toolbox.template.generate({
                            template: 'component.lite.tsx.ejs',
                            target: 'src/component.lite.tsx'
                        });
                        spinner.succeed('Wrote src/component.lite.tsx');
                        spinner.stopAndPersist({ text: 'Done!' });
                        return [2 /*return*/];
                }
            });
        });
    }
};
exports.default = command;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmV3LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NvbW1hbmRzL25ldy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVBLElBQU0sT0FBTyxHQUFtQjtJQUM5QixJQUFJLEVBQUUsS0FBSztJQUNYLEtBQUssRUFBRSxHQUFHO0lBQ1YsV0FBVyxFQUFFLHdCQUF3QjtJQUMvQixHQUFHLEVBQVQsVUFBVSxPQUFPOztZQUtmLFNBQWUsSUFBSSxDQUFDLEdBQUcsRUFBRSxJQUFLOzs7Ozs7O2dDQUVYLHFCQUFNLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxFQUFBOztnQ0FBbEMsTUFBTSxHQUFHLFNBQXlCO2dDQUN4QyxNQUFNLENBQUMsTUFBTSxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFBOzs7O2dDQUUxQyxLQUFLLENBQUMsS0FBSyxDQUFDLG1DQUFpQyxHQUFDLENBQUMsUUFBUSxVQUFLLEdBQUMsQ0FBQyxPQUFTLENBQUMsQ0FBQTtnQ0FDeEUsR0FBQyxDQUFDLE1BQU0sSUFBSSxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQTtnQ0FDakMsR0FBQyxDQUFDLE1BQU0sSUFBSSxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQTtnQ0FDakMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQTs7Ozs7O2FBRWxCOzs7Ozt3QkFkSyxHQUFHLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQTt3QkFDcEIsR0FBRyxHQUFHLE9BQU8sQ0FBQyxjQUFjLENBQUE7d0JBQzVCLEtBQUssR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFBO3dCQWVyQixPQUFPLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQTt3QkFFOUIsT0FBTyxDQUFDLEtBQUssQ0FBQyxzQkFBc0IsQ0FBQyxDQUFBO3dCQUVyQyxxQkFBTSxJQUFJLENBQUMsYUFBYSxDQUFDLEVBQUE7O3dCQUF6QixTQUF5QixDQUFBO3dCQUV6QixPQUFPLENBQUMsT0FBTyxDQUFDLG9CQUFvQixDQUFDLENBQUE7d0JBRXJDLE9BQU8sQ0FBQyxLQUFLLENBQUMscUJBQXFCLENBQUMsQ0FBQTt3QkFFcEMscUJBQU0sR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLGdCQUFnQixFQUFFLGVBQWUsRUFBRSxZQUFZLENBQUMsRUFBRTtnQ0FDL0QsR0FBRyxFQUFFLElBQUk7Z0NBQ1QsS0FBSyxFQUFFLEtBQUs7NkJBQ2IsQ0FBQyxFQUFBOzt3QkFIRixTQUdFLENBQUE7d0JBRUYsT0FBTyxDQUFDLE9BQU8sQ0FBQyxvQkFBb0IsQ0FBQyxDQUFBO3dCQUVyQyxPQUFPLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQzs0QkFDeEIsUUFBUSxFQUFFLG1CQUFtQjs0QkFDN0IsTUFBTSxFQUFFLGVBQWU7eUJBQ3hCLENBQUMsQ0FBQTt3QkFFRixPQUFPLENBQUMsT0FBTyxDQUFDLHFCQUFxQixDQUFDLENBQUE7d0JBRXRDLE9BQU8sQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDOzRCQUN4QixRQUFRLEVBQUUsd0JBQXdCOzRCQUNsQyxNQUFNLEVBQUUsb0JBQW9CO3lCQUM3QixDQUFDLENBQUE7d0JBRUYsT0FBTyxDQUFDLE9BQU8sQ0FBQywyQkFBMkIsQ0FBQyxDQUFBO3dCQUU1QyxPQUFPLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQzs0QkFDeEIsUUFBUSxFQUFFLHdCQUF3Qjs0QkFDbEMsTUFBTSxFQUFFLHdCQUF3Qjt5QkFDakMsQ0FBQyxDQUFBO3dCQUVGLE9BQU8sQ0FBQyxPQUFPLENBQUMsOEJBQThCLENBQUMsQ0FBQTt3QkFFL0MsT0FBTyxDQUFDLGNBQWMsQ0FBQyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFBO3dCQUV6QyxzQkFBTTs7OztLQUNQO0NBQ0YsQ0FBQTtBQUVELGtCQUFlLE9BQU8sQ0FBQSJ9