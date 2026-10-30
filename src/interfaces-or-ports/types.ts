// Plain data shapes shared by the core and the ports. No behaviour here.
// Status names match models/lifecycle-or-activity.drawio.

export type ErrandStatus =
  | "POSTED" | "AWAITING_ACCEPTANCE" | "ACCEPTED" | "IN_PROGRESS"
  | "COMPLETED" | "CANCELLED" | "DISPUTED" | "CLOSED";

export type AssignmentOutcome = "accepted" | "declined" | "timed_out";

export type Role = "requester" | "helper" | "administrator";

export interface Errand {
  id: number;
  requesterId: number;
  categoryId: number;
  taskDetails: string;
  deadline: Date;
  price: number;          // locked at posting (BR-D2)
  status: ErrandStatus;
  backlog: boolean;
  requestKey: string;
  requestHash: string;
}

export type NewErrand = Omit<Errand, "id">;

export interface Assignment {
  id: number;
  errandId: number;
  helperId: number;
  assignedAt: Date;
  expiresAt: Date;
  outcome: AssignmentOutcome | null;  // set once (DI-3)
  helperConfirmed: boolean;
  requesterConfirmed: boolean;
  isActive: boolean;
}

export type NewAssignment = Pick<Assignment, "errandId" | "helperId" | "assignedAt" | "expiresAt">;

export interface ErrandEvent {
  errandId: number;
  type: string;
  fromStatus: ErrandStatus | null;
  toStatus: ErrandStatus | null;
  actorType: Role | "system";
  actorId: number | null;
  at: Date;
  detail?: string;
}

export interface OutboxMessage {
  id: number;
  errandId: number;
  assignmentId: number | null;
  recipientId: number;
  recipientRole: Role;
  type: string;
  payload: string;
  attempts: number;
}

export type NewOutboxMessage = Omit<OutboxMessage, "id" | "attempts">;

export interface ContactDetails {
  meetingPoint: string;
  requesterPhone: string;
  helperPhone: string;
}
