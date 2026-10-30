import { Assignment, NewAssignment, AssignmentOutcome } from "./types";

export interface AssignmentRepository {
  // Returns null when the helper or the errand already has an active
  // assignment (DI-1, DI-2). The database rule is the real guard.
  tryCreateActive(a: NewAssignment): Promise<Assignment | null>;
  findByIdForUpdate(id: number): Promise<Assignment | null>;
  findActiveByErrand(errandId: number): Promise<Assignment | null>;
  // Helpers already offered this errand (declined or timed out earlier).
  helpersOffered(errandId: number): Promise<number[]>;
  // Active assignments with no outcome whose expiresAt has passed.
  findDue(now: Date): Promise<number[]>;
  // Sets the outcome once and closes the assignment (DI-3).
  close(id: number, outcome: AssignmentOutcome): Promise<void>;
  markHelperConfirmed(id: number): Promise<void>;
  markRequesterConfirmed(id: number): Promise<void>;
  helperPhone(helperId: number): Promise<string>;
}
