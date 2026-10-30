import { NotificationGateway, UnitOfWork } from "../interfaces-or-ports";

// Sends committed outbox rows (PD-3). A failure leaves the row unsent for the next run.
export class NotificationDispatcher {
  constructor(private uow: UnitOfWork, private gateway: NotificationGateway) {}

  async sendDue(limit = 50): Promise<{ sent: number; failed: number }> {
    const rows = await this.uow.run(tx => tx.outbox.listUnsent(limit));
    let sent = 0, failed = 0;
    for (const m of rows) {
      try {
        await this.gateway.send({ recipientId: m.recipientId, kind: m.type, payload: m.payload }, String(m.id));
        await this.uow.run(tx => tx.outbox.markSent(m.id));
        sent++;
      } catch {
        await this.uow.run(tx => tx.outbox.markFailed(m.id));
        failed++;
      }
    }
    return { sent, failed };
  }
}
