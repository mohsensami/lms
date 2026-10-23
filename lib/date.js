export const formatMyDate = (date) => {
  if (!date) return "Invalid Date"; // Handle null or undefined values gracefully
  const parsedDate = new Date(date); // Convert to Date Object
  if (isNaN(parsedDate)) return "Invalid date"; // Check if the date is invalid

  const options = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };

  return new Intl.DateTimeFormat("en-US", options).format(parsedDate);
};

export const formatDuration = (duration) => {
  if (!duration) return null;

  var hour = Math.floor(duration / 3600);
  var min = Math.floor((duration % 3600) / 60);
  var sec = Math.floor((duration % 3600) % 60);

  const durationString = `${hour}:${min}:${sec}`;
  return durationString;
};

// Persian (Jalali) date for the website UI, e.g. «۲۸ مهر ۱۴۰۵».
// NOTE: keep using formatMyDate() for the PDF certificate — its Latin fonts
// have no glyphs for Persian digits/month names.
export const formatFaDate = (date) => {
  if (!date) return "—";
  const parsedDate = new Date(date);
  if (isNaN(parsedDate)) return "—";

  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(parsedDate);
};
