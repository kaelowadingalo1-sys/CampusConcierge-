import { Errand, NewErrand } from "./types";

export class DuplicateRequestKeyError extends Error {
  constructor() { super("request key already used"); }
}

export interface ErrandRepository {
  // Throws DuplicateRequestKeyError when (requesterId, requestKey) exists (DI-7).
  insert(errand: NewErrand, meetingPoint: string): Promise<Errand>;
  update(errand: Errand): Promise<void>;
  findById(id: number): Promise<Errand | null>;
  findByIdForUpdate(id: number): Promise<Errand | null>;
  // Oldest first. Errands that are POSTED, flagged backlog and waiting for a helper.
  findBacklogForUpdate(limit: number): Promise<Errand[]>;
  findByRequestKey(requesterId: number, key: string): Promise<Errand | null>;
  // Read only through the confirmation gate (DI-8).
  findContact(errandId: number): Promise<{ meetingPoint: string; requesterPhone: string } | null>;
}
