<li data-name="li-1">
  <div class="view">
    <input class="toggle" type="checkbox" data-name="input-1" />

    <label data-name="label-1">
      <template data-name="div-1"><!-- props.todo.text --></template>
    </label>

    <button class="destroy" data-name="button-1"></button>
  </div>

  <template data-name="show">
    <input class="edit" data-name="input-2" />
  </template>
</li>
<script>
  (() => {
    const state = {
      editing: false,
      toggle() {
        props.todo.completed = !props.todo.completed;
      },
    };
    let props = {};
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

      document.querySelectorAll("[data-name='li-1']").forEach((el) => {
        el.setAttribute(
          "class",
          `${props.todo.completed ? "completed" : ""} ${
            state.editing ? "editing" : ""
          }`
        );
      });

      document.querySelectorAll("[data-name='input-1']").forEach((el) => {
        el.setAttribute("checked", props.todo.completed);

        el.removeEventListener("click", onInput1Click);
        el.addEventListener("click", onInput1Click);
      });

      document.querySelectorAll("[data-name='label-1']").forEach((el) => {
        el.removeEventListener("dblclick", onLabel1Dblclick);
        el.addEventListener("dblclick", onLabel1Dblclick);
      });

      document.querySelectorAll("[data-name='div-1']").forEach((el) => {
        renderTextNode(el, props.todo.text);
      });

      document.querySelectorAll("[data-name='button-1']").forEach((el) => {
        el.removeEventListener("click", onButton1Click);
        el.addEventListener("click", onButton1Click);
      });

      document.querySelectorAll("[data-name='show']").forEach((el) => {
        const whenCondition = state.editing;
        if (whenCondition) {
          showContent(el);
        }
      });

      document.querySelectorAll("[data-name='input-2']").forEach((el) => {
        el.setAttribute("value", props.todo.text);

        el.removeEventListener("blur", onInput2Blur);
        el.addEventListener("blur", onInput2Blur);

        el.removeEventListener("keyup", onInput2Keyup);
        el.addEventListener("keyup", onInput2Keyup);
      });

      destroyAnyNodes();

      pendingUpdate = false;
    }

    // Event handler for 'click' event on input-1
    function onInput1Click(event) {
      state.toggle();
    }

    // Event handler for 'dblclick' event on label-1
    function onLabel1Dblclick(event) {
      state.editing = true;
      update();
    }

    // Event handler for 'click' event on button-1
    function onButton1Click(event) {
      todosState.todos.splice(todosState.todos.indexOf(props.todo));
    }

    // Event handler for 'blur' event on input-2
    function onInput2Blur(event) {
      state.editing = false;
      update();
    }

    // Event handler for 'keyup' event on input-2
    function onInput2Keyup(event) {
      props.todo.text = event.target.value;
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
  })();
</script>
