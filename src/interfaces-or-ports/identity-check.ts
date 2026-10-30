export interface Identity {
  userId: number;
  role: "requester" | "helper" | "administrator";
  accountUsable: boolean;
}

// Port to the Identity Service. Mocked today (D-007).
// Returns null when the caller cannot be identified.
export interface IdentityCheck {
  identify(credentials: string): Promise<Identity | null>;
}
