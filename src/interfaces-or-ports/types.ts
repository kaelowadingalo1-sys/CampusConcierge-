// Plain data shapes shared by the core and the ports. No behaviour here.

// Names match models/lifecycle-or-activity.drawio.
export type ErrandStatus =
  | "POSTED" | "AWAITING_ACCEPTANCE" | "ACCEPTED" | "IN_PROGRESS"
  | "COMPLETED" | "CANCELLED" | "DISPUTED" | "CLOSED";

export type AssignmentOutcome = "accepted" | "declined" | "timed_out";

export interface Errand {
  id: number;
  requesterId: number;
  categoryId: number;
  price: number;          // locked at posting (BR-D2)
  status: ErrandStatus;
  backlog: boolean;
  requestKey: string;
  requestHash: string;
}

export interface Assignment {
  id: number;
  errandId: number;
  helperId: number;
  expiresAt: Date;
  outcome: AssignmentOutcome | null;  // set once (DI-3)
  helperConfirmed: boolean;
  requesterConfirmed: boolean;
  isActive: boolean;
}

export interface ErrandEvent {
  errandId: number;
  type: string;
  at: Date;
  actorRole: "requester" | "helper" | "administrator" | "system";
}

export interface OutboxMessage {
  id: number;
  assignmentId: number | null;
  kind: string;
  recipientId: number;
  payload: string;
}

export interface ContactDetails {
  meetingPoint: string;
  requesterPhone: string;
  helperPhone: string;
}
