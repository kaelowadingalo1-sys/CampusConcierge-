import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { Pool } from "pg";
import { Server } from "http";
import { DATABASE_URL, applySchema, build, call, goodBody, listen, resetData } from "./support";

let pool: Pool;
let ctx: ReturnType<typeof build>;
let url: string;
let server: Server;

const post = (token: string, key: string, body: unknown) =>
  call(url, "POST", "/errands", token, body, { "Idempotency-Key": key });
const count = async (sql: string, args: unknown[] = []) => Number((await pool.query(sql, args)).rows[0].n);

beforeAll(async () => {
  pool = new Pool({ connectionString: DATABASE_URL, max: 10 });
  await applySchema(pool);
  ctx = build(pool);
  ({ url, server } = await listen(ctx.app));
});
afterAll(async () => { server.close(); await pool.end(); });
beforeEach(async () => {
  await resetData(pool);
  ctx.clock.t = new Date("2026-10-01T12:00:00Z");
  ctx.gateway.down = false;
  ctx.gateway.sent.length = 0;
});

describe("Post Errand Request: normal behaviour (FR-01, FR-02, BR-D2)", () => {
  it("creates the errand, locks the price, assigns a helper and records history and an offer", async () => {
    const r = await post("requester-1", "key-0000001", goodBody());
    expect(r.status).toBe(201);
    expect(r.json).toMatchObject({ status: "AWAITING_ACCEPTANCE", backlog: false, price: 20 });
    expect(r.json.acceptanceExpiresAt).toBe("2026-10-01T12:10:00.000Z");   // 10-minute window (QS-1)

    expect(await count("SELECT count(*) n FROM errand")).toBe(1);
    expect(await count("SELECT count(*) n FROM assignment WHERE is_active AND helper_id = 1")).toBe(1);
    const events = (await pool.query("SELECT event_type FROM errand_event ORDER BY event_id")).rows.map(x => x.event_type);
    expect(events).toEqual(["errand_posted", "helper_assigned"]);                     // DI-9
    const offer = (await pool.query("SELECT recipient_id, type FROM notification_outbox")).rows;
    expect(offer).toEqual([{ recipient_id: 1, type: "offer" }]);
    expect(r.text).not.toContain("Student centre");                                    // QS-2
  });

  it("keeps the price it locked even if the category price changes later (BR-D2, DI-6)", async () => {
    const first = await post("requester-1", "key-0000001", goodBody());
    await pool.query("UPDATE errand_category SET standard_price = 30 WHERE category_id = 1");
    const stored = await pool.query("SELECT price FROM errand WHERE errand_id = $1", [first.json.errandId]);
    expect(stored.rows[0].price).toBe(20);
    const second = await post("requester-2", "key-0000002", goodBody());
    expect(second.json.price).toBe(30);
  });

  it("puts the errand in backlog and flags the administrator when no helper is free (QS-3)", async () => {
    await pool.query("UPDATE helper SET available = false");
    const r = await post("requester-1", "key-0000001", goodBody());
    expect(r.status).toBe(201);
    expect(r.json).toMatchObject({ status: "POSTED", backlog: true, acceptanceExpiresAt: null });
    const flag = (await pool.query("SELECT recipient_role, type FROM notification_outbox")).rows;
    expect(flag).toEqual([{ recipient_role: "administrator", type: "capacity_backlog" }]);
    expect(await count("SELECT count(*) n FROM assignment")).toBe(0);
  });
});

describe("Post Errand Request: invalid and disallowed input leaves no state (BR-D1, FR-13)", () => {
  it("rejects bad fields with VALIDATION_FAILED and creates nothing", async () => {
    const r = await post("requester-1", "key-0000001", goodBody({ taskDetails: "", deadline: "2020-01-01T00:00:00Z", meetingPoint: undefined }));
    expect(r.status).toBe(400);
    expect(r.json.error).toBe("VALIDATION_FAILED");
    expect(r.json.fields.sort()).toEqual(["deadline", "meetingPoint", "taskDetails"]);
    expect(await count("SELECT count(*) n FROM errand")).toBe(0);
  });

  it("rejects a missing Idempotency-Key", async () => {
    const r = await call(url, "POST", "/errands", "requester-1", goodBody());
    expect(r.status).toBe(400);
    expect(r.json.fields).toEqual(["Idempotency-Key"]);
  });

  it("rejects a non-approved category with CATEGORY_NOT_APPROVED and creates no errand", async () => {
    const r = await post("requester-1", "key-0000001", goodBody({ categoryId: 3 }));
    expect(r.status).toBe(422);
    expect(r.json.error).toBe("CATEGORY_NOT_APPROVED");
    expect(await count("SELECT count(*) n FROM errand")).toBe(0);
    expect(await count("SELECT count(*) n FROM errand_event")).toBe(0);
  });

  it("rejects an unknown category the same way", async () => {
    const r = await post("requester-1", "key-0000001", goodBody({ categoryId: 999 }));
    expect(r.json.error).toBe("CATEGORY_NOT_APPROVED");
  });

  it("refuses callers who are not identified, not confirmed, or not requesters", async () => {
    expect((await post("", "key-0000001", goodBody())).json.error).toBe("NOT_AUTHENTICATED");
    expect((await post("requester-unconfirmed", "key-0000002", goodBody())).json.error).toBe("ACCOUNT_NOT_CONFIRMED");
    expect((await post("helper-1", "key-0000003", goodBody())).json.error).toBe("FORBIDDEN");
    expect(await count("SELECT count(*) n FROM errand")).toBe(0);
  });
});

