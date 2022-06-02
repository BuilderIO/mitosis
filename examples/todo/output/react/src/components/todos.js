var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __export = (target, all) => {
  __markAsModule(target);
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __reExport = (target, module2, desc) => {
  if (module2 && typeof module2 === "object" || typeof module2 === "function") {
    for (let key of __getOwnPropNames(module2))
      if (!__hasOwnProp.call(target, key) && key !== "default")
        __defProp(target, key, { get: () => module2[key], enumerable: !(desc = __getOwnPropDesc(module2, key)) || desc.enumerable });
  }
  return target;
};
var __toModule = (module2) => {
  return __reExport(__markAsModule(__defProp(module2 != null ? __create(__getProtoOf(module2)) : {}, "default", module2 && module2.__esModule && "default" in module2 ? { get: () => module2.default, enumerable: true } : { value: module2, enumerable: true })), module2);
};
__export(exports, {
  default: () => Todos
});
var import_react = __toModule(require("react"));
var import_todos_state = __toModule(require("../shared/todos-state.js"));
var import_todo = __toModule(require("./todo.js"));
function Todos(props) {
  var _a;
  const [lite, setLite] = (0, import_react.useState)(() => null);
  return /* @__PURE__ */ React.createElement("section", {
    className: "main"
  }, import_todos_state.default.todos.length ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("input", {
    className: "toggle-all",
    type: "checkbox",
    checked: import_todos_state.default.allCompleted,
    onClick: (event) => {
      const newValue = !import_todos_state.default.allCompleted;
      for (const todoItem of import_todos_state.default.todos) {
        todoItem.completed = newValue;
      }
    }
  })) : null, /* @__PURE__ */ React.createElement("ul", {
    className: "todo-list"
  }, (_a = import_todos_state.default.todos) == null ? void 0 : _a.map((todo) => /* @__PURE__ */ React.createElement(import_todo.default, {
    todo
  }))));
}
