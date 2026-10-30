import { Errand, ContactDetails } from "./types";

export interface ErrandRepository {
  save(errand: Errand): Promise<Errand>;
  findById(id: number): Promise<Errand | null>;
  // Duplicate-submission handling (DI-7).
  findByRequestKey(requesterId: number, key: string): Promise<Errand | null>;
  // Read only through the confirmation gate (DI-8).
  findContact(errandId: number): Promise<ContactDetails | null>;
}
