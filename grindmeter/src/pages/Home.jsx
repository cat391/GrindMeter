import { useState } from "react";

export default function Home() {
  const [isOn, setIsOn] = useState(false);
  const time = 3660;

  function handleClick() {
    setIsOn((prev) => (prev ? false : true));
  }
  return (
    <div>
      <h2>
        <Timer duration={time} isRunning={isOn} />
      </h2>
      <button onClick={handleClick}>Stop/Go</button>
    </div>
  );
}
