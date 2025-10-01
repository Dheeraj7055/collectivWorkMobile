export type User = {
  first_name?: string | null;
  last_name?: string | null;
};

// ✅ Get initials (already you had)
export const getInitials = (user?: User | null): string => {
  if (!user) return "";

  const first = user.first_name?.trim() || "";
  const last = user.last_name?.trim() || "";

  if (first && last) {
    return `${first[0]}${last[0]}`.toUpperCase();
  }

  if (first) return first[0].toUpperCase();
  if (last) return last[0].toUpperCase();

  return "";
};

// ✅ Capitalize each word
export const capitalizeWords = (str?: string | null): string => {
  if (!str) return "";
  return str
    .split(" ")
    .filter(Boolean)
    .map(
      (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
    )
    .join(" ");
};

// ✅ Get full name of user
export const getFullName = (user?: User | null): string => {
  if (!user) return "";
  const first = user.first_name?.trim() || "";
  const last = user.last_name?.trim() || "";
  return capitalizeWords(`${first} ${last}`.trim());
};

export const convertToFormattedTime = (input?: string): string => {
  if (!input || typeof input !== "string") return "--:--";

  const hourMatch = input.match(/(\d+)\s*(hour|hr|hrs)/i);
  const minuteMatch = input.match(/(\d+)\s*(minute|min|mins)/i);

  const hours = hourMatch ? parseInt(hourMatch[1], 10) : 0;
  const minutes = minuteMatch ? parseInt(minuteMatch[1], 10) : 0;

  const totalMinutes = hours * 60 + minutes;
  const finalHours = Math.floor(totalMinutes / 60);
  const finalMinutes = totalMinutes % 60;

  const paddedHours = String(finalHours).padStart(2, "0");
  const paddedMinutes = String(finalMinutes).padStart(2, "0");
  const hourLabel = finalHours === 1 ? "hr" : "hrs";

  return `${paddedHours}:${paddedMinutes} ${hourLabel}`;
};

export const convertSecondsToHoursMinutes = (seconds: number): string => {
  if (!seconds || isNaN(seconds)) return "--:--";

  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);

  const paddedHours = String(hrs).padStart(2, "0");
  const paddedMinutes = String(mins).padStart(2, "0");
  const hourLabel = hrs === 1 ? "hr" : "hrs";

  return `${paddedHours}:${paddedMinutes} ${hourLabel}`;
};
