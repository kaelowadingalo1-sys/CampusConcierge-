import { Role } from "./types";

export interface Identity {
  userId: number;
  role: Role;
  accountUsable: boolean;
}

// Port to the Identity Service. Mocked today (D-007).
// Returns null when the caller cannot be identified.
export interface IdentityCheck {
  identify(credentials: string | undefined): Promise<Identity | null>;
}
