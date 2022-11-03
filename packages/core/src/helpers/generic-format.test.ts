import { format } from './generic-format';

test('Can generic format sloppy Swift code', () => {
  const code = `
  import SwiftUI
  import JavaScriptCore
  
  struct MyComponent: View {
    
      @State private var updateIndex = 0
      private var context = JSContext()
  
      func eval(expression: String) -> JSValue! {
        return context?.evaluateScript(expression)
      }
  
      init() {
        let jsSource = """
            const state = { name: "Steve" };
  
        """
        context?.evaluateScript(jsSource)
      }
    
  
    var body: some View {
      VStack {
        Text(String(updateIndex)).hidden()
        VStack(){
        Foo(
          bar: baz
          )
  TextField(){}
  Text("Hello")
  Text(eval(expression: """state.name"""))
  Text("! I can run in React, Vue, Solid, or Liquid!")}
      }
    }
  }
  `;

  expect(format(code)).toMatchSnapshot();
});
