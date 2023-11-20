"use client";
import * as React from "react";
import { useState } from "react";

export interface State {
  list: string[];
  newItemName: string;
  setItemName: any;
  addItem: () => void;
  deleteItem: (k: number) => void;
}
export interface TodoAppProps {}

import ItemList from "./item-list";

function TodoApp(props: TodoAppProps) {
  const [list, setList] = useState(() => ["hello", "world"]);

  const [newItemName, setNewItemName] = useState(() => "New item");

  function setItemName(event: Event) {
    setNewItemName((event.target as any).value);
  }

  function addItem() {
    setList([...list, newItemName]);
  }

  function deleteItem(index) {
    setList(list.filter((x, i) => i !== index));
  }

  return (
    <>
      <div className="div">
        <link
          href="/Users/samijaber/code/work/mitosis/examples/talk/apps/src/tailwind.min.css"
          rel="stylesheet"
        />
        <input
          className="shadow-md rounded w-full px-4 py-2"
          value={newItemName}
          onChange={(event) => setItemName(event)}
        />{" "}
        <button
          className="bg-blue-500 rounded w-full text-white font-bold py-2 px-4 my-1"
          onClick={(event) => addItem()}
        >
          Add list item
        </button>
        <ItemList list={list} deleteItem={deleteItem} />
      </div>
      <style jsx>{`
        .div {
          padding: 10px;
        }
      `}</style>
    </>
  );
}

export default TodoApp;
