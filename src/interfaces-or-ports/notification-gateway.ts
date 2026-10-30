// Port to the external Notification Service.
// The key makes a retry safe: the same key is never delivered twice (DI-12).
export interface NotificationGateway {
  send(message: { recipientId: number; kind: string; payload: string }, key: string): Promise<void>;
}
