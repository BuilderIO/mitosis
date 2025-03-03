/** @jsx jsx */

export default function DebugIds() {
  return (
    <div _id="root">
      <div _id="child1">Hello</div>
      <div _id="child2">
        <span _id="grandchild">World</span>
      </div>
    </div>
  );
}
