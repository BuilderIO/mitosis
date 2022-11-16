import { default as Todos } from './todo-app/todo-app.lite';
import { default as AutoComplete } from './autocomplete/autocomplete.lite';

export const getComponentForPath = (path: string) => {
  switch (path) {
    case '/':
      return Todos;
    case '/autocomplete':
      return AutoComplete;
    default:
      return Todos;
  }
};
