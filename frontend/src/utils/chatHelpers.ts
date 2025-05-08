// Helper to unify Mongo _id and OAuth id
export const getUserId = (u: any): string => u?._id || u?.id || "";

export const formatTime = (ts?: Date) =>
  ts
    ? new Intl.DateTimeFormat("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }).format(new Date(ts))
    : "";

export const getMessageDay = (ts?: Date) => {
  if (!ts) return "";
  const d = new Date(ts),
    today = new Date();
  if (d.toDateString() === today.toDateString()) return "Today";
  today.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Yesterday";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(d);
};