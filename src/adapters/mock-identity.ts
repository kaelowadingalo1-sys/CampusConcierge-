import { Identity, IdentityCheck } from "../interfaces-or-ports";

// Mock identity (D-007): bearer tokens map to seeded test accounts.
export class MockIdentityAdapter implements IdentityCheck {
  private accounts: Record<string, Identity>;
  constructor(extra: Record<string, Identity> = {}) {
    this.accounts = {
      "requester-1": { userId: 1, role: "requester", accountUsable: true },
      "requester-2": { userId: 2, role: "requester", accountUsable: true },
      "helper-1": { userId: 1, role: "helper", accountUsable: true },
      "helper-2": { userId: 2, role: "helper", accountUsable: true },
      "helper-3": { userId: 3, role: "helper", accountUsable: true },
      "admin-1": { userId: 1, role: "administrator", accountUsable: true },
      "requester-unconfirmed": { userId: 2, role: "requester", accountUsable: false },
      ...extra,
    };
  }
  async identify(credentials: string | undefined): Promise<Identity | null> {
    if (!credentials) return null;
    const token = credentials.replace(/^Bearer\s+/i, "");
    return this.accounts[token] ?? null;
  }
}
