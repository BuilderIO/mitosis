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
  default: () => Todo
});
var import_react = __toModule(require("react"));
var import_todos_state = __toModule(require("../shared/todos-state.js"));
function Todo(props) {
  const [editing, setEditing] = (0, import_react.useState)(() => false);
  function toggle() {
    props.todo.completed = !props.todo.completed;
  }
  const [lite, setLite] = (0, import_react.useState)(() => null);
  return /* @__PURE__ */ React.createElement("li", {
    className: `${props.todo.completed ? "completed" : ""} ${editing ? "editing" : ""}`
  }, /* @__PURE__ */ React.createElement("div", {
    className: "view"
  }, /* @__PURE__ */ React.createElement("input", {
    className: "toggle",
    type: "checkbox",
    checked: props.todo.completed,
    onClick: (event) => {
      toggle();
    }
  }), /* @__PURE__ */ React.createElement("label", {
    onDblClick: (event) => {
      setEditing(true);
    }
  }, props.todo.text), /* @__PURE__ */ React.createElement("button", {
    className: "destroy",
    onClick: (event) => {
      import_todos_state.default.todos.splice(import_todos_state.default.todos.indexOf(props.todo));
    }
  })), editing ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("input", {
    className: "edit",
    value: props.todo.text,
    onBlur: (event) => {
      setEditing(false);
    },
    onKeyUp: (event) => {
      props.todo.text = event.target.value;
    }
  })) : null);
}
