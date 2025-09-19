type User = {
  first_name?: string | null;
  last_name?: string | null;
};

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