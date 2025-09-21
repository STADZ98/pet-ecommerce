import moment from "moment/min/moment-with-locales";

export const dateFormat = (date) => {
  // ถ้าต้องการ format เป็น dd/MM/yyyy
  return moment(date).format("DD/MM/YYYY");
};

export const dateFormatTH = (date) => {
  if (!date) return "";
  try {
    return moment(date).locale("th").format("D MMM YYYY HH:mm");
  } catch {
    return moment(date).format("DD/MM/YYYY HH:mm");
  }
};
