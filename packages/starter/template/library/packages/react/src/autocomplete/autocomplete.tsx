"use client";
import * as React from "react";
import { useState, useEffect } from "react";

export type Props = {
  getValues: (input: string) => Promise<any[]>;
  renderChild?: any;
  transformData: (item: any) => string;
};

function Example2(props: Props) {
  const [showSuggestions, setShowSuggestions] = useState(() => false);

  const [suggestions, setSuggestions] = useState(() => []);

  function setInputValue(value: string) {
    setInput(value);
  }

  function handleClick(item: any) {
    setInputValue(props.transformData(item));
    setShowSuggestions(false);
  }

  const [Input, setInput] = useState(() => "");

  useEffect(() => {
    props.getValues(input).then((x) => {
      const filteredX = x.filter((data) => {
        return props
          .transformData(data)
          .toLowerCase()
          .includes(input.toLowerCase());
      });
      setSuggestions(filteredX);
    });
  }, [input, props.getValues]);

  return (
    <>
      <div className="div">
        <link
          href="/Users/samijaber/code/work/mitosis/examples/talk/apps/src/tailwind.min.css"
          rel="stylesheet"
        />
        Autocomplete:
        <div className="relative">
          <Input
            className="shadow-md rounded w-full px-4 py-2 border border-black"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onFocus={(event) => setShowSuggestions(true)}
          />

          <button
            className="absolute right-4 h-full"
            onClick={(event) => {
              setInput("");
              setShowSuggestions(false);
            }}
          >
            X
          </button>
        </div>
        {suggestions.length > 0 && showSuggestions ? (
          <>
            <ul className="shadow-md rounded h-40 overflow-scroll">
              {suggestions?.map((item) => (
                <li
                  className="border-gray-200 border-b flex items-center cursor-pointer hover:bg-gray-100 p-2"
                  onClick={(event) => handleClick(item)}
                >
                  {props.renderChild ? (
                    <>
                      <props.renderChild item={item} />
                    </>
                  ) : (
                    <span>{props.transformData(item)}</span>
                  )}
                </li>
              ))}
            </ul>
          </>
        ) : null}
      </div>
      <style jsx>{`
        .div {
          padding: 10px;
        }
      `}</style>
    </>
  );
}

export default Example2;
