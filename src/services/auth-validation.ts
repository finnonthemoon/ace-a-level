export function validateNewPassword(password: string) {
  if (password.length < 8) return "Use at least 8 characters for your password.";
  if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
    return "Use an uppercase letter, a lowercase letter and a number.";
  }
  return null;
}
