import { OutboxMessage } from "./types";

export interface NotificationOutbox {
  add(message: Omit<OutboxMessage, "id">): Promise<void>;
  nextUnsent(): Promise<OutboxMessage | null>;
  markSent(id: number): Promise<void>;
  // Used when an assignment closes before its offer was sent (DI-11).
  cancelFor(assignmentId: number): Promise<void>;
}
