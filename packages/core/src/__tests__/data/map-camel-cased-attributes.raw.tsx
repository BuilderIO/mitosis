import { useState } from "@builder.io/mitosis";
import React from '@builder.io/react'

export default function MyComponent(props) {
  const [name, setName] = useState("Steve");

  return (
    <div>
      <img srcSet="http://example.com" />    
    </div>
  );
}