// Converts seconds to a string of a digital time format
export const convertToTimeStr = (org) => {
  let hours = Math.floor((org / (60 * 60)) % 24);

  let minutes = () => {
    let formattedMinutes = Math.floor((org / 60) % 60);

    if (hours === 0 && formattedMinutes === 0) {
      return "0:"; // No hours or minutes
    } else if (hours !== 0 && formattedMinutes === 0) {
      return "00:"; // Hours but no minutes
    } else if (hours !== 0 && formattedMinutes < 10) {
      return "0" + String(formattedMinutes) + ":"; // Hours but less than 10 minutes
    } else {
      return String(formattedMinutes) + ":";
    }
  };

  let seconds = Math.floor(org % 60);

  return `${hours != 0 ? String(hours) + ":" : ""}${minutes()}${String(
    seconds
  ).padStart(2, "0")}`;
};
