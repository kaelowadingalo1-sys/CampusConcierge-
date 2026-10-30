import { NotificationGateway } from "../interfaces-or-ports";

// Calls the external Notification Service. The key is the outbox id, so a
// retry after a lost reply is not delivered twice (DI-12).
export class HttpNotificationGateway implements NotificationGateway {
  constructor(private baseUrl: string) {}
  async send(message: { recipientId: number; kind: string; payload: string }, key: string): Promise<void> {
    const res = await fetch(this.baseUrl + "/notifications", {
      method: "POST",
      headers: { "content-type": "application/json", "idempotency-key": key },
      body: JSON.stringify(message),
    });
    if (!res.ok) throw new Error("notification service answered " + res.status);
  }
}

// Used when no Notification Service is configured (local demo): logs instead.
export class LogNotificationGateway implements NotificationGateway {
  async send(message: { recipientId: number; kind: string; payload: string }, key: string): Promise<void> {
    console.log("[notify]", key, message.kind, "to", message.recipientId);
  }
}
