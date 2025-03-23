/*
	Installed from https://reactbits.dev/tailwind/
*/

const ShinyText = ({
  text,
  disabled = false,
  speed = 5,
  className = "",
  color = "text-customGreen-200",
}) => {
  const animationDuration = `${speed}s`;

  return (
    <div
      className={`${color} bg-clip-text inline-block ${
        disabled ? "" : "animate-shine"
      } ${className}`}
      style={{
        backgroundImage:
          "linear-gradient(120deg, rgba(255,255,255,0) 48%, rgba(255,255,255,1) 50%, rgba(255,255,255,0) 52%)",
        backgroundSize: "150% 100%",
        WebkitBackgroundClip: "text",
        animationDuration: animationDuration,
      }}
    >
      {text}
    </div>
  );
};

export default ShinyText;

// tailwind.config.js
// module.exports = {
//   theme: {
//     extend: {
//       keyframes: {
//         shine: {
//           '0%': { 'background-position': '100%' },
//           '100%': { 'background-position': '-100%' },
//         },
//       },
//       animation: {
//         shine: 'shine 5s linear infinite',
//       },
//     },
//   },
//   plugins: [],
// };
