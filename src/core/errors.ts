// Stable error codes (docs/api-contracts/core-operation.md plus the codes added in Phase 2).
export type ErrorCode =
  | "VALIDATION_FAILED" | "NOT_AUTHENTICATED" | "ACCOUNT_NOT_CONFIRMED"
  | "IDEMPOTENCY_KEY_REUSED" | "CATEGORY_NOT_APPROVED" | "SERVICE_UNAVAILABLE"
  | "FORBIDDEN" | "NOT_FOUND" | "OFFER_EXPIRED" | "OFFER_NOT_ACTIVE"
  | "NOT_READY" | "CONTACT_NOT_AVAILABLE";

export class AppError extends Error {
  constructor(public status: number, public code: ErrorCode, message: string, public fields: string[] = []) {
    super(message);
  }
}
