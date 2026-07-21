/**
 * Supabase Auth is used in email/password mode, but this app authenticates
 * users by phone number. To avoid requiring a paid SMS provider just to
 * accept a phone number as a login identifier, phone numbers are mapped to
 * a synthetic email address that Supabase treats like any other account.
 */
const SYNTHETIC_EMAIL_DOMAIN = "phone.giapha.local";

/** Normalizes Vietnamese phone input ("0912345678", "+84912345678", "84 912 345 678") to bare digits with country code ("84912345678"). */
export function normalizePhone(input: string): string {
  const digits = input.trim().replace(/\D/g, "");
  if (digits.startsWith("84")) return digits;
  if (digits.startsWith("0")) return `84${digits.slice(1)}`;
  return digits;
}

/** Converts a phone number into the synthetic email stored in auth.users.email. */
export function phoneToAuthEmail(input: string): string {
  return `${normalizePhone(input)}@${SYNTHETIC_EMAIL_DOMAIN}`;
}

/** Converts a synthetic auth email back into a displayable Vietnamese phone number. */
export function authEmailToPhone(email: string): string {
  const local = email.split("@")[0] ?? "";
  return local.startsWith("84") ? `0${local.slice(2)}` : local;
}
