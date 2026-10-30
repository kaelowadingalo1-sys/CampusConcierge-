import { OutboxMessage, NewOutboxMessage } from "./types";

export interface NotificationOutbox {
  add(message: NewOutboxMessage): Promise<void>;
  listUnsent(limit: number): Promise<OutboxMessage[]>;
  markSent(id: number): Promise<void>;
  markFailed(id: number): Promise<void>;
  // Used when an assignment closes before its offer was sent (DI-11).
  cancelFor(assignmentId: number): Promise<void>;
}
