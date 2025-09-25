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
