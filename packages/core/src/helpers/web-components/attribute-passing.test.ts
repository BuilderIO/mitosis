import { describe, expect, it } from 'vitest';
import { getAttributePassingString } from './attribute-passing';

/**
 * Creates a minimal DOM-like element mock that simulates the live NamedNodeMap behavior.
 * The key insight: `element.attributes` in real DOM returns a LIVE NamedNodeMap object.
 * If you hold a reference to it, its `.length` and `.item(i)` change as attributes are removed.
 */
function createMockElement(tagName: string, attrs: Record<string, string>) {
  const attrStore = new Map(Object.entries(attrs));

  // A live NamedNodeMap proxy — the SAME object is returned each time .attributes is accessed,
  // and its length/item reflect the current state of attrStore.
  const liveNamedNodeMap = new Proxy(
    {},
    {
      get(_target, prop) {
        const entries = [...attrStore.entries()].map(([name, value]) => ({ name, value }));
        if (prop === 'length') return entries.length;
        if (prop === 'item') return (i: number) => entries[i] ?? null;
        if (prop === Symbol.iterator) return () => entries[Symbol.iterator]();
        // Numeric index access
        if (typeof prop === 'string' && !isNaN(Number(prop))) {
          return entries[Number(prop)] ?? undefined;
        }
        return undefined;
      },
    },
  );

  const element = {
    tagName,
    getAttribute(name: string) {
      return attrStore.get(name) ?? null;
    },
    setAttribute(name: string, value: string) {
      attrStore.set(name, value);
    },
    removeAttribute(name: string) {
      attrStore.delete(name);
    },
    /** Returns the same live proxy object each time — just like real DOM */
    get attributes() {
      return liveNamedNodeMap as any;
    },
    closest(_selector: string) {
      // Will be wired up in test
      return null as any;
    },
  };

  return element;
}

/**
 * Builds the enableAttributePassing function from the generated string and executes it
 * in a controlled environment, returning the state of parent and child after execution.
 */
function runAttributePassing(
  parentAttrs: Record<string, string>,
  childAttrs: Record<string, string>,
) {
  const parent = createMockElement('db-stack', parentAttrs);
  const child = createMockElement('div', childAttrs);

  // Wire up closest() so child.closest('db-stack') returns the parent
  child.closest = (_selector: string) => parent;

  // Extract the function body from the generated code.
  // The generated code is a class method, so we wrap it to be callable.
  const generatedCode = getAttributePassingString(false);

  // Build a standalone function from the generated method body
  const fnBody = generatedCode
    // Remove the method signature wrapper and JSDoc
    .replace(/\/\*\*[\s\S]*?\*\/\s*/, '')
    .replace(/private enableAttributePassing\(element, customElementSelector\) \{/, '')
    .replace(/\};$/, '');

  // Create and invoke the function with our mocks
  const fn = new Function('element', 'customElementSelector', fnBody);
  fn(child, 'db-stack');

  // Collect remaining attributes
  const parentResult: Record<string, string> = {};
  for (const { name, value } of parent.attributes) {
    parentResult[name] = value;
  }
  const childResult: Record<string, string> = {};
  for (const { name, value } of child.attributes) {
    childResult[name] = value;
  }

  return { parent: parentResult, child: childResult };
}

describe('enableAttributePassing runtime behavior', () => {
  it('passes multiple data-* attributes from parent to child (regression: live NamedNodeMap)', () => {
    // Reproduction case: <db-stack data-a="1" data-b="2"></db-stack>
    // with a child <div class="db-stack"></div>
    const { parent, child } = runAttributePassing(
      { 'data-a': '1', 'data-b': '2' },
      { class: 'db-stack' },
    );

    // Both data attributes must be moved to the child
    expect(child['data-a']).toBe('1');
    expect(child['data-b']).toBe('2');

    // Both must be removed from the parent
    expect(parent['data-a']).toBeUndefined();
    expect(parent['data-b']).toBeUndefined();
  });

  it('passes aria-* attributes from parent to child', () => {
    const { parent, child } = runAttributePassing(
      { 'aria-label': 'Stack', 'aria-hidden': 'true' },
      { class: 'db-stack' },
    );

    expect(child['aria-label']).toBe('Stack');
    expect(child['aria-hidden']).toBe('true');
    expect(parent['aria-label']).toBeUndefined();
    expect(parent['aria-hidden']).toBeUndefined();
  });

  it('passes class attribute from parent to child', () => {
    const { parent, child } = runAttributePassing({ class: 'custom-class' }, { class: 'db-stack' });

    expect(child.class).toBe('db-stack custom-class');
    expect(parent.class).toBeUndefined();
  });

  it('handles a mix of data-*, aria-*, class, and non-passable attributes', () => {
    const { parent, child } = runAttributePassing(
      { 'data-a': '1', 'aria-label': 'hello', class: 'extra', id: 'my-id' },
      { class: 'db-stack' },
    );

    // data and aria are moved
    expect(child['data-a']).toBe('1');
    expect(child['aria-label']).toBe('hello');
    // class is merged
    expect(child.class).toBe('db-stack extra');
    // id stays on the parent (not passable)
    expect(parent.id).toBe('my-id');
    // passable ones removed from parent
    expect(parent['data-a']).toBeUndefined();
    expect(parent['aria-label']).toBeUndefined();
    expect(parent.class).toBeUndefined();
  });

  it('handles three or more data attributes without skipping any', () => {
    const { parent, child } = runAttributePassing(
      { 'data-x': 'a', 'data-y': 'b', 'data-z': 'c' },
      {},
    );

    expect(child['data-x']).toBe('a');
    expect(child['data-y']).toBe('b');
    expect(child['data-z']).toBe('c');
    expect(parent['data-x']).toBeUndefined();
    expect(parent['data-y']).toBeUndefined();
    expect(parent['data-z']).toBeUndefined();
  });
});
