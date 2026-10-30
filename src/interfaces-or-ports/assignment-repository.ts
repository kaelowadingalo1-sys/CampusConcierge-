import { Assignment } from "./types";

export interface AssignmentRepository {
  // Must fail if the helper or the errand already has an active
  // assignment (DI-1, DI-2). The database rule is the real guard.
  save(assignment: Assignment): Promise<Assignment>;
  findActiveByHelper(helperId: number): Promise<Assignment | null>;
  // Assignments whose expiresAt has passed and have no outcome.
  findDue(now: Date): Promise<Assignment[]>;
}
