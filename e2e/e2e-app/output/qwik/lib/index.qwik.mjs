import { componentQrl, inlinedQrl, useStylesScopedQrl, useStore, useLexicalScope, _IMMUTABLE, _wrapSignal } from "@builder.io/qwik";
import { jsxs, jsx, Fragment } from "@builder.io/qwik/jsx-runtime";
const setItemName$1 = function setItemName2(props, state, event) {
  state.newItemName = event.target.value;
};
const addItem$1 = function addItem2(props, state) {
  state.list = [
    ...state.list,
    state.newItemName
  ];
};
const MyComponent$1 = /* @__PURE__ */ componentQrl(inlinedQrl((props) => {
  useStylesScopedQrl(inlinedQrl(STYLES$2, "MyComponent_component_useStylesScoped_f5MdItlecIM"));
  const state = useStore({
    list: [
      "hello",
      "world"
    ],
    newItemName: "New item"
  });
  return /* @__PURE__ */ jsxs("div", {
    class: "div-MyComponent",
    children: [
      /* @__PURE__ */ jsx("link", {
        href: "https://unpkg.com/tailwindcss@^2/dist/tailwind.min.css",
        rel: "stylesheet"
      }),
      /* @__PURE__ */ jsx("input", {
        class: "shadow-md rounded w-full px-4 py-2",
        get value() {
          return state.newItemName;
        },
        onChange$: inlinedQrl((event) => {
          const [props2, state2] = useLexicalScope();
          return setItemName$1(props2, state2, event);
        }, "MyComponent_component_div_input_onChange_S4SN40b9fBo", [
          props,
          state
        ]),
        [_IMMUTABLE]: {
          value: _wrapSignal(state, "newItemName")
        }
      }),
      /* @__PURE__ */ jsx("button", {
        class: "bg-blue-500 rounded w-full text-white font-bold py-2 px-4 button-MyComponent",
        onClick$: inlinedQrl((event) => {
          const [props2, state2] = useLexicalScope();
          return addItem$1(props2, state2);
        }, "MyComponent_component_div_button_onClick_W6scLiBb6bQ", [
          props,
          state
        ]),
        children: "Add list item"
      }),
      /* @__PURE__ */ jsx("ul", {
        class: "shadow-md rounded",
        children: (state.list || []).map(function(item) {
          return /* @__PURE__ */ jsx("li", {
            class: "border-gray-200 border-b li-MyComponent",
            children: item
          });
        })
      })
    ]
  });
}, "MyComponent_component_BfP0YK0M8U8"));
const STYLES$2 = `
.div-MyComponent {
  padding: 10px;
}.button-MyComponent {
  margin: 10px 0;
}.li-MyComponent {
  padding: 10px;
}`;
const ItemList = /* @__PURE__ */ componentQrl(inlinedQrl((props) => {
  useStylesScopedQrl(inlinedQrl(STYLES$1, "ItemList_component_useStylesScoped_lxKafRpi0E0"));
  return /* @__PURE__ */ jsx("ul", {
    class: "shadow-md rounded",
    children: (props.list || []).map(function(item) {
      return /* @__PURE__ */ jsx("li", {
        class: "border-gray-200 border-b li-ItemList",
        children: item
      });
    })
  });
}, "ItemList_component_a25YH41a0SM"));
const STYLES$1 = `
.li-ItemList {
  padding: 10px;
}`;
const setItemName = function setItemName22(props, state, event) {
  state.newItemName = event.target.value;
};
const addItem = function addItem22(props, state) {
  state.list = [
    ...state.list,
    state.newItemName
  ];
};
const MyComponent = /* @__PURE__ */ componentQrl(inlinedQrl((props) => {
  useStylesScopedQrl(inlinedQrl(STYLES, "MyComponent_component_useStylesScoped_mf2ErQiWYdo"));
  const state = useStore({
    list: [
      "hello",
      "world"
    ],
    newItemName: "New item"
  });
  return /* @__PURE__ */ jsxs("div", {
    class: "div-MyComponent",
    children: [
      /* @__PURE__ */ jsx("link", {
        href: "https://unpkg.com/tailwindcss@^2/dist/tailwind.min.css",
        rel: "stylesheet"
      }),
      /* @__PURE__ */ jsx("input", {
        class: "shadow-md rounded w-full px-4 py-2",
        get value() {
          return state.newItemName;
        },
        onChange$: inlinedQrl((event) => {
          const [props2, state2] = useLexicalScope();
          return setItemName(props2, state2, event);
        }, "MyComponent_component_div_input_onChange_03aDNNe2vDc", [
          props,
          state
        ]),
        [_IMMUTABLE]: {
          value: _wrapSignal(state, "newItemName")
        }
      }),
      /* @__PURE__ */ jsx("button", {
        class: "bg-blue-500 rounded w-full text-white font-bold py-2 px-4 button-MyComponent",
        onClick$: inlinedQrl((event) => {
          const [props2, state2] = useLexicalScope();
          return addItem(props2, state2);
        }, "MyComponent_component_div_button_onClick_oLYWto1LQDo", [
          props,
          state
        ]),
        children: "Add list item"
      }),
      /* @__PURE__ */ jsx(ItemList, {
        get list() {
          return state.list;
        },
        [_IMMUTABLE]: {
          list: _wrapSignal(state, "list")
        }
      }, "SG_0")
    ]
  });
}, "MyComponent_component_ymN6Pp0c5AQ"));
const STYLES = `
.div-MyComponent {
  padding: 10px;
}.button-MyComponent {
  margin: 10px 0;
}`;
const DEFAULT_VALUES = {
  name: "Sami"
};
const ComponentWithTypes = /* @__PURE__ */ componentQrl(inlinedQrl((props) => {
  return /* @__PURE__ */ jsxs("div", {
    children: [
      " Hello ",
      props.name || DEFAULT_VALUES.name
    ],
    [_IMMUTABLE]: {
      children: false
    }
  });
}, "ComponentWithTypes_component_x1wRjN8gC9w"));
const COMPONENT_MAP = {
  "/one-component/": MyComponent$1,
  "/two-components/": MyComponent,
  "/types/": ComponentWithTypes
};
const Homepage = /* @__PURE__ */ componentQrl(inlinedQrl((props) => {
  const state = useStore({
    Component: COMPONENT_MAP[props.pathname]
  });
  return /* @__PURE__ */ jsxs("div", {
    children: [
      /* @__PURE__ */ jsx("div", {
        children: "All tests:"
      }),
      /* @__PURE__ */ jsx("ul", {
        children: (Object.keys(COMPONENT_MAP) || []).map(function(x) {
          return /* @__PURE__ */ jsx("li", {
            children: /* @__PURE__ */ jsx("a", {
              href: x,
              children: x
            })
          });
        })
      }),
      state.Component ? /* @__PURE__ */ jsxs(Fragment, {
        children: [
          /* @__PURE__ */ jsxs("div", {
            children: [
              "Current Test Component: ",
              _wrapSignal(props, "pathname")
            ]
          }),
          /* @__PURE__ */ jsx(state.Component, {
            ...props.compProps
          })
        ]
      }, "Yy_0") : /* @__PURE__ */ jsxs("div", {
        children: [
          "Could not find component for ",
          _wrapSignal(props, "pathname")
        ]
      })
    ],
    [_IMMUTABLE]: {
      children: false
    }
  });
}, "Homepage_component_g0i3uyNUzr0"));
export {
  Homepage
};
