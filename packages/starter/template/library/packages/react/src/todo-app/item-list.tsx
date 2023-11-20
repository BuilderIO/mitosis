"use client";
import * as React from "react";

export interface ItemListProps {
  list: string[];
  deleteItem: (k: number) => void;
}

function ItemList(props: ItemListProps) {
  return (
    <ul className="shadow-md rounded">
      {props.list?.map((item) => (
        <li className="border-gray-200 border-b flex items-center p-2.5">
          <span>{item}</span>

          <button
            className="bg-red-500 rounded text-white py-2 px-4 ml-auto"
            onClick={(event) => props.deleteItem(props.list.indexOf(item))}
          >
            Delete
          </button>
        </li>
      ))}
    </ul>
  );
}

export default ItemList;
