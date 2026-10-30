import fs from "fs";
import path from "path";
import { Pool } from "pg";
import { AddressInfo } from "net";
import { Server } from "http";
import { Clock, NotificationGateway } from "../src/interfaces-or-ports";
import { PgWorkflowStore } from "../src/adapters/pg-workflow-store";
import { PgAdministration } from "../src/adapters/pg-administration";
import { MockIdentityAdapter } from "../src/adapters/mock-identity";
import { ErrandWorkflowService } from "../src/core/errand-workflow-service";
import { NotificationDispatcher } from "../src/core/notification-dispatcher";
import { createApp } from "../src/web/app";

export const DATABASE_URL = process.env.DATABASE_URL ?? "postgres://postgres@localhost:5432/concierge_test";
const SCHEMA_DIR = path.join(__dirname, "..", "migrations-or-schema");

export class FakeClock implements Clock {
  constructor(public t = new Date("2026-10-01T12:00:00Z")) {}
  now() { return new Date(this.t.getTime()); }
  advanceMinutes(m: number) { this.t = new Date(this.t.getTime() + m * 60_000); }
}

export class FakeGateway implements NotificationGateway {
  down = false;
  sent: { recipientId: number; kind: string; key: string }[] = [];
  async send(m: { recipientId: number; kind: string; payload: string }, key: string) {
    if (this.down) throw new Error("Notification Service unavailable");
    this.sent.push({ recipientId: m.recipientId, kind: m.kind, key });
  }
}

export async function applySchema(pool: Pool) {
  await pool.query("DROP SCHEMA public CASCADE; CREATE SCHEMA public;");
  await pool.query(fs.readFileSync(path.join(SCHEMA_DIR, "001_init.sql"), "utf8"));
}

export async function resetData(pool: Pool) {
  await pool.query(`TRUNCATE notification_outbox, errand_event, errand_contact, dispute, assignment, errand,
                    helper, requester, administrator, errand_category RESTART IDENTITY CASCADE`);
  await pool.query(fs.readFileSync(path.join(SCHEMA_DIR, "002_sample_data.sql"), "utf8"));
}

export function build(pool: Pool) {
  const clock = new FakeClock();
  const gateway = new FakeGateway();
  const store = new PgWorkflowStore(pool);
  const admin = new PgAdministration(pool);
  const service = new ErrandWorkflowService(store, admin, admin, clock);
  const dispatcher = new NotificationDispatcher(store, gateway);
  const app = createApp(service, new MockIdentityAdapter());
  return { clock, gateway, service, dispatcher, app };
}

export async function listen(app: ReturnType<typeof createApp>): Promise<{ url: string; server: Server }> {
  return new Promise(resolve => {
    const server = app.listen(0, () => resolve({ url: "http://127.0.0.1:" + (server.address() as AddressInfo).port, server }));
  });
}

export async function call(url: string, method: string, p: string, token?: string, body?: unknown, headers: Record<string, string> = {}) {
  const res = await fetch(url + p, {
    method,
    headers: { "content-type": "application/json", ...(token ? { authorization: "Bearer " + token } : {}), ...headers },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  return { status: res.status, text, json: text ? JSON.parse(text) : null, headers: res.headers };
}

export const goodBody = (over: Record<string, unknown> = {}) => ({
  categoryId: 1,
  taskDetails: "Collect parcel from courier point, name on the label is T. Moeng",
  deadline: "2026-10-02T17:00:00+02:00",
  meetingPoint: "Student centre, main entrance",
  ...over,
});
