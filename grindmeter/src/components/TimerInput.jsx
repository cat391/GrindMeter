import { useState } from "react";

export default function TimerInput({ value = "00:00:00" }) {
  // MIMIC THE GOOGLE TIMER INTERFACE
  // The value should be in format 00:00:00
  // However, when you change you keep the format
  // Do this with the value handleClick logic i did earlier

  const timeValues = value.split(":");

  const [hour, setHour] = useState(timeValues[0] === "00" ? "" : timeValues[0]);
  const [minute, setMinute] = useState(timeValues[1]);
  const [second, setSecond] = useState(timeValues[2]);

  const handleChange = (e) => {
    const input = e.target.value;
    const id = e.target.id;

    if (!/^\d*$/.test(input)) return; // Break if not number

    if (id === "hour" && Number(input) < 24) {
      setHour(input);
    } else if (id === "minute" && Number(input < 60)) {
      setMinute(input);
    } else if (Number(input < 60)) {
      setSecond(input);
    }
  };

  return (
    <div className="flex gap-2 text-white justify-center m-2">
      <input
        type="type"
        id="hour"
        value={hour}
        className=" w-10 text-white bg-customBlack-300 text-center"
        placeholder="h"
        onChange={handleChange}
      />
      :
      <input
        type="type"
        id="minute"
        value={minute}
        placeholder="m"
        className="w-10 text-white bg-customBlack-300 text-center"
        onChange={handleChange}
      />
      :
      <input
        type="type"
        id="second"
        value={second}
        placeholder="s"
        className="w-10 text-white bg-customBlack-300 text-center"
        onChange={handleChange}
      />
    </div>
  );
}
