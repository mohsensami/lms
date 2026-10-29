// Safe to import from both server and client code.

/** Days a student is locked out of an exam (and so out of requesting a certificate) after failing it. */
export const EXAM_RETRY_LOCK_DAYS = 7;

/** Every question has exactly this many options. */
export const EXAM_OPTION_COUNT = 4;

/** Persian labels for the 4 options (index 0-3). */
export const EXAM_OPTION_LABELS = ['الف', 'ب', 'ج', 'د'];

/** Network/latency tolerance (seconds) when checking a submission against its deadline. */
export const EXAM_SUBMIT_GRACE_SECONDS = 20;
