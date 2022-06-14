import { useState } from "react";

export default function Home(props) {
  const [name, setName] = useState(() => "Steve");

  return (
    <>
      <style jsx>{`
        .div-1 {
          text-align: center;
          color: steelblue;
        }
      `}</style>
      <div className="div-1">
        <h2>
          Hello,
          {name}!
        </h2>

        <input
          value={name}
          onChange={(event) => {
            setName(event.target.value);
          }}
        />
      </div>
    </>
  );
}
