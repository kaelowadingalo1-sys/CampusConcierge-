import { ErrandRepository } from "./errand-repository";
import { AssignmentRepository } from "./assignment-repository";
import { EventLog } from "./event-log";
import { NotificationOutbox } from "./notification-outbox";

// Everything done inside run() commits together or not at all (DI-9).
export interface WorkflowTransaction {
  errands: ErrandRepository;
  assignments: AssignmentRepository;
  events: EventLog;
  outbox: NotificationOutbox;
}

export interface UnitOfWork {
  run<T>(work: (tx: WorkflowTransaction) => Promise<T>): Promise<T>;
}
