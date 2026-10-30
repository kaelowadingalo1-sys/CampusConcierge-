import { Clock } from "../interfaces-or-ports";
export class SystemClock implements Clock {
  now(): Date { return new Date(); }
}
