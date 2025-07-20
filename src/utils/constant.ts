// constants.ts
export const PASSWORD_REGEX: RegExp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;

// Regex kiểm tra email cơ bản
export const EMAIL_REGEX: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Số ký tự tối đa cho password
export const MAX_PASSWORD_LENGTH: number = 20;
