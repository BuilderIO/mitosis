<section class="main">
  <template data-name="show">
    <input class="toggle-all" type="checkbox" data-name="input-1" />
  </template>

  <ul class="todo-list">
    <template data-name="for"><Todo data-name="todo"></Todo></template>
  </ul>
</section>
<script>
  (() => {
    const state = {};

    let nodesToDestroy = [];
    let pendingUpdate = false;

    function destroyAnyNodes() {
      // destroy current view template refs before rendering again
      nodesToDestroy.forEach((el) => el.remove());
      nodesToDestroy = [];
    }

    // Function to update data bindings and loops
    // call update() when you mutate state and need the updates to reflect
    // in the dom
    function update() {
      if (pendingUpdate === true) {
        return;
      }
      pendingUpdate = true;

      document.querySelectorAll("[data-name='show']").forEach((el) => {
        const whenCondition = todosState.todos.length;
        if (whenCondition) {
          showContent(el);
        }
      });

      document.querySelectorAll("[data-name='input-1']").forEach((el) => {
        el.setAttribute("checked", todosState.allCompleted);

        el.removeEventListener("click", onInput1Click);
        el.addEventListener("click", onInput1Click);
      });

      document.querySelectorAll("[data-name='for']").forEach((el) => {
        let array = todosState.todos;
        renderLoop(el, array, "todo");
      });

      document.querySelectorAll("[data-name='todo']").forEach((el) => {
        const todo = getContext(el, "todo");

        el.setAttribute("todo", todo);
      });

      destroyAnyNodes();

      pendingUpdate = false;
    }

    // Event handler for 'click' event on input-1
    function onInput1Click(event) {
      const newValue = !todosState.allCompleted;

      for (const todoItem of todosState.todos) {
        todoItem.completed = newValue;
      }
    }

    // Update with initial state on first load
    update();

    function showContent(el) {
      // https://developer.mozilla.org/en-US/docs/Web/API/HTMLTemplateElement/content
      // grabs the content of a node that is between <template> tags
      // iterates through child nodes to register all content including text elements
      // attaches the content after the template

      const elementFragment = el.content.cloneNode(true);
      const children = Array.from(elementFragment.childNodes);
      children.forEach((child) => {
        if (el?.scope) {
          child.scope = el.scope;
        }
        nodesToDestroy.push(child);
      });
      el.after(elementFragment);
    }

    // Helper text DOM nodes
    function renderTextNode(el, text) {
      const textNode = document.createTextNode(text);
      if (el?.scope) {
        textNode.scope = el.scope;
      }
      el.after(textNode);
      nodesToDestroy.push(el.nextSibling);
    }

    // Helper to render loops
    function renderLoop(template, array, itemName, itemIndex, collectionName) {
      for (let [index, value] of array.entries()) {
        const elementFragment = template.content.cloneNode(true);
        const localScope = {};
        let scope = localScope;
        if (template?.scope) {
          const getParent = {
            get(target, prop, receiver) {
              if (prop in target) {
                return target[prop];
              }
              if (prop in template.scope) {
                return template.scope[prop];
              }
              return target[prop];
            },
          };
          scope = new Proxy(localScope, getParent);
        }
        Array.from(elementFragment.childNodes).reversrEach((child) => {
          if (itemName !== undefined) {
            scope[itemName] = value;
          }
          if (itemIndex !== undefined) {
            scope[itemIndex] = index;
          }
          if (collectionName !== undefined) {
            scope[collectionName] = array;
          }
          child.scope = scope;
          this.nodesToDestroy.push(child);
          template.after(child);
        });
      }
    }

    function getContext(el, name) {
      do {
        let value = el?.scope?.[name];
        if (value !== undefined) {
          return value;
        }
      } while ((el = el.parentNode));
    }
  })();
</script>
