// @ts-check

const bangladeshLocale = "en-BD";

/**
 * @param {number} amount
 */
export function formatMoney(amount) {
  return `৳ ${Number(amount || 0).toLocaleString(bangladeshLocale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * @param {string} value
 */
export function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/**
 * @param {string} value
 */
export function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * @param {string} phone
 */
export function isBangladeshPhone(phone) {
  return /^(?:\+?88)?01[3-9]\d{8}$/.test(phone.replace(/\s+/g, ""));
}

/**
 * @param {Date} date
 */
export function localDate(date = new Date()) {
  return date.toLocaleDateString("en-CA", { timeZone: "Asia/Dhaka" });
}

/**
 * @template T
 * @param {T[]} items
 * @param {(item:T)=>number} pick
 */
export function sumBy(items, pick) {
  return items.reduce((total, item) => total + pick(item), 0);
}
