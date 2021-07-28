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
var gluegun_1 = require("gluegun");
var help = function (toolbox) {
    return toolbox.print.info(
    // TODO: break docs up by command
    ("\njsx-lite command line component processor [version " + toolbox.meta.version() + "]\n\nUSAGE\n\tjsx-lite compile --to=<format> [options] [files]\n\tjsx-lite compile -t=<format> [options] [files]\n\n\tIf no [input-files] are specified or when [files] is \"-\", input\n\tis read from standard input.\n\nEXAMPLES\n\tjsx-lite compile -t react component.tsx\n\tjsx-lite compile -t react < component.tsx\n\tcat component.tsx | jsx-lite compile -t html -\n\tjsx-lite compile -t react --out-dir build -- src/**/*.tsx\n\nOPTIONS\n\t--to=<format>, -t=<format>\n\t\tSpecify output format. <format> can be one of:\n\t\t\n\t\t- reactNative\n\t\t- solid\n\t\t- vue\n\t\t- react\n\t\t- template\n\t\t- html\n\t\t- customElement\n\t\t- jsxLite\n\t\t- builder\n\t\t- swift\n\t\t- svelte\n\t\t- liquid\n\t\t- angular\n\t--from=<format>, -f=<format>\n\t\tSpecify input format. <format> can be one of:\n\t\t\n\t\t- jsxLite\n\t\t- builder\n\t\t- liquid\n\t--list, -l\n\t\tList available output formats.\n\nOUTPUT OPTIONS\n\t--out=<file>, -o=<file>\n\t\tEmit output to a single file\n\t--out-dir=<dir>\n\t\tRedirect output structure to <dir>. Files written to <dir> preserve\n\t\ttheir structure relative to the current directory.\n\n\t\tFor example, given a directory structure like\n\n\t\t\u2514\u2500\u2500 src\n\t\t   \u251C\u2500\u2500 a.tsx\n\t\t   \u251C\u2500\u2500 b.tsx\n\t\t   \u2514\u2500\u2500 c.tsx\n\n\t\tThe command \"jsx-lite compile -t react --out-dir lib -- src/*.tsx\" would\n\t\tproduce a structure like:\n\n\t\t\u251C\u2500\u2500 src\n\t\t\u2502  \u251C\u2500\u2500 a.tsx\n\t\t\u2502  \u251C\u2500\u2500 b.tsx\n\t\t\u2502  \u2514\u2500\u2500 c.tsx\n\t\t\u2514\u2500\u2500 lib\n\t\t   \u2514\u2500\u2500 src\n\t\t      \u251C\u2500\u2500 a.tsx\n\t\t      \u251C\u2500\u2500 b.tsx\n\t\t      \u2514\u2500\u2500 c.tsx\n\n\t--dry-run, -n\n\t\tPerform a trial run with no changes made.\n\t--force\n\t\tOverwrite existing files.\n\t--header=<string>\n\t\tAdd a preamble to the document. Useful if you want to include a\n\t\tlicense or an import statement. Header will be ignored if the\n\t\toutput is JSON.\n\t--builder-components\n\t\tCompiled output should will include builder components where\n\t\tavailable. Useful if you're outputing jsx-lite that will run\n\t\tin Builder.\n\nGENERATOR OPTIONS\n\t--format=<format>\n\t--prefix=<prefix>\n\t--includeIds=<include_ids>\n\t--styles=<library_or_method>\n\t--state=<library_or_method>\n").trim());
};
/**
 * Create the cli and kick it off
 */
function run(argv) {
    return __awaiter(this, void 0, void 0, function () {
        var cli, toolbox;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    cli = gluegun_1.build()
                        .brand('jsx-lite')
                        .src(__dirname)
                        .plugins('./node_modules', { matching: 'jsx-lite-*', hidden: true })
                        .help(help) // provides default for help, h, --help, -h
                        .version() // provides default for version, v, --version, -v
                        // enable the following method if you'd like to skip loading one of these core extensions
                        // this can improve performance if they're not necessary for your project:
                        .exclude([])
                        .create();
                    return [4 /*yield*/, cli.run(argv)
                        // send it back (for testing, mostly)
                    ];
                case 1:
                    toolbox = _a.sent();
                    // send it back (for testing, mostly)
                    return [2 /*return*/, toolbox];
            }
        });
    });
}
module.exports = { run: run };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NsaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLG1DQUErQjtBQUcvQixJQUFNLElBQUksR0FBRyxVQUFDLE9BQWdCO0lBQzVCLE9BQUEsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJO0lBQ2hCLGlDQUFpQztJQUNqQyxDQUFBLDBEQUNpRCxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxrekVBdUYxRSxDQUFBLENBQUMsSUFBSSxFQUFFLENBQ0w7QUEzRkQsQ0EyRkMsQ0FBQTtBQUVIOztHQUVHO0FBQ0gsU0FBZSxHQUFHLENBQUMsSUFBUzs7Ozs7O29CQUVwQixHQUFHLEdBQUcsZUFBSyxFQUFFO3lCQUNoQixLQUFLLENBQUMsVUFBVSxDQUFDO3lCQUNqQixHQUFHLENBQUMsU0FBUyxDQUFDO3lCQUNkLE9BQU8sQ0FBQyxnQkFBZ0IsRUFBRSxFQUFFLFFBQVEsRUFBRSxZQUFZLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxDQUFDO3lCQUNuRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsMkNBQTJDO3lCQUN0RCxPQUFPLEVBQUUsQ0FBQyxpREFBaUQ7d0JBQzVELHlGQUF5Rjt3QkFDekYsMEVBQTBFO3lCQUN6RSxPQUFPLENBQUMsRUFBRSxDQUFDO3lCQUNYLE1BQU0sRUFBRSxDQUFBO29CQUVLLHFCQUFNLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDO3dCQUVuQyxxQ0FBcUM7c0JBRkY7O29CQUE3QixPQUFPLEdBQUcsU0FBbUI7b0JBRW5DLHFDQUFxQztvQkFDckMsc0JBQU8sT0FBTyxFQUFBOzs7O0NBQ2Y7QUFFRCxNQUFNLENBQUMsT0FBTyxHQUFHLEVBQUUsR0FBRyxLQUFBLEVBQUUsQ0FBQSJ9