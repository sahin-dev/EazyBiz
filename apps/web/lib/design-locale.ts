export type InterfaceLocale = "en" | "bn";

const bengaliDigits = "০১২৩৪৫৬৭৮৯";

function localizeDigits(value: string, locale: InterfaceLocale) {
  return locale === "bn" ? value.replace(/[0-9]/g, (digit) => bengaliDigits[Number(digit)]) : value;
}

export function formatBDT(amount: string, locale: InterfaceLocale = "en") {
  if (!/^-?\d+(?:\.\d{1,2})?$/.test(amount)) throw new RangeError("BDT amount must be an exact decimal string with at most two fraction digits.");
  const negative = amount.startsWith("-");
  const [whole, fraction = ""] = (negative ? amount.slice(1) : amount).split(".");
  const normalized = whole.replace(/^0+(?=\d)/, "");
  const lastThree = normalized.slice(-3);
  const prefix = normalized.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ",");
  const grouped = prefix ? `${prefix},${lastThree}` : lastThree;
  const digits = localizeDigits(`${grouped}.${fraction.padEnd(2, "0")}`, locale);
  return `${negative ? "-" : ""}৳\u00a0${digits}`;
}

export function formatLocalDate(value: Date | string, locale: InterfaceLocale = "en") {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) throw new RangeError("Invalid date.");
  return new Intl.DateTimeFormat(locale === "bn" ? "bn-BD" : "en-BD", { timeZone: "Asia/Dhaka", day: "numeric", month: "short", year: "numeric" }).format(date);
}
