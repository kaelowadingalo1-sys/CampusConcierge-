import { ErrandEvent } from "./types";

// Append only. No update or delete operation exists (DI-10).
export interface EventLog {
  append(event: ErrandEvent): Promise<void>;
}
