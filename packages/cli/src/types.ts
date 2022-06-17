export type UnionToIntersection<Union> =
  // This basically just runs the next extends clause in a loop. The second
  // extends clause pulls each member of the union out, and because
  // they're implied to be a valid contract, they're merged into an
  // intersection.
  (Union extends any ? (_: Union) => any : never) extends (_: infer Intersection) => any
    ? Intersection
    : never;
