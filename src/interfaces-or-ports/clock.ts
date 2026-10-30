// Lets tests control time, so the 10-minute acceptance window (QS-1)
// can be tested without waiting.
export interface Clock {
  now(): Date;
}
