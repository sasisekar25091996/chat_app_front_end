import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import relativeTime from "dayjs/plugin/relativeTime";
import localizedFormat from "dayjs/plugin/localizedFormat";
import weekday from "dayjs/plugin/weekday";

dayjs.extend(utc);
dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);
dayjs.extend(weekday);

export const convertToISOFormat = (timestamp) => {
  const date = new Date(timestamp * 1000)
  return date.toISOString();
};

export const IndianDateTimeFormate = (date) => {
  return date ? dayjs(date).format("DD MMM YYYY ,  h:mm A") : null;
};

export const UserListTimeFormate = (dateString) => {
  const date = dayjs(dateString);
  const now = dayjs();

  if (date.isSame(now, "day")) {
    return date.format("h:mm A");
  } else if (date.isSame(now.subtract(1, "day"), "day")) {
    return "Yesterday";
  } else if (date.isAfter(now.subtract(7, "day"), "day")) {
    return date.format("dddd");
  } else {
    return date.format("DD/MM/YYYY");
  }
};

export const ChatPageTimeFormat = (dateString) => {
  const date = dayjs(dateString);
  const now = dayjs();
  const yesterday = now.subtract(1, "day");
  const lastWeek = now.subtract(7, "day");

  if (date.isSame(now, "day")) {
    return date.format("h:mm A"); // "11:30 AM"
  } else if (date.isSame(yesterday, "day")) {
    return `Yesterday ${date.format("h:mm A")}`; // "Yesterday 11:30 AM"
  } else if (date.isAfter(lastWeek, "day")) {
    return date.format("dddd h:mm A"); // "Monday 11:30 AM"
  } else {
    return date.format("DD/MM/YYYY h:mm A"); // "10/02/2025 11:30 AM"
  }
};