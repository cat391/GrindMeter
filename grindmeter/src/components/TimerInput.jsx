export default function TimerInput({ value = "00:00:00" }) {
  // MIMIC THE GOOGLE TIMER INTERFACE
  // The value should be in format 00:00:00
  // However, when you change you keep the format
  // Do this with the value handleClick logic i did earlier

  return (
    <div>
      <input type="text" placeholder={value} />
    </div>
  );
}
