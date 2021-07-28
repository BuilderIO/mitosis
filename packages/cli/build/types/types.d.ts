export declare type UnionToIntersection<Union> = (Union extends any ? (_: Union) => any : never) extends (_: infer Intersection) => any ? Intersection : never;
