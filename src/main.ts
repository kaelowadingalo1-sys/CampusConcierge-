import { Pool } from "pg";
import { ErrandWorkflowService } from "./core/errand-workflow-service";
import { NotificationDispatcher } from "./core/notification-dispatcher";
import { PgWorkflowStore } from "./adapters/pg-workflow-store";
import { PgAdministration } from "./adapters/pg-administration";
import { MockIdentityAdapter } from "./adapters/mock-identity";
import { SystemClock } from "./adapters/system-clock";
import { HttpNotificationGateway, LogNotificationGateway } from "./adapters/http-notification-gateway";
import { createApp } from "./web/app";

// Composition: the only place that names concrete adapters (no DI container, ADR-002).
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const store = new PgWorkflowStore(pool);
const admin = new PgAdministration(pool);
const clock = new SystemClock();
const gateway = process.env.NOTIFICATION_URL
  ? new HttpNotificationGateway(process.env.NOTIFICATION_URL)
  : new LogNotificationGateway();

const service = new ErrandWorkflowService(store, admin, admin, clock);
const dispatcher = new NotificationDispatcher(store, gateway);
const app = createApp(service, new MockIdentityAdapter());

const port = Number(process.env.PORT ?? 3000);
app.listen(port, () => console.log("Campus Concierge listening on " + port));

// Expiry sweep at start-up and every 30 seconds (QS-1: next offer within 1 minute of expiry).
const tick = () => {
  service.expireDueAssignments()
    .then(() => service.retryBacklog())
    .catch(e => console.error("expiry or backlog sweep failed", e));
  dispatcher.sendDue().catch(e => console.error("dispatch failed", e));
};
tick();
setInterval(tick, 30_000);