describe("Duplicate submission (DI-7)", () => {
  it("replays the original response for the same key and body", async () => {
    const a = await post("requester-1", "key-0000001", goodBody());
    const b = await post("requester-1", "key-0000001", goodBody());
    expect(b.status).toBe(200);
    expect(b.headers.get("idempotent-replay")).toBe("true");
    expect(b.json).toEqual(a.json);
    expect(await count("SELECT count(*) n FROM errand")).toBe(1);
    expect(await count("SELECT count(*) n FROM assignment")).toBe(1);
  });

  it("refuses the same key with a different body (IDEMPOTENCY_KEY_REUSED)", async () => {
    await post("requester-1", "key-0000001", goodBody());
    const r = await post("requester-1", "key-0000001", goodBody({ taskDetails: "Something else" }));
    expect(r.status).toBe(409);
    expect(r.json.error).toBe("IDEMPOTENCY_KEY_REUSED");
    expect(await count("SELECT count(*) n FROM errand")).toBe(1);
  });

  it("creates one errand when five identical requests arrive at once", async () => {
    const results = await Promise.all([1, 2, 3, 4, 5].map(() => post("requester-1", "key-concurrent", goodBody())));
    expect(new Set(results.map(r => r.json.errandId)).size).toBe(1);
    expect(await count("SELECT count(*) n FROM errand")).toBe(1);
    expect(await count("SELECT count(*) n FROM assignment")).toBe(1);
  });
});

describe("Assignment, decline and timeout (FR-03, FR-04, QS-1)", () => {
  it("offers the errand to the next helper when the first declines, and never re-offers", async () => {
    const r = await post("requester-1", "key-0000001", goodBody());
    const first = (await pool.query("SELECT assignment_id FROM assignment WHERE helper_id = 1")).rows[0].assignment_id;
    const d = await call(url, "POST", `/assignments/${first}/decline`, "helper-1");
    expect(d.status).toBe(200);
    expect(d.json.status).toBe("AWAITING_ACCEPTANCE");

    const rows = (await pool.query("SELECT helper_id, outcome, is_active FROM assignment ORDER BY assignment_id")).rows;
    expect(rows).toEqual([
      { helper_id: 1, outcome: "declined", is_active: false },
      { helper_id: 2, outcome: null, is_active: true },
    ]);
    const cancelled = await count("SELECT count(*) n FROM notification_outbox WHERE assignment_id = $1 AND cancelled", [first]);
    expect(cancelled).toBe(1);                                                        // DI-11
    expect(r.json.errandId).toBe(1);
  });

  it("expires an unanswered offer after 10 minutes and offers the next helper (QS-1)", async () => {
    await post("requester-1", "key-0000001", goodBody());
    ctx.clock.advanceMinutes(9);
    expect(await ctx.service.expireDueAssignments()).toBe(0);                          // not yet due
    ctx.clock.advanceMinutes(1);                                                        // exactly 10 minutes
    expect(await ctx.service.expireDueAssignments()).toBe(1);

    const rows = (await pool.query("SELECT helper_id, outcome, is_active FROM assignment ORDER BY assignment_id")).rows;
    expect(rows).toEqual([
      { helper_id: 1, outcome: "timed_out", is_active: false },
      { helper_id: 2, outcome: null, is_active: true },
    ]);
    const types = (await pool.query("SELECT event_type FROM errand_event ORDER BY event_id")).rows.map(x => x.event_type);
    expect(types).toEqual(["errand_posted", "helper_assigned", "assignment_timed_out", "helper_assigned"]);
  });

  it("refuses a late accept before the sweep has run (OFFER_EXPIRED) and changes nothing", async () => {
    await post("requester-1", "key-0000001", goodBody());
    const a = (await pool.query("SELECT assignment_id FROM assignment")).rows[0].assignment_id;
    ctx.clock.advanceMinutes(10);
    const r = await call(url, "POST", `/assignments/${a}/accept`, "helper-1");
    expect(r.status).toBe(409);
    expect(r.json.error).toBe("OFFER_EXPIRED");
    expect((await pool.query("SELECT status FROM errand")).rows[0].status).toBe("AWAITING_ACCEPTANCE");
  });

  it("does not let another helper answer someone else's offer", async () => {
    await post("requester-1", "key-0000001", goodBody());
    const a = (await pool.query("SELECT assignment_id FROM assignment")).rows[0].assignment_id;
    const r = await call(url, "POST", `/assignments/${a}/accept`, "helper-2");
    expect(r.status).toBe(404);
    expect(await count("SELECT count(*) n FROM assignment WHERE helper_confirmed")).toBe(0);
  });
});

