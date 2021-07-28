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
Object.defineProperty(exports, "__esModule", { value: true });
var path = __importStar(require("path"));
var gluegun_1 = require("gluegun");
var version = require('../../package.json').version;
var root = gluegun_1.filesystem.path(__dirname, '..', '..');
var script = gluegun_1.filesystem.path(root, 'bin', 'jsx-lite');
var cli = function (cmd) { return __awaiter(void 0, void 0, void 0, function () {
    var shcmd;
    return __generator(this, function (_a) {
        shcmd = "node " + script + " " + cmd;
        console.debug("Running: " + shcmd);
        return [2 /*return*/, gluegun_1.system.run(shcmd)];
    });
}); };
test('outputs version', function () { return __awaiter(void 0, void 0, void 0, function () {
    var output;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, cli('--version')];
            case 1:
                output = _a.sent();
                expect(output).toContain(version);
                return [2 /*return*/];
        }
    });
}); });
test('outputs help', function () { return __awaiter(void 0, void 0, void 0, function () {
    var output;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, cli('--help')];
            case 1:
                output = _a.sent();
                expect(output).toContain(version);
                return [2 /*return*/];
        }
    });
}); });
// TODO refactor commands/compile.ts to not have side effects (like calling
// process.exit) so that this can be unit tested instead.
test('strips out builder components by default', function () { return __awaiter(void 0, void 0, void 0, function () {
    var filepath, output;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                filepath = path.resolve(__dirname, 'data/triptych.builder.json');
                return [4 /*yield*/, cli("compile --from=builder --to=react " + filepath)];
            case 1:
                output = _a.sent();
                expect(output).toContain('export default function MyComponent(props) {');
                expect(output).not.toContain('<Columns');
                expect(output).not.toContain('<Column');
                expect(output).not.toContain('<Image');
                expect(output).toContain('<img');
                return [2 /*return*/];
        }
    });
}); });
test('--builder-components keeps builder components', function () { return __awaiter(void 0, void 0, void 0, function () {
    var filepath, output;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                filepath = path.resolve(__dirname, 'data/triptych.builder.json');
                return [4 /*yield*/, cli("compile --builder-components --from=builder --to=react " + filepath)];
            case 1:
                output = _a.sent();
                expect(output).toContain('export default function MyComponent(props) {');
                expect(output).toContain('<Columns');
                expect(output).toContain('<Column');
                expect(output).toContain('<Image');
                expect(output).not.toContain('<img');
                return [2 /*return*/];
        }
    });
}); });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLWludGVncmF0aW9uLnRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvX190ZXN0c19fL2NsaS1pbnRlZ3JhdGlvbi50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLHlDQUE0QjtBQUM1QixtQ0FBNEM7QUFFcEMsSUFBQSxPQUFPLEdBQUssT0FBTyxDQUFDLG9CQUFvQixDQUFDLFFBQWxDLENBQWtDO0FBRWpELElBQU0sSUFBSSxHQUFHLG9CQUFVLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUE7QUFDbkQsSUFBTSxNQUFNLEdBQUcsb0JBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxVQUFVLENBQUMsQ0FBQTtBQUV2RCxJQUFNLEdBQUcsR0FBRyxVQUFPLEdBQVc7OztRQUN0QixLQUFLLEdBQUcsVUFBUSxNQUFNLFNBQUksR0FBSyxDQUFBO1FBQ3JDLE9BQU8sQ0FBQyxLQUFLLENBQUMsY0FBWSxLQUFPLENBQUMsQ0FBQTtRQUNsQyxzQkFBTyxnQkFBTSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsRUFBQTs7S0FDekIsQ0FBQTtBQUVELElBQUksQ0FBQyxpQkFBaUIsRUFBRTs7OztvQkFDUCxxQkFBTSxHQUFHLENBQUMsV0FBVyxDQUFDLEVBQUE7O2dCQUEvQixNQUFNLEdBQUcsU0FBc0I7Z0JBQ3JDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUE7Ozs7S0FDbEMsQ0FBQyxDQUFBO0FBRUYsSUFBSSxDQUFDLGNBQWMsRUFBRTs7OztvQkFDSixxQkFBTSxHQUFHLENBQUMsUUFBUSxDQUFDLEVBQUE7O2dCQUE1QixNQUFNLEdBQUcsU0FBbUI7Z0JBQ2xDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUE7Ozs7S0FDbEMsQ0FBQyxDQUFBO0FBRUYsMkVBQTJFO0FBQzNFLHlEQUF5RDtBQUN6RCxJQUFJLENBQUMsMENBQTBDLEVBQUU7Ozs7O2dCQUN6QyxRQUFRLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsNEJBQTRCLENBQUMsQ0FBQTtnQkFFdkQscUJBQU0sR0FBRyxDQUFDLHVDQUFxQyxRQUFVLENBQUMsRUFBQTs7Z0JBQW5FLE1BQU0sR0FBRyxTQUEwRDtnQkFFekUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLFNBQVMsQ0FBQyw4Q0FBOEMsQ0FBQyxDQUFBO2dCQUN4RSxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQTtnQkFDeEMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUE7Z0JBQ3ZDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFBO2dCQUN0QyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFBOzs7O0tBQ2pDLENBQUMsQ0FBQTtBQUVGLElBQUksQ0FBQywrQ0FBK0MsRUFBRTs7Ozs7Z0JBQzlDLFFBQVEsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSw0QkFBNEIsQ0FBQyxDQUFBO2dCQUV2RCxxQkFBTSxHQUFHLENBQ3RCLDREQUEwRCxRQUFVLENBQ3JFLEVBQUE7O2dCQUZLLE1BQU0sR0FBRyxTQUVkO2dCQUVELE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxTQUFTLENBQUMsOENBQThDLENBQUMsQ0FBQTtnQkFDeEUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQTtnQkFDcEMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQTtnQkFDbkMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQTtnQkFDbEMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUE7Ozs7S0FDckMsQ0FBQyxDQUFBIn0=