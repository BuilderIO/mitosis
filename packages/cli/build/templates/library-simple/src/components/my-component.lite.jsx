"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// TODO: get the exports alias working here so this is just `import '@jsx-lite/core/jsx'
require("@jsx-lite/core/dist/src/jsx-types");
var core_1 = require("@jsx-lite/core");
function MyComponent(props) {
    var state = core_1.useState({
        name: 'Steve'
    });
    return (<div>
      <core_1.Show when={props.showInput}>
        <input css={{ color: 'red' }} value={state.name} onChange={function (event) { return (state.name = event.target.value); }}/>
      </core_1.Show>
      Hello! I can run in React, Vue, Solid, or Liquid!
    </div>);
}
exports.default = MyComponent;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibXktY29tcG9uZW50LmxpdGUuanN4Iiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3RlbXBsYXRlcy9saWJyYXJ5LXNpbXBsZS9zcmMvY29tcG9uZW50cy9teS1jb21wb25lbnQubGl0ZS50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSx3RkFBd0Y7QUFDeEYsNkNBQTBDO0FBQzFDLHVDQUErQztBQU0vQyxTQUF3QixXQUFXLENBQUMsS0FBYztJQUNoRCxJQUFNLEtBQUssR0FBRyxlQUFRLENBQUM7UUFDckIsSUFBSSxFQUFFLE9BQU87S0FDZCxDQUFDLENBQUE7SUFFRixPQUFPLENBQ0wsQ0FBQyxHQUFHLENBQ0Y7TUFBQSxDQUFDLFdBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQzFCO1FBQUEsQ0FBQyxLQUFLLENBQ0osR0FBRyxDQUFDLENBQUMsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FDdEIsS0FBSyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUNsQixRQUFRLENBQUMsQ0FBQyxVQUFBLEtBQUssSUFBSSxPQUFBLENBQUMsS0FBSyxDQUFDLElBQUksR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxFQUFqQyxDQUFpQyxDQUFDLEVBRXpEO01BQUEsRUFBRSxXQUFJLENBQ047O0lBQ0YsRUFBRSxHQUFHLENBQUMsQ0FDUCxDQUFBO0FBQ0gsQ0FBQztBQWpCRCw4QkFpQkMifQ==