describe("Backlog retry (QS-3)", () => {
  it("offers a waiting errand to a helper who becomes free, oldest errand first, and flags nothing twice", async () => {
    await pool.query("UPDATE helper SET available = (helper_id = 1)");               // only helper 1 exists
    const a = await post("requester-1", "key-0000001", goodBody());                  // gets helper 1
    const b = await post("requester-2", "key-0000002", goodBody());                  // backlog
    expect(b.json.backlog).toBe(true);
    expect(await ctx.service.retryBacklog()).toBe(0);                                // helper 1 still busy

    const first = (await pool.query("SELECT assignment_id FROM assignment WHERE errand_id = $1", [a.json.errandId])).rows[0].assignment_id;
    await call(url, "POST", `/assignments/${first}/decline`, "helper-1");            // helper 1 frees up; errand A has no one left to try
    expect(await ctx.service.retryBacklog()).toBe(1);

    const rows = (await pool.query("SELECT errand_id, helper_id, is_active FROM assignment WHERE is_active")).rows;
    expect(rows).toEqual([{ errand_id: b.json.errandId, helper_id: 1, is_active: true }]);   // B (older backlog) is served
    expect(await count("SELECT count(*) n FROM notification_outbox WHERE type = 'capacity_backlog'")).toBe(2);   // A and B once each
  });
});

describe("Confirmation gate (QS-2, FR-05, DI-8)", () => {
  it("reveals contact details only after both parties confirm", async () => {
    const r = await post("requester-1", "key-0000001", goodBody());
    const id = r.json.errandId;
    const a = (await pool.query("SELECT assignment_id FROM assignment")).rows[0].assignment_id;

    // Nothing confirmed.
    expect((await call(url, "GET", `/errands/${id}/contact`, "requester-1")).json.error).toBe("CONTACT_NOT_AVAILABLE");
    expect((await call(url, "GET", `/errands/${id}/contact`, "helper-1")).json.error).toBe("CONTACT_NOT_AVAILABLE");   // the offered helper is also held back
    // Requester cannot confirm before the helper accepts.
    expect((await call(url, "POST", `/errands/${id}/confirm`, "requester-1")).json.error).toBe("NOT_READY");

    // Helper accepts. Still hidden.
    const acc = await call(url, "POST", `/assignments/${a}/accept`, "helper-1");
    expect(acc.json.status).toBe("ACCEPTED");
    const afterHelper = await call(url, "GET", `/errands/${id}/contact`, "requester-1");
    expect(afterHelper.status).toBe(403);
    expect(afterHelper.text).not.toContain("Student centre");

    // Status endpoint never carries contact details.
    const status = await call(url, "GET", `/errands/${id}`, "requester-1");
    expect(status.text).not.toContain("Student centre");
    expect(status.text).not.toContain("7100000");

    // Requester confirms. Now visible to both, and only to them.
    expect((await call(url, "POST", `/errands/${id}/confirm`, "requester-1")).json.termsLocked).toBe(true);
    const req = await call(url, "GET", `/errands/${id}/contact`, "requester-1");
    const hlp = await call(url, "GET", `/errands/${id}/contact`, "helper-1");
    expect(req.json).toEqual({ meetingPoint: "Student centre, main entrance", requesterPhone: "72000001", helperPhone: "71000001" });
    expect(hlp.json).toEqual(req.json);
    expect((await call(url, "GET", `/errands/${id}/contact`, "requester-2")).status).toBe(404);
    expect((await call(url, "GET", `/errands/${id}/contact`, "helper-2")).status).toBe(404);
    expect((await call(url, "GET", `/errands/${id}/contact`)).status).toBe(401);
  });
});

describe("Notification Service outage (failure behaviour, DI-11, DI-12)", () => {
  it("still posts and assigns; keeps the offer unsent; cancels a stale offer when the assignment expires", async () => {
    ctx.gateway.down = true;
    const r = await post("requester-1", "key-0000001", goodBody());
    expect(r.status).toBe(201);                                                         // outage does not fail the request
    expect(r.json.status).toBe("AWAITING_ACCEPTANCE");

    const first = await ctx.dispatcher.sendDue();
    expect(first).toEqual({ sent: 0, failed: 1 });
    const row = (await pool.query("SELECT attempts, sent_at, cancelled FROM notification_outbox")).rows[0];
    expect(row).toMatchObject({ attempts: 1, sent_at: null, cancelled: false });

    // Service still down when the assignment expires: reassign and cancel the stale offer.
    ctx.clock.advanceMinutes(10);
    expect(await ctx.service.expireDueAssignments()).toBe(1);
    const rows = (await pool.query("SELECT recipient_id, cancelled FROM notification_outbox ORDER BY outbox_id")).rows;
    expect(rows).toEqual([{ recipient_id: 1, cancelled: true }, { recipient_id: 2, cancelled: false }]);

    // Service recovers: only the live offer is sent, keyed by its outbox id.
    ctx.gateway.down = false;
    expect(await ctx.dispatcher.sendDue()).toEqual({ sent: 1, failed: 0 });
    expect(ctx.gateway.sent).toEqual([{ recipientId: 2, kind: "offer", key: "2" }]);
    expect(await ctx.dispatcher.sendDue()).toEqual({ sent: 0, failed: 0 });             // nothing is sent twice
  });

  it("answers 503 SERVICE_UNAVAILABLE and stores nothing when the database cannot be reached", async () => {
    const dead = new Pool({ connectionString: "postgres://postgres@127.0.0.1:1/none", connectionTimeoutMillis: 500 });
    const broken = build(dead);
    const l = await listen(broken.app);
    const r = await call(l.url, "POST", "/errands", "requester-1", goodBody(), { "Idempotency-Key": "key-0000001" });
    expect(r.status).toBe(503);
    expect(r.json.error).toBe("SERVICE_UNAVAILABLE");
    l.server.close();
    await dead.end().catch(() => undefined);
    expect(await count("SELECT count(*) n FROM errand")).toBe(0);
  });
});

describe("Concurrency and database rules (DI-1, DI-3, DI-10, QS-5)", () => {
  it("50 simultaneous postings against 20 helpers give exactly 20 assignments, none doubled, 30 in backlog", async () => {
    await pool.query("DELETE FROM helper");
    for (let i = 1; i <= 20; i++) {
      await pool.query("INSERT INTO helper (student_number, name, contact_phone, available, vetted_by) VALUES ($1,'H','7',true,1)", ["HX" + i]);
    }
    const results = await Promise.all(Array.from({ length: 50 }, (_, i) =>
      ctx.service.postErrand({ userId: 1 + (i % 2), role: "requester", accountUsable: true }, "load-key-" + String(i).padStart(3, "0"), goodBody())));
    expect(results.every(r => r.httpStatus === 201)).toBe(true);

    expect(await count("SELECT count(*) n FROM errand")).toBe(50);
    expect(await count("SELECT count(*) n FROM assignment WHERE is_active")).toBe(20);
    const doubled = await count("SELECT count(*) n FROM (SELECT helper_id FROM assignment WHERE is_active GROUP BY helper_id HAVING count(*) > 1) x");
    expect(doubled).toBe(0);
    expect(await count("SELECT count(*) n FROM errand WHERE backlog AND status = 'POSTED'")).toBe(30);
    expect(await count("SELECT count(*) n FROM errand WHERE status = 'AWAITING_ACCEPTANCE'")).toBe(20);
  });

  it("the database refuses to change a recorded outcome, edit history, or double-assign", async () => {
    await post("requester-1", "key-0000001", goodBody());
    await pool.query("UPDATE assignment SET outcome = 'accepted'");
    await expect(pool.query("UPDATE assignment SET outcome = 'declined'")).rejects.toThrow(/already recorded/);   // DI-3
    await expect(pool.query("UPDATE errand_event SET event_type = 'x'")).rejects.toThrow(/append-only/);          // DI-10
    await expect(pool.query("DELETE FROM errand_event")).rejects.toThrow(/append-only/);
    await expect(pool.query(
      "INSERT INTO assignment (errand_id, helper_id, assigned_at, expires_at) VALUES (1, 2, now(), now())")).rejects.toThrow();   // DI-2
  });
});
